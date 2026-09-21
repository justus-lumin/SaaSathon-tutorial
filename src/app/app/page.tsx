import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { publicSupabaseConfig } from "@/lib/supabase/config";
import { serverSupabase } from "@/lib/supabase/server";
import { processingConfigured } from "@/lib/supabase/admin";
import { Workspace } from "@/features/meetings/workspace";
export const metadata: Metadata = {
  title: "Your meetings",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ local?: string; meeting?: string }>;
}) {
  const params = await searchParams;
  const local = params.local === "1" || !publicSupabaseConfig();
  if (local)
    return (
      <Workspace
        identity={{
          id: "local",
          name: "Local workspace",
          email: null,
          local: true,
          processingReady: false,
        }}
        selectedId={params.meeting || null}
      />
    );
  const supabase = await serverSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return (
    <Workspace
      identity={{
        id: user.id,
        email: user.email || null,
        name: user.user_metadata?.full_name || user.email || "Your workspace",
        local: false,
        processingReady: processingConfigured(),
      }}
      selectedId={params.meeting || null}
    />
  );
}
