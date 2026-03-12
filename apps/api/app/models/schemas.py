from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ProjectCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    summary: str = Field(min_length=10)
    goals: List[str] = Field(default_factory=list)
    target_users: List[str] = Field(default_factory=list)
    constraints: List[str] = Field(default_factory=list)
    priority: Priority = Priority.medium
    project_type: Optional[str] = None


class Milestone(BaseModel):
    name: str
    description: str


class ProjectOutline(BaseModel):
    scope: List[str]
    milestones: List[Milestone]
    roadmap: List[str]
    definition_of_done: List[str]


class AcceptanceCriteria(BaseModel):
    criteria: str


class Story(BaseModel):
    id: str
    title: str
    description: str
    acceptance_criteria: List[AcceptanceCriteria]
    priority: Priority


class Epic(BaseModel):
    id: str
    title: str
    feature: str
    stories: List[Story]


class TaskStatus(str, Enum):
    backlog = "backlog"
    in_progress = "in_progress"
    blocked = "blocked"
    done = "done"


class Task(BaseModel):
    id: str
    story_id: str
    title: str
    owner_agent: str
    sprint: int
    status: TaskStatus = TaskStatus.backlog
    depends_on: List[str] = Field(default_factory=list)


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class AgentAssignment(BaseModel):
    agent_name: str
    responsibilities: List[str]
    active_task_ids: List[str]


class DeliverableBundle(BaseModel):
    project_plan: str
    agile_plan: str
    architecture: str
    ai_engineering_plan: str
    agents: str
    github_strategy: str


class ProjectRecord(BaseModel):
    id: str
    created_at: datetime
    intake: ProjectCreate
    outline: Optional[ProjectOutline] = None
    epics: List[Epic] = Field(default_factory=list)
    tasks: List[Task] = Field(default_factory=list)
    assignments: List[AgentAssignment] = Field(default_factory=list)
    deliverables: Optional[DeliverableBundle] = None


class ProjectStatus(BaseModel):
    project_id: str
    phase: str
    updated_at: datetime
    progress_percent: int


class ProjectListResponse(BaseModel):
    projects: List[ProjectRecord]


class StatusTimeline(BaseModel):
    items: List[ProjectStatus]


def now_utc() -> datetime:
    return datetime.now(tz=timezone.utc)
