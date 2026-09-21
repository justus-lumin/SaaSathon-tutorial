import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import {
  SUMMARY_INSTRUCTIONS,
  SUMMARY_MODEL,
  SUMMARY_ROUTING,
} from "./processing";
export async function transcribe(bytes: Blob, signal: AbortSignal) {
  const model =
    process.env.OPENROUTER_TRANSCRIPTION_MODEL ||
    "openai/whisper-large-v3-turbo";
  const form = new FormData();
  form.set("model", model);
  form.set("file", bytes, "meeting.mp3");
  form.set("response_format", "json");
  const response = await fetch(
    "https://openrouter.ai/api/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      body: form,
      signal: AbortSignal.any([signal, AbortSignal.timeout(45000)]),
    },
  );
  if (!response.ok)
    throw Object.assign(new Error("Transcription failed"), {
      status: response.status,
    });
  const data = await response.json();
  if (typeof data.text !== "string") throw new Error("No transcript returned.");
  return { text: data.text.trim(), model, usage: data.usage || null };
}
export function summaryStream(
  transcript: string,
  signal: AbortSignal,
  customFetch?: typeof fetch,
) {
  const client = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    ...(customFetch ? { fetch: customFetch } : {}),
  });
  // Pin the chosen model and pass routing to the provider, not AI SDK's generic options.
  return streamText({
    model: client(process.env.OPENROUTER_SUMMARY_MODEL || SUMMARY_MODEL, {
      provider: SUMMARY_ROUTING,
      reasoning: { effort: "minimal", exclude: true },
    }),
    system: SUMMARY_INSTRUCTIONS,
    prompt: `<meeting_transcript>\n${transcript}\n</meeting_transcript>`,
    maxOutputTokens: 8192,
    maxRetries: 0,
    abortSignal: signal,
  });
}
