# Setup and deployment

## Local development

Use Node 22 (`.nvmrc`), run `npm ci`, and create `.env.local` from `.env.example` if it does not exist. Run `npm run dev` and open `http://127.0.0.1:3205/app?local=1` for local recording. The dev server binds to loopback. HTTPS or localhost is required for microphone access.

The Supabase JS/SSR packages and the shadcn Supabase Next.js client registry block are installed. Browser/server helpers live in `src/lib/supabase`; `src/proxy.ts` refreshes sessions on private routes. The registry middleware was adapted so public pages and local recording remain accessible.

## Supabase

The selected project is `fflsnkuqrniqvjvxlsrc`. Its public URL and publishable key are configured in the local ignored environment file. No privileged credentials are stored in Git.

Apply `supabase/migrations/202609210001_meeting_recorder.sql` to the dedicated project through the Supabase SQL editor or your authenticated migration workflow. This creates tables, constrained user RPCs, worker RPCs, RLS, a private `meeting-audio` bucket, and the Realtime publication entry. Apply it once; do not rerun it as a reset. Verify the migration in a development project before public launch.

Add `SUPABASE_SERVICE_ROLE_KEY` to the local and Vercel server environments. It is used only by the processing worker. Do not prefix it with `NEXT_PUBLIC_`. The browser uses the publishable key plus each user's session and RLS.

### Google sign-in

Enable Google in Supabase Auth using the OAuth client Justus configures. Google's authorized callback is:

```
https://fflsnkuqrniqvjvxlsrc.supabase.co/auth/v1/callback
```

In Supabase's URL configuration, allow the website callback `http://127.0.0.1:3205/auth/callback` and the production HTTPS `/auth/callback`. Set the production site URL too. Preview origins must be explicitly allowed if testing OAuth there. Request basic identity only, not Calendar or Drive permissions. [Supabase Google guide](https://supabase.com/docs/guides/auth/social-login/auth-google).

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe API key, protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only worker DB/Storage credential |
| `OPENROUTER_API_KEY` | Server-only inference credential, not a direct OpenAI key |
| `OPENROUTER_TRANSCRIPTION_MODEL` | Defaults to `openai/whisper-large-v3-turbo` |
| `OPENROUTER_SUMMARY_MODEL` | Defaults to `z-ai/glm-5.3-flash` |
| `WORKER_SECRET` | Random bearer secret for scheduled processing |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for the environment |

Generate the worker secret with `openssl rand -hex 32`. Store it only in `.env.local`, Vercel, and Supabase Vault. Summary routing sorts available providers by throughput with same-model fallbacks. Configure an OpenRouter spending cap before enabling public traffic.

## Vercel and durable processing

Import the GitHub repository as a Next.js project, select Node 22, and configure the environment variables. Worker routes explicitly allow 300 seconds. Vercel must provide enough function duration, memory, and bundled-file capacity for FFmpeg. `next.config.ts` includes the Linux binaries in traced worker routes. Verify them on an actual Linux Vercel preview with a maximum-length test recording before launch.

After deployment, replace the two placeholders in `supabase/schedule.sql` **outside Git**, then run it in Supabase. It stores the app URL and worker secret in Vault and schedules an authenticated POST to `/api/internal/process` every minute. Do not commit the filled-in script. Avoid duplicate schedules/secrets when updating an existing installation; update the existing Vault values and cron job instead.

Finalization and retries also attempt an immediate worker wake-up through Next.js `after`. Cron is the durable fallback, including when the browser closes. Verify that deployment protection permits the scheduled endpoint; authentication alone does not bypass Vercel protection. Inspect `net._http_response` and `public.processing_jobs` if meetings remain queued.

## Verification

Run the README checks. `npm run test:db` creates and destroys only its own disposable Docker container. It never connects to the hosted Supabase project.

Then verify Google login/logout, two-account isolation, TUS upload/resume, worker execution, streaming reconnect, failed-provider retry, audio playback, and deletion on the configured environment. Check the private bucket cannot be read anonymously. Test a full hour, microphone interruption, storage exhaustion, and mobile/browser sleep before public launch.

Short-meeting paid inference and the deployed Vercel worker are verified; see [Deployment](deployment.md). Google OAuth is still pending. Public-site legal copy, account deletion, operational alerting, and the long-recording deployment benchmark remain launch work. Existing requirements documents describe that broader launch target.
