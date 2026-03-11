"""API router — aggregates all endpoint routers."""

from fastapi import APIRouter

from app.api.endpoints import agents, artifacts, projects, sprints

api_router = APIRouter()

api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(sprints.router, prefix="/projects", tags=["sprints"])
api_router.include_router(artifacts.router, prefix="/projects", tags=["artifacts"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
