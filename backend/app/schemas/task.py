from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(default="")
    type: str = Field(default="task", max_length=50)
    status: str = Field(default="backlog", max_length=50)
    sprint: Optional[int] = None
    priority: str = Field(default="medium", max_length=50)
    agent_assigned: Optional[str] = Field(None, max_length=100)


class TaskCreate(TaskBase):
    project_id: str


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    type: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=50)
    sprint: Optional[int] = None
    priority: Optional[str] = Field(None, max_length=50)
    agent_assigned: Optional[str] = Field(None, max_length=100)


class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    created_at: datetime
