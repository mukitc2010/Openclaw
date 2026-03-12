import { z } from "zod";

const createProjectSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(10),
  goals: z.array(z.string()).default([]),
  targetUsers: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  projectType: z.string().optional(),
});

const projectIdSchema = z.object({
  projectId: z.string().min(5),
});

const taskStatusUpdateSchema = z.object({
  projectId: z.string().min(5),
  taskId: z.string().min(1),
  status: z.enum(["backlog", "todo", "in_progress", "review", "done"]),
});

const API_BASE_URL = process.env.OPENCLAW_API_BASE_URL || "http://localhost:8000";
const API_KEY = process.env.OPENCLAW_API_KEY || "";

export const toolDefinitions = [
  {
    name: "create_project",
    description: "Create a new OpenClaw project from intake data",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        goals: { type: "array", items: { type: "string" } },
        targetUsers: { type: "array", items: { type: "string" } },
        constraints: { type: "array", items: { type: "string" } },
        priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
        projectType: { type: "string" },
      },
      required: ["title", "summary"],
    },
  },
  {
    name: "generate_project_artifacts",
    description: "Generate outline, Agile artifacts, assignments, and deliverables",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
      },
      required: ["projectId"],
    },
  },
  {
    name: "list_projects",
    description: "List all OpenClaw projects",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "generate_outline",
    description: "Generate the project outline document for an existing project",
    inputSchema: {
      type: "object",
      properties: { projectId: { type: "string" } },
      required: ["projectId"],
    },
  },
  {
    name: "generate_agile",
    description: "Generate epics, stories, tasks, and the Agile plan document for an existing project",
    inputSchema: {
      type: "object",
      properties: { projectId: { type: "string" } },
      required: ["projectId"],
    },
  },
  {
    name: "generate_architecture",
    description: "Generate the architecture design document for an existing project",
    inputSchema: {
      type: "object",
      properties: { projectId: { type: "string" } },
      required: ["projectId"],
    },
  },
  {
    name: "generate_ai_engineering",
    description: "Generate the AI engineering plan document for an existing project",
    inputSchema: {
      type: "object",
      properties: { projectId: { type: "string" } },
      required: ["projectId"],
    },
  },
  {
    name: "generate_github",
    description: "Generate the GitHub strategy, agents manifest, and project plan documents",
    inputSchema: {
      type: "object",
      properties: { projectId: { type: "string" } },
      required: ["projectId"],
    },
  },
  {
    name: "update_task_status",
    description: "Update the status of a specific task within a project",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        taskId: { type: "string" },
        status: { type: "string", enum: ["backlog", "todo", "in_progress", "review", "done"] },
      },
      required: ["projectId", "taskId", "status"],
    },
  },
  {
    name: "get_project_status",
    description: "Retrieve the full status timeline for a project",
    inputSchema: {
      type: "object",
      properties: { projectId: { type: "string" } },
      required: ["projectId"],
    },
  },
];

function okText(text: string) {
  return {
    content: [{ type: "text", text }],
  };
}

function toApiCreatePayload(input: z.infer<typeof createProjectSchema>) {
  return {
    title: input.title,
    summary: input.summary,
    goals: input.goals,
    target_users: input.targetUsers,
    constraints: input.constraints,
    priority: input.priority,
    project_type: input.projectType,
  };
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenClaw API request failed (${response.status}) ${path}: ${body}`);
  }

  return (await response.json()) as T;
}

export async function executeTool(name: string, args: unknown) {
  if (name === "create_project") {
    const payload = createProjectSchema.parse(args);
    const project = await apiRequest("/projects", {
      method: "POST",
      body: JSON.stringify(toApiCreatePayload(payload)),
    });
    return okText(JSON.stringify(project, null, 2));
  }

  if (name === "generate_project_artifacts") {
    const { projectId } = projectIdSchema.parse(args);
    const project = await apiRequest(`/projects/${projectId}/generate`, {
      method: "POST",
    });
    return okText(JSON.stringify(project, null, 2));
  }

  if (name === "list_projects") {
    const listResponse = await apiRequest<{ projects: unknown[] }>("/projects");
    return okText(JSON.stringify(listResponse.projects, null, 2));
  }

  // ── Module-level generation tools ──────────────────────────────────────────
  const MODULE_TOOLS: Record<string, string> = {
    generate_outline: "outline",
    generate_agile: "agile",
    generate_architecture: "architecture",
    generate_ai_engineering: "ai-engineering",
    generate_github: "github",
  };

  if (name in MODULE_TOOLS) {
    const { projectId } = projectIdSchema.parse(args);
    const module = MODULE_TOOLS[name];
    const project = await apiRequest(`/projects/${projectId}/generate/${module}`, {
      method: "POST",
    });
    return okText(JSON.stringify(project, null, 2));
  }

  // ── Task status update ──────────────────────────────────────────────────────
  if (name === "update_task_status") {
    const { projectId, taskId, status } = taskStatusUpdateSchema.parse(args);
    const project = await apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return okText(JSON.stringify(project, null, 2));
  }

  // ── Project status timeline ─────────────────────────────────────────────────
  if (name === "get_project_status") {
    const { projectId } = projectIdSchema.parse(args);
    const timeline = await apiRequest(`/projects/${projectId}/status`);
    return okText(JSON.stringify(timeline, null, 2));
  }

  throw new Error(`Unknown tool: ${name}`);
}
