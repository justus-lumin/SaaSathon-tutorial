import { z } from "zod";
import {
  authenticated,
  dbError,
  json,
  ownedMeeting,
  route,
  uuid,
} from "@/lib/server/http";
function id(request: Request) {
  return uuid.parse(new URL(request.url).pathname.split("/").at(-1));
}
export const GET = route(async (request) =>
  json((await ownedMeeting(id(request))).meeting),
);
export const PATCH = route(async (request) => {
  const { supabase } = await authenticated(request);
  const body = z
    .object({ title: z.string().trim().min(1).max(160) })
    .parse(await request.json());
  const { error } = await supabase.rpc("rename_meeting", {
    p_id: id(request),
    p_title: body.title,
  });
  dbError(error);
  return json({ ok: true });
});
export const DELETE = route(async (request) => {
  const { supabase } = await authenticated(request);
  const { error } = await supabase.rpc("delete_meeting", { p_id: id(request) });
  dbError(error);
  return json({ ok: true }, 202);
});
