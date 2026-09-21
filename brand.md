# Meeting Recorder brand

Selected direction: **01 / Soft Wave**, chosen by Justus on 21 September 2026.

A quiet, simple meeting recorder. Black, white, and neutral greys only. Rounded shapes, smooth controls, generous space.

## Assets

- [Selected logo](assets/brand/meeting-recorder-logo.png): generated raster concept with transparent background. Three rounded vertical bars plus the “Meeting Recorder” wordmark. Use on white or very pale grey.
- [Visual overview](assets/brand/brand-overview.png): generated visual reference for the selected direction.
- [All explored directions](output/brand-concepts/): five logo concepts and their overview boards.

The image lettering is generated artwork. Nunito Sans is the proposed interface font, not a verified identification of the wordmark. The overview is a visual reference; use the exact specifications below for implementation. Vector artwork and small-size production validation remain to be done.

## Implemented defaults

The canonical palette, font, radii, semantic roles, spacing, page widths, motion, and 12-column layout variables live in [`src/app/tokens.css`](src/app/tokens.css). Use that file as the source of truth; do not duplicate its values elsewhere.

- Only ink, grey, line, paper, and white. Errors and recording states use labels and icons, never a new color.
- Nunito Sans is served locally. The website redraws the three-capsule icon as a scalable SVG in [`Brand`](src/components/brand.tsx) and pairs it with a typographic wordmark. The generated logo is the visual reference, not an exact font source.
- Public pages use one shared 12-column grid, consistent section spacing, short copy, and generous negative space. Compact layouts preserve the spacing rhythm without horizontal overflow.
- Shared shadcn-style Radix primitives live in `src/components/ui`. Assistant responses use the customized AI Elements primitives in `src/components/ai-elements/message.tsx`.
- `/design-system` demonstrates controls, keyboard-accessible dialogs/tabs, empty/loading/error states, and simulated streaming Markdown with tables, code, math, and diagrams.
- `AGENTS.md` defines the implementation contract. `npm run check:design` rejects hard-coded colors, alternative Tailwind palettes, and arbitrary color/radius overrides; it runs through lint.

The sparse website and live component gallery supersede the denser generated overview board for layout decisions.

## Logo use

Keep the icon to the left of the wordmark. Preserve proportions and leave at least one icon width of clear space around the lockup. Target a minimum icon height of 24 px, subject to production validation. On narrow screens, use a separately prepared icon asset rather than shrinking the wordmark until unreadable. A white reverse logo will be needed for dark backgrounds; do not place this dark PNG directly on black.

## Product language

Plain, concise, useful. Use “New recording”, “Stop recording”, “Summary”, and “Transcript”. Empty state: “No meetings yet. Start your first recording.” Error: “Recording couldn't start. Check your microphone access and try again.” Show recording state with a black dot and the word “Recording”.

## Implementation status

The shared theme, public landing page, five guides, sample meeting, and component gallery are implemented. Private recording and backend work is coordinated in a separate task. Design checks do not prove deployed recording, authentication, or inference behavior.

## shadcn/ui mapping

Use shadcn/ui as the component foundation and Vercel AI Elements for ChatGPT-style response components. This means familiar response rendering and actions, not ChatGPT branding or an added chat product. Streamdown handles rich Markdown. Define the approved palette centrally in CSS variables for `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, and `ring`, including their foreground pairs. Add recording/success tokens only where a distinct meaning is needed. Define radii and typography/spacing roles once.

The values are now defined centrally in `src/app/tokens.css` and applied globally by `src/app/globals.css`. Do not maintain duplicate token values in multiple docs.

## Required screen states

- Landing: clear promise, one primary CTA, useful product proof, readable limitations.
- Recorder/history: idle, permission request, recording, interrupted, uploading, empty history, and saved meetings.
- Detail: queued, transcribing, summarizing, ready, transcript available but summary failed, playback error, and deleting.

Keep the recording control in a stable position across state changes. Status changes need text announcements without announcing every timer tick. History should be a simple list, not a collection of oversized cards. Long transcripts need readable line lengths and clear headings.
