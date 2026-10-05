"""
Shiftbase - Migration Plan Manager
Coordinates plan creation, revisioning, approval gating, and history retrieval.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

from database.repositories.plan_repo import PlanRepository
from models.plan import FieldMapping, MigrationPlanModel, PlanProposalResponse
from models.schema import SchemaDefinition


class PlanManager:
    """Handles lifecycle and immutability rules for Migration Plans."""

    def __init__(self, plan_repo: PlanRepository):
        self.plan_repo = plan_repo

    async def create_initial_plan(
        self,
        plan_id: str,
        source_schema: SchemaDefinition,
        target_schema: SchemaDefinition,
        proposal: Optional[PlanProposalResponse] = None,
    ) -> MigrationPlanModel:
        """Saves a newly initialized or proposed migration plan."""
        mappings_dict = [m.model_dump() for m in proposal.mappings] if proposal else []
        warnings = proposal.warnings if proposal else []

        saved = await self.plan_repo.create_plan(
            plan_id=plan_id,
            source_schema=source_schema.model_dump(),
            target_schema=target_schema.model_dump(),
            field_mappings=mappings_dict,
            transformations=[],
            ai_warnings=warnings,
            version=1,
            status="proposed",
        )
        return self._to_model(saved)

    async def update_mappings(
        self,
        plan_id: str,
        new_mappings: List[FieldMapping],
    ) -> MigrationPlanModel:
        """
        Updates mappings on a plan. If the plan was already approved, creates a new version.
        """
        existing = await self.plan_repo.get_plan_by_id(plan_id)
        if not existing:
            raise ValueError(f"Plan '{plan_id}' not found.")

        mappings_dict = [m.model_dump() for m in new_mappings]

        if existing["status"] == "proposed":
            await self.plan_repo.update_mappings(plan_id, mappings_dict, [])
            updated = await self.plan_repo.get_plan_by_id(plan_id)
            return self._to_model(updated)
        else:
            # Create a new version linked to the parent
            new_version_id = str(uuid4())
            new_version_number = existing["version"] + 1
            saved = await self.plan_repo.create_plan(
                plan_id=new_version_id,
                source_schema=existing["source_schema"],
                target_schema=existing["target_schema"],
                field_mappings=mappings_dict,
                transformations=[],
                ai_warnings=existing["ai_warnings"],
                version=new_version_number,
                parent_version_id=plan_id,
                status="proposed",
            )
            return self._to_model(saved)

    async def approve_plan(self, plan_id: str, approved_by: str = "user") -> MigrationPlanModel:
        """Promotes plan to 'approved' status. Only approved plans can be executed."""
        existing = await self.plan_repo.get_plan_by_id(plan_id)
        if not existing:
            raise ValueError(f"Plan '{plan_id}' not found.")

        if not existing["field_mappings"]:
            raise ValueError("Cannot approve a plan without field mappings.")

        await self.plan_repo.update_status(plan_id, "approved", approved_by=approved_by)
        updated = await self.plan_repo.get_plan_by_id(plan_id)
        return self._to_model(updated)

    async def get_plan(self, plan_id: str) -> Optional[MigrationPlanModel]:
        """Fetch plan by ID."""
        row = await self.plan_repo.get_plan_by_id(plan_id)
        return self._to_model(row) if row else None

    async def get_history(self, plan_id: str) -> List[MigrationPlanModel]:
        """Fetch version history chain for a plan."""
        rows = await self.plan_repo.get_plan_history(plan_id)
        return [self._to_model(r) for r in rows]

    def _to_model(self, data: Dict[str, Any]) -> MigrationPlanModel:
        return MigrationPlanModel(
            id=data["id"],
            version=data["version"],
            source_schema=SchemaDefinition(**data["source_schema"]),
            target_schema=SchemaDefinition(**data["target_schema"]),
            field_mappings=[FieldMapping(**m) for m in data["field_mappings"]],
            transformations=data.get("transformations", []),
            ai_warnings=data.get("ai_warnings", []),
            status=data["status"],
            created_at=str(data.get("created_at")),
            approved_at=str(data.get("approved_at")) if data.get("approved_at") else None,
            approved_by=data.get("approved_by"),
            parent_version_id=data.get("parent_version_id"),
        )