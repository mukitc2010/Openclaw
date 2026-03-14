export type AgentProfile = {
  slug: string;
  icon: string;
  name: string;
  tag: string;
  desc: string;
  outputs: string[];
  responsibilities: string[];
  handoffTo: string;
};

export const AGENT_PROFILES: AgentProfile[] = [
  {
    slug: "project-manager",
    icon: "📋",
    name: "Project Manager",
    tag: "PM",
    desc: "Converts raw ideas into scoped delivery plans and milestones.",
    outputs: ["Project scope and milestones", "Risks and dependencies", "Execution roadmap"],
    responsibilities: ["Define project timeline", "Keep delivery scope realistic", "Track cross-agent dependencies"],
    handoffTo: "Business Analyst",
  },
  {
    slug: "business-analyst",
    icon: "📊",
    name: "Business Analyst",
    tag: "BA",
    desc: "Defines user stories, acceptance criteria, and business outcomes.",
    outputs: ["User stories and priorities", "Acceptance criteria", "Business KPI mapping"],
    responsibilities: ["Convert goals to requirements", "Align stories with outcomes", "Document edge cases"],
    handoffTo: "Solution Architect",
  },
  {
    slug: "solution-architect",
    icon: "🏗️",
    name: "Solution Architect",
    tag: "ARCH",
    desc: "Designs system topology, integrations, and technology choices.",
    outputs: ["System architecture", "Service boundaries", "Integration strategy"],
    responsibilities: ["Choose architecture patterns", "Map interfaces and contracts", "Reduce implementation risk"],
    handoffTo: "Frontend Developer / Backend Developer",
  },
  {
    slug: "ai-engineering",
    icon: "🤖",
    name: "AI Engineering",
    tag: "AI",
    desc: "Plans model usage, prompt strategy, and AI workflows.",
    outputs: ["Model and prompt strategy", "AI workflow design", "Cost and latency guardrails"],
    responsibilities: ["Select model providers", "Design prompt templates", "Set quality and safety checks"],
    handoffTo: "Backend Developer",
  },
  {
    slug: "ui-ux-designer",
    icon: "✏️",
    name: "UI/UX Designer",
    tag: "UX",
    desc: "Shapes journeys, wireframes, and interaction patterns.",
    outputs: ["User journey map", "Wireframe guidance", "Interaction patterns"],
    responsibilities: ["Design user flow", "Define interaction states", "Support accessibility"],
    handoffTo: "Frontend Developer",
  },
  {
    slug: "frontend-developer",
    icon: "🎨",
    name: "Frontend Developer",
    tag: "FE",
    desc: "Implements responsive UI and client-side interactions.",
    outputs: ["Component structure", "Responsive behavior", "State and interaction logic"],
    responsibilities: ["Build pages and components", "Handle client state", "Optimize UX performance"],
    handoffTo: "QA / Test",
  },
  {
    slug: "backend-developer",
    icon: "⚙️",
    name: "Backend Developer",
    tag: "BE",
    desc: "Builds APIs, core logic, and integration endpoints.",
    outputs: ["API contracts", "Service logic", "3rd-party integrations"],
    responsibilities: ["Implement domain logic", "Secure API endpoints", "Ensure service reliability"],
    handoffTo: "Database Engineer / DevOps",
  },
  {
    slug: "database-engineer",
    icon: "🗄️",
    name: "Database Engineer",
    tag: "DB",
    desc: "Designs schemas, indexes, and query performance strategy.",
    outputs: ["Data model and schema", "Index strategy", "Query performance plan"],
    responsibilities: ["Design normalized schema", "Tune query execution", "Protect data integrity"],
    handoffTo: "Backend Developer",
  },
  {
    slug: "devops",
    icon: "🚀",
    name: "DevOps",
    tag: "OPS",
    desc: "Owns CI/CD, containers, release automation, and runtime ops.",
    outputs: ["CI/CD workflow", "Deployment setup", "Monitoring and rollback plan"],
    responsibilities: ["Automate delivery pipeline", "Manage environments", "Monitor runtime health"],
    handoffTo: "QA / Test",
  },
  {
    slug: "qa-test",
    icon: "🧪",
    name: "QA / Test",
    tag: "QA",
    desc: "Defines test plans for reliability across each module.",
    outputs: ["Test matrix", "Regression checks", "Release quality gate"],
    responsibilities: ["Create test scenarios", "Validate acceptance criteria", "Prevent regressions"],
    handoffTo: "Code Review",
  },
  {
    slug: "security",
    icon: "🔒",
    name: "Security",
    tag: "SEC",
    desc: "Assesses auth, secrets, compliance, and threat models.",
    outputs: ["Threat model", "Auth and secret policy", "Compliance checklist"],
    responsibilities: ["Assess attack surface", "Define secure defaults", "Review compliance controls"],
    handoffTo: "DevOps",
  },
  {
    slug: "code-review",
    icon: "🔍",
    name: "Code Review",
    tag: "CR",
    desc: "Improves code quality, consistency, and maintainability.",
    outputs: ["Code quality review", "Refactor opportunities", "Standards and consistency checks"],
    responsibilities: ["Review architecture fit", "Enforce quality standards", "Catch maintainability issues"],
    handoffTo: "GitHub",
  },
  {
    slug: "github",
    icon: "🐙",
    name: "GitHub",
    tag: "GH",
    desc: "Prepares branching, PR strategy, and release workflows.",
    outputs: ["Branching strategy", "PR template and process", "Release workflow"],
    responsibilities: ["Maintain repo workflow", "Align PR discipline", "Support release governance"],
    handoffTo: "Project Manager",
  },
];

export function getAgentBySlug(slug: string): AgentProfile | undefined {
  return AGENT_PROFILES.find((agent) => agent.slug === slug);
}
