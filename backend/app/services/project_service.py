from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.agent_service import agent_service

logger = logging.getLogger(__name__)


class ProjectService:
    async def create_project(
        self, db: AsyncSession, data: ProjectCreate
    ) -> Project:
        project = Project(**data.model_dump())
        db.add(project)
        await db.commit()
        await db.refresh(project)

        # Auto-create all agents for the new project
        await agent_service.create_agents_for_project(db, project.id)
        await db.refresh(project)
        return project

    async def get_projects(self, db: AsyncSession) -> list[Project]:
        result = await db.execute(
            select(Project).order_by(Project.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_project(self, db: AsyncSession, project_id: str) -> Project | None:
        result = await db.execute(
            select(Project)
            .where(Project.id == project_id)
            .options(selectinload(Project.agents), selectinload(Project.tasks))
        )
        return result.scalar_one_or_none()

    async def update_project(
        self, db: AsyncSession, project: Project, data: ProjectUpdate
    ) -> Project:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(project, field, value)
        project.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(project)
        return project

    async def delete_project(self, db: AsyncSession, project: Project) -> None:
        await db.delete(project)
        await db.commit()

    async def generate_project(
        self, db: AsyncSession, project: Project
    ) -> dict[str, Any]:
        """Run all agents sequentially and return aggregated results."""
        agents = await agent_service.get_agents_for_project(db, project.id)

        results: dict[str, Any] = {}
        for agent in agents:
            if agent.status in ("pending", "failed"):
                updated = await agent_service.run_agent(db, agent, project)
                results[updated.role] = {
                    "status": updated.status,
                    "agent_id": updated.id,
                }

        # Mark project as active after generation
        project.status = "active"
        project.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(project)

        return {"project_id": project.id, "agents_run": results}


project_service = ProjectService()
