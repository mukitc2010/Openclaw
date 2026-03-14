# OpenClaw

OpenClaw is an enterprise-style AI Software Delivery Platform. It accepts a project idea, generates a professional project outline, decomposes work into Agile artifacts, assigns work to specialist agents, and produces architecture/AI/GitHub deliverables for execution.

## Current Implementation (Sprint 1 Baseline)

- Project intake API and UI
- PM outline generation
- Agile artifact generation (epics, stories, tasks)
- Agent assignment matrix and sprint board
- Architecture/AI/GitHub document generation
- Project status timeline tracking

## Monorepo Structure

```
apps/
	api/        FastAPI backend
	web/        Next.js frontend dashboard
docs/         Planning and delivery markdown outputs
infra/        Docker Compose local runtime
.github/      CI workflow
```

## Tech Stack

- Frontend: Next.js + TypeScript
- Backend: FastAPI (Python)
- Database target: PostgreSQL (Supabase)
- Auth target: Supabase Auth
- AI orchestration target: LangGraph-first
- DevOps: Docker + GitHub Actions

## Run Locally

### Build Everything (No Prompts)

```bash
./scripts/build-all.sh
```

This command installs dependencies and runs build checks for:

- `apps/api`
- `apps/mcp-server`
- `apps/web`

### Option A: Docker Compose

```bash
cd infra
docker compose up
```

Web: http://localhost:3000

API: http://localhost:8010

### Option B: Manual

Backend:

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd apps/web
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:8010 npm run dev
```

Production URL setup:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.robolog.us
NEXT_PUBLIC_API_DOCS_URL=https://api.robolog.us/docs
NEXT_PUBLIC_API_REDOC_URL=https://api.robolog.us/redoc
```

## Core API Endpoints

- `GET /health`: API health/status
- `POST /projects`: create project
- `GET /projects`: list projects
- `GET /projects/{project_id}`: project details
- `POST /projects/{project_id}/generate`: run PM + Agile + technical plan generation
- `POST /projects/{project_id}/generate/outline`: run PM outline module
- `POST /projects/{project_id}/generate/agile`: run Agile planning + assignment module
- `POST /projects/{project_id}/generate/architecture`: run architecture module
- `POST /projects/{project_id}/generate/ai-engineering`: run AI engineering module
- `POST /projects/{project_id}/generate/github`: run GitHub delivery module
- `PATCH /projects/{project_id}/tasks/{task_id}`: update task status
- `POST /projects/{project_id}/stories/{story_id}/start`: start a story (moves backlog tasks to in progress)
- `GET /projects/{project_id}/status`: status timeline

## Agile and Planning Deliverables

Generated and tracked deliverables include:

- `docs/PROJECT_PLAN.md`
- `docs/AGILE_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/AI_ENGINEERING_PLAN.md`
- `docs/AGENTS.md`

## GitHub Strategy

- Branching model: trunk-based with short-lived branches
- Branch naming:
	- `feat/<module>-<scope>`
	- `fix/<module>-<scope>`
	- `chore/<scope>`
- Commit style: small, task-linked commits
- PR requirements: summary, risk notes, test evidence, rollout notes
- CI checks: API import validation + Next.js production build

## Definition of Done (V1 Baseline)

- User can submit project idea
- PM module can generate project outline
- Agile module can generate stories/tasks/sprint plan
- Agent assignments and task status are visible
- Architecture, AI engineering, and GitHub strategy outputs are generated
- Dashboard displays progress and timeline

## Next Planned Enhancements

- Supabase Auth enforcement
- Persistent PostgreSQL storage layer and migrations
- LangGraph runtime integration for live multi-agent execution
- Expanded automated tests and contract validation