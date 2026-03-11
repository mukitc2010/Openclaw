from __future__ import annotations

import logging
from typing import Any

from app.agents.base_agent import BaseAgent

logger = logging.getLogger(__name__)


class BAAgent(BaseAgent):
    """Business Analyst Agent — generates epics and user stories with acceptance criteria."""

    role = "business_analyst"
    display_name = "Business Analyst"

    async def run(self) -> dict[str, Any]:
        from app.services.ai_service import ai_service

        prompt = f"""You are a senior Business Analyst for an enterprise software team.
Given the following project, produce epics and user stories in JSON.

{self._project_summary()}

Return a JSON object:
{{
  "epics": [
    {{
      "id": "EP-01",
      "title": "...",
      "description": "...",
      "business_value": "...",
      "priority": "high|medium|low",
      "user_stories": [
        {{
          "id": "US-01",
          "title": "As a [role], I want [feature] so that [benefit]",
          "description": "...",
          "acceptance_criteria": ["Given ... When ... Then ..."],
          "story_points": 3,
          "priority": "high|medium|low",
          "sprint": 1
        }}
      ]
    }}
  ],
  "non_functional_requirements": [
    {{"category": "Performance", "requirement": "...", "metric": "..."}}
  ]
}}"""

        return await ai_service.complete(prompt, self._mock_output())

    def _mock_output(self) -> dict[str, Any]:
        ctx = self.project_context
        title = ctx.get("title", "Software Project")
        target = ctx.get("target_users", "end users")

        return {
            "epics": [
                {
                    "id": "EP-01",
                    "title": "User Authentication & Account Management",
                    "description": (
                        f"Enable {target} to securely register, log in, "
                        "manage their profile, and recover access to their accounts."
                    ),
                    "business_value": "Foundational security and personalisation for all users",
                    "priority": "high",
                    "user_stories": [
                        {
                            "id": "US-01",
                            "title": f"As a {target}, I want to register an account so that I can access {title}",
                            "description": "New users must be able to create an account with email and password.",
                            "acceptance_criteria": [
                                "Given I am on the registration page, When I submit valid credentials, Then my account is created and I receive a confirmation email",
                                "Given I enter an already-registered email, When I submit, Then I see an appropriate error message",
                                "Given I enter a weak password, When I submit, Then I see password strength requirements",
                            ],
                            "story_points": 3,
                            "priority": "high",
                            "sprint": 1,
                        },
                        {
                            "id": "US-02",
                            "title": f"As a {target}, I want to log in so that I can access my data",
                            "description": "Returning users can authenticate using email/password or OAuth.",
                            "acceptance_criteria": [
                                "Given valid credentials, When I log in, Then I am redirected to my dashboard",
                                "Given invalid credentials, When I log in, Then I see an error and account is not accessed",
                                "Given 5 failed attempts, When I try again, Then the account is temporarily locked",
                            ],
                            "story_points": 3,
                            "priority": "high",
                            "sprint": 1,
                        },
                        {
                            "id": "US-03",
                            "title": f"As a {target}, I want to reset my password so that I can recover my account",
                            "description": "Users can request a password reset link via email.",
                            "acceptance_criteria": [
                                "Given I click 'Forgot Password', When I enter my email, Then a reset link is sent",
                                "Given a valid reset link, When I set a new password, Then I can log in with it",
                                "Given an expired reset link, When I click it, Then I see a link expiry message",
                            ],
                            "story_points": 2,
                            "priority": "high",
                            "sprint": 1,
                        },
                    ],
                },
                {
                    "id": "EP-02",
                    "title": f"Core {title} Functionality",
                    "description": (
                        f"Deliver the primary features of {title} that fulfil "
                        f"the stated goals for {target}."
                    ),
                    "business_value": "Core product value proposition — primary reason users adopt the platform",
                    "priority": "high",
                    "user_stories": [
                        {
                            "id": "US-04",
                            "title": f"As a {target}, I want a dashboard so that I can see an overview of key information",
                            "description": "A personalised dashboard showing relevant metrics, recent activity, and quick actions.",
                            "acceptance_criteria": [
                                "Given I am logged in, When I visit the dashboard, Then I see my personalised data",
                                "Given new data is available, When I refresh, Then the dashboard updates in real-time",
                            ],
                            "story_points": 5,
                            "priority": "high",
                            "sprint": 2,
                        },
                        {
                            "id": "US-05",
                            "title": f"As a {target}, I want to create and manage records so that I can track my work",
                            "description": "Full CRUD operations on the primary domain entity.",
                            "acceptance_criteria": [
                                "Given I am on the records page, When I click 'New', Then I can create a record",
                                "Given an existing record, When I edit and save, Then changes are persisted",
                                "Given an existing record, When I delete it, Then it is removed after confirmation",
                            ],
                            "story_points": 8,
                            "priority": "high",
                            "sprint": 2,
                        },
                        {
                            "id": "US-06",
                            "title": f"As a {target}, I want to search and filter records so that I can find information quickly",
                            "description": "Full-text search with filter and sort capabilities.",
                            "acceptance_criteria": [
                                "Given I type in the search bar, When I pause, Then results update within 300ms",
                                "Given multiple filter options, When I apply them, Then results are correctly filtered",
                            ],
                            "story_points": 5,
                            "priority": "medium",
                            "sprint": 3,
                        },
                    ],
                },
                {
                    "id": "EP-03",
                    "title": "Notifications & Alerts",
                    "description": "Keep users informed of important events through in-app and email notifications.",
                    "business_value": "Increases user engagement and reduces missed critical events",
                    "priority": "medium",
                    "user_stories": [
                        {
                            "id": "US-07",
                            "title": f"As a {target}, I want email notifications so that I am informed of important events",
                            "description": "Configurable email notifications for key system events.",
                            "acceptance_criteria": [
                                "Given an event occurs, When notifications are enabled, Then I receive an email within 2 minutes",
                                "Given I disable notifications, When an event occurs, Then no email is sent",
                            ],
                            "story_points": 3,
                            "priority": "medium",
                            "sprint": 4,
                        },
                        {
                            "id": "US-08",
                            "title": f"As a {target}, I want in-app notifications so that I can see alerts without leaving the app",
                            "description": "Real-time in-app notification bell with unread count.",
                            "acceptance_criteria": [
                                "Given a new event, When it occurs, Then the notification bell shows an unread count",
                                "Given I click the bell, When notifications are listed, Then I can mark them as read",
                            ],
                            "story_points": 5,
                            "priority": "medium",
                            "sprint": 4,
                        },
                    ],
                },
                {
                    "id": "EP-04",
                    "title": "Administration & Settings",
                    "description": "Admin panel for managing users, roles, permissions, and system configuration.",
                    "business_value": "Enables self-service administration reducing operational overhead",
                    "priority": "medium",
                    "user_stories": [
                        {
                            "id": "US-09",
                            "title": "As an admin, I want to manage users so that I can control access",
                            "description": "Admin can view, invite, suspend, and remove users.",
                            "acceptance_criteria": [
                                "Given I am an admin, When I view users, Then I see all registered accounts",
                                "Given I suspend a user, When they try to log in, Then access is denied",
                            ],
                            "story_points": 5,
                            "priority": "medium",
                            "sprint": 3,
                        },
                        {
                            "id": "US-10",
                            "title": "As an admin, I want to configure roles and permissions so that access is correctly scoped",
                            "description": "Role-based access control (RBAC) with configurable permissions.",
                            "acceptance_criteria": [
                                "Given I create a role, When I assign permissions, Then users with that role have those permissions",
                                "Given a permission changes, When a user navigates, Then UI reflects their new access level",
                            ],
                            "story_points": 8,
                            "priority": "medium",
                            "sprint": 3,
                        },
                    ],
                },
            ],
            "non_functional_requirements": [
                {
                    "category": "Performance",
                    "requirement": "API response time under normal load",
                    "metric": "P95 < 200ms",
                },
                {
                    "category": "Performance",
                    "requirement": "Page load time",
                    "metric": "LCP < 2.5 seconds",
                },
                {
                    "category": "Scalability",
                    "requirement": "Concurrent users supported",
                    "metric": "≥ 1,000 concurrent users without degradation",
                },
                {
                    "category": "Security",
                    "requirement": "Authentication",
                    "metric": "OAuth2/JWT, bcrypt password hashing, HTTPS enforced",
                },
                {
                    "category": "Availability",
                    "requirement": "Uptime SLA",
                    "metric": "99.5% monthly uptime",
                },
                {
                    "category": "Accessibility",
                    "requirement": "WCAG compliance",
                    "metric": "WCAG 2.1 AA",
                },
            ],
        }
