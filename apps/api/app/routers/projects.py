from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.core.store import store
from app.models.schemas import (
    DeliverableBundle,
    ProjectCreate,
    ProjectListResponse,
    ProjectRecord,
    StatusTimeline,
    TaskStatus,
    TaskStatusUpdate,
    now_utc,
)
from app.services.planning import (
    assign_tasks,
    build_assignments,
    generate_agile_plan_doc,
    generate_ai_engineering_doc,
    generate_agents_doc,
    generate_architecture_doc,
    generate_agile_plan,
    generate_deliverables,
    generate_github_strategy_doc,
    generate_outline,
    generate_project_plan_doc,
    generate_qa_test_report_doc,
    initial_status,
    new_project_id,
    next_status,
)

router = APIRouter(
    prefix="/projects",
    tags=["projects"],
    dependencies=[Depends(get_current_user)],
)


def _get_project(project_id: str) -> ProjectRecord:
    project = store.projects.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def _with_status(project_id: str, phase: str, progress: int) -> None:
    store.status_timeline.setdefault(project_id, []).append(next_status(project_id, phase, progress))


def _ensure_deliverables(project: ProjectRecord) -> DeliverableBundle:
    if project.deliverables is None:
        project.deliverables = generate_deliverables(project.intake, project.epics, project.tasks)
    return project.deliverables


@router.post("", response_model=ProjectRecord)
def create_project(payload: ProjectCreate) -> ProjectRecord:
    project_id = new_project_id()
    record = ProjectRecord(id=project_id, created_at=now_utc(), intake=payload)

    store.projects[project_id] = record
    store.status_timeline[project_id] = [initial_status(project_id)]
    return record


@router.get("", response_model=ProjectListResponse)
def list_projects() -> ProjectListResponse:
    items = list(store.projects.values())
    items.sort(key=lambda p: p.created_at, reverse=True)
    return ProjectListResponse(projects=items)


@router.get("/{project_id}", response_model=ProjectRecord)
def get_project(project_id: str) -> ProjectRecord:
    return _get_project(project_id)


@router.post("/{project_id}/generate", response_model=ProjectRecord)
def generate_project_outputs(project_id: str) -> ProjectRecord:
    project = _get_project(project_id)
    project.outline = generate_outline(project.intake)
    _with_status(project_id, "outline_generated", 35)

    project.epics = generate_agile_plan(project.intake)
    _with_status(project_id, "agile_plan_generated", 55)

    project.tasks = assign_tasks(project.epics)
    project.assignments = build_assignments(project.tasks)
    _with_status(project_id, "agents_assigned", 75)

    project.deliverables = generate_deliverables(project.intake, project.epics, project.tasks)
    _with_status(project_id, "deliverables_generated", 100)

    return project


@router.post("/{project_id}/generate/outline", response_model=ProjectRecord)
def generate_outline_module(project_id: str) -> ProjectRecord:
    project = _get_project(project_id)
    project.outline = generate_outline(project.intake)
    _with_status(project_id, "outline_generated", 35)
    return project


@router.post("/{project_id}/generate/agile", response_model=ProjectRecord)
def generate_agile_module(project_id: str) -> ProjectRecord:
    project = _get_project(project_id)
    project.epics = generate_agile_plan(project.intake)
    project.tasks = assign_tasks(project.epics)
    project.assignments = build_assignments(project.tasks)
    deliverables = _ensure_deliverables(project)
    deliverables.agile_plan = generate_agile_plan_doc(project.intake, project.epics, project.tasks)
    _with_status(project_id, "agile_plan_generated", 55)
    _with_status(project_id, "agents_assigned", 75)
    return project


@router.post("/{project_id}/generate/architecture", response_model=ProjectRecord)
def generate_architecture_module(project_id: str) -> ProjectRecord:
    project = _get_project(project_id)
    deliverables = _ensure_deliverables(project)
    deliverables.architecture = generate_architecture_doc(project.intake)
    _with_status(project_id, "architecture_generated", 85)
    return project


@router.post("/{project_id}/generate/ai-engineering", response_model=ProjectRecord)
def generate_ai_module(project_id: str) -> ProjectRecord:
    project = _get_project(project_id)
    deliverables = _ensure_deliverables(project)
    deliverables.ai_engineering_plan = generate_ai_engineering_doc(project.intake)
    _with_status(project_id, "ai_engineering_generated", 90)
    return project


@router.post("/{project_id}/generate/github", response_model=ProjectRecord)
def generate_github_module(project_id: str) -> ProjectRecord:
    project = _get_project(project_id)
    deliverables = _ensure_deliverables(project)
    deliverables.github_strategy = generate_github_strategy_doc(project.intake)
    deliverables.agents = generate_agents_doc(project.intake)
    deliverables.project_plan = generate_project_plan_doc(project.intake)
    _with_status(project_id, "github_strategy_generated", 95)
    if project.outline and project.epics and project.tasks:
        _with_status(project_id, "deliverables_generated", 100)
    return project


@router.post("/{project_id}/generate/testing", response_model=ProjectRecord)
def generate_testing_module(project_id: str) -> ProjectRecord:
    project = _get_project(project_id)
    deliverables = _ensure_deliverables(project)
    deliverables.qa_test_report = generate_qa_test_report_doc(project.intake, project.epics, project.tasks)
    _with_status(project_id, "qa_testing_generated", 92)
    return project


@router.patch("/{project_id}/tasks/{task_id}", response_model=ProjectRecord)
def update_task_status(project_id: str, task_id: str, payload: TaskStatusUpdate) -> ProjectRecord:
    project = _get_project(project_id)
    updated = False
    for task in project.tasks:
        if task.id == task_id:
            task.status = payload.status
            updated = True
            break

    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")

    done_count = sum(1 for task in project.tasks if task.status == TaskStatus.done)
    progress = 75
    if project.tasks:
        progress = 75 + int((done_count / len(project.tasks)) * 25)
    _with_status(project_id, f"task_{task_id.lower()}_{payload.status.value}", progress)

    return project


@router.post("/{project_id}/stories/{story_id}/start", response_model=ProjectRecord)
def start_story(project_id: str, story_id: str) -> ProjectRecord:
    project = _get_project(project_id)
    updated = False
    for task in project.tasks:
        if task.story_id == story_id and task.status == TaskStatus.backlog:
            task.status = TaskStatus.in_progress
            updated = True

    if not updated:
        raise HTTPException(status_code=404, detail="Story not found or no backlog tasks")

    _with_status(project_id, f"story_{story_id.lower()}_started", 75)
    return project


@router.get("/{project_id}/status", response_model=StatusTimeline)
def get_project_status(project_id: str) -> StatusTimeline:
    if project_id not in store.projects:
        raise HTTPException(status_code=404, detail="Project not found")
    return StatusTimeline(items=store.status_timeline.get(project_id, []))
