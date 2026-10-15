# Solar Sites: build plan

- **Deadline:** Monday 19 October 2026 at 12:00. Today is Wednesday 14 October 2026.
  Working time: Wed evening, Thu, Fri, Sat, Sun (eight to ten hours a day with breaks); Monday morning is buffer only.
- **Authority:** [projet-brief.md](projet-brief.md) is the spec. This plan is how to satisfy it in time.
- **Rules of engagement:** [CLAUDE.md](../CLAUDE.md). Stack rationale: [backend-stack.md](backend-stack.md).
  Git: [git-workflow.md](git-workflow.md). Python syntax: [python-for-js-devs.md](python-for-js-devs.md).
- **Principle:** vertical slices. Each phase ends with something that runs end to end in Docker, has
  tests, and is merged to `main`. If time runs out, whatever is merged is the hand-in.

## 0. Definition of done

**Must (hand-in blockers)**

- [ ] `docker build -t solar .` then `docker run -p 8000:8000 solar` serves the app on http://localhost:8000 from a clean clone.
- [ ] All eleven contract routes exist with the exact paths, camelCase field names, and the status codes in §3.2.
- [ ] Register, login, logout, me work. Passwords hashed with Argon2id. Session cookie is HttpOnly + SameSite=Lax. CSRF header enforced on every POST/PUT/DELETE that has a session.
- [ ] Sites CRUD is scoped to the caller. Another user's site id returns 404.
- [ ] POST/PUT /api/sites return a message per invalid field.
- [ ] Production endpoint maps PVGIS PVcalc. Sea / no data gives a clear 422. Any other PVGIS failure, including a timeout, gives 502.
- [ ] Battery endpoint runs an hourly simulation with the consumption model documented in the README.
- [ ] Backend tests cover auth flow, ownership isolation, validation, CSRF, energy maths. `pytest` is green.
- [ ] README (replacing the Next.js boilerplate): how to run (Docker and dev), stack choices and why, session/CSRF design, consumption model and why, PVGIS handling, known limits, honest AI-usage statement.

**Should**

- [ ] Monthly bar chart on the site page; battery comparison with "the battery adds X kWh".
- [ ] `@lru_cache` on the two PVGIS fetch functions.
- [ ] Session expiry (7 days) enforced.
- [ ] GitHub Actions: one job running `docker build` on every push (optional, phase 6).

**Won't (say so in the README)**

- Deployment, frontend unit tests, visual polish beyond clean and consistent, rate limiting, email verification, password reset, multi-worker deployment.

## 1. Timeline at a glance

| Phase | Target                   | Outcome                                                                                 | Branch               |
| ----- | ------------------------ | --------------------------------------------------------------------------------------- | -------------------- |
| 0     | Wed 14 Oct, evening      | Clean repo, both toolchains run, working agreement committed                            | `main` (direct)      |
| 1     | Thu 15 Oct, morning      | `/api/health` + SPA served by FastAPI; Docker hand-in path proven; branch protection on | `chore/skeleton`     |
| 1b    | Thu 15 Oct, evening      | Design tokens plus `Button` and `Field`, one-hour timebox                               | `feat/design-system` |
| 2     | Thu 15 PM → Fri 16 AM    | register/login/logout/me with CSRF; login/register pages; route guard                   | `feat/auth`          |
| 3     | Fri 16 Oct               | Five site routes with ownership and validation; list/form/detail pages                  | `feat/sites`         |
| 4     | Sat 17 Oct, morning      | PVGIS PVcalc → production endpoint + monthly chart                                      | `feat/production`    |
| 5     | Sat 17 PM → Sun 18 AM    | seriescalc + energy simulation → battery endpoint + calculator UI                       | `feat/battery`       |
| 6     | Sun 18 Oct               | Tests complete, security pass, README, clean-clone Docker test                          | `chore/hardening`    |
| 7     | Mon 19 Oct, before 12:00 | Final review, quiz, tag `v1.0.0`, submit the link                                       | `main`               |

Monday morning is the only slack. If a phase slips by more than half a day, apply the cut list in §5.
Targets assume eight to ten focused hours per day with breaks (confirmed 14 Oct).

## 2. Phases

Every phase runs the same loop:

1. Ask Claude `brief phase N`. You get: concepts to learn, API shapes in words, files to create, acceptance checks, tests to write. Read the linked docs.
2. Backend first (exercise it in `/docs`), then frontend, then end to end in the browser.
3. Ask `review`. Fix findings you understand. Tests green. Commit. Open the PR. Merge. Tick the boxes in §7.
4. Ask `quiz` on the phase while it is fresh.

### Phase 0: Reset and setup (Wed 14 Oct)

**Goal.** A clean repository where both toolchains start, nothing of the Next.js scaffold remains, and the working agreement is committed.

**State today.** `frontend/` is already a Vite + React 19 + React Router 7 + Tailwind 4 scaffold. The git index still holds the old Next.js files (staged but deleted on disk). The root `.gitignore` and `README.md` are Next.js leftovers. `backend/` is empty. Node 26.11.1 and npm 12 are installed (Node upgraded 14 Oct). Docker 29 is installed. Python is 3.14.8. The brief lives at `docs/projet-brief.md`; the superseded plan and prompt files are deleted.

