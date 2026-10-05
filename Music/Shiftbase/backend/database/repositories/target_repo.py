"""
Shiftbase - Mock Target Repository
Manages writing, retrieving, counting, and rolling back target records.
"""

import json
from typing import Any, Dict, List, Optional
from database.connection import DatabaseConnection


class TargetRepository:
    """Repository managing mock_target table."""

    def __init__(self, db: DatabaseConnection):
        self.db = db

    async def insert_bulk(
        self,
        plan_id: str,
        execution_id: str,
        records: List[Dict[str, Any]],
    ) -> int:
        """
        Batch insert migrated target records.
        records structure: [{"data": {...}, "source_record_id": int}, ...]
        """
        query = """
            INSERT INTO mock_target (plan_id, execution_id, data, source_record_id)
            VALUES (?, ?, ?, ?)
        """
        params = [
            (
                plan_id,
                execution_id,
                json.dumps(r["data"]),
                r.get("source_record_id"),
            )
            for r in records
        ]
        await self.db.execute_many(query, params)
        return len(records)

    async def get_by_plan(
        self,
        plan_id: str,
        execution_id: Optional[str] = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Fetch migrated records for a plan/execution."""
        if execution_id:
            query = """
                SELECT id, plan_id, execution_id, data, source_record_id, migrated_at
                FROM mock_target
                WHERE plan_id = ? AND execution_id = ?
                ORDER BY id ASC LIMIT ?
            """
            rows = await self.db.fetch_all(query, (plan_id, execution_id, limit))
        else:
            query = """
                SELECT id, plan_id, execution_id, data, source_record_id, migrated_at
                FROM mock_target
                WHERE plan_id = ?
                ORDER BY id ASC LIMIT ?
            """
            rows = await self.db.fetch_all(query, (plan_id, limit))

        return [
            {
                "id": row["id"],
                "plan_id": row["plan_id"],
                "execution_id": row["execution_id"],
                "data": json.loads(row["data"]),
                "source_record_id": row["source_record_id"],
                "migrated_at": row["migrated_at"],
            }
            for row in rows
        ]

    async def count_by_execution(self, plan_id: str, execution_id: str) -> int:
        """Count how many records were inserted in a specific execution."""
        query = """
            SELECT COUNT(*) as cnt FROM mock_target
            WHERE plan_id = ? AND execution_id = ?
        """
        row = await self.db.fetch_one(query, (plan_id, execution_id))
        return row["cnt"] if row else 0

    async def delete_by_execution(self, execution_id: str) -> int:
        """Rollback: Delete all records created by a given execution ID."""
        count_query = "SELECT COUNT(*) as cnt FROM mock_target WHERE execution_id = ?"
        row = await self.db.fetch_one(count_query, (execution_id,))
        deleted_count = row["cnt"] if row else 0

        delete_query = "DELETE FROM mock_target WHERE execution_id = ?"
        await self.db.execute(delete_query, (execution_id,))
        return deleted_count