/**
 * OpenClaw API client — typed wrapper over the backend REST API.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Project {
  id: string;
  name: string;
  idea: string;
  status: string;
  business_goal?: string;
  problem_statement?: string;
  target_users?: string;
  constraints?: string;
  assumptions?: string;
  risks?: string;
  success_criteria?: string;
  timeline_estimate?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  idea: string;
}

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  goal?: string;
  sprint_number: number;
  status: string;
  created_at: string;
}

export interface Task {
  id: string;
  sprint_id: string;
  user_story_id?: string;
  title: string;
  description?: string;
  status: string;
  assigned_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface Artifact {
  id: string;
  project_id: string;
  artifact_type: string;
  title: string;
  content: string;
  produced_by_agent?: string;
  created_at: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail ?? "API error");
  }
  return response.json() as Promise<T>;
}

// ── Projects ───────────────────────────────────────────────────────────────

export const api = {
  projects: {
    create: (data: ProjectCreate): Promise<Project> =>
      request<Project>("/api/v1/projects/", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    list: (): Promise<Project[]> => request<Project[]>("/api/v1/projects/"),

    get: (id: string): Promise<Project> => request<Project>(`/api/v1/projects/${id}`),

    update: (id: string, data: Partial<Project>): Promise<Project> =>
      request<Project>(`/api/v1/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    delete: (id: string): Promise<void> =>
      request<void>(`/api/v1/projects/${id}`, { method: "DELETE" }),
  },

  sprints: {
    list: (projectId: string): Promise<Sprint[]> =>
      request<Sprint[]>(`/api/v1/projects/${projectId}/sprints`),

    create: (
      projectId: string,
      data: { name: string; goal?: string; sprint_number: number }
    ): Promise<Sprint> =>
      request<Sprint>(`/api/v1/projects/${projectId}/sprints`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  tasks: {
    list: (projectId: string, sprintId: string): Promise<Task[]> =>
      request<Task[]>(`/api/v1/projects/${projectId}/sprints/${sprintId}/tasks`),
  },

  artifacts: {
    list: (projectId: string): Promise<Artifact[]> =>
      request<Artifact[]>(`/api/v1/projects/${projectId}/artifacts`),
  },
};

// ── WebSocket streaming ────────────────────────────────────────────────────

export interface AgentStreamEvent {
  agent: string;
  phase: string;
  event_type: "start" | "chunk" | "complete" | "error";
  content: string;
  project_id: string;
}

export function createAgentStream(
  projectId: string,
  onEvent: (event: AgentStreamEvent) => void,
  onClose?: () => void
): WebSocket {
  const wsBase = API_BASE.replace(/^http/, "ws");
  const ws = new WebSocket(`${wsBase}/api/v1/agents/stream/${projectId}`);

  ws.onmessage = (e) => {
    try {
      const parsed: unknown = JSON.parse(e.data as string);
      if (
        parsed !== null &&
        typeof parsed === "object" &&
        "agent" in parsed &&
        "event_type" in parsed &&
        "content" in parsed &&
        "project_id" in parsed
      ) {
        onEvent(parsed as AgentStreamEvent);
      }
    } catch {
      // ignore malformed messages
    }
  };

  ws.onclose = () => onClose?.();

  return ws;
}