**Steps**

1. Repo cleanup: follow "Day 0 cleanup" in [git-workflow.md](git-workflow.md) (unstage everything, remove leftovers, write a new root `.gitignore`, placeholder README).
2. System: confirm `npm --version` prints without a warning now that Node is 26. Confirm `docker run --rm hello-world` works without `sudo`.
3. Frontend: `npm run dev` shows the Vite page. Delete the demo assets, `App.css`, and the demo markup in `App.tsx`. Add the `/api` dev proxy to `vite.config.ts` (`server.proxy`, target `http://localhost:8000`). Confirm `@import "tailwindcss";` is in `index.css`. `npm run build` passes.
4. Backend: `python -m venv backend/.venv`, activate, `pip install fastapi "uvicorn[standard]" httpx argon2-cffi "pydantic[email]"`, then `pip freeze > requirements.txt` (before anything else is installed, so only runtime packages are captured; check with `grep -iE "pytest|ruff|pluggy|iniconfig|pygments" requirements.txt`, which must print nothing), then `pip install pytest ruff`. Write `requirements-dev.txt` by hand: first line `-r requirements.txt`, then `pytest==x` and `ruff==y` with the versions from `pip list`. Create `backend/app/__init__.py` and `backend/app/main.py` with one `FastAPI()` instance. `uvicorn app.main:app --reload` starts from `backend/`.
5. Primer: read [python-for-js-devs.md](python-for-js-devs.md) sections 1 to 8 (about an hour).
6. Commit on `main`: `chore: reset repo to Vite frontend and FastAPI backend skeleton`. Push. Create the GitHub repo.

**Acceptance**

- [x] `git ls-files` shows no Next.js files, no `node_modules`, no `.venv`.
- [x] `npm run dev` and `uvicorn app.main:app --reload` both start.
- [x] `npm --version` prints without a warning.

**Learn first:** venv and pip; `python -m`; how uvicorn resolves `app.main:app`; Vite dev proxy.
**Interview angles:** why pip + venv; why Vite instead of Next.js (the SPA is served by Python, no React server needed).

### Phase 1: Walking skeleton and Docker (Thu 15 Oct, morning)

**Goal.** FastAPI serves the built React app and a JSON health endpoint from one port, locally and in Docker. This proves the hand-in path before any feature exists.

**Backend**

1. `GET /api/health` returning `{"status": "ok"}`, in its own router, to learn `APIRouter` and `include_router`.
2. Static serving: mount the built `static/assets` directory; add a catch-all GET route (`{path:path}`) that returns `static/index.html` for any path not under `/api`, so client-side routes survive a refresh. Unknown `/api/...` paths must still return a JSON 404, not `index.html`.
3. Skip the mount when `static/` does not exist, so the backend runs in dev without a frontend build.

**Frontend**

1. `vite.config.ts` proxy for `/api`.
2. `App.tsx` temporarily fetches `/api/health` and renders the result.
3. `src/api/client.ts` version 0: a `request<T>(path, init)` wrapper that sets JSON headers, parses the body, and throws a typed `ApiError` on non-2xx.

**Docker**

1. `.dockerignore` listing `node_modules`, `.venv`, `dist`, `*.db`, `.git`, `__pycache__`, `docs`.
2. Multi-stage `Dockerfile` in the repo root. Stage one: `node:24-alpine`, copy `package.json` and `package-lock.json` first, `npm ci`, copy the rest, `npm run build`. Stage two: `python:3.14-slim` (fall back to `3.13-slim` if any wheel is missing), copy `requirements.txt` first, `pip install --no-cache-dir -r`, copy `backend/app`, copy `dist` from stage one into `static`, create a `data/` dir, create a non-root user and switch to it, `EXPOSE 8000`, `CMD` uvicorn on `0.0.0.0:8000`.
3. `docker build -t solar . && docker run --rm -p 8000:8000 solar`.

**Branch protection.** After this PR is merged, enable branch protection on `main` (see git-workflow.md §5). CI is optional and belongs to phase 6.

**Acceptance**

- [x] Dev: Vite page at :5173 shows the health JSON via the proxy.
- [x] Docker: page at :8000; `/api/health` is JSON; `/sites` (a client route that does not exist yet) serves `index.html`; `/api/nope` is a JSON 404.
- [x] The container runs as non-root (`docker run --rm solar id`).

**Learn first:** ASGI versus WSGI; `APIRouter`; `StaticFiles` and `FileResponse`; path converter `{path:path}`; Docker layers, multi-stage builds, `COPY --from`, `.dockerignore`; `npm ci` versus `npm install`.
**Interview angles:** why one process serves both; cache-friendly Dockerfile ordering (lockfiles before source); non-root containers.

### Phase 1b: Design tokens (Thu 15 Oct, evening; timebox one hour)

**Goal.** Your own tokens and the two components every form and page reuse, so later pages compose inline utilities on a consistent base. Spec in §3.8.

**Steps**

