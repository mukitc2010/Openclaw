"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { getProject, generateProject, runAgent } from "@/lib/api";
import type { ProjectDetail, Agent, Task, ProjectOutlineOutput, ArchitectureOutput, GitHubPlanOutput } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import AgentCard from "@/components/AgentCard";
import SprintBoard from "@/components/SprintBoard";
import LoadingSpinner from "@/components/LoadingSpinner";

type Tab = "overview" | "agents" | "sprint" | "architecture" | "github";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "agents", label: "Agents" },
  { id: "sprint", label: "Sprint Board" },
  { id: "architecture", label: "Architecture" },
  { id: "github", label: "GitHub Plan" },
];

const TYPE_LABELS: Record<string, string> = {
  saas_app: "SaaS App",
  ai_chatbot: "AI Chatbot",
  marketplace: "Marketplace",
  mobile_app: "Mobile App",
  api_backend: "API / Backend",
  data_platform: "Data Platform",
  web_app: "Web App",
  other: "Other",
};

// ── Overview tab ────────────────────────────────────────────────────────────

function OverviewTab({ agents }: { agents: Agent[] }) {
  const pmAgent = agents.find(
    (a) => a.name === "Project Manager" || a.role?.toLowerCase().includes("project manager")
  );
  const outline = pmAgent?.output as ProjectOutlineOutput | null;

  if (!outline || !outline.title) {
    return (
      <div className="text-center py-16 text-gray-500 text-sm">
        No project outline yet. Generate the AI plan to see results here.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-1">{outline.title}</h2>
        {outline.description && <p className="text-gray-400 text-sm">{outline.description}</p>}
      </div>

      {outline.scope && (
        <Section title="Scope">
          <p className="text-gray-400 text-sm">{outline.scope}</p>
        </Section>
      )}

      {outline.milestones && outline.milestones.length > 0 && (
        <Section title="Milestones">
          <ul className="space-y-2">
            {outline.milestones.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-950 border border-indigo-800 text-xs text-indigo-400 font-medium">
                  {i + 1}
                </span>
                {m}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {outline.risks && outline.risks.length > 0 && (
        <Section title="Risks">
          <ul className="space-y-1.5">
            {outline.risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="text-amber-500 shrink-0">⚠</span>
                {r}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {outline.definition_of_done && outline.definition_of_done.length > 0 && (
        <Section title="Definition of Done">
          <ul className="space-y-1.5">
            {outline.definition_of_done.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="text-emerald-500 shrink-0">✓</span>
                {d}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

// ── Architecture tab ─────────────────────────────────────────────────────────

function ArchitectureTab({ agents }: { agents: Agent[] }) {
  const archAgent = agents.find(
    (a) => a.name === "Solution Architect" || a.role?.toLowerCase().includes("architect")
  );
  const arch = archAgent?.output as ArchitectureOutput | null;

  if (!arch || !arch.overview) {
    return (
      <div className="text-center py-16 text-gray-500 text-sm">
        No architecture document yet. Generate the AI plan first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {arch.overview && (
        <Section title="Overview">
          <p className="text-gray-400 text-sm whitespace-pre-wrap">{arch.overview}</p>
        </Section>
      )}

      {arch.components && arch.components.length > 0 && (
        <Section title="Components">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {arch.components.map((c, i) => (
              <div key={i} className="rounded-lg border border-gray-800 bg-gray-950 p-3">
                <p className="text-sm font-medium text-white mb-1">{c.name}</p>
                <p className="text-xs text-gray-500">{c.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {arch.tech_stack && Object.keys(arch.tech_stack).length > 0 && (
        <Section title="Tech Stack">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(arch.tech_stack).map(([k, v]) => (
              <div key={k} className="rounded-lg border border-gray-800 bg-gray-950 px-3 py-2">
                <p className="text-xs text-gray-500 mb-0.5">{k}</p>
                <p className="text-sm text-indigo-300 font-medium">{v}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {arch.deployment && (
        <Section title="Deployment">
          <p className="text-gray-400 text-sm whitespace-pre-wrap">{arch.deployment}</p>
        </Section>
      )}
    </div>
  );
}

// ── GitHub Plan tab ──────────────────────────────────────────────────────────

function GitHubPlanTab({ agents }: { agents: Agent[] }) {
  const ghAgent = agents.find(
    (a) => a.name === "GitHub Strategist" || a.role?.toLowerCase().includes("github")
  );
  const plan = ghAgent?.output as GitHubPlanOutput | null;

  if (!plan || !plan.branch_strategy) {
    return (
      <div className="text-center py-16 text-gray-500 text-sm">
        No GitHub plan yet. Generate the AI plan first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {plan.branch_strategy && (
        <Section title="Branch Strategy">
          <p className="text-gray-400 text-sm whitespace-pre-wrap">{plan.branch_strategy}</p>
        </Section>
      )}

      {plan.branches && plan.branches.length > 0 && (
        <Section title="Branches">
          <div className="space-y-2">
            {plan.branches.map((b, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2">
                <code className="text-xs text-indigo-300 bg-indigo-950/50 px-1.5 py-0.5 rounded">{b.name}</code>
                <span className="text-sm text-gray-400">{b.purpose}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {plan.commit_plan && plan.commit_plan.length > 0 && (
        <Section title="Commit Plan">
          <ol className="space-y-1.5">
            {plan.commit_plan.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="shrink-0 text-gray-600">{i + 1}.</span>
                {c}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {plan.docs_structure && plan.docs_structure.length > 0 && (
        <Section title="Docs Structure">
          <ul className="space-y-1 font-mono text-sm">
            {plan.docs_structure.map((d, i) => (
              <li key={i} className="text-gray-400">{d}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

// ── Shared section wrapper ───────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");

  const loadProject = useCallback(async () => {
    try {
      const data = await getProject(id);
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // Poll while any agent is running
  useEffect(() => {
    if (!project) return;
    const hasRunning = project.agents.some((a) => a.status === "running");
    if (!hasRunning) return;
    const timer = setTimeout(() => loadProject(), 3000);
    return () => clearTimeout(timer);
  }, [project, loadProject]);

  async function handleGenerate() {
    if (!project) return;
    setGenerating(true);
    setError(null);
    try {
      await generateProject(project.id);
      await loadProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRunAgent(agentId: string) {
    if (!project) return;
    setRunningAgent(agentId);
    try {
      await runAgent(project.id, agentId);
      await loadProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Agent run failed");
    } finally {
      setRunningAgent(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={loadProject} className="text-indigo-400 hover:text-indigo-300 text-sm">
          Try again
        </button>
      </div>
    );
  }

  if (!project) return null;

  const created = new Date(project.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const hasRunningAgents = project.agents.some((a) => a.status === "running");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Project header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge status={project.status} pulse />
            <span className="rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
              {TYPE_LABELS[project.type] ?? project.type}
            </span>
            <span className="text-xs text-gray-600">{created}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
          {project.description && (
            <p className="mt-1.5 text-gray-400 text-sm max-w-2xl">{project.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {hasRunningAgents && (
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <LoadingSpinner size="sm" />
              Agents running…
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating || hasRunningAgents}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <LoadingSpinner size="sm" />
                Generating…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Generate AI Plan
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Tab nav */}
      <div className="border-b border-gray-800 mb-8">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {tab === "overview" && <OverviewTab agents={project.agents} />}

      {tab === "agents" && (
        <div>
          {project.agents.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">
              No agents yet. Click &quot;Generate AI Plan&quot; to spin up agents.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {project.agents.map((agent: Agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onRun={handleRunAgent}
                  running={runningAgent === agent.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "sprint" && <SprintBoard tasks={project.tasks as Task[]} />}

      {tab === "architecture" && <ArchitectureTab agents={project.agents} />}

      {tab === "github" && <GitHubPlanTab agents={project.agents} />}
    </div>
  );
}
