from __future__ import annotations

from typing import Any

from app.agents.base_agent import BaseAgent


class DevOpsAgent(BaseAgent):
    role = "devops_engineer"
    display_name = "DevOps Engineer"

    async def run(self) -> dict[str, Any]:
        from app.services.ai_service import ai_service

        prompt = f"""You are a senior DevOps Engineer.
Given the project below, produce a DevOps and infrastructure plan in JSON.

{self._project_summary()}

Return JSON with keys: ci_cd_pipeline, infrastructure, monitoring, environments, deployment_strategy."""

        return await ai_service.complete(prompt, self._mock_output())

    def _mock_output(self) -> dict[str, Any]:
        return {
            "ci_cd_pipeline": {
                "tool": "GitHub Actions",
                "stages": [
                    {"name": "lint", "steps": ["ruff (Python)", "eslint (TypeScript)"]},
                    {"name": "test", "steps": ["pytest --cov", "vitest --coverage"]},
                    {"name": "build", "steps": ["docker build backend", "vite build frontend"]},
                    {"name": "security_scan", "steps": ["CodeQL", "pip-audit", "Trivy image scan"]},
                    {"name": "deploy_staging", "trigger": "push to main", "steps": ["Push to ECR", "Rolling deploy to staging EKS"]},
                    {"name": "deploy_production", "trigger": "release tag", "steps": ["Blue/green deploy to production EKS"]},
                ],
            },
            "infrastructure": {
                "as_code": "Terraform",
                "resources": [
                    "EKS Cluster (3 nodes, t3.medium)",
                    "RDS PostgreSQL 16 (db.t3.medium, Multi-AZ)",
                    "ElastiCache Redis (cache.t3.micro)",
                    "S3 Bucket + CloudFront Distribution",
                    "ALB with WAF",
                    "ECR Repositories",
                    "Secrets Manager",
                    "VPC with public/private subnets",
                ],
            },
            "monitoring": {
                "metrics": "Prometheus + Grafana",
                "logs": "AWS CloudWatch + Loki",
                "error_tracking": "Sentry",
                "uptime": "Betterstack / UptimeRobot",
                "alerts": "PagerDuty for P1/P2 incidents",
            },
            "environments": [
                {"name": "development", "url": "localhost", "auto_deploy": False},
                {"name": "staging", "url": "staging.app.example.com", "auto_deploy": True, "trigger": "merge to main"},
                {"name": "production", "url": "app.example.com", "auto_deploy": False, "trigger": "release tag"},
            ],
            "deployment_strategy": {
                "type": "Blue/Green for production, Rolling for staging",
                "rollback": "Automatic rollback on health-check failure within 5 minutes",
                "zero_downtime": True,
            },
        }
