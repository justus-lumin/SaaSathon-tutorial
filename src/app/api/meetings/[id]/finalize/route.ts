import { z } from "zod";
import { authenticated, dbError, json, route, uuid } from "@/lib/server/http";
import { wakeWorker } from "@/lib/server/wake-worker";
export const runtime = "nodejs";
export const maxDuration = 300;
export const POST = route(async (request) => {
  const { supabase } = await authenticated(request);
  const id = uuid.parse(new URL(request.url).pathname.split("/").at(-2));
  const body = z
    .object({ interrupted: z.boolean().default(false) })
    .parse(await request.json());
  const { data, error } = await supabase.rpc("finalize_meeting", {
    p_id: id,
    p_interrupted: body.interrupted,
  });
  dbError(error);
  wakeWorker();
  return json(data, 202);
});
