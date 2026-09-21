import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { MeetingPreview } from "@/components/meeting-preview";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Meeting Recorder | A little less to remember",
  "Meet Meeting Recorder: a simple place for meeting audio, transcripts, and useful summaries. Explore a sample meeting.",
  "/",
);
const steps = [
  [
    "Record the conversation.",
    "One place to start. One place to stop. Stay with the conversation.",
  ],
  ["Keep the words.", "Return to the transcript when the details matter."],
  [
    "Leave with the next steps.",
    "A short summary brings decisions and action items into focus.",
  ],
];
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="page-shell hero grid-12">
          <div className="hero-copy">
            <p className="eyebrow text-muted-foreground">
              A little less to remember
            </p>
            <h1>
              Be in the meeting.
              <br />
              <span>Keep the useful parts.</span>
            </h1>
            <p className="hero-description">
              Your conversations, transcripts, and next steps.
              <br className="hidden sm:block" /> Together in one quiet place.
            </p>
            <div className="hero-actions">
              <Button asChild size="lg">
                <Link href="/login">
                  Start a meeting
                  <ArrowRight />
                </Link>
              </Button>
              <Link className="quiet-link text-sm font-semibold" href="/demo">
                Explore the demo
              </Link>
            </div>
          </div>
          <div className="preview-stage">
            <MeetingPreview />
          </div>
        </section>
        <section
          id="how-it-works"
          className="page-shell grid-12 section-space border-t border-border"
        >
          <div className="section-kicker">
            <p className="eyebrow text-muted-foreground">The idea is simple</p>
          </div>
          <div className="section-main">
            <h2 className="section-title">
              Less note-taking.
              <br />
              More being there.
            </h2>
            <div className="step-list">
              {steps.map(([title, body], i) => (
                <div className="step" key={title}>
                  <span className="step-number">0{i + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="tinted-section">
          <div className="page-shell grid-12 section-space">
            <div className="section-kicker">
              <p className="eyebrow">Room for what matters</p>
            </div>
            <div className="section-main">
              <h2 className="section-title">
                A quieter place.
                <br />
                For your conversations.
              </h2>
              <p className="section-intro">
                Just the recording, the words, and a useful recap. Designed to
                give your attention back to the people in the room.
              </p>
              <div className="reading-note">
                <p>“I’ll test the recording flow by Friday.”</p>
                <p className="mt-6 text-sm!">From the sample conversation</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/meeting-summary">
                  What makes a useful summary
                  <ArrowUpRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="page-shell grid-12 section-space">
          <div className="section-kicker">
            <p className="eyebrow text-muted-foreground">
              A few things to know
            </p>
          </div>
          <div className="section-main">
            <details className="faq-row">
              <summary>Can I try it now?</summary>
              <p>
                Open the recorder to try the recording flow. Or explore the
                fictional sample meeting to switch between notes and transcript.
                The sample does not record or upload audio.
              </p>
            </details>
            <details className="faq-row">
              <summary>Will it capture everyone on a call?</summary>
              <p>
                A microphone only captures what it can hear. Audio playing
                through headphones needs a separate capture source. Supported
                recording sources will be clearly shown before you start.
              </p>
            </details>
            <details className="faq-row">
              <summary>Should I check the summary?</summary>
              <p>
                Yes. Review important names, numbers, decisions, and deadlines
                against the transcript and recording before sharing your notes.
              </p>
            </details>
            <details className="faq-row">
              <summary>Where should I start?</summary>
              <p>
                Try the example, or read our{" "}
                <Link
                  href="/guides/record-a-meeting-in-your-browser"
                  className="underline underline-offset-4"
                >
                  browser recording guide
                </Link>{" "}
                for a short preparation checklist.
              </p>
            </details>
          </div>
        </section>
        <section className="page-shell section-space closing">
          <p className="eyebrow text-muted-foreground mb-8">Keep it simple</p>
          <h2 className="section-title">A little less to remember.</h2>
          <Button asChild size="lg">
            <Link href="/login">
              Start a meeting
              <ArrowRight />
            </Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
