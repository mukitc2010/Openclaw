"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/ToastProvider";
import { createProject } from "@/lib/api";
import { Priority, ProjectCreate } from "@/types";

const AGENTS = [
  { name: "Project Manager", icon: "📋" },
  { name: "Systems Architect", icon: "🏗️" },
  { name: "Frontend Engineer", icon: "🎨" },
  { name: "Backend Engineer", icon: "⚙️" },
  { name: "AI/ML Engineer", icon: "🤖" },
  { name: "DevOps Engineer", icon: "🚀" },
  { name: "QA Engineer", icon: "🧪" },
  { name: "Security Engineer", icon: "🔐" },
  { name: "Data Engineer", icon: "📊" },
  { name: "UX Designer", icon: "✏️" },
  { name: "Product Owner", icon: "🎯" },
  { name: "Scrum Master", icon: "🏃" },
  { name: "Tech Lead", icon: "⭐" },
];

function parsePmPrompt(text: string): ProjectCreate {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const lower = text.toLowerCase();

  // Title: first line if short, else extract from "build/create/develop" sentence
  const titleMatch = text.match(/^(?:build|create|develop|make|design|launch)\s+(?:a\s+|an\s+)?([^.!?\n]{5,80})/im);
  const rawTitle = titleMatch ? titleMatch[1].trim() : (lines[0] || "Untitled Project").slice(0, 80);
  const title = rawTitle.replace(/[,.:]+$/, "");

  // Summary: first 2-3 non-trivial sentences
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 20);
  const summary = ([...sentences].slice(0, 3).join(". ") + ".").trim();

  // Goals: lines that describe what the system should do
  const goalKw = /\b(should|needs? to|enable|allow|support|will|can|provide|offer|let users?|help|implement|include|feature|track|manage|process)\b/i;
  const goals = lines
    .filter((l) => goalKw.test(l) && !/(constraint|must not|cannot|limit|budget|deadline)/i.test(l))
    .slice(0, 8);

  // Target users
  const userKw = /\b(user|customer|developer|admin|team|manager|client|student|employee|business|startup|enterprise|analyst|operator)\b/i;
  const target_users = Array.from(
    new Set(lines.filter((l) => userKw.test(l)).slice(0, 5))
  );

  // Constraints
  const constraintKw = /\b(must not|cannot|no more than|within|budget|deadline|limited|restrict|avoid|only|without|except|no [a-z])\b/i;
  const constraints = lines.filter((l) => constraintKw.test(l)).slice(0, 6);

  // Priority
  let priority: Priority = "medium";
  if (/\b(critical|urgent|asap|immediately|right away)\b/i.test(text)) priority = "critical";
  else if (/\b(high[- ]priority|important|top priority)\b/i.test(text)) priority = "high";
  else if (/\b(low[- ]priority|someday|eventually|nice to have)\b/i.test(text)) priority = "low";

  // Project type
  const typeMap: [RegExp, string][] = [
    [/\bsaas\b/i, "SaaS"],
    [/\bchatbot\b/i, "Chatbot"],
    [/\bmarketplace\b/i, "Marketplace"],
    [/\bmobile app\b/i, "Mobile App"],
    [/\bweb app\b/i, "Web App"],
    [/\bdashboard\b/i, "Dashboard"],
    [/\bplatform\b/i, "Platform"],
    [/\bapi\b/i, "API"],
    [/\bcli\b/i, "CLI"],
    [/\bextension\b/i, "Extension"],
    [/\bdesktop app\b/i, "Desktop App"],
  ];
  const typeMatch2 = typeMap.find(([rx]) => rx.test(lower));
  const project_type = typeMatch2 ? typeMatch2[1] : "";

  return {
    title: title || "Untitled Project",
    summary: summary || text.slice(0, 200),
    goals: goals.length ? goals : [text.slice(0, 120)],
    target_users: target_users.length ? target_users : ["General users"],
    constraints,
    priority,
    project_type,
  };
}

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [activeAgents, setActiveAgents] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");

  const parsed = prompt.trim().length > 10 ? parsePmPrompt(prompt) : null;

  async function onLaunch() {
    if (!parsed) return;
    setError("");
    setDispatching(true);

    // Animate agents activating one-by-one
    for (let i = 0; i < AGENTS.length; i++) {
      await new Promise((r) => setTimeout(r, 120));
      setActiveAgents((prev) => new Set([...prev, i]));
    }

    setSaving(true);
    try {
      const project = await createProject(parsed);
      toast({ type: "success", message: "Project launched! Agents are ready." });
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      toast({ type: "error", message: "Could not create project." });
      setDispatching(false);
      setActiveAgents(new Set());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pm-intake-root">
      {/* Banner */}
      <div className="pm-intake-banner">
        <span className="pm-intake-badge">PM Agent</span>
        <h1>Tell your Project Manager what to build</h1>
        <p>Write a plain-English brief. The PM Agent reads it, dispatches structured plans to all 13 specialist agents, and generates your full Agile delivery board.</p>
      </div>

      <div className="pm-intake-body">
        {/* Left: prompt input */}
        <div className="pm-intake-left">
          <label className="pm-prompt-label">Project Brief</label>
          <textarea
            className="pm-prompt-textarea"
            placeholder={`Describe your project in plain language...\n\nExample:\n"Build a SaaS platform for project tracking. It should support multiple team workspaces, real-time task updates, and role-based permissions. Target users are startup teams and project managers. No third-party data storage. High priority."`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={14}
            disabled={dispatching}
          />

          {/* Parsed Preview */}
          {parsed && (
            <div className="pm-parsed-preview">
              <p className="pm-parsed-title">PM Agent has parsed your brief</p>
              <div className="pm-parsed-row">
                <span className="pm-parsed-key">Title</span>
                <span className="pm-parsed-val">{parsed.title}</span>
              </div>
              <div className="pm-parsed-row">
                <span className="pm-parsed-key">Type</span>
                <span className="pm-parsed-val">{parsed.project_type || "—"}</span>
              </div>
              <div className="pm-parsed-row">
                <span className="pm-parsed-key">Priority</span>
                <span className={`priority-chip pm-priority-chip priority-${parsed.priority}`}>{parsed.priority}</span>
              </div>
              <div className="pm-parsed-row pm-parsed-col">
                <span className="pm-parsed-key">Goals detected</span>
                <ul className="pm-parsed-list">
                  {parsed.goals.slice(0, 4).map((g, i) => <li key={i}>{g.slice(0, 80)}</li>)}
                </ul>
              </div>
              {parsed.constraints.length > 0 && (
                <div className="pm-parsed-row pm-parsed-col">
                  <span className="pm-parsed-key">Constraints</span>
                  <ul className="pm-parsed-list">
                    {parsed.constraints.map((c, i) => <li key={i}>{c.slice(0, 80)}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {error && <p className="state-text danger">{error}</p>}

          <button
            className="pm-launch-btn"
            onClick={onLaunch}
            disabled={!parsed || saving || dispatching}
          >
            {saving ? "Launching..." : dispatching ? "Dispatching to Agents..." : "Launch Project"}
          </button>
        </div>

        {/* Right: agent dispatch grid */}
        <div className="pm-intake-right">
          <p className="pm-agents-label">Agent Dispatch</p>
          <div className="pm-agents-grid">
            {AGENTS.map((agent, i) => (
              <div
                key={agent.name}
                className={`pm-agent-card ${
                  activeAgents.has(i) ? "pm-agent-active" : dispatching ? "pm-agent-reading" : ""
                }`}
              >
                <span className="pm-agent-icon">{agent.icon}</span>
                <div className="pm-agent-info">
                  <p className="pm-agent-name">{agent.name}</p>
                  <span className="pm-agent-status">
                    {activeAgents.has(i) ? "Active" : dispatching ? "Reading..." : "Standby"}
                  </span>
                </div>
                <span className={`pm-status-dot ${activeAgents.has(i) ? "dot-active" : dispatching ? "dot-reading" : "dot-standby"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
