import { ProjectCreate, ProjectListResponse, ProjectRecord, StatusTimeline, TaskStatus } from "@/types";
import { getApiBaseUrl } from "@/lib/runtime-config";

const API_BASE = getApiBaseUrl();
const LOCAL_DEMO_PROJECTS_KEY = "openclaw.demo.projects";

function hasBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseStoredProjects(raw: string | null): ProjectRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ProjectRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadLocalProjects(): ProjectRecord[] {
  if (!hasBrowserStorage()) return [];
  return parseStoredProjects(window.localStorage.getItem(LOCAL_DEMO_PROJECTS_KEY));
}

function saveLocalProjects(projects: ProjectRecord[]): void {
  if (!hasBrowserStorage()) return;
  window.localStorage.setItem(LOCAL_DEMO_PROJECTS_KEY, JSON.stringify(projects));
}

function makeLocalId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}`;
}

function createLocalProject(payload: ProjectCreate): ProjectRecord {
  return {
    id: makeLocalId("local"),
    created_at: new Date().toISOString(),
    intake: payload,
    outline: null,
    epics: [],
    tasks: [],
    assignments: [],
    deliverables: null,
  };
}

function getLocalProjectOrThrow(projectId: string): ProjectRecord {
  const found = loadLocalProjects().find((p) => p.id === projectId);
  if (!found) throw new Error("Project not found.");
  return found;
}

function upsertLocalProject(project: ProjectRecord): ProjectRecord {
  const projects = loadLocalProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.unshift(project);
  }
  saveLocalProjects(projects);
  return project;
}

function markLocalGenerated(project: ProjectRecord): ProjectRecord {
  if (!project.outline) {
    project.outline = {
      scope: [project.intake.summary || "Initial scoped delivery plan"],
      milestones: [
        { name: "Plan", description: "Finalize delivery scope and architecture" },
        { name: "Build", description: "Implement prioritized sprint backlog" },
        { name: "Ship", description: "Validate quality and release" },
      ],
      roadmap: ["PM outline", "Agile sprint plan", "Architecture and QA handoff"],
      definition_of_done: ["Core flows implemented", "QA checks passed", "Deployment runbook prepared"],
    };
  }

  if (!project.epics.length) {
    const storyId = makeLocalId("story");
    project.epics = [
      {
        id: makeLocalId("epic"),
        title: "Core Platform Foundation",
        feature: "Project planning and execution",
        stories: [
          {
            id: storyId,
            title: "Create project planning pipeline",
            description: "Generate outline, agile plan, and architecture artifacts.",
            acceptance_criteria: [
              { criteria: "User can submit brief and receive generated outputs" },
              { criteria: "Plan artifacts are visible in project dashboard" },
            ],
            priority: project.intake.priority,
          },
        ],
      },
    ];
    project.tasks = [
      {
        id: makeLocalId("task"),
        story_id: storyId,
        title: "Deliver PM + Agile artifact generation",
        owner_agent: "PM Agent",
        sprint: 1,
        status: "backlog",
        depends_on: [],
      },
    ];
  }

  if (!project.assignments.length) {
    project.assignments = [
      {
        agent_name: "PM Agent",
        responsibilities: ["Scope", "Milestones", "Roadmap"],
        active_task_ids: project.tasks.map((t) => t.id),
      },
    ];
  }

  if (!project.deliverables) {
    project.deliverables = {
      project_plan: "Local demo: project plan generated.",
      agile_plan: "Local demo: agile plan generated.",
      architecture: "Local demo: architecture notes generated.",
      ai_engineering_plan: "Local demo: AI engineering plan generated.",
      agents: "Local demo: agent assignment matrix generated.",
      github_strategy: "Local demo: GitHub workflow strategy generated.",
      qa_test_report: "Local demo: QA report generated.",
    };
  }

  return project;
}

async function withLocalFallback<T>(remote: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await remote();
  } catch (error) {
    if (hasBrowserStorage()) {
      return fallback();
    }
    throw error;
  }
}

function formatApiError(resp: Response, body: string, endpointLabel: string): string {
  const contentType = resp.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("text/html")) {
    return `API ${resp.status}: received HTML from ${endpointLabel}. Check NEXT_PUBLIC_API_BASE_URL.`;
  }

  const normalized = body.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return `API ${resp.status}: request failed for ${endpointLabel}.`;
  }

  const trimmed = normalized.length > 220 ? `${normalized.slice(0, 220)}...` : normalized;
  return `API ${resp.status}: ${trimmed}`;
}

async function handle<T>(resp: Response, endpointLabel: string): Promise<T> {
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(formatApiError(resp, body, endpointLabel));
  }
  return (await resp.json()) as T;
}

/** Returns Authorization header when a Supabase session is active. */
async function authHeaders(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  const { supabase } = await import("@/lib/supabase");
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  if (!data.session) return {};
  return { Authorization: `Bearer ${data.session.access_token}` };
}

/** Wrapper around fetch that automatically adds the auth header. */
async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const auth = await authHeaders();
  return fetch(url, {
    ...init,
    headers: {
      ...auth,
      ...(init.headers || {}),
    },
  });
}

export async function listProjects(): Promise<ProjectListResponse> {
  return withLocalFallback(
    async () => {
      const endpoint = `${API_BASE}/projects`;
      return handle<ProjectListResponse>(await apiFetch(endpoint, { cache: "no-store" } as RequestInit), endpoint);
    },
    () => ({ projects: loadLocalProjects() }),
  );
}

export async function createProject(payload: ProjectCreate): Promise<ProjectRecord> {
  return withLocalFallback(
    async () => {
      const endpoint = `${API_BASE}/projects`;
      return handle<ProjectRecord>(
        await apiFetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        endpoint,
      );
    },
    () => upsertLocalProject(createLocalProject(payload)),
  );
}

export async function getProject(projectId: string): Promise<ProjectRecord> {
  return withLocalFallback(
    async () => {
      const endpoint = `${API_BASE}/projects/${projectId}`;
      return handle<ProjectRecord>(await apiFetch(endpoint, { cache: "no-store" } as RequestInit), endpoint);
    },
    () => getLocalProjectOrThrow(projectId),
  );
}

export async function generateProject(projectId: string): Promise<ProjectRecord> {
  return withLocalFallback(
    async () => {
      const endpoint = `${API_BASE}/projects/${projectId}/generate`;
      return handle<ProjectRecord>(
        await apiFetch(endpoint, { method: "POST" }),
        endpoint,
      );
    },
    () => {
      const updated = markLocalGenerated(getLocalProjectOrThrow(projectId));
      return upsertLocalProject(updated);
    },
  );
}

async function generateModule(projectId: string, moduleName: string): Promise<ProjectRecord> {
  return withLocalFallback(
    async () => {
      const endpoint = `${API_BASE}/projects/${projectId}/generate/${moduleName}`;
      return handle<ProjectRecord>(
        await apiFetch(endpoint, { method: "POST" }),
        endpoint,
      );
    },
    () => {
      const updated = markLocalGenerated(getLocalProjectOrThrow(projectId));
      return upsertLocalProject(updated);
    },
  );
}

export async function generateOutline(projectId: string): Promise<ProjectRecord> {
  return generateModule(projectId, "outline");
}

export async function generateAgile(projectId: string): Promise<ProjectRecord> {
  return generateModule(projectId, "agile");
}

export async function generateArchitecture(projectId: string): Promise<ProjectRecord> {
  return generateModule(projectId, "architecture");
}

export async function generateAIEngineering(projectId: string): Promise<ProjectRecord> {
  return generateModule(projectId, "ai-engineering");
}

export async function generateGithub(projectId: string): Promise<ProjectRecord> {
  return generateModule(projectId, "github");
}

export async function generateTesting(projectId: string): Promise<ProjectRecord> {
  return generateModule(projectId, "testing");
}

export async function updateTaskStatus(projectId: string, taskId: string, status: TaskStatus): Promise<ProjectRecord> {
  return withLocalFallback(
    async () => {
      const endpoint = `${API_BASE}/projects/${projectId}/tasks/${taskId}`;
      return handle<ProjectRecord>(
        await apiFetch(endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }),
        endpoint,
      );
    },
    () => {
      const project = getLocalProjectOrThrow(projectId);
      project.tasks = project.tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
      return upsertLocalProject(project);
    },
  );
}

export async function getProjectStatus(projectId: string): Promise<StatusTimeline> {
  return withLocalFallback(
    async () => {
      const endpoint = `${API_BASE}/projects/${projectId}/status`;
      return handle<StatusTimeline>(await apiFetch(endpoint, { cache: "no-store" } as RequestInit), endpoint);
    },
    () => ({
      items: [
        {
          project_id: projectId,
          phase: "planning",
          updated_at: new Date().toISOString(),
          progress_percent: 35,
        },
      ],
    }),
  );
}

export async function startStory(projectId: string, storyId: string): Promise<ProjectRecord> {
  return withLocalFallback(
    async () => {
      const endpoint = `${API_BASE}/projects/${projectId}/stories/${storyId}/start`;
      return handle<ProjectRecord>(
        await apiFetch(endpoint, { method: "POST" }),
        endpoint,
      );
    },
    () => {
      const project = getLocalProjectOrThrow(projectId);
      project.tasks = project.tasks.map((task) => (
        task.story_id === storyId && task.status === "backlog"
          ? { ...task, status: "in_progress" }
          : task
      ));
      return upsertLocalProject(project);
    },
  );
}
