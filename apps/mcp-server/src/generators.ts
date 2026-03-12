import {
  AgentAssignment,
  Deliverables,
  Epic,
  OpenClawProject,
  ProjectIntake,
  ProjectOutline,
  Task,
} from "./types.js";

const AGENTS = [
  "Project Manager Agent",
  "Business Analyst Agent",
  "Solution Architect Agent",
  "AI Engineering Agent",
  "UI/UX Designer Agent",
  "Frontend Developer Agent",
  "Backend Developer Agent",
  "Database Engineer Agent",
  "DevOps Agent",
  "QA/Test Agent",
  "Security Agent",
  "Code Review Agent",
  "GitHub Agent",
];

export function generateOutline(intake: ProjectIntake): ProjectOutline {
  return {
    scope: [
      `Deliver MVP for ${intake.title}`,
      "Establish secure modular architecture",
      "Generate Agile and GitHub delivery artifacts",
    ],
    milestones: [
      { name: "Discovery", description: "Refine scope, outcomes, and constraints" },
      { name: "Planning", description: "Generate Agile and technical plans" },
      { name: "Delivery", description: "Track sprint execution and readiness" },
    ],
    roadmap: [
      "Project intake and PM outline",
      "Agile decomposition into epics, stories, tasks",
      "Agent assignment and status tracking",
      "Architecture, AI engineering, and GitHub strategy generation",
    ],
    definitionOfDone: [
      "Project outline approved",
      "Sprint 1 tasks assigned",
      "All required documents generated",
      "Dashboard shows progress and dependencies",
    ],
  };
}

export function generateAgilePlan(intake: ProjectIntake): { epics: Epic[]; tasks: Task[]; assignments: AgentAssignment[] } {
  const epics: Epic[] = [
    {
      id: "EP-1",
      title: "Project Intake and PM Intelligence",
      feature: "Transform idea into scoped project outline",
      stories: [
        {
          id: "ST-1",
          title: "Capture project intake",
          description: "As a founder, I can submit goals, users, and constraints",
          acceptanceCriteria: ["Inputs validated", "Project saved", "Summary visible"],
        },
        {
          id: "ST-2",
          title: "Generate PM outline",
          description: "As a PM, I can generate scope, milestones, and roadmap",
          acceptanceCriteria: ["Outline generated", "Milestones listed", "DoD included"],
        },
      ],
    },
    {
      id: "EP-2",
      title: "Agile Planning and Agent Orchestration",
      feature: "Decompose work and assign specialists",
      stories: [
        {
          id: "ST-3",
          title: "Generate epics and tasks",
          description: "As a lead, I can review sprint-ready tasks",
          acceptanceCriteria: ["Epics generated", "Stories linked", "Tasks created"],
        },
        {
          id: "ST-4",
          title: "Assign agents",
          description: "As a PM, I can assign tasks to specialist agents",
          acceptanceCriteria: ["Assignment matrix complete", "Owner set", "Dependencies tracked"],
        },
      ],
    },
    {
      id: "EP-3",
      title: "Technical Delivery Planning",
      feature: "Generate architecture, AI, and GitHub outputs",
      stories: [
        {
          id: "ST-5",
          title: "Generate architecture outputs",
          description: "As an architect, I can produce API and schema draft",
          acceptanceCriteria: ["Architecture generated", "API draft included", "DB draft included"],
        },
      ],
    },
  ];

  const storyIds = epics.flatMap((epic) => epic.stories.map((story) => story.id));
  const taskTemplates = [
    ["Project Manager Agent", "Finalize project outline"],
    ["Business Analyst Agent", "Refine stories and acceptance criteria"],
    ["Solution Architect Agent", "Draft architecture and API shape"],
    ["AI Engineering Agent", "Define prompt and memory strategy"],
    ["Frontend Developer Agent", "Build intake and project dashboard views"],
    ["Backend Developer Agent", "Build orchestration and generation endpoints"],
    ["Database Engineer Agent", "Draft schema and migration plan"],
    ["DevOps Agent", "Prepare Docker and CI baseline"],
    ["QA/Test Agent", "Create Sprint 1 test plan"],
    ["Security Agent", "Review auth and validation controls"],
    ["Code Review Agent", "Define quality gate checklist"],
    ["GitHub Agent", "Define branch and commit strategy"],
  ] as const;

  const tasks: Task[] = taskTemplates.map(([ownerAgent, title], index) => {
    const taskId = `TSK-${index + 1}`;
    const dependsOn = index === 0 ? [] : [`TSK-${index}`];
    return {
      id: taskId,
      storyId: storyIds[index % storyIds.length],
      title,
      ownerAgent,
      sprint: 1,
      status: "backlog",
      dependsOn,
    };
  });

  const assignments: AgentAssignment[] = AGENTS.map((agentName) => ({
    agentName,
    activeTaskIds: tasks.filter((task) => task.ownerAgent === agentName).map((task) => task.id),
    responsibilities: [
      "Deliver assigned tasks",
      "Publish structured output",
      "Report status and blockers",
    ],
  }));

  return { epics, tasks, assignments };
}

export function generateDeliverables(intake: ProjectIntake, project: OpenClawProject): Deliverables {
  const epicsText = project.epics.map((epic) => `- ${epic.id}: ${epic.title}`).join("\n");
  const tasksText = project.tasks.map((task) => `- ${task.id} [${task.ownerAgent}] ${task.title}`).join("\n");

  return {
    projectPlan: `# PROJECT_PLAN\n\n## Title\n${intake.title}\n\n## Summary\n${intake.summary}`,
    agilePlan: `# AGILE_PLAN\n\n## Epics\n${epicsText}\n\n## Sprint 1 Tasks\n${tasksText}`,
    architecture: "# ARCHITECTURE\n\n- Frontend: Next.js\n- Backend: FastAPI\n- Database: PostgreSQL\n- Auth: Supabase Auth\n- Orchestration: LangGraph",
    aiEngineeringPlan: "# AI_ENGINEERING_PLAN\n\n- Prompt workflow design\n- Agent routing strategy\n- Memory strategy\n- Vector planning",
    agents: `# AGENTS\n\n${AGENTS.map((a) => `- ${a}`).join("\n")}`,
    githubStrategy: "# GITHUB_STRATEGY\n\n- trunk-based workflow\n- feat/<module>-<scope> branch model\n- PR summary checklist",
  };
}
