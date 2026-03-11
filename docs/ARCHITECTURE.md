# ARCHITECTURE.md — OpenClaw Technical Architecture

**Version:** 1.0.0  
**Status:** Active  

---

## 1. System Overview

OpenClaw is a multi-tier enterprise AI Software Delivery Platform. It follows a clean layered architecture with a React/Next.js frontend, FastAPI backend, SQLAlchemy ORM, and an AI agent orchestration layer.

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                  │
│                     Next.js 14 (App Router)                          │
│              TypeScript + Tailwind CSS + Dark Theme                   │
│    Dashboard | Project Form | Detail View | Sprint Board              │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ HTTP/REST (JSON)
                       │ localhost:3000 → localhost:8000
┌──────────────────────▼───────────────────────────────────────────────┐
│                         API LAYER                                     │
│                    FastAPI (Python 3.12)                              │
│          /api/projects  /api/agents  /api/tasks  /api/health          │
│                  Pydantic v2 Validation + OpenAPI Docs                 │
└──────────────────────┬───────────────────────────────────────────────┘
                       │
         ┌─────────────┼──────────────┐
         │             │              │
┌────────▼──────┐  ┌───▼──────────┐  │
│  Service Layer │  │  AI Agents   │  │
│  project_svc   │  │  pm_agent    │  │
│  agent_svc     │  │  ba_agent    │  │
│  ai_service    │  │  architect   │  │
└────────┬──────┘  │  frontend    │  │
         │         │  backend     │  │
         │         │  devops      │  │
         │         │  github      │  │
         │         └───┬──────────┘  │
         │             │             │
┌────────▼─────────────▼─────────────▼──────────┐
│                  DATA LAYER                    │
│         SQLAlchemy 2.0 (async)                 │
│         SQLite (dev) / PostgreSQL (prod)       │
│    Tables: projects, agents, tasks             │
└────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────┐
│           AI PROVIDER LAYER             │
│    OpenAI GPT-4 (when key is set)       │
│    Mock AI (realistic generated output) │
└─────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### Framework
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for utility-first styling

### Directory Structure

```
frontend/app/
├── page.tsx               # Dashboard (SSR)
├── layout.tsx             # Root layout with Header
├── globals.css            # Tailwind base styles
├── projects/
│   ├── new/page.tsx       # Project creation form (client)
│   └── [id]/page.tsx      # Project detail (client with polling)
├── components/
│   ├── Header.tsx         # Navigation header
│   ├── ProjectCard.tsx    # Dashboard project card
│   ├── AgentCard.tsx      # Agent status card
│   ├── TaskCard.tsx       # Sprint task card
│   ├── SprintBoard.tsx    # Kanban sprint board
│   ├── StatusBadge.tsx    # Coloured status badges
│   └── LoadingSpinner.tsx # Loading indicator
├── lib/
│   └── api.ts             # API client (fetch wrapper)
└── types/
    └── index.ts           # TypeScript interfaces
```

### State Management
- **Server Components** for static data (dashboard)
- **Client Components** with `useState`/`useEffect` for interactive pages
- **Polling** (3s interval) while agents are in `running` state

### Routing
| Route | Type | Description |
|---|---|---|
| `/` | Server | Dashboard with project list |
| `/projects/new` | Client | Project creation form |
| `/projects/[id]` | Client | Project detail with tabs |

---

## 3. Backend Architecture

### Framework
- **FastAPI** — async Python web framework
- **Uvicorn** — ASGI server
- **SQLAlchemy 2.0** — async ORM
- **Pydantic v2** — data validation

### Directory Structure

```
backend/app/
├── main.py               # FastAPI app + lifespan
├── config.py             # Settings (pydantic-settings)
├── database.py           # Async engine + session
├── models/
│   ├── project.py        # Project ORM model
│   ├── agent.py          # Agent ORM model
│   └── task.py           # Task ORM model
├── schemas/
│   ├── project.py        # Project Pydantic schemas
│   ├── agent.py          # Agent Pydantic schemas
│   └── task.py           # Task Pydantic schemas
├── api/
│   ├── router.py         # API prefix router
│   └── routes/
│       ├── projects.py   # Project CRUD + generate
│       ├── agents.py     # Agent management
│       └── tasks.py      # Task management
├── services/
│   ├── project_service.py
│   ├── agent_service.py
│   └── ai_service.py     # AI orchestration
└── agents/
    ├── base_agent.py     # Abstract base
    ├── pm_agent.py
    ├── ba_agent.py
    ├── architect_agent.py
    ├── frontend_agent.py
    ├── backend_agent.py
    ├── devops_agent.py
    └── github_agent.py
```

### Request Lifecycle

