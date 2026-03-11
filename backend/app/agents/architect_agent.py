from __future__ import annotations

import logging
from typing import Any

from app.agents.base_agent import BaseAgent

logger = logging.getLogger(__name__)


class ArchitectAgent(BaseAgent):
    """Solution Architect Agent — generates system architecture and tech stack."""

    role = "solution_architect"
    display_name = "Solution Architect"

    async def run(self) -> dict[str, Any]:
        from app.services.ai_service import ai_service

        prompt = f"""You are a principal Solution Architect designing an enterprise system.
Given the following project, produce a detailed architecture document in JSON.

{self._project_summary()}

Return a JSON object:
{{
  "architecture": {{
    "pattern": "...",
    "description": "...",
    "tech_stack": {{
      "frontend": {{"framework": "...", "language": "...", "key_libraries": ["..."]}},
      "backend": {{"framework": "...", "language": "...", "key_libraries": ["..."]}},
      "database": {{"primary": "...", "cache": "...", "search": "..."}},
      "infrastructure": {{"cloud": "...", "containerisation": "...", "orchestration": "...", "ci_cd": "..."}}
    }},
    "components": [{{"name": "...", "responsibility": "...", "technology": "..."}}],
    "data_flow": "...",
    "api_design": {{"style": "REST|GraphQL|gRPC", "authentication": "...", "versioning": "..."}},
    "security_considerations": ["..."],
    "scalability_strategy": "...",
    "deployment_diagram": "..."
  }}
}}"""

        return await ai_service.complete(prompt, self._mock_output())

    def _mock_output(self) -> dict[str, Any]:
        ctx = self.project_context
        ptype = ctx.get("type", "web_app")

        return {
            "architecture": {
                "pattern": "Layered Microservices with Event-Driven Communication",
                "description": (
                    f"The {ptype} follows a modern layered architecture with a "
                    "React SPA frontend communicating with a FastAPI backend over REST. "
                    "Background processing uses async task queues. "
                    "The system is containerised and deployed on cloud infrastructure."
                ),
                "tech_stack": {
                    "frontend": {
                        "framework": "React 18 with TypeScript",
                        "language": "TypeScript",
                        "key_libraries": [
                            "React Query (server state)",
                            "Zustand (client state)",
                            "React Router v6",
                            "Tailwind CSS",
                            "Shadcn/ui components",
                            "Zod (validation)",
                            "Axios (HTTP client)",
                        ],
                    },
                    "backend": {
                        "framework": "FastAPI (Python 3.12)",
                        "language": "Python",
                        "key_libraries": [
                            "SQLAlchemy 2.0 (ORM)",
                            "Alembic (migrations)",
                            "Pydantic v2 (validation)",
                            "Celery (task queue)",
                            "JWT (authentication)",
                            "Pytest (testing)",
                        ],
                    },
                    "database": {
                        "primary": "PostgreSQL 16",
                        "cache": "Redis 7",
                        "search": "PostgreSQL full-text search (Elasticsearch for v2)",
                    },
                    "infrastructure": {
                        "cloud": "AWS (primary) / GCP (alternative)",
                        "containerisation": "Docker + Docker Compose",
                        "orchestration": "Kubernetes (EKS) for production",
                        "ci_cd": "GitHub Actions → ECR → EKS",
                        "monitoring": "Prometheus + Grafana, Sentry for error tracking",
                        "cdn": "CloudFront",
                        "load_balancer": "AWS ALB",
                    },
                },
                "components": [
                    {
                        "name": "React SPA",
                        "responsibility": "User interface, routing, client-side state management",
                        "technology": "React 18, TypeScript, Vite",
                    },
                    {
                        "name": "API Gateway",
                        "responsibility": "Rate limiting, authentication, request routing, SSL termination",
                        "technology": "AWS API Gateway / Nginx",
                    },
                    {
                        "name": "FastAPI Application",
                        "responsibility": "Business logic, data access, REST API endpoints",
                        "technology": "FastAPI, SQLAlchemy, Python 3.12",
                    },
                    {
                        "name": "Auth Service",
                        "responsibility": "User authentication, JWT issuance, OAuth2 flows",
                        "technology": "FastAPI + python-jose",
                    },
                    {
                        "name": "Task Queue Worker",
                        "responsibility": "Background jobs, email sending, AI agent orchestration",
                        "technology": "Celery + Redis",
                    },
                    {
                        "name": "PostgreSQL Database",
                        "responsibility": "Primary persistent data store",
                        "technology": "PostgreSQL 16 with connection pooling (PgBouncer)",
                    },
                    {
                        "name": "Redis Cache",
                        "responsibility": "Session storage, rate limiting, Celery broker, response caching",
                        "technology": "Redis 7",
                    },
                    {
                        "name": "File Storage",
                        "responsibility": "User uploads and static assets",
                        "technology": "AWS S3 + CloudFront CDN",
                    },
                ],
                "data_flow": (
                    "1. User request → CloudFront CDN (static assets) or ALB\n"
                    "2. ALB → API Gateway (auth check, rate limit)\n"
                    "3. API Gateway → FastAPI application pods\n"
                    "4. FastAPI → PostgreSQL (read/write) or Redis (cache)\n"
                    "5. Long-running tasks → Celery worker via Redis broker\n"
                    "6. Workers → external APIs / AI services"
                ),
                "api_design": {
                    "style": "REST",
                    "authentication": "JWT Bearer tokens (access + refresh token pattern)",
                    "versioning": "URL path versioning (/api/v1/...)",
                    "documentation": "Auto-generated OpenAPI 3.0 via FastAPI /docs",
                    "rate_limiting": "100 req/min per user, 1000 req/min per API key",
                },
                "security_considerations": [
                    "All traffic over HTTPS/TLS 1.3",
                    "JWT tokens signed with RS256, short expiry (15 min) + refresh rotation",
                    "OWASP Top 10 mitigations built in",
                    "SQL injection prevention via parameterised queries (SQLAlchemy ORM)",
                    "CORS restricted to known origins",
                    "Secrets managed via AWS Secrets Manager / HashiCorp Vault",
                    "Dependency scanning in CI (Dependabot + pip-audit)",
                    "SAST via CodeQL, DAST via OWASP ZAP in staging",
                    "PII data encrypted at rest (AES-256)",
                ],
                "scalability_strategy": (
                    "Horizontal scaling of FastAPI pods via Kubernetes HPA. "
                    "Read replicas for PostgreSQL at 80% read load. "
                    "Redis Cluster for cache scaling. "
                    "Stateless API design enables zero-downtime rolling deployments."
                ),
                "deployment_diagram": (
                    "Internet → Route53 → CloudFront → ALB → "
                    "EKS (FastAPI Pods) → RDS PostgreSQL / ElastiCache Redis"
                ),
            }
        }
