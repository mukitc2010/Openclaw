import Link from "next/link";
import { notFound } from "next/navigation";

import { AGENT_PROFILES, getAgentBySlug } from "@/lib/agents";

type AgentDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return AGENT_PROFILES.map((agent) => ({ slug: agent.slug }));
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);

  if (!agent) {
    notFound();
  }

  return (
    <div className="agent-detail-layout page-enter">
      <section className="agent-detail-hero reveal">
        <Link href="/#agents" className="inline-link">Back to Agents</Link>
        <div className="agent-detail-head">
          <span className="agent-detail-icon" aria-hidden="true">{agent.icon}</span>
          <div>
            <p className="section-label">{agent.tag} Agent Profile</p>
            <h1>{agent.name}</h1>
            <p>{agent.desc}</p>
          </div>
        </div>
      </section>

      <section className="agent-detail-card card reveal delay-1">
        <h2 className="section-h2">Primary Outputs</h2>
        <ul className="agent-detail-list">
          {agent.outputs.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="agent-detail-card card reveal delay-1">
        <h2 className="section-h2">Responsibilities</h2>
        <ul className="agent-detail-list">
          {agent.responsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="agent-detail-card card reveal delay-2">
        <h2 className="section-h2">Handoff</h2>
        <p className="agent-detail-handoff">This agent primarily hands off to <strong>{agent.handoffTo}</strong>.</p>
        <div className="agent-detail-actions">
          <Link href="/projects/new">
            <button>Start Project With This Agent</button>
          </Link>
          <Link href="/docs" className="inline-link">Open API Docs</Link>
        </div>
      </section>
    </div>
  );
}
