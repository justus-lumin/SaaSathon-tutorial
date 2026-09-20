# Brand and design-system brief

Status: preparation for the next phase, not a finished brand. “Meeting Recorder” is the working name. No name, logo, font, palette, or domain is final.

## Product character

Simple, robust, fast, and sleek. A useful recording tool that stays out of the way. The interface should feel calm and predictable, with the recording state obvious and the saved content easy to read.

Audience assumption: individuals who want a record of a conversation without adopting a complex meeting platform. Confirm this during brand work rather than inventing a narrow customer persona.

The product promise is concrete: record a meeting, keep the audio, read the transcript, and review a short summary. Avoid claims of perfect transcription, automatic attendance, or universal call capture.

## Direction to explore

Start with a restrained, typography-led interface: quiet neutral surfaces, strong readable text, one accent, and a distinct recording/error treatment. A simple wordmark may be sufficient. Any symbol must stay legible at favicon size and should not crowd the controls.

Prefer one strong direction with a small variation if needed. Avoid decorative dashboards, gradients, animated waveforms without purpose, large icon inventories, and generic AI motifs. The primary experience is a recording control plus a list of meetings.

## Decisions and deliverables for the design phase

| Area | Deliverable |
| --- | --- |
| Name and identity | Confirm name; wordmark direction, small-size treatment, favicon, clearspace |
| Typography | UI/body face, optional display face, fallbacks, weights, sizes, line heights |
| Color | Concrete semantic color values and verified text/control contrast |
| Layout | Page widths, reading measure, spacing scale, responsive behavior |
| Components | shadcn/ui variants for buttons, lists, tabs, alerts, dialogs, skeletons, and menus |
| Interaction | Focus, disabled/loading states, recording indicator, restrained motion |
| Voice | Final labels, empty states, errors, and landing-page copy direction |
| Screen examples | Landing page, recorder/history, and meeting detail at desktop/mobile widths |

Design for light mode first as a proposal. Add dark mode only if deliberately included. Target WCAG AA contrast, visible keyboard focus, comfortable touch targets, and reduced-motion support. Never rely on red alone to signal recording or failure.

## shadcn/ui mapping

Use shadcn/ui as the component foundation. Define the approved palette centrally in CSS variables for `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, and `ring`, including their foreground pairs. Add recording/success tokens only where a distinct meaning is needed. Define radii and typography/spacing roles once.

The final token values will live in the app's global theme when it exists; this file will explain their use and point to the canonical location. Do not maintain duplicate token values in multiple docs.

## Required screen states

- Landing: clear promise, one primary CTA, useful product proof, readable limitations.
- Recorder/history: idle, permission request, recording, interrupted, uploading, empty history, and saved meetings.
- Detail: queued, transcribing, summarizing, ready, transcript available but summary failed, playback error, and deleting.

Keep the recording control in a stable position across state changes. Status changes need text announcements without announcing every timer tick. History should be a simple list, not a collection of oversized cards. Long transcripts need readable line lengths and clear headings.

## Working copy examples

| Use | Draft |
| --- | --- |
| Login | Continue with Google |
| Record | Start recording |
| Stop | Stop recording |
| Empty history | Your meetings will appear here. |
| Upload | Saving your recording… |
| Saved and queued | Recording saved. Preparing your transcript. |
| Summary failure | Your transcript is ready. We couldn't create the summary. Try again. |
| Permission failure | Microphone access is blocked. Allow access in your browser and try again. |

The next phase should produce visual examples and exact usable tokens, not just a mood board. App implementation remains a separate step.
