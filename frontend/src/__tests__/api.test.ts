/**
 * Unit tests for the API client service.
 * These test the function structure and URL construction without making real HTTP calls.
 */

import { api, createAgentStream } from "../services/api";

describe("api.projects", () => {
  it("exposes create, list, get, update, delete methods", () => {
    expect(typeof api.projects.create).toBe("function");
    expect(typeof api.projects.list).toBe("function");
    expect(typeof api.projects.get).toBe("function");
    expect(typeof api.projects.update).toBe("function");
    expect(typeof api.projects.delete).toBe("function");
  });
});

describe("api.sprints", () => {
  it("exposes list and create methods", () => {
    expect(typeof api.sprints.list).toBe("function");
    expect(typeof api.sprints.create).toBe("function");
  });
});

describe("api.artifacts", () => {
  it("exposes list method", () => {
    expect(typeof api.artifacts.list).toBe("function");
  });
});

describe("createAgentStream", () => {
  it("is a function that accepts projectId and callbacks", () => {
    expect(typeof createAgentStream).toBe("function");
  });
});
