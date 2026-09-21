# Soft Wave implementation

Selected by Justus. The user requested a less cluttered monochrome system with generous negative space and a 12-column landing page.

## Source of truth

- `src/app/tokens.css`: approved palette and semantic shadcn roles, typography, spacing, widths, radii, and motion. Tailwind's default color palette is cleared.
- `src/app/globals.css`: global defaults and shared page/document layouts. Plugins inherit monochrome presentation.
- `src/components/ui`: shared Radix-backed, shadcn-compatible primitives. New product screens should import these rather than invent controls.
- `src/components/ai-elements/message.tsx`: customized AI Elements document components. Uses Streamdown for incomplete/static Markdown, math, code, and diagrams. It deliberately omits chat composition, attachments, and branching, which are outside the product scope.
- `src/components/brand.tsx`: scalable three-capsule mark with a Nunito Sans wordmark based on the selected concept. Original generated assets remain in `assets/brand`.
- `AGENTS.md` and `scripts/check-design.mjs`: agent-facing rules and an automated design guard. The guard catches common source-level violations; browser review remains required for plugin output and composition.

## Public routes

`/` is the sparse landing page. `/demo` uses labelled fictional meeting content and exercises tabs and copy. `/design-system` is the live component gallery. `/guides` links five distinct pages:

1. `/meeting-transcription`: preserving source meaning and reviewing uncertain words.
2. `/meeting-summary`: structuring a short, accurate recap.
3. `/guides/record-a-meeting-in-your-browser`: inputs, permissions, test playback, and saving.
4. `/guides/meeting-minutes-template`: a reusable everyday meeting-minutes outline.
5. `/guides/meeting-action-items`: commitments, owners, deadlines, and dependencies.

Content is server-rendered and stored in `src/content/guides.ts`. Each guide has a distinct H1, title, description, canonical, and related links. These are intent hypotheses, not measured keyword opportunities. No search performance is claimed.

Local/preview environments are noindex and return an empty sitemap. A Vercel production environment with `NEXT_PUBLIC_SITE_URL` enables public indexing and sitemap entries. `/demo` and `/design-system` remain noindex. The private app must independently retain noindex metadata and authentication controls. No special AI crawler or training permissions are added.

## Component contract

`Button`: default, secondary, outline, ghost, destructive, link; sizes default, sm, lg, icon, icon-sm. All interactive sizes are at least 44 px.

Radix-backed components manage focus, keyboard interaction, portal layering, and ARIA: Tabs, Dialog, AlertDialog, Select, DropdownMenu, Tooltip. Inputs and textareas need visible labels. Cards are optional surfaces; use flat lists where hierarchy is already clear.

`MessageResponse` takes `children`, `mode`, `isAnimating`, `parseIncompleteMarkdown`, and `className`. Safety/plugin defaults cannot be overridden through its public props. HTML and images are suppressed; unsafe link schemes are rejected; Mermaid configuration, links, custom styling, and external content are rejected with a source fallback. KaTeX keeps its default untrusted mode. Never bypass this wrapper for untrusted meeting content.

## Checks

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

The design tests verify palette enforcement, contrast of intended text/control pairs, URL handling, and rejected Mermaid directives. Browser verification covers layout at desktop/mobile widths, keyboard tabs, copy feedback, dialog focus restoration, and progressive sample rendering. The sample stream is explicitly simulated and sends no inference request.

## Implementation references

- [Vercel AI Elements Message](https://elements.ai-sdk.dev/components/message)
- [shadcn/ui](https://ui.shadcn.com/docs/installation/next)
- [Google Search starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [MDN microphone permissions](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
