# Deployment record

Updated 21 September 2026.

## Connected services

- Website: https://saa-sathon-tutorial.vercel.app
- Vercel project: `saa-sathon-tutorial`, connected to `justus-lumin/SaaSathon-tutorial` on GitHub.
- Supabase: `fflsnkuqrniqvjvxlsrc`, `SaaSathon-tutorial`, Seoul (`ap-northeast-2`).
- Vercel function region: Seoul (`icn1`), configured in `vercel.json`.
- Migration `202609210001_meeting_recorder.sql` is applied and recorded remotely.
- The `meeting-audio` bucket is private, with the migration's ownership rules.
- Production environment values are configured. Secrets are held in Vercel and ignored local environment files, never Git.
- Supabase Cron `meeting-recorder-worker` calls the authenticated processing endpoint every minute. Its URL and bearer secret live in Supabase Vault. Scheduled calls returned HTTP 200.

Local CLI links are ignored machine state. To link another checkout:

```bash
supabase link --project-ref fflsnkuqrniqvjvxlsrc
supabase migration list --linked
supabase db push --linked --dry-run
vercel link --project saa-sathon-tutorial --scope justushuneke-6631s-projects
```

Review pending migrations before applying them. Do not use `db reset` against this hosted project. Git pushes deploy the website through Vercel; DB migrations still require an explicit `supabase db push --linked` using authorized CLI credentials. No broad Supabase management token was added to GitHub Actions.

## Verified live

A disposable test account and generated speech fixture exercised the deployed product API:

1. Authenticated meeting creation and resumable TUS upload.
2. FFmpeg preparation in the Linux Vercel worker.
3. OpenRouter transcription and `z-ai/glm-5.3-flash` summary completion.
4. Persisted transcript and summary Markdown.
5. Signed audio playback, with anonymous public-bucket access rejected.
6. Rename and immediate owner-visible deletion.

Each processing stage completed in one attempt. The synthetic recording generated 225 transcript characters and 691 summary characters. No real meeting audio was used. This verifies a short meeting, not the one-hour capacity target.

## Remaining verification

Google OAuth is not configured yet. Browser automation was blocked by an open extension panel on the Cloud Console page. The callback to register in Google is `https://fflsnkuqrniqvjvxlsrc.supabase.co/auth/v1/callback`. Supabase must allow `https://saa-sathon-tutorial.vercel.app/auth/callback` and `http://127.0.0.1:3205/auth/callback` and use the production website as its site URL. Complete a real Google login before opening access to users.

The delayed physical-deletion job is being checked separately from immediate deletion visibility. Account-wide deletion, legal/privacy pages, production alerts, and full-hour/mobile-sleep benchmarks remain launch work.
