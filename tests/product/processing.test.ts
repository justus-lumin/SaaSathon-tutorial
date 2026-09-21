import { test } from "node:test";
import assert from "node:assert/strict";
import {
  segmentPlan,
  joinTranscripts,
  safeProcessingError,
} from "../../src/lib/server/processing";
import { summaryStream } from "../../src/lib/server/inference";

test("one-hour segmentation has no gaps and only one second of overlap", () => {
  const plan = segmentPlan(3600);
  assert.equal(plan.length, 12);
  assert.equal(plan[0].start, 0);
  assert.equal(plan.at(-1)?.end, 3600);
  for (let i = 1; i < plan.length; i++)
    assert.equal(plan[i].start, plan[i - 1].end - 1);
  for (const duration of [0, -1, NaN, Infinity, 3611])
    assert.throws(() => segmentPlan(duration));
});
test("transcript boundaries remove only matching multi-word overlap", () => {
  assert.equal(
    joinTranscripts([
      "We will ship on Friday.",
      "on Friday. Justus will review.",
    ]),
    "We will ship on Friday.\n\nJustus will review.",
  );
  assert.equal(
    joinTranscripts(["Yes.", "Yes. I agree."]),
    "Yes.\n\nYes. I agree.",
  );
  assert.equal(joinTranscripts(["", "   ", "Actual text."]), "Actual text.");
});
test("processing failures do not reveal raw provider data", () => {
  assert.equal(
    safeProcessingError({ status: 429, message: "private content" }).retryable,
    true,
  );
  assert.equal(
    safeProcessingError({ status: 401, message: "secret api key" }).retryable,
    false,
  );
  assert.ok(
    !safeProcessingError(new Error("private transcript")).message.includes(
      "private transcript",
    ),
  );
});
test("GLM summary request uses throughput routing and streams Markdown", async () => {
  let payload: Record<string, unknown> | undefined;
  const mockFetch: typeof fetch = async (_url, init) => {
    payload = JSON.parse(String(init?.body));
    const chunks = [
      {
        id: "test",
        object: "chat.completion.chunk",
        created: 1,
        model: "z-ai/glm-5.3-flash",
        choices: [
          {
            index: 0,
            delta: { role: "assistant", content: "## Overview\n" },
            finish_reason: null,
          },
        ],
      },
      {
        id: "test",
        object: "chat.completion.chunk",
        created: 1,
        model: "z-ai/glm-5.3-flash",
        choices: [
          {
            index: 0,
            delta: { content: "A short meeting." },
            finish_reason: null,
          },
        ],
      },
      {
        id: "test",
        object: "chat.completion.chunk",
        created: 1,
        model: "z-ai/glm-5.3-flash",
        choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
      },
    ];
    return new Response(
      chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") +
        "data: [DONE]\n\n",
      { headers: { "Content-Type": "text/event-stream" } },
    );
  };
  const previous = process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_API_KEY = "test-only";
  try {
    const stream = summaryStream(
      "We discussed the launch.",
      new AbortController().signal,
      mockFetch,
    );
    let text = "";
    for await (const chunk of stream.textStream) text += chunk;
    assert.equal(text, "## Overview\nA short meeting.");
    assert.equal(await stream.finishReason, "stop");
    assert.equal(payload?.model, "z-ai/glm-5.3-flash");
    assert.deepEqual(payload?.provider, {
      sort: "throughput",
      allow_fallbacks: true,
    });
    assert.equal(payload?.stream, true);
  } finally {
    if (previous === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = previous;
  }
});
