-- A dedicated Supabase project. All functions below have explicit grants.
create extension if not exists pgcrypto;

create table public.meeting_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  recordings integer not null default 0,
  primary key(user_id,day)
);
alter table public.meeting_daily_usage enable row level security;
revoke all on public.meeting_daily_usage from anon, authenticated;
grant all on public.meeting_daily_usage to service_role;

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  client_request_id uuid not null,
  title text not null check (char_length(title) between 1 and 160),
  status text not null default 'draft' check (status in ('draft','queued','preparing','transcribing','summarizing','ready','failed','deleting')),
  audio_path text not null,
  audio_mime_type text not null,
  audio_bytes bigint check (audio_bytes between 1 and 52428800),
  duration_seconds double precision check (duration_seconds between 0 and 3610),
  interrupted boolean not null default false,
  transcript_markdown text,
  summary_markdown text,
  transcription_model text,
  summary_model text,
  prompt_version text,
  segment_count integer,
  retry_count integer not null default 0,
  failure_stage text,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  deleted_at timestamptz,
  unique (user_id, client_request_id)
);
create index meetings_history on public.meetings (user_id, created_at desc, id desc) where deleted_at is null;
create table public.meeting_segments (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  segment_index integer not null,
  audio_path text not null,
  start_seconds double precision not null,
  end_seconds double precision not null,
  status text not null default 'pending' check (status in ('pending','ready')),
  transcript_text text,
  model text,
  usage jsonb,
  unique (meeting_id, segment_index)
);
create table public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  stage text not null check (stage in ('prepare','transcribe','summarize','delete','cleanup')),
  segment_index integer not null default -1,
  status text not null default 'queued' check (status in ('queued','running','done','failed')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  lease_token uuid,
  lease_expires_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  unique (meeting_id, stage, segment_index)
);
create index jobs_ready on public.processing_jobs (available_at, created_at) where status in ('queued','running');
create table public.meeting_summary_streams (
  meeting_id uuid primary key references public.meetings(id) on delete cascade,
  generation_id uuid not null,
  revision bigint not null default 0,
  draft_markdown text not null default '',
  status text not null default 'streaming' check (status in ('streaming','complete','failed')),
  updated_at timestamptz not null default now()
);
alter table public.meetings enable row level security;
alter table public.meeting_segments enable row level security;
alter table public.processing_jobs enable row level security;
alter table public.meeting_summary_streams enable row level security;
revoke all on public.meetings, public.meeting_segments, public.processing_jobs, public.meeting_summary_streams from anon, authenticated;
grant select on public.meetings, public.meeting_segments, public.meeting_summary_streams to authenticated;
grant all on public.meetings, public.meeting_segments, public.processing_jobs, public.meeting_summary_streams to service_role;
create policy meeting_owner_read on public.meetings for select to authenticated using (user_id = (select auth.uid()) and deleted_at is null);
create policy segment_owner_read on public.meeting_segments for select to authenticated using (exists (select 1 from public.meetings m where m.id = meeting_id and m.user_id = (select auth.uid()) and m.deleted_at is null));
create policy summary_owner_read on public.meeting_summary_streams for select to authenticated using (exists (select 1 from public.meetings m where m.id = meeting_id and m.user_id = (select auth.uid()) and m.deleted_at is null));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('meeting-audio','meeting-audio',false,52428800,array['audio/webm','video/webm','audio/mp4','audio/ogg','audio/mpeg'])
on conflict (id) do nothing;
create policy recording_upload on storage.objects for insert to authenticated with check (
  bucket_id = 'meeting-audio' and exists (
    select 1 from public.meetings m where m.user_id = (select auth.uid()) and m.audio_path = name and m.status = 'draft' and m.deleted_at is null
  )
);
create policy recording_read on storage.objects for select to authenticated using (
  bucket_id = 'meeting-audio' and exists (
    select 1 from public.meetings m where m.user_id = (select auth.uid()) and m.audio_path = name and m.deleted_at is null
  )
);
-- No user update/delete policy: finalized originals cannot be replaced.

