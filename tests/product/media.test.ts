import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpeg from "ffmpeg-static";
import { prepareAudio, extractSegment } from "../../src/lib/server/media";
test("durationless browser WebM is normalized and split into readable audio", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "meeting-media-test-"));
  try {
    const source = path.join(dir, "browser.webm");
    execFileSync(ffmpeg!, [
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:duration=2",
      "-c:a",
      "libopus",
      "-live",
      "1",
      source,
    ]);
    const result = await prepareAudio(source, AbortSignal.timeout(10000));
    assert.ok(result.duration >= 2 && result.duration < 2.2);
    const bytes = await extractSegment(
      result.source,
      0,
      result.duration,
      0,
      AbortSignal.timeout(10000),
    );
    assert.ok(bytes.length > 1000);
    const invalid = path.join(dir, "invalid.webm");
    await writeFile(invalid, "not audio");
    await assert.rejects(prepareAudio(invalid, AbortSignal.timeout(10000)), {
      code: "INVALID_AUDIO",
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
