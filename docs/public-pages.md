# Landing page and SEO pages

## Landing page

Route: `/`. Intent: find a simple website for recording a meeting and reviewing the transcript and summary.

Proposed order: a direct headline, one sentence explaining the product, Google sign-in CTA, a real product screenshot when available, the three-step record/stop/review flow, a small example summary, supported audio/browser details, and privacy/retention links. Returning users go to their meetings.

Working headline: “Record your meeting. Keep the useful parts.” Supporting copy: “Save the audio, read the full transcript, and get a short summary when you're done.” Final wording follows the brand phase and actual capture support.

Do not invent testimonials, customer logos, accuracy numbers, free/unlimited claims, or Zoom/Meet/Teams integrations. Explain what audio is actually captured before someone begins.

## Initial SEO page briefs

These are intent hypotheses, not keyword-volume findings. Write a few substantive pages after the product works.

| Proposed route | Intent and distinct content | Internal links |
| --- | --- | --- |
| `/meeting-transcription` | Understand how recording becomes text; show a real consented example, formatting, accuracy limitations, and supported languages | Home, summary page, recording guide |
| `/meeting-summary` | See useful meeting notes; show decisions/action items derived from a sample transcript and explain what is omitted | Transcription page, home |
| `/guides/record-a-meeting-in-your-browser` | Practical steps for permissions, input selection, saving, and common failures; accurately explain remote-call audio limitations | Home and both feature pages |

Each page needs its own useful answer and CTA. Do not generate dozens of near-identical use-case pages. Keep marketing content in source-controlled Markdown or local components; a CMS is unnecessary initially. Sample meeting content must be synthetic or explicitly approved for public use.

## Implementation and verification

Render public text and links on the server. Give each page a distinct title, description, H1, canonical URL, and social metadata. Include public canonical pages in a sitemap and link them from useful navigation. Use descriptive links and accurate screenshots. Add structured data only when it matches visible supported content. [Google SEO guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

Keep `/app`, login/callback pages, private API responses, and previews out of indexing. Authentication and RLS protect content; `noindex` is an additional indexing instruction, not access control. Do not rely on robots.txt to hide private material. [Google noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

Create honest privacy and terms pages before public launch. Avoid putting signed audio URLs or private document text into metadata, analytics, public caches, or sitemaps.

After deployment, verify rendered HTML, status codes, links, canonical metadata, noindex behavior, and mobile performance. Configure Search Console for the chosen domain and inspect submitted URLs. Measure impressions, clicks, and sign-in conversions with minimal non-content events. No ranking, indexing, or conversion results are claimed at this stage.
