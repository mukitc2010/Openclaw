import Link from "next/link";
import type { Project } from "@/types";
import StatusBadge from "./StatusBadge";

const typeLabels: Record<string, string> = {
  saas_app: "SaaS App",
  ai_chatbot: "AI Chatbot",
  marketplace: "Marketplace",
  mobile_app: "Mobile App",
  api_backend: "API / Backend",
  data_platform: "Data Platform",
  web_app: "Web App",
  other: "Other",
};

interface ProjectCardProps {
  project: Project;
  agentCount?: number;
  taskCount?: number;
}

export default function ProjectCard({ project, agentCount = 0, taskCount = 0 }: ProjectCardProps) {
  const created = new Date(project.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const typeLabel = typeLabels[project.type] ?? project.type;

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 transition-all duration-200 hover:border-indigo-800 hover:bg-gray-900/80 hover:shadow-lg hover:shadow-indigo-500/5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 flex-1">
            {project.title}
          </h3>
          <StatusBadge status={project.status} pulse />
        </div>

        {/* Type badge */}
        <span className="inline-block rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-400 mb-3">
          {typeLabel}
        </span>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-4">{project.description}</p>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between border-t border-gray-800 pt-3 mt-auto">
          <div className="flex gap-4">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
              {agentCount} agents
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {taskCount} tasks
            </span>
          </div>
          <span className="text-xs text-gray-600">{created}</span>
        </div>
      </div>
    </Link>
  );
}
