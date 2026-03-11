-- OpenClaw Database Schema
-- PostgreSQL 15+

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Projects ───────────────────────────────────────────────────────────────

CREATE TYPE project_status AS ENUM (
    'intake', 'planning', 'architecture', 'implementation', 'review', 'delivered'
);

CREATE TABLE projects (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    idea                TEXT NOT NULL,
    status              project_status NOT NULL DEFAULT 'intake',
    business_goal       TEXT,
    problem_statement   TEXT,
    target_users        TEXT,
    constraints         TEXT,
    assumptions         TEXT,
    risks               TEXT,
    success_criteria    TEXT,
    timeline_estimate   VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- ── Epics ──────────────────────────────────────────────────────────────────

CREATE TABLE epics (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title       VARCHAR(500) NOT NULL,
    description TEXT,
    priority    SMALLINT NOT NULL DEFAULT 2 CHECK (priority BETWEEN 0 AND 4),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_epics_project_id ON epics(project_id);

-- ── Sprints ────────────────────────────────────────────────────────────────

CREATE TYPE sprint_status AS ENUM ('planned', 'active', 'completed');

CREATE TABLE sprints (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    goal            TEXT,
    sprint_number   SMALLINT NOT NULL CHECK (sprint_number > 0),
    status          sprint_status NOT NULL DEFAULT 'planned',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, sprint_number)
);

CREATE INDEX idx_sprints_project_id ON sprints(project_id);

-- ── User Stories ───────────────────────────────────────────────────────────

CREATE TABLE user_stories (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    epic_id              UUID NOT NULL REFERENCES epics(id) ON DELETE CASCADE,
    title                VARCHAR(500) NOT NULL,
    as_a                 VARCHAR(500),
    i_want               TEXT,
    so_that              TEXT,
    acceptance_criteria  TEXT,
    priority             SMALLINT NOT NULL DEFAULT 2 CHECK (priority BETWEEN 0 AND 4),
    assigned_agent       VARCHAR(100),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_stories_epic_id ON user_stories(epic_id);

-- ── Tasks ──────────────────────────────────────────────────────────────────

CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'blocked');

CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sprint_id       UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
    user_story_id   UUID REFERENCES user_stories(id) ON DELETE SET NULL,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    status          task_status NOT NULL DEFAULT 'todo',
    assigned_agent  VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ── Artifacts ──────────────────────────────────────────────────────────────

CREATE TABLE artifacts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    artifact_type       VARCHAR(100) NOT NULL,
    title               VARCHAR(500) NOT NULL,
    content             TEXT NOT NULL,
    produced_by_agent   VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_artifacts_project_id ON artifacts(project_id);
CREATE INDEX idx_artifacts_type ON artifacts(artifact_type);

-- ── Agent Runs ─────────────────────────────────────────────────────────────

CREATE TYPE agent_run_status AS ENUM ('pending', 'running', 'completed', 'failed');

CREATE TABLE agent_runs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    agent_name      VARCHAR(100) NOT NULL,
    phase           VARCHAR(100) NOT NULL,
    status          agent_run_status NOT NULL DEFAULT 'pending',
    input_summary   TEXT,
    output_summary  TEXT,
    error_message   TEXT,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_runs_project_id ON agent_runs(project_id);
CREATE INDEX idx_agent_runs_status ON agent_runs(status);

-- ── Updated-at trigger ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
