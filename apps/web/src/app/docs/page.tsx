"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getApiBaseUrl, getApiDocsUrl, getApiRedocUrl } from "@/lib/runtime-config";

type ApiEndpoint = {
  method: "GET" | "POST" | "PATCH";
  path: string;
  name: string;
  description: string;
  auth: "required" | "optional";
  requestExample: string;
  responseExample: string;
  commonErrors: string[];
};

type MethodFilter = "ALL" | ApiEndpoint["method"];

const endpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/health",
    name: "Health Check",
    description: "Returns API availability and service name.",
    auth: "optional",
    requestExample: "{}",
    responseExample: '{"status":"ok","service":"openclaw-api"}',
    commonErrors: ["503 Service unavailable during restart"],
  },
  {
    method: "POST",
    path: "/projects",
    name: "Create Project",
    description: "Creates a project intake record from user prompt and metadata.",
    auth: "required",
    requestExample: '{"title":"AI customer support portal","summary":"Build MVP with ticket routing and bot triage","problem_statement":"Support queues are too slow","target_users":"support managers, support agents","goals":["reduce first response time"],"constraints":["launch in 6 weeks"],"priority":"high"}',
    responseExample: '{"id":"prj_123","created_at":"2026-03-14T10:15:00Z","intake":{"title":"AI customer support portal"}}',
    commonErrors: ["401 Missing bearer token", "422 Invalid request body"],
  },
  {
    method: "GET",
    path: "/projects",
    name: "List Projects",
    description: "Returns all projects ordered by creation date.",
    auth: "required",
    requestExample: "{}",
    responseExample: '{"projects":[{"id":"prj_123","created_at":"2026-03-14T10:15:00Z"}]}',
    commonErrors: ["401 Missing bearer token"],
  },
  {
    method: "GET",
    path: "/projects/{project_id}",
    name: "Get Project",
    description: "Fetches one project with intake, outputs, tasks, and assignments.",
    auth: "required",
    requestExample: "{}",
    responseExample: '{"id":"prj_123","intake":{"title":"AI customer support portal"},"tasks":[]}',
    commonErrors: ["401 Missing bearer token", "404 Project not found"],
  },
  {
    method: "POST",
    path: "/projects/{project_id}/generate",
    name: "Generate Full Plan",
    description: "Runs PM outline, Agile planning, assignments, and all deliverables.",
    auth: "required",
    requestExample: "{}",
    responseExample: '{"id":"prj_123","outline":{},"epics":[],"tasks":[],"deliverables":{}}',
    commonErrors: ["401 Missing bearer token", "404 Project not found"],
  },
  {
    method: "POST",
    path: "/projects/{project_id}/generate/outline",
    name: "Generate PM Outline",
    description: "Generates the project outline module only.",
    auth: "required",
    requestExample: "{}",
    responseExample: '{"id":"prj_123","outline":{"scope":"..."}}',
    commonErrors: ["401 Missing bearer token", "404 Project not found"],
  },
  {
    method: "POST",
    path: "/projects/{project_id}/generate/agile",
    name: "Generate Agile Plan",
    description: "Generates epics, stories, and initial task assignments.",
    auth: "required",
    requestExample: "{}",
    responseExample: '{"id":"prj_123","epics":[],"tasks":[],"assignments":[]}',
    commonErrors: ["401 Missing bearer token", "404 Project not found"],
  },
  {
    method: "POST",
    path: "/projects/{project_id}/generate/architecture",
    name: "Generate Architecture",
    description: "Generates architecture documentation deliverable.",
    auth: "required",
    requestExample: "{}",
    responseExample: '{"id":"prj_123","deliverables":{"architecture":"..."}}',
    commonErrors: ["401 Missing bearer token", "404 Project not found"],
  },
  {
    method: "POST",
    path: "/projects/{project_id}/generate/ai-engineering",
    name: "Generate AI Engineering Plan",
    description: "Generates AI engineering plan deliverable.",
    auth: "required",
    requestExample: "{}",
    responseExample: '{"id":"prj_123","deliverables":{"ai_engineering_plan":"..."}}',
    commonErrors: ["401 Missing bearer token", "404 Project not found"],
  },
  {
    method: "POST",
    path: "/projects/{project_id}/generate/github",
    name: "Generate GitHub Strategy",
    description: "Generates GitHub workflow, agents document, and project plan document.",
    auth: "required",
    requestExample: "{}",
    responseExample: '{"id":"prj_123","deliverables":{"github_strategy":"...","agents":"..."}}',
    commonErrors: ["401 Missing bearer token", "404 Project not found"],
  },
  {
    method: "PATCH",
    path: "/projects/{project_id}/tasks/{task_id}",
    name: "Update Task Status",
    description: "Updates a task status: backlog, in_progress, blocked, or done.",
    auth: "required",
    requestExample: '{"status":"in_progress"}',
    responseExample: '{"id":"prj_123","tasks":[{"id":"tsk_1","status":"in_progress"}]}',
    commonErrors: ["401 Missing bearer token", "404 Task not found", "422 Invalid status"],
  },
  {
    method: "POST",
    path: "/projects/{project_id}/stories/{story_id}/start",
    name: "Start Story",
    description: "Moves backlog tasks for the story into in_progress.",
    auth: "required",
    requestExample: "{}",
    responseExample: '{"id":"prj_123","tasks":[{"story_id":"str_1","status":"in_progress"}]}',
    commonErrors: ["401 Missing bearer token", "404 Story not found or no backlog tasks"],
  },
  {
    method: "GET",
    path: "/projects/{project_id}/status",
    name: "Get Status Timeline",
    description: "Returns timeline entries for project generation and execution progress.",
    auth: "required",
    requestExample: "{}",
    responseExample: '{"items":[{"phase":"outline_generated","progress":35}]}',
    commonErrors: ["401 Missing bearer token", "404 Project not found"],
  },
];

