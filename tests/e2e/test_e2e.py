"""E2E tests — placeholder for Playwright/Cypress browser tests."""

import os
import pytest

E2E = os.getenv("E2E_TESTS", "0") == "1"
skip_if_no_e2e = pytest.mark.skipif(
    not E2E, reason="Set E2E_TESTS=1 to run end-to-end tests"
)


@skip_if_no_e2e
def test_project_intake_wizard() -> None:
    """User submits project idea via wizard, sees agent stream output."""
    pass


@skip_if_no_e2e
def test_sprint_board_displays_tasks() -> None:
    """Sprint board shows tasks after agent pipeline completes."""
    pass