create function public.create_meeting(p_request_id uuid, p_title text, p_mime text, p_extension text)
returns public.meetings language plpgsql security definer set search_path = '' as $$
declare m public.meetings; uid uuid := auth.uid(); mid uuid := gen_random_uuid();
begin
  if uid is null then raise exception 'NOT_FOUND'; end if;
  perform pg_advisory_xact_lock(hashtext(uid::text));
  select * into m from public.meetings where user_id=uid and client_request_id=p_request_id;
  if found then
    if m.deleted_at is not null then raise exception 'INVALID_STATE'; end if;
    return m;
  end if;
  if coalesce((select recordings from public.meeting_daily_usage where user_id=uid and day=(now() at time zone 'UTC')::date),0) >= 30
    or (select coalesce(sum(audio_bytes),0) from public.meetings where user_id=uid and deleted_at is null) >= 1073741824 then raise exception 'QUOTA_EXCEEDED'; end if;
  if p_extension not in ('webm','m4a','ogg') or p_mime not in ('audio/webm','video/webm','audio/mp4','audio/ogg') then raise exception 'INVALID_STATE'; end if;
  insert into public.meeting_daily_usage(user_id,day,recordings) values(uid,(now() at time zone 'UTC')::date,1)
    on conflict(user_id,day) do update set recordings=public.meeting_daily_usage.recordings+1;
  insert into public.meetings(id,user_id,client_request_id,title,audio_path,audio_mime_type)
  values(mid,uid,p_request_id,p_title,uid::text||'/'||mid::text||'/original.'||p_extension,p_mime) returning * into m;
  return m;
end $$;

create function public.finalize_meeting(p_id uuid, p_interrupted boolean default false)
returns public.meetings language plpgsql security definer set search_path = '' as $$
declare m public.meetings; size bigint;
begin
  perform pg_advisory_xact_lock(839291);
  select * into m from public.meetings where id=p_id and user_id=auth.uid() and deleted_at is null for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if m.status <> 'draft' then return m; end if;
  select (metadata->>'size')::bigint into size from storage.objects where bucket_id='meeting-audio' and name=m.audio_path;
  if size is null or size < 1 or size > 52428800 then raise exception 'INVALID_STATE'; end if;
  if (select coalesce(sum(audio_bytes),0) from public.meetings where user_id=auth.uid() and deleted_at is null)+size > 1073741824 then raise exception 'QUOTA_EXCEEDED'; end if;
  update public.meetings set status='queued', audio_bytes=size, interrupted=p_interrupted, updated_at=now() where id=p_id returning * into m;
  insert into public.processing_jobs(meeting_id,stage) values(p_id,'prepare') on conflict do nothing;
  return m;
end $$;
create function public.rename_meeting(p_id uuid, p_title text) returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.meetings set title=p_title,updated_at=now() where id=p_id and user_id=auth.uid() and deleted_at is null;
  if not found then raise exception 'NOT_FOUND'; end if;
end $$;
create function public.retry_meeting(p_id uuid) returns void language plpgsql security definer set search_path = '' as $$
declare m public.meetings;
begin
  perform pg_advisory_xact_lock(839291);
  select * into m from public.meetings where id=p_id and user_id=auth.uid() and deleted_at is null for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if m.status <> 'failed' then raise exception 'INVALID_STATE'; end if;
  if m.retry_count >= 3 then raise exception 'RETRY_LIMIT'; end if;
  update public.processing_jobs set status='queued',attempts=0,available_at=now(),lease_token=null,lease_expires_at=null,last_error=null where meeting_id=p_id and status='failed' and stage not in ('delete','cleanup');
  update public.meetings set status='queued',retry_count=retry_count+1,error_code=null,error_message=null,failure_stage=null,updated_at=now() where id=p_id;
end $$;
create function public.delete_meeting(p_id uuid) returns void language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(839291);
  update public.meetings set status='deleting',deleted_at=coalesce(deleted_at,now()),updated_at=now() where id=p_id and user_id=auth.uid();
  if not found then raise exception 'NOT_FOUND'; end if;
  insert into public.processing_jobs(meeting_id,stage,available_at) values(p_id,'delete',now()+interval '370 seconds') on conflict do nothing;
end $$;