const methodFilters: MethodFilter[] = ["ALL", "GET", "POST", "PATCH"];

function methodClass(method: ApiEndpoint["method"]): string {
  if (method === "GET") return "api-method get";
  if (method === "POST") return "api-method post";
  return "api-method patch";
}

function endpointCurl(baseUrl: string, endpoint: ApiEndpoint): string {
  const url = `${baseUrl}${endpoint.path}`;

  if (endpoint.method === "GET") {
    return `curl -X GET ${url} \\
  -H "Authorization: Bearer <token>"`;
  }

  if (endpoint.method === "PATCH") {
    return `curl -X PATCH ${url} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{"status":"in_progress"}'`;
  }

  if (endpoint.path === "/projects") {
    return `curl -X POST ${url} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "title": "AI customer support portal",
    "summary": "Build MVP with ticket routing and bot triage",
    "problem_statement": "Support queues are too slow",
    "target_users": "support managers, support agents",
    "goals": ["reduce first response time", "improve CSAT"],
    "constraints": ["launch in 6 weeks"],
    "priority": "high"
  }'`;
  }

  return `curl -X POST ${url} \\
  -H "Authorization: Bearer <token>"`;
}

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

function buildPostmanCollection(baseUrl: string) {
  return {
    info: {
      name: "OpenClaw API",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      description: "OpenClaw API endpoint collection",
    },
    variable: [{ key: "baseUrl", value: baseUrl }],
    item: endpoints.map((endpoint) => ({
      name: `${endpoint.method} ${endpoint.path}`,
      request: {
        method: endpoint.method,
        header: endpoint.auth === "required"
          ? [{ key: "Authorization", value: "Bearer {{token}}" }]
          : [],
        url: {
          raw: `{{baseUrl}}${endpoint.path}`,
          host: ["{{baseUrl}}"],
          path: endpoint.path.split("/").filter(Boolean),
        },
        body: endpoint.method === "GET"
          ? undefined
          : {
              mode: "raw",
              raw: endpoint.requestExample,
              options: { raw: { language: "json" } },
            },
      },
    })),
  };
}

