# Meeting Recorder implementation rules

Read `brand.md` before changing UI. The selected brand is Soft Wave; do not invent another theme.

## Shared defaults

- Canonical design tokens live in `src/app/tokens.css`. Use semantic Tailwind classes (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`) and shared components from `src/components/ui`.
- Black, white, and the approved neutral greys only. This includes errors, recording indicators, charts, syntax highlighting, diagrams, and third-party components. Do not add a dark theme or chromatic status colors.
- No raw HEX/RGB/HSL colors, Tailwind named-color palettes, or arbitrary color/radius classes in app code. `npm run check:design` enforces common violations; keep it in lint and CI. New UI must pass it.
- Use Nunito Sans through the global font. Do not import another font or override the interface font.
- Use `page-shell`, `grid-12`, `section-space`, and the existing spacing tokens for public pages. Desktop sections have 12 equal columns, 24 px gutters, and 128 px vertical padding; compact screens use 16 px gutters and 80 px section padding. Use the 4 px spacing base, primarily in 8 px increments.
- Negative space is a feature. Prefer one headline, short supporting copy, and a single primary action. Avoid nested cards, dense grids of features, decorative shadows, and gradients.
- Use shared Button, Tabs, Dialog, Input and other primitives. Keep visible keyboard focus and at least 44 px interactive targets. States need labels and icons, never color alone.
- Assistant documents must use `src/components/ai-elements/message.tsx`. Its Streamdown security defaults and monochrome plugin styles are part of the component contract. Do not bypass them with direct Markdown rendering, executable MDX, raw HTML, remote images, or custom Mermaid config.
- `/design-system` is the live component reference. Update it when introducing a reusable component or state.

## Work and verification

- Preserve unrelated work in this shared checkout; stage only owned files. Do not touch any Lumin production repository.
- Run typecheck, lint (including design checks), relevant tests, and a production build. Verify interactive changes in a claimed Helium tab, including a narrow viewport. Do not use Computer Use or standalone browser launches to bypass tab claiming.
- Preview routes remain noindex. Public indexing requires a production deployment and a configured canonical site URL. Do not invent production URLs or claims about private-product behavior.
- Never add fake testimonials, customer logos, accuracy metrics, or unsupported integration claims. SEO guides need distinct, useful content. All demo meeting content is fictional and labelled.
