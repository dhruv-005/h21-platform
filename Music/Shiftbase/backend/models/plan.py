"""
Shiftbase - Migration Plan Models
Defines AI proposals, field transformations, user modifications, and plan approval contracts.
"""

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, ConfigDict
from models.schema import SchemaDefinition


TransformationType = Literal[
    "split_string",
    "concat_fields",
    "format_date",
    "uppercase",
    "lowercase",
    "trim",
    "to_integer",
    "to_float",
    "to_string",
    "default_value",
    "truncate",
    "direct_copy",
]

PlanStatus = Literal[
    "proposed",
    "approved",
    "executed",
    "rolled_back",
    "failed",
]

RiskLevel = Literal["low", "medium", "high"]


class TransformationConfig(BaseModel):
    """Configuration parameter set for a specific transformation rule."""

    model_config = ConfigDict(extra="allow")

    rule: TransformationType = Field(..., description="Transformation rule to execute")
    params: Dict[str, Any] = Field(
        default_factory=dict, description="Rule-specific parameters (e.g., delimiter, index)"
    )


class FieldMapping(BaseModel):
    """Mapping rule connecting source field(s) to a single target field."""

    model_config = ConfigDict(extra="allow")

    target_field: str = Field(..., description="Destination field name in target schema")
    source_field: Optional[str] = Field(
        default=None, description="Primary source field name (null if generated/default)"
    )
    source_fields: Optional[List[str]] = Field(
        default=None, description="Multiple source fields if rule is concat_fields"
    )
    transformation: TransformationType = Field(
        default="direct_copy", description="Transformation rule to apply"
    )
    transformation_params: Dict[str, Any] = Field(
        default_factory=dict, description="Parameters supplied to the transformation"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Confidence score from AI suggestion (0.0 to 1.0)"
    )
    risk_notes: Optional[str] = Field(
        default=None, description="Explanation of edge-case risks or potential data loss"
    )


class MigrationPlanModel(BaseModel):
    """Complete versioned entity representing a Migration Plan."""

    id: str = Field(..., description="UUID identifier")
    version: int = Field(default=1, description="Version iteration number")
    source_schema: SchemaDefinition = Field(..., description="Source schema blueprint")
    target_schema: SchemaDefinition = Field(..., description="Target schema blueprint")
    field_mappings: List[FieldMapping] = Field(
        ..., description="List of approved or proposed mappings"
    )
    transformations: List[Dict[str, Any]] = Field(
        default_factory=list, description="Raw transformation list"
    )
    ai_warnings: List[str] = Field(
        default_factory=list, description="AI-flagged risks and unmapped notes"
    )
    status: PlanStatus = Field(default="proposed", description="Lifecycle status")
    created_at: Optional[str] = Field(default=None, description="Creation ISO timestamp")
    approved_at: Optional[str] = Field(default=None, description="Approval ISO timestamp")
    approved_by: Optional[str] = Field(default=None, description="Actor who approved the plan")
    parent_version_id: Optional[str] = Field(
        default=None, description="UUID of previous version if modified"
    )


class PlanProposalResponse(BaseModel):
    """Payload produced by AI Agent and delivered to the frontend."""

    plan_id: str = Field(..., description="Plan ID the proposal belongs to")
    version: int = Field(..., description="Plan version")
    mappings: List[FieldMapping] = Field(..., description="AI-proposed field mappings")
    unmapped_source_fields: List[str] = Field(
        default_factory=list, description="Source fields not present in target"
    )
    unmapped_target_fields: List[str] = Field(
        default_factory=list, description="Target fields missing a source match"
    )
    warnings: List[str] = Field(
        default_factory=list, description="Data loss and truncation warnings"
    )
    overall_risk: RiskLevel = Field(
        default="medium", description="Aggregate risk assessment"
    )


class PlanUpdateRequest(BaseModel):
    """User request to modify mappings, producing a new plan version."""

    field_mappings: List[FieldMapping] = Field(
        ..., min_length=1, description="Edited field mappings"
    )


class PlanApproveRequest(BaseModel):
    """Explicit human sign-off request before migration execution is unlocked."""

    approved_by: str = Field(default="user", description="Name or ID of reviewer")
    notes: Optional[str] = Field(default=None, description="Optional sign-off notes")


class PlanApproveResponse(BaseModel):
    """Response returned upon approving a plan."""

    plan_id: str = Field(..., description="Plan identifier")
    status: PlanStatus = Field(default="approved")
    approved_at: str = Field(..., description="Approval timestamp")
    approved_by: str = Field(...)
    message: str = Field(...)