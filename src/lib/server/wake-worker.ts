import "server-only";
import { after } from "next/server";
import { processingConfigured } from "@/lib/supabase/admin";
// Durable jobs are already saved. This best-effort invocation improves latency;
// the database schedule guarantees another attempt if the request/deploy ends.
export function wakeWorker() {
  if (!processingConfigured()) return;
  after(async () => {
    const { processJobs } = await import("./worker");
    await processJobs();
  });
}