1. `index.html`: one Google Fonts `<link>` for Karla and Basic. `src/index.css`: the `@theme` block from §3.8 (colour roles, two font families, two radii, one shadow). Remove every leftover Vite style.
2. `src/components/`: `Button` and `Field` (label, input, error slot). Typed props, no data fetching inside. Other components only when a page needs them (§3.8 says which phase).

**Acceptance**

- [ ] Both components render their states (hover, focus-visible, disabled, invalid) on a scratch page; focus rings visible with keyboard navigation.
- [ ] No hex values outside `index.css`.
- [ ] `npm run build` and `npm run lint` pass. The one-hour timer was respected.

**Learn first:** Tailwind 4 `@theme` and CSS-first configuration; `focus-visible`.
**Interview angles:** why tokens as CSS variables; why one hour was enough; why the button blue is Praeter's darker step (AA contrast).

### Phase 2: Authentication (Thu 15 PM → Fri 16 AM)

**Goal.** Accounts and sessions exactly per contract, safe by construction.

**Backend**

1. `db.py`: a `DB_PATH` constant (`solar.db` next to the `app` package; no environment variable, decision 36). `connect()` opens `sqlite3.connect(DB_PATH, check_same_thread=False)`, sets `row_factory = sqlite3.Row`, and runs `PRAGMA foreign_keys = ON` because SQLite enforces foreign keys only when asked, per connection. `init_db()` runs the `CREATE TABLE IF NOT EXISTS` statements for `users`, `sessions` and `sites` and is called once at the bottom of `main.py` at import time (no lifespan hook). `get_db()` is a dependency that yields one connection per request and closes it in a `finally`.
2. Tables: the `CREATE TABLE` SQL for `users` and `sessions` per §3.1 lives in `db.py`; there is no `models.py`. `sessions` is keyed by `token` and carries `csrf_token`, `user_id` and `created_at` (ISO 8601 UTC text, used for the 7-day expiry). `users` and `sites` have no timestamps. Emails stored stripped and lowercased, with a `UNIQUE` constraint.
3. `schemas.py`: `Credentials` (`email: EmailStr`, `password` 8 to 128 chars) and `MeOut` (`email`, `csrfToken`).
4. `auth.py`: `hash_password`, `verify_password` (argon2), `create_session(db, user)` returning the token and CSRF token, `current_user` dependency (cookie → session row → expiry check → user, else 401), `require_csrf` dependency (`X-CSRF-Token` header compared with `hmac.compare_digest` against the session row, else 403).
5. `routers/auth.py`: register (duplicate email → 409 via a pre-check or by catching `sqlite3.IntegrityError`; success 201, sets the cookie, returns `{email, csrfToken}`), login (wrong credentials → 401 with one shared message; success 200, new session row, cookie), logout (needs session and CSRF; deletes the row; clears the cookie; 204), me (200 `{email, csrfToken}`).
6. Cookie: name `session`, `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age` 7 days, no `Secure` flag because the app is served over plain http on localhost (document this).

**Frontend**

1. `src/api/auth.ts`: `register`, `login`, `logout`, `me`.
2. `AuthContext` and `useAuth()`: `{ status: 'loading' | 'anon' | 'authed', email, csrfToken, login(), register(), logout() }`. On mount, call `/api/me` to restore the session after a refresh.
3. `client.ts`: attach `X-CSRF-Token` on non-GET requests when a token is known.
4. Pages: `/login`, `/register` (controlled inputs, server message shown), `/` redirects based on auth status. A `RequireAuth` layout route (`Outlet` or `Navigate`) wraps every protected route.
5. Nav bar with the email and a logout button.

**Tests (backend)**

- register → 201 and a `Set-Cookie`; duplicate → 409; login wrong password → 401; `/api/me` without cookie → 401; logout → 204 and `/api/me` is 401 afterwards; POST to a protected route without the header → 403.

**Acceptance**

- [ ] Full flow in the browser. Refresh keeps you logged in. After logout the back button cannot reach protected data.
- [ ] DevTools shows the cookie with HttpOnly and SameSite=Lax.
- [ ] `pytest` green.

**Learn first:** password hashing (Argon2id, salt, verify); server-side sessions versus JWT; cookie attributes; what CSRF is and why SameSite=Lax alone is not the whole answer; FastAPI `Depends`, `Response.set_cookie`, `Request.cookies`; the stdlib `sqlite3` module (connections, cursors, `?` placeholders, `commit`, `row_factory`), `SELECT ... WHERE`, unique constraints and `sqlite3.IntegrityError`; React context with a provider; React Router 7 layout routes, `Navigate`, `Outlet`.
**Interview angles:** 401 versus 403; one error message for unknown email and wrong password; why the CSRF token is returned in JSON rather than a readable cookie; why HttpOnly; why not localStorage; a fresh token on every login (session fixation).

### Phase 3: Sites CRUD with ownership (Fri 16 Oct)

**Goal.** The five site routes, every query scoped to the caller, per-field validation.

**Backend**

