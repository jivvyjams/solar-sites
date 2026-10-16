# Backend stack: what each package is, why it was chosen, how it is used

Audience: you (frontend background, new to Python and backend work). Every entry gives the npm-world
analogy, why this package over the alternatives, where it appears in this project, and the questions an
interviewer is likely to ask about it. Read the linked docs before the phase that first uses the package
(see the concept map in [plan.md](plan.md)).

## 0. Mental model: how the pieces fit

```
browser ──HTTP──▶ uvicorn (server process)
                    └─▶ FastAPI app (routing, dependency injection)
                          ├─▶ Pydantic (validates body / query / cookies from type hints)
                          ├─▶ your path function
                          │     ├─▶ sqlite3 (stdlib) ──▶ SQLite file        (users, sessions, sites)
                          │     ├─▶ argon2-cffi                            (password hashing)
                          │     └─▶ httpx ──HTTP──▶ PVGIS                  (solar data)
                          └─▶ StaticFiles / FileResponse ──▶ built React app (static/)
tests: pytest + FastAPI TestClient (built on httpx)      lint/format: ruff
```

| Frontend / Node world                  | Python / backend world                       |
| -------------------------------------- | -------------------------------------------- |
| `node` (runtime that runs the server)  | `uvicorn` (ASGI server that runs the app)    |
| Express / Next.js route handlers       | FastAPI path operations                      |
| zod                                    | Pydantic (bundled with FastAPI)              |
| `better-sqlite3` (SQL, no ORM)         | `sqlite3` (stdlib, SQL with `?` placeholders)|
| `fetch` / axios                        | httpx                                        |
| `bcrypt` npm package                   | argon2-cffi                                  |
| Vitest / Jest + supertest              | pytest + TestClient                          |
| ESLint + Prettier                      | ruff                                         |
| `package.json` + lockfile              | `requirements.txt` frozen with `pip freeze`  |
| `node_modules/`                        | `.venv/`                                     |
| `npm install <pkg>`                    | `pip install <pkg>` (venv active)            |
| `npx <tool>`                           | activate the venv, then run `<tool>`         |
| `async/await`, Promises                | `async/await`, coroutines (same idea)        |
| TypeScript types                       | type hints (`def f(x: int) -> str`)          |

## 1. Packaging mechanics: venv + pip

- `python -m venv .venv` creates an isolated interpreter plus its own `site-packages` inside
  `backend/.venv`. It is a per-project `node_modules`, except it also isolates the `python` binary.
- `source .venv/bin/activate` puts `.venv/bin` first on `PATH`, so `python`, `pip`, `uvicorn`,
  `pytest` resolve to the project copies. Your prompt shows `(.venv)`. Leave with `deactivate`.
  Every `pip install` and every backend command in this project happens with the venv active.
- `python -m <module>` runs a module as a script (`python -m pytest`, `python -m uvicorn ...`).
  It guarantees the venv copy is used even if your shell PATH is odd.
- `pip install -r requirements.txt` installs what is listed. pip has no automatic lockfile. Two conventions:
  - `pip freeze > requirements.txt` writes every installed package with its exact version, including
    transitive ones. Reproducible: the Docker build next week resolves what passed your tests today.
    **Chosen for this project** (decision 15, changed 14 Oct). Costs: the flat list does not say which
    packages you chose, it captures the whole venv, and removed packages leave orphans behind.
  - A hand-written `requirements.txt` pinning only your direct dependencies (`fastapi==0.1xx.y`).
    Readable, but every transitive package floats inside the range its parent allows.
  - The professional pattern is both layers: a short human list of direct dependencies plus a generated
    lockfile (tools such as pip-tools). Freeze is the lock layer without the human layer; the six runtime
    packages below, documented here and in the README, are the human layer.
- Freeze captures whatever is installed at that moment, so order matters: install only the six runtime
  packages, run `pip freeze > requirements.txt`, and only then install pytest and ruff.
- Split runtime and dev dependencies: `requirements.txt` (frozen; what the Docker image installs) and
  `requirements-dev.txt` (hand-written: first line `-r requirements.txt`, then `pytest` and `ruff` pinned).
  Dev tools' own dependencies may float because they never reach the image.

## 2. Runtime packages (`requirements.txt`)

### fastapi
- **What:** the web framework. Routes are decorated functions; FastAPI reads the type hints of each
  function to validate input, serialise output, inject dependencies and generate OpenAPI docs.
- **Why this one:**
  - Type-hint driven, so TypeScript habits transfer. A signature like
    `def create_site(body: SiteIn, user: User = Depends(current_user))` is validated, typed and
    documented from the hints alone.
  - Interactive docs at `/docs` let you exercise every endpoint before the frontend exists.
  - Plain `def` routes run in a thread pool, so a slow PVGIS call does not block other requests. No
    `async` is used in this project (decision 34).
  - Small surface: less to learn than Django, more structure than Flask.
- **Rejected:** Flask (no built-in validation or typing; you would add two libraries to
  match), Django + DRF (ships its own ORM, auth and URL conventions that fight a fixed API contract;
  too much to learn in five days).
