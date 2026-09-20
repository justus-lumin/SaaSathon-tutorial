# Build plan

Status: documentation only. Brand and design-system work is next. Do not start app implementation until requested.

## 1. Brand and design system

Use the [brand brief](../brand.md) to decide the working name, typography, color, spacing, and voice. Design the landing page, recorder/history page, and meeting detail together. Show idle, recording, saving, processing, ready, empty, and failed states. Map approved choices into shadcn/ui tokens before building product screens.

Exit: one coherent direction and a small, concrete token/component specification. No final logo or color values are implied by this plan.

## 2. Prove the recording and processing path

Once implementation is authorized, confirm capture scope and target browsers. Use test audio to prove full-length capture, IndexedDB recovery, TUS upload, FFmpeg packaging on Vercel, segmentation, and the OpenRouter transcription endpoint. Run the model comparison from [models.md](models.md). Establish actual length/size limits and provider timing before polishing UI.

Exit: a consented representative recording survives upload and processing with no missing/duplicated boundary speech. The deployed worker fits its resource limits. If it does not, revise the architecture explicitly rather than quietly reducing advertised capability.

## 3. App foundation and private backend

Scaffold the agreed stack, add design tokens, and create Supabase migrations. Set up Google Auth, SSR session handling, API validation, Storage policies, and the durable job worker/schedule.

Exit: local checks and preview build pass; two users cannot access each other's DB rows, storage objects, signed URL endpoints, or mutations. Cron can reach the authenticated worker.

## 4. Complete the core product

Build start/stop, history, playback, Markdown transcript/summary, upload progress, and safe retry/delete. Connect all remote state through TanStack Query. Preserve partial successes and local recordings when a network failure occurs.

Exit: the core user journey works after a refresh and after closing the tab once saving is confirmed. The product remains small and readable.

## 5. Public pages and release

Build the landing page and the useful pages in [public-pages.md](public-pages.md), using verified behavior and real/synthetic approved examples. Set metadata, sitemap, private-route noindex, privacy/terms, environment configuration, quotas, and basic operational alerts.

## Verification matrix

| Area | Required evidence |
| --- | --- |
| Code | Typecheck, lint, production build |
| Data security | Two-user RLS/API/Storage tests; unauthenticated and guessed-ID access denied |
| Job integrity | Concurrent claims, expired leases, duplicate finalize, and failed-stage retry tests |
| Media | Short/full-length recordings, silence, invalid media, codec support, segment boundaries |
| Browser UX | Start/stop, permissions, timer, playback, keyboard, mobile reading layout |
| Recovery | Offline upload, refresh, interrupted recorder, server timeout, 429, summary-only failure |
| Lifecycle | Delete during processing; orphan cleanup; no content reappears after deletion |
| Auth/cache | Google callback, logout, session expiry, account switching, no cross-user cached data |
| Content safety | Markdown cannot execute HTML/JS or load tracking images |
| Live deployment | Real scheduled worker, real upload, transcript, summary, and later retrieval |
| Public content | Server-rendered content, working links, canonical metadata, indexing boundaries |

Use focused unit/integration tests for state transitions, idempotency, and access control. Browser tests should cover the meaningful journey, with fake media for repeatability and at least one manual real-microphone check. Keep code, test, preview, and live evidence distinct. Do not call a retry-only pass clean.

## Outstanding choices

The user-selected stack is settled. Confirm capture mode, release browser matrix, duration/size limits, retention, account quotas, final brand/domain, and benchmarked model selection before public launch. Name and design direction are the immediate next decisions; credentials are not needed for brand work.
