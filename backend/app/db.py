import sqlite3
from collections.abc import Iterator
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "solar.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    csrf_token TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL
)
CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    client_name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    roof_area_m2 REAL,
    peak_kwp REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS sites_user_id ON sites (user_id);
"""


def connect(path: Path = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db(path: Path = DB_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = connect(path)
    conn.executescript(SCHEMA)
    conn.close()


def get_db() -> Iterator[sqlite3.Connection]:
    conn = connect()
    try:
        yield conn
    finally:
        conn.close()
