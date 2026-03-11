# AGILE_PLAN.md — OpenClaw Agile Delivery Plan

**Version:** 1.0.0  
**Methodology:** Scrum / Agile  
**Sprint Length:** 2 weeks  

---

## 1. Epics

### EPIC-001: Platform Foundation
**Description:** Set up the core infrastructure — backend API, database, and frontend scaffolding.  
**Priority:** Critical  
**Sprint:** 1  

### EPIC-002: AI Agent System
**Description:** Build and integrate all 13 specialized AI agents with mock and OpenAI modes.  
**Priority:** Critical  
**Sprint:** 1–2  

### EPIC-003: Project Management
**Description:** Project intake form, project CRUD, and project detail page.  
**Priority:** High  
**Sprint:** 2  

### EPIC-004: Agile Planning Engine
**Description:** Automatic generation of epics, user stories, tasks, and sprint assignments.  
**Priority:** High  
**Sprint:** 2  

### EPIC-005: Sprint Board
**Description:** Kanban-style sprint board for tracking tasks across sprints.  
**Priority:** Medium  
**Sprint:** 2–3  

### EPIC-006: Architecture Generation
**Description:** AI-generated system architecture, API design, and database schema.  
**Priority:** High  
**Sprint:** 2  

### EPIC-007: GitHub Delivery Module
**Description:** Repository strategy, branch plan, commit conventions, and PR templates.  
**Priority:** Medium  
**Sprint:** 3  

### EPIC-008: Platform Dashboard
**Description:** Professional dashboard with project overview, agent status, and metrics.  
**Priority:** High  
**Sprint:** 2–3  

### EPIC-009: Documentation
**Description:** All platform and project documentation files.  
**Priority:** Medium  
**Sprint:** 3  

### EPIC-010: DevOps & Deployment
**Description:** Docker configuration, environment management, and CI/CD readiness.  
**Priority:** Medium  
**Sprint:** 3–4  

---

## 2. User Stories

### EPIC-001: Platform Foundation

**US-001** — As a developer, I want the backend API to start with a health check endpoint so I can verify the service is running.  
- **Acceptance Criteria:**
  - `GET /api/health` returns `{ status: "ok" }`
  - Response includes AI mode (mock or openai)
  - Response time < 100ms

**US-002** — As a developer, I want the database to be automatically initialised on startup so I don't need to run migrations manually in development.  
- **Acceptance Criteria:**
  - Tables are created on first startup
  - SQLite works in development
  - PostgreSQL connection string is configurable via env var

**US-003** — As a developer, I want CORS configured correctly so the frontend can call the backend.  
- **Acceptance Criteria:**
  - Frontend (localhost:3000) is in allowed origins
  - All HTTP methods are allowed
  - Preflight requests succeed

---

### EPIC-002: AI Agent System

**US-010** — As a user, I want all 13 AI agents to be automatically created when I create a project.  
- **Acceptance Criteria:**
  - Creating a project creates 13 agents with status "pending"
  - Each agent has a unique role and name
  - Agents are retrievable via `GET /api/projects/{id}/agents`

**US-011** — As a user, I want the Project Manager Agent to generate a project outline.  
- **Acceptance Criteria:**
  - PM Agent produces: title, description, scope, milestones[], risks[], definition_of_done
  - Output is stored as JSON against the agent record
  - Agent status transitions: pending → running → completed

**US-012** — As a user, I want the Business Analyst Agent to create epics and user stories.  
- **Acceptance Criteria:**
  - BA Agent produces structured epics with user stories
  - Each story has: title, description, acceptance_criteria, priority, sprint
  - Tasks are stored in the tasks table

**US-013** — As a user, I want the system to work without an OpenAI API key using mock mode.  
- **Acceptance Criteria:**
  - Mock mode produces realistic, structured output
  - Mock output is based on the project description
  - No error when `OPENAI_API_KEY` is not set

---

### EPIC-003: Project Management

**US-020** — As a user, I want to submit a project idea with title, type, description, goals, and target users.  
- **Acceptance Criteria:**
  - Form validates required fields (title, description, goals)
  - Project type has 7 options
  - On submit, project is created and user is redirected to project detail

**US-021** — As a user, I want to view a list of all my projects on the dashboard.  
- **Acceptance Criteria:**
  - Projects displayed as cards in a responsive grid
  - Each card shows title, status badge, description, agent count
  - Empty state shown when no projects exist

**US-022** — As a user, I want to view a project's detail with all generated information.  
- **Acceptance Criteria:**
  - Project detail has 5 tabs: Overview, Agents, Sprint Board, Architecture, GitHub Plan
  - Each tab loads the appropriate AI-generated content
  - Status and agent progress are visible

