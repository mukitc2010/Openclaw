"use client";

import { useState } from "react";
import { api, type Project, type ProjectCreate } from "@/services/api";

interface Props {
  onCreated: (project: Project) => void;
  onCancel: () => void;
}

export function ProjectIntakeForm({ onCreated, onCancel }: Props) {
  const [name, setName] = useState("");
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const project = await api.projects.create({ name, idea });
      onCreated(project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">New Project Intake</h2>
        <p className="text-sm text-gray-400 mt-1">
          Describe your project idea and OpenClaw will orchestrate the full SDLC.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-gray-300">
            Project Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. TaskFlow SaaS"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="idea" className="text-sm font-medium text-gray-300">
            Project Idea
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            required
            minLength={10}
            rows={5}
            placeholder="Describe your project idea in detail. What problem does it solve? Who are the target users? What are the core features?"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? "Creating project..." : "Create Project & Run Agents"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
