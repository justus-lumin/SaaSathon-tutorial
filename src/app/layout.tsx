import type { Metadata } from "next";
import { siteUrl, publicIndexing } from "@/lib/site";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Meeting Recorder | A little less to remember",
    template: "%s | Meeting Recorder",
  },
  description:
    "A simple home for meeting recordings, transcripts, and useful summaries. Explore the Meeting Recorder preview.",
  robots: publicIndexing
    ? { index: true, follow: true }
    : { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
