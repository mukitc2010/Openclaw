from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class AgentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., min_length=1, max_length=100)
    status: str = Field(default="pending", max_length=50)


class AgentCreate(AgentBase):
    project_id: str


class AgentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[str] = Field(None, max_length=50)
    output: Optional[Any] = None


class AgentResponse(AgentBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    output: Optional[Any] = None
    created_at: datetime
