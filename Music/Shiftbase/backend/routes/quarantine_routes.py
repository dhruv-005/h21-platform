"""
Shiftbase - Quarantine Routes
Inspect records that failed transformation or schema constraints.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Query, Request
from database.repositories.quarantine_repo import QuarantineRepository

router = APIRouter()


@router.get("/{plan_id}", response_model=List[Dict[str, Any]])
async def get_quarantined_records_for_plan(
    request: Request,
    plan_id: str,
    limit: int = Query(default=100, le=500),
):
    """Fetches quarantined records with their error reasons for a given plan."""
    repo = QuarantineRepository(request.app.state.db)
    return await repo.get_by_plan(plan_id=plan_id, limit=limit)


@router.get("/execution/{execution_id}", response_model=List[Dict[str, Any]])
async def get_quarantined_records_for_execution(
    request: Request,
    execution_id: str,
    plan_id: Optional[str] = None,
    limit: int = Query(default=100, le=500),
):
    """Fetches quarantined records isolated during a specific execution run."""
    repo = QuarantineRepository(request.app.state.db)
    return await repo.get_by_plan(
        plan_id=plan_id or "",
        execution_id=execution_id,
        limit=limit,
    )