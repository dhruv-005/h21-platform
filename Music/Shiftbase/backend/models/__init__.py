"""
Shiftbase - Models Package
Exports all Pydantic schemas for data validation and API serialization.
"""

from models.schema import (
    FieldDefinition,
    SchemaDefinition,
    InitMigrationRequest,
    InitMigrationResponse,
    SchemaValidationResponse,
)
from models.plan import (
    FieldMapping,
    TransformationConfig,
    MigrationPlanModel,
    PlanProposalResponse,
    PlanUpdateRequest,
    PlanApproveRequest,
    PlanApproveResponse,
)
from models.execution import (
    RecordError,
    DryRunResult,
    ExecutionResult,
    RollbackRequest,
    RollbackResult,
    CountVerification,
    ExecutionStatus,
)
from models.audit import (
    AuditEntry,
    AuditTrailResponse,
)

__all__ = [
    # Schema models
    "FieldDefinition",
    "SchemaDefinition",
    "InitMigrationRequest",
    "InitMigrationResponse",
    "SchemaValidationResponse",
    # Plan models
    "FieldMapping",
    "TransformationConfig",
    "MigrationPlanModel",
    "PlanProposalResponse",
    "PlanUpdateRequest",
    "PlanApproveRequest",
    "PlanApproveResponse",
    # Execution models
    "RecordError",
    "DryRunResult",
    "ExecutionResult",
    "RollbackRequest",
    "RollbackResult",
    "CountVerification",
    "ExecutionStatus",
    # Audit models
    "AuditEntry",
    "AuditTrailResponse",
]