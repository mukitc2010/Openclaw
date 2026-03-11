# AI_ENGINEERING_PLAN.md — OpenClaw AI Engineering Strategy

**Version:** 1.0.0  

---

## 1. Overview

OpenClaw's AI engineering strategy centres around a multi-agent orchestration architecture where each AI agent is a specialized, stateless function that accepts project context, generates a structured prompt, calls an AI provider (OpenAI or mock), and returns validated JSON output.

---

## 2. AI Provider Strategy

### Provider Hierarchy

```
1. OpenAI GPT-4o (primary — requires OPENAI_API_KEY)
2. Mock AI (fallback — realistic structured output)
```

### Model Selection

| Use Case | Model | Reason |
|---|---|---|
| Project outline generation | GPT-4o | High reasoning, structured output |
| Epic/story generation | GPT-4o | Context-aware planning |
| Architecture generation | GPT-4o | Technical depth required |
| Simple task generation | GPT-4o-mini | Cost-efficient for bulk |
| Mock/development | Mock engine | No cost, instant, deterministic |

### Configuration

```env
OPENAI_API_KEY=sk-...          # Set for live AI; omit for mock mode
OPENAI_MODEL=gpt-4o            # Model selection
OPENAI_MAX_TOKENS=4096         # Output token limit
OPENAI_TEMPERATURE=0.7         # Creativity vs determinism
```

---

## 3. Agent Architecture

### Base Agent Pattern

All agents extend `BaseAgent`:

```python
class BaseAgent(ABC):
    role: str
    name: str

    async def run(self, project: dict) -> AgentOutput:
        prompt = self._build_prompt(project)
        raw    = await self._call_ai(prompt)
        output = self._parse_output(raw)
        return AgentOutput(status="completed", output=output)

    @abstractmethod
    def _build_prompt(self, project: dict) -> str: ...

    @abstractmethod
    def _parse_output(self, raw: str) -> dict: ...

    async def _call_ai(self, prompt: str) -> str:
        if settings.use_mock_ai:
            return self._mock_response(prompt)
        return await openai_client.complete(prompt)
```

### Agent Registry

| ID | Class | Role |
|---|---|---|
| `project_manager` | PMAgent | Project outline, milestones |
| `business_analyst` | BAAgent | Epics, user stories |
| `solution_architect` | ArchitectAgent | System architecture |
| `ai_engineer` | AIEngineerAgent | AI/ML pipeline design |
| `ui_ux_designer` | UIUXAgent | Design system |
| `frontend_developer` | FrontendAgent | Frontend architecture |
| `backend_developer` | BackendAgent | Backend architecture |
| `database_engineer` | DBAgent | Schema design |
| `devops_engineer` | DevOpsAgent | Docker, CI/CD |
| `qa_engineer` | QAAgent | Test strategy |
| `security_engineer` | SecurityAgent | Security requirements |
| `code_reviewer` | CodeReviewAgent | Coding standards |
| `github_agent` | GitHubAgent | Repository strategy |

---

## 4. Prompt Engineering

### Prompt Design Principles

1. **Role assignment** — Each prompt starts with a clear role definition
2. **Context injection** — Project title, description, type, goals, and users are always included
3. **Output specification** — Exact JSON schema is specified in the prompt
4. **Constraint setting** — Enterprise/professional quality is explicitly requested
5. **Few-shot examples** — (Future) Include examples for complex outputs

### PM Agent Prompt Template

```
You are a senior Project Manager and Agile coach.
Analyse the following software project and create a comprehensive project outline.

Project: {title}
Type: {type}
Description: {description}
Goals: {goals}
Target Users: {target_users}
Constraints: {constraints}

Return a JSON object with this exact structure:
{
  "project_outline": {
    "title": "...",
    "description": "...",
    "scope": "...",
    "milestones": [{"name": "...", "description": "...", "target": "..."}],
    "risks": [{"risk": "...", "mitigation": "..."}],
    "definition_of_done": "..."
  }
}

Be specific, professional, and actionable. Focus on enterprise-grade delivery.
```

### BA Agent Prompt Template

