# AGENTS.md — OpenClaw AI Agent Specifications

**Version:** 1.0.0  

---

## Overview

OpenClaw orchestrates **13 specialized AI agents** that collaborate like a real software engineering team. Each agent has a defined role, input context, and structured output format.

---

## Agent Index

| # | Agent ID | Display Name | Phase |
|---|---|---|---|
| 1 | `project_manager` | Project Manager | 1 |
| 2 | `business_analyst` | Business Analyst | 2 |
| 3 | `solution_architect` | Solution Architect | 2 |
| 4 | `ai_engineer` | AI Engineer | 2 |
| 5 | `ui_ux_designer` | UI/UX Designer | 3 |
| 6 | `frontend_developer` | Frontend Developer | 3 |
| 7 | `backend_developer` | Backend Developer | 3 |
| 8 | `database_engineer` | Database Engineer | 3 |
| 9 | `devops_engineer` | DevOps Engineer | 3 |
| 10 | `qa_engineer` | QA Engineer | 3 |
| 11 | `security_engineer` | Security Engineer | 3 |
| 12 | `code_reviewer` | Code Reviewer | 3 |
| 13 | `github_agent` | GitHub Agent | 3 |

---

## Agent Specifications

---

### 1. Project Manager Agent

**ID:** `project_manager`  
**Phase:** 1 (runs first — required before other agents)  
**Class:** `PMAgent`  

**Responsibilities:**
- Analyse the project idea
- Create a comprehensive project outline
- Define project scope and boundaries
- Identify key milestones
- Define risks and mitigations
- Write the definition of done

**Input:**
```
project.title, project.description, project.type,
project.goals, project.target_users, project.constraints
```

**Output:**
```json
{
  "project_outline": {
    "title": "string",
    "description": "string",
    "scope": "string",
    "out_of_scope": ["string"],
    "milestones": [
      { "name": "string", "description": "string", "target": "string" }
    ],
    "risks": [
      { "risk": "string", "probability": "high|medium|low", "mitigation": "string" }
    ],
    "definition_of_done": "string",
    "agile_approach": "string",
    "team_structure": ["string"]
  }
}
```

**Success Criteria:**
- All fields populated with project-specific content
- At least 4 milestones defined
- At least 3 risks identified with mitigations

---

### 2. Business Analyst Agent

**ID:** `business_analyst`  
**Phase:** 2  
**Class:** `BAAgent`  

**Responsibilities:**
- Define epics based on project scope
- Create user stories with acceptance criteria
- Assign priorities and sprint assignments
- Estimate story points

**Input:**
```
project context + PM Agent output (project_outline)
```

**Output:**
```json
{
  "epics": [
    { "id": "EPIC-001", "title": "string", "description": "string", "priority": "high" }
  ],
  "user_stories": [
    {
      "id": "US-001",
      "epic": "EPIC-001",
      "title": "As a [user], I want [action] so that [benefit]",
      "description": "string",
      "acceptance_criteria": ["string"],
      "priority": "critical|high|medium|low",
      "sprint": "Sprint 1|Sprint 2|Sprint 3|Backlog",
      "story_points": 1,
      "agent_assigned": "frontend_developer"
    }
  ]
}
```

---

### 3. Solution Architect Agent

**ID:** `solution_architect`  
**Phase:** 2  
**Class:** `ArchitectAgent`  

**Responsibilities:**
- Design system architecture
- Define frontend and backend structure
- Design database schema
- Plan API contracts
- Define deployment architecture
- Select technology stack

**Output:**
```json
{
  "architecture": {
    "overview": "string",
    "components": [
      { "name": "string", "description": "string", "technology": "string" }
    ],
    "tech_stack": {
      "frontend": ["string"],
      "backend": ["string"],
      "database": ["string"],
      "infrastructure": ["string"]
    },
    "api_design": {
      "style": "REST|GraphQL|gRPC",
      "endpoints": [
        { "method": "GET", "path": "/api/resource", "description": "string" }
      ]
    },
    "database_schema": {
      "tables": [
        {
          "name": "string",
          "columns": [{ "name": "string", "type": "string", "constraints": "string" }]
        }
      ]
    },
    "deployment": {
      "strategy": "string",
      "environments": ["string"],
      "services": ["string"]
    },
    "folder_structure": "string"
  }
}
```

---

### 4. AI Engineer Agent

**ID:** `ai_engineer`  
**Phase:** 2  
**Class:** `AIEngineerAgent`  

**Responsibilities:**
- Design AI/ML pipeline (if applicable)
- Select AI models and providers
- Plan prompt engineering strategy
- Design vector store if RAG needed
- Define agent workflow design
- Plan memory strategy

**Output:**
```json
{
  "ai_engineering": {
    "ai_components": ["string"],
    "model_selection": {
      "primary": "string",
      "fallback": "string",
      "rationale": "string"
    },
    "prompt_strategy": "string",
    "rag_pipeline": {
      "needed": true,
      "vector_store": "string",
      "embedding_model": "string"
    },
    "agent_workflow": "string",
    "memory_strategy": "string",
    "integration_points": ["string"]
  }
}
```

---

### 5. UI/UX Designer Agent

**ID:** `ui_ux_designer`  
**Phase:** 3  
**Class:** `UIUXAgent`  

**Responsibilities:**
- Define design system and tokens
- Recommend component library
- Plan key user flows
- Define accessibility requirements
- Outline wireframe structure

