from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.agent import Agent
from app.schemas.agent import AgentResponse, AgentUpdate
from app.services.agent_service import agent_service

router = APIRouter(prefix="/agents", tags=["agents"])


def _parse_output(agent: Agent) -> Any:
    if agent.output is None:
        return None
    try:
        return json.loads(agent.output)
    except (json.JSONDecodeError, TypeError):
        return agent.output


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
) -> AgentResponse:
    agent = await agent_service.get_agent(db, agent_id)
    if agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return AgentResponse(
        id=agent.id,
        project_id=agent.project_id,
        name=agent.name,
        role=agent.role,
        status=agent.status,
        output=_parse_output(agent),
        created_at=agent.created_at,
    )


@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    data: AgentUpdate,
    db: AsyncSession = Depends(get_db),
) -> AgentResponse:
    agent = await agent_service.get_agent(db, agent_id)
    if agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    updated = await agent_service.update_agent(db, agent, data)
    return AgentResponse(
        id=updated.id,
        project_id=updated.project_id,
        name=updated.name,
        role=updated.role,
        status=updated.status,
        output=_parse_output(updated),
        created_at=updated.created_at,
    )