- **Used here:** `app/main.py` creates the app, registers routers, mounts the static frontend;
  `app/routers/*.py` hold the endpoints; `Depends` injects `get_db`, `current_user`, `require_csrf`;
  validation errors use FastAPI's default 422 body (decision 10).
- **Interview angles:** what ASGI is; `def` vs `async def` path functions (a plain `def` runs in a
  thread pool, an `async def` runs on the event loop, so never call blocking I/O inside `async def`);
  what `Depends` does and why it beats middleware for auth; why 422 for validation.
- Docs: https://fastapi.tiangolo.com/tutorial/

### uvicorn[standard]
- **What:** the ASGI server process that binds the port and hands each request to the FastAPI app.
  FastAPI is only the app object; something has to run it, like `node` runs an Express app.
- **Why:** the reference ASGI server and what the FastAPI docs assume. The `[standard]` extra adds
  `uvloop` (faster event loop), `httptools` (faster HTTP parsing) and `watchfiles` (`--reload` in dev).
- **Used here:** dev `uvicorn app.main:app --reload --port 8000`; Docker
  `CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`.
  `app.main:app` means "module `app/main.py`, variable `app`".
- **Interview angles:** why `--host 0.0.0.0` inside a container (bind all interfaces so Docker's port
  mapping reaches it); why one worker is enough (SQLite and the in-memory PVGIS cache assume one
  process).
- Docs: https://uvicorn.org/

### pydantic (installed by fastapi; you import it directly)
- **What:** data validation from type hints. zod for Python. Version 2.
- **Used here:** `app/schemas.py` holds request and response models.
  `model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)` lets Python stay
  snake_case while JSON is camelCase, as the contract demands. `Field(ge=-90, le=90)` for latitude
  and similar constraints. `EmailStr` for the email field (needs the `email` extra, below).
- **Interview angles:** validation runs before your function body; the difference between a Pydantic
  schema (validation, wire shape) and a database row (persistence); why the request model lists only
  the fields a client may set (mass assignment: a client could otherwise set `id` or `user_id`).
- Docs: https://docs.pydantic.dev/latest/

### sqlite3 (standard library, nothing to install)
- **What:** Python's built-in driver for SQLite. You write SQL as strings, pass the values separately,
  and read rows back. `better-sqlite3` for Python.
- **Why raw SQL instead of an ORM (decision 31):** three tables and about a dozen queries do not need a
  mapping layer. Every query is visible, nothing is generated behind your back, there is one dependency
  fewer to defend, and the SQL is exactly what an interviewer can read. The ownership rule is a
  `WHERE user_id = ?` you can point at.
- **Rejected:** SQLModel and SQLAlchemy. They give typed objects and a generated schema, at the price of
  engines, sessions and generated SQL to learn and explain.
- **Costs you accept:** more boilerplate; rows are not objects until you map them (use `sqlite3.Row`
  and build the Pydantic response models by hand); and one string-formatted query would be an injection
  hole, so the rule is absolute: values go through `?` placeholders, never f-strings.
- **Used here:** `app/db.py` opens one connection per request with
  `sqlite3.connect(path, check_same_thread=False)`, sets `row_factory = sqlite3.Row`, runs
  `PRAGMA foreign_keys = ON`, creates the three tables with `CREATE TABLE IF NOT EXISTS` at startup, and
  exposes `get_db()` as a dependency that yields the connection and closes it in a `finally`. Queries
  are plain functions such as `SELECT ... FROM sites WHERE id = ? AND user_id = ?`.
- **Interview angles:** what a parameterised query is and how it stops injection; why every site query
  filters on `user_id` in SQL and not after the fetch; why `check_same_thread=False` is needed (a
  dependency creates the connection and the route uses it, and FastAPI may run those on different pool
  threads, never at the same time); why foreign keys need `PRAGMA foreign_keys = ON` on every
  connection; commit versus rollback; no migration tool because the schema is created at startup and the
  database is ephemeral (state this trade-off in the README).
- Docs: https://docs.python.org/3/library/sqlite3.html

### SQLite (the database itself)
- **Why:** zero extra services, a single file, ideal for "one container, one port".
- **Trade-offs for the README:** single writer; data lives inside the container and disappears with it
  unless a volume is mounted; fine for an advisor tool at this scale.
- **Rejected:** PostgreSQL (a second service; `docker run` of one image must start everything).

### httpx
- **What:** an HTTP client with a `fetch`-like API. Used in its ordinary blocking form here (decision 34).
- **Why over `requests`:** httpx is what FastAPI's `TestClient` is built on, so it is installed anyway;
  one client library instead of two. It has explicit timeouts and a clean `response.json()`.
- **Why not the stdlib `urllib`:** it works, but error handling and JSON decoding take more lines than the
  one call below, and httpx is already present.
- **Used here:** `app/pvgis.py` exposes `fetch_pvcalc(lat, lon, kwp)` and `fetch_hourly(lat, lon, kwp)`,
  each one `httpx.get(url, params=..., timeout=30)`, each raising `HTTPException` directly: 422 when
  PVGIS reports no data for the location, 502 for anything else (decision 35). Both are decorated with
  `@functools.lru_cache` (decision 13).
