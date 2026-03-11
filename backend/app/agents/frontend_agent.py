from __future__ import annotations

from typing import Any

from app.agents.base_agent import BaseAgent


class FrontendAgent(BaseAgent):
    role = "frontend_developer"
    display_name = "Frontend Developer"

    async def run(self) -> dict[str, Any]:
        from app.services.ai_service import ai_service

        prompt = f"""You are a senior Frontend Developer.
Given the project below, produce a frontend implementation plan in JSON.

{self._project_summary()}

Return JSON with keys: pages, components, state_management, styling_approach, testing_strategy."""

        return await ai_service.complete(prompt, self._mock_output())

    def _mock_output(self) -> dict[str, Any]:
        ctx = self.project_context
        title = ctx.get("title", "App")
        return {
            "pages": [
                {"name": "Landing / Login", "route": "/", "components": ["HeroSection", "LoginForm", "RegisterForm"]},
                {"name": "Dashboard", "route": "/dashboard", "components": ["StatsCards", "RecentActivity", "QuickActions"]},
                {"name": "Records List", "route": "/records", "components": ["DataTable", "SearchBar", "FilterPanel", "Pagination"]},
                {"name": "Record Detail", "route": "/records/:id", "components": ["RecordHeader", "DetailPanel", "ActivityLog"]},
                {"name": "Settings", "route": "/settings", "components": ["ProfileForm", "NotificationPreferences", "SecuritySettings"]},
                {"name": "Admin Panel", "route": "/admin", "components": ["UserTable", "RoleManager", "SystemConfig"]},
            ],
            "components": [
                {"name": "AppShell", "description": "Main layout with sidebar nav, header, and content area"},
                {"name": "DataTable", "description": "Sortable, filterable table with pagination and row actions"},
                {"name": "ConfirmDialog", "description": "Reusable confirmation modal for destructive actions"},
                {"name": "NotificationBell", "description": "Header notification icon with real-time badge count"},
                {"name": "FormBuilder", "description": "Dynamic form component driven by schema config"},
            ],
            "state_management": {
                "library": "Zustand",
                "server_state": "React Query (TanStack Query v5)",
                "stores": ["authStore", "uiStore", "notificationStore"],
            },
            "styling_approach": {
                "framework": "Tailwind CSS v3",
                "component_library": "Shadcn/ui",
                "design_tokens": "CSS custom properties for theme colours and spacing",
                "dark_mode": "System preference detection with manual override",
            },
            "testing_strategy": {
                "unit_tests": "Vitest + React Testing Library",
                "e2e_tests": "Playwright",
                "coverage_target": "80%",
            },
        }
