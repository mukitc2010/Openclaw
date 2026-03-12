export type Priority = "low" | "medium" | "high" | "critical";

export type ProjectCreate = {
  title: string;
  summary: string;
  goals: string[];
  target_users: string[];
  constraints: string[];
  priority: Priority;
  project_type?: string;
};

export type Milestone = {
  name: string;
  description: string;
};

export type ProjectOutline = {
  scope: string[];
  milestones: Milestone[];
  roadmap: string[];
  definition_of_done: string[];
};

export type AcceptanceCriteria = { criteria: string };

export type Story = {
  id: string;
  title: string;
  description: string;
  acceptance_criteria: AcceptanceCriteria[];
  priority: Priority;
};

export type Epic = {
  id: string;
  title: string;
  feature: string;
  stories: Story[];
};

export type Task = {
  id: string;
  story_id: string;
  title: string;
  owner_agent: string;
  sprint: number;
  status: "backlog" | "in_progress" | "blocked" | "done";
  depends_on: string[];
};

export type TaskStatus = Task["status"];

export type TaskStatusUpdate = {
  status: TaskStatus;
};

export type AgentAssignment = {
  agent_name: string;
  responsibilities: string[];
  active_task_ids: string[];
};

export type DeliverableBundle = {
  project_plan: string;
  agile_plan: string;
  architecture: string;
  ai_engineering_plan: string;
  agents: string;
  github_strategy: string;
};

export type ProjectRecord = {
  id: string;
  created_at: string;
  intake: ProjectCreate;
  outline: ProjectOutline | null;
  epics: Epic[];
  tasks: Task[];
  assignments: AgentAssignment[];
  deliverables: DeliverableBundle | null;
};

export type ProjectListResponse = {
  projects: ProjectRecord[];
};

export type StatusItem = {
  project_id: string;
  phase: string;
  updated_at: string;
  progress_percent: number;
};

export type StatusTimeline = {
  items: StatusItem[];
};
