import Link from "next/link";
import { cn } from "@/lib/utils";
export function BrandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 40"
      fill="currentColor"
      aria-hidden="true"
      className={cn("brand-icon", className)}
    >
      <rect x="0" y="11" width="10" height="19" rx="5" />
      <rect x="13" y="1" width="10" height="38" rx="5" />
      <rect x="26" y="9" width="10" height="23" rx="5" />
    </svg>
  );
}
export function Brand({ linked = true }: { linked?: boolean }) {
  const content = (
    <>
      <BrandIcon />
      <span>Meeting Recorder</span>
    </>
  );
  return linked ? (
    <Link href="/" aria-label="Meeting Recorder home" className="brand-lockup">
      {content}
    </Link>
  ) : (
    <span className="brand-lockup">{content}</span>
  );
}
