"use client";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { browserSupabase } from "@/lib/supabase/browser";
import { api } from "./api";
import type { SummarySnapshot } from "./types";
export function newerSnapshot(
  current: SummarySnapshot | null | undefined,
  incoming: SummarySnapshot | null,
): SummarySnapshot | null {
  if (!incoming) return current || null;
  if (!current) return incoming;
  if (current.generation_id !== incoming.generation_id)
    return new Date(incoming.updated_at) >= new Date(current.updated_at)
      ? incoming
      : current;
  return incoming.revision > current.revision ? incoming : current;
}
export function useSummary(
  userId: string,
  meetingId: string,
  enabled: boolean,
) {
  const client = useQueryClient();
  const [connected, setConnected] = useState(false);
  const key = ["summary", userId, meetingId];
  const query = useQuery({
    queryKey: key,
    enabled,
    queryFn: async ({ signal }) => {
      const incoming = await api<SummarySnapshot | null>(
        `/api/meetings/${meetingId}/summary`,
        { signal },
      );
      return newerSnapshot(
        client.getQueryData<SummarySnapshot | null>([
          "summary",
          userId,
          meetingId,
        ]),
        incoming,
      );
    },
    refetchInterval: (q) =>
      enabled && q.state.data?.status !== "complete"
        ? connected
          ? 10000
          : 1500
        : false,
  });
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const supabase = browserSupabase();
    const queryKey = ["summary", userId, meetingId];
    const channel = supabase
      .channel(`summary:${userId}:${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "meeting_summary_streams",
          filter: `meeting_id=eq.${meetingId}`,
        },
        (event) => {
          if (!active) return;
          const snapshot = event.new as SummarySnapshot;
          if (!snapshot?.generation_id) return;
          const current = client.getQueryData<SummarySnapshot | null>(queryKey);
          if (current && current.generation_id !== snapshot.generation_id) {
            void client.invalidateQueries({ queryKey });
            return;
          }
          client.setQueryData(queryKey, newerSnapshot(current, snapshot));
          if (snapshot.status !== "streaming")
            void client.invalidateQueries({
              queryKey: ["meeting", userId, meetingId],
            });
        },
      )
      .subscribe((status) => {
        if (!active) return;
        setConnected(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED")
          void client.invalidateQueries({ queryKey });
      });
    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [enabled, meetingId, userId, client]);
  return { ...query, connected };
}
