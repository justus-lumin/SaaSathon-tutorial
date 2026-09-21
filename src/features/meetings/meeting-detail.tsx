"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  FileText,
  LoaderCircle,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Trash2,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "./api";
import {
  deleteLocalRecording,
  localMeeting,
  localRecording,
  recordingBlob,
  updateLocalRecording,
} from "./local-store";
import {
  ACTIVE_STATUSES,
  formatDuration,
  STATUS_LABELS,
  type Meeting,
  type ProductIdentity,
} from "./types";
import { useSummary } from "./use-summary";
const Markdown = dynamic(
  () =>
    import("@/components/ai-elements/message").then(
      (module) => module.MessageResponse,
    ),
  { loading: () => <Skeleton className="h-40 w-full" /> },
);
function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function filename(title: string) {
  return title.replace(/[^\p{L}\p{N}\s_-]/gu, "").slice(0, 100) || "meeting";
}
function AudioPlayer({
  meeting,
  identity,
}: {
  meeting: Meeting;
  identity: ProductIdentity;
}) {
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [playError, setPlayError] = useState(false);
  const audio = useQuery({
    queryKey: ["audio", identity.id, meeting.id],
    enabled: !identity.local,
    queryFn: ({ signal }) =>
      api<{ url: string }>(`/api/meetings/${meeting.id}/audio`, { signal }),
    staleTime: 240000,
    retry: 1,
  });
  useEffect(() => {
    if (!identity.local) return;
    let url: string | undefined;
    let live = true;
    void recordingBlob(meeting.id, identity.id)
      .then((blob) => {
        if (live) {
          url = URL.createObjectURL(blob);
          setLocalUrl(url);
        }
      })
      .catch(() => {
        if (live) setPlayError(true);
      });
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [identity.id, identity.local, meeting.id]);
  const source = identity.local ? localUrl : audio.data?.url;
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Volume2 className="size-4" />
          Recording
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={!source}
          onClick={async () => {
            try {
              const blob = identity.local
                ? await recordingBlob(meeting.id, identity.id)
                : await fetch(source!).then((r) => r.blob());
              saveFile(
                blob,
                `${filename(meeting.title)}.${meeting.audio_mime_type?.includes("mp4") ? "m4a" : meeting.audio_mime_type?.includes("ogg") ? "ogg" : "webm"}`,
              );
            } catch {
              setPlayError(true);
            }
          }}
        >
          <Download />
          Download
        </Button>
      </div>
      {source ? (
        <audio
          key={source}
          controls
          preload="metadata"
          src={source}
          className="h-10 w-full"
          onError={() => setPlayError(true)}
          aria-label="Meeting recording"
        />
      ) : (
        <Skeleton className="h-10 w-full" />
      )}
      {(playError || audio.isError) && (
        <div role="alert" className="mt-3 text-sm">
          Audio could not load.{" "}
          {identity.local ? (
            "This interrupted recording may not be playable. You can still download its saved audio."
          ) : (
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setPlayError(false);
                void audio.refetch();
              }}
            >
              Reload audio link
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
export function MeetingDetail({
  id,
  identity,
  onBack,
}: {
  id: string;
  identity: ProductIdentity;
  onBack: () => void;
}) {
  const client = useQueryClient();
  const [tab, setTab] = useState("summary");
  const [rename, setRename] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState("");
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const meeting = useQuery({
    queryKey: ["meeting", identity.id, id],
    queryFn: async ({ signal }) =>
      identity.local
        ? localMeeting(await localRecording(id, identity.id))
        : api<Meeting>(`/api/meetings/${id}`, { signal }),
    refetchInterval: (q) =>
      q.state.data && ACTIVE_STATUSES.includes(q.state.data.status)
        ? 3000
        : false,
    retry: 1,
  });
  const data = meeting.data;
  const summary = useSummary(
    identity.id,
    id,
    !identity.local && Boolean(data) && data?.status !== "ready",
  );
  const mutation = useMutation({
    mutationFn: async (action: "rename" | "delete" | "retry") => {
      setActionError(null);
      if (identity.local) {
        if (action === "delete") await deleteLocalRecording(id, identity.id);
        else if (action === "rename")
          await updateLocalRecording(id, { title: title.trim() });
      } else
        await api(`/api/meetings/${id}${action === "retry" ? "/retry" : ""}`, {
          method:
            action === "delete"
              ? "DELETE"
              : action === "rename"
                ? "PATCH"
                : "POST",
          body:
            action === "rename"
              ? JSON.stringify({ title: title.trim() })
              : undefined,
        });
      return action;
    },
    onSuccess: async (action) => {
      await client.invalidateQueries({ queryKey: ["meetings", identity.id] });
      await client.invalidateQueries({
        queryKey: ["local-recordings", identity.id],
      });
      if (action === "delete") {
        onBack();
        return;
      }
      setRename(false);
      await client.invalidateQueries({
        queryKey: ["meeting", identity.id, id],
      });
      await client.invalidateQueries({
        queryKey: ["summary", identity.id, id],
      });
    },
    onError: (error) => setActionError(error.message),
  });
  if (meeting.isPending)
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-8">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (meeting.isError || !data)
    return (
      <div className="mx-auto max-w-3xl py-16">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft />
          All meetings
        </Button>
        <h1 className="mt-8 text-2xl font-bold">
          This meeting could not load.
        </h1>
        <p role="alert" className="mt-3 text-muted-foreground">
          {meeting.error?.message}
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => void meeting.refetch()}
        >
          Try again
        </Button>
      </div>
    );
  const generating = data.status === "summarizing";
  const active = ACTIVE_STATUSES.includes(data.status);
  const text =
    tab === "transcript"
      ? data.transcript_markdown
      : data.summary_markdown || summary.data?.draft_markdown || "";
  const documentReady =
    tab === "transcript"
      ? Boolean(data.transcript_markdown)
      : data.status === "ready" && Boolean(data.summary_markdown);
  return (
    <article className="mx-auto max-w-3xl pb-16 pt-4">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft />
          All meetings
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Meeting options">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                setTitle(data.title);
                setRename(true);
              }}
            >
              <Pencil />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setDeleting(true)}>
              <Trash2 />
              Delete meeting
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h1 className="break-words text-3xl font-bold tracking-tight">
        {data.title}
      </h1>
      <div className="mb-7 mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <time dateTime={data.created_at}>
          {new Date(data.created_at).toLocaleDateString(undefined, {
            weekday: "short",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </time>
        <span>{formatDuration(data.duration_seconds)}</span>
        <span className="flex items-center gap-2">
          {active ? (
            <LoaderCircle className="size-3 animate-spin" />
          ) : (
            <span className="size-1.5 rounded-full bg-current" />
          )}
          {STATUS_LABELS[data.status]}
        </span>
      </div>
      <AudioPlayer key={data.id} meeting={data} identity={identity} />
      {data.interrupted && (
        <p className="mt-4 text-sm text-muted-foreground">
          This recording was interrupted. The audio captured before it stopped
          has been kept.
        </p>
      )}
      {data.status === "failed" && (
        <div role="alert" className="mt-6 rounded-2xl border border-border p-5">
          <p className="font-semibold">
            {data.transcript_markdown
              ? "Your transcript is safe."
              : "Your recording is safe."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.error_message}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate("retry")}
          >
            <RefreshCw />
            {data.transcript_markdown ? "Retry summary" : "Retry processing"}
          </Button>
        </div>
      )}
      <Tabs value={tab} onValueChange={setTab} className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Copy Markdown"
              disabled={!documentReady}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(text || "");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  setActionError(
                    "Copy is unavailable. Download the Markdown instead.",
                  );
                }
              }}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Download Markdown"
              disabled={!documentReady}
              onClick={() =>
                saveFile(
                  new Blob([text || ""], {
                    type: "text/markdown;charset=utf-8",
                  }),
                  `${filename(data.title)}-${tab}.md`,
                )
              }
            >
              <Download />
            </Button>
          </div>
        </div>
        {["summary", "transcript"].map((section) => (
          <TabsContent key={section} value={section} className="pt-6">
            {identity.local ? (
              <div className="rounded-2xl bg-muted/50 px-6 py-10 text-center">
                <FileText className="mx-auto mb-4 size-7" />
                <h2 className="text-lg font-bold">
                  Your audio is saved on this device.
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  Transcripts and summaries need a connected account. You can
                  play or download this recording at any time.
                </p>
              </div>
            ) : text ? (
              <>
                <div
                  className="mb-5 text-sm text-muted-foreground"
                  role="status"
                >
                  {generating && tab === "summary"
                    ? "Writing your summary…"
                    : data.status === "failed" && tab === "summary"
                      ? "Incomplete summary"
                      : ""}
                </div>
                <Markdown
                  mode={
                    generating && tab === "summary" ? "streaming" : "static"
                  }
                  isAnimating={generating && tab === "summary"}
                >
                  {text}
                </Markdown>
              </>
            ) : (
              <div className="py-12 text-center">
                {active ? (
                  <LoaderCircle className="mx-auto mb-4 size-6 animate-spin" />
                ) : (
                  <FileText className="mx-auto mb-4 size-6" />
                )}
                <h2 className="font-bold">
                  {active
                    ? tab === "summary"
                      ? "Your summary is on its way."
                      : "Preparing your transcript."
                    : "No document yet."}
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  {active
                    ? "You can leave this page. Your recording is saved and processing will continue."
                    : data.status === "draft"
                      ? "Finish uploading the recording from the device where you recorded it."
                      : "Retry processing to create this document."}
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      {actionError && (
        <p role="alert" className="mt-4 text-sm">
          {actionError}
        </p>
      )}
      <Dialog open={rename} onOpenChange={setRename}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename meeting</DialogTitle>
            <DialogDescription>
              Choose a title that is easy to find later.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate("rename");
            }}
          >
            <label
              htmlFor="meeting-title"
              className="mb-2 block text-sm font-semibold"
            >
              Meeting title
            </label>
            <Input
              id="meeting-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
              autoFocus
            />
            <DialogFooter className="mt-6">
              <Button variant="ghost" onClick={() => setRename(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || mutation.isPending}
              >
                Save title
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleting} onOpenChange={setDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              The recording, transcript, and summary will be removed. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep meeting</AlertDialogCancel>
            <AlertDialogAction
              disabled={mutation.isPending}
              onClick={() => mutation.mutate("delete")}
            >
              Delete meeting
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
