"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { listProjects } from "@/lib/api";
import { ProjectRecord } from "@/types";

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listProjects()
      .then((res) => setProjects(res.projects))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const generatedCount = projects.filter((p) => p.outline || p.epics.length || p.deliverables).length;

  return (
    <div className="home-layout page-enter">
      <section className="hero card reveal">
        <div>
          <p className="eyebrow">Control Room</p>
          <h2>Build, plan, and ship software with coordinated AI agents</h2>
          <p className="hero-copy">
            Run project intake, generate delivery artifacts, and track execution from a single operating surface.
          </p>
          <div className="hero-cta-row">
            <Link href="/projects/new">
              <button>Create New Project</button>
            </Link>
            <a className="ghost-link" href="#projects">Browse Existing Projects</a>
          </div>
        </div>
        <div className="stat-grid" aria-label="Platform metrics">
          <article className="stat-card">
            <p>Total Projects</p>
            <h3>{projects.length}</h3>
          </article>
          <article className="stat-card">
            <p>Plans Generated</p>
            <h3>{generatedCount}</h3>
          </article>
          <article className="stat-card">
            <p>Agent Roles</p>
            <h3>13</h3>
          </article>
          <article className="stat-card">
            <p>Flow Modules</p>
            <h3>5</h3>
          </article>
        </div>
      </section>

      <section id="projects" className="card reveal delay-1">
        <div className="section-head">
          <h3>Projects</h3>
          <Link href="/projects/new" className="inline-link">
            Start Another
          </Link>
        </div>
        {loading && <p className="state-text">Loading projects...</p>}
        {error && <p className="state-text danger">{error}</p>}
        {!loading && !projects.length && (
          <div className="empty-state">
            <div className="empty-mark" aria-hidden="true" />
            <h4>No projects yet</h4>
            <p className="state-text">Create your first project to generate PM, Agile, architecture, and delivery plans.</p>
            <Link href="/projects/new">
              <button>Create Your First Project</button>
            </Link>
          </div>
        )}
        <div className="project-grid">
          {projects.map((project, idx) => {
            const hasOutputs = Boolean(project.outline || project.epics.length || project.deliverables);
            return (
              <article key={project.id} className="project-card reveal" style={{ animationDelay: `${idx * 70}ms` }}>
                <div className="project-card-head">
                  <h4>{project.intake.title}</h4>
                  <span className={`status-pill ${hasOutputs ? "ready" : "new"}`}>
                    {hasOutputs ? "Generated" : "New"}
                  </span>
                </div>
                <p>{project.intake.summary}</p>
                <div className="project-meta">
                  <span>{project.id}</span>
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                <Link href={`/projects/${project.id}`}>
                  <button className="secondary">Open Project</button>
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
