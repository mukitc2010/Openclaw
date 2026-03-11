"use client";

import { useEffect, useRef, useState } from "react";
import { createAgentStream, type AgentStreamEvent } from "@/services/api";

interface Props {
  projectId: string;
}

interface StreamEntry {
  agent: string;
  phase: string;
  content: string;
  type: AgentStreamEvent["event_type"];
}

export function AgentStreamViewer({ projectId }: Props) {
  const [entries, setEntries] = useState<StreamEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = createAgentStream(
      projectId,
      (event) => {
        setEntries((prev) => [
          ...prev,
          {
            agent: event.agent,
            phase: event.phase,
            content: event.content,
            type: event.event_type,
          },
        ]);
        if (event.event_type === "complete" && event.agent === "GitHub Agent") {
          setDone(true);
        }
      },
      () => {
        setConnected(false);
        setDone(true);
      }
    );
    ws.onopen = () => setConnected(true);
    wsRef.current = ws;
    return () => ws.close();
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  const COLORS: Record<AgentStreamEvent["event_type"], string> = {
    start: "text-blue-400",
    chunk: "text-gray-300",
    complete: "text-green-400",
    error: "text-red-400",
  };

  return (
    <div className="bg-gray-950 border border-gray-700/60 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <span className={`w-2 h-2 rounded-full ${connected && !done ? "bg-green-400 animate-pulse" : done ? "bg-gray-500" : "bg-yellow-400"}`} />
          {done ? "Pipeline complete" : connected ? "Agents running..." : "Connecting..."}
        </div>
        <span className="text-xs text-gray-500">{entries.length} events</span>
      </div>
      <div className="h-96 overflow-y-auto p-4 space-y-1 font-mono text-xs">
        {entries.map((entry, i) => (
          <div key={i} className={`${COLORS[entry.type]} leading-relaxed`}>
            {entry.type !== "chunk" && (
              <span className="text-gray-500">[{entry.agent}] </span>
            )}
            {entry.content}
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-gray-600 italic">Waiting for agent output...</p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
