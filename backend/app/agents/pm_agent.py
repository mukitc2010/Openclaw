from __future__ import annotations

import logging
from typing import Any

from app.agents.base_agent import BaseAgent

logger = logging.getLogger(__name__)


class PMAgent(BaseAgent):
    """Project Manager Agent — generates project outline, scope, milestones, roadmap."""

    role = "project_manager"
    display_name = "Project Manager"

    async def run(self) -> dict[str, Any]:
        from app.services.ai_service import ai_service

        prompt = f"""You are an expert Project Manager for a software delivery platform.
Given the following project details, produce a comprehensive project outline in JSON.

{self._project_summary()}

Return a JSON object with these exact keys:
{{
  "project_outline": {{
    "title": "...",
    "description": "...",
    "scope": "...",
    "out_of_scope": ["..."],
    "definition_of_done": "...",
    "risks": [{{"risk": "...", "mitigation": "...", "severity": "high|medium|low"}}],
    "milestones": [{{"name": "...", "description": "...", "duration_weeks": 2, "deliverables": ["..."]}}],
    "agile_roadmap": {{
      "total_sprints": 8,
      "sprint_duration_weeks": 2,
      "sprints": [{{"sprint": 1, "goal": "...", "focus_areas": ["..."]}}]
    }},
    "success_metrics": ["..."],
    "team_size_recommendation": 5
  }}
}}"""

        return await ai_service.complete(prompt, self._mock_output())

    def _mock_output(self) -> dict[str, Any]:
        ctx = self.project_context
        title = ctx.get("title", "Software Project")
        ptype = ctx.get("type", "web_app")

        return {
            "project_outline": {
                "title": title,
                "description": ctx.get(
                    "description",
                    f"A {ptype} solution delivering core business value.",
                ),
                "scope": (
                    f"Design, develop, test, and deploy a fully functional {ptype} "
                    f"that meets the stated goals. Includes authentication, core feature "
                    f"modules, API layer, database design, and CI/CD pipeline."
                ),
                "out_of_scope": [
                    "Third-party integrations beyond MVP",
                    "Mobile native apps (web-responsive only for v1)",
                    "Advanced analytics and BI dashboards",
                ],
                "definition_of_done": (
                    "All acceptance criteria met, unit test coverage ≥ 80%, "
                    "end-to-end tests passing, security scan clean, "
                    "deployed to staging with stakeholder sign-off."
                ),
                "risks": [
                    {
                        "risk": "Unclear or changing requirements",
                        "mitigation": "Regular sprint reviews and backlog refinement sessions",
                        "severity": "high",
                    },
                    {
                        "risk": "Third-party API rate limits or downtime",
                        "mitigation": "Implement retry logic and circuit breakers; evaluate alternatives",
                        "severity": "medium",
                    },
                    {
                        "risk": "Performance bottlenecks under load",
                        "mitigation": "Load testing from Sprint 4 onwards; horizontal scaling architecture",
                        "severity": "medium",
                    },
                    {
                        "risk": "Security vulnerabilities",
                        "mitigation": "SAST/DAST scans in CI, security agent review each sprint",
                        "severity": "high",
                    },
                ],
                "milestones": [
                    {
                        "name": "M1 — Foundation",
                        "description": "Project setup, architecture decided, core auth implemented",
                        "duration_weeks": 2,
                        "deliverables": [
                            "Repository structure",
                            "CI/CD pipeline",
                            "Authentication module",
                            "Database schema v1",
                        ],
                    },
                    {
                        "name": "M2 — Core Features",
                        "description": "All primary epics developed and unit-tested",
                        "duration_weeks": 6,
                        "deliverables": [
                            "Core feature modules",
                            "REST API",
                            "Frontend screens",
                            "80% unit test coverage",
                        ],
                    },
                    {
                        "name": "M3 — Integration & QA",
                        "description": "End-to-end integration, performance testing, bug fixes",
                        "duration_weeks": 3,
                        "deliverables": [
                            "Integration test suite",
                            "Performance report",
                            "Bug fix release",
                        ],
                    },
                    {
                        "name": "M4 — Launch",
                        "description": "Staging deployment, stakeholder UAT, production release",
                        "duration_weeks": 1,
                        "deliverables": [
                            "Production deployment",
                            "Runbook",
                            "User documentation",
                        ],
                    },
                ],
                "agile_roadmap": {
                    "total_sprints": 6,
                    "sprint_duration_weeks": 2,
                    "sprints": [
                        {
                            "sprint": 1,
                            "goal": "Project foundation and infrastructure",
                            "focus_areas": [
                                "Repository setup",
                                "CI/CD pipeline",
                                "Authentication & authorisation",
                                "Database design",
                            ],
                        },
                        {
                            "sprint": 2,
                            "goal": "Core data models and API skeleton",
                            "focus_areas": [
                                "Domain models",
                                "CRUD APIs",
                                "API documentation (OpenAPI)",
                            ],
                        },
                        {
                            "sprint": 3,
                            "goal": "Primary feature development",
                            "focus_areas": [
                                "Feature module 1",
                                "Feature module 2",
                                "Frontend routing",
                            ],
                        },
                        {
                            "sprint": 4,
                            "goal": "Secondary features and UX polish",
                            "focus_areas": [
                                "Feature module 3",
                                "Notifications",
                                "Responsive design",
                            ],
                        },
                        {
                            "sprint": 5,
                            "goal": "Integration, testing, and security hardening",
                            "focus_areas": [
                                "End-to-end tests",
                                "Performance optimisation",
                                "Security review",
                            ],
                        },
                        {
                            "sprint": 6,
                            "goal": "UAT, final fixes, and production deployment",
                            "focus_areas": [
                                "User acceptance testing",
                                "Bug fixes",
                                "Production release",
                                "Documentation",
                            ],
                        },
                    ],
                },
                "success_metrics": [
                    "Application loads in < 2 seconds (P95)",
                    "API response time < 200 ms (P95)",
                    "Uptime SLA ≥ 99.5%",
                    "Zero critical security vulnerabilities at launch",
                    f"Core user journey completed by {ctx.get('target_users', 'users')} within 3 minutes",
                ],
                "team_size_recommendation": 6,
            }
        }
