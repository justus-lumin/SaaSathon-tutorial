import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import ffmpeg from "ffmpeg-static";
import { segmentPlan } from "./processing";
const require = createRequire(import.meta.url);
const probe = require("ffprobe-static") as { path: string };
function run(
  binary: string,
  args: string[],
  signal: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, {
      signal,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += String(chunk);
    });
    // Drain stderr without logging private filenames/provider content.
    child.stderr.on("data", () => {});
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0
        ? resolve(output)
        : reject(
            Object.assign(new Error("Invalid audio"), {
              code: "INVALID_AUDIO",
            }),
          ),
    );
  });
}
export async function prepareAudio(file: string, signal: AbortSignal) {
  const size = (await stat(file)).size;
  if (size > 50 * 1024 * 1024 || size === 0)
    throw Object.assign(new Error("Size limit"), { code: "TOO_LONG" });
  // MediaRecorder WebM streams often omit duration metadata. Decode once to a
  // bounded, seekable file so both validation and chunking use actual audio.
  const binary = process.env.FFMPEG_PATH || ffmpeg;
  if (!binary) throw new Error("FFmpeg binary is unavailable.");
  const normalized = path.join(path.dirname(file), "normalized.mp3");
  await run(
    binary,
    [
      "-nostdin",
      "-y",
      "-v",
      "error",
      "-i",
      file,
      "-map",
      "0:a:0",
      "-t",
      "3611",
      "-vn",
      "-ac",
      "1",
      "-ar",
      "16000",
      "-c:a",
      "libmp3lame",
      "-b:a",
      "48k",
      normalized,
    ],
    signal,
  );
  const output = await run(
    process.env.FFPROBE_PATH || probe.path,
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration:stream=codec_type",
      "-of",
      "json",
      normalized,
    ],
    signal,
  );
  const metadata = JSON.parse(output);
  const duration = Number(metadata.format?.duration);
  if (
    !metadata.streams?.some(
      (s: { codec_type: string }) => s.codec_type === "audio",
    ) ||
    !Number.isFinite(duration) ||
    duration <= 0
  )
    throw Object.assign(new Error("Invalid audio"), { code: "INVALID_AUDIO" });
  if (duration > 3610)
    throw Object.assign(new Error("Duration limit"), { code: "TOO_LONG" });
  return { duration, source: normalized, segments: segmentPlan(duration) };
}
export async function extractSegment(
  file: string,
  start: number,
  end: number,
  index: number,
  signal: AbortSignal,
) {
  const binary = process.env.FFMPEG_PATH || ffmpeg;
  if (!binary) throw new Error("FFmpeg binary is unavailable.");
  const target = path.join(path.dirname(file), `segment-${index}.mp3`);
  await run(
    binary,
    [
      "-nostdin",
      "-y",
      "-v",
      "error",
      "-ss",
      String(start),
      "-i",
      file,
      "-t",
      String(end - start),
      "-vn",
      "-ac",
      "1",
      "-ar",
      "16000",
      "-c:a",
      "libmp3lame",
      "-b:a",
      "48k",
      target,
    ],
    signal,
  );
  return readFile(target);
}
