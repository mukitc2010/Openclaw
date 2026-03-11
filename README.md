# OpenClaw — AI Engineering Organization

**OpenClaw** is an enterprise-grade autonomous AI Software Engineering Organization. It operates like a professional technology company with specialized AI agents collaborating through Agile methodology and Software Development Lifecycle (SDLC) best practices.

## What is OpenClaw?

OpenClaw transforms a project idea into a professionally planned, architected, engineered, tested, documented, and delivered software system — end to end, autonomously.

## Key Agents

| Agent | Role |
|---|---|
| Project Manager | Produces project outline, Agile plan, sprint roadmap |
| Business Analyst | Refines requirements, user stories, acceptance criteria |
| Solution Architect | Designs system, frontend, backend, DB, APIs, deployment |
| AI Engineering Agent | Designs AI workflows, agents, prompts, RAG pipelines |
| Frontend Developer | Builds UI/UX components |
| Backend Developer | Builds APIs and services |
| Database Engineer | Designs schemas and migrations |
| DevOps Agent | Configures CI/CD, Docker, Kubernetes |
| QA/Test Engineer | Writes tests and validates acceptance criteria |
| Security Agent | Reviews auth, secrets, vulnerabilities |
| Code Review Agent | Reviews readability, maintainability, architecture fit |
| GitHub Agent | Delivers structured repo, branches, and PRs |

## SDLC Phases

- **Phase 1 — Discovery:** Project intake, goals, constraints, risks
- **Phase 2 — Agile Planning:** Epics, user stories, sprints, task distribution
- **Phase 3 — Architecture:** System, AI, DB, API, deployment design
- **Phase 4 — Implementation:** Modular, typed, documented, tested code
- **Phase 5 — Quality Control:** QA, Security, Code Review
- **Phase 6 — GitHub Delivery:** Structured repo, branches, PRs, release notes

## Repository Structure

```
/docs           — Project and architecture documentation
/backend        — FastAPI backend with agent orchestration
/frontend       — React/Next.js user interface
/ai             — AI agents, prompts, pipelines, evaluation
/database       — Schemas, migrations, seed data
/tests          — Integration and E2E tests
/devops         — Docker, Kubernetes, CI/CD scripts
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+

### Setup

```bash
# Clone and configure
cp .env.example .env
# Edit .env with your API keys and DB credentials

# Start with Docker Compose
docker-compose -f devops/docker/docker-compose.yml up --build

# Or run locally
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
cd frontend && npm install && npm run dev
```

### Environment Variables

See [`.env.example`](.env.example) for all required configuration.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Agent Definitions](docs/AGENTS.md)
- [Project Plan](docs/PROJECT_PLAN.md)

## License

MIT