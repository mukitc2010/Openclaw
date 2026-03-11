"use client";

import { useEffect, useState } from "react";
import { api, type Project } from "@/services/api";

const STATUS_COLOR: Record<string, string> = {
  intake: "bg-yellow-900/50 text-yellow-400 border-yellow-700/50",
  planning: "bg-blue-900/50 text-blue-400 border-blue-700/50",
  architecture: "bg-purple-900/50 text-purple-400 border-purple-700/50",
  implementation: "bg-indigo-900/50 text-indigo-400 border-indigo-700/50",
  review: "bg-orange-900/50 text-orange-400 border-orange-700/50",
  delivered: "bg-green-900/50 text-green-400 border-green-700/50",
};

interface Props {
  onSelectProject: (project: Project) => void;
}

export function ProjectList({ onSelectProject }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.projects
      .list()
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
        Loading projects...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-4 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 text-sm space-y-2">
        <p className="text-4xl mb-3">📋</p>
        <p className="font-medium text-gray-400">No projects yet</p>
        <p>Create your first project to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <button
          key={project.id}
          onClick={() => onSelectProject(project)}
          className="text-left bg-gray-900 border border-gray-700/60 hover:border-brand-500/50 rounded-2xl p-5 space-y-3 transition-all group"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors truncate">
              {project.name}
            </h3>
            <span
              className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide border rounded-full px-2 py-0.5 ${STATUS_COLOR[project.status] ?? "bg-gray-800 text-gray-400 border-gray-700"}`}
            >
              {project.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 line-clamp-2">{project.idea}</p>
          <p className="text-[10px] text-gray-600">
            {new Date(project.created_at).toLocaleDateString()}
          </p>
        </button>
      ))}
    </div>
  );
}
