import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  serverExternalPackages: ["ffmpeg-static", "ffprobe-static"],
  outputFileTracingIncludes: {
    "/api/internal/process": [
      "./node_modules/ffmpeg-static/ffmpeg",
      "./node_modules/ffprobe-static/bin/linux/x64/ffprobe",
    ],
    "/api/meetings/*/finalize": [
      "./node_modules/ffmpeg-static/ffmpeg",
      "./node_modules/ffprobe-static/bin/linux/x64/ffprobe",
    ],
    "/api/meetings/*/retry": [
      "./node_modules/ffmpeg-static/ffmpeg",
      "./node_modules/ffprobe-static/bin/linux/x64/ffprobe",
    ],
  },
};
export default nextConfig;