1. `db.py`: add the `sites` table per §3.1: `id` text primary key (a UUID generated in Python with `uuid4()` and stored as a string) and a `user_id` foreign key with an index.
2. `schemas.py`: `SiteIn` with camelCase aliases and constraints (`clientName` non-empty, max 200; `address` non-empty, max 500; `latitude` −90 to 90; `longitude` −180 to 180; `roofAreaM2` optional and greater than 0; `peakKwp` greater than 0 and at most 1000). `SiteOut` is `SiteIn` plus `id`.
3. Validation errors: keep FastAPI's default 422 body (§3.3); no custom handler (decision 10). The frontend maps each error's last `loc` element to the field.
4. `routers/sites.py`: list (filter by `user_id`), create (`user_id` taken from the dependency, never from the body; 201), get / put / delete through one helper `get_owned_site(site_id, user, db)` that filters on both id and `user_id` and raises 404.

**Frontend**

1. `src/api/types.ts`: `Site` (`id: string`), `SiteInput`, `ApiError` with an optional `fieldErrors` map.
2. `src/api/sites.ts`: five functions.
3. Pages: `/sites` (list with empty, loading and error states), `/sites/new` and `/sites/:id/edit` (one `SiteForm` with controlled inputs, number parsing, client-side mirror of the server rules, server field errors shown under the matching field), `/sites/:id` (fields, delete with confirm, links to edit; production and battery sections come in phases 4 and 5).
4. Shared UI from phase 1b: `Button`, `Field`, `Card`, `PageHeader`, `ErrorBanner`, `EmptyState`, `Spinner`. Pages compose; no new one-off styles.

**Tests:** user B gets 404 on user A's site for get, put and delete; list shows only own sites; invalid body → 422 with the expected keys; `roofAreaM2` may be omitted.

**Acceptance**

- [ ] Two users in two private windows cannot see each other's sites by URL or id.
- [ ] A bad latitude shows a message under that field.
- [ ] `pytest` green.

**Learn first:** the `uuid` module; SQL `INSERT`, `SELECT`, `UPDATE` and `DELETE` with `?` placeholders, `commit` and `rollback`, `cursor.rowcount`; foreign keys; why ownership is a `WHERE` clause and not a check after fetching; PUT semantics (full replacement); mass assignment; Pydantic aliases and `Field` constraints; custom exception handlers; React controlled forms with number inputs, `useParams`, `useNavigate`.
**Interview angles:** 404 versus 403 for someone else's site; UUIDs are not authorisation on their own, so ownership stays a WHERE clause; where validation lives (both sides, server authoritative).

### Phase 4: Production via PVGIS (Sat 17 Oct, morning)

**Goal.** `GET /api/sites/{id}/production` returns `{yearlyKwh, monthlyKwh: [{month, kwh}] × 12}` with clear failures.

**Backend**

1. `pvgis.py`: `fetch_pvcalc(lat, lon, kwp)` is a plain function that calls PVcalc with `httpx.get(url, params=..., timeout=30)` and `loss=14`, `optimalangles=1`, `outputformat=json`. On HTTP 400 whose JSON message mentions the sea or missing data, raise `HTTPException(422, "PVGIS has no data for this location")`. On any other failure (non-2xx, connection error, timeout) raise `HTTPException(502, "PVGIS is unavailable")`. No custom exception class, no async (decisions 34 and 35).
2. Decorate it with `@functools.lru_cache(maxsize=128)`. The arguments are floats, so the result is cached per (lat, lon, kwp); a raised exception is never cached; editing a site changes the arguments, so no invalidation code is needed. Never mutate the returned data.
3. Mapping, in the route or a tiny helper: `outputs.totals.fixed.E_y` → `yearlyKwh`; each of `outputs.monthly.fixed[*]` → `{month, kwh: E_m}`; round to one decimal.
4. `routers/sites.py`: the production route reuses `get_owned_site`, calls the fetch, returns the mapped shape.

**Frontend**

1. `src/api/sites.ts`: `getProduction(id)`.
2. Site page section: yearly figure, a 12-bar chart made of divs with heights proportional to `kwh / max`, month labels, loading state, and the 422 message shown prominently.

**Tests:** monkeypatch `fetch_pvcalc` to return a saved fixture JSON → the mapped shape; monkeypatch it to raise the 422 → the response is 422.

**Acceptance**

- [ ] The Hague site (52.08, 4.31, 5 kWp) shows about 5341 kWh/year and 12 months.
- [ ] A site at 55.0, 3.0 (North Sea) shows a clear message, not a 500.
- [ ] A second load is instant (cache hit).

**Learn first:** `httpx.get` with `params` and `timeout`; `response.status_code` and `response.json()`; `httpx.HTTPError`; raising `HTTPException` from a helper; `@lru_cache`; `monkeypatch` in pytest.
**Interview angles:** why the backend proxies PVGIS; 502 versus 422; why a plain `def` route is fine for a slow call (thread pool); what `lru_cache` does and does not cache.

### Phase 5: Battery and self-consumption (Sat 17 PM → Sun 18 AM)

**Goal.** `GET /api/sites/{id}/battery?capacityKwh=&annualUseKwh=` returns the §3.5 shape using the documented consumption model.

**Backend**

