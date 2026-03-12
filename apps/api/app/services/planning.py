from __future__ import annotations

import json
import logging
from typing import List
from uuid import uuid4

from app.models.schemas import (
    AcceptanceCriteria,
    AgentAssignment,
    DeliverableBundle,
    Epic,
    Milestone,
    Priority,
    ProjectCreate,
    ProjectOutline,
    ProjectStatus,
    Story,
    Task,
    TaskStatus,
    now_utc,
)
from app.services.llm import complete_json, complete_text

logger = logging.getLogger(__name__)

AGENT_ROLES = [
    "Project Manager Agent",
    "Business Analyst Agent",
    "Solution Architect Agent",
    "AI Engineering Agent",
    "UI/UX Designer Agent",
    "Frontend Developer Agent",
    "Backend Developer Agent",
    "Database Engineer Agent",
    "DevOps Agent",
    "QA/Test Agent",
    "Security Agent",
    "Code Review Agent",
    "GitHub Agent",
]

# ── Prompt constants ────────────────────────────────────────────────────────

_OUTLINE_SYSTEM = """\
You are a senior Project Manager at a top-tier technology company.
Return ONLY valid JSON — no commentary, no markdown — matching this exact shape:
{
  "scope": ["string describing a concrete deliverable"],
  "milestones": [{"name": "string", "description": "string"}],
  "roadmap": ["string describing an ordered delivery phase"],
  "definition_of_done": ["string (measurable completion criterion)"]
}
Constraints: 3-5 scope items, exactly 3 milestones, 4-6 roadmap phases, 4-6 DoD items.
Make every item specific to the project — no generic boilerplate."""


def _outline_user(intake: ProjectCreate) -> str:
    return (
        f"Project: {intake.title}\n"
        f"Summary: {intake.summary}\n"
        f"Goals: {json.dumps(intake.goals)}\n"
        f"Target users: {json.dumps(intake.target_users)}\n"
        f"Constraints: {json.dumps(intake.constraints)}\n"
        f"Priority: {intake.priority}\n"
        f"Project type: {intake.project_type or 'general software'}"
    )


_AGILE_SYSTEM = """\
You are a Principal Agile Coach with deep software delivery expertise.
Return ONLY valid JSON — no commentary, no markdown — matching this exact shape:
{
  "epics": [
    {
      "id": "EP-1",
      "title": "Epic title",
      "feature": "High-level feature area",
      "stories": [
        {
          "id": "ST-1",
          "title": "Short action title",
          "description": "As a [user], I can [action] so that [benefit]",
          "priority": "high",
          "acceptance_criteria": [{"criteria": "Given/When/Then or clear criterion"}]
        }
      ]
    }
  ]
}
Constraints:
- 3-5 epics covering the full delivery scope
- 2-4 stories per epic; story IDs globally sequential (ST-1, ST-2, ...)
- priority is one of: low, medium, high, critical
- 2-3 acceptance criteria per story
- All content must be specific to the project, not generic"""


def _agile_user(intake: ProjectCreate) -> str:
    return (
        f"Project: {intake.title}\n"
        f"Summary: {intake.summary}\n"
        f"Goals: {json.dumps(intake.goals)}\n"
        f"Target users: {json.dumps(intake.target_users)}\n"
        f"Constraints: {json.dumps(intake.constraints)}\n"
        f"Priority: {intake.priority}\n"
        f"Project type: {intake.project_type or 'general software'}"
    )


_DOC_RULES = (
    "Return ONLY well-formatted Markdown. No preamble or commentary outside the document. "
    "Use clear headings (##), bullet points, and code blocks where appropriate. "
    "All content must be specific to the project described."
)

_PROJECT_PLAN_SYSTEM = (
    f"You are a senior Project Manager. Generate a professional project plan document. {_DOC_RULES}"
)


def _project_plan_user(intake: ProjectCreate) -> str:
    goals = "\n".join(f"- {g}" for g in intake.goals) or "- TBD"
    targets = ", ".join(intake.target_users) or "TBD"
    constraints = "\n".join(f"- {c}" for c in intake.constraints) or "- None stated"
    return (
        f"Project: {intake.title}\nSummary: {intake.summary}\n"
        f"Priority: {intake.priority}\nTarget users: {targets}\n"
        f"Goals:\n{goals}\nConstraints:\n{constraints}\n\n"
        "Write # PROJECT_PLAN covering: executive summary, objectives, scope, "
        "success metrics, risks and mitigations, stakeholders."
    )


_AGILE_DOC_SYSTEM = (
    f"You are an expert Agile coach. Generate a professional Agile plan document from the provided data. {_DOC_RULES}"
)


