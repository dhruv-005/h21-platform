"""
Shiftbase - Source Records Repository
Manages staging and querying of incoming sample/source records.
"""

import json
from typing import Any, Dict, List
from database.connection import DatabaseConnection


class SourceRepository:
    """Repository managing source_records table."""

    def __init__(self, db: DatabaseConnection):
        self.db = db

    async def insert_records(self, plan_id: str, records: List[Dict[str, Any]]) -> int:
        """Batch insert raw source records associated with a plan."""
        query = "INSERT INTO source_records (plan_id, data) VALUES (?, ?)"
        params = [(plan_id, json.dumps(record)) for record in records]
        await self.db.execute_many(query, params)
        return len(records)

    async def get_records_by_plan(
        self, plan_id: str, limit: int = 500
    ) -> List[Dict[str, Any]]:
        """Fetch all source records tied to a plan."""
        query = "SELECT id, plan_id, data, created_at FROM source_records WHERE plan_id = ? ORDER BY id ASC LIMIT ?"
        rows = await self.db.fetch_all(query, (plan_id, limit))
        return [
            {
                "id": row["id"],
                "plan_id": row["plan_id"],
                "data": json.loads(row["data"]),
                "created_at": row["created_at"],
            }
            for row in rows
        ]

    async def count_by_plan(self, plan_id: str) -> int:
        """Return total count of source records for a plan."""
        query = "SELECT COUNT(*) as cnt FROM source_records WHERE plan_id = ?"
        row = await self.db.fetch_one(query, (plan_id,))
        return row["cnt"] if row else 0

    async def delete_by_plan(self, plan_id: str) -> None:
        """Delete all source records tied to a plan."""
        query = "DELETE FROM source_records WHERE plan_id = ?"
        await self.db.execute(query, (plan_id,))