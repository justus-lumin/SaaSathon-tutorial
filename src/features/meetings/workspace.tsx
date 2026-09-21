"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronRight,
  CloudUpload,
  Headphones,
  LoaderCircle,
  LogOut,
  Mic,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { Brand, BrandIcon } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, uploadRecording } from "./api";
import {
  deleteLocalRecording,
  listLocalRecordings,
  localMeeting,
  recordingBlob,
  type LocalRecording,
} from "./local-store";
import { useRecorder } from "./use-recorder";
import { MeetingDetail } from "./meeting-detail";
import {
  ACTIVE_STATUSES,
  formatDuration,
  STATUS_LABELS,
  type MeetingList,
  type ProductIdentity,
} from "./types";
import { browserSupabase } from "@/lib/supabase/browser";
export function Workspace(props: {
  identity: ProductIdentity;
  selectedId: string | null;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 10000, retry: 1, refetchOnWindowFocus: true },
          mutations: { retry: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <WorkspaceContent {...props} />
    </QueryClientProvider>
  );
}
function WorkspaceContent({
  identity,
  selectedId,
}: {
  identity: ProductIdentity;
  selectedId: string | null;
}) {
  const router = useRouter();
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState(0);
  const [discard, setDiscard] = useState<LocalRecording | null>(null);
  const uploadController = useRef<AbortController | null>(null);
  const owner = identity.id;
  const localRecords = useQuery({
    queryKey: ["local-recordings", owner],
    queryFn: () => listLocalRecordings(owner),
  });
  const history = useInfiniteQuery({
    queryKey: ["meetings", owner],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }): Promise<MeetingList> =>
      identity.local
        ? {
            meetings: (await listLocalRecordings(owner)).map(localMeeting),
            nextCursor: null,
          }
        : api(
            `/api/meetings${pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : ""}`,
            { signal },
          ),
    getNextPageParam: (last) => last.nextCursor,
    refetchInterval: (q) =>
      q.state.data?.pages.some((p) =>
        p.meetings.some((m) => ACTIVE_STATUSES.includes(m.status)),
      )
        ? 5000
        : false,
  });
  const meetings = history.data?.pages.flatMap((page) => page.meetings) || [];
  const filtered = meetings.filter((meeting) =>
    meeting.title.toLowerCase().includes(search.toLowerCase()),
  );
  const navigate = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams();
      if (identity.local) params.set("local", "1");
      if (id) params.set("meeting", id);
      router.push(`/app${params.size ? `?${params}` : ""}`);
    },
    [identity.local, router],
  );
  const refresh = useCallback(async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["meetings", owner] }),
      client.invalidateQueries({ queryKey: ["local-recordings", owner] }),
    ]);
  }, [client, owner]);
  const upload = useMutation({
    mutationFn: async (record: LocalRecording) => {
      setError(null);
      setProgress(0);
      const controller = new AbortController();
      uploadController.current = controller;
      const meeting = await uploadRecording(
        record,
        setProgress,
        controller.signal,
      );
      // Finalization is durable. Only now remove this browser's recovery copy.
      await deleteLocalRecording(record.id, owner);
      return meeting;
    },
    onSuccess: async (meeting) => {
      await refresh();
      navigate(meeting.id);
      setSaved(true);
    },
    onError: (error) => setError(error.message),
    onSettled: () => {
      uploadController.current = null;
    },
  });
  const recorder = useRecorder(owner, (record) => {
    void refresh();
    setSaved(true);
    if (!identity.local && record.complete) upload.mutate(record);
    else if (identity.local) navigate(record.id);
  });
  useEffect(
    () => () => {
      uploadController.current?.abort();
    },
    [],
  );
  useEffect(() => {
    if (identity.local) return;
    const {
      data: { subscription },
    } = browserSupabase().auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (session && session.user.id !== owner)) {
        uploadController.current?.abort();
        client.clear();
        router.replace("/login");
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, [identity.local, owner, client, router]);
  async function signOut() {
    try {
      await api("/auth/signout", { method: "POST" });
      client.clear();
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Sign-out did not finish. Please try again.");
    }
  }
  async function downloadLocal(record: LocalRecording) {
    try {
      const blob = await recordingBlob(record.id, owner);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `meeting-${record.createdAt.slice(0, 10)}.${record.mime.includes("mp4") ? "m4a" : record.mime.includes("ogg") ? "ogg" : "webm"}`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("This local recording could not be downloaded.");
    }
  }
  const pending = (localRecords.data || []).filter(
    (record) => !identity.local && (!recorder.busy || record.complete),
  );
  const isBusy = recorder.busy || upload.isPending;
  return (
    <div className="min-h-screen bg-background">
      <header className="flex min-h-20 items-center justify-between gap-4 border-b border-border px-5 sm:px-8">
        <Brand linked={!isBusy} />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {identity.local ? "Local workspace" : identity.name}
          </span>
          {identity.local ? (
            <Button
              variant="outline"
              size="sm"
              asChild={!isBusy}
              disabled={isBusy}
            >
              {isBusy ? (
                "Local mode"
              ) : (
                <Link href="/login">
                  Sign in
                  <ArrowUpRight />
                </Link>
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Sign out"
              disabled={isBusy}
              onClick={signOut}
            >
              <LogOut />
            </Button>
          )}
        </div>
      </header>
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1600px] lg:grid-cols-[288px_1fr]">
        <aside
          aria-label="Your meetings"
          className="border-b border-border bg-muted/20 px-5 py-6 lg:border-r lg:border-b-0 lg:px-6"
        >
          <Button
            onClick={() => {
              navigate(null);
              setSaved(false);
            }}
            disabled={isBusy}
            className="w-full"
          >
            <Plus />
            New recording
          </Button>
          <div className="relative mt-6">
            <Search className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-muted-foreground" />
            <Input
              aria-label="Filter loaded meetings"
              placeholder="Find a meeting"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10"
            />
          </div>
          <div className="mb-3 mt-7 flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Your meetings
            </h2>
            <span className="text-xs text-muted-foreground">
              {meetings.length}
              {history.hasNextPage ? "+" : ""}
            </span>
          </div>
          <nav className="max-h-60 space-y-1 overflow-auto lg:max-h-[calc(100vh-21rem)]">
            {history.isPending
              ? [1, 2, 3].map((n) => (
                  <Skeleton key={n} className="mb-2 h-16 w-full" />
                ))
              : filtered.map((meeting) => (
                  <button
                    key={meeting.id}
                    disabled={isBusy}
                    onClick={() => navigate(meeting.id)}
                    aria-current={
                      selectedId === meeting.id ? "page" : undefined
                    }
                    className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors disabled:opacity-50 ${selectedId === meeting.id ? "bg-secondary" : "hover:bg-secondary/70"}`}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                      {ACTIVE_STATUSES.includes(meeting.status) ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Headphones className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {meeting.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {new Date(meeting.created_at).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}{" "}
                        ·{" "}
                        {meeting.status === "ready" ||
                        meeting.status === "local"
                          ? formatDuration(meeting.duration_seconds)
                          : STATUS_LABELS[meeting.status]}
                      </span>
                    </span>
                  </button>
                ))}
            {!history.isPending && !filtered.length && (
              <p className="px-3 py-6 text-sm text-muted-foreground">
                {search
                  ? "No matching meetings."
                  : "Your recordings will appear here."}
              </p>
            )}
            {history.hasNextPage && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                disabled={history.isFetchingNextPage}
                onClick={() => void history.fetchNextPage()}
              >
                {history.isFetchingNextPage
                  ? "Loading…"
                  : "Load older meetings"}
              </Button>
            )}
          </nav>
          {history.isError && (
            <div role="alert" className="mt-4 text-sm">
              <p>{history.error.message}</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => void history.refetch()}
              >
                Try again
              </Button>
            </div>
          )}
          <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            {identity.local
              ? "Stored on this device"
              : "Private to your account"}
          </p>
        </aside>
        <main id="main" className="min-w-0 px-5 py-6 sm:px-10 lg:px-14">
          {(identity.local || !identity.processingReady) && (
            <div className="mx-auto mb-6 flex max-w-3xl items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-sm">
              <Radio className="mt-0.5 size-4 shrink-0" />
              <p>
                {identity.local ? (
                  <>
                    <strong>Local recording.</strong> Audio stays in this
                    browser. Cloud sync, transcripts, and summaries are
                    available after sign-in and service setup.
                  </>
                ) : (
                  <>
                    <strong>Processing setup is pending.</strong> Recordings can
                    be saved to your account. Transcription and summaries will
                    start once the server keys are connected.
                  </>
                )}
              </p>
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="mx-auto mb-6 flex max-w-3xl items-start justify-between gap-4 rounded-2xl border border-input p-4 text-sm"
            >
              <p>{error}</p>
              <button aria-label="Dismiss error" onClick={() => setError(null)}>
                <X className="size-4" />
              </button>
            </div>
          )}
          {selectedId && !isBusy ? (
            <MeetingDetail
              key={selectedId}
              id={selectedId}
              identity={identity}
              onBack={() => navigate(null)}
            />
          ) : (
            <div className="mx-auto max-w-3xl">
              <div className="mb-8 mt-5">
                <p className="mb-3 text-sm font-semibold text-muted-foreground">
                  Your space to listen.
                </p>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  One less thing to remember.
                </h1>
                <p className="mt-3 max-w-lg text-muted-foreground">
                  Be in the conversation. Keep a recording for everything that
                  comes after.
                </p>
              </div>
              <section
                aria-label="Meeting recorder"
                className="rounded-3xl border border-border px-6 py-10 text-center sm:py-12"
              >
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-secondary">
                  {recorder.state === "recording" ? (
                    <BrandIcon className="h-9 w-9" />
                  ) : (
                    <Mic className="size-8" strokeWidth={1.5} />
                  )}
                </div>
                <div
                  className="mt-7 text-4xl font-semibold tabular-nums tracking-tight"
                  aria-label={`Recording duration ${formatDuration(recorder.seconds)}`}
                >
                  {formatDuration(recorder.seconds)}
                </div>
                <div
                  className="mt-3 flex min-h-6 items-center justify-center gap-2 text-sm text-muted-foreground"
                  role="status"
                >
                  {recorder.state === "recording" ? (
                    <>
                      <span className="size-2 rounded-full bg-foreground" />
                      Recording your microphone
                    </>
                  ) : recorder.state === "requesting" ? (
                    "Waiting for microphone access…"
                  ) : recorder.state === "stopping" ? (
                    "Saving your audio…"
                  ) : upload.isPending ? (
                    `Uploading your recording · ${progress}%`
                  ) : saved ? (
                    <>
                      <Check className="size-4" />
                      Recording saved
                    </>
                  ) : (
                    "Ready when you are"
                  )}
                </div>
                {recorder.state === "recording" && (
                  <div
                    className="mx-auto mt-5 flex h-6 items-center justify-center gap-1"
                    aria-hidden
                  >
                    {Array.from({ length: 15 }, (_, index) => (
                      <span
                        key={index}
                        className="w-1 rounded-full bg-foreground transition-[height] motion-reduce:transition-none"
                        style={{
                          height: `${4 + recorder.level * 20 * (1 - Math.abs(index - 7) / 10)}px`,
                        }}
                      />
                    ))}
                  </div>
                )}
                <div className="mt-8 flex justify-center">
                  {recorder.state === "recording" ? (
                    <Button size="lg" onClick={() => recorder.stop()}>
                      <Square className="fill-current" />
                      Stop recording
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      disabled={isBusy}
                      onClick={() => {
                        setSaved(false);
                        void recorder.start();
                      }}
                    >
                      {isBusy ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <Mic />
                      )}
                      {upload.isPending
                        ? "Saving recording"
                        : recorder.busy
                          ? "Starting…"
                          : "Start recording"}
                    </Button>
                  )}
                </div>
                {upload.isPending && (
                  <div
                    className="mx-auto mt-5 h-1.5 max-w-xs overflow-hidden rounded-full bg-secondary"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Upload progress"
                  >
                    <div
                      className="h-full rounded-full bg-foreground transition-[width]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                <p className="mx-auto mt-6 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  Microphone audio only. Headphone and other tab audio are not
                  recorded. Let everyone know before recording.
                </p>
              </section>
              {(recorder.error || recorder.notice) && (
                <p
                  role="alert"
                  className="mt-4 rounded-2xl border border-border p-4 text-sm"
                >
                  {recorder.error || recorder.notice}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="size-3.5" />
                  Private recording
                </span>
                <span>Up to 60 minutes</span>
                <span>Keep this tab open while recording</span>
              </div>
              {!isBusy && meetings.length > 0 && (
                <section className="mt-12">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold">
                      Pick up where you left off
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      Recent meetings
                    </span>
                  </div>
                  {meetings.slice(0, 3).map((meeting) => (
                    <button
                      key={meeting.id}
                      className="flex w-full items-center gap-4 border-t border-border py-5 text-left hover:bg-muted/30"
                      onClick={() => navigate(meeting.id)}
                    >
                      <Headphones className="size-5 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">
                          {meeting.title}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {STATUS_LABELS[meeting.status]}
                        </span>
                      </span>
                      <ChevronRight className="size-4" />
                    </button>
                  ))}
                </section>
              )}
            </div>
          )}
          {pending.length > 0 && (
            <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-border p-5">
              <h2 className="font-bold">Recordings on this device</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These recovery copies stay here until they are safely saved to
                your account.
              </p>
              {pending.map((record) => (
                <div
                  key={record.id}
                  className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{record.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.complete
                        ? formatDuration(record.duration)
                        : "Interrupted recording"}
                      {upload.variables?.id === record.id && upload.isPending
                        ? ` · Uploading ${progress}%`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Download ${record.title}`}
                      onClick={() => void downloadLocal(record)}
                    >
                      <ArrowDownToLine />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Discard ${record.title}`}
                      disabled={isBusy}
                      onClick={() => setDiscard(record)}
                    >
                      <Trash2 />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => upload.mutate(record)}
                    >
                      <CloudUpload />
                      Save to account
                    </Button>
                  </div>
                </div>
              ))}
            </section>
          )}
          {localRecords.isError && (
            <p role="alert" className="mx-auto mt-4 max-w-3xl text-sm">
              Browser storage is unavailable. Allow site storage or use another
              browser before recording.
            </p>
          )}
        </main>
      </div>
      <Dialog
        open={Boolean(discard)}
        onOpenChange={(open) => {
          if (!open) setDiscard(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard this local recording?</DialogTitle>
            <DialogDescription>
              This removes the recovery copy on this device. Download it first
              if you want to keep it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDiscard(null)}>
              Keep recording
            </Button>
            <Button
              onClick={async () => {
                if (!discard) return;
                try {
                  await deleteLocalRecording(discard.id, owner);
                  setDiscard(null);
                  await refresh();
                } catch {
                  setError("The recording could not be removed.");
                }
              }}
            >
              Discard recording
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
