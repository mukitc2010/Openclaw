from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from pydantic import BaseModel, ConfigDict, Field

if TYPE_CHECKING:
    from app.schemas.agent import AgentResponse
    from app.schemas.task import TaskResponse


class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(default="")
    type: str = Field(default="web_app", max_length=100)
    status: str = Field(default="draft", max_length=50)
    goals: str = Field(default="")
    target_users: str = Field(default="")
    constraints: str = Field(default="")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    type: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field(None, max_length=50)
    goals: Optional[str] = None
    target_users: Optional[str] = None
    constraints: Optional[str] = None


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime


class ProjectDetail(ProjectResponse):
    agents: list["AgentResponse"] = []
    tasks: list["TaskResponse"] = []


def _rebuild_project_detail() -> None:
    from app.schemas.agent import AgentResponse  # noqa: F401
    from app.schemas.task import TaskResponse  # noqa: F401
    ProjectDetail.model_rebuild()


_rebuild_project_detail()
