"use client";

import { useState } from "react";
import { AgentAssignment, Task } from "@/types";

const ROLE_ICONS: Record<string, string> = {
  pm: "📋",
  frontend: "🎨",
  backend: "⚙️",
  qa: "🧪",
  devops: "🚀",
  security: "🔒",
  data: "📊",
  ai: "🤖",
  design: "✏️",
};

function getIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(ROLE_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "🤖";
}

export function AssignmentMatrix({
  assignments,
  tasks = [],
}: {
  assignments: AgentAssignment[];
  tasks?: Task[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!assignments.length) {
    return (
      <section className="card">
        <h3 className="section-title">Agent Roles</h3>
        <div className="empty-state compact">
          <div className="empty-mark" aria-hidden="true" />
          <h4>No agents assigned yet</h4>
          <p className="state-text">Run generation to assign agents to tasks.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <h3 className="section-title">Agent Roles</h3>
      <p className="section-meta">
        {assignments.length} agent{assignments.length !== 1 ? "s" : ""} · click a role to see activity
      </p>
      <div className="agent-roles-grid">
        {assignments.map((agent) => {
          const isOpen = expanded === agent.agent_name;
          const activeTasks = tasks.filter((t) => agent.active_task_ids.includes(t.id));
          const statusCounts = activeTasks.reduce<Record<string, number>>((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
          }, {});

          return (
            <div
              key={agent.agent_name}
              className={`agent-role-card${isOpen ? " open" : ""}`}
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={() => setExpanded(isOpen ? null : agent.agent_name)}
              onKeyDown={(e) => e.key === "Enter" && setExpanded(isOpen ? null : agent.agent_name)}
            >
              <div className="agent-role-header">
                <span className="agent-icon">{getIcon(agent.agent_name)}</span>
                <div className="agent-role-info">
                  <strong className="agent-name">{agent.agent_name}</strong>
                  <span className="agent-task-count">
                    {agent.active_task_ids.length} active task{agent.active_task_ids.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <span className="agent-chevron">{isOpen ? "▲" : "▼"}</span>
              </div>

              {isOpen && (
                <div className="agent-role-body">
                  <div className="agent-responsibilities">
                    <h5>Responsibilities</h5>
                    <div className="resp-tags">
                      {agent.responsibilities.map((r) => (
                        <span key={r} className="resp-tag">{r}</span>
                      ))}
                    </div>
                  </div>

                  {activeTasks.length > 0 && (
                    <div className="agent-activity">
                      <h5>Task Activity</h5>
                      <div className="activity-status-row">
                        {Object.entries(statusCounts).map(([status, count]) => (
                          <span key={status} className={`activity-pill status-${status}`}>
                            {count} {status.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                      <ul className="agent-task-list">
                        {activeTasks.map((t) => (
                          <li key={t.id} className="agent-task-item">
                            <span className={`task-status-dot status-${t.status}`} />
                            <span className="task-item-title">{t.title}</span>
                            <span className={`task-badge status-${t.status}`}>
                              {t.status.replace("_", " ")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTasks.length === 0 && (
                    <p className="state-text" style={{ marginTop: 8 }}>No active tasks currently assigned.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
