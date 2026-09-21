import { authenticated, dbError, json, route, uuid } from "@/lib/server/http";
import { wakeWorker } from "@/lib/server/wake-worker";
export const runtime = "nodejs";
export const maxDuration = 300;
export const POST = route(async (request) => {
  const { supabase } = await authenticated(request);
  const id = uuid.parse(new URL(request.url).pathname.split("/").at(-2));
  const { error } = await supabase.rpc("retry_meeting", { p_id: id });
  dbError(error);
  wakeWorker();
  return json({ ok: true }, 202);
});
