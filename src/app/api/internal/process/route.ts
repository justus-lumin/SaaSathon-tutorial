import { timingSafeEqual } from "node:crypto";
import { json, route, ApiError } from "@/lib/server/http";
import { processJobs } from "@/lib/server/worker";
export const runtime = "nodejs";
export const maxDuration = 300;
export const POST = route(async (request) => {
  const secret = process.env.WORKER_SECRET;
  const actual = request.headers.get("authorization") || "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const supplied = Buffer.from(actual);
  if (
    !secret ||
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  )
    throw new ApiError(401, "UNAUTHENTICATED", "Unauthorized");
  return json(await processJobs());
});
