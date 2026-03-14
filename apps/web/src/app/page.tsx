"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { listProjects } from "@/lib/api";
import { AGENT_PROFILES } from "@/lib/agents";
import { ProjectRecord } from "@/types";

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "💡",
    title: "Describe your idea",
    desc: "Share title, summary, goals, and constraints. Even a rough brief works.",
    details: [
      "Capture the problem, target user, and desired outcome in plain language.",
      "Add constraints like budget, timeline, integrations, and team size.",
      "Clarify success criteria so every generated plan aligns to your goals.",
    ],
  },
  {
    step: "02",
    icon: "⚡",
    title: "Generate plans with agents",
    desc: "robolog.us coordinates 13 agents to produce PM, Agile, architecture, and delivery artifacts.",
    details: [
      "Get PM scope, milestones, and roadmap decisions in one coordinated pass.",
      "Receive Agile-ready epics, stories, priorities, and sprint task breakdowns.",
      "Produce architecture, AI integration, and GitHub workflow handoff documents.",
    ],
  },
  {
    step: "03",
    icon: "🚢",
    title: "Track and ship",
    desc: "Move tasks across the sprint board and monitor progress from one control room.",
    details: [
      "Use one board to track ownership, status, and blockers across the team.",
      "Review progress snapshots to keep stakeholders aligned each sprint.",
      "Ship with confidence using clear handoffs from planning to execution.",
    ],
  },
];

const FEATURES = [
  {
    icon: "🗺️",
    title: "PM Outline",
    desc: "Scope, milestones, roadmap, and definition of done in seconds.",
    details: [
      "Auto-generated project charter with measurable outcomes.",
      "Milestone sequencing with dependencies and timeline checkpoints.",
      "Definition-of-done criteria aligned to product and delivery goals.",
    ],
  },
  {
    icon: "📌",
    title: "Agile Plan",
    desc: "Epics, stories, priorities, and sprint-ready tasks.",
    details: [
      "Backlog organized by value, risk, and implementation effort.",
      "User stories with acceptance criteria and owner-ready task cuts.",
      "Sprint slices that help teams start execution immediately.",
    ],
  },
  {
    icon: "🧠",
    title: "Architecture",
    desc: "Clear technical structure and module boundaries.",
    details: [
      "System layers mapped for frontend, backend, data, and integrations.",
      "Module boundaries that reduce coupling and simplify ownership.",
      "Scalable baseline decisions for security, reliability, and growth.",
    ],
  },
  {
    icon: "🤖",
    title: "AI Engineering",
    desc: "AI integration plan with practical implementation details.",
    details: [
      "Model and provider selection guidance based on use case needs.",
      "Prompt, eval, and fallback strategy for production-safe behavior.",
      "Operational guardrails for latency, quality, and cost controls.",
    ],
  },
  {
    icon: "📦",
    title: "GitHub Strategy",
    desc: "PR process, labels, branch policy, and release flow.",
    details: [
      "Branch model and review gates for clean team collaboration.",
      "Label taxonomy for priority, scope, and release tracking.",
      "Release workflow from merge to deploy with rollback readiness.",
    ],
  },
  {
    icon: "📈",
    title: "Live Progress",
    desc: "Status timeline and progress updates as work moves.",
    details: [
      "Shared timeline view for project health and sprint momentum.",
      "Clear status transitions from planned to in-progress to shipped.",
      "Board-level visibility into blockers and delivery throughput.",
    ],
  },
];

const LAUNCH_PATHS = [
  {
    title: "Founder Sprint",
    desc: "Start with a short prompt and leave with a client-ready project blueprint in one session.",
    eta: "~15 min",
  },
  {
    title: "Agency Delivery Pack",
    desc: "Generate PM, Agile, architecture, and handoff docs to kick off paid delivery immediately.",
    eta: "~30 min",
  },
  {
    title: "Product Team Mode",
    desc: "Align roles across planning, implementation, and quality with one shared execution board.",
    eta: "~45 min",
  },
];

