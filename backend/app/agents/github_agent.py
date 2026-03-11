from __future__ import annotations

from typing import Any

from app.agents.base_agent import BaseAgent


class GitHubAgent(BaseAgent):
    role = "github_agent"
    display_name = "GitHub Agent"

    async def run(self) -> dict[str, Any]:
        from app.services.ai_service import ai_service

        prompt = f"""You are a GitHub repository setup specialist.
Given the project below, produce a GitHub repository configuration plan in JSON.

{self._project_summary()}

Return JSON with keys: repository_structure, branch_strategy, github_actions, issue_templates, labels."""

        return await ai_service.complete(prompt, self._mock_output())

    def _mock_output(self) -> dict[str, Any]:
        ctx = self.project_context
        title = ctx.get("title", "project").lower().replace(" ", "-")
        return {
            "repository_structure": {
                "monorepo": True,
                "directories": [
                    "frontend/     — React application",
                    "backend/      — FastAPI application",
                    "infrastructure/ — Terraform IaC",
                    ".github/      — Actions workflows and templates",
                    "docs/         — Architecture and API documentation",
                ],
            },
            "branch_strategy": {
                "model": "GitHub Flow",
                "default_branch": "main",
                "branches": [
                    {"name": "main", "description": "Production-ready code, protected"},
                    {"name": "feature/*", "description": "Feature branches, short-lived"},
                    {"name": "fix/*", "description": "Bug fix branches"},
                    {"name": "release/*", "description": "Release preparation branches"},
                ],
                "protection_rules": [
                    "Require PR with at least 1 approval",
                    "Require status checks (lint, test, build) to pass",
                    "No force pushes",
                    "No deletions",
                ],
            },
            "github_actions": [
                {"name": "ci.yml", "triggers": ["pull_request", "push to main"], "jobs": ["lint", "test", "build"]},
                {"name": "security.yml", "triggers": ["schedule: daily", "pull_request"], "jobs": ["codeql", "dependency-review"]},
                {"name": "deploy-staging.yml", "triggers": ["push to main"], "jobs": ["deploy-staging"]},
                {"name": "deploy-production.yml", "triggers": ["release published"], "jobs": ["deploy-production"]},
            ],
            "issue_templates": [
                {"name": "bug_report.yml", "label": "bug"},
                {"name": "feature_request.yml", "label": "enhancement"},
                {"name": "user_story.yml", "label": "user-story"},
            ],
            "labels": [
                {"name": "bug", "color": "d73a4a"},
                {"name": "enhancement", "color": "a2eeef"},
                {"name": "epic", "color": "3E4B9E"},
                {"name": "user-story", "color": "7057ff"},
                {"name": "technical-debt", "color": "e4e669"},
                {"name": "security", "color": "ee0701"},
                {"name": "priority: high", "color": "b60205"},
                {"name": "priority: medium", "color": "fbca04"},
                {"name": "priority: low", "color": "0e8a16"},
            ],
        }
