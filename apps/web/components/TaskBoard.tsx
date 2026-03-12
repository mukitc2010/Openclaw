"use client";

import { useMemo, useState } from "react";

import { Task, TaskStatus } from "@/types";

export function TaskBoard({
  tasks,
  onStatusChange,
  disabled,
}: {
  tasks: Task[];
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  disabled?: boolean;
}) {
  const [ownerFilter, setOwnerFilter] = useState("all");
  const columns: Array<{ key: Task["status"]; title: string }> = [
    { key: "backlog", title: "Backlog" },
    { key: "in_progress", title: "In Progress" },
    { key: "blocked", title: "Blocked" },
    { key: "done", title: "Done" },
  ];

  const owners = useMemo(() => {
    const values = Array.from(new Set(tasks.map((task) => task.owner_agent)));
    values.sort();
    return values;
  }, [tasks]);

  const visibleTasks =
    ownerFilter === "all" ? tasks : tasks.filter((task) => task.owner_agent === ownerFilter);

  return (
    <div className="grid taskboard-shell" style={{ gap: 10 }}>
      <div className="taskboard-filter">
        <label>Owner View</label>
        <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
          <option value="all">All Agents</option>
          {owners.map((owner) => (
            <option key={owner} value={owner}>
              {owner}
            </option>
          ))}
        </select>
      </div>

      <div className="taskboard-columns">
      {columns.map((col) => (
        <section key={col.key} className="task-column card">
          <h3 className="task-column-title">{col.title}</h3>
          {(visibleTasks.filter((task) => task.status === col.key) || []).map((task) => (
            <article key={task.id} className="task-card-item">
              <strong>{task.id}</strong>
              <div>{task.title}</div>
              <small>{task.owner_agent}</small>
              {onStatusChange && (
                <div className="task-status-select">
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                    disabled={disabled}
                  >
                    <option value="backlog">Backlog</option>
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              )}
            </article>
          ))}
          {visibleTasks.every((task) => task.status !== col.key) && <p className="state-text">No tasks</p>}
        </section>
      ))}
      </div>
    </div>
  );
}
