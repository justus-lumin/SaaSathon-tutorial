import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MeetingPreview } from "@/components/meeting-preview";
export const metadata: Metadata = {
  title: "Sample meeting",
  robots: { index: false, follow: false },
};
export default function Demo() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="page-shell section-space">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-muted-foreground mb-6">
            An interactive example
          </p>
          <h1 className="section-title">Meet your meeting notes.</h1>
          <p className="mt-6 mb-12 text-muted-foreground">
            Switch views. Copy the useful parts. All content is fictional; no
            audio is recorded or uploaded.
          </p>
          <div className="rounded-xl bg-muted p-3 sm:p-8">
            <MeetingPreview expanded />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
