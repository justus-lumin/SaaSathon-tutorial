import type { MetadataRoute } from "next";
import { publicIndexing, siteUrl } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  return publicIndexing
    ? {
        rules: [{ userAgent: "*", allow: "/" }],
        sitemap: `${siteUrl}/sitemap.xml`,
      }
    : { rules: [{ userAgent: "*", disallow: "/" }] };
}
