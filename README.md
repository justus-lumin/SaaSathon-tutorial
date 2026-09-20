# Meeting Recorder

The world's most generic meeting recorder. Start recording, stop recording, and get the audio, a full transcript, and a short summary. A plain, fast website that gets the job done.

## Status

Planning and documentation only. No app code, dependencies, Supabase project, or Vercel deployment has been created. Brand and design-system work comes before implementation. “Meeting Recorder” is a working name.

## Agreed stack

| Part | Technology |
| --- | --- |
| Website and API | Next.js App Router, hosted on Vercel |
| UI | shadcn/ui and Vercel AI Elements |
| Streaming Markdown | Vercel Streamdown, including LaTeX/math |
| Summary streaming | Vercel AI SDK through OpenRouter; Supabase Realtime delivery |
| Client API state | TanStack Query |
| Login | Google through Supabase Auth |
| Backend | A new Supabase project |
| Recording files | Private Supabase Storage |
| Transcript and summary | Markdown strings in Supabase Postgres |
| Inference | OpenRouter |

TypeScript and Tailwind CSS are proposed implementation defaults. Use **Whisper Large V3 Turbo** for transcription and **GLM 5.3 Flash** for summaries, both through OpenRouter. Summary requests prioritize the fastest available provider by output throughput. See the dated [model comparison](docs/models.md) for prices, alternatives, and validation still needed.

## Product

- A public landing page and a small set of useful SEO pages.
- Google sign-in, followed by one simple recording page.
- Start and stop controls, with a visible recording state.
- Past meetings with audio playback, the full transcript, and a summary.
- Processing after recording stops; no real-time transcription required. The summary renders progressively as it is generated.

Keep the UI small. Reliability, readable content, and clear recovery matter more than extra features.

## Documentation

Start with the [documentation index](docs/README.md). It links the requirements, architecture, data model, model research, public-page plan, setup guide, and implementation sequence.

The [brand brief](brand.md) prepares the next phase. It does not establish a final name, logo, palette, or typography.

## Development

There are no install or run commands yet. [Setup](docs/setup.md) describes the future configuration and required secrets. Never commit credentials or real meeting content. Local environment files are ignored.
