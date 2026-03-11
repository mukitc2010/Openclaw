"""Artifacts API endpoints."""

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.models import Artifact, Project
from app.models.schemas import ArtifactResponse

router = APIRouter()


@router.get(
    "/{project_id}/artifacts",
    response_model=List[ArtifactResponse],
    summary="List all artifacts for a project",
)
async def list_artifacts(
    project_id: uuid.UUID,
    artifact_type: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> List[ArtifactResponse]:
    """Return all generated artifacts for a project, optionally filtered by type."""
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = select(Artifact).where(Artifact.project_id == project_id)
    if artifact_type:
        query = query.where(Artifact.artifact_type == artifact_type)
    query = query.order_by(Artifact.created_at.desc())

    result = await db.execute(query)
    artifacts = result.scalars().all()
    return [ArtifactResponse.model_validate(a) for a in artifacts]


@router.get(
    "/{project_id}/artifacts/{artifact_id}",
    response_model=ArtifactResponse,
    summary="Get a specific artifact",
)
async def get_artifact(
    project_id: uuid.UUID,
    artifact_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ArtifactResponse:
    """Return a single artifact by its UUID."""
    artifact = await db.get(Artifact, artifact_id)
    if not artifact or artifact.project_id != project_id:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return ArtifactResponse.model_validate(artifact)
