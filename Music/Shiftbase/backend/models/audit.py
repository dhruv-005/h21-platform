"""
Shiftbase - Audit Models
Defines immutable audit log entries, event payload wrappers, and trail queries.
"""

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


AuditAction = Literal[
    "init",
    "propose",
    "update_plan",
    "approve",
    "dry_run",
    "execute",
    "rollback",
    "retry",
]


class AuditEntry(BaseModel):
    """A single immutable chronological audit event."""

    id: int = Field(..., description="Auto-incremented audit log ID")
    execution_id: Optional[str] = Field(default=None, description="Associated execution ID")
    plan_id: Optional[str] = Field(default=None, description="Associated migration plan ID")
    action: AuditAction = Field(..., description="Action performed")
    actor: str = Field(default="user", description="User, service, or agent that acted")
    details: Dict[str, Any] = Field(
        default_factory=dict, description="Granular metadata and change details"
    )
    record_counts: Dict[str, int] = Field(
        default_factory=dict, description="Record counts at time of action"
    )
    timestamp: str = Field(..., description="ISO creation timestamp")


class AuditTrailResponse(BaseModel):
    """Paginated or complete audit trail response."""

    total: int = Field(..., description="Total audit events recorded")
    plan_id: Optional[str] = Field(default=None, description="Filter applied")
    entries: List[AuditEntry] = Field(..., description="Chronological log entries")