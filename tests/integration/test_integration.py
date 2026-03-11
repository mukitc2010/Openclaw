"""Integration tests — placeholder for full stack integration testing.

These tests require a running PostgreSQL database and are skipped
in unit test environments. Set INTEGRATION_TESTS=1 to enable.
"""

import os
import pytest

INTEGRATION = os.getenv("INTEGRATION_TESTS", "0") == "1"
skip_if_no_integration = pytest.mark.skipif(
    not INTEGRATION, reason="Set INTEGRATION_TESTS=1 to run integration tests"
)


@skip_if_no_integration
def test_database_connection() -> None:
    """Verify the database is reachable and schema is correct."""
    # In a real integration test, this would use a real DB session
    # and verify the schema via introspection.
    pass


@skip_if_no_integration
def test_full_project_lifecycle() -> None:
    """Create a project, trigger agent orchestration, verify artifacts are saved."""
    pass
