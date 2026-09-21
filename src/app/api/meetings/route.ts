import { z } from "zod";
import { authenticated, dbError, json, route } from "@/lib/server/http";
import { audioExtension } from "@/features/meetings/types";
const metadata =
  "id,user_id,title,status,audio_path,audio_mime_type,audio_bytes,duration_seconds,interrupted,error_message,failure_stage,created_at,updated_at,completed_at";
export const GET = route(async (request) => {
  const { supabase } = await authenticated();
  const cursor = new URL(request.url).searchParams.get("cursor");
  let query = supabase
    .from("meetings")
    .select(metadata)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(21);
  if (cursor) {
    const decoded = z
      .object({ at: z.string().datetime(), id: z.string().uuid() })
      .parse(JSON.parse(Buffer.from(cursor, "base64url").toString()));
    query = query.or(
      `created_at.lt.${decoded.at},and(created_at.eq.${decoded.at},id.lt.${decoded.id})`,
    );
  }
  const { data, error } = await query;
  dbError(error);
  const meetings = (data || []).slice(0, 20);
  const last = meetings.at(-1);
  return json({
    meetings,
    nextCursor:
      data && data.length > 20 && last
        ? Buffer.from(
            JSON.stringify({ at: last.created_at, id: last.id }),
          ).toString("base64url")
        : null,
  });
});
export const POST = route(async (request) => {
  const { supabase } = await authenticated(request);
  const body = z
    .object({
      requestId: z.string().uuid(),
      title: z.string().trim().min(1).max(160),
      mime: z.enum(["audio/webm", "video/webm", "audio/mp4", "audio/ogg"]),
    })
    .parse(await request.json());
  const { data, error } = await supabase.rpc("create_meeting", {
    p_request_id: body.requestId,
    p_title: body.title,
    p_mime: body.mime,
    p_extension: audioExtension(body.mime),
  });
  dbError(error);
  return json(data, 201);
});
