from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.agent import Agent
from app.models.project import Project
from app.schemas.agent import AgentResponse
from app.schemas.project import ProjectCreate, ProjectDetail, ProjectResponse, ProjectUpdate
from app.schemas.task import TaskResponse
from app.services.agent_service import agent_service
from app.services.project_service import project_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/projects", tags=["projects"])


async def _get_project_or_404(project_id: str, db: AsyncSession) -> Project:
    project = await project_service.get_project(db, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def _parse_agent_output(agent: Agent) -> Any:
    if agent.output is None:
        return None
    try:
        return json.loads(agent.output)
    except (json.JSONDecodeError, TypeError):
        return agent.output


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
) -> ProjectResponse:
    project = await project_service.create_project(db, data)
    return ProjectResponse.model_validate(project)


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    db: AsyncSession = Depends(get_db),
) -> list[ProjectResponse]:
    projects = await project_service.get_projects(db)
    return [ProjectResponse.model_validate(p) for p in projects]


@router.get("/{project_id}", response_model=ProjectDetail)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> ProjectDetail:
    project = await _get_project_or_404(project_id, db)
    detail = ProjectDetail.model_validate(project)
    # Hydrate agent outputs from JSON strings
    detail.agents = [
        AgentResponse(
            id=a.id,
            project_id=a.project_id,
            name=a.name,
            role=a.role,
            status=a.status,
            output=_parse_agent_output(a),
            created_at=a.created_at,
        )
        for a in project.agents
    ]
    detail.tasks = [TaskResponse.model_validate(t) for t in project.tasks]
    return detail


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
) -> ProjectResponse:
    project = await _get_project_or_404(project_id, db)
    updated = await project_service.update_project(db, project, data)
    return ProjectResponse.model_validate(updated)


@router.post("/{project_id}/generate")
async def generate_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    project = await _get_project_or_404(project_id, db)
    result = await project_service.generate_project(db, project)
    return result


@router.get("/{project_id}/agents", response_model=list[AgentResponse])
async def get_project_agents(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> list[AgentResponse]:
    await _get_project_or_404(project_id, db)
    agents = await agent_service.get_agents_for_project(db, project_id)
    return [
        AgentResponse(
            id=a.id,
            project_id=a.project_id,
            name=a.name,
            role=a.role,
            status=a.status,
            output=_parse_agent_output(a),
            created_at=a.created_at,
        )
        for a in agents
    ]


@router.get("/{project_id}/tasks", response_model=list[TaskResponse])
async def get_project_tasks(
    project_id: str,
    db: AsyncSession = Depends(get_db),
) -> list[TaskResponse]:
    project = await _get_project_or_404(project_id, db)
    return [TaskResponse.model_validate(t) for t in project.tasks]


@router.post("/{project_id}/agents/{agent_id}/run", response_model=AgentResponse)
async def run_agent(
    project_id: str,
    agent_id: str,
    db: AsyncSession = Depends(get_db),
) -> AgentResponse:
    project = await _get_project_or_404(project_id, db)
    agent = await agent_service.get_agent(db, agent_id)
    if agent is None or agent.project_id != project_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")

    updated = await agent_service.run_agent(db, agent, project)
    return AgentResponse(
        id=updated.id,
        project_id=updated.project_id,
        name=updated.name,
        role=updated.role,
        status=updated.status,
        output=_parse_agent_output(updated),
        created_at=updated.created_at,
    )