```
You are a senior Business Analyst specialising in Agile software delivery.
Create a comprehensive Agile backlog for this project.

Project: {title}
Description: {description}
Project Outline: {outline}

Return a JSON object with:
{
  "epics": [...],
  "user_stories": [
    {
      "title": "As a [user], I want [action] so that [benefit]",
      "epic": "...",
      "acceptance_criteria": ["...", "..."],
      "priority": "critical|high|medium|low",
      "sprint": "Sprint 1|Sprint 2|Sprint 3|Backlog",
      "story_points": 1-13
    }
  ]
}
```

---

## 5. Mock AI Engine

The Mock AI engine provides realistic, structured output without requiring an OpenAI API key. This enables development, testing, and demonstration without cost.

### Mock Strategy

- Prompts are analysed for key terms (type of project)
- A template-based response is returned with project-specific customisation
- Templates are designed to produce realistic enterprise-quality content

### Mock Output Quality

The mock engine produces:
- Realistic project outlines with project-specific milestones
- 8-10 epics per project
- 20+ user stories with acceptance criteria
- Full system architecture with tech stack recommendations
- GitHub branch strategy with gitflow conventions

---

## 6. Agent Orchestration

### Execution Flow

```
POST /api/projects/{id}/generate
    │
    ├── Fetch project from DB
    ├── Get all pending agents
    │
    ├── Phase 1 (sequential - dependencies):
    │   └── Run PM Agent → store outline in project
    │
    ├── Phase 2 (parallel - independent):
    │   ├── BA Agent
    │   ├── Architect Agent
    │   └── AI Engineer Agent
    │
    └── Phase 3 (parallel - inform from Phase 2):
        ├── Frontend Agent
        ├── Backend Agent
        ├── Database Agent
        ├── DevOps Agent
        ├── QA Agent
        ├── Security Agent
        ├── UI/UX Agent
        ├── Code Review Agent
        └── GitHub Agent
```

### Agent Status Machine

```
pending → running → completed
                 → failed (retryable)
```

### Error Handling

- Each agent catches exceptions and sets `status = "failed"`
- Failed agents store the error message for debugging
- Individual agent retry via `POST /api/projects/{id}/agents/{id}/run`
- System continues if non-critical agents fail

---

## 7. Output Storage

Agent outputs are stored as JSON in the `agents.output` column.

### Why JSON Storage?

- Agent outputs are schema-per-agent (heterogeneous)
- Flexible for evolving agent capabilities
- Direct serialisation to/from Python dicts
- Queryable with JSONB operators in PostgreSQL

### Output Retrieval

```python
# Get PM Agent output
pm_agent = await db.get(Agent, pm_agent_id)
outline = pm_agent.output.get("project_outline", {})

# Get all agent outputs for a project
agents = await db.execute(
    select(Agent).where(Agent.project_id == project_id)
)
```

---

## 8. Future AI Enhancements

### RAG Pipeline (Phase 2)

- Store project documentation in vector database (Qdrant or pgvector)
- Allow agents to retrieve relevant context from past projects
- Improve output quality by learning from previous deliveries

### Agent Memory (Phase 2)

- Persistent agent memory across multiple runs
- Cross-agent context sharing (PM output feeds into BA)
- Project evolution tracking

### Multi-Model Routing (Phase 3)

- Route complex tasks to GPT-4o
- Route simple tasks to GPT-4o-mini for cost savings
- Support Anthropic Claude and Ollama (local models)

### LangGraph Integration (Phase 3)

- Replace custom orchestration with LangGraph
- Proper dependency graph between agents
- Conditional edges (skip architecture if already exists)
- Human-in-the-loop checkpoints

### Streaming Output (Phase 2)

- Stream agent output to frontend via Server-Sent Events
- Real-time token streaming during generation
- Progressive rendering of long outputs

---

## 9. Cost Optimisation

| Strategy | Description |
|---|---|
| Mock mode for development | Zero API cost during development |
| Output caching | Cache agent outputs; only regenerate on request |
| Model selection | Use mini models for simpler tasks |
| Token limits | Set per-agent max token budgets |
| Batch processing | Group agent calls where possible |

### Estimated Cost per Project (OpenAI GPT-4o)

| Agent | Estimated Tokens | Cost (approx) |
|---|---|---|
| PM Agent | ~2,000 | $0.01 |
| BA Agent | ~4,000 | $0.02 |
| Architect Agent | ~3,000 | $0.015 |
| All other agents | ~1,500 each | $0.075 |
| **Total** | **~20,000** | **~$0.12** |
