import { ProjectCreate, ProjectListResponse, ProjectRecord, StatusTimeline, TaskStatus } from "@/types";
import { getApiBaseUrl } from "@/lib/runtime-config";

const API_BASE = getApiBaseUrl();

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
  const endpoint = `${API_BASE}/projects`;
  return handle<ProjectListResponse>(await apiFetch(endpoint, { cache: "no-store" } as RequestInit), endpoint);
}

export async function createProject(payload: ProjectCreate): Promise<ProjectRecord> {
  const endpoint = `${API_BASE}/projects`;
  return handle<ProjectRecord>(
    await apiFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
    endpoint,
  );
}

export async function getProject(projectId: string): Promise<ProjectRecord> {
  const endpoint = `${API_BASE}/projects/${projectId}`;
  return handle<ProjectRecord>(await apiFetch(endpoint, { cache: "no-store" } as RequestInit), endpoint);
}

export async function generateProject(projectId: string): Promise<ProjectRecord> {
  const endpoint = `${API_BASE}/projects/${projectId}/generate`;
  return handle<ProjectRecord>(
    await apiFetch(endpoint, { method: "POST" }),
    endpoint,
  );
}

async function generateModule(projectId: string, moduleName: string): Promise<ProjectRecord> {
  const endpoint = `${API_BASE}/projects/${projectId}/generate/${moduleName}`;
  return handle<ProjectRecord>(
    await apiFetch(endpoint, { method: "POST" }),
    endpoint,
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
  const endpoint = `${API_BASE}/projects/${projectId}/tasks/${taskId}`;
  return handle<ProjectRecord>(
    await apiFetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
    endpoint,
  );
}

export async function getProjectStatus(projectId: string): Promise<StatusTimeline> {
  const endpoint = `${API_BASE}/projects/${projectId}/status`;
  return handle<StatusTimeline>(await apiFetch(endpoint, { cache: "no-store" } as RequestInit), endpoint);
}

export async function startStory(projectId: string, storyId: string): Promise<ProjectRecord> {
  const endpoint = `${API_BASE}/projects/${projectId}/stories/${storyId}/start`;
  return handle<ProjectRecord>(
    await apiFetch(endpoint, { method: "POST" }),
    endpoint,
  );
}
