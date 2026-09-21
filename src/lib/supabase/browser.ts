"use client";
import { createClient } from "./client";
import { publicSupabaseConfig } from "./config";
export function browserSupabase() {
  if (!publicSupabaseConfig())
    throw new Error("Supabase is not configured yet.");
  // createBrowserClient reuses its browser singleton; server clients stay per-request.
  return createClient();
}
