"""
Shiftbase - Audit Service
Logs all migration lifecycle actions to the immutable audit table.
"""

from typing import Any, Dict, List, Optional
from database.repositories.audit_repo import AuditRepository
from models.audit import AuditEntry, AuditTrailResponse


class AuditService:
    """Orchestrates audit trail creation and queries."""

    def __init__(self, audit_repo_or_db):
        # Auto-wrap if raw DatabaseConnection is passed
        if hasattr(audit_repo_or_db, "log_action"):
            self.audit_repo = audit_repo_or_db
        else:
            self.audit_repo = AuditRepository(audit_repo_or_db)

    async def log_event(
        self,
        action: str,
        plan_id: Optional[str] = None,
        execution_id: Optional[str] = None,
        actor: str = "user",
        details: Optional[Dict[str, Any]] = None,
        record_counts: Optional[Dict[str, int]] = None,
    ) -> int:
        """Record an immutable audit entry."""
        return await self.audit_repo.log_action(
            action=action,
            plan_id=plan_id,
            execution_id=execution_id,
            actor=actor,
            details=details,
            record_counts=record_counts,
        )

    async def get_trail(
        self,
        plan_id: Optional[str] = None,
        limit: int = 100,
    ) -> AuditTrailResponse:
        """Fetch audit trail events."""
        rows = await self.audit_repo.get_trail(plan_id=plan_id, limit=limit)
        entries = [
            AuditEntry(
                id=r["id"],
                execution_id=r.get("execution_id"),
                plan_id=r.get("plan_id"),
                action=r["action"],
                actor=r["actor"],
                details=r.get("details", {}),
                record_counts=r.get("record_counts", {}),
                timestamp=str(r["timestamp"]),
            )
            for r in rows
        ]
        return AuditTrailResponse(
            total=len(entries),
            plan_id=plan_id,
            entries=entries,
        )
