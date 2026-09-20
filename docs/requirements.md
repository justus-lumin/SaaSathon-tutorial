# Requirements

## Purpose and scope

A website for someone who wants to record a meeting and return to what was said. The core experience is Google login, start, stop, and review. Next.js, Vercel, Supabase, OpenRouter, TanStack Query, and shadcn/ui are confirmed choices.

Public surfaces: a landing page and useful SEO pages. Private surfaces: a recording/history page and a meeting detail page. Each meeting preserves its audio, full transcript, and summary. Transcript and summary are Markdown text. Processing happens after recording stops.

## User flow

1. Visit the landing page and choose to continue with Google.
2. Sign in through Supabase and arrive at `/app`.
3. Choose Start recording and grant the required audio permission.
4. See an unmistakable recording indicator, elapsed time, and Stop recording.
5. Stop. The microphone is released, the recording finishes uploading, and processing is queued.
6. Once upload and queueing are confirmed, the user can leave and return later.
7. Open a past meeting to play the audio and read its summary or full transcript.

The history list shows date, title, duration, and a plain-language status. The default title uses the recording date; renaming is a proposed convenience. Newest meetings come first, with pagination as history grows.

## Proposed first-release boundaries

- Microphone capture first. This captures the selected microphone, not automatically all participants in a remote call. Headphone audio is not captured by a microphone. Confirm microphone-only versus microphone plus shared-tab audio before implementation; marketing must match the result.
- Desktop Chromium is the first recording target, including Helium. Test Safari/Firefox separately before advertising support. Keep reading/history responsive on mobile; do not promise mobile background recording.
- Initial recording cap: 60 minutes and 50 MB, whichever comes first. These are proposed product limits, not provider guarantees. Verify them with real browser codecs and processing tests. Warn before stopping; preserve captured audio at the limit.
- Retain audio and text until the user deletes the meeting. Temporary processing files are removed after completion. Publish the actual retention policy before launch.
- English-first quality evaluation, including New Zealand accents. Do not advertise other languages solely because a provider lists them.
- One active recording per browser session. No meeting bots, calendar integrations, live captions, team workspaces, public sharing, billing, editing tools, or AI chat in the first release.

## Required behavior

| Situation | Expected behavior |
| --- | --- |
| Permission denied or unsupported browser | Explain the issue; remain idle; do not show a recording timer |
| Start or stop clicked twice | Only one meeting and one finalization operation |
| Recording active | Timer stays accurate; navigation warns about unfinished recording |
| Microphone disconnects or recorder fails | Stop safely, preserve any valid audio, and identify the recording as interrupted |
| Network fails | Retain local audio and offer retry; never say Saved before server confirmation |
| Page closes during recording | Recording stops; recover locally persisted bytes where possible, without claiming seamless continuation |
| Page closes after upload/queue confirmation | Processing continues without the browser |
| Transcription fails | Keep the audio and allow retry without re-recording |
| Summary fails | Keep the transcript visible; retry only summarization |
| Reload or later login | Saved meetings and durable processing status remain available |
| Empty/silent audio | Report no speech detected; do not invent meeting content |
| Delete meeting | Confirm deletion, hide it, and reliably remove audio and text |
| Another user's meeting ID or file path | Deny access through both API and Supabase policies |

A transcript must preserve the whole captured conversation in order, not rewrite it as notes. Mark uncertain speech when supported; do not invent speaker names. Summary sections: Overview, Key points, Decisions, and Action items. Only include owners/deadlines when stated. Treat the transcript as data, not instructions.

## Acceptance criteria

A real signed-in user can record, stop, leave after saving, and return to a playable recording, full Markdown transcript, and useful summary. Another user cannot access any of those assets. A failed job can resume without losing completed work. All key states work with a keyboard and have visible text, not color alone.

## Decisions to settle

Confirm audio capture scope, launch browser support, limits/retention, and the final brand/name. These do not block writing the plan; they must be explicit before recording UI and public claims are finalized.
