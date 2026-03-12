"""Authentication dependency for OpenClaw API.

Accepts two credential types:
- Supabase-signed JWT  → frontend user sessions
- OPENCLAW_API_KEY     → service-to-service calls from the MCP server

When neither SUPABASE_JWT_SECRET nor OPENCLAW_API_KEY is configured the
check is bypassed so the local dev smoke-test works without any auth setup.
"""
from __future__ import annotations

import os
from typing import Any, Optional

import jwt
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
OPENCLAW_API_KEY: str = os.getenv("OPENCLAW_API_KEY", "")

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(_bearer),
) -> dict[str, Any]:
    # Dev mode: no secrets configured → allow all requests
    if not SUPABASE_JWT_SECRET and not OPENCLAW_API_KEY:
        return {"sub": "anonymous", "role": "anon"}

    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = credentials.credentials

    # -------------------------------------------------------------------
    # Service-to-service: MCP server sends OPENCLAW_API_KEY as Bearer
    # -------------------------------------------------------------------
    if OPENCLAW_API_KEY and token == OPENCLAW_API_KEY:
        return {"sub": "service", "role": "service"}

    # -------------------------------------------------------------------
    # User sessions: Supabase-signed JWT (HS256, aud="authenticated")
    # -------------------------------------------------------------------
    if SUPABASE_JWT_SECRET:
        try:
            payload: dict[str, Any] = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
            return payload
        except jwt.InvalidTokenError as exc:
            raise HTTPException(status_code=401, detail=f"Invalid token: {exc}") from exc

    raise HTTPException(status_code=401, detail="Not authenticated")
