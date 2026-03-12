"""Thin wrapper around the OpenAI Chat Completions API.

Falls back gracefully when OPENAI_API_KEY is not configured so the service
still works in local dev without an API key.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")

_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        base_url = os.getenv("OPENAI_BASE_URL", "").strip() or None
        if not api_key:
            return None
        try:
            from openai import OpenAI  # type: ignore

            _client = OpenAI(api_key=api_key, base_url=base_url)
        except ImportError:
            logger.warning("openai package not installed; running in static fallback mode.")
    return _client


def complete_json(system: str, user: str) -> Optional[Dict[str, Any]]:
    """Call the LLM and return a parsed JSON dict.

    Returns None when the API key is absent, openai is not installed,
    or the call fails — so callers can fall back to static generators.
    """
    client = _get_client()
    if not client:
        return None
    try:
        resp = client.chat.completions.create(
            model=LLM_MODEL,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.4,
        )
        return json.loads(resp.choices[0].message.content)
    except Exception as exc:
        logger.warning("LLM JSON call failed, using static fallback: %s", exc)
        return None


def complete_text(system: str, user: str) -> Optional[str]:
    """Call the LLM and return plain text (Markdown).

    Returns None when the API key is absent or the call fails.
    """
    client = _get_client()
    if not client:
        return None
    try:
        resp = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.5,
        )
        return resp.choices[0].message.content.strip()
    except Exception as exc:
        logger.warning("LLM text call failed, using static fallback: %s", exc)
        return None
