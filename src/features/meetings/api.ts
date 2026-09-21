import { Upload } from "tus-js-client";
import { browserSupabase } from "@/lib/supabase/browser";
import { BUCKET, MAX_RECORDING_BYTES, type Meeting } from "./types";
import { uploadAuthorization } from "./upload-auth";
import {
  recordingBlob,
  updateLocalRecording,
  type LocalRecording,
} from "./local-store";
export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data?.error?.message || "The request failed. Please try again.",
    );
  return data as T;
}
export async function uploadRecording(
  record: LocalRecording,
  onProgress: (percent: number) => void,
  signal: AbortSignal,
) {
  const supabase = browserSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session || session.user.id !== record.owner)
    throw new Error("Sign in to the account that recorded this meeting.");
  const blob = await recordingBlob(record.id, record.owner);
  if (!blob.size) throw new Error("This recording has no audio.");
  if (blob.size > MAX_RECORDING_BYTES)
    throw new Error("The recording exceeds 50 MB. You can still download it.");
  const meeting = await api<Meeting>("/api/meetings", {
    method: "POST",
    signal,
    body: JSON.stringify({
      requestId: record.id,
      title: record.title,
      mime: record.mime.split(";")[0],
    }),
  });
  await updateLocalRecording(record.id, { uploadedMeetingId: meeting.id });
  if (meeting.status !== "draft") return meeting;
  const base = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  if (base.hostname.endsWith(".supabase.co"))
    base.hostname = base.hostname.replace(
      ".supabase.co",
      ".storage.supabase.co",
    );
  const endpoint = new URL("/storage/v1/upload/resumable", base).toString();
  // If upload finished but finalization was interrupted, don't upload/overwrite again.
  const { data: existing } = await supabase.storage
    .from(BUCKET)
    .info(meeting.audio_path!);
  if (!existing)
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        signal.removeEventListener("abort", abort);
        if (error) reject(error);
        else resolve();
      };
      const upload = new Upload(blob, {
        endpoint,
        chunkSize: 6 * 1024 * 1024,
        retryDelays: [0, 1000, 3000, 5000, 10000],
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        ...uploadAuthorization(
          record.owner,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
          () => supabase.auth.getSession(),
        ),
        metadata: {
          bucketName: BUCKET,
          objectName: meeting.audio_path!,
          contentType: record.mime.split(";")[0],
          cacheControl: "3600",
        },
        fingerprint: async () => `${record.owner}/${record.id}/${blob.size}`,
        onError: () =>
          finish(
            new Error(
              "The upload was interrupted. Your local recording is safe. Try again.",
            ),
          ),
        onProgress: (sent, total) =>
          onProgress(Math.round((sent / total) * 100)),
        onSuccess: () => finish(),
      });
      const abort = () => {
        void upload.abort();
        finish(new Error("Upload stopped. Your local recording is safe."));
      };
      signal.addEventListener("abort", abort, { once: true });
      if (signal.aborted) {
        abort();
        return;
      }
      void upload
        .findPreviousUploads()
        .then((previous) => {
          if (signal.aborted) return;
          if (previous.length) upload.resumeFromPreviousUpload(previous[0]);
          upload.start();
        })
        .catch(() =>
          finish(new Error("The upload could not start. Please try again.")),
        );
    });
  return api<Meeting>(`/api/meetings/${meeting.id}/finalize`, {
    method: "POST",
    signal,
    body: JSON.stringify({
      interrupted: record.interrupted || !record.complete,
    }),
  });
}
