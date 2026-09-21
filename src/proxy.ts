import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
export const proxy = (request: NextRequest) => updateSession(request);
export const config = {
  matcher: [
    "/app/:path*",
    "/api/meetings/:path*",
    "/api/account",
    "/login",
    "/auth/:path*",
  ],
};
