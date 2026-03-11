"""Tests for project API endpoints."""

import pytest
from fastapi.testclient import TestClient


def test_health_check(client: TestClient) -> None:
    """GET /health returns 200 with healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "openclaw-api"


def test_create_project(client: TestClient) -> None:
    """POST /api/v1/projects creates a project and returns 201."""
    payload = {
        "name": "Test Project",
        "idea": "Build an AI-powered task management tool for engineering teams",
    }
    response = client.post("/api/v1/projects/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Project"
    assert data["status"] == "intake"
    assert "id" in data
    assert "created_at" in data


def test_create_project_missing_name(client: TestClient) -> None:
    """POST /api/v1/projects with missing name returns 422."""
    response = client.post("/api/v1/projects/", json={"idea": "Some idea"})
    assert response.status_code == 422


def test_create_project_idea_too_short(client: TestClient) -> None:
    """POST /api/v1/projects with idea < 10 chars returns 422."""
    response = client.post(
        "/api/v1/projects/", json={"name": "Test", "idea": "Short"}
    )
    assert response.status_code == 422


def test_list_projects_empty(client: TestClient) -> None:
    """GET /api/v1/projects returns empty list when no projects exist."""
    response = client.get("/api/v1/projects/")
    assert response.status_code == 200
    assert response.json() == []


def test_list_projects(client: TestClient) -> None:
    """GET /api/v1/projects returns all created projects."""
    client.post(
        "/api/v1/projects/",
        json={"name": "Project A", "idea": "Build a great product for users"},
    )
    client.post(
        "/api/v1/projects/",
        json={"name": "Project B", "idea": "Another amazing idea for our customers"},
    )
    response = client.get("/api/v1/projects/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_get_project(client: TestClient) -> None:
    """GET /api/v1/projects/{id} returns the project."""
    create_response = client.post(
        "/api/v1/projects/",
        json={"name": "Get Me", "idea": "Build a platform for all our customers"},
    )
    project_id = create_response.json()["id"]

    response = client.get(f"/api/v1/projects/{project_id}")
    assert response.status_code == 200
    assert response.json()["id"] == project_id
    assert response.json()["name"] == "Get Me"


def test_get_project_not_found(client: TestClient) -> None:
    """GET /api/v1/projects/{nonexistent_id} returns 404."""
    response = client.get("/api/v1/projects/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


def test_update_project(client: TestClient) -> None:
    """PATCH /api/v1/projects/{id} updates the project."""
    create_response = client.post(
        "/api/v1/projects/",
        json={"name": "Original", "idea": "Build a solution for enterprise clients"},
    )
    project_id = create_response.json()["id"]

    response = client.patch(
        f"/api/v1/projects/{project_id}",
        json={"name": "Updated", "business_goal": "Increase team productivity"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated"
    assert data["business_goal"] == "Increase team productivity"


def test_delete_project(client: TestClient) -> None:
    """DELETE /api/v1/projects/{id} removes the project."""
    create_response = client.post(
        "/api/v1/projects/",
        json={"name": "Delete Me", "idea": "Build something that will be removed"},
    )
    project_id = create_response.json()["id"]

    delete_response = client.delete(f"/api/v1/projects/{project_id}")
    assert delete_response.status_code == 204

    get_response = client.get(f"/api/v1/projects/{project_id}")
    assert get_response.status_code == 404
