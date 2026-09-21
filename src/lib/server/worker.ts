import "server-only";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { adminSupabase, processingConfigured } from "@/lib/supabase/admin";
import { BUCKET } from "@/features/meetings/types";
import { extractSegment, prepareAudio } from "./media";
import {
  joinTranscripts,
  safeProcessingError,
  SUMMARY_MODEL,
} from "./processing";
import { summaryStream, transcribe } from "./inference";
type Job = {
  id: string;
  meeting_id: string;
  stage: "prepare" | "transcribe" | "summarize" | "delete" | "cleanup";
  segment_index: number;
  lease_token: string;
};
type Admin = ReturnType<typeof adminSupabase>;
async function rpc(db: Admin, name: string, args?: Record<string, unknown>) {
  const { data, error } = await db.rpc(name, args);
  if (error) throw new Error(`Worker DB operation failed: ${name}`);
  return data;
}
async function current(db: Admin, job: Job) {
  if (
    !(await rpc(db, "job_is_current", {
      p_id: job.id,
      p_token: job.lease_token,
    }))
  )
    throw Object.assign(new Error("Lease ended"), { code: "STALE_LEASE" });
}
async function download(db: Admin, key: string) {
  const { data, error } = await db.storage.from(BUCKET).download(key);
  if (error || !data) throw new Error("Recording download failed.");
  return data;
}
async function removeFolder(db: Admin, folder: string) {
  const { data, error } = await db.storage
    .from(BUCKET)
    .list(folder, { limit: 100 });
  if (error) throw new Error("Storage listing failed.");
  const paths = (data || [])
    .filter((item) => item.id)
    .map((item) => `${folder}/${item.name}`);
  if (paths.length) {
    const result = await db.storage.from(BUCKET).remove(paths);
    if (result.error) throw new Error("Storage cleanup failed.");
  }
}
async function runJob(db: Admin, job: Job, signal: AbortSignal) {
  const { data: meeting, error } = await db
    .from("meetings")
    .select("*")
    .eq("id", job.meeting_id)
    .single();
  if (error || !meeting) throw new Error("Meeting is unavailable.");
  await current(db, job);
  const prefix = `${meeting.user_id}/${meeting.id}`;
  if (job.stage === "prepare") {
    const dir = await mkdtemp(path.join(tmpdir(), "meeting-"));
    try {
      const source = path.join(
        dir,
        `original.${meeting.audio_path.split(".").at(-1)}`,
      );
      const blob = await download(db, meeting.audio_path);
      await writeFile(source, Buffer.from(await blob.arrayBuffer()));
      const {
        duration,
        segments,
        source: normalized,
      } = await prepareAudio(source, signal);
      const manifest = [];
      for (const segment of segments) {
        await current(db, job);
        const bytes = await extractSegment(
          normalized,
          segment.start,
          segment.end,
          segment.index,
          signal,
        );
        const key = `${prefix}/segments/${segment.index}.mp3`;
        const { error: uploadError } = await db.storage
          .from(BUCKET)
          .upload(key, bytes, { contentType: "audio/mpeg", upsert: true });
        if (uploadError) throw new Error("Could not save audio segment.");
        manifest.push({ ...segment, path: key });
      }
      await rpc(db, "finish_processing_job", {
        p_id: job.id,
        p_token: job.lease_token,
        p_result: { duration, segments: manifest },
      });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  } else if (job.stage === "transcribe") {
    const { data: segment, error: segmentError } = await db
      .from("meeting_segments")
      .select("*")
      .eq("meeting_id", job.meeting_id)
      .eq("segment_index", job.segment_index)
      .single();
    if (segmentError || !segment) throw new Error("Missing audio segment.");
    const result = await transcribe(
      await download(db, segment.audio_path),
      signal,
    );
    await rpc(db, "finish_processing_job", {
      p_id: job.id,
      p_token: job.lease_token,
      p_result: result,
    });
  } else if (job.stage === "summarize") {
    const { data: segments, error: segmentError } = await db
      .from("meeting_segments")
      .select("transcript_text,model")
      .eq("meeting_id", job.meeting_id)
      .order("segment_index");
    if (segmentError || !segments?.length)
      throw new Error("Missing transcript.");
    const transcript = joinTranscripts(
      segments.map((s) => s.transcript_text || ""),
    );
    if (!transcript)
      throw Object.assign(new Error("No speech"), { code: "NO_SPEECH" });
    if (
      !(await rpc(db, "save_transcript", {
        p_id: job.id,
        p_token: job.lease_token,
        p_text: transcript,
      }))
    )
      return;
    if (transcript.length > 300000)
      throw new Error("Transcript exceeds the summary context budget.");
    let text = "";
    let revision = 0;
    let lastFlush = 0;
    const stream = summaryStream(transcript, signal);
    for await (const delta of stream.textStream) {
      text += delta;
      if (text.length > 100000)
        throw new Error("Summary exceeded its length limit.");
      if (Date.now() - lastFlush >= 250) {
        if (
          !(await rpc(db, "publish_summary", {
            p_id: job.id,
            p_token: job.lease_token,
            p_text: text,
            p_revision: ++revision,
          }))
        )
          throw new Error("Summary lease ended.");
        lastFlush = Date.now();
      }
    }
    const finish = await stream.finishReason;
    if (!text.trim() || finish !== "stop")
      throw new Error("Summary was incomplete.");
    await rpc(db, "finish_processing_job", {
      p_id: job.id,
      p_token: job.lease_token,
      p_result: {
        text: text.trim(),
        model: process.env.OPENROUTER_SUMMARY_MODEL || SUMMARY_MODEL,
        transcription_model: segments[0].model,
      },
    });
  } else {
    // Delete jobs wait longer than any in-flight lease before removing objects.
    await removeFolder(db, `${prefix}/segments`);
    if (job.stage === "delete") await removeFolder(db, prefix);
    await rpc(db, "finish_processing_job", {
      p_id: job.id,
      p_token: job.lease_token,
    });
  }
}
export async function processJobs() {
  if (!processingConfigured()) return { processed: 0, configured: false };
  const deadline = Date.now() + 235000;
  const db = adminSupabase(AbortSignal.timeout(245000));
  await rpc(db, "cleanup_abandoned_meetings");
  let processed = 0;
  async function lane() {
    // Claim one bounded step per lane, then immediately drain available work.
    while (Date.now() < deadline - 45000) {
      const jobs = (await rpc(db, "claim_processing_job")) as Job[];
      const job = jobs?.[0];
      if (!job) return;
      const started = Date.now();
      try {
        await runJob(
          db,
          job,
          AbortSignal.timeout(Math.max(1000, deadline - Date.now())),
        );
        processed++;
        console.info("meeting_job", {
          id: job.id,
          stage: job.stage,
          durationMs: Date.now() - started,
          outcome: "finished",
        });
      } catch (error) {
        const safe = safeProcessingError(error);
        await rpc(db, "fail_processing_job", {
          p_id: job.id,
          p_token: job.lease_token,
          p_message: safe.message,
          p_retryable: safe.retryable,
        });
        console.warn("meeting_job", {
          id: job.id,
          stage: job.stage,
          outcome: "retry_or_failed",
        });
      }
    }
  }
  await Promise.all([lane(), lane(), lane()]);
  return { processed, configured: true };
}