def _agile_doc_user(intake: ProjectCreate, epics: List[Epic], tasks: List[Task]) -> str:
    epic_lines = "\n".join(f"- {e.id}: {e.title} ({len(e.stories)} stories)" for e in epics) or "No epics yet"
    task_lines = "\n".join(f"- {t.id} [{t.owner_agent}]: {t.title}" for t in tasks) or "No tasks yet"
    return (
        f"Project: {intake.title}\nSummary: {intake.summary}\n\n"
        f"Epics:\n{epic_lines}\n\nSprint 1 Tasks:\n{task_lines}\n\n"
        "Write # AGILE_PLAN covering: sprint goal, epic breakdown, task assignments, "
        "velocity assumptions, definition of ready."
    )


_ARCH_SYSTEM = (
    f"You are a Principal Solutions Architect. Generate a concise architecture design document. {_DOC_RULES}"
)


def _arch_user(intake: ProjectCreate) -> str:
    return (
        f"Project: {intake.title}\nSummary: {intake.summary}\n"
        f"Goals: {json.dumps(intake.goals)}\nConstraints: {json.dumps(intake.constraints)}\n"
        f"Project type: {intake.project_type or 'general software'}\n\n"
        "Write # ARCHITECTURE covering: system overview, recommended tech stack with justification, "
        "data model and service boundaries, API design, scalability, security, deployment target."
    )


_AI_ENG_SYSTEM = (
    f"You are a Principal AI/ML Engineer. Generate a concise AI engineering plan. {_DOC_RULES}"
)


def _ai_eng_user(intake: ProjectCreate) -> str:
    return (
        f"Project: {intake.title}\nSummary: {intake.summary}\n"
        f"Goals: {json.dumps(intake.goals)}\nConstraints: {json.dumps(intake.constraints)}\n\n"
        "Write # AI_ENGINEERING_PLAN covering: agent roles and orchestration, model selection "
        "and routing, prompt engineering approach, memory and context management, "
        "evaluation and guardrails, cost and latency considerations."
    )


_AGENTS_SYSTEM = (
    f"You are an expert in multi-agent AI systems. Generate a concise agent manifest. {_DOC_RULES}"
)


def _agents_user(intake: ProjectCreate) -> str:
    agent_list = "\n".join(f"- {role}" for role in AGENT_ROLES)
    return (
        f"Project: {intake.title}\nSummary: {intake.summary}\n"
        f"Goals: {json.dumps(intake.goals)}\n\nAvailable agents:\n{agent_list}\n\n"
        "Write # AGENTS describing each agent's specific responsibilities, "
        "key deliverables, and interactions for this project."
    )


_GITHUB_SYSTEM = (
    f"You are a Principal DevOps and GitHub platform engineer. Generate a concise GitHub delivery strategy. {_DOC_RULES}"
)


def _github_user(intake: ProjectCreate) -> str:
    return (
        f"Project: {intake.title}\nSummary: {intake.summary}\n"
        f"Priority: {intake.priority}\nProject type: {intake.project_type or 'general software'}\n\n"
        "Write # GITHUB_STRATEGY covering: branch model and naming conventions, "
        "commit message standards, PR template and review process, "
        "GitHub Actions CI/CD pipeline, release and versioning strategy, "
        "security scanning and code quality gates."
    )


# ── LLM output parsers ───────────────────────────────────────────────────────

def _parse_outline(data: dict) -> ProjectOutline:
    milestones = [
        Milestone(name=m.get("name", ""), description=m.get("description", ""))
        for m in data.get("milestones", [])
    ]
    return ProjectOutline(
        scope=data.get("scope", []),
        milestones=milestones,
        roadmap=data.get("roadmap", []),
        definition_of_done=data.get("definition_of_done", []),
    )


def _parse_agile(data: dict) -> List[Epic]:
    epics: List[Epic] = []
    for e in data.get("epics", []):
        stories: List[Story] = []
        for s in e.get("stories", []):
            try:
                priority = Priority(s.get("priority", "medium"))
            except ValueError:
                priority = Priority.medium
            ac = [
                AcceptanceCriteria(criteria=c.get("criteria", ""))
                for c in s.get("acceptance_criteria", [])
            ]
            stories.append(
                Story(
                    id=s.get("id", f"ST-{len(stories) + 1}"),
                    title=s.get("title", ""),
                    description=s.get("description", ""),
                    priority=priority,
                    acceptance_criteria=ac,
                )
            )
        epics.append(
            Epic(
                id=e.get("id", f"EP-{len(epics) + 1}"),
                title=e.get("title", ""),
                feature=e.get("feature", ""),
                stories=stories,
            )
        )
    return epics


