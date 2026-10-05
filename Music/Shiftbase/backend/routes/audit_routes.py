"""
Shiftbase - Audit Routes
Queries the immutable chronological log of actions, reviews, and executions.
"""

from typing import Optional
from fastapi import APIRouter, Query, Request
from database.repositories.audit_repo import AuditRepository
from models.audit import AuditTrailResponse
from services.audit_service import AuditService

router = APIRouter()


@router.get("", response_model=AuditTrailResponse)
async def get_global_audit_trail(
    request: Request,
    plan_id: Optional[str] = Query(default=None),
    limit: int = Query(default=100, le=500),
):
    """Retrieves full audit log, optionally filtered by plan ID."""
    service = AuditService(AuditRepository(request.app.state.db))
    return await service.get_trail(plan_id=plan_id, limit=limit)


@router.get("/{plan_id}", response_model=AuditTrailResponse)
async def get_plan_audit_trail(
    request: Request,
    plan_id: str,
    limit: int = Query(default=100, le=500),
):
    """Retrieves complete chronological audit history for a specific plan."""
    service = AuditService(AuditRepository(request.app.state.db))
    return await service.get_trail(plan_id=plan_id, limit=limit)