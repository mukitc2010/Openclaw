export type LaunchPath = {
  slug: string;
  title: string;
  eta: string;
  desc: string;
  audience: string;
  includes: string[];
  outcomes: string[];
};

export const LAUNCH_PATHS: LaunchPath[] = [
  {
    slug: "founder-sprint",
    title: "Founder Sprint",
    eta: "~15 min",
    desc: "Start with a short prompt and leave with a client-ready project blueprint in one session.",
    audience: "Solo founders and small teams validating one high-priority product idea.",
    includes: [
      "Fast intake for title, summary, goals, and constraints",
      "PM outline with milestones, risks, and execution order",
      "Starter sprint scope to begin delivery without setup overhead",
    ],
    outcomes: [
      "One-page project direction you can share with clients or collaborators",
      "Clear next actions for the next 1-2 weeks of execution",
      "Confidence to move from idea to build with minimal delay",
    ],
  },
  {
    slug: "agency-delivery-pack",
    title: "Agency Delivery Pack",
    eta: "~30 min",
    desc: "Generate PM, Agile, architecture, and handoff docs to kick off paid delivery immediately.",
    audience: "Agencies and consultants who need production-ready outputs for active client engagements.",
    includes: [
      "PM scope and phased milestone plan",
      "Agile epics, stories, and delivery task breakdown",
      "Architecture and implementation handoff notes for engineers",
    ],
    outcomes: [
      "A complete delivery packet ready for client review",
      "Faster project kickoff with fewer planning meetings",
      "Smoother handoff from strategy to engineering",
    ],
  },
  {
    slug: "product-team-mode",
    title: "Product Team Mode",
    eta: "~45 min",
    desc: "Align roles across planning, implementation, and quality with one shared execution board.",
    audience: "In-house product teams coordinating PM, design, engineering, and QA in one workflow.",
    includes: [
      "Cross-functional plan with role ownership and priorities",
      "Shared board structure for in-progress execution visibility",
      "Quality and release checkpoints to reduce late-stage surprises",
    ],
    outcomes: [
      "Better alignment across product, engineering, and QA",
      "Lower coordination overhead during active sprints",
      "A clearer path from roadmap intent to shipped outcomes",
    ],
  },
];

export function getLaunchPathBySlug(slug: string) {
  return LAUNCH_PATHS.find((path) => path.slug === slug);
}