const TRUST_SIGNALS = ["Built for founders and agencies", "No-code brief to execution board", "Works with real Agile workflows"];

const PROOF_METRICS = [
  { value: "13", label: "specialist agents orchestrated in one flow" },
  { value: "6", label: "delivery modules across PM, Agile, architecture, AI, QA, and GitHub" },
  { value: "1", label: "shared control room for planning, execution, and quality gates" },
];

const ENTERPRISE_PILLARS = [
  {
    title: "Enterprise governance",
    desc: "Role clarity, artifact traceability, and delivery checkpoints designed for larger teams and executive oversight.",
  },
  {
    title: "Security-minded architecture",
    desc: "Service boundaries, deployment workflows, and QA outputs that support formal review, risk reduction, and release discipline.",
  },
  {
    title: "Decision-ready outputs",
    desc: "Project plans, sprint tasks, architecture notes, and GitHub strategy generated in formats stakeholders can act on immediately.",
  },
];

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
        <div className="hero-badge">robolog.us • AI-Powered Software Delivery</div>
        <h1 className="hero-headline">
          From idea to
          <br />
          <span className="gradient-text">production-ready plan</span>
          <br />
          in seconds
        </h1>
        <p className="hero-subline">
          robolog.us coordinates 13 specialized AI agents to generate PM outlines, Agile epics,
          architecture docs, and GitHub delivery strategy from one brief.
        </p>
        <div className="hero-cta-row">
          <Link href="/projects/new">
            <button className="btn-hero">Start a Project</button>
          </Link>
          <Link href="/book-demo">
            <button className="secondary">Book Demo</button>
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

      <section className="enterprise-proof-section reveal delay-1">
        <div className="enterprise-proof-copy">
          <p className="section-label">Enterprise Readiness</p>
          <h2 className="section-h2">Built to earn trust from larger engineering organizations</h2>
          <p className="section-sub">
            robolog.us is positioned as more than a planning toy. It is structured to support governed delivery,
            visible ownership, and decision-ready outputs that teams can use in real operating environments.
          </p>
        </div>
        <div className="enterprise-proof-metrics" aria-label="Enterprise proof points">
          {PROOF_METRICS.map((metric) => (
            <article key={metric.label} className="enterprise-proof-stat">
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </div>
        <div className="enterprise-proof-grid">
          {ENTERPRISE_PILLARS.map((pillar) => (
            <article key={pillar.title} className="enterprise-proof-card">
              <h4>{pillar.title}</h4>
              <p>{pillar.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="impact-section reveal delay-1">
        <p className="section-label">Why Teams Choose robolog.us</p>
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
              <ul className="hiw-detail-list" aria-label={`${item.title} details`}>
                {item.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
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
          {AGENT_PROFILES.map((agent) => (
            <Link
              key={agent.slug}
              href={`/agents/${agent.slug}`}
              className="agent-showcase-card agent-showcase-link"
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
            </Link>
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
              <ul className="feature-detail-list" aria-label={`${feat.title} details`}>
                {feat.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="launch-paths-section reveal delay-2">
        <p className="section-label">Launch Paths</p>
        <h2 className="section-h2">Choose how you want to move from idea to execution</h2>
        <p className="section-sub">
          Whether you are a solo founder or a full team, robolog.us gives you a practical route to ship faster.
        </p>
        <div className="launch-paths-grid">
          {LAUNCH_PATHS.map((path) => (
            <article key={path.title} className="launch-path-card">
              <div className="launch-path-head">
                <h4>{path.title}</h4>
                <span className="launch-path-eta">{path.eta}</span>
              </div>
              <p>{path.desc}</p>
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
        {error && <p className="state-text danger">{error}</p>}
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
          <Link href="/contact-sales">
            <button className="secondary">Contact Sales</button>
          </Link>
          <Link href="/book-demo" className="inline-link">Book Demo</Link>
          <Link href="/docs" className="inline-link">Explore API Docs</Link>
        </div>
      </section>
    </div>
  );
}
