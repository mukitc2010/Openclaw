# OpenClaw — System Architecture

## Overview

OpenClaw is a multi-agent AI platform that acts as an autonomous software engineering organization. It accepts a natural-language project idea and orchestrates a team of specialized AI agents through all SDLC phases, producing a fully planned, architected, engineered, tested, and GitHub-delivered software system.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User / Client                        │
│              (Browser  ·  API Client  ·  CLI)               │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS / REST / WebSocket
┌───────────────────────────▼─────────────────────────────────┐
│                    API Gateway (FastAPI)                     │
│    /projects  /agents  /sprints  /artifacts  /ws/stream     │
└──────┬──────────────────────────────────────────────────────┘
       │
┌──────▼────────────────────────────────────────────────────┐
│                   Agent Orchestrator                       │
│   LangGraph state machine  ·  Agent Router  ·  Memory     │
│                                                            │
│  PM Agent → BA Agent → Architect → AI Eng → Dev Agents    │
│  → QA Agent → Security Agent → Code Reviewer → GitHub     │
└──────┬────────────────────────────────────────────────────┘
       │
┌──────▼────────────────────┐   ┌────────────────────────────┐
│     LLM Service Layer     │   │    Vector Store (Qdrant)   │
│  OpenAI GPT-4o / Claude   │   │  RAG  ·  Knowledge Base    │
└───────────────────────────┘   └────────────────────────────┘
       │
┌──────▼────────────────────┐   ┌────────────────────────────┐
│   PostgreSQL Database     │   │    Redis (Cache / Queue)   │
│  Projects · Sprints ·     │   │  Session  ·  Rate Limit    │
│  Artifacts · Agents       │   │  Task Queue                │
└───────────────────────────┘   └────────────────────────────┘
       │
┌──────▼────────────────────┐
│    GitHub Integration     │
│  Repo creation · Branches │
│  PRs · Commits · Actions  │
└───────────────────────────┘
```

---

## Component Breakdown

### 1. API Layer (`/backend/app/api`)

- **FastAPI** with async endpoints
- REST API for project CRUD, sprint management, artifact retrieval
- WebSocket endpoint for real-time agent streaming output
- JWT authentication middleware
- OpenAPI / Swagger documentation auto-generated

### 2. Agent Orchestrator (`/backend/app/agents`, `/ai/agents`)

- Built on **LangGraph** for deterministic agent state machine execution
- Each agent is a node in the graph with defined inputs/outputs
- Shared memory store (short-term: Redis, long-term: PostgreSQL + Qdrant)
- Execution order enforced by graph edges
- Streaming support for real-time output to the frontend

### 3. AI Service Layer (`/ai`)

- Prompt templates per agent (versioned in `/ai/prompts`)
- RAG pipelines for pulling context from existing codebases or documents
- LLM abstraction layer supporting OpenAI and Anthropic
- Evaluation harness for agent output quality

### 4. Database (`/database`)

- **PostgreSQL 15** for all persistent data
- Async ORM via **SQLAlchemy 2.0 + asyncpg**
- Alembic for schema migrations
- Key tables: `projects`, `sprints`, `user_stories`, `tasks`, `artifacts`, `agent_runs`

### 5. Vector Store

- **Qdrant** for semantic search over project knowledge, code, and documentation
- Used by agents for RAG context injection

### 6. Frontend (`/frontend`)

- **Next.js 14** with TypeScript
- Project intake wizard
- Real-time agent stream viewer (WebSocket)
- Sprint board (Kanban)
- Artifact browser (documents, diagrams, code)

### 7. DevOps (`/devops`)

- Docker + Docker Compose for local development
- Kubernetes manifests for production
- GitHub Actions CI/CD pipeline

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Backend Framework | FastAPI (Python 3.11) |
| AI Orchestration | LangGraph, LangChain |
| LLM | OpenAI GPT-4o, Anthropic Claude 3.5 |
| Vector Database | Qdrant |
| Database | PostgreSQL 15 |
| ORM | SQLAlchemy 2.0 + asyncpg |
| Migrations | Alembic |
| Cache / Queue | Redis |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Containerization | Docker, Docker Compose |
| Orchestration | Kubernetes |
| CI/CD | GitHub Actions |

---

## Security Architecture

- All secrets in environment variables (never in code)
- JWT-based API authentication
- HTTPS enforced in production
- Input validation on all API endpoints (Pydantic models)
- LLM output sanitized before storage
- RBAC for project access control

---

## Scalability Design

- Horizontal scaling of FastAPI workers (Gunicorn + Uvicorn)
- Agent tasks run as background jobs (Redis queue)
- PostgreSQL read replicas for reporting queries
- Qdrant clustered for high-availability vector search
- Stateless API layer — sessions stored in Redis