1. `pvgis.py`: `fetch_hourly(lat, lon, kwp)`, same shape as `fetch_pvcalc`, calls seriescalc with `pvcalculation=1`, `loss=14`, `optimalangles=1`, `startyear=2023`, `endyear=2023`, `outputformat=json` and returns 8760 kWh values in order (`P` in W ÷ 1000). Same `@lru_cache`; this call takes 5 to 10 s, so the cache matters here.
2. `energy.py` (pure, no I/O, no FastAPI imports): `simulate(production, annual_use_kwh, capacity_kwh, round_trip_efficiency=0.9) -> dict`. Consumption in every hour is `annual_use_kwh / 8760` (flat profile, §3.5). Walk the year hour by hour and return the totals. Run it twice (capacity 0 and capacity N).
3. Query validation: `capacityKwh` ≥ 0 and `annualUseKwh` > 0, both required, declared as typed query parameters with `Query(ge=..., gt=...)` and camelCase aliases.
4. `routers/sites.py`: owned site → cached hourly data → simulate → response model.

**Frontend**

1. `src/api/sites.ts`: `getBattery(id, capacityKwh, annualUseKwh)`.
2. Site page section: a small form (capacity kWh, annual use kWh, sensible defaults such as 5 and 3500), results side by side for without and with battery (self-used, imported, exported), and a headline "The battery adds X kWh of self-used solar per year".

**Tests:** a hand-made 24-hour series with round numbers whose answers you can compute on paper; capacity 0 equals the without-battery result; energy balance holds (production = self-used + export; consumption = self-used + import).

**Acceptance**

- [ ] Results move sensibly with capacity (0 equals without; very large plateaus).
- [ ] Balance assertions pass.
- [ ] README section on the model written.

**Learn first:** time-series simulation and state of charge; floating point rounding; keeping pure functions apart from I/O; FastAPI `Query` validation; nested Pydantic response models.
**Interview angles:** why a flat profile and what it ignores (daily shape, seasons, time zone, battery power limits, degradation); where the efficiency loss is applied and why.

### Phase 6: Hardening, tests, README (Sun 18 Oct)

1. Security pass against the checklist in CLAUDE.md. Run `/code-review` and `/security-review`. Fix what you understand; note what you skip and why.
2. Tests: close the gaps against §0. `pytest -q` green. `ruff check .` and `ruff format --check .` clean. `npm run lint` and `npm run build` clean.
3. Session expiry enforced, expired rows deleted on login (if not done in phase 2).
4. README written from scratch: run with Docker; run in dev (two terminals); stack and why (condense [backend-stack.md](backend-stack.md)); API notes (status codes, error shape); auth and CSRF design; consumption model and rationale; PVGIS handling and cache; known limits; AI-usage statement.
5. Clean-clone test: `git clone` into a temp dir, `docker build`, `docker run`, walk the manual script in §6 with two users in private windows.
6. CI: add the pytest and npm build jobs to the workflow. Optional: security headers middleware (`X-Content-Type-Options: nosniff`, `Referrer-Policy`, a basic CSP).
7. Design polish pass, two-hour timebox: spacing consistency, every state on every page, the chart, the battery comparison, empty states. Candidates noted 15 Oct: a 1px card border like praeter.energy, hover transitions on cards and buttons (`transition-shadow`, `transition-colors`). Stop when the timer ends.

### Phase 7: Hand-in (Mon 19 Oct, before 12:00)

1. Re-read the brief line by line against the running app.
2. Final `review`; `quiz` on every phase.
3. Tag `v1.0.0`, push, check that GitHub renders the README and the Dockerfile sits in the root.
4. Submit the link.

## 3. Reference specs (shared by all phases)

### 3.1 Data model

