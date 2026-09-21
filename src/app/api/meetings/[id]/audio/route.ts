import { ApiError, json, ownedMeeting, route } from "@/lib/server/http";
import { BUCKET } from "@/features/meetings/types";
export const GET = route(async (request) => {
  const { meeting, supabase } = await ownedMeeting(
    new URL(request.url).pathname.split("/").at(-2)!,
  );
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(meeting.audio_path, 300);
  if (error || !data)
    throw new ApiError(
      404,
      "AUDIO_UNAVAILABLE",
      "The recording is not available yet.",
    );
  return json({ url: data.signedUrl });
});
