# Meeting Recorder

The world's most generic meeting recorder. A simple website that records a meeting, transcribes it, and summarizes it. Plain, reliable, and easy to use.

## Status

This repository is in the planning and documentation stage. The app has not been scaffolded, and no Supabase project or Vercel deployment has been created for it yet.

## The basic flow

1. Start recording a meeting.
2. Stop recording when the meeting ends.
3. Process the recording to produce a transcript and summary.
4. Read the transcript and summary on the website.

Transcription and summarization can happen after recording stops. Real-time processing is not required.

## Planned stack

| Part | Technology |
| --- | --- |
| Website | Next.js |
| Backend | Supabase, using a new project |
| Hosting | Vercel |
| Transcription and summarization | Provider to be confirmed |

## Principles

- Keep the interface plain and the workflow obvious.
- Prefer the simplest solution that works reliably.
- Focus on recording, transcription, and summarization.
- Add features only when they serve the core workflow.

## Documentation

Project documentation lives in [`docs/`](docs/README.md). Before implementation, document the recording approach, data flow, and acceptance criteria.

Decisions still to make include microphone versus meeting/tab audio capture, authentication, recording retention, and the transcription and summary provider.

## Development

There are no app dependencies or run commands yet. Setup instructions will be added when the Next.js app is scaffolded.

Supabase and Vercel configuration will follow the documented implementation plan. Keep credentials out of Git; local environment files are ignored. Once configuration is defined, document the required variables in a committed `.env.example` containing placeholders only.
