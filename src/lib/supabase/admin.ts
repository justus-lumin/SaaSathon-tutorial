import "server-only";
import { createClient } from "@supabase/supabase-js";
export function adminSupabase(signal?: AbortSignal) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Server storage is not configured.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          signal: AbortSignal.any([
            AbortSignal.timeout(30000),
            ...(signal ? [signal] : []),
            ...(init?.signal ? [init.signal] : []),
          ]),
        }),
    },
  });
}
export function processingConfigured() {
  return Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.OPENROUTER_API_KEY &&
      process.env.WORKER_SECRET,
  );
}
