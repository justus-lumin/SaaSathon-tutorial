import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { publicSupabaseConfig } from "@/lib/supabase/config";
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <LoginForm
      configured={Boolean(publicSupabaseConfig())}
      callbackFailed={Boolean(error)}
    />
  );
}
