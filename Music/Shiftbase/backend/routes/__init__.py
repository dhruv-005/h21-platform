"""
Shiftbase - Routes Package
FastAPI endpoint routers for schemas, migration plans, execution runs, quarantine, and audit.
"""

from routes.schema_routes import router as schema_router
from routes.plan_routes import router as plan_router
from routes.execution_routes import router as execution_router
from routes.quarantine_routes import router as quarantine_router
from routes.audit_routes import router as audit_router

__all__ = [
    "schema_router",
    "plan_router",
    "execution_router",
    "quarantine_router",
    "audit_router",
]