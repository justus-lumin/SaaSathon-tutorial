import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { tsImport } from "tsx/esm/api";
import { checkSource, checkDesign } from "../scripts/check-design.mjs";
const { safeMarkdownUrl, assertSafeDiagram } = await tsImport(
  "../src/lib/markdown-safety.ts",
  import.meta.url,
);
test("design guard rejects hard-coded hues and alternative neutral palettes", () => {
  for (const bad of [
    'className="bg-blue-500"',
    'className="text-zinc-900"',
    "color: #000000",
    "background: rgb(0,0,0)",
    "fill: red",
    'className="rounded-[12px]"',
  ])
    assert.ok(checkSource(bad, "src/test.tsx").length, bad);
  assert.deepEqual(
    checkSource(
      'className="bg-primary text-primary-foreground rounded-lg"',
      "src/test.tsx",
    ),
    [],
  );
  assert.deepEqual(checkDesign(), []);
});
test("approved text and interactive boundary pairs meet their contrast thresholds", () => {
  const tokens = readFileSync("src/app/tokens.css", "utf8");
  function color(name) {
    const value = tokens.match(new RegExp(`--${name}: (#[0-9a-f]+)`, "i"))[1];
    return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  }
  const lum = (c) =>
    c
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((n, v, i) => n + v * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (a, b) => {
    const l = [lum(color(a)), lum(color(b))].sort((x, y) => y - x);
    return (l[0] + 0.05) / (l[1] + 0.05);
  };
  assert.ok(ratio("ink", "white") >= 4.5);
  assert.ok(ratio("gray", "white") >= 4.5);
  assert.ok(ratio("ink", "paper") >= 4.5);
  assert.ok(ratio("gray", "paper") >= 3);
});
test("Markdown links cannot execute code, load data URLs, or use protocol-relative hosts", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,hi",
    "//tracking.example",
    "\\\\tracking.example",
    "/\\tracking.example",
    "\nhttps://example.com",
  ])
    assert.equal(safeMarkdownUrl(url), "", url);
  for (const url of [
    "https://example.com",
    "http://example.com",
    "mailto:hello@example.com",
    "/guides",
    "#next-steps",
  ])
    assert.equal(safeMarkdownUrl(url), url);
});
test("Mermaid rejects configuration, external content, clicks, and custom colors", () => {
  for (const input of [
    '%%{init: {securityLevel: "loose"}}%%',
    'flowchart LR\nclick A "https://example.com"',
    "---\nconfig: {}\n---",
    "flowchart LR\nclassDef x fill:red",
    "flowchart LR\nA[<img src=x>]",
  ])
    assert.throws(() => assertSafeDiagram(input));
  assert.doesNotThrow(() =>
    assertSafeDiagram(
      "flowchart LR\n A[Record] --> B[Transcribe] --> C[Summarize]",
    ),
  );
});

test("the actual response renderer suppresses executable HTML and remote images", async () => {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { MessageResponse } = await tsImport(
    "../src/components/ai-elements/message.tsx",
    import.meta.url,
  );
  const html = renderToStaticMarkup(
    createElement(MessageResponse, {
      children:
        "<script>alert(1)</script>\n\n![tracker](https://tracking.example/pixel)\n\n[bad](javascript:alert%281%29)\n\n[good](https://example.com)",
      mode: "static",
    }),
  );
  assert.doesNotMatch(html, /<script|<img|href="javascript:/i);
  assert.match(html, /data-streamdown="link"[^>]*>good<\/button>/);
  for (const children of [
    "**part",
    "```js\nconst x =",
    "| Name |\n| --- |\n| Al",
    "$t = 2",
  ]) {
    assert.doesNotThrow(() =>
      renderToStaticMarkup(
        createElement(MessageResponse, {
          children,
          mode: "streaming",
          isAnimating: true,
        }),
      ),
    );
  }
});
