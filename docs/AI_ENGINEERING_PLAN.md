# AI_ENGINEERING_PLAN

## Agent Workflow Design
- PM Agent analyzes intake and outputs project outline
- Agile Planner transforms outline into epics, stories, and tasks
- Orchestrator assigns tasks to specialist agents
- Architecture and AI modules produce technical plans
- GitHub module prepares delivery strategy and documentation

## Prompt Workflow Design
- Deterministic templates with strict output schema
- Validation and retry for malformed outputs
- Role-specific prompt framing by agent capability

## Model/Provider Selection
- Primary LLM provider with fallback routing
- Future support for OpenAI, Anthropic, Ollama hybrid routing

## Memory Strategy
- Session memory for active project context
- Artifact memory persisted as project deliverables
- Future vector retrieval via pgvector or Qdrant

## Vector Store Planning
- V1: pgvector for operational simplicity
- V2: evaluate Qdrant for scale and retrieval latency
