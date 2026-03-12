export type Priority = "low" | "medium" | "high" | "critical";

export type ProjectIntake = {
  title: string;
  summary: string;
  goals: string[];
  targetUsers: string[];
  constraints: string[];
  priority: Priority;
  projectType?: string;
};

export type Milestone = {
  name: string;
  description: string;
};

export type ProjectOutline = {
  scope: string[];
  milestones: Milestone[];
  roadmap: string[];
  definitionOfDone: string[];
};

export type Story = {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
};

export type Epic = {
  id: string;
  title: string;
  feature: string;
  stories: Story[];
};

export type TaskStatus = "backlog" | "in_progress" | "blocked" | "done";

export type Task = {
  id: string;
  storyId: string;
  title: string;
  ownerAgent: string;
  sprint: number;
  status: TaskStatus;
  dependsOn: string[];
};

export type AgentAssignment = {
  agentName: string;
  activeTaskIds: string[];
  responsibilities: string[];
};

export type Deliverables = {
  projectPlan: string;
  agilePlan: string;
  architecture: string;
  aiEngineeringPlan: string;
  agents: string;
  githubStrategy: string;
};

export type OpenClawProject = {
  id: string;
  createdAt: string;
  intake: ProjectIntake;
  outline?: ProjectOutline;
  epics: Epic[];
  tasks: Task[];
  assignments: AgentAssignment[];
  deliverables?: Deliverables;
};
