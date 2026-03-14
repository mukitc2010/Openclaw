"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { AgileBoard } from "@/components/AgileBoard";
import { AssignmentMatrix } from "@/components/AssignmentMatrix";
import { DeliverablesPanel } from "@/components/DeliverablesPanel";
import { useToast } from "@/components/ToastProvider";
import {
  generateAIEngineering,
  generateAgile,
  generateArchitecture,
  generateGithub,
  generateOutline,
  generateProject,
  generateTesting,
  getProject,
  getProjectStatus,
  startStory,
  updateTaskStatus,
} from "@/lib/api";
import { ProjectRecord, StatusTimeline, TaskStatus } from "@/types";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const projectId = params.id;
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [timeline, setTimeline] = useState<StatusTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [moduleRunning, setModuleRunning] = useState<string>("");
  const [error, setError] = useState("");
  const [pmDirective, setPmDirective] = useState("");
  const [pmLog, setPmLog] = useState<{ text: string; ts: string }[]>([]);
  const [sendingDirective, setSendingDirective] = useState(false);
  const pmLogRef = useRef<HTMLDivElement>(null);

  async function load() {
    if (!projectId) {
      return;
    }
    try {
      const [p, s] = await Promise.all([getProject(projectId), getProjectStatus(projectId)]);
      setProject(p);
      setTimeline(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) {
      return;
    }
    try {
      const raw = window.localStorage.getItem(`openclaw:pm-directives:${projectId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as { text: string; ts: string }[];
        setPmLog(parsed);
      }
    } catch {
      // Ignore malformed local data and continue with fresh state.
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) {
      return;
    }
    window.localStorage.setItem(`openclaw:pm-directives:${projectId}`, JSON.stringify(pmLog));
  }, [pmLog, projectId]);

  useEffect(() => {
    const onQuickAction = (event: Event) => {
      const custom = event as CustomEvent<{ action?: string }>;
      const action = custom.detail?.action;

      if (action === "generate_all") {
        void runGeneration();
      }
      if (action === "run_outline") {
        void runModule("outline", () => generateOutline(projectId));
      }
      if (action === "run_agile") {
        void runModule("agile", () => generateAgile(projectId));
      }
      if (action === "run_architecture") {
        void runModule("architecture", () => generateArchitecture(projectId));
      }
      if (action === "run_testing") {
        void runModule("testing", () => generateTesting(projectId));
      }
    };

    window.addEventListener("openclaw:quick-action", onQuickAction as EventListener);
    return () => window.removeEventListener("openclaw:quick-action", onQuickAction as EventListener);
  }, [projectId]);

  async function runGeneration() {
    if (!projectId) {
      return;
    }
    setRunning(true);
    setError("");
    try {
      const updated = await generateProject(projectId);
      setProject(updated);
      const status = await getProjectStatus(projectId);
      setTimeline(status);
      toast({ type: "success", message: "Full project generation complete." });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      toast({ type: "error", message: "Generation failed." });
    } finally {
      setRunning(false);
    }
  }

  async function runModule(name: string, operation: () => Promise<ProjectRecord>) {
    setModuleRunning(name);
    setError("");
    try {
      const updated = await operation();
      setProject(updated);
      const status = await getProjectStatus(projectId);
      setTimeline(status);
      toast({ type: "success", message: `${name} module completed.` });
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to run ${name}`);
      toast({ type: "error", message: `Failed to run ${name}.` });
    } finally {
      setModuleRunning("");
    }
  }

  async function onTaskStatusChange(taskId: string, status: TaskStatus) {
    if (!projectId) {
      return;
    }
    try {
      const updated = await updateTaskStatus(projectId, taskId, status);
      setProject(updated);
      const statusFeed = await getProjectStatus(projectId);
      setTimeline(statusFeed);
      toast({ type: "info", message: `Task ${taskId} moved to ${status}.` });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task status");
      toast({ type: "error", message: "Failed to update task status." });
    }
  }

  async function onStartStory(storyId: string) {
    if (!projectId) return;
    try {
      const updated = await startStory(projectId, storyId);
      setProject(updated);
      const statusFeed = await getProjectStatus(projectId);
      setTimeline(statusFeed);
      toast({ type: "success", message: `Story ${storyId} is now in progress.` });
    } catch (err) {
      toast({ type: "error", message: `Could not start story ${storyId}.` });
    }
  }

  function sendPmDirective() {
    if (!pmDirective.trim()) return;
    setSendingDirective(true);
    const entry = { text: pmDirective.trim(), ts: new Date().toLocaleTimeString() };
    setPmLog((prev) => [...prev, entry]);
    setPmDirective("");
    setTimeout(() => {
      setSendingDirective(false);
      if (pmLogRef.current) {
        pmLogRef.current.scrollTop = pmLogRef.current.scrollHeight;
      }
    }, 600);
  }

  function clearPmLog() {
    setPmLog([]);
    if (projectId) {
      window.localStorage.removeItem(`openclaw:pm-directives:${projectId}`);
    }
  }

  if (loading) {
    return <p>Loading project...</p>;
  }

  if (!project) {
    return <p>Project not found.</p>;
  }

  const latest = timeline?.items[timeline.items.length - 1];
  const progress = latest ? latest.progress_percent : 0;

  return (
    <div className="project-detail-layout page-enter">
      <section className="card project-hero reveal">
        <div className="project-hero-head">
          <div>
            <h2>{project.intake.title}</h2>
            <p className="project-summary">{project.intake.summary}</p>
          </div>
          <span className="priority-chip">Priority: {project.intake.priority}</span>
        </div>

        <div className="progress-wrap" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-label">Progress {progress}%</p>
        </div>

        <div className="generation-actions">
          <button onClick={runGeneration} disabled={running}>
            {running ? "Generating..." : "Generate PM + Agile + Tech Plans"}
          </button>

          <button
            className="secondary"
            onClick={() => runModule("outline", () => generateOutline(projectId))}
            disabled={moduleRunning.length > 0}
          >
            {moduleRunning === "outline" ? "Running Outline..." : "Run PM Outline"}
          </button>
          <button
            className="secondary"
            onClick={() => runModule("agile", () => generateAgile(projectId))}
            disabled={moduleRunning.length > 0}
          >
            {moduleRunning === "agile" ? "Running Agile..." : "Run Agile Planner"}
          </button>
          <button
            className="secondary"
            onClick={() => runModule("architecture", () => generateArchitecture(projectId))}
            disabled={moduleRunning.length > 0}
          >
            {moduleRunning === "architecture" ? "Running Architecture..." : "Run Architecture Module"}
          </button>
          <button
            className="secondary"
            onClick={() => runModule("ai", () => generateAIEngineering(projectId))}
            disabled={moduleRunning.length > 0}
          >
            {moduleRunning === "ai" ? "Running AI..." : "Run AI Engineering"}
          </button>
          <button
            className="secondary"
            onClick={() => runModule("github", () => generateGithub(projectId))}
            disabled={moduleRunning.length > 0}
          >
            {moduleRunning === "github" ? "Running GitHub..." : "Run GitHub Delivery"}
          </button>
          <button
            className="secondary"
            onClick={() => runModule("testing", () => generateTesting(projectId))}
            disabled={moduleRunning.length > 0}
          >
            {moduleRunning === "testing" ? "Running Testing..." : "Run QA Testing"}
          </button>
        </div>
        {error && <p className="state-text danger">{error}</p>}
      </section>

      <section id="outline" className="card reveal delay-1">
        <h3 className="section-title">Project Outline</h3>
        {!project.outline && (
          <div className="empty-state compact">
            <div className="empty-mark" aria-hidden="true" />
            <h4>Outline not generated</h4>
            <p className="state-text">Run PM Outline or full generation to populate scope and roadmap.</p>
          </div>
        )}
        {project.outline && (
          <div className="outline-grid">
            <div>
              <h4>Scope</h4>
              <ul>
                {project.outline.scope.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Roadmap</h4>
              <ul>
                {project.outline.roadmap.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <section id="sprint" className="card reveal delay-2">
        <h3 className="section-title">Agile Board</h3>
        <AgileBoard
          epics={project.epics}
          tasks={project.tasks}
          assignments={project.assignments}
          onStatusChange={onTaskStatusChange}
          onStartStory={onStartStory}
          disabled={moduleRunning.length > 0}
          densityStorageKey={`openclaw:agile-density:${projectId}`}
        />
      </section>

      {/* PM Directive Panel */}
      <section className="card pm-directive-panel reveal delay-2">
        <h3 className="section-title">PM Directive</h3>
        <p className="state-text">Send a new instruction to all agents. Directives are stored per project so your team can keep context across refreshes.</p>
        <div className="pm-directive-input-row">
          <textarea
            className="pm-directive-textarea"
            placeholder="E.g. Focus sprint 2 on auth and dashboard. Postpone analytics module."
            value={pmDirective}
            onChange={(e) => setPmDirective(e.target.value)}
            rows={3}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendPmDirective(); }}
          />
          <div className="pm-directive-actions">
            <button
              className="pm-directive-send-btn"
              onClick={sendPmDirective}
              disabled={!pmDirective.trim() || sendingDirective}
            >
              {sendingDirective ? "Sending..." : "Send to Agents"}
            </button>
            <button
              className="secondary pm-directive-clear-btn"
              onClick={clearPmLog}
              disabled={pmLog.length === 0}
              type="button"
            >
              Clear log
            </button>
          </div>
        </div>
        <p className="state-text">Tip: press Cmd/Ctrl + Enter to send quickly.</p>
        {pmLog.length > 0 && (
          <div className="pm-directive-log" ref={pmLogRef}>
            {pmLog.map((entry, i) => (
              <div key={i} className="pm-directive-entry">
                <span className="pm-directive-badge">PM</span>
                <p className="pm-directive-text">{entry.text}</p>
                <span className="pm-directive-ts">{entry.ts}</span>
              </div>
            ))}
          </div>
        )}
        {pmLog.length === 0 && (
          <div className="empty-state compact">
            <div className="empty-mark" aria-hidden="true" />
            <h4>No directives yet</h4>
            <p className="state-text">Your directive history for this project will appear here.</p>
          </div>
        )}
      </section>

      <div className="reveal delay-2">
        <AssignmentMatrix assignments={project.assignments} tasks={project.tasks} />
      </div>

      <div className="reveal delay-3">
        <DeliverablesPanel deliverables={project.deliverables} />
      </div>

      <section id="timeline" className="card reveal delay-3">
        <h3 className="section-title">Status Timeline</h3>
        {!timeline?.items.length && (
          <div className="empty-state compact">
            <div className="empty-mark" aria-hidden="true" />
            <h4>No status events yet</h4>
            <p className="state-text">Events appear here after generation runs or task status changes.</p>
          </div>
        )}
        <ul className="timeline-list">
          {(timeline?.items || []).map((item) => (
            <li key={`${item.phase}-${item.updated_at}`} className="timeline-item">
              <span className="timeline-phase">{item.phase}</span>
              <span>{item.progress_percent}%</span>
              <span>{new Date(item.updated_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
