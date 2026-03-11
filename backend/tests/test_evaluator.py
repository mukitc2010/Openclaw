"""Tests for the AI agent output evaluator."""

import pytest

from ai.evaluation.evaluator import AgentOutputEvaluator, EvaluationResult


@pytest.fixture
def evaluator() -> AgentOutputEvaluator:
    return AgentOutputEvaluator()


def test_good_output_passes(evaluator: AgentOutputEvaluator) -> None:
    """A well-formed output should pass evaluation."""
    output = """
## Project Intake Summary

### Business Goal
Build an AI-powered task management tool for engineering teams.

### Problem Statement
Engineering teams spend too much time on manual sprint planning.

### Target Users
Software engineering teams of 5-50 people.

### Core Features
- AI sprint planning
- Automated standups
- Task prioritization

### Epics
1. User Management
2. Sprint Planning
3. AI Integration

### Sprint Plan
- Sprint 1: Foundation
- Sprint 2: Core features
- Sprint 3: AI integration
- Sprint 4: QA and delivery
"""
    result = evaluator.evaluate("project_manager", output)
    assert result.passed is True
    assert result.score >= 0.6


def test_empty_output_fails(evaluator: AgentOutputEvaluator) -> None:
    """An empty output should fail evaluation."""
    result = evaluator.evaluate("project_manager", "")
    assert result.passed is False
    assert result.score < 0.6
    assert any("too short" in issue for issue in result.issues)


def test_hallucination_marker_detected(evaluator: AgentOutputEvaluator) -> None:
    """Output containing hallucination markers should fail."""
    output = (
        "## Architecture\n\n"
        "Use [INSERT DATABASE NAME HERE] for storage.\n"
        "The API will be built with [TODO: select framework].\n" * 20
    )
    result = evaluator.evaluate("solution_architect", output)
    assert any("Hallucination" in issue for issue in result.issues)


def test_missing_required_sections_penalized(evaluator: AgentOutputEvaluator) -> None:
    """Output missing required sections should score lower."""
    output = (
        "## Some random content\n\n"
        "This output does not contain the expected sections at all. "
        "It talks about completely unrelated things without any structure. " * 15
    )
    result_with_sections = evaluator.evaluate("devops", "## Docker\n\nDocker stuff here.\n## Kubernetes\nK8s setup.\n## CI/CD\nGitHub Actions workflow.\n" * 10)
    result_without = evaluator.evaluate("devops", output)
    assert result_with_sections.score >= result_without.score


def test_evaluate_pipeline(evaluator: AgentOutputEvaluator) -> None:
    """evaluate_pipeline returns one result per agent."""
    outputs = {
        "project_manager": "## Intake\n\nBusiness goal: Build great software.\n" * 20,
        "business_analyst": "## User Stories\n\nAs a user I want to manage tasks.\n" * 15,
    }
    results = evaluator.evaluate_pipeline(outputs)
    assert len(results) == 2
    assert all(isinstance(r, EvaluationResult) for r in results)


def test_evaluation_result_feedback_populated(evaluator: AgentOutputEvaluator) -> None:
    """EvaluationResult always has a non-empty feedback string."""
    result = evaluator.evaluate("security", "## OWASP\n\nAuth review complete.\n" * 20)
    assert isinstance(result.feedback, str)
    assert len(result.feedback) > 0
