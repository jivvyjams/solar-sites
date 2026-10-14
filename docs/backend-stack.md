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
                          │     ├─▶ SQLModel / SQLAlchemy ──▶ SQLite file   (users, sessions, sites)
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
| Prisma (schema + typed client)         | SQLModel (SQLAlchemy + Pydantic in one class)|
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
  - Async-native: waiting several seconds on PVGIS does not block other requests.
  - Small surface: less to learn than Django, more structure than Flask.
- **Rejected:** Flask (no built-in validation, typing or async; you would add three libraries to
  match), Django + DRF (ships its own ORM, auth and URL conventions that fight a fixed API contract;
  too much to learn in five days).
- **Used here:** `app/main.py` creates the app, registers routers, mounts the static frontend;
  `app/routers/*.py` hold the endpoints; `Depends` injects `get_db`, `current_user`, `require_csrf`;
  a custom exception handler turns validation errors into per-field messages.
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
  schema (validation, wire shape) and a SQLModel table (persistence); why you never accept the table
  model as the request body (mass assignment: a client could set `id` or `user_id`).
- Docs: https://docs.pydantic.dev/latest/

### sqlmodel
- **What:** the ORM. One class is both a Pydantic model and a SQLAlchemy table. Written by the
  FastAPI author; SQLAlchemy 2.x underneath.
- **Why:** the least code to explain for a three-table app, and nothing is hidden when you need
  `select(...).where(...)`, sessions, relationships or `create_all`, because those are plain SQLAlchemy.
- **Rejected:** stdlib `sqlite3` with hand-written SQL (works, but you hand-roll parameter binding and
  row mapping, which is more surface for injection mistakes), plain SQLAlchemy (same engine, more
  boilerplate: separate declarative classes and Pydantic schemas), Django ORM (needs Django).
- **Used here:** `app/models.py` defines `User`, `Session`, `Site` with `table=True`; `app/db.py`
  creates the engine and the `get_db` dependency that yields a session per request; routers run
  queries such as `select(Site).where(Site.user_id == user.id)`.
- **Interview angles:** what an ORM does and the SQL it emits (`echo=True` prints it); why every site
  query filters on `user_id` in SQL instead of checking after the fetch; the SQLite
  `check_same_thread=False` flag and why FastAPI's thread pool needs it; no migration tool because
  the schema is created at startup and the database is ephemeral (state this trade-off in the README).
- Docs: https://sqlmodel.tiangolo.com/

### SQLite (no package: Python's stdlib `sqlite3` driver, used through SQLAlchemy)
- **Why:** zero extra services, a single file, ideal for "one container, one port".
- **Trade-offs for the README:** single writer; data lives inside the container and disappears with it
  unless a volume is mounted; fine for an advisor tool at this scale.
- **Rejected:** PostgreSQL (a second service; `docker run` of one image must start everything).

### httpx
- **What:** an HTTP client with the same API in sync and async form. `fetch` for Python.
- **Why over `requests`:** `requests` is sync only; calling it inside `async def` blocks the event
  loop. httpx has `AsyncClient`, explicit timeouts, and is what FastAPI's `TestClient` is built on,
  so it is installed anyway.
- **Used here:** `app/pvgis.py` keeps one `AsyncClient` with `timeout=30`, exposes
  `fetch_pvcalc(lat, lon, kwp)` and `fetch_hourly(lat, lon, kwp)`, and maps PVGIS failures to your own
  exception type (no data for location, upstream error, timeout) so the router can pick 422, 502 or 504.
- **Interview angles:** why every PVGIS call goes through the backend (contract rule, hides the
  upstream, enables caching, keeps the browser same-origin); why timeouts are mandatory; what the app
  does when PVGIS is down.
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
| `datetime`, `timezone.utc`           | session `created_at` / `expires_at`; always timezone-aware           |
| `pathlib.Path`                       | locating `static/index.html` relative to the module                  |
| `os.environ.get`                     | optional config (database path) with defaults so Docker needs no env |
| `logging`                            | log PVGIS failures; never log passwords, hashes or tokens            |
| `contextlib.asynccontextmanager`     | the FastAPI lifespan hook that creates tables at startup             |

## 4. Dev-only packages (`requirements-dev.txt`)

### pytest
- **What:** the test runner. A test is any `test_*` function in `tests/test_*.py`; plain `assert` is
  the assertion API; `@pytest.fixture` replaces `beforeEach` and setup helpers.
- **Used here:** `tests/conftest.py` builds a fresh in-memory SQLite engine and overrides `get_db` via
  `app.dependency_overrides`; `TestClient(app)` sends requests. Planned tests: register / login /
  logout / me; user B cannot read user A's site (404); validation errors are per field; missing CSRF
  header is 403; `energy.py` battery maths on a hand-made 24-hour series; PVGIS error mapping with a
  monkeypatched `fetch_pvcalc`.
- **Interview angles:** why tests run on in-memory SQLite (fast, isolated); what a dependency override
  is; why the energy maths is a pure function (testable without the network).
- Docs: https://docs.pytest.org/en/stable/ and https://fastapi.tiangolo.com/tutorial/testing/

### ruff
- **What:** linter and formatter in one binary (ESLint plus Prettier). `ruff check .` and
  `ruff format .`. Zero config needed.

## 5. Deliberately not used (likely interview questions)

- **JWT:** a signed token cannot be revoked on logout without a denylist; an opaque token in a
  `sessions` table makes logout a `DELETE`. Simpler to explain, safer here.
- **CORS middleware:** not needed. Dev uses Vite's proxy, production serves the SPA from the same
  origin. Fewer headers, smaller attack surface.
- **Alembic (migrations):** the schema is created with `SQLModel.metadata.create_all` at startup;
  there is no persistent data to migrate.
- **python-dotenv / pydantic-settings:** no secrets exist (PVGIS needs no key, sessions are database
  rows); two `os.environ.get` calls with defaults are enough.
- **Frontend extras (chart library, TanStack Query, react-hook-form):** all fine, all skipped so that
  every line stays explainable and the dependency list stays short.
