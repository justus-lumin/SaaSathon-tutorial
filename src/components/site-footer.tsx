import Link from "next/link";
import { Brand } from "@/components/brand";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell">
        <div className="footer-grid">
          <Brand />
          <nav aria-label="Footer navigation" className="footer-links">
            <Link className="quiet-link" href="/meeting-transcription">
              Transcription
            </Link>
            <Link className="quiet-link" href="/meeting-summary">
              Summaries
            </Link>
            <Link className="quiet-link" href="/guides">
              Guides
            </Link>
            <Link className="quiet-link" href="/design-system">
              Design system
            </Link>
          </nav>
        </div>
        <p className="footer-note">
          A little less to remember. · Product preview
        </p>
      </div>
    </footer>
  );
}
