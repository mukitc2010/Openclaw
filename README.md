# 🐾 OpenClaw — AI-Powered Software Delivery Platform

> An enterprise-grade multi-agent AI engineering platform that transforms a software project idea into a professionally planned, architected, and delivery-ready codebase — powered by AI agents working as a real software team.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [AI Agents](#ai-agents)
- [API Reference](#api-reference)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## Overview

OpenClaw is an enterprise AI Software Delivery Platform that accepts a software project idea, creates a professional project plan through a Project Manager agent, distributes work across specialized AI agents, generates technical deliverables, and organises the work for GitHub delivery.

### Core Workflow

```
User Idea → Project Manager Agent → Agile Planning → Agent Assignment →
Architecture & AI Engineering → Sprint Board → GitHub Delivery Plan
```

### Key Features

- **Project Intake** — Capture project ideas with context, goals, users, and constraints
- **PM Agent** — AI-driven project outline, scope definition, milestones, and Agile roadmap
- **Agile Planning** — Epics, user stories, acceptance criteria, sprint distribution
- **Agent Orchestration** — 13 specialized AI agents working in parallel
- **Architecture Generation** — System design, API structure, database schema
- **Sprint Board** — Kanban-style board tracking tasks across sprints
- **GitHub Plan** — Branch strategy, commit plan, PR templates, docs structure
- **Dark Enterprise UI** — Professional Next.js dashboard with real-time agent status

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    OpenClaw Platform                         │
├─────────────────────┬────────────────────────────────────────┤
│   Frontend          │   Backend                              │
│   Next.js 14        │   FastAPI                              │
│   TypeScript        │   SQLAlchemy                           │
│   Tailwind CSS      │   PostgreSQL / SQLite                  │
├─────────────────────┴────────────────────────────────────────┤
│                  AI Agent Layer                               │
│  PM | BA | Architect | AI Engineer | Frontend | Backend |    │
│  DevOps | QA | Security | Code Review | GitHub Agent         │
├──────────────────────────────────────────────────────────────┤
│              AI Providers (OpenAI / Mock)                    │
└──────────────────────────────────────────────────────────────┘
```

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full technical architecture.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.12 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | SQLAlchemy 2.0 |
| AI | OpenAI GPT-4 / Mock mode |
| DevOps | Docker, Docker Compose |

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker & Docker Compose (optional)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/mukitc2010/Openclaw.git
cd Openclaw

# Copy environment files
cp backend/.env.example backend/.env

# Start all services
docker compose up --build
```

Access the platform at **http://localhost:3000**

### Option 2: Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate          # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY (optional — mock mode works without it)

# Start the backend
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Access the platform at **http://localhost:3000**

### Environment Variables

```env
# backend/.env
APP_ENV=development
DEBUG=true
DATABASE_URL=sqlite+aiosqlite:///./openclaw.db
OPENAI_API_KEY=sk-...            # Optional: leave blank for mock AI mode
CORS_ORIGINS=http://localhost:3000
```

---

## Project Structure

```
OpenClaw/
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── main.py           # Application entry point
│   │   ├── config.py         # Settings management
│   │   ├── database.py       # Database connection
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── api/routes/       # API route handlers
│   │   ├── services/         # Business logic layer
│   │   └── agents/           # AI agent implementations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # Next.js frontend
│   ├── app/
│   │   ├── page.tsx          # Dashboard
│   │   ├── projects/
│   │   │   ├── new/          # Project creation form
│   │   │   └── [id]/         # Project detail view
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/api.ts        # API client
│   │   └── types/            # TypeScript interfaces
│   └── package.json
├── docs/                     # Platform documentation
│   ├── PROJECT_PLAN.md
│   ├── AGILE_PLAN.md
│   ├── ARCHITECTURE.md
│   ├── AI_ENGINEERING_PLAN.md
│   └── AGENTS.md
├── docker-compose.yml
└── README.md
```

---

## AI Agents

OpenClaw orchestrates **13 specialized AI agents**:

| Agent | Role |
|---|---|
| 🎯 Project Manager | Creates project outline, scope, milestones, Agile roadmap |
| 📊 Business Analyst | Defines epics, user stories, acceptance criteria |
| 🏗️ Solution Architect | System architecture, tech stack, API design |
| 🤖 AI Engineer | AI/ML pipeline design, model selection, vector stores |
| 🎨 UI/UX Designer | Design system, component library, wireframes |
| 💻 Frontend Developer | Frontend architecture, component structure |
| ⚙️ Backend Developer | Backend architecture, service design, API contracts |
| 🗄️ Database Engineer | Schema design, indexing strategy, migrations |
| 🚀 DevOps Engineer | Docker, CI/CD, infrastructure, deployment |
| 🧪 QA Engineer | Test strategy, test cases, quality gates |
| 🔐 Security Engineer | Security requirements, threat model, best practices |
| 🔍 Code Reviewer | Review guidelines, coding standards, PR templates |
| 📦 GitHub Agent | Repository structure, branch strategy, commit plan |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/projects` | Create a new project |
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/{id}` | Get project details |
| PUT | `/api/projects/{id}` | Update project |
| POST | `/api/projects/{id}/generate` | Run all AI agents |
| GET | `/api/projects/{id}/agents` | Get agents for project |
| POST | `/api/projects/{id}/agents/{agent_id}/run` | Run a specific agent |
| GET | `/api/projects/{id}/tasks` | Get tasks/stories |

Interactive API docs available at **http://localhost:8000/docs**

---

## Documentation

- [PROJECT_PLAN.md](./docs/PROJECT_PLAN.md) — Project goals, scope, and delivery plan
- [AGILE_PLAN.md](./docs/AGILE_PLAN.md) — Epics, user stories, and sprint plan
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Technical architecture and design decisions
- [AI_ENGINEERING_PLAN.md](./docs/AI_ENGINEERING_PLAN.md) — AI/ML engineering strategy
- [AGENTS.md](./docs/AGENTS.md) — Agent roles, responsibilities, and outputs

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'feat: add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](./LICENSE) for details.