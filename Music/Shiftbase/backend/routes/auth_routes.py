"""
Shiftbase - Authentication Routes
Cookie-based session signup, login, logout, and session verification.
"""

import hashlib
import secrets
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field

logger = logging.getLogger("shiftbase.routes.auth")
router = APIRouter()

SESSION_COOKIE_NAME = "shiftbase_session"
SESSION_DURATION_HOURS = 24


class SignupRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5, max_length=120)
    password: str = Field(..., min_length=6, max_length=128)


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None


def hash_password(password: str) -> str:
    """Simple SHA-256 hash with salt for demo purposes."""
    salt = "shiftbase_2024_salt"
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()


def create_session_id() -> str:
    return secrets.token_urlsafe(48)


@router.post("/signup", response_model=AuthResponse)
async def signup(request: Request, response: Response, payload: SignupRequest):
    """Register a new user account and create a session cookie."""
    db = request.app.state.db

    # Check if username or email already exists
    existing = await db.fetch_one(
        "SELECT id FROM users WHERE username = ? OR email = ?",
        (payload.username, payload.email)
    )
    if existing:
        raise HTTPException(status_code=409, detail="Username or email already registered.")

    # Create user
    user_id = secrets.token_urlsafe(16)
    pw_hash = hash_password(payload.password)
    await db.execute(
        "INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)",
        (user_id, payload.username, payload.email, pw_hash)
    )

    # Create session
    session_id = create_session_id()
    expires = datetime.now(timezone.utc) + timedelta(hours=SESSION_DURATION_HOURS)
    await db.execute(
        "INSERT INTO user_sessions (session_id, user_id, username, expires_at) VALUES (?, ?, ?, ?)",
        (session_id, user_id, payload.username, expires.isoformat())
    )

    # Set cookie
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        httponly=True,
        samesite="none",
        secure=True,
        max_age=SESSION_DURATION_HOURS * 3600,
        path="/",
    )

    logger.info(f"New user registered: {payload.username}")
    return AuthResponse(
        success=True,
        message="Account created successfully.",
        user={"username": payload.username, "email": payload.email}
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: Request, response: Response, payload: LoginRequest):
    """Authenticate user and set session cookie."""
    db = request.app.state.db

    # Find user
    user = await db.fetch_one(
        "SELECT id, username, email, password_hash FROM users WHERE username = ?",
        (payload.username,)
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    # Verify password
    if user["password_hash"] != hash_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    # Clean expired sessions
    await db.execute(
        "DELETE FROM user_sessions WHERE expires_at < ?",
        (datetime.now(timezone.utc).isoformat(),)
    )

    # Create new session
    session_id = create_session_id()
    expires = datetime.now(timezone.utc) + timedelta(hours=SESSION_DURATION_HOURS)
    await db.execute(
        "INSERT INTO user_sessions (session_id, user_id, username, expires_at) VALUES (?, ?, ?, ?)",
        (session_id, user["id"], user["username"], expires.isoformat())
    )

    # Set cookie
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        httponly=True,
        samesite="none",
        secure=True,
        max_age=SESSION_DURATION_HOURS * 3600,
        path="/",
    )

    logger.info(f"User logged in: {payload.username}")
    return AuthResponse(
        success=True,
        message="Login successful.",
        user={"username": user["username"], "email": user["email"]}
    )


@router.post("/logout", response_model=AuthResponse)
async def logout(request: Request, response: Response):
    """Destroy session and clear cookie."""
    db = request.app.state.db
    session_id = request.cookies.get(SESSION_COOKIE_NAME)

    if session_id:
        await db.execute("DELETE FROM user_sessions WHERE session_id = ?", (session_id,))

    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/")
    return AuthResponse(success=True, message="Logged out successfully.")


@router.get("/me", response_model=AuthResponse)
async def check_session(request: Request):
    """Verify if the current session cookie is valid."""
    db = request.app.state.db
    session_id = request.cookies.get(SESSION_COOKIE_NAME)

    if not session_id:
        return AuthResponse(success=False, message="Not authenticated.")

    session = await db.fetch_one(
        "SELECT user_id, username, expires_at FROM user_sessions WHERE session_id = ?",
        (session_id,)
    )

    if not session:
        return AuthResponse(success=False, message="Session expired.")

    # Check expiry
    expires = datetime.fromisoformat(session["expires_at"])
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        await db.execute("DELETE FROM user_sessions WHERE session_id = ?", (session_id,))
        return AuthResponse(success=False, message="Session expired.")

    # Get user details
    user = await db.fetch_one(
        "SELECT username, email FROM users WHERE id = ?",
        (session["user_id"],)
    )

    return AuthResponse(
        success=True,
        message="Authenticated.",
        user={"username": user["username"], "email": user["email"]} if user else None
    )