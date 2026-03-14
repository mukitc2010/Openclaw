"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { listProjects } from "@/lib/api";
import { ProjectRecord } from "@/types";

const ALL_AGENTS = [
  {
    icon: "📋",
    name: "Project Manager",
    tag: "PM",
    desc: "Converts raw ideas into scoped delivery plans and milestones.",
    outputs: ["Project scope and milestones", "Risks and dependencies", "Execution roadmap"],
  },
  {
    icon: "📊",
    name: "Business Analyst",
    tag: "BA",
    desc: "Defines user stories, acceptance criteria, and business outcomes.",
    outputs: ["User stories and priorities", "Acceptance criteria", "Business KPI mapping"],
  },
  {
    icon: "🏗️",
    name: "Solution Architect",
    tag: "ARCH",
    desc: "Designs system topology, integrations, and technology choices.",
    outputs: ["System architecture", "Service boundaries", "Integration strategy"],
  },
  {
    icon: "🤖",
    name: "AI Engineering",
    tag: "AI",
    desc: "Plans model usage, prompt strategy, and AI workflows.",
    outputs: ["Model and prompt strategy", "AI workflow design", "Cost and latency guardrails"],
  },
  {
    icon: "✏️",
    name: "UI/UX Designer",
    tag: "UX",
    desc: "Shapes journeys, wireframes, and interaction patterns.",
    outputs: ["User journey map", "Wireframe guidance", "Interaction patterns"],
  },
  {
    icon: "🎨",
    name: "Frontend Developer",
    tag: "FE",
    desc: "Implements responsive UI and client-side interactions.",
    outputs: ["Component structure", "Responsive behavior", "State and interaction logic"],
  },
  {
    icon: "⚙️",
    name: "Backend Developer",
    tag: "BE",
    desc: "Builds APIs, core logic, and integration endpoints.",
    outputs: ["API contracts", "Service logic", "3rd-party integrations"],
  },
  {
    icon: "🗄️",
    name: "Database Engineer",
    tag: "DB",
    desc: "Designs schemas, indexes, and query performance strategy.",
    outputs: ["Data model and schema", "Index strategy", "Query performance plan"],
  },
  {
    icon: "🚀",
    name: "DevOps",
    tag: "OPS",
    desc: "Owns CI/CD, containers, release automation, and runtime ops.",
    outputs: ["CI/CD workflow", "Deployment setup", "Monitoring and rollback plan"],
  },
  {
    icon: "🧪",
    name: "QA / Test",
    tag: "QA",
    desc: "Defines test plans for reliability across each module.",
    outputs: ["Test matrix", "Regression checks", "Release quality gate"],
  },
  {
    icon: "🔒",
    name: "Security",
    tag: "SEC",
    desc: "Assesses auth, secrets, compliance, and threat models.",
    outputs: ["Threat model", "Auth and secret policy", "Compliance checklist"],
  },
  {
    icon: "🔍",
    name: "Code Review",
    tag: "CR",
    desc: "Improves code quality, consistency, and maintainability.",
    outputs: ["Code quality review", "Refactor opportunities", "Standards and consistency checks"],
  },
  {
    icon: "🐙",
    name: "GitHub",
    tag: "GH",
    desc: "Prepares branching, PR strategy, and release workflows.",
    outputs: ["Branching strategy", "PR template and process", "Release workflow"],
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "💡",
    title: "Describe your idea",
    desc: "Share title, summary, goals, and constraints. Even a rough brief works.",
  },
  {
    step: "02",
    icon: "⚡",
    title: "Generate plans with agents",
    desc: "OpenClaw coordinates 13 agents to produce PM, Agile, architecture, and delivery artifacts.",
  },
  {
    step: "03",
    icon: "🚢",
    title: "Track and ship",
    desc: "Move tasks across the sprint board and monitor progress from one control room.",
  },
];

const FEATURES = [
  { icon: "🗺️", title: "PM Outline", desc: "Scope, milestones, roadmap, and definition of done in seconds." },
  { icon: "📌", title: "Agile Plan", desc: "Epics, stories, priorities, and sprint-ready tasks." },
  { icon: "🧠", title: "Architecture", desc: "Clear technical structure and module boundaries." },
  { icon: "🤖", title: "AI Engineering", desc: "AI integration plan with practical implementation details." },
  { icon: "📦", title: "GitHub Strategy", desc: "PR process, labels, branch policy, and release flow." },
  { icon: "📈", title: "Live Progress", desc: "Status timeline and progress updates as work moves." },
];

const TRUST_SIGNALS = ["Built for founders and agencies", "No-code brief to execution board", "Works with real Agile workflows"];

