"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";

const PROJECT_TYPES = [
  { value: "saas_app", label: "SaaS App" },
  { value: "ai_chatbot", label: "AI Chatbot" },
  { value: "marketplace", label: "Marketplace" },
  { value: "mobile_app", label: "Mobile App" },
  { value: "api_backend", label: "API / Backend" },
  { value: "data_platform", label: "Data Platform" },
  { value: "other", label: "Other" },
];

const PRIORITIES = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    type: "saas_app",
    description: "",
    goals: "",
    target_users: "",
    constraints: "",
    priority: "medium",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const project = await createProject({
        title: form.title,
        description: form.description,
        type: form.type,
        goals: form.goals,
        target_users: form.target_users,
        constraints: form.constraints,
      });
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors";

  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">New Project</h1>
        <p className="text-gray-400 text-sm">
          Describe your project and OpenClaw will spin up AI agents to plan, architect, and deliver it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Project Info</h2>

          {/* Title */}
          <div>
            <label htmlFor="title" className={labelClass}>
              Project Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. AI-powered customer support platform"
              className={inputClass}
            />
          </div>

          {/* Type + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className={labelClass}>
                Project Type
              </label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                className={inputClass}
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="priority" className={labelClass}>
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={inputClass}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClass}>
              Project Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe what this project is about, its core features, and what problem it solves…"
              className={inputClass}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Goals & Context</h2>

          {/* Goals */}
          <div>
            <label htmlFor="goals" className={labelClass}>
              Goals
            </label>
            <textarea
              id="goals"
              name="goals"
              rows={3}
              value={form.goals}
              onChange={handleChange}
              placeholder="What are the key success metrics and objectives?"
              className={inputClass}
            />
          </div>

          {/* Target users */}
          <div>
            <label htmlFor="target_users" className={labelClass}>
              Target Users
            </label>
            <input
              id="target_users"
              name="target_users"
              type="text"
              value={form.target_users}
              onChange={handleChange}
              placeholder="e.g. Enterprise teams, SMBs, developers…"
              className={inputClass}
            />
          </div>

          {/* Constraints */}
          <div>
            <label htmlFor="constraints" className={labelClass}>
              Constraints{" "}
              <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <textarea
              id="constraints"
              name="constraints"
              rows={2}
              value={form.constraints}
              onChange={handleChange}
              placeholder="Budget, timeline, tech stack requirements, compliance needs…"
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Creating Project…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Create Project &amp; Launch Agents
            </>
          )}
        </button>
      </form>
    </div>
  );
}
