export function listResources() {
  return [
    {
      uri: "openclaw://templates/project-plan",
      name: "Project Plan Template",
      description: "Standard structure for PROJECT_PLAN.md",
      mimeType: "text/markdown",
    },
    {
      uri: "openclaw://templates/agile-plan",
      name: "Agile Plan Template",
      description: "Standard structure for AGILE_PLAN.md",
      mimeType: "text/markdown",
    },
  ];
}

export function readResource(uri: string): string {
  if (uri === "openclaw://templates/project-plan") {
    return "# PROJECT_PLAN\n\n## Objective\n## Scope\n## Milestones\n## Sprint 1 Tasks";
  }
  if (uri === "openclaw://templates/agile-plan") {
    return "# AGILE_PLAN\n\n## Epics\n## Stories\n## Tasks\n## Sprint Allocation";
  }
  throw new Error(`Unknown resource URI: ${uri}`);
}