**Output:**
```json
{
  "ui_ux_design": {
    "design_system": {
      "color_palette": {},
      "typography": {},
      "spacing": "string",
      "component_library": "string"
    },
    "key_screens": [
      { "name": "string", "description": "string", "components": ["string"] }
    ],
    "user_flows": ["string"],
    "accessibility": ["string"],
    "responsive_strategy": "string"
  }
}
```

---

### 6. Frontend Developer Agent

**ID:** `frontend_developer`  
**Phase:** 3  
**Class:** `FrontendAgent`  

**Responsibilities:**
- Define frontend architecture
- Plan component structure
- Define state management strategy
- Outline routing structure
- Plan performance optimisation

**Output:**
```json
{
  "frontend": {
    "framework": "string",
    "architecture_pattern": "string",
    "folder_structure": "string",
    "key_components": ["string"],
    "state_management": "string",
    "routing": ["string"],
    "performance": ["string"],
    "testing_approach": "string"
  }
}
```

---

### 7. Backend Developer Agent

**ID:** `backend_developer`  
**Phase:** 3  
**Class:** `BackendAgent`  

**Responsibilities:**
- Define backend architecture
- Design service layer
- Plan API implementation
- Define middleware and authentication
- Plan caching strategy

**Output:**
```json
{
  "backend": {
    "framework": "string",
    "architecture_pattern": "string",
    "service_layer": ["string"],
    "authentication": "string",
    "middleware": ["string"],
    "caching_strategy": "string",
    "error_handling": "string",
    "logging": "string"
  }
}
```

---

### 8. Database Engineer Agent

**ID:** `database_engineer`  
**Phase:** 3  
**Class:** `DBAgent`  

**Responsibilities:**
- Finalise database schema
- Define indexing strategy
- Plan migrations approach
- Define data retention policies
- Plan backup strategy

**Output:**
```json
{
  "database": {
    "database_type": "string",
    "orm": "string",
    "tables": ["string"],
    "indexes": ["string"],
    "migration_strategy": "string",
    "backup_strategy": "string",
    "data_retention": "string"
  }
}
```

---

### 9. DevOps Engineer Agent

**ID:** `devops_engineer`  
**Phase:** 3  
**Class:** `DevOpsAgent`  

**Responsibilities:**
- Define Docker configuration
- Plan CI/CD pipeline
- Define environment strategy
- Plan infrastructure as code
- Define monitoring and alerting

**Output:**
```json
{
  "devops": {
    "containerisation": "string",
    "ci_cd": {
      "platform": "string",
      "pipeline_stages": ["string"]
    },
    "environments": ["string"],
    "infrastructure": "string",
    "monitoring": ["string"],
    "secrets_management": "string"
  }
}
```

---

### 10. QA Engineer Agent

**ID:** `qa_engineer`  
**Phase:** 3  
**Class:** `QAAgent`  

**Responsibilities:**
- Define test strategy
- Plan unit/integration/e2e testing
- Define quality gates
- Plan test automation approach
- Define performance testing plan

**Output:**
```json
{
  "qa": {
    "test_strategy": "string",
    "testing_types": ["unit", "integration", "e2e"],
    "frameworks": { "unit": "string", "e2e": "string" },
    "quality_gates": ["string"],
    "coverage_target": "string",
    "automation_approach": "string"
  }
}
```

---

### 11. Security Engineer Agent

**ID:** `security_engineer`  
**Phase:** 3  
**Class:** `SecurityAgent`  

**Responsibilities:**
- Define security requirements
- Threat modelling
- Plan authentication and authorisation
- Define data protection measures
- Plan security testing

**Output:**
```json
{
  "security": {
    "threat_model": ["string"],
    "authentication": "string",
    "authorisation": "string",
    "data_protection": ["string"],
    "api_security": ["string"],
    "compliance": ["string"],
    "security_testing": ["string"]
  }
}
```

---

### 12. Code Reviewer Agent

**ID:** `code_reviewer`  
**Phase:** 3  
**Class:** `CodeReviewAgent`  

**Responsibilities:**
- Define coding standards
- Create PR review checklist
- Define branch protection rules
- Establish code style guide
- Define linting and formatting rules

**Output:**
```json
{
  "code_review": {
    "standards": ["string"],
    "pr_checklist": ["string"],
    "branch_protection": ["string"],
    "linting_tools": ["string"],
    "review_process": "string",
    "definition_of_done": ["string"]
  }
}
```

---

### 13. GitHub Agent

**ID:** `github_agent`  
**Phase:** 3  
**Class:** `GitHubAgent`  

**Responsibilities:**
- Define repository structure
- Plan branch strategy (Gitflow)
- Define commit message conventions
- Create PR and issue templates
- Plan documentation structure
- Define GitHub Actions workflow plan

**Output:**
```json
{
  "github": {
    "repo_structure": ["string"],
    "branch_strategy": {
      "main": "string",
      "develop": "string",
      "feature": "string",
      "release": "string",
      "hotfix": "string"
    },
    "commit_conventions": "string",
    "pr_template": "string",
    "issue_template": "string",
    "github_actions": ["string"],
    "documentation": ["string"],
    "gitignore_entries": ["string"]
  }
}
```

---

## Agent Status Reference

| Status | Description | Next Actions |
|---|---|---|
| `pending` | Agent created, not yet started | Run agent or trigger generate |
| `running` | Agent is currently executing | Wait for completion |
| `completed` | Agent finished successfully | View output in detail tab |
| `failed` | Agent encountered an error | Inspect error, retry agent |