- **Interview angles:** why every PVGIS call goes through the backend (contract rule, hides the
  upstream, enables caching, keeps the browser same-origin); why timeouts are mandatory; what the app
  does when PVGIS is down; why a blocking call inside a plain `def` route does not stall the server.
- Docs: https://www.python-httpx.org/quickstart/
- Docs: https://www.python-httpx.org/async/

### argon2-cffi
- **What:** password hashing with Argon2id.
- **Why:** Argon2id is the first recommendation in the OWASP password storage cheat sheet; it is
  memory-hard (GPU-resistant); the library picks sane parameters and encodes them in the hash string
  so you can tune later without a migration. `argon2-cffi` is the maintained Python binding.
- **Rejected:** bcrypt (acceptable, but its common wrapper `passlib` is unmaintained and breaks with
  bcrypt 4.1 or newer, a known trap); `hashlib` SHA-256 (fast hashes are the wrong tool for passwords);
  plaintext (never).
- **Used here:** `app/auth.py` creates `ph = PasswordHasher()`; register stores `ph.hash(password)`;
  login calls `ph.verify(user.password_hash, password)` and catches `VerifyMismatchError`. Login
  returns the same 401 message whether the email is unknown or the password is wrong.
- **Interview angles:** hashing versus encryption; where the salt lives (argon2 generates it and
  stores it inside the hash string); why the same error for both failures (no user enumeration);
  cost parameters and why hashing is deliberately slow.
- Docs: https://argon2-cffi.readthedocs.io/en/stable/

### pydantic[email]
- **What:** installs `email-validator` so `EmailStr` works. Syntax check only, no DNS lookup.
- **Alternative:** a hand-written check (contains one `@`, lowercase, length at most 254). Either is
  defensible; `EmailStr` is one word and is what reviewers expect to see.

## 3. Standard library you will use (nothing to install)

| Module / function                    | Used for                                                            |
| ------------------------------------ | ------------------------------------------------------------------- |
| `secrets.token_urlsafe(32)`          | session token and CSRF token (cryptographically random, URL-safe)   |
| `hmac.compare_digest(a, b)`          | constant-time comparison of the CSRF header with the stored token   |
| `datetime`, `UTC`                    | session `created_at` (expiry is `created_at` + 7 days); always timezone-aware |
| `pathlib.Path`                       | locating `static/index.html` relative to the module                  |
| `os.environ.get`                     | optional config (database path) with defaults so Docker needs no env |
| `logging`                            | log PVGIS failures; never log passwords, hashes or tokens            |
| `contextlib.asynccontextmanager`     | the FastAPI lifespan hook that creates tables at startup             |

## 4. Dev-only packages (`requirements-dev.txt`)

### pytest
- **What:** the test runner. A test is any `test_*` function in `tests/test_*.py`; plain `assert` is
  the assertion API; `@pytest.fixture` replaces `beforeEach` and setup helpers.
- **Used here:** `tests/conftest.py` builds a fresh temporary SQLite file per test and overrides `get_db` via
  `app.dependency_overrides`; `TestClient(app)` sends requests. Minimal set (decision 18): register,
  login and me; user B gets 404 on user A's site; a POST without the CSRF header is 403; `energy.py`
  battery maths on a hand-made 24-hour series; PVGIS 422 with a monkeypatched `fetch_pvcalc`. Claude
  gives extra help with the setup and may show project-specific test snippets in chat (decision 33).
- **Interview angles:** why each test gets its own temporary SQLite file (isolated, and an in-memory database would be empty for every new connection); what a dependency override
  is; why the energy maths is a pure function (testable without the network).
- Docs: https://docs.pytest.org/en/stable/ and https://fastapi.tiangolo.com/tutorial/testing/

### ruff
- **What:** linter and formatter in one binary (ESLint plus Prettier). `ruff check .` and
  `ruff format .`. Zero config needed.

## 5. Deliberately not used (likely interview questions)

- **async/await:** every route is a plain `def`. All routes touch `sqlite3`, which blocks, and FastAPI's
  thread pool already keeps a slow PVGIS call from stalling other requests, so async would add a trap
  (blocking inside `async def` freezes the server) with no benefit (decision 34).
- **JWT:** a signed token cannot be revoked on logout without a denylist; an opaque token in a
  `sessions` table makes logout a `DELETE`. Simpler to explain, safer here.
- **CORS middleware:** not needed. Dev uses Vite's proxy, production serves the SPA from the same
  origin. Fewer headers, smaller attack surface.
- **Alembic (migrations):** the schema is created with `CREATE TABLE IF NOT EXISTS` at startup;
  there is no persistent data to migrate.
- **python-dotenv / pydantic-settings:** no secrets exist (PVGIS needs no key, sessions are database
  rows); there is no configuration at all, the database path is a constant (decision 36).
- **Frontend extras (chart library, TanStack Query, react-hook-form):** all fine, all skipped so that
  every line stays explainable and the dependency list stays short.
