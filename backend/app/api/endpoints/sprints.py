"""Sprints API endpoints."""

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.models import Project, Sprint, Task
from app.models.schemas import (
    SprintCreate,
    SprintResponse,
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)

router = APIRouter()


@router.post(
    "/{project_id}/sprints",
    response_model=SprintResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a sprint for a project",
)
async def create_sprint(
    project_id: uuid.UUID,
    payload: SprintCreate,
    db: AsyncSession = Depends(get_db),
) -> SprintResponse:
    """Add a sprint to an existing project."""
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    sprint = Sprint(
        project_id=project_id,
        name=payload.name,
        goal=payload.goal,
        sprint_number=payload.sprint_number,
    )
    db.add(sprint)
    await db.flush()
    await db.refresh(sprint)
    return SprintResponse.model_validate(sprint)


@router.get(
    "/{project_id}/sprints",
    response_model=List[SprintResponse],
    summary="List sprints for a project",
)
async def list_sprints(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> List[SprintResponse]:
    """Return all sprints for a project, ordered by sprint number."""
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    result = await db.execute(
        select(Sprint)
        .where(Sprint.project_id == project_id)
        .order_by(Sprint.sprint_number)
    )
    sprints = result.scalars().all()
    return [SprintResponse.model_validate(s) for s in sprints]


@router.post(
    "/{project_id}/sprints/{sprint_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a task to a sprint",
)
async def create_task(
    project_id: uuid.UUID,
    sprint_id: uuid.UUID,
    payload: TaskCreate,
    db: AsyncSession = Depends(get_db),
) -> TaskResponse:
    """Add a task to a sprint."""
    sprint = await db.get(Sprint, sprint_id)
    if not sprint or sprint.project_id != project_id:
        raise HTTPException(status_code=404, detail="Sprint not found")
    task = Task(
        sprint_id=sprint_id,
        user_story_id=payload.user_story_id,
        title=payload.title,
        description=payload.description,
        assigned_agent=payload.assigned_agent,
    )
    db.add(task)
    await db.flush()
    await db.refresh(task)
    return TaskResponse.model_validate(task)


@router.get(
    "/{project_id}/sprints/{sprint_id}/tasks",
    response_model=List[TaskResponse],
    summary="List tasks in a sprint",
)
async def list_tasks(
    project_id: uuid.UUID,
    sprint_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> List[TaskResponse]:
    """Return all tasks in a sprint."""
    sprint = await db.get(Sprint, sprint_id)
    if not sprint or sprint.project_id != project_id:
        raise HTTPException(status_code=404, detail="Sprint not found")
    result = await db.execute(
        select(Task).where(Task.sprint_id == sprint_id).order_by(Task.created_at)
    )
    tasks = result.scalars().all()
    return [TaskResponse.model_validate(t) for t in tasks]


@router.patch(
    "/{project_id}/sprints/{sprint_id}/tasks/{task_id}",
    response_model=TaskResponse,
    summary="Update a task",
)
async def update_task(
    project_id: uuid.UUID,
    sprint_id: uuid.UUID,
    task_id: uuid.UUID,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
) -> TaskResponse:
    """Update task status, title, or assignment."""
    sprint = await db.get(Sprint, sprint_id)
    if not sprint or sprint.project_id != project_id:
        raise HTTPException(status_code=404, detail="Sprint not found")
    task = await db.get(Task, task_id)
    if not task or task.sprint_id != sprint_id:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    await db.flush()
    await db.refresh(task)
    return TaskResponse.model_validate(task)
