import { authenticated, json, route } from "@/lib/server/http";
export const POST = route(async (request) => {
  const { supabase } = await authenticated(request);
  await supabase.auth.signOut();
  return json({ ok: true });
});
