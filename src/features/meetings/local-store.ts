"use client";
import { openDB, type DBSchema } from "idb";
import { type Meeting, recordingTitle } from "./types";
export type LocalRecording = {
  id: string;
  owner: string;
  title: string;
  mime: string;
  createdAt: string;
  duration: number;
  interrupted: boolean;
  complete: boolean;
  uploadedMeetingId?: string;
};
interface RecordingDB extends DBSchema {
  recordings: {
    key: string;
    value: LocalRecording;
    indexes: { owner: string };
  };
  chunks: {
    key: [string, number];
    value: { recordingId: string; index: number; blob: Blob };
    indexes: { recording: string };
  };
}
const database = () =>
  openDB<RecordingDB>("meeting-recorder-v1", 1, {
    upgrade(db) {
      db.createObjectStore("recordings", { keyPath: "id" }).createIndex(
        "owner",
        "owner",
      );
      db.createObjectStore("chunks", {
        keyPath: ["recordingId", "index"],
      }).createIndex("recording", "recordingId");
    },
  });
export async function createLocalRecording(owner: string, mime: string) {
  const record: LocalRecording = {
    id: crypto.randomUUID(),
    owner,
    title: recordingTitle(),
    mime,
    createdAt: new Date().toISOString(),
    duration: 0,
    interrupted: false,
    complete: false,
  };
  await (await database()).put("recordings", record);
  return record;
}
export async function saveChunk(
  recordingId: string,
  index: number,
  blob: Blob,
) {
  await (await database()).put("chunks", { recordingId, index, blob });
}
export async function updateLocalRecording(
  id: string,
  patch: Partial<LocalRecording>,
) {
  const db = await database();
  const tx = db.transaction("recordings", "readwrite");
  const record = await tx.store.get(id);
  if (!record) throw new Error("The local recording could not be found.");
  await tx.store.put({ ...record, ...patch, id, owner: record.owner });
  await tx.done;
}
export async function listLocalRecordings(owner: string) {
  return (
    await (await database()).getAllFromIndex("recordings", "owner", owner)
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function localRecording(id: string, owner: string) {
  const record = await (await database()).get("recordings", id);
  if (!record || record.owner !== owner)
    throw new Error("This local recording could not be found.");
  return record;
}
export async function recordingBlob(id: string, owner: string) {
  const record = await localRecording(id, owner);
  const chunks = await (
    await database()
  ).getAllFromIndex("chunks", "recording", id);
  return new Blob(
    chunks.sort((a, b) => a.index - b.index).map((c) => c.blob),
    { type: record.mime },
  );
}
export async function deleteLocalRecording(id: string, owner: string) {
  await localRecording(id, owner);
  const db = await database();
  const tx = db.transaction(["recordings", "chunks"], "readwrite");
  const keys = await tx.objectStore("chunks").index("recording").getAllKeys(id);
  await Promise.all(keys.map((key) => tx.objectStore("chunks").delete(key)));
  await tx.objectStore("recordings").delete(id);
  await tx.done;
}
export function localMeeting(record: LocalRecording): Meeting {
  return {
    id: record.id,
    user_id: record.owner,
    title: record.title,
    status: "local",
    audio_path: null,
    audio_mime_type: record.mime,
    audio_bytes: null,
    duration_seconds: record.duration,
    interrupted: record.interrupted || !record.complete,
    transcript_markdown: null,
    summary_markdown: null,
    error_message: null,
    failure_stage: null,
    created_at: record.createdAt,
    updated_at: record.createdAt,
    completed_at: record.complete ? record.createdAt : null,
  };
}
