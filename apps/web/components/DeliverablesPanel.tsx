"use client";

import { useState } from "react";
import { DeliverableBundle } from "@/types";

const MODULES = [
  {
    key: "project_plan" as const,
    label: "PROJECT_PLAN.md",
    icon: "📋",
    desc: "Full project plan with milestones and scope",
    module: "PM Outline",
  },
  {
    key: "agile_plan" as const,
    label: "AGILE_PLAN.md",
    icon: "🔄",
    desc: "Sprint structure, epics, and agile ceremonies",
    module: "Agile Planner",
  },
  {
    key: "architecture" as const,
    label: "ARCHITECTURE.md",
    icon: "🏗️",
    desc: "System design, components, and data flows",
    module: "Architecture",
  },
  {
    key: "ai_engineering_plan" as const,
    label: "AI_ENGINEERING_PLAN.md",
    icon: "🤖",
    desc: "AI/ML system design and model strategy",
    module: "AI Engineering",
  },
  {
    key: "agents" as const,
    label: "AGENTS.md",
    icon: "🕵️",
    desc: "Agent roles, tools, and collaboration protocols",
    module: "Agents",
  },
  {
    key: "github_strategy" as const,
    label: "GITHUB_STRATEGY.md",
    icon: "🚀",
    desc: "CI/CD, branching strategy, and delivery pipeline",
    module: "GitHub Delivery",
  },
];

export function DeliverablesPanel({
  deliverables,
}: {
  deliverables: DeliverableBundle | null;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const generatedCount = MODULES.filter((m) => deliverables?.[m.key]).length;

  return (
    <section className="card">
      <h3 className="section-title">Flow Modules</h3>
      <p className="section-meta">
        {generatedCount} of {MODULES.length} modules generated · click to expand content
      </p>
      <div className="flow-modules-list">
        {MODULES.map((mod) => {
          const content = deliverables?.[mod.key] ?? null;
          const isOpen = expanded === mod.key;
          const generated = Boolean(content);

          return (
            <div
              key={mod.key}
              className={`flow-module-card${isOpen ? " open" : ""}${!generated ? " pending" : ""}`}
              role="button"
              tabIndex={generated ? 0 : -1}
              aria-expanded={isOpen}
              aria-disabled={!generated}
              onClick={() => generated && setExpanded(isOpen ? null : mod.key)}
              onKeyDown={(e) =>
                e.key === "Enter" && generated && setExpanded(isOpen ? null : mod.key)
              }
            >
              <div className="flow-module-header">
                <span className="module-icon">{mod.icon}</span>
                <div className="module-info">
                  <strong className="module-label">{mod.label}</strong>
                  <span className="module-desc">{mod.desc}</span>
                </div>
                <span className={`module-status-badge ${generated ? "generated" : "pending"}`}>
                  {generated ? "Generated" : "Pending"}
                </span>
                {generated && (
                  <span className="module-chevron">{isOpen ? "▲" : "▼"}</span>
                )}
              </div>

              {isOpen && content && (
                <div className="flow-module-body">
                  <pre className="deliverable-pre">{content}</pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
