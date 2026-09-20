# Meeting Recorder

The world's most generic meeting recorder. Start recording, stop recording, and get the audio, a full transcript, and a short summary. A plain, fast website that gets the job done.

## Status

Planning and documentation only. No app code, dependencies, Supabase project, or Vercel deployment has been created. Brand and design-system work comes before implementation. “Meeting Recorder” is a working name.

## Agreed stack

| Part | Technology |
| --- | --- |
| Website and API | Next.js App Router, hosted on Vercel |
| UI | shadcn/ui |
| Client API state | TanStack Query |
| Login | Google through Supabase Auth |
| Backend | A new Supabase project |
| Recording files | Private Supabase Storage |
| Transcript and summary | Markdown strings in Supabase Postgres |
| Inference | OpenRouter |

TypeScript and Tailwind CSS are proposed implementation defaults. Model recommendations are **Whisper Large V3 Turbo** for transcription and **Nova Micro** for summaries, both through OpenRouter. See the dated [model comparison](docs/models.md) for prices, alternatives, and validation still needed.

## Product

- A public landing page and a small set of useful SEO pages.
- Google sign-in, followed by one simple recording page.
- Start and stop controls, with a visible recording state.
- Past meetings with audio playback, the full transcript, and a summary.
- Processing after recording stops; no real-time transcription required.

Keep the UI small. Reliability, readable content, and clear recovery matter more than extra features.

## Documentation

Start with the [documentation index](docs/README.md). It links the requirements, architecture, data model, model research, public-page plan, setup guide, and implementation sequence.

The [brand brief](brand.md) prepares the next phase. It does not establish a final name, logo, palette, or typography.

## Development

There are no install or run commands yet. [Setup](docs/setup.md) describes the future configuration and required secrets. Never commit credentials or real meeting content. Local environment files are ignored.
