"""
Shiftbase - Plan Manager Unit Tests
Tests plan creation, version bumping on modifications, approval gate, and version lineage.
"""

import pytest
from database.connection import DatabaseConnection
from database.migrations import run_migrations
from database.repositories.plan_repo import PlanRepository
from models.plan import FieldMapping
from models.schema import FieldDefinition, SchemaDefinition
from services.plan_manager import PlanManager


@pytest.fixture
async def plan_manager_fixture(tmp_path):
    db_file = tmp_path / "test_plans.db"
    db = DatabaseConnection(str(db_file))
    await db.connect()
    await run_migrations(db)
    repo = PlanRepository(db)
    manager = PlanManager(repo)
    yield manager
    await db.disconnect()


@pytest.mark.asyncio
async def test_plan_lifecycle_and_versioning(plan_manager_fixture):
    manager = plan_manager_fixture

    source_schema = SchemaDefinition(
        name="source_v1",
        fields=[FieldDefinition(name="user_id", type="integer"), FieldDefinition(name="name", type="string")],
    )
    target_schema = SchemaDefinition(
        name="target_v2",
        fields=[FieldDefinition(name="id", type="integer"), FieldDefinition(name="full_name", type="string")],
    )

    # 1. Initialize Plan
    plan_id = "test-plan-uuid-1"
    initial_plan = await manager.create_initial_plan(
        plan_id=plan_id,
        source_schema=source_schema,
        target_schema=target_schema,
    )
    assert initial_plan.id == plan_id
    assert initial_plan.version == 1
    assert initial_plan.status == "proposed"

    # 2. Update Draft Mappings
    mappings_v1 = [
        FieldMapping(target_field="id", source_field="user_id", transformation="direct_copy"),
        FieldMapping(target_field="full_name", source_field="name", transformation="direct_copy"),
    ]
    updated_plan = await manager.update_mappings(plan_id, mappings_v1)
    assert updated_plan.version == 1
    assert len(updated_plan.field_mappings) == 2

    # 3. Approve Plan
    approved_plan = await manager.approve_plan(plan_id, approved_by="senior_engineer")
    assert approved_plan.status == "approved"
    assert approved_plan.approved_by == "senior_engineer"

    # 4. Modifying an approved plan must create a child version (v2)
    mappings_v2 = [
        FieldMapping(target_field="id", source_field="user_id", transformation="direct_copy"),
        FieldMapping(target_field="full_name", source_field="name", transformation="uppercase"),
    ]
    v2_plan = await manager.update_mappings(plan_id, mappings_v2)
    assert v2_plan.version == 2
    assert v2_plan.parent_version_id == plan_id
    assert v2_plan.status == "proposed"

    # 5. History lookup
    history = await manager.get_history(v2_plan.id)
    assert len(history) == 2
    assert history[0].id == v2_plan.id
    assert history[1].id == plan_id