```
HTTP Request
    │
    ▼
FastAPI Router (validation, auth)
    │
    ▼
Route Handler (api/routes/)
    │
    ▼
Service Layer (services/)
    │
    ├──▶ Database (SQLAlchemy)
    │
    └──▶ AI Service → Agent → OpenAI/Mock
                │
                ▼
           Structured Output
                │
                ▼
         Stored in DB (agent.output JSON)
```

---

## 4. Database Schema

### projects

```sql
CREATE TABLE projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type        VARCHAR(50),                -- saas, chatbot, marketplace, etc.
    status      VARCHAR(50) DEFAULT 'draft',
    goals       TEXT,
    target_users TEXT,
    constraints TEXT,
    priority    VARCHAR(20) DEFAULT 'medium',
    outline     JSONB,                     -- PM Agent output
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### agents

```sql
CREATE TABLE agents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    role        VARCHAR(100) NOT NULL,      -- pm, ba, architect, etc.
    status      VARCHAR(50) DEFAULT 'pending',
    output      JSONB,                     -- Structured agent output
    error       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### tasks

```sql
CREATE TABLE tasks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
    agent_id     UUID REFERENCES agents(id),
    title        VARCHAR(500) NOT NULL,
    description  TEXT,
    type         VARCHAR(50) DEFAULT 'task', -- epic, feature, story, task, bug
    status       VARCHAR(50) DEFAULT 'todo',
    sprint       VARCHAR(50) DEFAULT 'backlog',
    priority     VARCHAR(20) DEFAULT 'medium',
    agent_assigned VARCHAR(100),
    story_points INTEGER,
    acceptance_criteria TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. API Design

### RESTful Endpoints

```
GET    /api/health                           Health check
POST   /api/projects                         Create project
GET    /api/projects                         List projects
GET    /api/projects/{id}                    Get project
PUT    /api/projects/{id}                    Update project
DELETE /api/projects/{id}                    Delete project
POST   /api/projects/{id}/generate           Run all agents
GET    /api/projects/{id}/agents             List agents
GET    /api/projects/{id}/agents/{agent_id}  Get agent
POST   /api/projects/{id}/agents/{agent_id}/run  Run agent
GET    /api/projects/{id}/tasks              List tasks
POST   /api/projects/{id}/tasks              Create task
PUT    /api/projects/{id}/tasks/{task_id}    Update task
```

### Response Format

```json
{
  "id": "uuid",
  "title": "My SaaS App",
  "status": "active",
  "agents": [],
  "tasks": [],
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

## 6. AI Architecture

### Agent Design Pattern

```
BaseAgent (abstract)
    │
    ├── run(project) → AgentOutput
    │       │
    │       ├── _build_prompt(project) → str
    │       ├── _call_ai(prompt) → str
    │       │       ├── OpenAI (if OPENAI_API_KEY set)
    │       │       └── Mock (structured response)
    │       └── _parse_output(raw) → dict
    │
    └── AgentOutput
            ├── status: completed | failed
            ├── output: dict (structured)
            └── error: str | None
```

### Agent Output Schema

Each agent produces structured JSON tailored to its role:

**PM Agent:**
```json
{
  "project_outline": {
    "title": "...",
    "description": "...",
    "scope": "...",
    "milestones": [...],
    "risks": [...],
    "definition_of_done": "..."
  }
}
```

**BA Agent:**
```json
{
  "epics": [...],
  "user_stories": [
    {
      "title": "...",
      "description": "...",
      "acceptance_criteria": [...],
      "priority": "high",
      "sprint": "Sprint 1",
      "story_points": 5
    }
  ]
}
```

**Architect Agent:**
```json
{
  "architecture": {
    "overview": "...",
    "components": [...],
    "tech_stack": {...},
    "api_design": {...},
    "database_schema": {...},
    "deployment": {...}
  }
}
```

---

## 7. Deployment Architecture

### Development (Docker Compose)

```
docker-compose.yml
├── backend   (FastAPI, port 8000)
│   └── SQLite database (volume)
└── frontend  (Next.js, port 3000)
```

### Production (Recommended)

```
                    ┌──────────────┐
                    │  Nginx/CDN   │
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
     ┌──────▼──────┐ ┌────▼──────┐  ┌───▼────┐
     │  Next.js    │ │  FastAPI  │  │  Docs  │
     │  (Vercel)   │ │  (fly.io) │  │        │
     └─────────────┘ └────┬──────┘  └────────┘
                          │
                   ┌──────▼──────┐
                   │ PostgreSQL  │
                   │ (Supabase)  │
                   └─────────────┘
```

---

## 8. Security Design

- **No secrets in code** — all sensitive values in environment variables
- **Pydantic validation** — all inputs validated before processing
- **SQL injection prevention** — SQLAlchemy ORM with parameterised queries
- **CORS** — restricted to configured origins
- **Rate limiting** — to be added via FastAPI middleware in production
- **API key management** — OpenAI key stored in env, never exposed to frontend
