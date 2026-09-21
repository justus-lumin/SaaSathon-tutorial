# Meeting Recorder

A simple website for recording meetings, keeping the audio, and getting a transcript and summary. Built with Next.js, Supabase, and OpenRouter for Vercel.

## Run locally

Use Node 22 and npm.

```bash
npm ci
cp .env.example .env.local # only if you do not already have this file
npm run dev
```

Open [the product](http://127.0.0.1:3205/app) or [local recording](http://127.0.0.1:3205/app?local=1). Local mode records and plays real audio in your browser without credentials. It never fabricates transcripts or summaries. Local audio stays on this device and is separate from signed-in account recordings.

## Product

- Google login through Supabase Auth.
- Start/stop microphone recording with a timer, audio level, and IndexedDB recovery copies.
- Private, resumable uploads directly to Supabase Storage.
- A meeting library with playback, rename, deletion, search of loaded meetings, and Markdown exports.
- Durable background transcription, followed by a progressively rendered summary.
- Retryable processing, worker leases, owner-only access, and bounded recording limits.

The recorder captures the microphone only. It does not capture headphone, system, or other browser-tab audio. Keep the recording tab open. The current limit is one hour / 50 MB per recording, 30 new recordings per UTC day, and 1 GB of saved audio per account.

## Stack

| Part | Technology |
| --- | --- |
| Website/API | Next.js App Router, TypeScript, Vercel |
| UI | shadcn/ui, Vercel AI Elements, Tailwind CSS |
| Markdown | Streamdown with math, code, and Mermaid plugins |
| Client state | TanStack Query |
| Auth, DB, files | Supabase Auth, Postgres, private Storage |
| Transcription | OpenRouter `openai/whisper-large-v3-turbo` |
| Summaries | OpenRouter `z-ai/glm-5.3-flash`, provider sorted by throughput |
| Processing | Persisted SQL jobs, FFmpeg, Vercel Node functions, Supabase Cron |

Transcript and summary documents are stored as Markdown strings. Summary generation uses Vercel AI SDK; authenticated Supabase Realtime snapshots deliver partial Markdown with polling fallback. Inference keys stay on the server. A direct OpenAI key is not used.

## Connect services

Follow [Setup](docs/setup.md) to apply the migration, enable Google login, configure secrets, deploy, and schedule the worker. The Supabase browser configuration alone does not provision the DB or enable transcription. Server keys and the schedule are still required.

The app is deployed at [saa-sathon-tutorial.vercel.app](https://saa-sathon-tutorial.vercel.app). Private uploads, paid inference, and the Vercel worker passed a synthetic short-meeting test. Google OAuth setup is still pending. See the [deployment record](docs/deployment.md) for verified behavior and remaining checks.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run test:product
npm run test:db # Docker; disposable PostgreSQL 17 container
npm run build
```

The DB tests apply the actual migration against isolated Auth/Storage stubs, then exercise ownership, privilege restrictions, idempotency, worker fencing, streamed revisions, and deletion. They do not replace a live Supabase integration test.

See the [documentation index](docs/README.md), [implementation notes](docs/implementation.md), and [brand system](brand.md). Never commit credentials or real meeting recordings.
