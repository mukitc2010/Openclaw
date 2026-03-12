"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/ToastProvider";
import { createProject } from "@/lib/api";
import { Priority, ProjectCreate } from "@/types";

function splitLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ProjectCreate>({
    title: "",
    summary: "",
    goals: [],
    target_users: [],
    constraints: [],
    priority: "medium",
    project_type: "",
  });

  const [goalsRaw, setGoalsRaw] = useState("");
  const [usersRaw, setUsersRaw] = useState("");
  const [constraintsRaw, setConstraintsRaw] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload: ProjectCreate = {
        ...form,
        goals: splitLines(goalsRaw),
        target_users: splitLines(usersRaw),
        constraints: splitLines(constraintsRaw),
      };
      const project = await createProject(payload);
      toast({ type: "success", message: "Project created successfully." });
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      toast({ type: "error", message: "Could not create project." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="intake-layout">
      <aside className="card intake-side">
        <p className="eyebrow">Intake</p>
        <h2>Define your project once, generate delivery plans in minutes</h2>
        <p className="state-text">
          Provide core context so OpenClaw can produce PM, Agile, architecture, and GitHub-ready artifacts.
        </p>
        <ul>
          <li>Capture business goals and constraints</li>
          <li>Set delivery priority and project type</li>
          <li>Generate a multi-agent execution baseline</li>
        </ul>
      </aside>

      <section className="card intake-form-card">
        <h2 className="section-title">Project Intake Form</h2>
        <p className="state-text">
          Enter project details so the Project Manager agent can generate the delivery outline.
        </p>

        <form className="grid intake-form" onSubmit={onSubmit}>
          <div>
          <label>Project Title</label>
            <input
              placeholder="OpenClaw Enterprise Delivery Platform"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <label>Summary</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="intake-row">
            <div>
              <label>Project Type</label>
              <input
                placeholder="SaaS, chatbot, marketplace..."
                value={form.project_type}
                onChange={(e) => setForm((p) => ({ ...p, project_type: e.target.value }))}
              />
            </div>
            <div>
              <label>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as Priority }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label>Goals (one per line)</label>
            <textarea value={goalsRaw} onChange={(e) => setGoalsRaw(e.target.value)} rows={4} />
          </div>

          <div>
            <label>Target Users (one per line)</label>
            <textarea value={usersRaw} onChange={(e) => setUsersRaw(e.target.value)} rows={4} />
          </div>

          <div>
            <label>Constraints (one per line)</label>
            <textarea value={constraintsRaw} onChange={(e) => setConstraintsRaw(e.target.value)} rows={4} />
          </div>

          {error && <p className="state-text danger">{error}</p>}

          <button disabled={saving} type="submit">
            {saving ? "Creating..." : "Create Project"}
          </button>
        </form>
      </section>
    </section>
  );
}
