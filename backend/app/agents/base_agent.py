from __future__ import annotations

import json
import logging
from abc import ABC, abstractmethod
from typing import Any

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Abstract base for all OpenClaw AI agents."""

    role: str = "base"
    display_name: str = "Base Agent"

    def __init__(self, project_context: dict[str, Any]) -> None:
        self.project_context = project_context

    @abstractmethod
    async def run(self) -> dict[str, Any]:
        """Execute the agent and return structured output."""

    def _project_summary(self) -> str:
        ctx = self.project_context
        return (
            f"Project: {ctx.get('title', 'Untitled')}\n"
            f"Type: {ctx.get('type', 'web_app')}\n"
            f"Description: {ctx.get('description', '')}\n"
            f"Goals: {ctx.get('goals', '')}\n"
            f"Target Users: {ctx.get('target_users', '')}\n"
            f"Constraints: {ctx.get('constraints', '')}"
        )

    def _safe_json(self, data: Any) -> str:
        return json.dumps(data, indent=2, default=str)
