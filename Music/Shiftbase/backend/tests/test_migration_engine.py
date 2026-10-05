"""
Shiftbase - Migration Execution Engine Tests
Tests deterministic dry-runs, live execution, quarantine routing, deduplication, and rollbacks.
"""

import pytest
from database.connection import DatabaseConnection
from database.migrations import run_migrations
from database.repositories.audit_repo import AuditRepository
from database.repositories.execution_repo import ExecutionRepository
from database.repositories.plan_repo import PlanRepository
from database.repositories.quarantine_repo import QuarantineRepository
from database.repositories.source_repo import SourceRepository
from database.repositories.target_repo import TargetRepository
from models.plan import FieldMapping
from models.schema import FieldDefinition, SchemaDefinition
from services.audit_service import AuditService
from services.migration_engine import (
    DuplicateExecutionError,
    MigrationEngine,
    UnapprovedPlanError,
)
from services.plan_manager import PlanManager
from services.transformation_engine import TransformationEngine
from services.validator import RecordValidator


@pytest.fixture
async def setup_engine(tmp_path):
    db_file = tmp_path / "test_engine.db"
    db = DatabaseConnection(str(db_file))
    await db.connect()
    await run_migrations(db)

    plan_repo = PlanRepository(db)
    source_repo = SourceRepository(db)
    target_repo = TargetRepository(db)
    quarantine_repo = QuarantineRepository(db)
    execution_repo = ExecutionRepository(db)
    audit_repo = AuditRepository(db)

    engine = MigrationEngine(
        plan_manager=PlanManager(plan_repo),
        source_repo=source_repo,
        target_repo=target_repo,
        quarantine_repo=quarantine_repo,
        execution_repo=execution_repo,
        transformation_engine=TransformationEngine(),
        validator=RecordValidator(),
        audit_service=AuditService(audit_repo),
    )

    yield engine, plan_repo, source_repo, target_repo, quarantine_repo
    await db.disconnect()


@pytest.mark.asyncio
async def test_migration_execution_and_rollback(setup_engine):
    engine, plan_repo, source_repo, target_repo, quarantine_repo = setup_engine

    # 1. Setup schemas and plan
    plan_id = "test-plan-exec-1"
    src_schema = SchemaDefinition(
        name="legacy_users",
        fields=[
            FieldDefinition(name="user_id", type="integer", nullable=False),
            FieldDefinition(name="full_name", type="string", nullable=False),
        ],
    )
    tgt_schema = SchemaDefinition(
        name="modern_users",
        fields=[
            FieldDefinition(name="id", type="integer", nullable=False),
            FieldDefinition(name="first_name", type="string", nullable=False),
            FieldDefinition(name="last_name", type="string", nullable=False),
        ],
    )
    mappings = [
        FieldMapping(target_field="id", source_field="user_id", transformation="direct_copy"),
        FieldMapping(target_field="first_name", source_field="full_name", transformation="split_string", transformation_params={"delimiter": " ", "index": 0}),
        FieldMapping(target_field="last_name", source_field="full_name", transformation="split_string", transformation_params={"delimiter": " ", "index": 1}),
    ]

    await plan_repo.create_plan(
        plan_id=plan_id,
        source_schema=src_schema.model_dump(),
        target_schema=tgt_schema.model_dump(),
        field_mappings=[m.model_dump() for m in mappings],
        transformations=[],
        status="proposed",
    )

    # 2. Stage 3 source records: 2 valid, 1 broken (single name -> quarantine)
    sample_records = [
        {"user_id": 1, "full_name": "Alan Turing"},
        {"user_id": 2, "full_name": "Grace Hopper"},
        {"user_id": 3, "full_name": "Plato"},  # Will fail last_name split
    ]
    await source_repo.insert_records(plan_id, sample_records)

    # 3. Guard test: Execution without approval must raise UnapprovedPlanError
    with pytest.raises(UnapprovedPlanError):
        await engine.execute(plan_id)

    # 4. Dry-Run simulation test
    dry_run_res = await engine.dry_run(plan_id)
    assert dry_run_res.counts["source"] == 3
    assert dry_run_res.counts["target"] == 2
    assert dry_run_res.counts["quarantined"] == 1
    assert dry_run_res.verification.balanced is True

    # 5. Approve plan and execute live
    await plan_repo.update_status(plan_id, "approved")
    exec_res = await engine.execute(plan_id)
    assert exec_res.status == "completed"
    assert exec_res.counts["target"] == 2
    assert exec_res.counts["quarantined"] == 1

    # 6. Guard test: Duplicate execution must fail
    with pytest.raises(DuplicateExecutionError):
        await engine.execute(plan_id)

    # 7. Rollback test
    rollback_res = await engine.rollback(plan_id)
    assert rollback_res.status == "rolled_back"
    assert rollback_res.deleted_target_records == 2
    assert rollback_res.deleted_quarantine_records == 1