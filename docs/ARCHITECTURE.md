# ARCHITECTURE

## System Architecture
- Frontend: Next.js TypeScript app
- Backend: FastAPI service
- Data Store: PostgreSQL (target), in-memory store for bootstrap
- Auth: Supabase Auth (planned integration)
- AI Orchestration: LangGraph-first design

## API Structure Draft
- POST /projects
- GET /projects
- GET /projects/{id}
- POST /projects/{id}/generate
- GET /projects/{id}/status

## Database Schema Draft
- projects(id, title, summary, priority, project_type, created_at)
- project_outlines(project_id, scope_json, milestones_json, roadmap_json, dod_json)
- epics(id, project_id, title, feature)
- stories(id, epic_id, title, description, priority, acceptance_json)
- tasks(id, project_id, story_id, title, owner_agent, sprint, status, depends_on_json)
- agent_assignments(project_id, agent_name, active_task_ids_json)
- deliverables(project_id, project_plan_md, agile_plan_md, architecture_md, ai_plan_md, agents_md, github_strategy_md)
- status_timeline(project_id, phase, progress_percent, updated_at)

## Deployment Design
- Dockerized local development with API and Web services
- CI with API import checks and web build checks
- Future: managed Postgres + hosted Next.js + containerized FastAPI
