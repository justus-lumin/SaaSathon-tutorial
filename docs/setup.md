# Setup and deployment plan

No steps in this document have been executed. There is no app to run yet. The repository is prepared for documentation and brand design.

## Local project, when implementation starts

Scaffold Next.js App Router with TypeScript and Tailwind CSS. Use npm and commit its lockfile. Add shadcn/ui components as needed, TanStack Query, Supabase JS/SSR clients, TUS upload support, Streamdown with its math/code/diagram plugins, and the AI Elements message components. Add Vercel AI SDK (`ai`) and `@openrouter/ai-sdk-provider` for summary streaming. Use native fetch for transcription. Package commands and renderer configuration are specified in [Streaming UI](streaming-ui.md).

Pin a Node LTS version supported by Next.js and Vercel at implementation time. Add dev, build, lint, typecheck, and test scripts then. Configure Linux FFmpeg/ffprobe packaging for the Vercel worker and test it in a real preview before committing to the processing approach.

Proposed structure: `src/app` for routes, `src/components/ui` for shadcn/ui, `src/features/meetings` for recording/history, `src/lib` for API/auth helpers, `supabase/migrations` for schema, and `content` for public pages. Avoid a monorepo or abstraction framework.

## Supabase and Google

Create a new dedicated Supabase project. Choose its region alongside the Vercel worker region. Apply versioned migrations for tables, RLS, bucket rules, lease RPCs, and cleanup. Enable Cron/pg_net and configure the worker wake-up only after its endpoint exists. Enable the summary snapshot table in Supabase Realtime and verify owner-only subscription access.

Justus will configure Google OAuth. The Google OAuth authorized redirect URI is the callback displayed by Supabase, typically `https://<project-ref>.supabase.co/auth/v1/callback`. Separately, allow the website's local and production `/auth/callback` URLs in Supabase Auth redirect settings. Exchange the callback code for a session using the Supabase SSR flow; allow only validated same-site return paths. Request basic identity scopes only, not Calendar or Drive access. [Google Auth setup](https://supabase.com/docs/guides/auth/social-login/auth-google).

Use a separate development/staging project for test recordings before public launch. Do not connect previews to production meeting data. Verify login, logout, expired sessions, and two-user isolation.

## Proposed environment variables

| Variable | Visibility and purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe API key; requires correct RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only worker/admin credential |
| `OPENROUTER_API_KEY` | Server-only inference credential |
| `OPENROUTER_TRANSCRIPTION_MODEL` | Server-only, initial `openai/whisper-large-v3-turbo` |
| `OPENROUTER_SUMMARY_MODEL` | Server-only, `z-ai/glm-5.3-flash` |
| `WORKER_SECRET` | Server-only authentication for scheduled processing |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for the relevant environment |

Record final names and placeholders in `.env.example` during scaffolding. Real values belong in ignored `.env.local`, Vercel environment settings, or Supabase Vault. Google client secrets belong in Supabase provider configuration. No direct OpenAI key is required. Summary requests set `provider.sort` to `"throughput"` with same-model provider fallbacks enabled, as specified in [Models](models.md).

## Vercel

Import this GitHub repository as a Next.js project when implementation is ready. Configure environment variables per environment and use HTTPS for microphone access. Set the Node worker duration explicitly, protect its endpoint with the worker secret, and restrict secret access to server code.

Configure Supabase Cron to POST to the worker every minute with its Vault-held credential. Check HTTP responses and job backlog so a disabled schedule or blocked preview URL cannot silently strand recordings. Test scheduled access against Vercel deployment protection. Do not use a browser ping as the only job trigger.

Keep the app usable during deploys through persisted jobs, expired-lease recovery, and backward-compatible migrations. Update the canonical domain and OAuth allowlist together. Recheck hosting limits and resource needs for FFmpeg and the maximum recording length. [Vercel limits](https://vercel.com/docs/functions/limitations).

## Operating basics

Before opening signups, choose and enforce per-user recording/processing quotas, a global concurrency limit, and an OpenRouter spending cap. Record meeting/job IDs, stage durations, safe error codes, and provider usage without meeting content. Alert on repeated failures and stale queued jobs. Start with platform logs; no extra observability service is required by this plan.

A release is ready only after the [build-plan checks](build-plan.md) pass in the intended environment. Successful builds do not prove Google login, recording, processing, or private storage access.
