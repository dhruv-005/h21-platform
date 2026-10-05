"""
Shiftbase - FastAPI Application Entry Point
"""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from database.connection import DatabaseConnection
from database.migrations import run_migrations

from routes.schema_routes import router as schema_router
from routes.plan_routes import router as plan_router
from routes.execution_routes import router as execution_router
from routes.quarantine_routes import router as quarantine_router
from routes.audit_routes import router as audit_router
from routes.auth_routes import router as auth_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logging.getLogger("aiosqlite").setLevel(logging.WARNING)
logger = logging.getLogger("shiftbase")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 50)
    logger.info("  SHIFTBASE - Engine Starting")
    logger.info("=" * 50)

    db_path = Path(settings.db_absolute_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    db = DatabaseConnection(settings.db_absolute_path)
    await db.connect()
    await run_migrations(db)

    app.state.db = db
    logger.info(f"Database connected: {settings.db_absolute_path}")
    logger.info(f"AI Provider: {settings.ai_provider}")
    logger.info("Shiftbase is ready.")

    yield

    logger.info("Shiftbase shutting down...")
    await db.disconnect()
    logger.info("Database closed.")


app = FastAPI(
    title="Shiftbase API",
    description="Bounded Schema Migration Assistant",
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ============================================================
# CORS CONFIGURATION
# CRITICAL: Do NOT use allow_origins=["*"] with credentials.
# Use allow_origin_regex to dynamically match Vercel + localhost.
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc) if settings.debug else "An unexpected error occurred.",
            "path": str(request.url.path),
        },
    )


app.include_router(schema_router, prefix="/api/schemas", tags=["Schemas"])
app.include_router(plan_router, prefix="/api/plans", tags=["Migration Plans"])
app.include_router(execution_router, prefix="/api/migration", tags=["Execution"])
app.include_router(quarantine_router, prefix="/api/quarantine", tags=["Quarantine"])
app.include_router(audit_router, prefix="/api/audit", tags=["Audit Trail"])
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])


@app.get("/api/health", tags=["System"])
async def health_check():
    db = app.state.db
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "database": "connected" if db.is_connected else "disconnected",
        "ai_provider": settings.ai_provider,
        "debug": settings.debug,
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "message": "Welcome to Shiftbase",
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/api/health",
    }