def generate_outline(intake: ProjectCreate) -> ProjectOutline:
    data = complete_json(_OUTLINE_SYSTEM, _outline_user(intake))
    if data:
        try:
            return _parse_outline(data)
        except Exception as exc:
            logger.warning("Failed to parse LLM outline: %s", exc)
    # ── static fallback ─────────────────────────────────────────────────────
    scope = [
        f"Deliver MVP for {intake.title}",
        "Establish secure, modular architecture",
        "Generate Agile and GitHub delivery artifacts",
    ]
    milestones = [
        Milestone(name="Discovery & Planning", description="Refine scope, goals, constraints"),
        Milestone(name="Core Delivery Engine", description="Build PM + Agile + orchestration flow"),
        Milestone(name="Release Readiness", description="Finalize docs, tests, deployment strategy"),
    ]
    roadmap = [
        "Project intake and outline generation",
        "Agile decomposition into epics, stories, and tasks",
        "Agent assignment and sprint execution tracking",
        "Architecture, AI engineering, and GitHub planning outputs",
    ]
    definition_of_done = [
        "Project outline approved by PM",
        "Sprint 1 backlog generated and assigned",
        "All required planning documents produced",
        "Project dashboard reflects current status",
    ]
    return ProjectOutline(
        scope=scope,
        milestones=milestones,
        roadmap=roadmap,
        definition_of_done=definition_of_done,
    )


def generate_agile_plan(intake: ProjectCreate) -> List[Epic]:
    data = complete_json(_AGILE_SYSTEM, _agile_user(intake))
    if data:
        try:
            parsed = _parse_agile(data)
            if parsed:
                return parsed
        except Exception as exc:
            logger.warning("Failed to parse LLM agile plan: %s", exc)
    # ── static fallback ─────────────────────────────────────────────────────
    p = Priority.high if intake.priority in (Priority.high, Priority.critical) else Priority.medium

    story_groups = [
        (
            "EP-1",
            "Project Intake & PM Intelligence",
            "Capture idea and build professional project outline",
            [
                ("ST-1", "Create project intake form", "As a founder, I can submit project goals and constraints"),
                ("ST-2", "Generate PM outline", "As a PM, I can generate scope, milestones, roadmap, and DoD"),
            ],
        ),
        (
            "EP-2",
            "Agile Planning & Agent Assignment",
            "Convert requirements into sprint-ready tasks and assignments",
            [
                ("ST-3", "Create epics and stories", "As a team lead, I can review generated epics and user stories"),
                ("ST-4", "Assign tasks to agents", "As a PM, I can distribute tasks to specialized agents"),
            ],
        ),
        (
            "EP-3",
            "Technical Planning & Delivery Readiness",
            "Produce architecture, AI engineering, and GitHub strategy",
            [
                ("ST-5", "Generate architecture plan", "As an architect, I can generate API and DB direction"),
                ("ST-6", "Generate delivery docs", "As a delivery lead, I can export docs and branch strategy"),
            ],
        ),
    ]

    epics: List[Epic] = []
    for epic_id, epic_title, feature, stories in story_groups:
        built_stories: List[Story] = []
        for story_id, title, desc in stories:
            built_stories.append(
                Story(
                    id=story_id,
                    title=title,
                    description=desc,
                    priority=p,
                    acceptance_criteria=[
                        AcceptanceCriteria(criteria="Output is generated in structured JSON"),
                        AcceptanceCriteria(criteria="Output is visible on the project detail page"),
                    ],
                )
            )
        epics.append(Epic(id=epic_id, title=epic_title, feature=feature, stories=built_stories))

    return epics


def assign_tasks(epics: List[Epic]) -> List[Task]:
    task_templates = [
        ("Project Manager Agent", "Finalize project outline"),
        ("Business Analyst Agent", "Refine user stories and acceptance criteria"),
        ("Solution Architect Agent", "Draft architecture and service boundaries"),
        ("AI Engineering Agent", "Define model routing and memory strategy"),
        ("Frontend Developer Agent", "Build intake, dashboard, and board views"),
        ("Backend Developer Agent", "Build APIs and workflow orchestration"),
        ("Database Engineer Agent", "Draft schema and migration strategy"),
        ("DevOps Agent", "Define Docker and CI workflow"),
        ("QA/Test Agent", "Prepare Sprint 1 test plan"),
        ("Security Agent", "Review auth and input validation strategy"),
        ("Code Review Agent", "Create quality gates checklist"),
        ("GitHub Agent", "Create branch and PR strategy"),
    ]

    tasks: List[Task] = []
    story_ids = [story.id for epic in epics for story in epic.stories]
    for idx, (agent, title) in enumerate(task_templates, start=1):
        story_id = story_ids[(idx - 1) % len(story_ids)]
        depends_on = [] if idx == 1 else [f"TSK-{idx-1}"]
        tasks.append(
            Task(
                id=f"TSK-{idx}",
                story_id=story_id,
                title=title,
                owner_agent=agent,
                sprint=1,
                status=TaskStatus.backlog,
                depends_on=depends_on,
            )
        )
    return tasks


