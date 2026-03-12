import { randomUUID } from "node:crypto";

import { OpenClawProject, ProjectIntake } from "./types.js";

const projects = new Map<string, OpenClawProject>();

export function createProject(intake: ProjectIntake): OpenClawProject {
  const id = `prj-${randomUUID().slice(0, 8)}`;
  const project: OpenClawProject = {
    id,
    createdAt: new Date().toISOString(),
    intake,
    epics: [],
    tasks: [],
    assignments: [],
  };
  projects.set(id, project);
  return project;
}

export function saveProject(project: OpenClawProject): OpenClawProject {
  projects.set(project.id, project);
  return project;
}

export function getProject(projectId: string): OpenClawProject | undefined {
  return projects.get(projectId);
}

export function listProjects(): OpenClawProject[] {
  return Array.from(projects.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
