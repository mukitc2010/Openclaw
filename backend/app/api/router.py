from __future__ import annotations

from fastapi import APIRouter

from app.api.routes import agents, projects, tasks

router = APIRouter(prefix="/api")

router.include_router(projects.router)
router.include_router(agents.router)
router.include_router(tasks.router)
