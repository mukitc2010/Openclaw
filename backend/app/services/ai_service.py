from __future__ import annotations

import json
import logging
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """Thin wrapper around OpenAI chat completions with mock fallback."""

    def __init__(self) -> None:
        self._client: Any = None

    def _get_client(self) -> Any:
        if self._client is None and not settings.use_mock_ai:
            try:
                from openai import AsyncOpenAI  # type: ignore[import-untyped]
                self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            except Exception as exc:
                logger.warning("Failed to initialise OpenAI client: %s", exc)
        return self._client

    async def complete(
        self,
        prompt: str,
        mock_response: dict[str, Any],
    ) -> dict[str, Any]:
        """Send a prompt to OpenAI or return mock data if no API key is configured."""
        if settings.use_mock_ai:
            logger.info("AI mock mode — returning mock response")
            return mock_response

        client = self._get_client()
        if client is None:
            logger.warning("OpenAI client unavailable — falling back to mock")
            return mock_response

        try:
            response = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert enterprise software delivery AI assistant. "
                            "Always respond with valid JSON only — no markdown fences, no prose."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.4,
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content or "{}"
            return json.loads(raw)
        except Exception as exc:
            logger.error("OpenAI completion failed: %s — using mock fallback", exc)
            return mock_response


ai_service = AIService()
