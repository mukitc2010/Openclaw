import type { Agent, Project, ProjectCreate, ProjectDetail, Task } from "@/types";

const BASE_URL = "http://localhost:8000/api";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${BASE_URL}/projects`, { cache: "no-store" });
  return handleResponse<Project[]>(res);
}

export async function createProject(data: ProjectCreate): Promise<Project> {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Project>(res);
}

export async function getProject(id: string): Promise<ProjectDetail> {
  const res = await fetch(`${BASE_URL}/projects/${id}`, { cache: "no-store" });
  return handleResponse<ProjectDetail>(res);
}

export async function generateProject(id: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE_URL}/projects/${id}/generate`, {
    method: "POST",
  });
  return handleResponse<Record<string, unknown>>(res);
}

export async function getAgents(projectId: string): Promise<Agent[]> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/agents`, {
    cache: "no-store",
  });
  return handleResponse<Agent[]>(res);
}

export async function getTasks(projectId: string): Promise<Task[]> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    cache: "no-store",
  });
  return handleResponse<Task[]>(res);
}

export async function runAgent(projectId: string, agentId: string): Promise<Agent> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/agents/${agentId}/run`, {
    method: "POST",
  });
  return handleResponse<Agent>(res);
}
