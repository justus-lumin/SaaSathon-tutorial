/** Shared policies for untrusted transcript and summary content. */
export function safeMarkdownUrl(url: string): string {
  if (/[\\\x00-\x20]/.test(url)) return "";
  if (/^(https?:\/\/|mailto:)/i.test(url)) return url;
  if (/^\/(?!\/)/.test(url) || /^#[\w-]+$/.test(url)) return url;
  return "";
}
export function assertSafeDiagram(source: string): void {
  // Mermaid allows directives to override global configuration. Do not permit them.
  if (
    /%%\{|^\s*---|\b(?:click|href|callback|style|classDef|linkStyle|image|img)\b|<|https?:|data:|javascript:/im.test(
      source,
    )
  ) {
    throw new Error("This diagram contains unsupported links or styling.");
  }
}
