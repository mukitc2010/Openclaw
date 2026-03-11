# OpenClaw — Agent Definitions

This document defines each AI agent in the OpenClaw organization, their responsibilities, inputs, outputs, and execution order.

---

## Execution Order

```
1  Project Manager Agent
2  Business Analyst Agent
3  Solution Architect Agent
4  AI Engineering Agent
5  UI/UX Designer Agent
6  Backend Developer Agent
7  Frontend Developer Agent
8  Database Engineer Agent
9  DevOps Agent
10 QA / Test Engineer Agent
11 Security Agent
12 Code Review Agent
13 GitHub Agent
```

> **Critical Rule:** No coding begins until the Project Manager has produced an approved outline, defined the architecture, distributed tasks, and established an Agile plan.

---

## 1. Project Manager Agent

**Role:** Delivery lead and orchestrator of the entire engineering process.

**Responsibilities:**
- Produce a structured Project Intake Summary
- Define Business Goal, Problem Statement, Target Users, Core Features
- Identify Constraints, Assumptions, Risks, Success Criteria, Timeline
- Convert requirements into Epics, Features, User Stories, and Tasks
- Assign agents and define sprint plan
- Monitor progress and adapt plan

**Inputs:** Raw project idea (natural language string)

**Outputs:**
- `ProjectIntakeSummary` object
- `AgileDeliveryPlan` with Epics, Stories, Tasks
- `AgentRoster` with assignments
- `TaskDistributionMatrix`
- `SprintPlan[]`

**Tools:** None (reasoning only)

---

## 2. Business Analyst Agent

**Role:** Requirements specialist and user advocate.

**Responsibilities:**
- Refine and validate project requirements
- Define detailed user stories with acceptance criteria
- Identify edge cases and business rules
- Validate that the plan covers all user needs
- Produce functional specification

**Inputs:** `ProjectIntakeSummary` from PM Agent

**Outputs:**
- Refined `UserStory[]` with acceptance criteria
- Functional specification document
- Data flow diagrams (text description)

---

## 3. Solution Architect Agent

**Role:** Technical design authority.

**Responsibilities:**
- Define system architecture
- Select technology stack
- Design frontend, backend, database, API structure
- Define integration points and deployment strategy
- Produce architecture diagram (ASCII or Mermaid)

**Inputs:** Functional specification from BA Agent

**Outputs:**
- `SystemArchitecture` document
- Tech stack decision record
- API structure (endpoint list)
- Deployment strategy

---

## 4. AI Engineering Agent

**Role:** Senior AI engineer owning all ML/AI systems.

**Responsibilities:**
- Design AI agent workflow and orchestration strategy
- Select LLM models and frameworks
- Design prompt systems (per agent)
- Build RAG pipeline design
- Define memory strategy (short-term, long-term, episodic)
- Define vector DB schema and search strategy
- Define AI evaluation metrics and safety controls
- Design automation workflows

**Inputs:** System architecture from Solution Architect

**Outputs:**
- AI architecture document
- Prompt templates per agent
- Agent graph definition
- Evaluation strategy
- Safety control specification

---

## 5. UI/UX Designer Agent

**Role:** User experience and interface design authority.

**Responsibilities:**
- Define UX flows and wireframes (text/ASCII)
- Define component structure for the frontend
- Define design system (colors, typography, spacing)
- Produce UI specification

**Inputs:** User stories from BA, system architecture

**Outputs:**
- UX flow specification
- Component hierarchy
- Design system definition

---

## 6. Backend Developer Agent

**Role:** API and service layer implementation.

**Responsibilities:**
- Implement FastAPI application
- Implement agent orchestration integration
- Implement business logic services
- Write unit tests for all backend code
- Document all API endpoints

**Inputs:** Architecture doc, API structure, agent graph

**Outputs:**
- FastAPI application code
- Service layer modules
- Unit tests
- API documentation

---

## 7. Frontend Developer Agent

**Role:** UI implementation.

**Responsibilities:**
- Implement Next.js application
- Build React components per UX specification
- Integrate with backend API
- Implement real-time agent streaming (WebSocket)
- Write frontend unit tests

**Inputs:** UI specification, API structure

**Outputs:**
- Next.js application code
- React components
- Frontend tests

---

## 8. Database Engineer Agent

**Role:** Data layer design and implementation.

**Responsibilities:**
- Design normalized database schema
- Write SQLAlchemy models
- Write Alembic migration scripts
- Write seed data scripts
- Optimize queries and indexes

**Inputs:** Data flow diagrams, system architecture

**Outputs:**
- Database schema (DDL)
- SQLAlchemy models
- Migration scripts
- Seed scripts
- Index strategy

---

## 9. DevOps Agent

**Role:** Infrastructure and delivery pipeline.

**Responsibilities:**
- Write Dockerfile for backend and frontend
- Write docker-compose for local development
- Write Kubernetes manifests for production
- Set up GitHub Actions CI/CD pipeline
- Define environment variable strategy

**Inputs:** Tech stack, deployment strategy

**Outputs:**
- Dockerfiles
- docker-compose.yml
- Kubernetes manifests
- GitHub Actions workflows
- CI/CD pipeline documentation

---

## 10. QA / Test Engineer Agent

**Role:** Quality validation authority.

**Responsibilities:**
- Write integration tests
- Write end-to-end tests
- Validate all acceptance criteria
- Log defects with severity and reproduction steps
- Confirm test coverage thresholds

**Inputs:** User stories with acceptance criteria, implemented code

**Outputs:**
- Integration test suite
- E2E test suite
- Test report
- Defect log

---

## 11. Security Agent

**Role:** Security review and hardening.

**Responsibilities:**
- Review authentication and authorization design
- Check secrets handling
- Review input validation
- Identify vulnerabilities (OWASP Top 10)
- Produce security report with findings and mitigations

**Inputs:** All code produced by dev agents

**Outputs:**
- Security review report
- Vulnerability log with mitigations
- Security hardening recommendations

---

## 12. Code Review Agent

**Role:** Engineering standards enforcement.

**Responsibilities:**
- Review code readability and style
- Review maintainability and testability
- Check architecture alignment
- Produce approval/rejection decision per PR
- Log required changes

**Inputs:** All code produced by dev agents

**Outputs:**
- Code review report per module
- PR approval/rejection decisions
- Required change log

---

## 13. GitHub Agent

**Role:** Repository and delivery management.

**Responsibilities:**
- Create and maintain repository structure
- Manage branches (main, develop, feature/*, fix/*, docs/*, chore/*)
- Commit in conventional format (feat:, fix:, docs:, etc.)
- Push documentation first, then architecture, then code by sprint
- Prepare PR summaries and release notes

**Inputs:** All agent outputs

**Outputs:**
- Structured GitHub repository
- Branch strategy
- PR descriptions
- Release notes
- CHANGELOG
