"use client";

import { useEffect, useState } from "react";
import { AgentAssignment, Epic, Task, TaskStatus } from "@/types";

interface AgileBoardProps {
  epics: Epic[];
  tasks: Task[];
  assignments: AgentAssignment[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onStartStory: (storyId: string) => void;
  disabled?: boolean;
  densityStorageKey?: string;
}

const STATUS_COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "in_progress", label: "In Progress" },
  { key: "blocked", label: "Blocked" },
  { key: "done", label: "Done" },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

export function AgileBoard({
  epics,
  tasks,
  assignments,
  onStatusChange,
  onStartStory,
  disabled,
  densityStorageKey,
}: AgileBoardProps) {
  const [view, setView] = useState<"stories" | "board">("stories");
  const [sprint, setSprint] = useState<number | "all">("all");
  const [openEpics, setOpenEpics] = useState<Set<string>>(new Set(epics.map((e) => e.id)));
  const [ownerFilter, setOwnerFilter] = useState("");
  const [storySort, setStorySort] = useState<"priority" | "progress" | "title">("priority");
  const [taskQuery, setTaskQuery] = useState("");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  useEffect(() => {
    if (!densityStorageKey) {
      return;
    }
    try {
      const saved = window.localStorage.getItem(densityStorageKey);
      if (saved === "compact" || saved === "comfortable") {
        setDensity(saved);
      }
    } catch {
      // Ignore local storage read errors.
    }
  }, [densityStorageKey]);

  useEffect(() => {
    if (!densityStorageKey) {
      return;
    }
    try {
      window.localStorage.setItem(densityStorageKey, density);
    } catch {
      // Ignore local storage write errors.
    }
  }, [density, densityStorageKey]);

  const sprints = Array.from(new Set(tasks.map((t) => t.sprint))).sort((a, b) => a - b);
  const visibleTasks = sprint === "all" ? tasks : tasks.filter((t) => t.sprint === sprint);
  const filteredTasks = (ownerFilter ? visibleTasks.filter((t) => t.owner_agent === ownerFilter) : visibleTasks).filter(
    (t) =>
      taskQuery.trim().length === 0 ||
      t.title.toLowerCase().includes(taskQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(taskQuery.toLowerCase()) ||
      t.story_id.toLowerCase().includes(taskQuery.toLowerCase()),
  );

  const allAgents = Array.from(new Set(tasks.map((t) => t.owner_agent))).sort();

  const totalStories = epics.reduce((acc, epic) => acc + epic.stories.length, 0);
  const completedTasks = visibleTasks.filter((t) => t.status === "done").length;
  const blockedTasks = visibleTasks.filter((t) => t.status === "blocked").length;
  const activeAgents = new Set(
    assignments.filter((a) => a.active_task_ids.length > 0).map((a) => a.agent_name),
  ).size;

  function priorityRank(p: string): number {
    if (p === "critical") return 0;
    if (p === "high") return 1;
    if (p === "medium") return 2;
    return 3;
  }

  function toggleEpic(id: string) {
    setOpenEpics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function storyTasks(storyId: string) {
    return visibleTasks.filter((t) => t.story_id === storyId);
  }

  function storyProgress(storyId: string) {
    const st = storyTasks(storyId);
    if (!st.length) return 0;
    return Math.round((st.filter((t) => t.status === "done").length / st.length) * 100);
  }

  function canStartStory(storyId: string) {
    const st = storyTasks(storyId);
    return st.length > 0 && st.some((t) => t.status === "backlog");
  }

  function sortedStories(stories: Epic["stories"]) {
    const items = [...stories];
    if (storySort === "title") {
      items.sort((a, b) => a.title.localeCompare(b.title));
      return items;
    }
    if (storySort === "progress") {
      items.sort((a, b) => storyProgress(b.id) - storyProgress(a.id));
      return items;
    }
    items.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
    return items;
  }

  function expandAllEpics() {
    setOpenEpics(new Set(epics.map((e) => e.id)));
  }

  function collapseAllEpics() {
    setOpenEpics(new Set());
  }

  if (epics.length === 0) {
    return (
      <div className="empty-state compact">
        <div className="empty-mark" aria-hidden="true" />
        <h4>No epics yet</h4>
        <p className="state-text">Run the Agile Planner module to generate epics, stories, and tasks.</p>
      </div>
    );
  }

  return (
    <div className={`agile-board-root density-${density}`}>
      <div className="agile-kpis" role="status" aria-live="polite">
        <div className="agile-kpi-card">
          <p className="agile-kpi-label">Stories</p>
          <p className="agile-kpi-value">{totalStories}</p>
        </div>
        <div className="agile-kpi-card">
          <p className="agile-kpi-label">Done Tasks</p>
          <p className="agile-kpi-value">{completedTasks}/{visibleTasks.length || 0}</p>
        </div>
        <div className="agile-kpi-card">
          <p className="agile-kpi-label">Blocked</p>
          <p className="agile-kpi-value">{blockedTasks}</p>
        </div>
        <div className="agile-kpi-card">
          <p className="agile-kpi-label">Active Agents</p>
          <p className="agile-kpi-value">{activeAgents}</p>
        </div>
      </div>

      {/* Controls bar */}
      <div className="agile-controls">
        <div className="agile-view-tabs">
          <button
            className={`agile-tab ${view === "stories" ? "agile-tab-active" : ""}`}
            onClick={() => setView("stories")}
          >
            Story View
          </button>
          <button
            className={`agile-tab ${view === "board" ? "agile-tab-active" : ""}`}
            onClick={() => setView("board")}
          >
            Sprint Board
          </button>
        </div>

        <div className="agile-sprint-tabs">
          <button
            className={`sprint-tab ${sprint === "all" ? "sprint-tab-active" : ""}`}
            onClick={() => setSprint("all")}
          >
            All Sprints
          </button>
          {sprints.map((s) => (
            <button
              key={s}
              className={`sprint-tab ${sprint === s ? "sprint-tab-active" : ""}`}
              onClick={() => setSprint(s)}
            >
              Sprint {s}
            </button>
          ))}
        </div>

        <div className="agile-density-toggle" role="group" aria-label="Board density">
          <button
            className={`agile-density-btn ${density === "comfortable" ? "agile-density-btn-active" : ""}`}
            onClick={() => setDensity("comfortable")}
            type="button"
          >
            Comfortable
          </button>
          <button
            className={`agile-density-btn ${density === "compact" ? "agile-density-btn-active" : ""}`}
            onClick={() => setDensity("compact")}
            type="button"
          >
            Compact
          </button>
        </div>

        {view === "board" && (
          <>
            <input
              className="agile-task-search"
              placeholder="Search task, story, or ID..."
              value={taskQuery}
              onChange={(e) => setTaskQuery(e.target.value)}
              aria-label="Search tasks"
            />
            <select
              className="taskboard-filter"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
            >
              <option value="">All agents</option>
              {allAgents.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </>
        )}

        {view === "stories" && (
          <>
            <select
              className="taskboard-filter"
              value={storySort}
              onChange={(e) => setStorySort(e.target.value as "priority" | "progress" | "title")}
              aria-label="Sort stories"
            >
              <option value="priority">Sort: Priority</option>
              <option value="progress">Sort: Progress</option>
              <option value="title">Sort: Title</option>
            </select>
            <div className="agile-epic-actions">
              <button className="secondary" onClick={expandAllEpics} type="button">Expand all</button>
              <button className="secondary" onClick={collapseAllEpics} type="button">Collapse all</button>
            </div>
          </>
        )}
      </div>

      {/* Story View */}
      {view === "stories" && (
        <div className="epic-list">
          {epics.map((epic) => {
            const isOpen = openEpics.has(epic.id);
            const epicTasks = visibleTasks.filter((t) =>
              epic.stories.some((s) => s.id === t.story_id)
            );
            const epicDone = epicTasks.filter((t) => t.status === "done").length;
            const epicProgress = epicTasks.length
              ? Math.round((epicDone / epicTasks.length) * 100)
              : 0;

            return (
              <div key={epic.id} className="epic-accordion">
                <button
                  className="epic-header"
                  onClick={() => toggleEpic(epic.id)}
                  aria-expanded={isOpen}
                >
                  <span className="epic-toggle">{isOpen ? "▼" : "▶"}</span>
                  <span className="epic-id">{epic.id}</span>
                  <span className="epic-title">{epic.title}</span>
                  <span className="epic-feature">{epic.feature}</span>
                  <span className="epic-meta">
                    {epic.stories.length} {epic.stories.length === 1 ? "story" : "stories"}
                  </span>
                  <div className="epic-progress-wrap">
                    <div className="epic-progress-track">
                      <div className="epic-progress-bar" style={{ width: `${epicProgress}%` }} />
                    </div>
                    <span className="epic-progress-pct">{epicProgress}%</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="epic-stories">
                    {sortedStories(epic.stories).map((story) => {
                      const sTasks = storyTasks(story.id);
                      const progress = storyProgress(story.id);
                      const agentOwners = Array.from(new Set(sTasks.map((t) => t.owner_agent)));
                      const isCompleted = sTasks.length > 0 && progress === 100;

                      return (
                        <div key={story.id} className="story-card">
                          <div className="story-card-head">
                            <div className="story-card-title-row">
                              <span className="story-id">{story.id}</span>
                              <h4 className="story-title">{story.title}</h4>
                              <span
                                className="story-priority-badge"
                                style={{ background: PRIORITY_COLORS[story.priority] + "22", color: PRIORITY_COLORS[story.priority] }}
                              >
                                {story.priority}
                              </span>
                            </div>
                            <p className="story-description">{story.description}</p>
                          </div>

                          {story.acceptance_criteria.length > 0 && (
                            <div className="story-ac">
                              <p className="story-ac-label">Acceptance Criteria</p>
                              <ul className="story-ac-list">
                                {story.acceptance_criteria.map((ac, idx) => (
                                  <li key={idx} className="ac-item">
                                    <span
                                      className={`ac-check ${sTasks.length > 0 && progress === 100 ? "ac-check-done" : ""}`}
                                    >
                                      {progress === 100 ? "✓" : "○"}
                                    </span>
                                    {ac.criteria}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="story-footer">
                            <div className="story-task-summary">
                              {sTasks.length > 0 ? (
                                <>
                                  <span className="story-task-count">{sTasks.length} task{sTasks.length !== 1 ? "s" : ""}</span>
                                  <div className="story-mini-progress">
                                    <div className="story-mini-bar" style={{ width: `${progress}%` }} />
                                  </div>
                                  <span className="story-pct">{progress}%</span>
                                  {agentOwners.slice(0, 3).map((a) => (
                                    <span key={a} className="story-agent-chip">{a}</span>
                                  ))}
                                  {agentOwners.length > 3 && (
                                    <span className="story-agent-chip">+{agentOwners.length - 3}</span>
                                  )}
                                </>
                              ) : (
                                <span className="state-text">No tasks for current sprint filter</span>
                              )}
                            </div>

                            <button
                              className="start-story-btn"
                              disabled={disabled || isCompleted || !canStartStory(story.id)}
                              onClick={() => onStartStory(story.id)}
                            >
                              {isCompleted ? "✓ Completed" : canStartStory(story.id) ? "▶ Start Story" : "✓ In Progress"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sprint Board View */}
      {view === "board" && (
        <div className="taskboard-columns">
          {STATUS_COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="task-column">
                <p className="task-column-title">
                  {col.label} <span style={{ opacity: 0.6 }}>({colTasks.length})</span>
                </p>
                {colTasks.length === 0 && (
                  <p style={{ fontSize: 13, color: "var(--muted)", padding: "8px 0" }}>Empty</p>
                )}
                {colTasks.map((task) => {
                  const epicForTask = epics.find((ep) =>
                    ep.stories.some((s) => s.id === task.story_id)
                  );
                  return (
                    <div key={task.id} className={`task-card-item density-${density}`}>
                      <small>{task.id}</small>
                      {epicForTask && (
                        <span className="task-epic-label">{epicForTask.id}</span>
                      )}
                      <p style={{ margin: "6px 0 4px", fontSize: 14, fontWeight: 500 }}>{task.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--subtle)" }}>{task.owner_agent}</p>
                      <select
                        className="task-status-select"
                        value={task.status}
                        disabled={disabled}
                        onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                      >
                        <option value="backlog">Backlog</option>
                        <option value="in_progress">In Progress</option>
                        <option value="blocked">Blocked</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
