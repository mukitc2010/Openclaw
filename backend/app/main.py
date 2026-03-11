"""OpenClaw Backend — FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.router import api_router

app = FastAPI(
    title="OpenClaw API",
    description=(
        "Enterprise-grade autonomous AI Software Engineering Organization API. "
        "Transforms a project idea into a professionally planned, architected, "
        "engineered, tested, and delivered software system."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    """Return service health status."""
    return {"status": "healthy", "service": "openclaw-api"}