---

### EPIC-004: Agile Planning Engine

**US-030** — As a user, I want the system to generate epics automatically from the project description.  
- **Acceptance Criteria:**
  - At least 5 epics generated per project
  - Each epic has title, description, priority
  - Epics are displayed in the Sprint Board

**US-031** — As a user, I want user stories created for each epic.  
- **Acceptance Criteria:**
  - Each epic has at least 3 user stories
  - Stories have acceptance criteria
  - Stories are assigned to sprints (Sprint 1, 2, 3, or Backlog)

**US-032** — As a user, I want tasks assigned a priority (critical/high/medium/low).  
- **Acceptance Criteria:**
  - Priority is visible on task cards
  - Tasks can be filtered by priority
  - Priority badges use colour coding

---

### EPIC-005: Sprint Board

**US-040** — As a user, I want a Kanban-style sprint board showing tasks across sprints.  
- **Acceptance Criteria:**
  - Columns: Backlog, Sprint 1, Sprint 2, Sprint 3, Done
  - Tasks displayed as cards with priority and agent badges
  - Board is horizontally scrollable on small screens

**US-041** — As a user, I want to see task counts per sprint column.  
- **Acceptance Criteria:**
  - Column headers show task count
  - Total task count visible
  - Empty columns handled gracefully

---

### EPIC-006: Architecture Generation

**US-050** — As a user, I want the Solution Architect Agent to generate a system architecture document.  
- **Acceptance Criteria:**
  - Output includes: overview, components, tech_stack, api_design, database_schema
  - Architecture displayed in formatted markdown in the Architecture tab
  - Output tailored to the project type

---

### EPIC-007: GitHub Delivery Module

**US-060** — As a user, I want the GitHub Agent to generate a repository and branch strategy.  
- **Acceptance Criteria:**
  - Output includes: repo_structure, branch_strategy, commit_conventions, pr_template
  - GitHub plan visible in the GitHub Plan tab
  - Branch names follow gitflow conventions

---

## 3. Sprint Plan

### Sprint 1 — Foundation & Agents (Weeks 1–2)

| Story | Priority | Agent | Effort |
|---|---|---|---|
| US-001: Health check API | Critical | Backend Dev | 1h |
| US-002: Database initialisation | Critical | Backend Dev | 2h |
| US-003: CORS configuration | Critical | Backend Dev | 1h |
| US-010: Auto-create agents | Critical | Backend Dev | 4h |
| US-011: PM Agent | Critical | AI Engineer | 8h |
| US-012: BA Agent | High | AI Engineer | 8h |
| US-013: Mock mode | High | AI Engineer | 4h |

**Sprint 1 Goal:** Working backend with all agents functional in mock mode.

---

### Sprint 2 — Frontend & Planning (Weeks 3–4)

| Story | Priority | Agent | Effort |
|---|---|---|---|
| US-020: Project intake form | High | Frontend Dev | 6h |
| US-021: Dashboard project list | High | Frontend Dev | 4h |
| US-022: Project detail page | High | Frontend Dev | 8h |
| US-030: Epic generation | High | AI Engineer | 4h |
| US-031: User story generation | High | AI Engineer | 6h |
| US-032: Task priorities | Medium | Backend Dev | 2h |
| US-040: Sprint board | Medium | Frontend Dev | 8h |
| US-050: Architecture generation | High | AI Engineer | 6h |

**Sprint 2 Goal:** Complete frontend with all tabs and sprint board working.

---

### Sprint 3 — Polish & Delivery (Weeks 5–6)

| Story | Priority | Agent | Effort |
|---|---|---|---|
| US-041: Sprint task counts | Medium | Frontend Dev | 2h |
| US-060: GitHub Agent | Medium | AI Engineer | 6h |
| Docker configuration | Medium | DevOps | 4h |
| Documentation | Medium | PM | 8h |
| Error handling & edge cases | High | All | 8h |

**Sprint 3 Goal:** Production-ready platform with Docker deployment.

---

### Sprint 4 — Hardening (Weeks 7–8)

- Performance optimisation
- Security review
- Additional agent fine-tuning
- Integration testing
- Production deployment preparation

---

## 4. Definition of Ready

A story is **Ready** for a sprint when:
- [ ] Acceptance criteria are clearly defined
- [ ] Dependencies are identified and resolved
- [ ] Effort is estimated
- [ ] Design is available (for frontend stories)

## 5. Definition of Done

A story is **Done** when:
- [ ] Code is written and reviewed
- [ ] Acceptance criteria are met
- [ ] Tests are written and pass
- [ ] Documentation is updated
- [ ] Deployed to development environment
