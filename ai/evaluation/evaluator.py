"""Agent output evaluation — measures quality of agent-generated content."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List


@dataclass
class EvaluationResult:
    """Result of evaluating a single agent output."""

    agent_name: str
    score: float  # 0.0 – 1.0
    passed: bool
    issues: List[str]
    feedback: str


class AgentOutputEvaluator:
    """Evaluates agent outputs against quality criteria.

    Criteria checked:
    - Minimum length (not an empty or trivial response)
    - Presence of required sections (markdown headers)
    - No hallucination markers (placeholder text left unfilled)
    - Structured formatting (uses markdown)
    """

    REQUIRED_SECTIONS_BY_AGENT = {
        "project_manager": ["intake", "agile", "epic", "sprint"],
        "business_analyst": ["user stor", "acceptance criteria"],
        "solution_architect": ["architecture", "tech stack", "api"],
        "ai_engineering": ["ai workflow", "model", "prompt", "rag"],
        "devops": ["docker", "kubernetes", "ci/cd"],
        "qa_engineer": ["test", "acceptance"],
        "security": ["owasp", "vulnerability", "auth"],
        "code_reviewer": ["review", "approval"],
        "github_agent": ["repository", "branch", "commit"],
    }

    HALLUCINATION_MARKERS = [
        "[INSERT",
        "[TODO",
        "PLACEHOLDER",
        "YOUR_VALUE_HERE",
        "<FILL_IN>",
    ]

    MIN_LENGTH = 200

    def evaluate(self, agent_name: str, output: str) -> EvaluationResult:
        """Evaluate the output of a single agent.

        Args:
            agent_name: The agent identifier (e.g., 'project_manager').
            output: The raw text output from the agent.

        Returns:
            An EvaluationResult with score, pass/fail, and feedback.
        """
        issues: list[str] = []
        score = 1.0

        # Length check
        if len(output.strip()) < self.MIN_LENGTH:
            issues.append(f"Output too short ({len(output)} chars, minimum {self.MIN_LENGTH})")
            score -= 0.3

        # Hallucination check
        for marker in self.HALLUCINATION_MARKERS:
            if marker in output.upper():
                issues.append(f"Hallucination marker found: {marker}")
                score -= 0.2

        # Required sections check
        required = self.REQUIRED_SECTIONS_BY_AGENT.get(agent_name, [])
        lower_output = output.lower()
        for section in required:
            if section not in lower_output:
                issues.append(f"Missing expected section/content: '{section}'")
                score -= 0.1

        # Markdown structure check
        if "##" not in output and "#" not in output:
            issues.append("Output lacks markdown structure (no headers found)")
            score -= 0.1

        score = max(0.0, round(score, 2))
        passed = score >= 0.6 and len([i for i in issues if "too short" in i or "Hallucination" in i]) == 0

        feedback = (
            f"Score: {score:.0%}. " +
            (f"Issues: {'; '.join(issues)}" if issues else "All quality checks passed.")
        )

        return EvaluationResult(
            agent_name=agent_name,
            score=score,
            passed=passed,
            issues=issues,
            feedback=feedback,
        )

    def evaluate_pipeline(
        self, agent_outputs: dict[str, str]
    ) -> List[EvaluationResult]:
        """Evaluate all agent outputs in a pipeline run.

        Args:
            agent_outputs: Dict mapping agent_name → output text.

        Returns:
            List of EvaluationResult, one per agent.
        """
        return [
            self.evaluate(agent_name, output)
            for agent_name, output in agent_outputs.items()
        ]
