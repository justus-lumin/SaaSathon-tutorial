# Implementation notes

## Recording and recovery

`use-recorder.ts` uses native MediaRecorder at 48 kbps with one-second IndexedDB chunks. The timer and audio meter reflect real recording state. Double start is guarded; navigation controls disable while recording/uploading; leaving the browser tab warns about interruption. Permission failure, disconnected microphones, file-size caps, duration caps, and storage errors have explicit states.

Completed cloud recordings upload with TUS in 6 MB chunks directly to private Supabase Storage. Creation is idempotent using the browser recording ID. A local copy is removed only after server finalization succeeds. Interrupted uploads remain downloadable/retryable under the same signed-in account. Local mode is a separate device-only workspace; it does not automatically migrate recordings into an account. Browser storage can be cleared or evicted, so downloaded audio is the durable local backup.

## Worker

Finalization verifies the stored object's size, then atomically queues preparation. Three globally bounded jobs can run concurrently. Jobs have 360-second lease tokens; every result checks the current token. Crashed workers are recovered, transient failures back off, and the UI can request up to three user retries after permanent failure. Deleting a meeting immediately hides it and denies new signed URLs; a delayed cleanup job removes objects after in-flight leases expire. Existing signed URLs can remain valid for up to five minutes.

The worker normalizes browser audio to bounded mono MP3 before probing actual duration. This handles MediaRecorder WebM files without duration metadata. Five-minute segments overlap by one second; transcription results are assembled in segment order, trimming exact multi-word boundary repeats. This is not speaker diarization or timestamp alignment. Short boundary repeats may still need model-quality evaluation.

The summary worker persists the complete transcript first. It writes partial summary snapshots with generation IDs and increasing revisions. Realtime delivers owner-authorized snapshots; polling and resubscription fetch canonical state after a disconnect. Only a complete model response promotes the summary into the canonical meeting record. Retries start a fresh generation; old workers cannot overwrite it.

OpenRouter transcription uses its transcription endpoint. The summary uses GLM 5.3 Flash, `provider.sort = throughput`, and same-model fallbacks. Provider routing and streamed responses have a mocked HTTP integration test; live availability/quality/billing still require a funded key.

## Security and limits

Users can select only their meetings and documents. They cannot write statuses, transcript text, summary text, or jobs directly. Narrow authenticated SQL functions perform create/rename/finalize/retry/delete operations. Storage allows only a matching owner's draft original upload and owner reads. Derived audio is worker-only. Write APIs require a matching Origin; all private responses are non-cacheable and non-indexable.

The DB enforces 30 creations per UTC day, including meetings later deleted, and 1 GB of finalized audio per account. Original files are capped at 50 MB. Decoded audio is capped at approximately one hour (a small codec allowance exists). Summary size/context and inference attempts are bounded. Logs contain job IDs, stage, duration, and safe outcomes, not meeting text or provider error bodies.

The shipped product covers individual meetings. Account-wide deletion, production alerting, legal/privacy pages, and full deployment/load benchmarks are not implemented. Do not present local tests as proof of live service configuration.

## Evidence

- Production Next.js build and TypeScript/lint/design checks pass.
- Product tests exercise segmentation, overlap handling, safe errors, GLM throughput routing, actual streaming response parsing, and durationless WebM normalization with bundled FFmpeg.
- PostgreSQL tests apply the migration and exercise ownership, denied writes, idempotency, the full processing state machine, stale leases/revisions, retry generation reset, and deletion.
- Helium local-mode QA used synthetic audio without accessing the hardware microphone. Start/stop, playable persisted audio, rename, and recovery after reload were verified. Product layouts were checked at desktop and narrow mobile widths.
- Hosted TUS Storage uploads, paid transcription/summary inference, Linux Vercel processing, and Cron delivery passed a synthetic short-meeting smoke test. Google OAuth and browser Realtime delivery remain unverified. See [Deployment](deployment.md).
