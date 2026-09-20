# Streaming summaries and rich Markdown

Confirmed direction: show the summary progressively while GLM 5.3 Flash generates it, with Vercel Streamdown and ChatGPT-style response components. Interpretation of “ChatGPT components”: **Vercel AI Elements**, which builds on shadcn/ui. This does not add an OpenAI product dependency or a chat composer.

This is still a build specification. Packages have not been installed because the Next.js app has not been scaffolded.

## Rendering stack

Use **Streamdown** through the AI Elements `MessageResponse` component. Include `Message`, `MessageContent`, and copy/retry actions as needed. Reuse the same renderer for the completed summary and transcript. The generated AI Elements component lives in the repo and can be adapted to pass the installed Streamdown version's plugin and streaming props. [AI Elements Message](https://elements.ai-sdk.dev/components/message).

Support ordinary Markdown, headings, emphasis, links, blockquotes, GFM tables/task lists, fenced code with highlighting, inline/display LaTeX through KaTeX, and Mermaid diagrams. Load diagram/code support only on document surfaces. Do not generate equations or diagrams unless the meeting content warrants them. Streamdown accepts incomplete Markdown and separate math/code/Mermaid plugins. [Streamdown usage](https://streamdown.ai/docs/usage).

Future installation, after Next.js and shadcn/ui exist:

```sh
npm install ai @openrouter/ai-sdk-provider streamdown @streamdown/math @streamdown/code @streamdown/mermaid katex
npx ai-elements@latest add message
```

Resolve compatible versions and commit the lockfile when scaffolding. Add KaTeX CSS once in the app layout. Include Streamdown's distribution in Tailwind's source scanning, using the correct path relative to the actual stylesheet. Wire the `math`, `code`, and `mermaid` plugins into the response renderer; installing packages alone is insufficient.

Use streaming mode with `isAnimating` while generation is active; switch to static mode when viewing saved content. Keep stable component keys so each update does not remount the document. [Streamdown configuration](https://streamdown.ai/docs/configuration).

## Generation and delivery

The existing durable summary job remains responsible for the OpenRouter request, even with no browser connected. Use `streamText` from Vercel AI SDK with `@openrouter/ai-sdk-provider`, preserving GLM 5.3 Flash and `provider.sort: "throughput"` on the outbound request. Verify the SDK adapter actually sends these routing fields. [OpenRouter AI SDK integration](https://openrouter.ai/docs/guides/community/vercel-ai-sdk).

Consume answer-text deltas server-side. Persist the first nonempty answer immediately, then coalesce updates into full snapshots at roughly 250 ms intervals, and flush on completion/error. These are small transport batches, not a fake typing animation. Snapshot timing is an initial target to verify under load.

Deliver snapshots through authenticated Supabase Realtime Postgres Changes on `meeting_summary_streams`. RLS restricts reads to the meeting owner. Use the same authenticated Supabase client for the subscription; do not expose a service key. Benchmark payload size/event volume before scaling. [Supabase Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes).

TanStack Query remains the source of client server-state: normal endpoints use queries/mutations; the subscription applies newer snapshots with `setQueryData`. No separate `useChat` message store or chat endpoint is needed for this single generated document.

## Consistency and recovery

Subscribe first, then fetch the snapshot through the authenticated summary endpoint. Buffer events during that read and reconcile by generation ID and revision. Fetch the authoritative current generation on any unfamiliar generation event; never let an older query response overwrite newer text. Include job generation IDs in every snapshot and fence worker writes by the active lease.

A retry starts a new generation with a fresh draft; never append it to an old failed draft. Reconnect reloads the snapshot and restores the subscription. Completion invalidates/refetches the canonical meeting document. If Realtime fails, fall back to polling and show reconnection status; the worker keeps running independently.

Persist `summary_markdown` and Ready only after a valid finish reason and a nonempty final result. A failure leaves the transcript and an explicitly incomplete draft available. Closing the page does not cancel generation. Sign-out, account changes, or deletion remove subscriptions and cached private text. Ignore subsequent buffered events from a previous account or generation.

## Readability and safety

Render every received snapshot immediately; let Streamdown manage unfinished delimiters. Do not wait for the whole document or replay completed text as artificial streaming. Keep the generating label until finalization. Copy/export should use the saved canonical text; disable final-document actions while generating or clearly identify an incomplete draft.

Style the document with the shared brand typography, spacing, surfaces, and code colors. Tables/code blocks scroll within the content width on small screens. Follow the bottom only while the user is already there; scrolling up pauses following. Announce status changes rather than every token to screen readers. Respect reduced motion.

Use `skipHtml` and safe link policies; never render Markdown as executable MDX. Preserve sanitization when configuring plugins. Block remote images, Mermaid click handlers/external content, and trusted KaTeX commands. Render diagrams only when a complete valid block is available, with a safe text fallback on parse failure. Treat all generated text as untrusted.

## Acceptance checks

Stream a fixture containing split bold markers, an unfinished code fence, a partially formed table, inline math, a display equation, and a Mermaid block. Verify it renders progressively without crashing and resolves to the same final appearance as static rendering. Test narrow screens, keyboard/copy behavior, and HTML/link/diagram/math injection attempts.

Verify the first rendered answer arrives before generation completes, refresh/reconnect restores progress, stale events cannot overwrite a new attempt, and another user cannot subscribe to the meeting. Test provider interruption, lost Realtime connection, sign-out midstream, and leaving the page while the worker continues. These behaviors have not yet been implemented or verified.
