import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { type Guide, getGuide } from "@/content/guides";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
export function GuidePage({ guide }: { guide: Guide }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="page-shell grid-12">
        <header className="article-header">
          <Link className="eyebrow quiet-link" href="/guides">
            Guides / {guide.category}
          </Link>
          <h1>{guide.title}</h1>
          <p>{guide.intro}</p>
        </header>
        <article className="article-body">
          {guide.sections.map((section) => (
            <section className="article-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {section.sample && (
                <div className="sample-block whitespace-pre-line text-sm leading-7">
                  {section.sample}
                </div>
              )}
              {section.items &&
                (section.ordered ? (
                  <ol>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                ) : (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ))}
            </section>
          ))}
          {guide.source && (
            <p className="mt-12 text-sm">
              <a
                className="underline underline-offset-4"
                href={guide.source.url}
                rel="noreferrer"
              >
                {guide.source.label}
              </a>
            </p>
          )}
          <section className="mt-16 border-t border-border pt-12">
            <h2 className="text-2xl font-semibold tracking-tight">
              See a simple example.
            </h2>
            <p className="mt-4 mb-6 text-muted-foreground">
              A fictional meeting, with the words and the useful parts together.
            </p>
            <Button asChild>
              <Link href="/demo">
                Explore the demo
                <ArrowRight />
              </Link>
            </Button>
          </section>
          <nav className="mt-16" aria-label="Related guides">
            <p className="eyebrow text-muted-foreground">Keep reading</p>
            {guide.related.map((slug) => {
              const related = getGuide(slug);
              return related ? (
                <Link href={`/${slug}`} className="guide-link" key={slug}>
                  {related.title}
                  <ArrowRight className="size-4" />
                </Link>
              ) : null;
            })}
          </nav>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
