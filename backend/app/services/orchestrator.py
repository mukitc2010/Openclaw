"""Agent orchestrator — coordinates all SDLC agents for a project."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import AgentRun, AgentRunStatus, Artifact, Project, ProjectStatus
from app.services.llm_service import LLMService

# ── Agent definitions in execution order ────────────────────────────────────

AGENTS = [
    {
        "name": "project_manager",
        "display": "Project Manager",
        "phase": "discovery",
        "description": "Produces project intake summary, Agile roadmap, and sprint plan.",
    },
    {
        "name": "business_analyst",
        "display": "Business Analyst",
        "phase": "planning",
        "description": "Refines requirements, user stories, and acceptance criteria.",
    },
    {
        "name": "solution_architect",
        "display": "Solution Architect",
        "phase": "architecture",
        "description": "Designs system architecture, tech stack, API structure.",
    },
    {
        "name": "ai_engineering",
        "display": "AI Engineering Agent",
        "phase": "ai_architecture",
        "description": "Designs AI workflow, agent orchestration, prompts, RAG.",
    },
    {
        "name": "ux_designer",
        "display": "UI/UX Designer",
        "phase": "design",
        "description": "Defines UX flows, wireframes, component structure.",
    },
    {
        "name": "backend_developer",
        "display": "Backend Developer",
        "phase": "implementation",
        "description": "Implements API services, business logic, unit tests.",
    },
    {
        "name": "frontend_developer",
        "display": "Frontend Developer",
        "phase": "implementation",
        "description": "Implements UI components and frontend integration.",
    },
    {
        "name": "database_engineer",
        "display": "Database Engineer",
        "phase": "implementation",
        "description": "Designs schema, migrations, seed data, query optimization.",
    },
    {
        "name": "devops",
        "display": "DevOps Agent",
        "phase": "delivery",
        "description": "Configures Docker, Kubernetes, CI/CD pipeline.",
    },
    {
        "name": "qa_engineer",
        "display": "QA / Test Engineer",
        "phase": "quality",
        "description": "Writes integration and E2E tests, validates acceptance criteria.",
    },
    {
        "name": "security",
        "display": "Security Agent",
        "phase": "quality",
        "description": "Reviews auth, secrets, vulnerabilities (OWASP Top 10).",
    },
    {
        "name": "code_reviewer",
        "display": "Code Review Agent",
        "phase": "quality",
        "description": "Reviews readability, maintainability, architecture alignment.",
    },
    {
        "name": "github_agent",
        "display": "GitHub Agent",
        "phase": "delivery",
        "description": "Structures repo, manages branches, commits, PRs.",
    },
]


def _build_system_prompt(agent: dict) -> str:
    return (
        f"You are the {agent['display']} at OpenClaw, an enterprise AI Software "
        f"Engineering Organization. {agent['description']} "
        "Produce professional, structured, engineering-grade output. "
        "Use markdown formatting with clear sections and bullet points. "
        "Be specific, actionable, and production-quality."
    )


def _build_user_prompt(agent: dict, project: Project, context: str) -> str:
    return (
        f"Project Name: {project.name}\n"
        f"Project Idea: {project.idea}\n\n"
        f"Previous context from earlier agents:\n{context}\n\n"
        f"As the {agent['display']}, produce your deliverables for this project."
    )


class AgentOrchestrator:
    """Coordinates all 13 SDLC agents sequentially, streaming their outputs."""

    # Number of recent agent outputs to include as context for subsequent agents
    MAX_CONTEXT_AGENTS = 3

    def __init__(self, db: AsyncSession, project: Project) -> None:
        self._db = db
        self._project = project
        self._llm = LLMService()
        self._context_buffer: list[str] = []

    async def run_stream(self) -> AsyncIterator[dict]:
        """Execute all agents in order, yielding stream events for each."""
        for agent_def in AGENTS:
            async for event in self._run_agent_stream(agent_def):
                yield event

        # Mark project as delivered
        self._project.status = ProjectStatus.DELIVERED
        await self._db.flush()

    async def _run_agent_stream(self, agent_def: dict) -> AsyncIterator[dict]:
        """Run a single agent, yielding start/chunk/complete/error events."""
        project_id_str = str(self._project.id)

        # Create agent run record
        run = AgentRun(
            project_id=self._project.id,
            agent_name=agent_def["name"],
            phase=agent_def["phase"],
            status=AgentRunStatus.RUNNING,
            started_at=datetime.now(timezone.utc),
        )
        self._db.add(run)
        await self._db.flush()

        yield {
            "agent": agent_def["display"],
            "phase": agent_def["phase"],
            "event_type": "start",
            "content": f"[{agent_def['display']}] starting...",
            "project_id": project_id_str,
        }

        system_prompt = _build_system_prompt(agent_def)
        user_prompt = _build_user_prompt(
            agent_def, self._project, "\n\n".join(self._context_buffer[-self.MAX_CONTEXT_AGENTS:])
        )

        output_chunks: list[str] = []
        error: str | None = None

        try:
            async for chunk in self._llm.stream_completion(system_prompt, user_prompt):
                output_chunks.append(chunk)
                yield {
                    "agent": agent_def["display"],
                    "phase": agent_def["phase"],
                    "event_type": "chunk",
                    "content": chunk,
                    "project_id": project_id_str,
                }
        except Exception as exc:
            error = str(exc)
            yield {
                "agent": agent_def["display"],
                "phase": agent_def["phase"],
                "event_type": "error",
                "content": error,
                "project_id": project_id_str,
            }

        full_output = "".join(output_chunks)

        if full_output:
            # Store artifact
            artifact = Artifact(
                project_id=self._project.id,
                artifact_type=agent_def["phase"],
                title=f"{agent_def['display']} — {agent_def['phase'].replace('_', ' ').title()}",
                content=full_output,
                produced_by_agent=agent_def["name"],
            )
            self._db.add(artifact)

            # Add to context buffer for subsequent agents
            self._context_buffer.append(
                f"=== {agent_def['display']} Output ===\n{full_output[:2000]}"
            )

        # Update run record
        run.status = AgentRunStatus.FAILED if error else AgentRunStatus.COMPLETED
        run.output_summary = full_output[:500] if full_output else None
        run.error_message = error
        run.completed_at = datetime.now(timezone.utc)
        await self._db.flush()

        yield {
            "agent": agent_def["display"],
            "phase": agent_def["phase"],
            "event_type": "complete",
            "content": f"[{agent_def['display']}] completed.",
            "project_id": project_id_str,
        }
