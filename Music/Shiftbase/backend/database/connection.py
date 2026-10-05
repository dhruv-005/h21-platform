"""
Shiftbase - Asynchronous Database Connection
Manages the aiosqlite connection lifecycle, transactions, and queries.
"""

import aiosqlite
import logging
from typing import Any, Dict, List, Optional
from pathlib import Path

logger = logging.getLogger("shiftbase.database")


class DatabaseConnection:
    """Manages asynchronous SQLite database connections and query executions."""

    def __init__(self, db_path: str):
        self.db_path = db_path
        self._connection: Optional[aiosqlite.Connection] = None

    @property
    def is_connected(self) -> bool:
        """Check if connection is open."""
        return self._connection is not None

    async def connect(self) -> None:
        """Establish async SQLite connection with foreign keys enabled."""
        if self._connection is None:
            # Ensure folder exists
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
            self._connection = await aiosqlite.connect(self.db_path)
            self._connection.row_factory = aiosqlite.Row
            # Enable WAL mode and foreign key constraints
            await self._connection.execute("PRAGMA journal_mode=WAL;")
            await self._connection.execute("PRAGMA foreign_keys=ON;")
            await self._connection.commit()
            logger.info(f"Connected to SQLite database: {self.db_path}")

    async def disconnect(self) -> None:
        """Close database connection."""
        if self._connection is not None:
            await self._connection.close()
            self._connection = None
            logger.info("SQLite database connection closed.")

    async def execute(self, query: str, params: Optional[tuple] = None) -> aiosqlite.Cursor:
        """Execute a single query with optional parameters."""
        if self._connection is None:
            raise RuntimeError("Database is not connected. Call connect() first.")
        params = params or ()
        cursor = await self._connection.execute(query, params)
        await self._connection.commit()
        return cursor

    async def execute_many(self, query: str, params_seq: List[tuple]) -> aiosqlite.Cursor:
        """Execute batch operations with executemany."""
        if self._connection is None:
            raise RuntimeError("Database is not connected. Call connect() first.")
        cursor = await self._connection.executemany(query, params_seq)
        await self._connection.commit()
        return cursor

    async def fetch_one(self, query: str, params: Optional[tuple] = None) -> Optional[Dict[str, Any]]:
        """Fetch a single record as a dictionary."""
        if self._connection is None:
            raise RuntimeError("Database is not connected. Call connect() first.")
        params = params or ()
        async with self._connection.execute(query, params) as cursor:
            row = await cursor.fetchone()
            if row is not None:
                return dict(row)
            return None

    async def fetch_all(self, query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """Fetch all matching records as a list of dictionaries."""
        if self._connection is None:
            raise RuntimeError("Database is not connected. Call connect() first.")
        params = params or ()
        async with self._connection.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def execute_script(self, script: str) -> None:
        """Execute a raw SQL multi-statement script."""
        if self._connection is None:
            raise RuntimeError("Database is not connected. Call connect() first.")
        await self._connection.executescript(script)
        await self._connection.commit()