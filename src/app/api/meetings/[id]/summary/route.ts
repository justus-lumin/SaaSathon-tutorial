import { dbError, json, ownedMeeting, route } from "@/lib/server/http";
export const GET = route(async (request) => {
  const { meeting, supabase } = await ownedMeeting(
    new URL(request.url).pathname.split("/").at(-2)!,
  );
  const { data, error } = await supabase
    .from("meeting_summary_streams")
    .select("*")
    .eq("meeting_id", meeting.id)
    .maybeSingle();
  dbError(error);
  return json(data);
});
