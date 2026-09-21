import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
export function SiteHeader() {
  return (
    <header className="page-shell site-header">
      <Brand />
      <nav aria-label="Main navigation" className="header-nav">
        <Link className="quiet-link desktop-link" href="/#how-it-works">
          How it works
        </Link>
        <Link className="quiet-link desktop-link" href="/guides">
          Guides
        </Link>
        <Button asChild size="sm">
          <Link href="/login">Open app</Link>
        </Button>
      </nav>
    </header>
  );
}
