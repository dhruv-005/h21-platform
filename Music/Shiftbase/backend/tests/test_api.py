"""
Shiftbase - End-to-End API Integration Tests
Tests full HTTP lifecycle: init -> propose -> approve -> dry-run -> execute -> verify -> rollback -> audit.
"""

import pytest
from httpx import ASGITransport, AsyncClient
from main import app


@pytest.mark.asyncio
async def test_full_migration_api_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:

        # 1. Health Check
        health_resp = await client.get("/api/health")
        assert health_resp.status_code == 200
        assert health_resp.json()["status"] == "healthy"

        # 2. Initialize Migration Workspace
        init_payload = {
            "source_schema": {
                "name": "users_v1",
                "fields": [
                    {"name": "user_id", "type": "integer", "nullable": False},
                    {"name": "full_name", "type": "string", "nullable": False},
                    {"name": "signup_date", "type": "string", "nullable": True},
                ],
            },
            "target_schema": {
                "name": "users_v2",
                "fields": [
                    {"name": "id", "type": "integer", "nullable": False},
                    {"name": "first_name", "type": "string", "nullable": False},
                    {"name": "last_name", "type": "string", "nullable": False},
                    {"name": "created_at", "type": "string", "nullable": False},
                ],
            },
            "sample_records": [
                {"user_id": 1, "full_name": "Jane Doe", "signup_date": "03/15/2023"},
                {"user_id": 2, "full_name": "John Smith", "signup_date": "07/22/2022"},
            ],
        }

        init_resp = await client.post("/api/schemas/init", json=init_payload)
        assert init_resp.status_code == 200
        plan_id = init_resp.json()["plan_id"]
        assert init_resp.json()["source_records_staged"] == 2

        # 3. Generate AI Mapping Proposal (Heuristic fallback kicks in automatically in test)
        propose_resp = await client.post(f"/api/plans/{plan_id}/propose")
        assert propose_resp.status_code == 200
        assert len(propose_resp.json()["mappings"]) >= 3

        # 4. Approve Plan
        approve_resp = await client.post(f"/api/plans/{plan_id}/approve", json={"approved_by": "lead_architect"})
        assert approve_resp.status_code == 200
        assert approve_resp.json()["status"] == "approved"

        # 5. Dry-Run Simulation
        dry_run_resp = await client.post(f"/api/migration/{plan_id}/dry-run")
        assert dry_run_resp.status_code == 200
        assert dry_run_resp.json()["counts"]["source"] == 2

        # 6. Live Execution
        exec_resp = await client.post(f"/api/migration/{plan_id}/execute")
        assert exec_resp.status_code == 200
        assert exec_resp.json()["status"] == "completed"

        # 7. Count Verification
        verify_resp = await client.get(f"/api/migration/{plan_id}/verify")
        assert verify_resp.status_code == 200
        assert verify_resp.json()["balanced"] is True

        # 8. Rollback
        rollback_resp = await client.post(f"/api/migration/{plan_id}/rollback")
        assert rollback_resp.status_code == 200
        assert rollback_resp.json()["status"] == "rolled_back"

        # 9. Audit Trail
        audit_resp = await client.get(f"/api/audit/{plan_id}")
        assert audit_resp.status_code == 200
        assert audit_resp.json()["total"] >= 5