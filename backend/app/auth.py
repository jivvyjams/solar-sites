import hmac
import secrets
import sqlite3
from datetime import UTC, datetime, timedelta
from typing import Annotated

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Depends, Header, HTTPException, Request

from app.db import get_db

SESSION_COOKIE = "session"
SESSION_DAYS = 7

hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return hasher.verify(password_hash, password)
    except VerifyMismatchError:
        return False


def create_session(db: sqlite3.Connection, user_id: str) -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    csrf_token = secrets.token_urlsafe(32)
    created_at = datetime.now(UTC).isoformat()
    db.execute(
        "INSERT INTO sessions (token, csrf_token, user_id, created_at) VALUES (?, ?, ?, ?)",
        (token, csrf_token, user_id, created_at),
    )
    db.commit()
    return token, csrf_token


def current_user(
    request: Request, db: Annotated[sqlite3.Connection, Depends(get_db)]
) -> sqlite3.Row:
    token = request.cookies.get(SESSION_COOKIE)
    if token is None:
        raise HTTPException(status_code=401, detail="Not logged in")
    row = db.execute(
        "SELECT users.id, users.email, sessions.csrf_token, sessions.created_at "
        "FROM sessions JOIN users ON users.id = sessions.user_id "
        "WHERE sessions.token = ?",
        (token,),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=401, detail="Not logged in")
    age = datetime.now(UTC) - datetime.fromisoformat(row["created_at"])
    if age > timedelta(days=SESSION_DAYS):
        raise HTTPException(status_code=401, detail="Not logged in")
    return row


def require_csrf(
    user: Annotated[sqlite3.Row, Depends(current_user)],
    x_csrf_token: Annotated[str | None, Header()] = None,
) -> sqlite3.Row:
    if x_csrf_token is None or not hmac.compare_digest(
        x_csrf_token.encode(), user["csrf_token"].encode()
    ):
        raise HTTPException(status_code=403, detail="Invalid CSRF token")
    return user
