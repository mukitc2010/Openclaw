import { randomUUID } from "node:crypto";
const projects = new Map();
export function createProject(intake) {
    const id = `prj-${randomUUID().slice(0, 8)}`;
    const project = {
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
export function saveProject(project) {
    projects.set(project.id, project);
    return project;
}
export function getProject(projectId) {
    return projects.get(projectId);
}
export function listProjects() {
    return Array.from(projects.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
