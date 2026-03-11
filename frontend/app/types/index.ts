export interface Project {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  goals: string;
  target_users: string;
  constraints: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends Project {
  agents: Agent[];
  tasks: Task[];
}

export interface ProjectCreate {
  title: string;
  description: string;
  type: string;
  status?: string;
  goals: string;
  target_users: string;
  constraints: string;
}

export interface Agent {
  id: string;
  project_id: string;
  name: string;
  role: string;
  status: string;
  output: AgentOutput | null;
  created_at: string;
}

export type AgentOutput =
  | ProjectOutlineOutput
  | ArchitectureOutput
  | SprintOutput
  | GitHubPlanOutput
  | Record<string, unknown>;

export interface ProjectOutlineOutput {
  title?: string;
  description?: string;
  scope?: string;
  milestones?: string[];
  risks?: string[];
  definition_of_done?: string[];
}

export interface ArchitectureOutput {
  overview?: string;
  components?: { name: string; description: string }[];
  tech_stack?: Record<string, string>;
  deployment?: string;
}

export interface SprintOutput {
  sprints?: SprintItem[];
}

export interface SprintItem {
  sprint: number;
  goal: string;
  tasks: string[];
}

export interface GitHubPlanOutput {
  branch_strategy?: string;
  branches?: { name: string; purpose: string }[];
  commit_plan?: string[];
  docs_structure?: string[];
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  sprint: number | null;
  priority: string;
  agent_assigned: string | null;
  created_at: string;
}
