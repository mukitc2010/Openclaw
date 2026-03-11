"""Pydantic request/response schemas."""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.models import AgentRunStatus, ProjectStatus, SprintStatus, TaskStatus


# ── Project ────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    idea: str = Field(..., min_length=10, description="Natural-language project idea")


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    status: Optional[ProjectStatus] = None
    business_goal: Optional[str] = None
    problem_statement: Optional[str] = None
    target_users: Optional[str] = None
    constraints: Optional[str] = None
    assumptions: Optional[str] = None
    risks: Optional[str] = None
    success_criteria: Optional[str] = None
    timeline_estimate: Optional[str] = None


class ProjectResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    idea: str
    status: ProjectStatus
    business_goal: Optional[str] = None
    problem_statement: Optional[str] = None
    target_users: Optional[str] = None
    constraints: Optional[str] = None
    assumptions: Optional[str] = None
    risks: Optional[str] = None
    success_criteria: Optional[str] = None
    timeline_estimate: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ── Epic ────────────────────────────────────────────────────────────────────

class EpicCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    priority: int = Field(2, ge=0, le=4)


class EpicResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    project_id: uuid.UUID
    title: str
    description: Optional[str] = None
    priority: int
    created_at: datetime


# ── Sprint ───────────────────────────────────────────────────────────────────

class SprintCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    goal: Optional[str] = None
    sprint_number: int = Field(..., ge=1)


class SprintResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    goal: Optional[str] = None
    sprint_number: int
    status: SprintStatus
    created_at: datetime


# ── UserStory ────────────────────────────────────────────────────────────────

class UserStoryCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    as_a: Optional[str] = None
    i_want: Optional[str] = None
    so_that: Optional[str] = None
    acceptance_criteria: Optional[str] = None
    priority: int = Field(2, ge=0, le=4)
    assigned_agent: Optional[str] = None


class UserStoryResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    epic_id: uuid.UUID
    title: str
    as_a: Optional[str] = None
    i_want: Optional[str] = None
    so_that: Optional[str] = None
    acceptance_criteria: Optional[str] = None
    priority: int
    assigned_agent: Optional[str] = None
    created_at: datetime


# ── Task ─────────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    user_story_id: Optional[uuid.UUID] = None
    assigned_agent: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    assigned_agent: Optional[str] = None


class TaskResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    sprint_id: uuid.UUID
    user_story_id: Optional[uuid.UUID] = None
    title: str
    description: Optional[str] = None
    status: TaskStatus
    assigned_agent: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ── Artifact ─────────────────────────────────────────────────────────────────

class ArtifactResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    project_id: uuid.UUID
    artifact_type: str
    title: str
    content: str
    produced_by_agent: Optional[str] = None
    created_at: datetime


# ── AgentRun ─────────────────────────────────────────────────────────────────

class AgentRunResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    project_id: uuid.UUID
    agent_name: str
    phase: str
    status: AgentRunStatus
    input_summary: Optional[str] = None
    output_summary: Optional[str] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


# ── Orchestration ─────────────────────────────────────────────────────────────

class OrchestrationRequest(BaseModel):
    project_id: uuid.UUID
    phase: Optional[str] = None  # If None, run all phases sequentially


class AgentStreamEvent(BaseModel):
    agent: str
    phase: str
    event_type: str  # "start" | "chunk" | "complete" | "error"
    content: str
    project_id: uuid.UUID