-- Worker RPCs are service-role only. A lease token fences every worker mutation.
create function public.claim_processing_job() returns setof public.processing_jobs language plpgsql security definer set search_path = '' as $$
declare j public.processing_jobs;
begin
  perform pg_advisory_xact_lock(839291);
  -- Recover crashed workers, with a bounded number of attempts.
  update public.processing_jobs set status=case when attempts>=3 then 'failed' else 'queued' end,available_at=now(),last_error='Processing was interrupted. Please try again.',lease_token=null,lease_expires_at=null
    where status='running' and lease_expires_at < now();
  update public.meetings m set status='failed',failure_stage=failed_job.stage,error_code='PROCESSING_FAILED',error_message=failed_job.last_error,updated_at=now()
    from public.processing_jobs failed_job where failed_job.meeting_id=m.id and failed_job.status='failed' and failed_job.stage not in ('delete','cleanup') and m.deleted_at is null and m.status not in ('ready','failed');
  update public.meeting_summary_streams s set status='failed',revision=s.revision+1,updated_at=now() from public.meetings m where m.id=s.meeting_id and m.status='failed' and s.status='streaming';
  if (select count(*) from public.processing_jobs where status='running') >= 3 then return; end if;
  select q.* into j from public.processing_jobs q join public.meetings m on m.id=q.meeting_id
    where q.status='queued' and q.available_at<=now() and ((m.deleted_at is null and m.status<>'failed' and q.stage<>'delete') or (q.stage='delete' and m.deleted_at is not null))
    order by q.available_at,q.created_at for update of q skip locked limit 1;
  if not found then return; end if;
  update public.processing_jobs set status='running',attempts=attempts+1,lease_token=gen_random_uuid(),lease_expires_at=now()+interval '360 seconds' where id=j.id returning * into j;
  if j.stage not in ('delete','cleanup') then
    update public.meetings set status=case j.stage when 'prepare' then 'preparing' when 'transcribe' then 'transcribing' else 'summarizing' end,updated_at=now() where id=j.meeting_id;
  end if;
  if j.stage='summarize' then
    insert into public.meeting_summary_streams(meeting_id,generation_id) values(j.meeting_id,j.lease_token)
      on conflict(meeting_id) do update set generation_id=excluded.generation_id,revision=0,draft_markdown='',status='streaming',updated_at=now();
  end if;
  return next j;
end $$;
create function public.job_is_current(p_id uuid,p_token uuid) returns boolean language sql security definer set search_path = '' as $$
  select exists(select 1 from public.processing_jobs j join public.meetings m on m.id=j.meeting_id where j.id=p_id and j.lease_token=p_token and j.status='running' and j.lease_expires_at>now() and (m.deleted_at is null or j.stage='delete'));
$$;
create function public.publish_summary(p_id uuid,p_token uuid,p_text text,p_revision bigint) returns boolean language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(839291);
  if not public.job_is_current(p_id,p_token) then return false; end if;
  update public.meeting_summary_streams set draft_markdown=p_text,revision=p_revision,updated_at=now() where generation_id=p_token and revision<p_revision;
  return found;
end $$;
create function public.save_transcript(p_id uuid,p_token uuid,p_text text) returns boolean language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(839291);
  if not public.job_is_current(p_id,p_token) then return false; end if;
  update public.meetings m set transcript_markdown=p_text,updated_at=now() from public.processing_jobs j where j.id=p_id and j.meeting_id=m.id and j.stage='summarize';
  return found;
end $$;
create function public.finish_processing_job(p_id uuid,p_token uuid,p_result jsonb default '{}'::jsonb) returns boolean language plpgsql security definer set search_path = '' as $$
declare j public.processing_jobs; s jsonb;
begin
  perform pg_advisory_xact_lock(839291);
  if not public.job_is_current(p_id,p_token) then return false; end if;
  select * into j from public.processing_jobs where id=p_id;
  if j.stage='prepare' then
    for s in select * from jsonb_array_elements(p_result->'segments') loop
      insert into public.meeting_segments(meeting_id,segment_index,audio_path,start_seconds,end_seconds)
      values(j.meeting_id,(s->>'index')::int,s->>'path',(s->>'start')::double precision,(s->>'end')::double precision) on conflict do nothing;
      insert into public.processing_jobs(meeting_id,stage,segment_index) values(j.meeting_id,'transcribe',(s->>'index')::int) on conflict do nothing;
    end loop;
    update public.meetings set duration_seconds=(p_result->>'duration')::double precision,segment_count=jsonb_array_length(p_result->'segments'),status='transcribing',updated_at=now() where id=j.meeting_id;
  elsif j.stage='transcribe' then
    update public.meeting_segments set status='ready',transcript_text=p_result->>'text',model=p_result->>'model',usage=p_result->'usage' where meeting_id=j.meeting_id and segment_index=j.segment_index;
    if not exists(select 1 from public.meeting_segments where meeting_id=j.meeting_id and status<>'ready') then
      insert into public.processing_jobs(meeting_id,stage) values(j.meeting_id,'summarize') on conflict do nothing;
    end if;
  elsif j.stage='summarize' then
    update public.meetings set summary_markdown=p_result->>'text',summary_model=p_result->>'model',transcription_model=p_result->>'transcription_model',prompt_version='meeting-v1',status='ready',error_message=null,error_code=null,failure_stage=null,completed_at=now(),updated_at=now() where id=j.meeting_id;
    update public.meeting_summary_streams set draft_markdown='',status='complete',revision=revision+1,updated_at=now() where meeting_id=j.meeting_id and generation_id=p_token;
    insert into public.processing_jobs(meeting_id,stage) values(j.meeting_id,'cleanup') on conflict do nothing;
  elsif j.stage='delete' then
    delete from public.meetings where id=j.meeting_id;
    return true;
  end if;
  update public.processing_jobs set status='done',finished_at=now(),lease_token=null,lease_expires_at=null where id=p_id;
  return true;
