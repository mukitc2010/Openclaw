from __future__ import annotations

from typing import Any

from app.agents.base_agent import BaseAgent


class BackendAgent(BaseAgent):
    role = "backend_developer"
    display_name = "Backend Developer"

    async def run(self) -> dict[str, Any]:
        from app.services.ai_service import ai_service

        prompt = f"""You are a senior Backend Developer.
Given the project below, produce a backend implementation plan in JSON.

{self._project_summary()}

Return JSON with keys: api_endpoints, data_models, services, background_tasks, testing_strategy."""

        return await ai_service.complete(prompt, self._mock_output())

    def _mock_output(self) -> dict[str, Any]:
        return {
            "api_endpoints": [
                {"method": "POST", "path": "/api/v1/auth/register", "description": "User registration"},
                {"method": "POST", "path": "/api/v1/auth/login", "description": "JWT login"},
                {"method": "POST", "path": "/api/v1/auth/refresh", "description": "Token refresh"},
                {"method": "GET",  "path": "/api/v1/users/me", "description": "Current user profile"},
                {"method": "GET",  "path": "/api/v1/records", "description": "List records with pagination/filter"},
                {"method": "POST", "path": "/api/v1/records", "description": "Create record"},
                {"method": "GET",  "path": "/api/v1/records/{id}", "description": "Get record detail"},
                {"method": "PUT",  "path": "/api/v1/records/{id}", "description": "Update record"},
                {"method": "DELETE", "path": "/api/v1/records/{id}", "description": "Delete record"},
                {"method": "GET",  "path": "/api/v1/notifications", "description": "List notifications"},
            ],
            "data_models": [
                {
                    "name": "User",
                    "fields": ["id", "email", "hashed_password", "full_name", "role", "is_active", "created_at"],
                },
                {
                    "name": "Record",
                    "fields": ["id", "owner_id", "title", "content", "status", "tags", "created_at", "updated_at"],
                },
                {
                    "name": "Notification",
                    "fields": ["id", "user_id", "type", "title", "body", "is_read", "created_at"],
                },
            ],
            "services": [
                {"name": "AuthService", "responsibilities": ["Password hashing", "JWT issuance", "Token refresh"]},
                {"name": "RecordService", "responsibilities": ["CRUD operations", "Search/filter", "Access control"]},
                {"name": "NotificationService", "responsibilities": ["In-app notifications", "Email dispatch via Celery"]},
                {"name": "UserService", "responsibilities": ["Profile management", "Role assignment", "Admin operations"]},
            ],
            "background_tasks": [
                {"name": "send_welcome_email", "trigger": "User registration"},
                {"name": "send_notification_email", "trigger": "Notification created with email=True"},
                {"name": "cleanup_expired_tokens", "trigger": "Cron — daily"},
            ],
            "testing_strategy": {
                "unit_tests": "pytest + pytest-asyncio",
                "integration_tests": "TestClient with in-memory SQLite",
                "coverage_target": "85%",
                "factories": "factory-boy for test data",
            },
        }
