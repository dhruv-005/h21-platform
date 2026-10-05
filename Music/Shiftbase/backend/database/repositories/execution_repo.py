"""
Shiftbase - Execution Runs Repository
Tracks lifecycle, state, deduplication checks, and metrics of execution runs.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from database.connection import DatabaseConnection


class ExecutionRepository:
    """Repository managing execution_runs table."""

    def __init__(self, db: DatabaseConnection):
        self.db = db

    async def create_run(
        self,
        run_id: str,
        plan_id: str,
        run_type: str,
        status: str = "running",
    ) -> Dict[str, Any]:
        """Create a new tracked execution run."""
        query = """
            INSERT INTO execution_runs (id, plan_id, run_type, status)
            VALUES (?, ?, ?, ?)
        """
        await self.db.execute(query, (run_id, plan_id, run_type, status))
        return await self.get_by_id(run_id)

    async def complete_run(
        self,
        run_id: str,
        status: str,
        source_count: int,
        target_count: int,
        quarantine_count: int,
    ) -> None:
        """Mark an execution run as completed with verified metrics."""
        now = datetime.now(timezone.utc).isoformat()
        query = """
            UPDATE execution_runs
            SET status = ?, source_count = ?, target_count = ?, quarantine_count = ?, completed_at = ?
            WHERE id = ?
        """
        await self.db.execute(
            query,
            (status, source_count, target_count, quarantine_count, now, run_id),
        )

    async def get_by_id(self, run_id: str) -> Optional[Dict[str, Any]]:
        """Fetch an execution run by its UUID."""
        query = "SELECT * FROM execution_runs WHERE id = ?"
        return await self.db.fetch_one(query, (run_id,))

    async def get_by_plan(self, plan_id: str) -> List[Dict[str, Any]]:
        """Fetch all execution runs for a plan."""
        query = "SELECT * FROM execution_runs WHERE plan_id = ? ORDER BY started_at DESC"
        return await self.db.fetch_all(query, (plan_id,))

    async def get_active_or_completed_live_runs(self, plan_id: str) -> List[Dict[str, Any]]:
        """Deduplication Guard: Find completed live execution runs for a plan."""
        query = """
            SELECT * FROM execution_runs
            WHERE plan_id = ? AND run_type = 'live' AND status = 'completed'
        """
        return await self.db.fetch_all(query, (plan_id,))