"""
Shiftbase - Database Migrations & DDL Setup
Creates the required SQLite tables, constraints, and performance indexes.
"""

import logging
from database.connection import DatabaseConnection

logger = logging.getLogger("shiftbase.migrations")

SCHEMA_SQL = """
-- 1. migration_plans: Stores versioned migration blueprints
CREATE TABLE IF NOT EXISTS migration_plans (
    id TEXT PRIMARY KEY,
    version INTEGER NOT NULL DEFAULT 1,
    source_schema JSON NOT NULL,
    target_schema JSON NOT NULL,
    field_mappings JSON NOT NULL,
    transformations JSON NOT NULL,
    ai_warnings JSON,
    status TEXT CHECK(status IN ('proposed','approved','executed','rolled_back','failed')) DEFAULT 'proposed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by TEXT,
    parent_version_id TEXT,
    FOREIGN KEY (parent_version_id) REFERENCES migration_plans(id)
);

-- 2. source_records: Uploaded sample/source data to be migrated
CREATE TABLE IF NOT EXISTS source_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id TEXT NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES migration_plans(id) ON DELETE CASCADE
);

-- 3. mock_target: Destination storage holding successfully transformed records
CREATE TABLE IF NOT EXISTS mock_target (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id TEXT NOT NULL,
    execution_id TEXT NOT NULL,
    data JSON NOT NULL,
    source_record_id INTEGER,
    migrated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES migration_plans(id) ON DELETE CASCADE
);

-- 4. quarantine: Isolated storage for failed records with detailed error reasons
CREATE TABLE IF NOT EXISTS quarantine (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id TEXT NOT NULL,
    execution_id TEXT NOT NULL,
    source_record_id INTEGER,
    source_data JSON NOT NULL,
    error_details JSON NOT NULL,
    quarantined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES migration_plans(id) ON DELETE CASCADE
);

-- 5. audit_log: Immutable chronological log of all actions taken
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    execution_id TEXT,
    plan_id TEXT,
    action TEXT NOT NULL,
    actor TEXT DEFAULT 'user',
    details JSON,
    record_counts JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. execution_runs: Tracks dry-runs, live executions, and rollbacks
CREATE TABLE IF NOT EXISTS execution_runs (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    run_type TEXT CHECK(run_type IN ('dry_run','live','rollback')) NOT NULL,
    status TEXT CHECK(status IN ('running','completed','failed','rolled_back')) NOT NULL,
    source_count INTEGER DEFAULT 0,
    target_count INTEGER DEFAULT 0,
    quarantine_count INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES migration_plans(id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_source_records_plan ON source_records(plan_id);
CREATE INDEX IF NOT EXISTS idx_mock_target_plan ON mock_target(plan_id);
CREATE INDEX IF NOT EXISTS idx_mock_target_exec ON mock_target(execution_id);
CREATE INDEX IF NOT EXISTS idx_quarantine_plan ON quarantine(plan_id);
CREATE INDEX IF NOT EXISTS idx_quarantine_exec ON quarantine(execution_id);
CREATE INDEX IF NOT EXISTS idx_audit_plan ON audit_log(plan_id);
CREATE INDEX IF NOT EXISTS idx_audit_exec ON audit_log(execution_id);
CREATE INDEX IF NOT EXISTS idx_runs_plan ON execution_runs(plan_id);
-- 7. user_sessions: Cookie-based session store
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- 8. users: Registered user accounts
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

"""


async def run_migrations(db: DatabaseConnection) -> None:
    """Executes table creation script on startup."""
    logger.info("Verifying database schema migrations...")
    try:
        await db.execute_script(SCHEMA_SQL)
        logger.info("Database schema verified and migrations applied successfully.")
    except Exception as e:
        logger.error(f"Migration error: {e}")
        raise