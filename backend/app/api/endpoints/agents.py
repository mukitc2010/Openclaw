"""Agents orchestration API endpoints — including WebSocket streaming."""

import json
import uuid
from typing import AsyncIterator

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, get_db
from app.models.models import AgentRun, AgentRunStatus, Artifact, Project, ProjectStatus
from app.models.schemas import AgentRunResponse, OrchestrationRequest
from app.services.orchestrator import AgentOrchestrator

router = APIRouter()


@router.post(
    "/run",
    response_model=AgentRunResponse,
    summary="Trigger agent orchestration for a project (non-streaming)",
)
async def run_agents(
    payload: OrchestrationRequest,
    db: AsyncSession = Depends(get_db),
) -> AgentRunResponse:
    """Start agent orchestration for a project. Returns the initial AgentRun record."""
    project = await db.get(Project, payload.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    run = AgentRun(
        project_id=payload.project_id,
        agent_name="orchestrator",
        phase=payload.phase or "full",
        status=AgentRunStatus.PENDING,
    )
    db.add(run)
    await db.flush()
    await db.refresh(run)
    return AgentRunResponse.model_validate(run)


@router.websocket("/stream/{project_id}")
async def stream_agents(
    websocket: WebSocket,
    project_id: uuid.UUID,
) -> None:
    """WebSocket endpoint — streams agent outputs in real time.

    Each message is a JSON object:
    {
        "agent": "<agent_name>",
        "phase": "<phase_name>",
        "event_type": "start" | "chunk" | "complete" | "error",
        "content": "<text>",
        "project_id": "<uuid>"
    }
    """
    await websocket.accept()

    # Create a dedicated session for the WebSocket lifetime
    async with AsyncSessionLocal() as db:
        project = await db.get(Project, project_id)
        if not project:
            await websocket.send_text(
                json.dumps({"event_type": "error", "content": "Project not found"})
            )
            await websocket.close()
            return

        orchestrator = AgentOrchestrator(db=db, project=project)

        try:
            async for event in orchestrator.run_stream():
                await websocket.send_text(json.dumps(event))
            await db.commit()
        except WebSocketDisconnect:
            pass
        except Exception as exc:
            await websocket.send_text(
                json.dumps({"event_type": "error", "content": str(exc)})
            )
        finally:
            await websocket.close()
