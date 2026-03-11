"""Tests for sprint and task API endpoints."""

import pytest
from fastapi.testclient import TestClient


def _create_project(client: TestClient) -> str:
    """Helper: create a project and return its ID."""
    resp = client.post(
        "/api/v1/projects/",
        json={"name": "Sprint Test Project", "idea": "Build a platform for managing sprints efficiently"},
    )
    return resp.json()["id"]


def _create_sprint(client: TestClient, project_id: str) -> str:
    """Helper: create a sprint and return its ID."""
    resp = client.post(
        f"/api/v1/projects/{project_id}/sprints",
        json={"name": "Sprint 1", "goal": "Foundation setup", "sprint_number": 1},
    )
    return resp.json()["id"]


def test_create_sprint(client: TestClient) -> None:
    """POST /api/v1/projects/{id}/sprints creates a sprint."""
    project_id = _create_project(client)
    response = client.post(
        f"/api/v1/projects/{project_id}/sprints",
        json={"name": "Sprint 1", "goal": "Set up foundation", "sprint_number": 1},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Sprint 1"
    assert data["sprint_number"] == 1
    assert data["status"] == "planned"
    assert data["project_id"] == project_id


def test_create_sprint_project_not_found(client: TestClient) -> None:
    """POST /api/v1/projects/{bad_id}/sprints returns 404."""
    response = client.post(
        "/api/v1/projects/00000000-0000-0000-0000-000000000000/sprints",
        json={"name": "Sprint 1", "sprint_number": 1},
    )
    assert response.status_code == 404


def test_list_sprints(client: TestClient) -> None:
    """GET /api/v1/projects/{id}/sprints returns all sprints ordered by number."""
    project_id = _create_project(client)
    client.post(
        f"/api/v1/projects/{project_id}/sprints",
        json={"name": "Sprint 2", "sprint_number": 2},
    )
    client.post(
        f"/api/v1/projects/{project_id}/sprints",
        json={"name": "Sprint 1", "sprint_number": 1},
    )
    response = client.get(f"/api/v1/projects/{project_id}/sprints")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["sprint_number"] == 1
    assert data[1]["sprint_number"] == 2


def test_create_task(client: TestClient) -> None:
    """POST tasks endpoint creates a task in a sprint."""
    project_id = _create_project(client)
    sprint_id = _create_sprint(client, project_id)
    response = client.post(
        f"/api/v1/projects/{project_id}/sprints/{sprint_id}/tasks",
        json={"title": "Implement project intake API", "assigned_agent": "backend_developer"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Implement project intake API"
    assert data["status"] == "todo"
    assert data["assigned_agent"] == "backend_developer"


def test_list_tasks(client: TestClient) -> None:
    """GET tasks endpoint returns all tasks in a sprint."""
    project_id = _create_project(client)
    sprint_id = _create_sprint(client, project_id)
    client.post(
        f"/api/v1/projects/{project_id}/sprints/{sprint_id}/tasks",
        json={"title": "Task A"},
    )
    client.post(
        f"/api/v1/projects/{project_id}/sprints/{sprint_id}/tasks",
        json={"title": "Task B"},
    )
    response = client.get(f"/api/v1/projects/{project_id}/sprints/{sprint_id}/tasks")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_update_task_status(client: TestClient) -> None:
    """PATCH task endpoint updates task status."""
    project_id = _create_project(client)
    sprint_id = _create_sprint(client, project_id)
    task_resp = client.post(
        f"/api/v1/projects/{project_id}/sprints/{sprint_id}/tasks",
        json={"title": "My Task"},
    )
    task_id = task_resp.json()["id"]

    response = client.patch(
        f"/api/v1/projects/{project_id}/sprints/{sprint_id}/tasks/{task_id}",
        json={"status": "in_progress"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "in_progress"