const IMPACT_POINTS = [
  {
    title: "Skip planning paralysis",
    desc: "Get a complete project direction in minutes instead of waiting for long discovery cycles.",
  },
  {
    title: "Look professional instantly",
    desc: "Share PM and architecture outputs with clients as polished, decision-ready artifacts.",
  },
  {
    title: "Start delivery the same day",
    desc: "Move from raw prompt to sprint tasks and ownership without setup overhead.",
  },
];

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agentHovered, setAgentHovered] = useState<number | null>(null);

  useEffect(() => {
    listProjects()
      .then((res) => setProjects(res.projects))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const generatedCount = projects.filter((p) => p.outline || p.epics.length || p.deliverables).length;

  return (
    <div className="home-layout page-enter">
      <section className="hero-banner reveal">
        <div className="hero-badge">AI-Powered Software Delivery</div>
        <h1 className="hero-headline">
          From idea to
          <br />
          <span className="gradient-text">production-ready plan</span>
          <br />
          in seconds
        </h1>
        <p className="hero-subline">
          OpenClaw coordinates 13 specialized AI agents to generate PM outlines, Agile epics,
          architecture docs, and GitHub delivery strategy from one brief.
        </p>
        <div className="hero-cta-row">
          <Link href="/projects/new">
            <button className="btn-hero">Start a Project</button>
          </Link>
          <a className="ghost-link" href="#agents">Meet the Agents</a>
        </div>

        <div className="stat-bar" aria-label="Platform metrics">
          <div className="stat-item">
            <span className="stat-num accent">{projects.length}</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num accent">{generatedCount}</span>
            <span className="stat-label">Plans Generated</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num amber">13</span>
            <span className="stat-label">AI Agents</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num amber">6</span>
            <span className="stat-label">Flow Modules</span>
          </div>
        </div>
      </section>

      <section className="trust-strip reveal delay-1" aria-label="Trust and fit">
        {TRUST_SIGNALS.map((signal) => (
          <span key={signal} className="trust-chip">{signal}</span>
        ))}
      </section>

      <section className="impact-section reveal delay-1">
        <p className="section-label">Why Teams Choose OpenClaw</p>
        <h2 className="section-h2">Turn ideas into delivery-ready momentum</h2>
        <div className="impact-grid">
          {IMPACT_POINTS.map((point) => (
            <article key={point.title} className="impact-card">
              <h4>{point.title}</h4>
              <p>{point.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="hiw-section reveal delay-1">
        <p className="section-label">How It Works</p>
        <h2 className="section-h2">Three steps from brief to board</h2>
        <div className="hiw-grid">
          {HOW_IT_WORKS.map((item) => (
            <article key={item.step} className="hiw-card">
              <span className="hiw-step-num">{item.step}</span>
              <span className="hiw-icon">{item.icon}</span>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="agents" className="agents-section reveal delay-1">
        <p className="section-label">Agent Roles</p>
        <h2 className="section-h2">13 AI agents, one coordinated crew</h2>
        <p className="section-sub">
          Every role has a focused responsibility so projects move faster with less confusion.
        </p>
        <div className="agents-grid">
          {ALL_AGENTS.map((agent, idx) => (
            <article
              key={agent.name}
              className={`agent-showcase-card${agentHovered === idx ? " hovered" : ""}`}
              onMouseEnter={() => setAgentHovered(idx)}
              onMouseLeave={() => setAgentHovered(null)}
            >
              <div className="agent-showcase-top">
                <span className="agent-showcase-icon">{agent.icon}</span>
                <span className="agent-showcase-tag">{agent.tag}</span>
              </div>
              <h5 className="agent-showcase-name">{agent.name} Agent</h5>
              <p className="agent-showcase-desc">{agent.desc}</p>
              <ul className="agent-showcase-list">
                {agent.outputs.map((output) => (
                  <li key={output}>{output}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="features-section reveal delay-2">
        <p className="section-label">Capabilities</p>
        <h2 className="section-h2">Useful modules built for real delivery</h2>
        <div className="features-grid">
          {FEATURES.map((feat) => (
            <article key={feat.title} className="feature-card">
              <span className="feature-icon">{feat.icon}</span>
              <h5>{feat.title}</h5>
              <p>{feat.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="projects" className="card reveal delay-2">
        <div className="section-head">
          <h3>Your Projects</h3>
          <Link href="/projects/new" className="inline-link">
            + New Project
          </Link>
        </div>
        {loading && <p className="state-text">Loading projects...</p>}
        {error && <p className="state-text danger">{error} - make sure the API server is running.</p>}
        {!loading && !error && !projects.length && (
          <div className="empty-state">
            <div className="empty-mark" aria-hidden="true" />
            <h4>No projects yet</h4>
            <p className="state-text">Create your first project to see all 13 agents go to work.</p>
            <Link href="/projects/new">
              <button>Launch Your First Project</button>
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
                  <span className="meta-tag">{project.intake.priority} priority</span>
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

      <section className="final-cta reveal delay-2">
        <div className="final-cta-copy">
          <p className="section-label">Ready To Start</p>
          <h2>Bring your next project brief and ship faster</h2>
          <p>Start with one prompt, get a plan your team can execute today.</p>
        </div>
        <div className="final-cta-actions">
          <Link href="/projects/new">
            <button className="btn-hero">Create New Project</button>
          </Link>
          <Link href="/docs" className="inline-link">Explore API Docs</Link>
        </div>
      </section>
    </div>
  );
}
