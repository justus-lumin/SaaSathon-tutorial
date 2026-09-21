export type MeetingStatus =
  | "draft"
  | "queued"
  | "preparing"
  | "transcribing"
  | "summarizing"
  | "ready"
  | "failed"
  | "deleting"
  | "local";
export type Meeting = {
  id: string;
  user_id: string;
  title: string;
  status: MeetingStatus;
  audio_path: string | null;
  audio_mime_type: string | null;
  audio_bytes: number | null;
  duration_seconds: number | null;
  interrupted: boolean;
  transcript_markdown: string | null;
  summary_markdown: string | null;
  error_message: string | null;
  failure_stage: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};
export type MeetingList = { meetings: Meeting[]; nextCursor: string | null };
export type SummarySnapshot = {
  meeting_id: string;
  generation_id: string;
  revision: number;
  draft_markdown: string;
  status: "streaming" | "complete" | "failed";
  updated_at: string;
};
export type ProductIdentity = {
  id: string;
  email: string | null;
  name: string;
  local: boolean;
  processingReady: boolean;
};
export const MAX_RECORDING_SECONDS = 60 * 60;
export const MAX_RECORDING_BYTES = 50 * 1024 * 1024;
export const BUCKET = "meeting-audio";
export const ACTIVE_STATUSES: MeetingStatus[] = [
  "queued",
  "preparing",
  "transcribing",
  "summarizing",
];
export const STATUS_LABELS: Record<MeetingStatus, string> = {
  draft: "Waiting for audio",
  queued: "Queued",
  preparing: "Preparing audio",
  transcribing: "Transcribing",
  summarizing: "Writing summary",
  ready: "Ready",
  failed: "Needs attention",
  deleting: "Deleting",
  local: "Saved on this device",
};
export function formatDuration(seconds: number | null | undefined) {
  const n = Math.max(0, Math.floor(seconds || 0));
  return n >= 3600
    ? `${Math.floor(n / 3600)}:${String(Math.floor(n / 60) % 60).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`
    : `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
}
export function recordingTitle(date = new Date()) {
  return `Meeting · ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}
export function audioExtension(mime: string) {
  if (mime.startsWith("audio/mp4")) return "m4a";
  if (mime.startsWith("audio/ogg")) return "ogg";
  if (mime.startsWith("audio/webm") || mime.startsWith("video/webm"))
    return "webm";
  throw new Error(
    "This audio format is not supported. Try a Chromium-based browser.",
  );
}
