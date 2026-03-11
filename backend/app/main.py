from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router
from app.config import settings
from app.database import create_tables

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting OpenClaw backend (env=%s)", settings.APP_ENV)
    logger.info("AI mode: %s", "mock" if settings.use_mock_ai else "OpenAI")
    await create_tables()
    yield
    logger.info("Shutting down OpenClaw backend")


app = FastAPI(
    title="OpenClaw API",
    description="Enterprise AI Software Delivery Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/api/health", tags=["health"])
async def health_check() -> dict:
    return {
        "status": "ok",
        "version": "1.0.0",
        "ai_mode": "mock" if settings.use_mock_ai else "openai",
    }
