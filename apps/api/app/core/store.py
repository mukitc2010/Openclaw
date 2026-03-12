from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List

from app.models.schemas import ProjectRecord, ProjectStatus


@dataclass
class InMemoryStore:
    projects: Dict[str, ProjectRecord] = field(default_factory=dict)
    status_timeline: Dict[str, List[ProjectStatus]] = field(default_factory=dict)


store = InMemoryStore()
