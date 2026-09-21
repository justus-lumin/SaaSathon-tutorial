import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Privacy policy",
  "How Meeting Recorder handles account information, recordings, transcripts, and summaries.",
  "/privacy",
);
const sections = [
  {
    heading: "Who runs this app",
    text: "Meeting Recorder (also identified as Generic Meeting recorder on Google) is a tutorial project operated by Justus Huneke. For privacy questions, account deletion, or a request about your information, contact justus.huneke@luminpdf.com.",
  },
  {
    heading: "Google sign-in",
    text: "When you sign in, Google shares your account identifier, email address, basic profile information, and profile image with Supabase Auth. We use this information to create and secure your account and show your name in the app. We request only OpenID, email, and profile scopes. We do not request access to your Google Drive, Gmail, Calendar, or contacts. We do not send Google account credentials or profile information to our AI providers as part of sign-in.",
  },
  {
    heading: "Recordings and documents",
    text: "The app records microphone audio only when you choose Start recording. In a signed-in workspace, stopping a recording uploads the captured audio to private Supabase Storage. We store the meeting title, technical metadata, transcript, and summary in Supabase. The service processes this content to provide playback, transcription, summaries, and your meeting library. Tell participants before recording and make sure you have permission to record and upload their information.",
  },
  {
    heading: "AI processing and hosting",
    text: "Audio segments are sent through OpenRouter to a transcription provider. The resulting transcript is sent through OpenRouter to a summary provider. Meeting content can contain personal information, so use this service only for content you are comfortable sending to those services. OpenRouter chooses the serving provider, and that provider may vary between requests. Vercel hosts the website and processing functions; Supabase provides authentication, database, file storage, and live updates. These providers process data under their own service and privacy terms. We do not promise that every provider has zero retention. Meeting Recorder does not sell Google user data or use it for advertising.",
  },
  {
    heading: "Device storage and cookies",
    text: "During recording and upload, the browser keeps an audio recovery copy in IndexedDB. A successfully uploaded and finalized account recording removes that recovery copy. Failed or interrupted uploads can leave a copy on the device. Local mode keeps recordings only in that browser and does not create AI documents. Authentication uses cookies and browser storage to maintain your session. Clearing site storage removes local recordings and can sign you out. The app does not currently include advertising or product-analytics trackers. Hosting and authentication services may keep technical security and request logs.",
  },
  {
    heading: "Retention and deletion",
    text: "Saved account recordings and documents remain available until you delete them. Deleting a meeting immediately hides it from your account and queues removal of its stored files and documents. Cleanup waits for active processing to finish, so physical removal normally takes several minutes and may take longer during an outage. Previously issued audio links can remain valid for up to five minutes. Temporary processing audio is queued for deletion after successful processing, and abandoned upload records are cleaned up after 24 hours. Provider logs and backups may follow their own retention schedules. To remove your account and remaining account information, email the contact above; account-wide deletion is not yet available as a self-service control.",
  },
  {
    heading: "Access and location",
    text: "Account data and original audio are restricted to the signed-in owner through database and storage permissions. Server processing uses privileged credentials, and operators may access data when necessary to run the service or respond to a support or deletion request. The app database and primary processing functions are configured in Seoul. Other providers may process information in other countries. No online service can guarantee absolute security; this tutorial should not be used as your only copy of important records.",
  },
  {
    heading: "Your choices and changes",
    text: "You can download recordings and completed Markdown documents, delete meetings, revoke the app's Google access in your Google Account settings, and contact us about access, correction, or deletion. Revoking Google access does not itself delete recordings already saved here. We will update this page when the app's data handling changes. The date below identifies the current version.",
  },
];
export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="page-shell grid-12">
        <header className="article-header">
          <p className="eyebrow text-muted-foreground">
            Updated 21 September 2026
          </p>
          <h1>Privacy policy</h1>
          <p>What we collect, why we need it, and how you can remove it.</p>
        </header>
        <article className="article-body">
          {sections.map((section) => (
            <section className="article-section" key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.text}</p>
            </section>
          ))}
          <p className="text-sm">
            <a
              className="underline underline-offset-4"
              href="mailto:justus.huneke@luminpdf.com"
            >
              Contact Justus about privacy
            </a>
          </p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
