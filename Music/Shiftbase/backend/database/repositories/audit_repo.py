"""
Shiftbase - Audit Repository
Provides immutable logging of all migration lifecycle actions.
"""

import json
from typing import Any, Dict, List, Optional
from database.connection import DatabaseConnection


class AuditRepository:
    """Repository managing audit_log table."""

    def __init__(self, db: DatabaseConnection):
        self.db = db

    async def log_action(
        self,
        action: str,
        plan_id: Optional[str] = None,
        execution_id: Optional[str] = None,
        actor: str = "user",
        details: Optional[Dict[str, Any]] = None,
        record_counts: Optional[Dict[str, int]] = None,
    ) -> int:
        """Record an immutable audit log entry."""
        query = """
            INSERT INTO audit_log (execution_id, plan_id, action, actor, details, record_counts)
            VALUES (?, ?, ?, ?, ?, ?)
        """
        cursor = await self.db.execute(
            query,
            (
                execution_id,
                plan_id,
                action,
                actor,
                json.dumps(details or {}),
                json.dumps(record_counts or {}),
            ),
        )
        return cursor.lastrowid

    async def get_trail(
        self,
        plan_id: Optional[str] = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Fetch audit trail ordered chronologically (newest first)."""
        if plan_id:
            query = """
                SELECT id, execution_id, plan_id, action, actor, details, record_counts, timestamp
                FROM audit_log
                WHERE plan_id = ?
                ORDER BY id DESC LIMIT ?
            """
            rows = await self.db.fetch_all(query, (plan_id, limit))
        else:
            query = """
                SELECT id, execution_id, plan_id, action, actor, details, record_counts, timestamp
                FROM audit_log
                ORDER BY id DESC LIMIT ?
            """
            rows = await self.db.fetch_all(query, (limit,))

        return [
            {
                "id": row["id"],
                "execution_id": row["execution_id"],
                "plan_id": row["plan_id"],
                "action": row["action"],
                "actor": row["actor"],
                "details": json.loads(row["details"]) if row["details"] else {},
                "record_counts": json.loads(row["record_counts"]) if row["record_counts"] else {},
                "timestamp": row["timestamp"],
            }
            for row in rows
        ]