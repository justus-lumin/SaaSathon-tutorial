import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="page-shell section-space">
        <p className="eyebrow text-muted-foreground mb-6">404</p>
        <h1 className="section-title">Nothing here just yet.</h1>
        <p className="my-8 text-muted-foreground">
          That page couldn’t be found.
        </p>
        <Button asChild>
          <Link href="/">Back to the beginning</Link>
        </Button>
      </main>
    </>
  );
}
