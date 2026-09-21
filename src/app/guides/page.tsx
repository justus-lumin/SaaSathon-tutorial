import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { guides } from "@/content/guides";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Guides for better meeting notes",
  "Practical guides to recording preparation, meeting transcripts, summaries, minutes, and clear action items.",
  "/guides",
);
export default function Guides() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="page-shell grid-12">
        <header className="article-header">
          <p className="eyebrow text-muted-foreground">A small reading list</p>
          <h1>
            Better meetings.
            <br />
            Useful notes.
          </h1>
          <p>Five practical guides to keeping the parts that matter.</p>
        </header>
        <div className="article-body">
          {guides.map((guide) => (
            <Link
              className="guide-link"
              href={`/${guide.slug}`}
              key={guide.slug}
            >
              <div>
                <p className="eyebrow text-muted-foreground mb-3">
                  {guide.category}
                </p>
                <h2 className="text-xl font-semibold tracking-tight">
                  {guide.title}
                </h2>
              </div>
              <ArrowUpRight className="size-5" />
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
