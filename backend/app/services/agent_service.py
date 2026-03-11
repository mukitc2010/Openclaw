from __future__ import annotations

import json
import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.agent import Agent
from app.models.project import Project
from app.schemas.agent import AgentCreate, AgentUpdate

logger = logging.getLogger(__name__)

AGENT_DEFINITIONS = [
    {"role": "project_manager",   "name": "Project Manager"},
    {"role": "business_analyst",  "name": "Business Analyst"},
    {"role": "solution_architect","name": "Solution Architect"},
    {"role": "ai_engineer",       "name": "AI Engineer"},
    {"role": "ui_ux_designer",    "name": "UI/UX Designer"},
    {"role": "frontend_developer","name": "Frontend Developer"},
    {"role": "backend_developer", "name": "Backend Developer"},
    {"role": "database_engineer", "name": "Database Engineer"},
    {"role": "devops_engineer",   "name": "DevOps Engineer"},
    {"role": "qa_engineer",       "name": "QA Engineer"},
    {"role": "security_engineer", "name": "Security Engineer"},
    {"role": "code_reviewer",     "name": "Code Reviewer"},
    {"role": "github_agent",      "name": "GitHub Agent"},
]


def _get_agent_class(role: str):
    """Return the agent implementation class for the given role, or None."""
    mapping = {
        "project_manager":   "app.agents.pm_agent.PMAgent",
        "business_analyst":  "app.agents.ba_agent.BAAgent",
        "solution_architect":"app.agents.architect_agent.ArchitectAgent",
        "frontend_developer":"app.agents.frontend_agent.FrontendAgent",
        "backend_developer": "app.agents.backend_agent.BackendAgent",
        "devops_engineer":   "app.agents.devops_agent.DevOpsAgent",
        "github_agent":      "app.agents.github_agent.GitHubAgent",
    }
    dotpath = mapping.get(role)
    if dotpath is None:
        return None
    module_path, class_name = dotpath.rsplit(".", 1)
    import importlib
    module = importlib.import_module(module_path)
    return getattr(module, class_name)


class AgentService:
    async def create_agents_for_project(
        self, db: AsyncSession, project_id: str
    ) -> list[Agent]:
        agents = []
        for defn in AGENT_DEFINITIONS:
            agent = Agent(
                project_id=project_id,
                name=defn["name"],
                role=defn["role"],
                status="pending",
            )
            db.add(agent)
            agents.append(agent)
        await db.commit()
        for agent in agents:
            await db.refresh(agent)
        return agents

    async def get_agents_for_project(
        self, db: AsyncSession, project_id: str
    ) -> list[Agent]:
        result = await db.execute(
            select(Agent).where(Agent.project_id == project_id)
        )
        return list(result.scalars().all())

    async def get_agent(self, db: AsyncSession, agent_id: str) -> Agent | None:
        result = await db.execute(select(Agent).where(Agent.id == agent_id))
        return result.scalar_one_or_none()

    async def run_agent(
        self, db: AsyncSession, agent: Agent, project: Project
    ) -> Agent:
        agent.status = "running"
        await db.commit()

        project_context = {
            "title": project.title,
            "description": project.description,
            "type": project.type,
            "goals": project.goals,
            "target_users": project.target_users,
            "constraints": project.constraints,
        }

        AgentClass = _get_agent_class(agent.role)
        if AgentClass is None:
            # Generic mock for agents without a specific implementation
            output = {
                "status": "completed",
                "agent": agent.role,
                "message": f"{agent.name} analysis complete.",
                "deliverables": [f"Completed {agent.name} review for project '{project.title}'"],
            }
        else:
            try:
                instance = AgentClass(project_context)
                output = await instance.run()
            except Exception as exc:
                logger.error("Agent %s failed: %s", agent.role, exc, exc_info=True)
                agent.status = "failed"
                agent.output = json.dumps({"error": str(exc)})
                await db.commit()
                await db.refresh(agent)
                return agent

        agent.status = "completed"
        agent.output = json.dumps(output, default=str)
        await db.commit()
        await db.refresh(agent)
        return agent

    async def update_agent(
        self, db: AsyncSession, agent: Agent, data: AgentUpdate
    ) -> Agent:
        for field, value in data.model_dump(exclude_unset=True).items():
            if field == "output" and not isinstance(value, str):
                value = json.dumps(value, default=str)
            setattr(agent, field, value)
        await db.commit()
        await db.refresh(agent)
        return agent


agent_service = AgentService()
