"""
Shiftbase - Migration Execution Engine
Orchestrates Dry-Run simulations, live executions, deduplication checks, and rollbacks.
"""

import time
from typing import Any, Dict, List, Optional
from uuid import uuid4

from database.repositories.execution_repo import ExecutionRepository
from database.repositories.quarantine_repo import QuarantineRepository
from database.repositories.source_repo import SourceRepository
from database.repositories.target_repo import TargetRepository
from models.execution import (
    CountVerification,
    DryRunQuarantineItem,
    DryRunResult,
    DryRunSuccessItem,
    ExecutionResult,
    RecordError,
    RollbackResult,
)
from services.audit_service import AuditService
from services.plan_manager import PlanManager
from services.transformation_engine import TransformationEngine
from services.validator import RecordValidator


class DuplicateExecutionError(Exception):
    """Raised when attempting to execute an already completed plan run without versioning."""
    pass


class UnapprovedPlanError(Exception):
    """Raised when execution is attempted on a non-approved plan."""
    pass


class MigrationEngine:
    """Core deterministic orchestrator for schema migration workflows."""

    def __init__(
        self,
        plan_manager: PlanManager,
        source_repo: SourceRepository,
        target_repo: TargetRepository,
        quarantine_repo: QuarantineRepository,
        execution_repo: ExecutionRepository,
        transformation_engine: TransformationEngine,
        validator: RecordValidator,
        audit_service: AuditService,
    ):
        self.plan_manager = plan_manager
        self.source_repo = source_repo
        self.target_repo = target_repo
        self.quarantine_repo = quarantine_repo
        self.execution_repo = execution_repo
        self.transform_engine = transformation_engine
        self.validator = validator
        self.audit = audit_service

    async def dry_run(self, plan_id: str) -> DryRunResult:
        """
        Simulates migration completely in memory without altering mock_target or quarantine.
        Returns transformed previews and failure breakdowns.
        """
        start_time = time.perf_counter()
        plan = await self.plan_manager.get_plan(plan_id)
        if not plan:
            raise ValueError(f"Plan '{plan_id}' not found.")

        execution_id = str(uuid4())
        source_records = await self.source_repo.get_records_by_plan(plan_id, limit=1000)

        success_items: List[DryRunSuccessItem] = []
        quarantine_items: List[DryRunQuarantineItem] = []

        for item in source_records:
            src_data = item["data"]
            # 1. Transform
            target_data, transform_errors = self.transform_engine.apply_mapping(
                src_data, plan.field_mappings
            )

            # 2. Validate
            if transform_errors:
                quarantine_items.append(
                    DryRunQuarantineItem(
                        source=src_data,
                        transformed_partial=target_data,
                        errors=transform_errors,
                    )
                )
            else:
                val_errors = self.validator.validate_record(target_data, plan.target_schema)
                if val_errors:
                    quarantine_items.append(
                        DryRunQuarantineItem(
                            source=src_data,
                            transformed_partial=target_data,
                            errors=val_errors,
                        )
                    )
                else:
                    success_items.append(
                        DryRunSuccessItem(source=src_data, target=target_data)
                    )

        total_src = len(source_records)
        total_tgt = len(success_items)
        total_quarantine = len(quarantine_items)
        balanced = total_src == (total_tgt + total_quarantine)

        counts = {
            "source": total_src,
            "target": total_tgt,
            "quarantined": total_quarantine,
        }
        verification = CountVerification(
            source_records=total_src,
            target_migrated=total_tgt,
            quarantined=total_quarantine,
            balanced=balanced,
        )

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        # Log audit entry
        await self.audit.log_event(
            action="dry_run",
            plan_id=plan_id,
            execution_id=execution_id,
            details={"time_ms": round(elapsed_ms, 2), "sample_preview_count": min(len(success_items), 5)},
            record_counts=counts,
        )

        return DryRunResult(
            execution_id=execution_id,
            plan_id=plan_id,
            status="completed",
            success_records=success_items[:25],
            quarantine_records=quarantine_items[:25],
            counts=counts,
            verification=verification,
            execution_time_ms=round(elapsed_ms, 2),
        )

    async def execute(self, plan_id: str, actor: str = "user") -> ExecutionResult:
        """
        Executes live migration to mock_target and quarantine tables.
        Guarded by human approval requirement and deduplication checks.
        """
        plan = await self.plan_manager.get_plan(plan_id)
        if not plan:
            raise ValueError(f"Plan '{plan_id}' not found.")

        # Guard 1: Human Approval Gate
        if plan.status != "approved":
            raise UnapprovedPlanError(
                f"Plan '{plan_id}' is in status '{plan.status}'. "
                "Human approval is required before live execution."
            )

        # Guard 2: Deduplication Check
        existing_runs = await self.execution_repo.get_active_or_completed_live_runs(plan_id)
        if existing_runs:
            raise DuplicateExecutionError(
                f"Plan '{plan_id}' was already executed in run '{existing_runs[0]['id']}'. "
                "Rollback the existing run or create a new plan version before retrying."
            )

        execution_id = str(uuid4())
        await self.execution_repo.create_run(
            run_id=execution_id,
            plan_id=plan_id,
            run_type="live",
            status="running",
        )

        source_records = await self.source_repo.get_records_by_plan(plan_id, limit=10000)
        target_inserts: List[Dict[str, Any]] = []
        quarantine_inserts: List[Dict[str, Any]] = []

        for item in source_records:
            s_id = item["id"]
            src_data = item["data"]

            # Transform
            target_data, transform_errors = self.transform_engine.apply_mapping(
                src_data, plan.field_mappings
            )

            # Validate
            if transform_errors:
                quarantine_inserts.append({
                    "source_record_id": s_id,
                    "source_data": src_data,
                    "error_details": [e.model_dump() for e in transform_errors],
                })
            else:
                val_errors = self.validator.validate_record(target_data, plan.target_schema)
                if val_errors:
                    quarantine_inserts.append({
                        "source_record_id": s_id,
                        "source_data": src_data,
                        "error_details": [e.model_dump() for e in val_errors],
                    })
                else:
                    target_inserts.append({
                        "source_record_id": s_id,
                        "data": target_data,
                    })

        # Batch write
        if target_inserts:
            await self.target_repo.insert_bulk(plan_id, execution_id, target_inserts)
        if quarantine_inserts:
            await self.quarantine_repo.insert_bulk(plan_id, execution_id, quarantine_inserts)

        total_src = len(source_records)
        total_tgt = len(target_inserts)
        total_quarantine = len(quarantine_inserts)
        balanced = total_src == (total_tgt + total_quarantine)

        counts = {
            "source": total_src,
            "target": total_tgt,
            "quarantined": total_quarantine,
        }

        # Complete run in repository
        await self.execution_repo.complete_run(
            run_id=execution_id,
            status="completed",
            source_count=total_src,
            target_count=total_tgt,
            quarantine_count=total_quarantine,
        )

        # Update plan status to executed
        await self.plan_manager.plan_repo.update_status(plan_id, "executed")

        # Audit log
        await self.audit.log_event(
            action="execute",
            plan_id=plan_id,
            execution_id=execution_id,
            actor=actor,
            details={"status": "completed"},
            record_counts=counts,
        )

        return ExecutionResult(
            execution_id=execution_id,
            plan_id=plan_id,
            status="completed",
            counts=counts,
            verification=CountVerification(
                source_records=total_src,
                target_migrated=total_tgt,
                quarantined=total_quarantine,
                balanced=balanced,
            ),
            message=f"Migration completed. {total_tgt} records written, {total_quarantine} quarantined.",
        )

    async def rollback(
        self,
        plan_id: str,
        execution_id: Optional[str] = None,
        actor: str = "user",
    ) -> RollbackResult:
        """
        Reverses a live migration execution, removing records from mock_target & quarantine.
        """
        plan = await self.plan_manager.get_plan(plan_id)
        if not plan:
            raise ValueError(f"Plan '{plan_id}' not found.")

        runs = await self.execution_repo.get_by_plan(plan_id)
        completed_runs = [r for r in runs if r["run_type"] == "live" and r["status"] == "completed"]
        
        if not completed_runs:
            raise ValueError(f"No completed live executions found for plan '{plan_id}' to rollback.")

        target_exec_id = execution_id or completed_runs[0]["id"]

        del_target = await self.target_repo.delete_by_execution(target_exec_id)
        del_quarantine = await self.quarantine_repo.delete_by_execution(target_exec_id)

        await self.plan_manager.plan_repo.update_status(plan_id, "rolled_back")

        # Record rollback in runs
        rollback_run_id = str(uuid4())
        await self.execution_repo.create_run(
            run_id=rollback_run_id,
            plan_id=plan_id,
            run_type="rollback",
            status="completed",
        )

        await self.audit.log_event(
            action="rollback",
            plan_id=plan_id,
            execution_id=target_exec_id,
            actor=actor,
            details={
                "target_records_purged": del_target,
                "quarantine_records_purged": del_quarantine,
            },
        )

        return RollbackResult(
            plan_id=plan_id,
            execution_id=target_exec_id,
            status="rolled_back",
            deleted_target_records=del_target,
            deleted_quarantine_records=del_quarantine,
            message=f"Rollback successful. Removed {del_target} target rows and {del_quarantine} quarantine rows.",
        )