def build_assignments(tasks: List[Task]) -> List[AgentAssignment]:
    by_agent = {}
    for task in tasks:
        by_agent.setdefault(task.owner_agent, []).append(task.id)

    assignments: List[AgentAssignment] = []
    for agent in AGENT_ROLES:
        assignments.append(
            AgentAssignment(
                agent_name=agent,
                responsibilities=[
                    "Deliver assigned sprint tasks",
                    "Publish structured outputs",
                    "Update task status and blockers",
                ],
                active_task_ids=by_agent.get(agent, []),
            )
        )
    return assignments


def generate_project_plan_doc(intake: ProjectCreate) -> str:
    result = complete_text(_PROJECT_PLAN_SYSTEM, _project_plan_user(intake))
    if result:
        return result
    # ── static fallback ─────────────────────────────────────────────────────
    goals = "\n".join([f"- {goal}" for goal in intake.goals]) if intake.goals else "- Define goals"
    return (
        f"# PROJECT_PLAN\n\n"
        f"## Title\n{intake.title}\n\n"
        f"## Summary\n{intake.summary}\n\n"
        f"## Goals\n{goals}"
    )


def generate_agile_plan_doc(intake: ProjectCreate, epics: List[Epic], tasks: List[Task]) -> str:
    result = complete_text(_AGILE_DOC_SYSTEM, _agile_doc_user(intake, epics, tasks))
    if result:
        return result
    # ── static fallback ─────────────────────────────────────────────────────
    epic_lines = "\n".join([f"- {epic.id}: {epic.title}" for epic in epics]) if epics else "- No epics generated yet"
    task_lines = (
        "\n".join([f"- {task.id} [{task.owner_agent}] {task.title}" for task in tasks])
        if tasks
        else "- No tasks generated yet"
    )
    return (
        "# AGILE_PLAN\n\n"
        "## Epics\n"
        f"{epic_lines}\n\n"
        "## Sprint 1 Tasks\n"
        f"{task_lines}"
    )


def generate_architecture_doc(intake: ProjectCreate) -> str:
    result = complete_text(_ARCH_SYSTEM, _arch_user(intake))
    if result:
        return result
    # ── static fallback ─────────────────────────────────────────────────────
    return (
        "# ARCHITECTURE\n\n"
        "- Frontend: Next.js\n"
        "- Backend: FastAPI\n"
        "- Data: PostgreSQL\n"
        "- Auth: Supabase Auth\n"
        "- Orchestration: LangGraph"
    )


def generate_ai_engineering_doc(intake: ProjectCreate) -> str:
    result = complete_text(_AI_ENG_SYSTEM, _ai_eng_user(intake))
    if result:
        return result
    # ── static fallback ─────────────────────────────────────────────────────
    return (
        "# AI_ENGINEERING_PLAN\n\n"
        "- Multi-agent orchestration via LangGraph\n"
        "- Prompt templates per specialist agent\n"
        "- Memory strategy: short-term session + vector retrieval\n"
        "- Model strategy: primary + fallback routing"
    )


def generate_agents_doc(intake: ProjectCreate) -> str:
    result = complete_text(_AGENTS_SYSTEM, _agents_user(intake))
    if result:
        return result
    # ── static fallback ─────────────────────────────────────────────────────
    return "# AGENTS\n\n" + "\n".join([f"- {role}" for role in AGENT_ROLES])


def generate_github_strategy_doc(intake: ProjectCreate) -> str:
    result = complete_text(_GITHUB_SYSTEM, _github_user(intake))
    if result:
        return result
    # ── static fallback ─────────────────────────────────────────────────────
    return (
        "# GITHUB_STRATEGY\n\n"
        "- Branch model: trunk-based\n"
        "- Branch naming: feat/<module>-<scope>\n"
        "- Commit style: task-linked small commits\n"
        "- PR template: context, risk, tests, rollout"
    )


def generate_deliverables(intake: ProjectCreate, epics: List[Epic], tasks: List[Task]) -> DeliverableBundle:
    return DeliverableBundle(
        project_plan=generate_project_plan_doc(intake),
        agile_plan=generate_agile_plan_doc(intake, epics, tasks),
        architecture=generate_architecture_doc(intake),
        ai_engineering_plan=generate_ai_engineering_doc(intake),
        agents=generate_agents_doc(intake),
        github_strategy=generate_github_strategy_doc(intake),
    )


def initial_status(project_id: str) -> ProjectStatus:
    return ProjectStatus(
        project_id=project_id,
        phase="intake_created",
        updated_at=now_utc(),
        progress_percent=15,
    )


def next_status(project_id: str, phase: str, progress_percent: int) -> ProjectStatus:
    return ProjectStatus(
        project_id=project_id,
        phase=phase,
        updated_at=now_utc(),
        progress_percent=progress_percent,
    )


def new_project_id() -> str:
    return f"prj-{uuid4().hex[:8]}"