| Table      | Columns                                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`    | `id` UUID PK; `email` text unique not null (stored lowercased); `password_hash` text not null; `created_at` datetime                                                                        |
| `sessions` | `id` UUID PK; `token` text unique not null (indexed); `csrf_token` text not null; `user_id` FK users.id; `created_at`; `expires_at`                                                         |
| `sites`    | `id` UUID PK; `user_id` FK users.id (indexed); `client_name` text; `address` text; `latitude` real; `longitude` real; `roof_area_m2` real null; `peak_kwp` real; `created_at`; `updated_at` |

Python attribute names are snake_case; JSON field names are camelCase through Pydantic aliases. Never expose `password_hash`, `token`, `csrf_token` of other sessions, or `user_id`.

Ids (decision 12): generated in Python with `uuid4()` and stored in SQLite as `TEXT` in the usual 36-character form, the same string that appears in the JSON; a path parameter typed `uuid.UUID` is parsed by FastAPI for free and a malformed id gets 422 before any lookup. Datetimes are stored as UTC ISO 8601 text, which also sorts correctly as a string.

### 3.2 HTTP status codes (decision 9 in CLAUDE.md)

| Route                            | Success                           | Failures                                                                                         |
| -------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------ |
| `POST /api/register`             | 201 `{email, csrfToken}` + cookie | 409 email exists; 422 invalid email or password                                                  |
| `POST /api/login`                | 200 `{email, csrfToken}` + cookie | 401 wrong credentials (one message for both cases); 422 malformed body                           |
| `POST /api/logout`               | 204, cookie cleared               | 401 no session; 403 missing or wrong CSRF header                                                 |
| `GET /api/me`                    | 200 `{email, csrfToken}`          | 401                                                                                              |
| `GET /api/sites`                 | 200 `[site]`                      | 401                                                                                              |
| `POST /api/sites`                | 201 site                          | 401; 403 CSRF; 422 per-field                                                                     |
| `GET /api/sites/{id}`            | 200 site                          | 401; 404 not found or not the caller's                                                           |
| `PUT /api/sites/{id}`            | 200 site                          | 401; 403 CSRF; 404; 422 per-field                                                                |
| `DELETE /api/sites/{id}`         | 204                               | 401; 403 CSRF; 404                                                                               |
| `GET /api/sites/{id}/production` | 200 `{yearlyKwh, monthlyKwh}`     | 401; 404; 422 PVGIS has no data for the location; 502 any other PVGIS failure, timeouts included |
| `GET /api/sites/{id}/battery`    | 200 (§3.5)                        | 401; 404; 422 bad query or no data; 502                                                          |

Why 404 and not 403 for another user's site: the response must not reveal that the id exists. Why 422 for a path id that is not a well-formed UUID: it is a malformed request, not a missing resource, and FastAPI produces it automatically. Why 422 for validation: FastAPI's default and semantically "well-formed but unprocessable". Why 403 for CSRF: the session is valid but the request is not authorised in this form.

### 3.3 Error body

- Single message: `{"detail": "Email already registered"}` (FastAPI's `HTTPException` default, zero extra code).
- Validation: FastAPI's default 422 body, unchanged (decision 10): `{"detail": [{"type": "...", "loc": ["body", "latitude"], "msg": "Input should be less than or equal to 90", ...}, ...]}`. One entry per invalid field, which is the brief's "message per field". The frontend takes the last element of `loc` as the field name (already camelCase because of the alias) and shows `msg` under that input. `detail` is a string for other errors and a list here, so the fetch wrapper checks which it got.

### 3.4 PVGIS facts (verified with curl on 14 Oct 2026)

- PVcalc JSON: `outputs.totals.fixed.E_y` (kWh/year); `outputs.monthly.fixed` is a list of 12 `{month: 1..12, E_d, E_m, H(i)_d, H(i)_m, SD_m}`; `E_m` is the month's kWh.
- Sea coordinates (55.0, 3.0): HTTP 400 with body `{"message": "Location over the sea. Please, select another location", "status": 400}`.
- seriescalc with `pvcalculation=1&startyear=2023&endyear=2023`: `outputs.hourly` is 8760 objects `{time: "20230101:0011", P (W), G(i), H_sun, T2m, WS10m, Int}`. Timestamps are UTC with a fixed `:11` minute offset; the hour of day is `time[9:11]`.
- Without `optimalangles=1`, seriescalc assumes a horizontal panel (year sum 4530 kWh versus PVcalc 5341 for The Hague at 5 kWp). With `optimalangles=1` the sum is 5338 kWh, so pass it on both calls and the two endpoints agree.
- Response time: PVcalc about 1 s, seriescalc 5 to 10 s. Timeout 30 s; cache both.
- Reference values: The Hague 52.08, 4.31, 5 kWp, loss 14: `E_y` 5340.96, January `E_m` 191.62.

### 3.5 Battery response and consumption model

Response (contract fields first, the "…" filled in by us):

```
{
  "productionKwh": 5341.0,
  "consumptionKwh": 3500.0,
  "capacityKwh": 5.0,
  "withoutBattery": { "selfUsedKwh", "gridImportKwh", "gridExportKwh" },
  "withBattery":    { "selfUsedKwh", "gridImportKwh", "gridExportKwh" },
  "batteryGainKwh": 812.4
}
```

- `batteryGainKwh` = with − without self-used. Percentages, if the UI wants them, are one division in the frontend.
- Consumption model (decision 14): flat. `annualUseKwh / 8760` in every hour of the year. Rationale for the README: PVGIS gives no load data; the brief allows a simple stated assumption; a flat profile is transparent and has no parameters to defend; the battery effect is still visible because night-time use must be imported from the grid without storage. State what it ignores: the daily shape of household use (morning and evening peaks), seasons, weekends, and the UTC timestamps of PVGIS.
- Battery simulation per hour: `surplus = production − consumption`. If positive, charge `min(surplus, capacity − soc)` and export the rest. If negative, discharge `min(deficit, soc)` and import the rest. Round-trip efficiency 90 % applied on discharge (energy out = stored × 0.9), start empty, no charge or discharge power limit, no degradation.
- Stated limitations: flat profile, 2023 weather only, PVGIS timestamps are UTC, no battery power limit.

### 3.6 Frontend architecture

```
src/
  main.tsx                  BrowserRouter + AuthProvider + routes
  App.tsx                   route table; RequireAuth layout
  api/client.ts             request<T>(): JSON headers, X-CSRF-Token, ApiError with fieldErrors
  api/types.ts              Site, SiteInput, Production, BatteryResult, ApiError (mirror the contract)
  api/auth.ts  api/sites.ts one function per route; the only files that call request()
  auth/AuthContext.tsx      status, email, csrfToken, login/register/logout; /api/me on mount
  pages/  Login, Register, Sites, SiteForm (new + edit), SiteDetail (fields, production, battery)
  components/               Button, Field, PageHeader, ErrorBanner, Spinner, MonthlyChart, NavBar
  index.css                 @import "tailwindcss"; plus the @theme token block (§3.8)
  lib/format.ts             number formatting (Intl.NumberFormat)
