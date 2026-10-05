"""
Shiftbase - Migration Execution Routes
Endpoints for executing Dry-Run simulations, live migrations, rollbacks, and record inspection.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query, Request
from database.repositories.audit_repo import AuditRepository
from database.repositories.execution_repo import ExecutionRepository
from database.repositories.plan_repo import PlanRepository
from database.repositories.quarantine_repo import QuarantineRepository
from database.repositories.source_repo import SourceRepository
from database.repositories.target_repo import TargetRepository
from models.execution import (
    CountVerification,
    DryRunResult,
    ExecutionResult,
    RollbackRequest,
    RollbackResult,
)
from services.audit_service import AuditService
from services.migration_engine import (
    DuplicateExecutionError,
    MigrationEngine,
    UnapprovedPlanError,
)
from services.plan_manager import PlanManager
from services.transformation_engine import TransformationEngine
from services.validator import RecordValidator

logger = logging.getLogger("shiftbase.routes.execution")
router = APIRouter()


def _build_engine(db) -> MigrationEngine:
    """Helper to assemble MigrationEngine with all repository dependencies."""
    plan_repo = PlanRepository(db)
    source_repo = SourceRepository(db)
    target_repo = TargetRepository(db)
    quarantine_repo = QuarantineRepository(db)
    execution_repo = ExecutionRepository(db)
    audit_repo = AuditRepository(db)

    return MigrationEngine(
        plan_manager=PlanManager(plan_repo),
        source_repo=source_repo,
        target_repo=target_repo,
        quarantine_repo=quarantine_repo,
        execution_repo=execution_repo,
        transformation_engine=TransformationEngine(),
        validator=RecordValidator(),
        audit_service=AuditService(audit_repo),
    )


@router.post("/{plan_id}/dry-run", response_model=DryRunResult)
async def simulate_dry_run(request: Request, plan_id: str):
    """
    Executes a deterministic simulation without modifying the database.
    Returns preview pairs and potential quarantine records.
    """
    engine = _build_engine(request.app.state.db)
    try:
        return await engine.dry_run(plan_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Dry run error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Dry run failed: {str(e)}")


@router.post("/{plan_id}/execute", response_model=ExecutionResult)
async def execute_live_migration(
    request: Request,
    plan_id: str,
    actor: str = Query(default="user"),
):
    """
    Executes live migration of staged records to mock_target and quarantine tables.
    Requires prior human approval and enforces deduplication.
    """
    engine = _build_engine(request.app.state.db)
    try:
        return await engine.execute(plan_id=plan_id, actor=actor)
    except UnapprovedPlanError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except DuplicateExecutionError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Execution error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")


@router.post("/{plan_id}/rollback", response_model=RollbackResult)
async def rollback_migration(
    request: Request,
    plan_id: str,
    payload: Optional[RollbackRequest] = None,
    actor: str = Query(default="user"),
):
    """
    Instantly undos a live migration, purging rows created in mock_target and quarantine.
    """
    engine = _build_engine(request.app.state.db)
    exec_id = payload.execution_id if payload else None
    try:
        return await engine.rollback(plan_id=plan_id, execution_id=exec_id, actor=actor)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Rollback error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Rollback failed: {str(e)}")


@router.get("/{plan_id}/target", response_model=List[Dict[str, Any]])
async def view_target_records(
    request: Request,
    plan_id: str,
    execution_id: Optional[str] = None,
    limit: int = Query(default=100, le=500),
):
    """Retrieves migrated rows from the mock target storage."""
    target_repo = TargetRepository(request.app.state.db)
    return await target_repo.get_by_plan(plan_id=plan_id, execution_id=execution_id, limit=limit)


@router.get("/{plan_id}/verify", response_model=CountVerification)
async def verify_migration_counts(
    request: Request,
    plan_id: str,
    execution_id: Optional[str] = None,
):
    """
    Verifies data integrity: source_count == target_count + quarantine_count.
    """
    db = request.app.state.db
    source_repo = SourceRepository(db)
    target_repo = TargetRepository(db)
    quarantine_repo = QuarantineRepository(db)

    src_cnt = await source_repo.count_by_plan(plan_id)
    if execution_id:
        tgt_cnt = await target_repo.count_by_execution(plan_id, execution_id)
        q_cnt = await quarantine_repo.count_by_execution(plan_id, execution_id)
    else:
        all_targets = await target_repo.get_by_plan(plan_id, limit=100000)
        all_q = await quarantine_repo.get_by_plan(plan_id, limit=100000)
        tgt_cnt = len(all_targets)
        q_cnt = len(all_q)

    return CountVerification(
        source_records=src_cnt,
        target_migrated=tgt_cnt,
        quarantined=q_cnt,
        balanced=src_cnt == (tgt_cnt + q_cnt),
    )