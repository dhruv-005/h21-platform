"""
Shiftbase - Quarantine Repository
Stores and retrieves records that failed transformation or schema validation.
"""

import json
from typing import Any, Dict, List, Optional
from database.connection import DatabaseConnection


class QuarantineRepository:
    """Repository managing quarantine table."""

    def __init__(self, db: DatabaseConnection):
        self.db = db

    async def insert_bulk(
        self,
        plan_id: str,
        execution_id: str,
        records: List[Dict[str, Any]],
    ) -> int:
        """
        Batch insert quarantined records.
        records structure: [{"source_record_id": int, "source_data": {...}, "error_details": [...]}, ...]
        """
        query = """
            INSERT INTO quarantine (plan_id, execution_id, source_record_id, source_data, error_details)
            VALUES (?, ?, ?, ?, ?)
        """
        params = [
            (
                plan_id,
                execution_id,
                r.get("source_record_id"),
                json.dumps(r["source_data"]),
                json.dumps(r["error_details"]),
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
        """Retrieve quarantined items with parsed error breakdowns."""
        if execution_id:
            query = """
                SELECT id, plan_id, execution_id, source_record_id, source_data, error_details, quarantined_at
                FROM quarantine
                WHERE plan_id = ? AND execution_id = ?
                ORDER BY id ASC LIMIT ?
            """
            rows = await self.db.fetch_all(query, (plan_id, execution_id, limit))
        else:
            query = """
                SELECT id, plan_id, execution_id, source_record_id, source_data, error_details, quarantined_at
                FROM quarantine
                WHERE plan_id = ?
                ORDER BY id ASC LIMIT ?
            """
            rows = await self.db.fetch_all(query, (plan_id, limit))

        return [
            {
                "id": row["id"],
                "plan_id": row["plan_id"],
                "execution_id": row["execution_id"],
                "source_record_id": row["source_record_id"],
                "source_data": json.loads(row["source_data"]),
                "error_details": json.loads(row["error_details"]),
                "quarantined_at": row["quarantined_at"],
            }
            for row in rows
        ]

    async def count_by_execution(self, plan_id: str, execution_id: str) -> int:
        """Count quarantined records for an execution."""
        query = """
            SELECT COUNT(*) as cnt FROM quarantine
            WHERE plan_id = ? AND execution_id = ?
        """
        row = await self.db.fetch_one(query, (plan_id, execution_id))
        return row["cnt"] if row else 0

    async def delete_by_execution(self, execution_id: str) -> int:
        """Delete quarantined items associated with an execution (used during rollback)."""
        count_query = "SELECT COUNT(*) as cnt FROM quarantine WHERE execution_id = ?"
        row = await self.db.fetch_one(count_query, (execution_id,))
        deleted_count = row["cnt"] if row else 0

        delete_query = "DELETE FROM quarantine WHERE execution_id = ?"
        await self.db.execute(delete_query, (execution_id,))
        return deleted_count