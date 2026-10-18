import sqlite3
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from app.auth import (
    SESSION_COOKIE,
    SESSION_DAYS,
    create_session,
    current_user,
    hash_password,
    require_csrf,
    verify_password,
)
from app.db import get_db
from app.schemas import Credentials, MeOut, RegisterIn

router = APIRouter(prefix="/api")


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        path="/",
        httponly=True,
        samesite="lax",
    )


@router.post("/register", status_code=201)
def register(
    credentials: RegisterIn,
    response: Response,
    db: Annotated[sqlite3.Connection, Depends(get_db)],
) -> MeOut:
    email = credentials.email.lower()
    user_id = str(uuid.uuid4())
    try:
        db.execute(
            "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
            (user_id, email, hash_password(credentials.password)),
        )
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409, detail="Email already registered"
        ) from None
    token, csrf_token = create_session(db, user_id)
    set_session_cookie(response, token)
    return MeOut(email=email, csrf_token=csrf_token)


@router.post("/login")
def login(
    credentials: Credentials,
    response: Response,
    db: Annotated[sqlite3.Connection, Depends(get_db)],
) -> MeOut:
    email = credentials.email.lower()
    user = db.execute(
        "SELECT id, password_hash FROM users WHERE email = ?", (email,)
    ).fetchone()
    if user is None or not verify_password(user["password_hash"], credentials.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token, csrf_token = create_session(db, user["id"])
    set_session_cookie(response, token)
    return MeOut(email=email, csrf_token=csrf_token)


@router.post("/logout", status_code=204)
def logout(
    request: Request,
    response: Response,
    user: Annotated[sqlite3.Row, Depends(require_csrf)],
    db: Annotated[sqlite3.Connection, Depends(get_db)],
) -> None:
    db.execute(
        "DELETE FROM sessions WHERE token = ?", (request.cookies[SESSION_COOKIE],)
    )
    db.commit()
    response.delete_cookie(SESSION_COOKIE, path="/", httponly=True, samesite="lax")


@router.get("/me")
def me(user: Annotated[sqlite3.Row, Depends(current_user)]) -> MeOut:
    return MeOut(email=user["email"], csrf_token=user["csrf_token"])
