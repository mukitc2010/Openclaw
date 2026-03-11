"use client";

import { useState } from "react";
import { ProjectIntakeForm } from "@/components/ProjectIntakeForm";
import { ProjectList } from "@/components/ProjectList";
import type { Project } from "@/services/api";

export default function HomePage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center py-12 space-y-4">
        <div className="inline-flex items-center gap-2 bg-brand-900/40 border border-brand-700/40 rounded-full px-4 py-1.5 text-xs text-brand-500 font-medium mb-4">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          AI Engineering Organization
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Transform an idea into a{" "}
          <span className="text-brand-500">delivered software system</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          OpenClaw orchestrates 13 specialized AI agents through every SDLC phase —
          from project intake to GitHub delivery — automatically.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
          >
            <span>🚀</span> Start New Project
          </button>
        </div>
      </section>

      {/* Project intake form */}
      {showForm && (
        <section className="max-w-2xl mx-auto">
          <ProjectIntakeForm
            onCreated={(project) => {
              setSelectedProject(project);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </section>
      )}

      {/* Agent pipeline visualization */}
      <section>
        <h2 className="text-lg font-semibold text-gray-200 mb-4">Agent Execution Pipeline</h2>
        <div className="flex flex-wrap gap-2">
          {AGENTS.map((agent, i) => (
            <div
              key={agent.name}
              className="flex items-center gap-2 bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 text-xs"
            >
              <span className="w-5 h-5 rounded-full bg-brand-700/60 text-brand-300 text-[10px] font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-gray-300">{agent.display}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Project list */}
      <section>
        <h2 className="text-lg font-semibold text-gray-200 mb-4">Your Projects</h2>
        <ProjectList onSelectProject={setSelectedProject} />
      </section>
    </div>
  );
}

const AGENTS = [
  { name: "pm", display: "Project Manager" },
  { name: "ba", display: "Business Analyst" },
  { name: "arch", display: "Solution Architect" },
  { name: "ai", display: "AI Engineering" },
  { name: "ux", display: "UI/UX Designer" },
  { name: "be", display: "Backend Developer" },
  { name: "fe", display: "Frontend Developer" },
  { name: "db", display: "Database Engineer" },
  { name: "do", display: "DevOps Agent" },
  { name: "qa", display: "QA Engineer" },
  { name: "sec", display: "Security Agent" },
  { name: "cr", display: "Code Reviewer" },
  { name: "gh", display: "GitHub Agent" },
];