```

Design: the system in §3.8. Every async view has loading, error and empty states, forms show server errors under fields, destructive actions confirm. Light mode only.

### 3.7 Docker shape

Two stages. Stage one builds the frontend with Node 24 and produces `dist/`. Stage two is Python 3.14 slim: install `requirements.txt`, copy `backend/app`, copy `dist` into `static/`, create `data/`, run as a non-root user, expose 8000, start uvicorn on `0.0.0.0`. The SQLite file lives in `data/` inside the container; mounting a volume there persists it (mention in README).

### 3.8 Design system (direction settled 15 Oct, decision 38; light mode only)

**Mockup.** https://claude.ai/artifact/QGhAVhf7DUyFrZfxzYeDTj (Claude Design canvas, private to the user): a design sheet plus Login, Sites, Site form, Site detail, and a stretch "Sites with map" artboard. It is a reference, not a to-do list: each page is built in its own phase with only the components it needs.

**Mechanism.** Tailwind 4 is CSS-first. Tokens are CSS variables declared in an `@theme { ... }` block in `src/index.css`, and every token automatically becomes a utility class: `--color-accent` gives `bg-accent` and `text-accent`, `--radius-card` gives `rounded-card`, `--font-display` gives `font-display`. There is no `tailwind.config.js`. Docs: https://tailwindcss.com/docs/theme

**Direction.** Praeter's own palette and type reduced to roles. Blue for actions, green for solar data. Karla for copy and numbers, Basic for h1 and h2 (both from Google Fonts, one `<link>` in `index.html`). Top nav bar (wordmark left, email and Log out right), content in a centred 1152px column (`max-w-6xl px-7`). Tinted page with white cards that carry a soft shadow and no border. Sites page is a list of rows in one card (name and address left, capacity and roof area right). Icons come from Phosphor (`@phosphor-icons/react`, decision 40): regular weight, 16px in buttons and 20px elsewhere, `CircleNotch` in duotone weight with `animate-spin` as the spinner (the one non-regular icon: its faint ring is the track), `aria-hidden` on every decorative icon.

**Tokens** (the user types these into `@theme`; ratios are against white):

| Token                  | Value                               | Rule                                                                                   |
| ---------------------- | ----------------------------------- | -------------------------------------------------------------------------------------- |
| `--color-canvas`       | `#F3F7F7`                           | page background                                                                        |
| `--color-surface`      | `#FFFFFF`                           | cards, inputs, nav                                                                     |
| `--color-border`       | `#CDD8D8`                           | inputs, outlined buttons, dividers; cards have no border                               |
| `--color-text`         | `#1F242E`                           | body and headings, 16:1                                                                |
| `--color-text-muted`   | `#6C6E71`                           | labels, addresses, axis text; 5.1:1 (4.7:1 on canvas). Praeter's `#7A7A7A` fails at 4.3:1 |
| `--color-brand`        | `#2981B7`                           | focus ring and wordmark icon only; 4.3:1, never for text                               |
| `--color-accent`       | `#1F6692`                           | primary button fill, links, eyebrows; white on it 6.2:1                                |
| `--color-accent-hover` | `#1F3E51`                           | hover for buttons and links                                                            |
| `--color-accent-soft`  | `#E3EEF5`                           | tinted chips, highlighted column, the PVGIS no-data notice                             |
| `--color-solar`        | `#4E8A35`                           | chart bars; 4.2:1 (bars need 3:1); never text at body size                             |
| `--color-solar-soft`   | `#CFE4B6`                           | tint behind the battery gain                                                           |
| `--color-danger`       | `#B42318`                           | field errors, outlined delete button; 6.6:1                                            |
| `--color-danger-soft`  | `#FBEAE8`                           | error banner background, danger hover                                                  |
| `--font-sans`          | `"Karla", system-ui, sans-serif`    | everything, including large numbers                                                    |
| `--font-display`       | `"Basic", "Karla", sans-serif`      | h1 and h2 only; Basic ships one weight (400), size carries the hierarchy               |
| `--radius-control`     | `6px`                               | buttons, inputs                                                                        |
| `--radius-card`        | `12px`                              | cards                                                                                  |
| `--shadow-card`        | `0 2px 14px rgb(41 129 182 / 0.08)` | cards on the canvas                                                                    |

