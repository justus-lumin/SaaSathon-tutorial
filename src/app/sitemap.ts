import type { MetadataRoute } from "next";
import { guides } from "@/content/guides";
import { siteUrl, publicIndexing } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return publicIndexing
    ? ["", "/guides", ...guides.map((g) => `/${g.slug}`)].map((path) => ({
        url: `${siteUrl}${path}`,
      }))
    : [];
}
