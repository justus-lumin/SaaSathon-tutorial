\set ON_ERROR_STOP on
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
grant usage on schema auth to authenticated, service_role;
grant execute on function auth.uid() to authenticated, service_role;
create schema storage;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text,metadata jsonb,unique(bucket_id,name));
alter table storage.objects enable row level security;
grant usage on schema storage to authenticated,service_role;
grant all on storage.objects to authenticated,service_role;
\i /tmp/migration.sql
create function public.assert_true(ok boolean, label text) returns void language plpgsql as $$ begin if ok is distinct from true then raise exception 'Assertion failed: %',label; end if; end $$;
insert into auth.users values('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
set role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
select id as mid,audio_path from create_meeting('33333333-3333-4333-8333-333333333333','Test meeting','audio/webm','webm') \gset
select assert_true((select id from create_meeting('33333333-3333-4333-8333-333333333333','Duplicate','audio/webm','webm'))=:'mid','idempotent create');
select assert_true(not has_table_privilege('authenticated','public.meetings','UPDATE'),'client cannot forge summary or status');
select assert_true(not has_function_privilege('authenticated','public.claim_processing_job()','EXECUTE'),'worker RPC denied');
insert into storage.objects(bucket_id,name,metadata) values('meeting-audio',:'audio_path','{"size":1234}');
select finalize_meeting(:'mid');
select finalize_meeting(:'mid');
reset role;
select assert_true((select count(*) from processing_jobs)=1,'idempotent finalize');
set role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
select assert_true((select count(*) from meetings)=0,'other owner cannot read meeting');
select assert_true((select count(*) from storage.objects)=0,'other owner cannot read recording');
do $$ begin
  begin perform public.rename_meeting((select id from public.meetings limit 1),'forged'); raise exception 'ownership bypass'; exception when others then if sqlerrm <> 'NOT_FOUND' then raise; end if; end;
  begin insert into storage.objects(bucket_id,name,metadata) values('meeting-audio','forged','{}'); raise exception 'storage bypass'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set role service_role;
select id as jid,lease_token as token from claim_processing_job() \gset
select assert_true(not finish_processing_job(:'jid',gen_random_uuid(),'{}'),'stale token rejected');
select assert_true(finish_processing_job(:'jid',:'token','{"duration":3,"segments":[{"index":0,"path":"test/segments/0.mp3","start":0,"end":3}]}'),'prepare completed');
select id as jid,lease_token as token from claim_processing_job() \gset
select assert_true(finish_processing_job(:'jid',:'token','{"text":"We agreed to ship tomorrow.","model":"test-stt"}'),'transcription completed');
select id as jid,lease_token as token from claim_processing_job() \gset
select assert_true(save_transcript(:'jid',:'token','We agreed to ship tomorrow.'),'transcript persisted');
select assert_true(publish_summary(:'jid',:'token','## Draft',2),'summary snapshot published');
select assert_true(not publish_summary(:'jid',:'token','old snapshot',1),'old revision rejected');
select fail_processing_job(:'jid',:'token','test transient outage',true);
update processing_jobs set available_at=now() where id=:'jid';
select id as jid,lease_token as token2 from claim_processing_job() \gset
select assert_true(:'token'<>:'token2','retry gets new generation');
select assert_true(not publish_summary(:'jid',:'token','stale worker',3),'old generation rejected');
select assert_true((select revision=0 and draft_markdown='' from meeting_summary_streams where meeting_id=:'mid'),'new generation clears draft');
select assert_true(finish_processing_job(:'jid',:'token2','{"text":"## Decisions\nShip tomorrow.","model":"z-ai/glm-5.3-flash","transcription_model":"test-stt"}'),'summary completed');
select assert_true((select status='ready' and transcript_markdown is not null and summary_markdown is not null from meetings where id=:'mid'),'canonical documents complete');
select id as jid,lease_token as token from claim_processing_job() \gset
select finish_processing_job(:'jid',:'token');
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
select delete_meeting(:'mid');
select assert_true((select count(*) from meetings)=0,'tombstone immediately hides meeting');
select assert_true((select count(*) from storage.objects)=0,'tombstone denies audio access');
reset role;
set role service_role;
select assert_true((select count(*) from claim_processing_job())=0,'delete waits for old workers');
update processing_jobs set available_at=now() where stage='delete';
select id as jid,lease_token as token from claim_processing_job() \gset
select finish_processing_job(:'jid',:'token');
select assert_true((select count(*) from meetings)=0 and (select count(*) from processing_jobs)=0,'delete cascades documents and jobs');
reset role;
\echo 'Database security and pipeline checks passed.'
