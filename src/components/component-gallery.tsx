"use client";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Circle,
  AlertCircle,
  Loader2,
  Copy,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
const specimen = `## A useful recap
The team agreed to keep the first release small.

- **Decision:** focus on the recording flow.
- **Next step:** test the full journey before Friday.

| Task | Owner |
| --- | --- |
| Test recording | Alex |
| Simplify onboarding | Sam |

A little math, when needed: $t = 24 + 8 = 32$.

\`\`\`js
const nextStep = "Keep it simple";
\`\`\`

\`\`\`mermaid
flowchart LR
  A[Record] --> B[Transcribe] --> C[Summarize]
\`\`\``;
export function ComponentGallery() {
  const [notice, setNotice] = useState("");
  const [text, setText] = useState(specimen);
  const [streaming, setStreaming] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );
  function replay() {
    if (timer.current) clearInterval(timer.current);
    setText("");
    setStreaming(true);
    let n = 0;
    timer.current = setInterval(() => {
      n += 18;
      setText(specimen.slice(0, n));
      if (n >= specimen.length) {
        clearInterval(timer.current!);
        timer.current = null;
        setStreaming(false);
      }
    }, 65);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(specimen);
      setNotice("Example copied.");
    } catch {
      setNotice("Copy unavailable. Select the text to copy it.");
    }
  }
  return (
    <>
      <section className="system-section grid-12">
        <div className="col-span-12 md:col-span-4">
          <h2 className="system-heading">Only the essentials.</h2>
          <p className="text-muted-foreground">
            Ink, grey, a quiet border, paper, white.
          </p>
        </div>
        <div className="col-span-12 grid grid-cols-5 gap-3 md:col-span-8">
          {[
            ["Ink", "bg-primary"],
            ["Grey", "bg-muted-foreground"],
            ["Line", "bg-border"],
            ["Paper", "bg-muted"],
            ["White", "bg-background"],
          ].map(([label, cls]) => (
            <div key={label}>
              <div className={`swatch ${cls}`} />
              <p className="mt-3 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="system-section grid-12">
        <div className="col-span-12 md:col-span-4">
          <h2 className="system-heading">Clear type.</h2>
          <p className="text-muted-foreground">Nunito Sans, served locally.</p>
        </div>
        <div className="col-span-12 space-y-6 md:col-span-8">
          <p className="section-title">Less, but useful.</p>
          <p className="text-2xl font-semibold tracking-tight">
            A quieter place for your notes.
          </p>
          <p>Readable body text, with plenty of space between thoughts.</p>
          <p className="text-sm text-muted-foreground">
            Secondary information stays secondary.
          </p>
        </div>
      </section>
      <section className="system-section grid-12">
        <div className="col-span-12 md:col-span-4">
          <h2 className="system-heading">Simple controls.</h2>
          <p className="text-muted-foreground">
            Pill buttons. Visible focus. Comfortable touch targets.
          </p>
        </div>
        <div className="col-span-12 space-y-8 md:col-span-8">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setNotice("Primary action selected.")}>
              Continue
              <ArrowRight />
            </Button>
            <Button
              variant="secondary"
              onClick={() => setNotice("Secondary action selected.")}
            >
              Secondary
            </Button>
            <Button
              variant="outline"
              onClick={() => setNotice("Outline action selected.")}
            >
              Outline
            </Button>
            <Button
              variant="ghost"
              onClick={() => setNotice("Ghost action selected.")}
            >
              Quiet action
            </Button>
            <Button disabled>Unavailable</Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold">
              <span>Meeting title</span>
              <Input placeholder="Monday catch-up" />
            </label>
            <div className="space-y-2">
              <label htmlFor="format" className="text-sm font-semibold">
                Note format
              </label>
              <Select defaultValue="summary">
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="transcript">Transcript</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <label className="block space-y-2 text-sm font-semibold">
            <span>A short note</span>
            <Textarea placeholder="What would you like to remember?" />
          </label>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Preview a dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>A little breathing room.</DialogTitle>
                <DialogDescription>
                  One clear action, with space to make a decision.
                </DialogDescription>
              </DialogHeader>
              <p>This is a component example. Nothing will be saved.</p>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    onClick={() =>
                      setNotice("Dialog confirmed. No data was saved.")
                    }
                  >
                    Got it
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>
      <section className="system-section grid-12">
        <div className="col-span-12 md:col-span-4">
          <h2 className="system-heading">States, without color.</h2>
          <p className="text-muted-foreground">
            An icon and plain language carry the meaning.
          </p>
        </div>
        <div className="col-span-12 space-y-8 md:col-span-8">
          <div className="flex flex-wrap gap-3">
            <Badge>
              <Circle className="size-3 fill-current" />
              Recording
            </Badge>
            <Badge>
              <Loader2 className="size-3" />
              Processing
            </Badge>
            <Badge>
              <Check className="size-3" />
              Ready
            </Badge>
            <Badge>
              <AlertCircle className="size-3" />
              Needs attention
            </Badge>
          </div>
          <Tabs defaultValue="empty">
            <TabsList aria-label="Example states">
              <TabsTrigger value="empty">Empty</TabsTrigger>
              <TabsTrigger value="loading">Loading</TabsTrigger>
              <TabsTrigger value="error">Error</TabsTrigger>
            </TabsList>
            <TabsContent value="empty">
              <p className="font-semibold">No meetings yet.</p>
              <p className="mt-2 text-muted-foreground">
                Your saved conversations will appear here.
              </p>
            </TabsContent>
            <TabsContent value="loading">
              <div
                role="status"
                aria-label="Loading example"
                className="space-y-4"
              >
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <span className="sr-only">Loading</span>
              </div>
            </TabsContent>
            <TabsContent value="error">
              <p className="flex items-center gap-2 font-semibold">
                <AlertCircle className="size-4" />
                The example couldn’t load.
              </p>
              <p className="mt-2 mb-4 text-muted-foreground">
                Your recording has not been changed.
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  setNotice("Retry selected. This is a state example.")
                }
              >
                Try again
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <section className="system-section grid-12">
        <div className="col-span-12 md:col-span-4">
          <h2 className="system-heading">Room for the answer.</h2>
          <p className="text-muted-foreground">
            AI Elements, customized for readable summaries. Tables, code, math,
            and diagrams share the same palette.
          </p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={replay}
            disabled={streaming}
          >
            {streaming ? "Replaying example…" : "Replay streaming example"}
          </Button>
          <p role="status" className="mt-3 text-sm text-muted-foreground">
            {streaming
              ? "Showing a simulated stream."
              : "Static sample. No model request is sent."}
          </p>
        </div>
        <div className="col-span-12 min-w-0 md:col-span-8">
          <Message from="assistant">
            <MessageContent>
              <MessageResponse
                mode={streaming ? "streaming" : "static"}
                isAnimating={streaming}
              >
                {text}
              </MessageResponse>
            </MessageContent>
            <MessageActions>
              <MessageAction
                label="Copy example"
                onClick={copy}
                disabled={streaming}
              >
                <Copy />
              </MessageAction>
            </MessageActions>
          </Message>
        </div>
      </section>
      <p
        role="status"
        className="sticky bottom-6 ml-auto w-fit rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground empty:hidden"
      >
        {notice}
      </p>
    </>
  );
}
