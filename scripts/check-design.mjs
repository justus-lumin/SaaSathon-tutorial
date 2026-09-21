import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
const root = process.cwd();
const source = join(root, "src");
export function checkSource(text, path) {
  const issues = [];
  if (path.endsWith("tokens.css")) return issues;
  const banned = [
    [/#(?:[\da-f]{3,8})\b/gi, "Raw colors belong in src/app/tokens.css"],
    [
      /\b(?:rgb|rgba|hsl|hsla|oklch|oklab|color)\s*\(/gi,
      "Use semantic color variables",
    ],
    [
      /\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|decoration|shadow|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)(?:-\d{2,3})?\b/g,
      "Use the approved semantic palette",
    ],
    [
      /\b(?:bg|text|border|ring|outline|fill|stroke|rounded)-\[(?:#|rgb|hsl|oklch|\d)/gi,
      "Do not override color or radius tokens with arbitrary values",
    ],
    [
      /(?:color|background(?:-color)?|border-color|fill|stroke)\s*:\s*(?:red|blue|green|black|white|gray|grey|orange|purple|pink|yellow)\b/gi,
      "Use semantic color variables",
    ],
  ];
  for (const [pattern, message] of banned) {
    for (const match of text.matchAll(pattern)) {
      issues.push(
        `${path}:${text.slice(0, match.index).split("\n").length}: ${message} (${match[0]})`,
      );
    }
  }
  return issues;
}
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );
}
export function checkDesign() {
  const errors = files(source)
    .filter((p) => /\.(css|tsx|ts)$/.test(p))
    .flatMap((p) => checkSource(readFileSync(p, "utf8"), relative(root, p)));
  const tokens = readFileSync(join(source, "app/tokens.css"), "utf8");
  const palette = [...tokens.matchAll(/#[\da-f]{6}\b/gi)].map((m) =>
    m[0].toUpperCase(),
  );
  if (
    JSON.stringify(palette) !==
    JSON.stringify(["#111111", "#737373", "#D9D9D9", "#F5F5F5", "#FFFFFF"])
  )
    errors.push(
      "tokens.css must contain exactly the five approved palette values.",
    );
  if (!tokens.includes("--color-*: initial"))
    errors.push("The default Tailwind palette must remain disabled.");
  return errors;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const errors = checkDesign();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else console.log("Soft Wave design rules passed.");
}