end $$;
create function public.fail_processing_job(p_id uuid,p_token uuid,p_message text,p_retryable boolean) returns void language plpgsql security definer set search_path = '' as $$
declare j public.processing_jobs; retry boolean;
begin
  perform pg_advisory_xact_lock(839291);
  if not public.job_is_current(p_id,p_token) then return; end if;
  select * into j from public.processing_jobs where id=p_id;
  retry := p_retryable and (j.attempts<3 or j.stage in ('delete','cleanup'));
  update public.processing_jobs set status=case when retry then 'queued' else 'failed' end,available_at=now()+make_interval(secs=>least(900,20*power(2,least(j.attempts,5))::int)),last_error=left(p_message,240),lease_token=null,lease_expires_at=null where id=p_id;
  if not retry and j.stage not in ('delete','cleanup') then
    update public.meetings set status='failed',failure_stage=j.stage,error_code='PROCESSING_FAILED',error_message=left(p_message,240),updated_at=now() where id=j.meeting_id and deleted_at is null;
  end if;
  if j.stage='summarize' then update public.meeting_summary_streams set status='failed',revision=revision+1,updated_at=now() where generation_id=p_token; end if;
end $$;
create function public.cleanup_abandoned_meetings() returns void language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(839291);
  with abandoned as (
    update public.meetings set status='deleting',deleted_at=now(),updated_at=now() where status='draft' and deleted_at is null and created_at<now()-interval '24 hours' returning id
  ) insert into public.processing_jobs(meeting_id,stage,available_at) select id,'delete',now()+interval '370 seconds' from abandoned on conflict do nothing;
  delete from public.meeting_daily_usage where day<(now() at time zone 'UTC')::date-7;
  -- Cleanup has no user retry button: keep retrying after outages/crashes.
  update public.processing_jobs set status='queued',attempts=0,available_at=now() where stage in ('delete','cleanup') and status='failed';
end $$;

revoke execute on function public.create_meeting(uuid,text,text,text), public.finalize_meeting(uuid,boolean), public.rename_meeting(uuid,text), public.retry_meeting(uuid), public.delete_meeting(uuid) from public, anon;
grant execute on function public.create_meeting(uuid,text,text,text), public.finalize_meeting(uuid,boolean), public.rename_meeting(uuid,text), public.retry_meeting(uuid), public.delete_meeting(uuid) to authenticated;
revoke execute on function public.claim_processing_job(), public.job_is_current(uuid,uuid), public.publish_summary(uuid,uuid,text,bigint), public.save_transcript(uuid,uuid,text), public.finish_processing_job(uuid,uuid,jsonb), public.fail_processing_job(uuid,uuid,text,boolean), public.cleanup_abandoned_meetings() from public, anon, authenticated;
grant execute on function public.claim_processing_job(), public.job_is_current(uuid,uuid), public.publish_summary(uuid,uuid,text,bigint), public.save_transcript(uuid,uuid,text), public.finish_processing_job(uuid,uuid,jsonb), public.fail_processing_job(uuid,uuid,text,boolean), public.cleanup_abandoned_meetings() to service_role;

do $$ begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') then
    alter publication supabase_realtime add table public.meeting_summary_streams;
  end if;
end $$;
