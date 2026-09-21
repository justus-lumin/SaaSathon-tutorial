import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { serverSupabase } from "@/lib/supabase/server";
import { publicSupabaseConfig } from "@/lib/supabase/config";
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
export function route(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      if (error instanceof ApiError)
        return json(
          {
            error: {
              code: error.code,
              message: error.message,
              retryable: error.status >= 500 || error.status === 429,
            },
          },
          error.status,
        );
      if (error instanceof z.ZodError || error instanceof SyntaxError)
        return json(
          {
            error: {
              code: "INVALID_REQUEST",
              message: "Please check the request and try again.",
              retryable: false,
            },
          },
          400,
        );
      console.error(
        "api_failure",
        error instanceof Error ? error.name : "unknown",
      );
      return json(
        {
          error: {
            code: "SERVER_ERROR",
            message:
              "Something went wrong. Your saved recording is safe. Please try again.",
            retryable: true,
          },
        },
        500,
      );
    }
  };
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(request.url).origin;
  if (!origin || origin !== expected)
    throw new ApiError(
      403,
      "INVALID_ORIGIN",
      "Please make this request from the app.",
    );
}
export async function authenticated(request?: Request) {
  if (request && !["GET", "HEAD"].includes(request.method))
    checkOrigin(request);
  if (!publicSupabaseConfig())
    throw new ApiError(
      503,
      "NOT_CONFIGURED",
      "Cloud storage is not connected yet. Use local recording for now.",
    );
  const supabase = await serverSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user)
    throw new ApiError(401, "UNAUTHENTICATED", "Please sign in again.");
  return { supabase, user };
}
export const uuid = z.string().uuid();
export async function ownedMeeting(id: string) {
  uuid.parse(id);
  const auth = await authenticated();
  const { data, error } = await auth.supabase
    .from("meetings")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  if (error || !data)
    throw new ApiError(404, "NOT_FOUND", "This meeting could not be found.");
  return { ...auth, meeting: data };
}
export function dbError(error: { message: string } | null) {
  if (!error) return;
  const codes: Record<string, [number, string]> = {
    QUOTA_EXCEEDED: [
      429,
      "You have reached the daily recording or storage limit. Delete older meetings or try again tomorrow.",
    ],
    INVALID_STATE: [409, "This meeting is already being processed."],
    NOT_FOUND: [404, "This meeting could not be found."],
    RETRY_LIMIT: [
      429,
      "This recording has reached its retry limit. Please contact support.",
    ],
  };
  const code = Object.keys(codes).find((key) => error.message.includes(key));
  if (code) throw new ApiError(codes[code][0], code, codes[code][1]);
  throw new Error("Database operation failed.");
}
