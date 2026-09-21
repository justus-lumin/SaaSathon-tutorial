import type { Metadata } from "next";
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
export const siteUrl = configuredUrl
  ? new URL(configuredUrl).origin
  : "http://127.0.0.1:3205";
export const publicIndexing = Boolean(
  configuredUrl && process.env.VERCEL_ENV === "production",
);
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website" },
    twitter: { card: "summary", title, description },
  };
}
