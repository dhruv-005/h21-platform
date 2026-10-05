"""
Shiftbase - Migration Plan Routes
Handles AI mapping proposals, user plan revisions, plan approval, and version history.
"""

import logging
from typing import List

from fastapi import APIRouter, HTTPException, Request
from config import settings
from database.repositories.audit_repo import AuditRepository
from database.repositories.plan_repo import PlanRepository
from database.repositories.source_repo import SourceRepository
from models.plan import (
    MigrationPlanModel,
    PlanApproveRequest,
    PlanApproveResponse,
    PlanProposalResponse,
    PlanUpdateRequest,
)
from services.ai_agent import AIAgent, GeminiProvider, OllamaProvider
from services.audit_service import AuditService
from services.plan_manager import PlanManager

logger = logging.getLogger("shiftbase.routes.plan")
router = APIRouter()


def _get_ai_agent() -> AIAgent:
    """Instantiates the configured AI provider with heuristic fallback."""
    provider = None
    if settings.ai_provider == "gemini" and settings.gemini_api_key:
        provider = GeminiProvider(api_key=settings.gemini_api_key)
    elif settings.ai_provider == "ollama":
        provider = OllamaProvider(
            base_url=settings.ollama_base_url,
            model=settings.ollama_model,
        )
    return AIAgent(provider=provider)


@router.get("/{plan_id}", response_model=MigrationPlanModel)
async def get_migration_plan(request: Request, plan_id: str):
    """Fetches details and current status of a specific migration plan."""
    plan_repo = PlanRepository(request.app.state.db)
    plan_manager = PlanManager(plan_repo)
    plan = await plan_manager.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan '{plan_id}' not found.")
    return plan


@router.post("/{plan_id}/propose", response_model=PlanProposalResponse)
async def generate_ai_mapping_proposal(request: Request, plan_id: str):
    """
    Invokes the AI Agent to inspect source/target schemas and sample records,
    producing a complete, structured mapping proposal.
    """
    db = request.app.state.db
    plan_repo = PlanRepository(db)
    source_repo = SourceRepository(db)
    plan_manager = PlanManager(plan_repo)
    audit_service = AuditService(AuditRepository(db))

    plan = await plan_manager.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan '{plan_id}' not found.")

    # Retrieve staged sample records
    source_records = await source_repo.get_records_by_plan(plan_id, limit=20)
    samples = [r["data"] for r in source_records]

    # Generate proposal via AI agent
    agent = _get_ai_agent()
    proposal = await agent.propose_migration_plan(
        plan_id=plan_id,
        version=plan.version,
        source_schema=plan.source_schema,
        target_schema=plan.target_schema,
        sample_records=samples,
        supported_rules=settings.supported_transformations,
    )

    # Save proposed mappings into plan record
    await plan_repo.update_mappings(
        plan_id=plan_id,
        field_mappings=[m.model_dump() for m in proposal.mappings],
        transformations=[],
    )

    # Log proposal generation
    await audit_service.log_event(
        action="propose",
        plan_id=plan_id,
        details={
            "mappings_count": len(proposal.mappings),
            "unmapped_sources": proposal.unmapped_source_fields,
            "unmapped_targets": proposal.unmapped_target_fields,
            "overall_risk": proposal.overall_risk,
        },
    )

    return proposal


@router.put("/{plan_id}", response_model=MigrationPlanModel)
async def update_migration_plan_mappings(
    request: Request,
    plan_id: str,
    payload: PlanUpdateRequest,
):
    """
    Allows human developers to adjust or override mappings.
    If the plan was already approved, creates a new child version.
    """
    plan_repo = PlanRepository(request.app.state.db)
    plan_manager = PlanManager(plan_repo)
    audit_service = AuditService(AuditRepository(request.app.state.db))

    try:
        updated_plan = await plan_manager.update_mappings(
            plan_id=plan_id,
            new_mappings=payload.field_mappings,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    await audit_service.log_event(
        action="update_plan",
        plan_id=updated_plan.id,
        details={
            "version": updated_plan.version,
            "mappings_count": len(payload.field_mappings),
        },
    )

    return updated_plan


@router.post("/{plan_id}/approve", response_model=PlanApproveResponse)
async def approve_migration_plan(
    request: Request,
    plan_id: str,
    payload: PlanApproveRequest,
):
    """
    Human Approval Gate: Explicit human sign-off unlocking dry-runs and execution.
    """
    plan_repo = PlanRepository(request.app.state.db)
    plan_manager = PlanManager(plan_repo)
    audit_service = AuditService(AuditRepository(request.app.state.db))

    try:
        approved_plan = await plan_manager.approve_plan(
            plan_id=plan_id,
            approved_by=payload.approved_by,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    await audit_service.log_event(
        action="approve",
        plan_id=plan_id,
        actor=payload.approved_by,
        details={"notes": payload.notes},
    )

    return PlanApproveResponse(
        plan_id=approved_plan.id,
        status="approved",
        approved_at=approved_plan.approved_at or "",
        approved_by=approved_plan.approved_by or payload.approved_by,
        message="Plan approved successfully. Live execution and dry runs are unlocked.",
    )


@router.get("/{plan_id}/history", response_model=List[MigrationPlanModel])
async def get_plan_version_history(request: Request, plan_id: str):
    """Retrieves full version lineage tree for a plan."""
    plan_repo = PlanRepository(request.app.state.db)
    plan_manager = PlanManager(plan_repo)
    return await plan_manager.get_history(plan_id)