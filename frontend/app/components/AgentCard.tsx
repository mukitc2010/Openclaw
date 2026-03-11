import type { Agent } from "@/types";
import StatusBadge from "./StatusBadge";

const roleIcons: Record<string, string> = {
  "Project Manager": "📋",
  "Solution Architect": "🏗️",
  "Sprint Planner": "🗓️",
  "GitHub Strategist": "🐙",
  "QA Engineer": "🧪",
  "DevOps Engineer": "⚙️",
};

interface AgentCardProps {
  agent: Agent;
  onRun?: (agentId: string) => void;
  running?: boolean;
}

function getOutputSummary(agent: Agent): string {
  if (!agent.output) return "No output yet";

  const output = agent.output as Record<string, unknown>;
  if (output.title) return String(output.title);
  if (output.overview) return String(output.overview).slice(0, 100);
  if (output.branch_strategy) return String(output.branch_strategy).slice(0, 100);
  if (output.error) return `Error: ${output.error}`;
  return "Output available — view project for details";
}

export default function AgentCard({ agent, onRun, running }: AgentCardProps) {
  const icon = roleIcons[agent.name] ?? roleIcons[agent.role] ?? "🤖";
  const summary = getOutputSummary(agent);

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-800 text-xl">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-medium text-white text-sm truncate">{agent.name}</h3>
            <StatusBadge status={agent.status} pulse />
          </div>
          <p className="text-xs text-indigo-400 mb-2">{agent.role}</p>
          <p className="text-xs text-gray-500 line-clamp-2">{summary}</p>
        </div>
      </div>

      {onRun && agent.status !== "running" && (
        <button
          onClick={() => onRun(agent.id)}
          disabled={running}
          className="mt-4 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? "Running…" : "Run Agent"}
        </button>
      )}
    </div>
  );
}
