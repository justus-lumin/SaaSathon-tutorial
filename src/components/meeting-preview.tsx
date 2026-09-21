"use client";
import { useState } from "react";
import { Check, Copy, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import { sampleSummary, sampleTranscript } from "@/content/sample";
export function MeetingPreview({ expanded = false }: { expanded?: boolean }) {
  const [tab, setTab] = useState("summary");
  const [copyStatus, setCopyStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        tab === "summary" ? sampleSummary : sampleTranscript,
      );
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy unavailable. Select the text to copy it.");
    }
  }
  return (
    <div className="meeting-preview">
      <div className="preview-header">
        <div>
          <h2 className="preview-title">Monday catch-up</h2>
          <p className="preview-meta">
            A fictional conversation, just for this demo.
          </p>
        </div>
        <Badge>Sample meeting</Badge>
      </div>
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          setCopyStatus("");
        }}
      >
        <TabsList aria-label="Meeting content">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="preview-tabs">
          <Message from="assistant">
            <MessageContent>
              <MessageResponse mode="static">{sampleSummary}</MessageResponse>
            </MessageContent>
          </Message>
        </TabsContent>
        <TabsContent value="transcript" className="preview-tabs">
          <Message from="assistant">
            <MessageContent>
              <MessageResponse mode="static">
                {sampleTranscript}
              </MessageResponse>
            </MessageContent>
          </Message>
        </TabsContent>
      </Tabs>
      <div className="preview-footer">
        <MessageActions>
          <MessageAction
            onClick={copy}
            label={copyStatus === "Copied" ? "Copied" : "Copy notes"}
          >
            {copyStatus === "Copied" ? <Check /> : <Copy />}
          </MessageAction>
          <span role="status">
            {copyStatus || "The useful parts, all in one place."}
          </span>
        </MessageActions>
        {!expanded && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/demo">
              Explore
              <ArrowUpRight />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