No custom type scale or spacing: Tailwind defaults (`text-sm` 14, `text-base` 16, `text-2xl` 24, `text-3xl` 30, `text-5xl` for the one hero figure per page). Focus ring is a utility recipe, not a token: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`. Buttons and inputs are both 40px tall (`h-10`) so they line up in a row.

**Components, by the phase that first needs them.**

| Phase | Component                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------- |
| 1b    | `Button` (primary filled, secondary outlined with accent text, danger outlined; hover, focus-visible, disabled, loading) and `Field` (label, input, error slot) |
| 2     | `NavBar`; the login card and error banner are inline utilities                                                 |
| 3     | `PageHeader`, `ErrorBanner`, `EmptyState`, `Spinner`; site rows and the form grid are inline                   |
| 4     | `MonthlyChart` (twelve div bars, 24px wide, 4px top radius, hairline gridlines, month labels, one hover tooltip) |
| 5     | battery form, gain tile and comparison table inline on the detail page                                         |

Everything not in this table is inline utility classes on the page; extract a component only when the same markup appears a third time.

**Rules.** Tokens only in `index.css`; no arbitrary values (`[#hex]`, `[13px]`) in pages; no dark mode; WCAG AA contrast for text (3:1 from 24px); every interactive element keyboard-reachable with the brand focus ring; text never wears the solar green or the brand blue at body size; one hero figure per page.

**Interview angle.** The reviewers do not grade design, so be ready to say: the tokens are Praeter's own values picked for AA contrast, they cost an hour, and they kept every page consistent without a component library. Know why the brand blue is not the button colour (white on it is 4.3:1, under AA's 4.5:1).

## 4. Concept map (what to learn, and when)

| Phase | New concepts (ask `concept <name>`)                                                                                                                                                                            |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | venv, pip, requirements files, `python -m`, Vite proxy                                                                                                                                                         |
| 1     | ASGI, FastAPI app and routers, static files and SPA fallback, path converters, multi-stage Docker, `.dockerignore`, non-root containers                                                                        |
| 2     | password hashing, server-side sessions, cookie attributes, CSRF and SameSite, dependency injection, `sqlite3` connections and parameterised queries, unique constraints, React context, Router 7 layout routes |
| 3     | SQL CRUD and transactions, foreign keys, ownership-scoped queries, Pydantic aliases and constraints, exception handlers, PUT semantics, controlled forms                                                       |
| 4     | `httpx.get` with a timeout, raising `HTTPException` from a helper, `@lru_cache`, monkeypatching in tests                                                                                                       |
| 5     | time-series simulation, pure functions, floating point rounding, `Query` validation, nested response models                                                                                                    |
| 6     | TestClient and dependency overrides, fixtures, security checklist, README structure, clean-clone verification                                                                                                  |

## 5. Risks and cut list

| Risk                                    | Mitigation                                                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| PVGIS slow or down while developing     | Cache; save one real PVcalc and one seriescalc JSON under `backend/tests/fixtures/` on day one                |
| Design system grows beyond its timebox  | One hour Thursday evening, two hours Sunday; tokens plus `Button` and `Field` only; polish is on the cut list |
| Python 3.14 wheel missing for a package | Use `python:3.13-slim` in Docker and a 3.13 venv locally (`pacman -S python313` or pyenv)                     |
| Backend learning curve eats Thursday    | Phase 1 stays tiny; phase 2 backend before any frontend; ask `brief` before coding                            |
| Running out of time                     | Cut list, from the bottom up                                                                                  |

Cut list (cut from the bottom first; everything above the line stays):

1. CI (optional already)
2. Security headers middleware
3. Design polish pass (tokens, `Button` and `Field` stay)
4. Chart becomes a table
5. `@lru_cache` on the PVGIS calls (call PVGIS every time; slower but correct)

Never cut: Docker path, auth with hashing, CSRF and session expiry, ownership isolation, per-field validation, production, battery, the minimal tests, README.

Stretch (decision 39; only when phase 6 is merged and green, Sunday evening at the earliest, branch `feat/map`): a map pane on the sites page with Leaflet + react-leaflet v5, OpenStreetMap tiles fetched by the browser with the "© OpenStreetMap contributors" line, one `CircleMarker` per site (not `Marker`: its icon images break under Vite) with a popup linking to the site, bounds fitted to the sites, and an explicit container height. The "Sites with map" artboard on the canvas is the target. About three to four hours including the README paragraph. If it is dropped, the reserve is one "Open in OpenStreetMap" link per site built from the coordinates, zero packages.

## 6. End-to-end manual test script (run on the Docker image)

1. Open http://localhost:8000. Register user A. The nav shows A's email.
2. Create a site for The Hague (52.08, 4.31, 5 kWp). Open it: production shows about 5341 kWh and 12 bars. Battery with 5 kWh and 3500 kWh/year shows two columns and a gain.
3. Create a site at 55.0, 3.0: production shows the "no data for this location" message.
4. Edit the first site with latitude 95: a message appears under latitude. Fix it, save, delete the second site with confirm.
5. In a private window, register user B. The list is empty. Paste A's site URL: 404 page. `curl` A's site id with B's cookie: 404 JSON.
6. With DevTools, replay a POST without the `X-CSRF-Token` header: 403. Replay with a wrong token: 403.
7. Logout A. Refresh: login page. `curl /api/me` with the old cookie: 401.
8. Stop the container (`docker stop`), start it again: the database is empty (expected; documented).

## 7. Progress

- [x] Phase 0 merged
- [ ] Phase 1 merged
- [ ] Phase 1b merged
- [ ] Phase 2 merged
- [ ] Phase 3 merged
- [ ] Phase 4 merged
- [ ] Phase 5 merged
- [ ] Phase 6 merged
- [ ] `v1.0.0` tagged and submitted
