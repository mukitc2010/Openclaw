import { ProjectCreate, ProjectListResponse, ProjectRecord, StatusTimeline, TaskStatus } from "@/types";
import { supabase } from "@/lib/supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function handle<T>(resp: Response): Promise<T> {
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`API ${resp.status}: ${body}`);
  }
  return (await resp.json()) as T;
}

/** Returns Authorization header when a Supabase session is active. */
async function authHeaders(): Promise<Record<string, string>> {
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
  return handle<ProjectListResponse>(await apiFetch(`${API_BASE}/projects`, { cache: "no-store" } as RequestInit));
}

export async function createProject(payload: ProjectCreate): Promise<ProjectRecord> {
  return handle<ProjectRecord>(
    await apiFetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function getProject(projectId: string): Promise<ProjectRecord> {
  return handle<ProjectRecord>(await apiFetch(`${API_BASE}/projects/${projectId}`, { cache: "no-store" } as RequestInit));
}

export async function generateProject(projectId: string): Promise<ProjectRecord> {
  return handle<ProjectRecord>(
    await apiFetch(`${API_BASE}/projects/${projectId}/generate`, { method: "POST" }),
  );
}

async function generateModule(projectId: string, moduleName: string): Promise<ProjectRecord> {
  return handle<ProjectRecord>(
    await apiFetch(`${API_BASE}/projects/${projectId}/generate/${moduleName}`, { method: "POST" }),
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

export async function updateTaskStatus(projectId: string, taskId: string, status: TaskStatus): Promise<ProjectRecord> {
  return handle<ProjectRecord>(
    await apiFetch(`${API_BASE}/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
  );
}

export async function getProjectStatus(projectId: string): Promise<StatusTimeline> {
  return handle<StatusTimeline>(await apiFetch(`${API_BASE}/projects/${projectId}/status`, { cache: "no-store" } as RequestInit));
}
