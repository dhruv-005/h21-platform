"""
Shiftbase - Execution Models
Defines contracts for Dry-Run previews, live migration runs, rollback requests, and audit counts.
"""

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, ConfigDict


ExecutionStatus = Literal["running", "completed", "failed", "rolled_back"]
RunType = Literal["dry_run", "live", "rollback"]


class RecordError(BaseModel):
    """Detailed error explanation for a single field transformation or validation failure."""

    model_config = ConfigDict(extra="allow")

    field: str = Field(..., description="Target or source field name where error occurred")
    source_field: Optional[str] = Field(default=None, description="Source field name if applicable")
    error: str = Field(..., description="Error message or validation failure reason")
    source_value: Optional[Any] = Field(default=None, description="Offending raw input value")


class DryRunSuccessItem(BaseModel):
    """Pair of original source and cleanly transformed target data."""

    source: Dict[str, Any] = Field(..., description="Raw source record")
    target: Dict[str, Any] = Field(..., description="Simulated transformed target record")


class DryRunQuarantineItem(BaseModel):
    """Record that would be diverted into quarantine during execution."""

    source: Dict[str, Any] = Field(..., description="Raw source record")
    transformed_partial: Optional[Dict[str, Any]] = Field(
        default=None, description="Partial transformation before failure"
    )
    errors: List[RecordError] = Field(..., description="All errors triggered by this record")


class CountVerification(BaseModel):
    """Mathematical verification confirming no data was lost or duplicated."""

    source_records: int = Field(..., description="Total input source records")
    target_migrated: int = Field(..., description="Records successfully written to target")
    quarantined: int = Field(..., description="Records isolated in quarantine")
    balanced: bool = Field(
        ..., description="True if source_records == target_migrated + quarantined"
    )


class DryRunResult(BaseModel):
    """Full preview result returned by deterministic simulation."""

    execution_id: str = Field(..., description="Unique simulation execution UUID")
    plan_id: str = Field(..., description="Migration plan UUID")
    status: Literal["completed", "failed"] = "completed"
    success_records: List[DryRunSuccessItem] = Field(
        default_factory=list, description="Sample of successfully mapped records"
    )
    quarantine_records: List[DryRunQuarantineItem] = Field(
        default_factory=list, description="Records that would fail"
    )
    counts: Dict[str, int] = Field(
        ..., description="Totals: {'source': N, 'target': N, 'quarantined': N}"
    )
    verification: CountVerification = Field(..., description="Count balance integrity")
    execution_time_ms: float = Field(..., description="Time taken to simulate in milliseconds")


class ExecutionResult(BaseModel):
    """Summary of live execution written to mock_target and quarantine."""

    execution_id: str = Field(..., description="Execution UUID")
    plan_id: str = Field(..., description="Migration plan UUID")
    status: ExecutionStatus = Field(..., description="Final status of run")
    counts: Dict[str, int] = Field(..., description="Record tallies")
    verification: CountVerification = Field(..., description="Integrity check")
    message: str = Field(..., description="Human readable summary")


class RollbackRequest(BaseModel):
    """Request payload to reverse a previous live execution."""

    execution_id: Optional[str] = Field(
        default=None, description="Specific execution ID to revert (defaults to latest)"
    )
    reason: Optional[str] = Field(default=None, description="Reason for initiating rollback")


class RollbackResult(BaseModel):
    """Result returned after completing a rollback."""

    plan_id: str = Field(..., description="Plan UUID")
    execution_id: str = Field(..., description="Reverted execution UUID")
    status: Literal["rolled_back"] = "rolled_back"
    deleted_target_records: int = Field(..., description="Count of rows purged from target")
    deleted_quarantine_records: int = Field(
        ..., description="Count of quarantine entries purged"
    )
    message: str = Field(..., description="Summary confirmation")