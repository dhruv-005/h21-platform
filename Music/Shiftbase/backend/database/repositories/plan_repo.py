"""
Shiftbase - Migration Plan Repository
Handles CRUD operations and version tracking for migration plans.
"""

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from database.connection import DatabaseConnection


class PlanRepository:
    """Repository managing migration_plans table."""

    def __init__(self, db: DatabaseConnection):
        self.db = db

    async def create_plan(
        self,
        plan_id: str,
        source_schema: Dict[str, Any],
        target_schema: Dict[str, Any],
        field_mappings: List[Dict[str, Any]],
        transformations: List[Dict[str, Any]],
        ai_warnings: Optional[List[str]] = None,
        version: int = 1,
        parent_version_id: Optional[str] = None,
        status: str = "proposed",
    ) -> Dict[str, Any]:
        """Insert a newly proposed or versioned migration plan."""
        query = """
            INSERT INTO migration_plans (
                id, version, source_schema, target_schema,
                field_mappings, transformations, ai_warnings,
                status, parent_version_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        await self.db.execute(
            query,
            (
                plan_id,
                version,
                json.dumps(source_schema),
                json.dumps(target_schema),
                json.dumps(field_mappings),
                json.dumps(transformations),
                json.dumps(ai_warnings or []),
                status,
                parent_version_id,
            ),
        )
        return await self.get_plan_by_id(plan_id)

    async def get_plan_by_id(self, plan_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a specific migration plan by primary key."""
        query = "SELECT * FROM migration_plans WHERE id = ?"
        row = await self.db.fetch_one(query, (plan_id,))
        if not row:
            return None

        # Parse JSON fields into python structures
        return {
            **row,
            "source_schema": json.loads(row["source_schema"]),
            "target_schema": json.loads(row["target_schema"]),
            "field_mappings": json.loads(row["field_mappings"]),
            "transformations": json.loads(row["transformations"]),
            "ai_warnings": json.loads(row["ai_warnings"]) if row["ai_warnings"] else [],
        }

    async def update_status(
        self,
        plan_id: str,
        status: str,
        approved_by: Optional[str] = None,
    ) -> None:
        """Update the status and optional approval timestamp of a plan."""
        if status == "approved":
            query = """
                UPDATE migration_plans
                SET status = ?, approved_at = ?, approved_by = ?
                WHERE id = ?
            """
            now = datetime.now(timezone.utc).isoformat()
            await self.db.execute(query, (status, now, approved_by or "user", plan_id))
        else:
            query = "UPDATE migration_plans SET status = ? WHERE id = ?"
            await self.db.execute(query, (status, plan_id))

    async def update_mappings(
        self,
        plan_id: str,
        field_mappings: List[Dict[str, Any]],
        transformations: List[Dict[str, Any]],
    ) -> None:
        """Update mappings directly (used for draft updates)."""
        query = """
            UPDATE migration_plans
            SET field_mappings = ?, transformations = ?
            WHERE id = ?
        """
        await self.db.execute(
            query,
            (json.dumps(field_mappings), json.dumps(transformations), plan_id),
        )

    async def get_plan_history(self, initial_plan_id: str) -> List[Dict[str, Any]]:
        """Fetch the full ancestral version tree for a migration plan."""
        history = []
        current_id: Optional[str] = initial_plan_id

        while current_id:
            plan = await self.get_plan_by_id(current_id)
            if not plan:
                break
            history.append(plan)
            current_id = plan.get("parent_version_id")

        return history

    async def list_all(self, limit: int = 50) -> List[Dict[str, Any]]:
        """List recent migration plans."""
        query = "SELECT * FROM migration_plans ORDER BY created_at DESC LIMIT ?"
        rows = await self.db.fetch_all(query, (limit,))
        result = []
        for row in rows:
            result.append({
                **row,
                "source_schema": json.loads(row["source_schema"]),
                "target_schema": json.loads(row["target_schema"]),
                "field_mappings": json.loads(row["field_mappings"]),
                "transformations": json.loads(row["transformations"]),
                "ai_warnings": json.loads(row["ai_warnings"]) if row["ai_warnings"] else [],
            })
        return result