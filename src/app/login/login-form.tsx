"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, ShieldCheck, ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { browserSupabase } from "@/lib/supabase/browser";
export function LoginForm({
  configured,
  callbackFailed,
}: {
  configured: boolean;
  callbackFailed: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    callbackFailed
      ? "Sign-in could not finish. Please try again. Google login may still need to be configured."
      : null,
  );
  async function signIn() {
    setPending(true);
    setError(null);
    try {
      const { error } = await browserSupabase().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch {
      setError(
        "Google sign-in could not start. Please try again, or use local recording while setup is completed.",
      );
      setPending(false);
    }
  }
  return (
    <main id="main" className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Brand />
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft />
            Back home
          </Link>
        </Button>
      </div>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center py-16">
        <p className="mb-4 text-sm font-semibold text-muted-foreground">
          A little less to remember.
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to your meetings.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Sign in to keep your recordings, transcripts, and summaries in one
          place.
        </p>
        <Button
          onClick={signIn}
          disabled={!configured || pending}
          className="mt-8 w-full"
          size="lg"
        >
          {pending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <span aria-hidden className="text-lg font-bold">
              G
            </span>
          )}
          {pending ? "Connecting…" : "Continue with Google"}
          <ArrowRight className="ml-auto" />
        </Button>
        {!configured && (
          <p className="mt-4 text-sm text-muted-foreground">
            Cloud sign-in is not connected yet. You can still record and save
            audio on this device.
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-border p-4 text-sm"
          >
            {error}
          </p>
        )}
        <div className="mt-6 flex items-start gap-3 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          <p>
            Your meetings are private to your account. We only request your
            basic Google profile.
          </p>
        </div>
        <div className="mt-8 border-t border-border pt-6">
          <Link
            href="/app?local=1"
            className="text-sm font-semibold underline underline-offset-4"
          >
            Just record on this device
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            No account needed. Audio only; transcription needs a connected
            account.
          </p>
        </div>
      </div>
    </main>
  );
}
