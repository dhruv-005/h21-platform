"""
Shiftbase - Schema Routes
Handles schema validation, sample dataset uploads, and initial migration workspace creation.
"""

import logging
from typing import Any, Dict
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request
from database.repositories.audit_repo import AuditRepository
from database.repositories.plan_repo import PlanRepository
from database.repositories.source_repo import SourceRepository
from models.schema import (
    InitMigrationRequest,
    InitMigrationResponse,
    SchemaValidationResponse,
)
from services.audit_service import AuditService
from services.plan_manager import PlanManager
from services.validator import RecordValidator

logger = logging.getLogger("shiftbase.routes.schema")
router = APIRouter()


@router.post("/validate", response_model=SchemaValidationResponse)
async def validate_schema_definition(schema: Dict[str, Any]):
    """
    Validates a schema definition for structural integrity, required properties,
    and field naming collisions.
    """
    validator = RecordValidator()
    result = validator.validate_schema(schema)
    return SchemaValidationResponse(
        valid=result["valid"],
        field_count=result["field_count"],
        errors=result["errors"],
        warnings=result["warnings"],
    )


@router.post("/init", response_model=InitMigrationResponse)
async def initialize_migration_workspace(
    request: Request,
    payload: InitMigrationRequest,
):
    """
    Initializes a new migration workspace:
    1. Validates source and target schemas.
    2. Generates a unique Plan UUID.
    3. Persists initial draft plan into database.
    4. Stages uploaded source sample records.
    5. Logs initialization event in audit trail.
    """
    db = request.app.state.db
    plan_repo = PlanRepository(db)
    source_repo = SourceRepository(db)
    audit_repo = AuditRepository(db)
    plan_manager = PlanManager(plan_repo)
    audit_service = AuditService(audit_repo)

    # 1. Validate Schemas
    validator = RecordValidator()
    src_val = validator.validate_schema(payload.source_schema.model_dump())
    if not src_val["valid"]:
        raise HTTPException(
            status_code=400,
            detail=f"Source schema invalid: {', '.join(src_val['errors'])}",
        )

    tgt_val = validator.validate_schema(payload.target_schema.model_dump())
    if not tgt_val["valid"]:
        raise HTTPException(
            status_code=400,
            detail=f"Target schema invalid: {', '.join(tgt_val['errors'])}",
        )

    # 2. Create Plan Record
    plan_id = str(uuid4())
    await plan_manager.create_initial_plan(
        plan_id=plan_id,
        source_schema=payload.source_schema,
        target_schema=payload.target_schema,
    )

    # 3. Stage Source Sample Records
    staged_count = 0
    if payload.sample_records:
        staged_count = await source_repo.insert_records(
            plan_id=plan_id,
            records=payload.sample_records,
        )

    # 4. Audit Log
    await audit_service.log_event(
        action="init",
        plan_id=plan_id,
        details={
            "source_schema_name": payload.source_schema.name,
            "target_schema_name": payload.target_schema.name,
            "records_staged": staged_count,
        },
        record_counts={"source": staged_count, "target": 0, "quarantined": 0},
    )

    return InitMigrationResponse(
        plan_id=plan_id,
        version=1,
        status="proposed",
        source_records_staged=staged_count,
        message="Migration workspace initialized successfully.",
    )