export default function ApiDocsPage() {
  const baseUrl = getApiBaseUrl();
  const docsUrl = getApiDocsUrl(baseUrl);
  const redocUrl = getApiRedocUrl(baseUrl);
  const sampleCurl = useMemo(() => endpointCurl(baseUrl, endpoints[1]), [baseUrl]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEndpoints = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return endpoints.filter((endpoint) => {
      const methodMatch = methodFilter === "ALL" || endpoint.method === methodFilter;
      if (!methodMatch) return false;
      if (!query) return true;

      return (
        endpoint.path.toLowerCase().includes(query) ||
        endpoint.name.toLowerCase().includes(query) ||
        endpoint.description.toLowerCase().includes(query) ||
        endpoint.method.toLowerCase().includes(query)
      );
    });
  }, [methodFilter, searchQuery]);

  const handleCopy = async (id: string, value: string) => {
    try {
      await copyToClipboard(value);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1300);
    } catch {
      setCopiedId(null);
    }
  };

  const handleDownloadPostman = () => {
    const collection = buildPostmanCollection(baseUrl);
    const json = JSON.stringify(collection, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "openclaw-api.postman_collection.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="api-docs-page page-enter">
      <section className="api-docs-hero reveal">
        <p className="section-label">Developer Documentation</p>
        <h1>OpenClaw API Reference</h1>
        <p>
          Find every available API endpoint in one place. This page is designed to make endpoint
          discovery fast for engineers and client teams.
        </p>
        <div className="api-docs-hero-actions">
          <a className="inline-link" href={docsUrl} target="_blank" rel="noreferrer">
            Open Swagger UI
          </a>
          <a className="inline-link" href={redocUrl} target="_blank" rel="noreferrer">
            Open ReDoc
          </a>
          <Link href="/projects/new" className="inline-link">
            Test with New Project
          </Link>
        </div>
      </section>

      <section className="api-docs-meta card reveal delay-1">
        <h2 className="section-h2">Quick Start</h2>
        <div className="api-docs-tools">
          <button type="button" className="api-copy-btn secondary" onClick={handleDownloadPostman}>
            Download Postman Collection
          </button>
        </div>
        <div className="api-meta-grid">
          <article>
            <h3>Base URL</h3>
            <pre>{baseUrl}</pre>
          </article>
          <article>
            <h3>Auth</h3>
            <pre>Authorization: Bearer &lt;supabase_jwt&gt;</pre>
          </article>
          <article>
            <h3>Content Type</h3>
            <pre>application/json</pre>
          </article>
        </div>
      </section>

      <section className="api-endpoints card reveal delay-2">
        <div className="section-head">
          <h2>Available Endpoints</h2>
          <span className="status-pill ready">
            {filteredEndpoints.length} / {endpoints.length} endpoints
          </span>
        </div>

        <div className="api-filter-bar">
          <input
            type="search"
            className="api-search-input"
            placeholder="Search endpoint, path, or description"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search endpoints"
          />
          <div className="api-method-filters" role="tablist" aria-label="Method filter">
            {methodFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`api-filter-chip${methodFilter === filter ? " active" : ""}`}
                onClick={() => setMethodFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="api-endpoint-list">
          {!filteredEndpoints.length && (
            <p className="api-empty-state">No endpoints match your search/filter.</p>
          )}
          {filteredEndpoints.map((endpoint) => (
            <article key={`${endpoint.method}-${endpoint.path}`} className="api-endpoint-row">
              <div className="api-endpoint-main">
                <span className={methodClass(endpoint.method)}>{endpoint.method}</span>
                <code className="api-endpoint-path">{endpoint.path}</code>
                <div className="api-endpoint-actions">
                  <button
                    type="button"
                    className="api-copy-btn"
                    onClick={() => handleCopy(`path-${endpoint.method}-${endpoint.path}`, endpoint.path)}
                  >
                    {copiedId === `path-${endpoint.method}-${endpoint.path}` ? "Copied" : "Copy Path"}
                  </button>
                  <button
                    type="button"
                    className="api-copy-btn secondary"
                    onClick={() =>
                      handleCopy(`curl-${endpoint.method}-${endpoint.path}`, endpointCurl(baseUrl, endpoint))
                    }
                  >
                    {copiedId === `curl-${endpoint.method}-${endpoint.path}` ? "Copied" : "Copy Curl"}
                  </button>
                </div>
              </div>
              <div className="api-endpoint-info">
                <h4>{endpoint.name}</h4>
                <p>{endpoint.description}</p>
                <details className="api-endpoint-details">
                  <summary>Request / Response / Errors</summary>
                  <div className="api-detail-grid">
                    <div>
                      <h5>Auth</h5>
                      <pre>{endpoint.auth === "required" ? "Bearer token required" : "No auth required"}</pre>
                    </div>
                    <div>
                      <h5>Request Example</h5>
                      <pre>{endpoint.requestExample}</pre>
                    </div>
                    <div>
                      <h5>Response Example</h5>
                      <pre>{endpoint.responseExample}</pre>
                    </div>
                    <div>
                      <h5>Common Errors</h5>
                      <pre>{endpoint.commonErrors.join("\n")}</pre>
                    </div>
                  </div>
                </details>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="api-sample card reveal delay-2">
        <div className="section-head">
          <h2 className="section-h2">Sample Request</h2>
          <button
            type="button"
            className="api-copy-btn secondary"
            onClick={() => handleCopy("sample-curl", sampleCurl)}
          >
            {copiedId === "sample-curl" ? "Copied" : "Copy Curl"}
          </button>
        </div>
        <pre>{sampleCurl}</pre>
      </section>
    </div>
  );
}
