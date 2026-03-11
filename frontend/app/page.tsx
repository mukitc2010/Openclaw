import Link from "next/link";
import { getProjects } from "@/lib/api";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/types";

export const dynamic = "force-dynamic";

async function fetchProjects(): Promise<Project[]> {
  try {
    return await getProjects();
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const projects = await fetchProjects();

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active" || p.status === "running").length,
    completed: projects.filter((p) => p.status === "completed").length,
    draft: projects.filter((p) => p.status === "draft").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            AI-Powered Software Delivery Platform
          </h1>
          <p className="text-gray-400 max-w-xl">
            OpenClaw orchestrates specialized AI agents to plan, architect, and deliver enterprise
            software from idea to production-ready code.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/25"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Project
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Projects", value: stats.total, color: "text-white" },
          { label: "Active", value: stats.active, color: "text-indigo-400" },
          { label: "Completed", value: stats.completed, color: "text-emerald-400" },
          { label: "Draft", value: stats.draft, color: "text-gray-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-4"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Projects grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Projects</h2>
        <span className="text-sm text-gray-500">{projects.length} total</span>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-800 bg-gray-900/30 flex flex-col items-center justify-center py-24 gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 border border-gray-800">
            <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-white font-medium mb-1">No projects yet</p>
            <p className="text-sm text-gray-500">Create your first project and let AI agents build it for you.</p>
          </div>
          <Link
            href="/projects/new"
            className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Create First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
