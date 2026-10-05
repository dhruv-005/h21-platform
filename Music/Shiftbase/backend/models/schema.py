"""
Shiftbase - Schema Models
Defines schema blueprints, field definitions, and initialization request/response contracts.
"""

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, ConfigDict


FieldType = Literal[
    "string",
    "integer",
    "float",
    "boolean",
    "date",
    "datetime",
    "json",
    "array",
]


class FieldDefinition(BaseModel):
    """Definition of a single column/attribute within a schema."""

    model_config = ConfigDict(extra="allow")

    name: str = Field(..., description="Field/column identifier")
    type: FieldType = Field(..., description="Data type of the field")
    nullable: bool = Field(default=True, description="Whether null values are permitted")
    primary_key: bool = Field(default=False, description="Whether this is the primary key")
    default: Optional[Any] = Field(default=None, description="Default fallback value")
    max_length: Optional[int] = Field(default=None, description="Maximum string character length")
    allowed_values: Optional[List[Any]] = Field(default=None, description="Permitted enum values")
    format: Optional[str] = Field(default=None, description="Format specifier (e.g. ISO8601, MM/DD/YYYY)")
    description: Optional[str] = Field(default=None, description="Human-readable field description")


class SchemaDefinition(BaseModel):
    """Complete blueprint of a database table or API schema."""

    model_config = ConfigDict(extra="allow")

    name: str = Field(..., min_length=1, max_length=128, description="Schema/table name")
    version: Optional[str] = Field(default="1.0", description="Schema version identifier")
    description: Optional[str] = Field(default=None, description="Schema purpose description")
    fields: List[FieldDefinition] = Field(
        ..., min_length=1, description="List of fields contained in this schema"
    )

    def get_field(self, field_name: str) -> Optional[FieldDefinition]:
        """Look up a field definition by its name."""
        for f in self.fields:
            if f.name == field_name:
                return f
        return None

    def get_required_field_names(self) -> List[str]:
        """Return names of all non-nullable fields without default values."""
        return [f.name for f in self.fields if not f.nullable and f.default is None]


class InitMigrationRequest(BaseModel):
    """Payload to initialize a new migration workspace."""

    source_schema: SchemaDefinition = Field(..., description="Blueprint of the source data")
    target_schema: SchemaDefinition = Field(..., description="Blueprint of desired target data")
    sample_records: List[Dict[str, Any]] = Field(
        default=[], description="Sample records matching source schema"
    )
    supported_rules: Optional[List[str]] = Field(
        default=None, description="Allowed transformation rules"
    )


class InitMigrationResponse(BaseModel):
    """Response returned upon successfully initializing a migration."""

    plan_id: str = Field(..., description="Unique UUID identifier for the migration workspace")
    version: int = Field(default=1, description="Plan version")
    status: str = Field(default="proposed", description="Current status of the plan")
    source_records_staged: int = Field(..., description="Total source records uploaded and staged")
    message: str = Field(..., description="Status message")


class SchemaValidationResponse(BaseModel):
    """Result of validating a standalone schema definition."""

    valid: bool = Field(..., description="Whether the schema passed structural validation")
    field_count: int = Field(..., description="Total fields recognized")
    errors: List[str] = Field(default=[], description="Validation errors encountered")
    warnings: List[str] = Field(default=[], description="Potential design issues flagged")