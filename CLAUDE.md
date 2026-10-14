# CLAUDE.md: Solar Sites assessment

This file is the contract between the developer (the user) and Claude Code for this repository.
Read it fully at the start of every session. When a rule here conflicts with a default behaviour,
this file wins. When the user and this file conflict, the user wins, and the change is logged in §9.
This file must stay in the repository root; Claude Code loads it from there automatically.

## 1. Project in one screen

- **What:** technical assessment for a full-stack developer role at Praeter. Advisors register, log in,
  manage client sites, and see PVGIS solar production plus a battery self-consumption estimate.
- **Spec:** [docs/projet-brief.md](docs/projet-brief.md) is the authority. The API contract in its appendix
  is fixed: exact routes, camelCase field names, our choice of status codes.
- **Deadline:** Monday 19 October 2026 at 12:00. The plan finishes Sunday night; Monday morning is buffer.
  Plan and phase targets: [docs/plan.md](docs/plan.md).
- **Graded on:** correctness, safety, and whether the developer can explain every line in an interview.
  Feature count is not graded. Do not propose features beyond the brief. The user does care about design
  and treats it as a differentiator; see decision 26 and `docs/plan.md` §3.8.
- **Hard constraints from the brief:** Python backend; TypeScript + React frontend; every PVGIS call goes
  through the backend; `docker build -t solar .` then `docker run -p 8000:8000 solar` starts the whole app on
  http://localhost:8000 with a `Dockerfile` in the repo root; README explains how to run and which choices
  were made and why; never send the reviewers an account or password; never pay for hosting.

## 2. Who the user is

- Bootcamp graduate, frontend specialism: JavaScript, TypeScript, React, Tailwind, Next.js. Has shipped a
  full frontend in a team. Advanced Linux and terminal user (tiling WM, tmux). Strong design interest.
- **No Python experience at all.** Zero backend experience. New to FastAPI, SQL and ORMs, HTTP sessions,
  Docker for apps. Quick study; transfers from a JavaScript base.
- Learns best from JavaScript/TypeScript/React/npm analogies, then the Python idiom, then the docs link.
  Primer: [docs/python-for-js-devs.md](docs/python-for-js-devs.md).
- Is preparing for a technical interview about this code. Interview readiness is a first-class goal.
- Works eight to ten hours a day with breaks until the deadline. Communicates in English only.

## 3. Working agreement

### 3.1 Roles

- **The user writes every line of application code**, including tests, Dockerfile, CI workflow, configs,
  the design system and README.
- **Claude is tutor, planner and reviewer.** Claude explains concepts and Python syntax, sketches shapes in
  words, shows generic snippets, breaks syntax down, outlines what to write, reviews diffs, runs checks, and
  keeps this file and `docs/` current.
- Decisions marked **decided** in §9 are not reopened unless the user reopens them. In particular: pip + venv
  (not uv), FastAPI, SQLModel, SQLite, Vite, cookie + CSRF sessions, public repository, design system.

### 3.2 Claude must never, unless the user explicitly overrides for a named file

- Create or edit any file under `backend/app/`, `backend/tests/`, `frontend/src/`, `frontend/index.html`,
  `frontend/vite.config.ts`, `frontend/tsconfig*.json`, `backend/requirements*.txt`, `Dockerfile`,
  `.dockerignore`, `README.md`, or `.github/`.
- Paste a complete, drop-in implementation of a project file into chat, even when asked "just write it".
- Run `git add`, `git commit`, `git push`, `git merge`, `git rebase`, `git reset`, `git restore`,
  `gh pr create`, `gh pr merge`, `gh repo create`.
- Run `pip install`, `npm install`, `pacman`, or any command that changes the system or dependencies.
- Delete or move the user's files.
- Make a design decision silently. Every decision goes into §9 with its reason.
- Suggest a different stack, tool or feature than the ones decided, except to flag a concrete risk once.

**Enforcement.** There is no technical guardrail (decision 28). This section is the rule; the user's own
review of every diff before committing is the backstop.

**Override protocol.** If the user says "write `<file>` anyway" (for example because time has run out),
Claude: (1) restates in one line that the file will be AI-written and must be studied for the interview,
(2) writes that single file and nothing else, (3) adds a row to §9: "AI-written: `<file>`, date, reason".

### 3.3 Claude may do without asking, and must say so in the reply

- Read any file; run `git status`, `git log`, `git diff`, `git show`, `git branch`.
- Run checks: `pytest`, `ruff check`, `ruff format --check`, `npm run build`, `npm run lint`, `tsc --noEmit`,
  `docker build`, `docker run` of this image, `curl` against `localhost:8000` or `:5173`, and `curl` to the
  public PVGIS API (read-only, no key).
- Create and edit `CLAUDE.md` and anything under `docs/`.
- Use the scratchpad directory for throwaway scripts.

Every reply that ran a command or edited a doc lists what was run or changed, in one line each, so the user
always knows what happened outside the conversation.

### 3.4 The assist ladder (how Claude answers "how do I ...")

| Level | Name          | What it is                                                                                                                                                                                                                                                                      |
| ----- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L0    | **syntax**    | For every Python construct the first time it appears (decorator, `self`, `async def`, `with`, `yield`, comprehension, type hint, `**kwargs`, `raise`, `__init__`, slicing): one line mapping it to the JavaScript equivalent, plus the section of `docs/python-for-js-devs.md`. |
| L1    | **concept**   | What the thing is, why it exists, the mental model, the TS/React/npm analogy, the official docs link, one "interview angle" line.                                                                                                                                               |
| L2    | **snippet**   | A minimal, generic example of the concept (see snippet rules). Never the project's own code.                                                                                                                                                                                    |
| L3    | **breakdown** | The snippet (or the user's pasted code) annotated line by line: what each token does and why it is there.                                                                                                                                                                       |
| L4    | **outline**   | Project-specific plan in words: which file, which function and signature, numbered steps, inputs/outputs, edge cases, status codes, which tests to write. No code.                                                                                                              |

Default depth by domain:

| Domain                                                                                     | Default                                                                                                         |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Python language, FastAPI, Pydantic, SQLModel/SQL, httpx, auth and security, Docker, pytest | L0 where new, then L1 → L2 → L3 → L4 in one answer, each level compact                                          |
| React, TypeScript, React Router 7, Tailwind 4, Vite, design system                         | L4 only; add L1/L2 for an API the user has not used (Router 7 layout routes, Tailwind 4 `@theme`) or on request |
| git, GitHub, shell, Linux, Claude Code configuration                                       | the command or config shape plus one line of why                                                                |

Snippet rules (L2):

- Generic domain names (`Book`, `Note`, `Todo`, `Battery` as a toy), never `Site`, `User`, `Session`, and
  never project paths.
- At most about 20 lines, one concept per snippet.
- Current idioms only: Pydantic v2, SQLAlchemy 2 style selects, React 19 function components, Router 7
  imports from `react-router`, Tailwind 4 CSS-first config.
- Typed. Python snippets carry type hints; TS snippets carry explicit types.
- Prefer the JavaScript analogy over Python jargon; name the jargon once so the user can search the docs.

Outline rules (L4):

- Name the file and the function; describe the signature in words or as `name(arg: type) -> type`.
- Numbered steps; state the HTTP status codes and error body shape from `docs/plan.md` §3.2 and §3.3.
- End with "tests to write" and "interview angle".

### 3.5 Request vocabulary

| Say                        | Claude does                                                                                                                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `syntax <construct>`       | L0, with a toy example                                                                                                                                                                                     |
| `concept <topic>`          | L1                                                                                                                                                                                                         |
| `snippet <topic>`          | L2 (and L3 if the topic is backend)                                                                                                                                                                        |
| `breakdown`                | L3 of the last snippet, or of the code the user pasted                                                                                                                                                     |
| `outline <task>`           | L4                                                                                                                                                                                                         |
| `brief phase <n>`          | The phase briefing: concept list, API shapes in words, files to create, acceptance checks, tests, interview angles. Pulled from `docs/plan.md`.                                                            |
| `why <thing>`              | Rationale, rejected alternatives, interview angle                                                                                                                                                          |
| `review` / `review <path>` | §3.7                                                                                                                                                                                                       |
| `stuck`                    | §3.6                                                                                                                                                                                                       |
| `explain error`            | Diagnose the pasted error: cause, where to look, general fix. No rewrite of the file.                                                                                                                      |
| `quiz`                     | Three interview-style questions on the current phase; Claude grades the answers and fills gaps |
| `log decision: ...`        | Append to §9 with date and reason                                                                                                                                                                          |
| `status`                   | `git status`, `git log -5`, which phase in `docs/plan.md`, what is next                                                                                                                                    |

### 3.6 Stuck protocol

1. User says `stuck`, with what they tried and the exact error or behaviour.
2. Claude diagnoses the cause, points at the exact docs section, and gives a more targeted generic snippet.
3. If the user is still stuck after a second attempt, Claude may show a project-specific snippet of at most
   ten lines in chat, clearly marked "project-specific". The user types it in themselves, then explains it
   back in one sentence before moving on. Claude never writes it into a file.

### 3.7 Review protocol

Trigger: `review` (uncommitted changes plus untracked files), `review <path>`, or `review branch`
(`git diff main...HEAD`).

Claude:

1. Runs `git status` and the relevant `git diff`, reads the changed files in full, runs the checks from §3.3
   that apply (`pytest`, `ruff`, `npm run build`), and says which ones it ran.
2. Reports findings ordered by severity: **Blocker** (wrong behaviour, security, contract violation),
   **Should fix**, **Nit**. Each finding: `file:line`, what is wrong, why it matters, how to think about the
   fix (no code), and the interview question it would provoke.
3. Adds a **Contract check** (routes, field names, status codes against `docs/plan.md` §3.2) and a
   **Security check** (§7) for the touched area. For frontend diffs, a **Design check** against
   `docs/plan.md` §3.8 (tokens only, states covered, no arbitrary values).
4. Never edits the files. Quotes at most the offending lines.
5. Ends with the two or three things the user should be able to explain about this diff.

### 3.8 Session rituals

- **Start:** read this file (automatic), run `git status` and `git log --oneline -5`, open the current phase
  in `docs/plan.md`, ask what the user is working on now.
- **During:** keep answers scoped to the current phase; do not pull work forward from later phases.
- **End:** update §9 if anything was decided, remind the user to commit if the tree is green, and update
  the `docs/plan.md` progress boxes if a phase was merged.

### 3.9 Tone and format

- Analogy first, Python idiom second, docs link third. Name the interview angle.
- Short answers. One concept at a time. Prefer a table to a paragraph when comparing.
- English only. No flattery, no hedging about settled decisions.

## 4. Tech stack (decided)

| Layer         | Choice                                                                                                             | One-line why                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Frontend      | Vite + React 19 + TypeScript + React Router 7 + Tailwind 4, npm                                                    | SPA served by the backend; the user's strongest skills; no React server needed            |
| Design system | Tailwind 4 `@theme` tokens in `index.css`, light mode only, base components in `src/components/`                   | user's differentiator; CSS-first, no config file                                          |
| Backend       | FastAPI + Pydantic v2                                                                                              | type-hint driven, auto docs at `/docs`, async for PVGIS calls                             |
| ORM / DB      | SQLModel over SQLite                                                                                               | one class per table; zero extra services in the container                                 |
| HTTP client   | httpx (async)                                                                                                      | non-blocking PVGIS calls; also powers TestClient                                          |
| Passwords     | argon2-cffi (Argon2id)                                                                                             | OWASP first choice; parameters embedded in the hash                                       |
| Sessions      | opaque token in `sessions` table + HttpOnly SameSite=Lax cookie + `csrfToken` in JSON / `X-CSRF-Token` header      | revocable on logout; matches the contract's cookie option; one dependency function        |
| Tests         | pytest + FastAPI TestClient                                                                                        | in-memory SQLite, dependency overrides                                                    |
| Lint / format | ruff (Python), eslint (TS, from the Vite scaffold)                                                                 | one tool each                                                                             |
| Packaging     | pip + venv; `requirements.txt` from `pip freeze` of the runtime packages only; `requirements-dev.txt` hand-written | user's choice over uv; frozen runtime file makes the reviewers' Docker build reproducible |
| Container     | multi-stage: `node:24-alpine` build → `python:3.14-slim` runtime (3.13 fallback), non-root, one uvicorn worker     | one image, one port                                                                       |
| CI            | GitHub Actions: docker build (phase 1), pytest + npm build (phase 6)                                               | proves the hand-in command on every push                                                  |

Full rationale, alternatives and interview angles: [docs/backend-stack.md](docs/backend-stack.md).
Local versions on 14 Oct 2026: Python 3.14.8, Docker 29.9, Node 26.11.1, npm 12.2, jq 1.8.

## 5. Repository layout (target)

```
solar-sites/
  CLAUDE.md  README.md  Dockerfile  .dockerignore  .gitignore
  .github/     workflows/ci.yml
  docs/        projet-brief.md  plan.md  backend-stack.md  git-workflow.md  python-for-js-devs.md
  frontend/    Vite app; package.json lives here; src/ layout in docs/plan.md §3.6; tokens in src/index.css
  backend/
    requirements.txt  requirements-dev.txt  .venv/ (ignored)  data/ (ignored, SQLite file)
    app/     main.py  db.py  models.py  schemas.py  auth.py  pvgis.py  energy.py  routers/{health,auth,sites,energy}.py
    static/  (ignored; built frontend copied here by Docker)
    tests/   conftest.py  test_auth.py  test_sites.py  test_production.py  test_energy.py  fixtures/
```

## 6. Commands

```bash
# backend (always with the venv active)
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --port 8000      # dev server, docs at http://localhost:8000/docs
pytest -q                                      # tests
ruff check . && ruff format --check .          # lint + format check
pip install -r requirements-dev.txt            # user only

# frontend
cd frontend
npm run dev                                    # http://localhost:5173, /api proxied to :8000
npm run build && npm run lint                  # must pass before every PR

# whole app, the hand-in path
docker build -t solar . && docker run --rm -p 8000:8000 solar
```

## 7. Conventions and security checklist

### Python

- Type hints on every function; `ruff format` style; snake_case in Python, camelCase in JSON via Pydantic
  aliases (`alias_generator=to_camel`, `populate_by_name=True`).
- Routers orchestrate only: validate (Pydantic), authorise (dependencies), call a module, return a schema.
  Business logic lives in `pvgis.py` and `energy.py`; `energy.py` is pure (no I/O, no FastAPI imports).
- Errors: `HTTPException(status_code, detail)` for single messages; `RequestValidationError` handler for
  `{"detail": "Validation failed", "errors": {field: message}}`. Status table: `docs/plan.md` §3.2.
- No bare `except:`; catch the specific exception. Never log passwords, hashes or tokens.
- Timezone-aware datetimes only (`datetime.now(timezone.utc)`).

### TypeScript / React

- `strict` on; no `any`; explicit return types on exported functions.
- `fetch` is called only in `src/api/`. Components receive typed data and callbacks.
- Types in `src/api/types.ts` mirror the contract field names exactly.
- Every async view has loading, error and empty states. Forms are controlled inputs; server field errors
  render under the matching field. Destructive actions confirm.
- Design system: tokens live only in `src/index.css` (`@theme`); components use tokens through utility
  classes; no arbitrary values (`[#hex]`, `[13px]`) in pages; light mode only; WCAG AA contrast; every
  interactive element reachable by keyboard with a visible focus ring. Spec: `docs/plan.md` §3.8.

### Security checklist (used in every `review` and in phase 6)

- Passwords hashed with Argon2id; never stored, logged or returned in plain form.
- Login and register with wrong credentials return one shared 401 message; no user enumeration.
- Session token: `secrets.token_urlsafe(32)`, stored server-side, new token on every login, deleted on
  logout, expiry enforced on every request.
- Cookie: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age` set; `Secure` omitted only because the app runs on
  plain http at localhost:8000 (documented in README).
- CSRF: `X-CSRF-Token` required on every POST/PUT/DELETE that has a session (including logout); compared with
  `hmac.compare_digest`; token bound to the session row; never in a readable cookie.
- Ownership: every site query filters on `user_id` in SQL; a site that is not the caller's returns 404;
  `user_id` and `id` are never read from the request body.
- Validation: server-side ranges per `docs/plan.md` §3.2; query params validated with `Query(...)`.
- No SQL built from strings; only ORM expressions.
- PVGIS: coordinates validated before the call; 30 s timeout; upstream failures mapped to 422/502/504 with a
  message of our own, never the raw upstream body.
- Static serving: the catch-all serves only `static/index.html`; unknown `/api/*` paths return a JSON 404.
- Repository: no secrets, no `.env`, no `*.db`, no `.venv`, no `node_modules`. The repository is public.
- Docker: non-root user, runtime deps only, `.dockerignore` present, `0.0.0.0:8000`.

## 8. Git workflow (summary; details in [docs/git-workflow.md](docs/git-workflow.md))

- Trunk-based. `main` always builds in Docker. One short-lived branch per phase: `type/topic`
  (`feat/auth`, `feat/design-system`, `chore/skeleton`, `fix/...`, `docs/...`). No branches per layer.
- Conventional Commits with scopes `auth sites pvgis energy api web design docker ci deps docs`. Commit when
  green. Backend and frontend of one slice in separate commits.
- One PR per phase, self-reviewed on GitHub plus `review` here, merged with a merge commit (not squash),
  branch deleted.
- Public repository; `CLAUDE.md` and `docs/` are committed; README carries an AI-usage paragraph.
- CI runs `docker build` from phase 1; branch protection on `main` (require PR + green CI) after phase 1.
- The user runs every git and gh command. Claude only reads git state.
- Hand-in: tag `v1.0.0`, clean-clone Docker test, submit the link before Monday 12:00.

## 9. Decision log

Status: **decided** (by the user), **default** (Claude's recommendation, explained to the user on the date
shown, applied until the user says `change #n`), **done**.

| #   | Date       | Decision                                                                                                                                                                                                                                                                                         | Why                                                                                                                                                                                                                                | Status                    |
| --- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 1   | 2026-10-13 | Frontend: Vite + React + React Router + Tailwind, managed with npm in `frontend/`                                                                                                                                                                                                                | SPA served by the Python backend; user's strongest skills                                                                                                                                                                          | decided                   |
| 2   | 2026-10-13 | Backend: FastAPI + SQLModel + SQLite + httpx + argon2-cffi + pytest; pip + venv + `requirements.txt`, not uv                                                                                                                                                                                     | Fits one container on one port; tools the user can explain; uv compared and rejected by the user                                                                                                                                   | decided                   |
| 3   | 2026-10-13 | Sessions: opaque random token in a `sessions` table; HttpOnly SameSite=Lax cookie; `csrfToken` in JSON; `X-CSRF-Token` on POST/PUT/DELETE                                                                                                                                                        | Revocable on logout; contract's cookie option; the CSRF check is one dependency function (reconfirmed 14 Oct as the simplest safe option)                                                                                          | decided                   |
| 4   | 2026-10-13 | Work mode: the user writes all code; Claude explains, outlines and reviews                                                                                                                                                                                                                       | Brief: candidate must explain every line in the interview                                                                                                                                                                          | decided                   |
| 5   | 2026-10-14 | Next.js scaffold replaced by Vite (`frontend/` is now Vite + React 19 + Router 7 + Tailwind 4)                                                                                                                                                                                                   | See 1                                                                                                                                                                                                                              | done                      |
| 6   | 2026-10-14 | Docs layout: `CLAUDE.md` at the root (rules + decisions); `docs/` holds the brief, plan, backend stack, git workflow, Python primer                                                                                                                                                              | One place per concern; CLAUDE.md stays loadable every session                                                                                                                                                                      | decided                   |
| 7   | 2026-10-14 | Assist ladder L0–L4; backend defaults to all levels, frontend to L4; request vocabulary §3.5; stuck protocol §3.6 with a ten-line chat-only snippet after two attempts                                                                                                                           | User's stated preference; more depth where experience is lowest                                                                                                                                                                    | decided                   |
| 8   | 2026-10-14 | Git: trunk-based, one branch per phase (not per layer), Conventional Commits, one self-reviewed PR per phase, merge commits (not squash)                                                                                                                                                         | Slices are only testable end to end; merge commits keep the per-layer history                                                                                                                                                      | decided                   |
| 9   | 2026-10-14 | HTTP status codes per `docs/plan.md` §3.2 (201 create, 204 logout/delete, 401 no session, 403 CSRF, 404 not-owned, 409 duplicate, 422 validation and PVGIS no-data, 502/504 PVGIS)                                                                                                               | Each code answers "whose fault, what can the client do"; no existence leak                                                                                                                                                         | decided                   |
| 10  | 2026-10-14 | Error body `{"detail": msg}`; validation adds `"errors": {camelCaseField: msg}`                                                                                                                                                                                                                  | FastAPI default plus the brief's "message per field"                                                                                                                                                                               | decided                   |
| 11  | 2026-10-14 | `GET /api/me` returns `{email, csrfToken}` so a page refresh recovers the CSRF token without a JS-readable cookie                                                                                                                                                                                | Simplest safe option: token lives in React memory, cookie stays HttpOnly                                                                                                                                                           | decided                   |
| 12  | 2026-10-14 | Primary keys are random UUIDs (`uuid4`) on all three tables; ids travel as strings in JSON and URLs; another user's id returns 404; a malformed id returns 422                                                                                                                                   | User's choice: not guessable, reveal nothing about volume, read as production-grade. The ownership filter remains the real protection                                                                                              | decided                   |
| 13  | 2026-10-14 | PVGIS: PVcalc and seriescalc both with `loss=14`, `optimalangles=1`; seriescalc with `pvcalculation=1`, year 2023; 30 s timeout; in-memory cache keyed by (lat, lon, kWp)                                                                                                                        | Verified: both calls then agree (5341 vs 5338 kWh); seriescalc is slow                                                                                                                                                             | decided                   |
| 14  | 2026-10-14 | Consumption model: `annualUseKwh` spread with a fixed 24-hour two-peak profile, identical every day, UTC offset ignored but documented; battery simulated hourly, 90 % round-trip applied on discharge, starts empty, no power limit                                                             | Simplest honest model; avoids the midday overstatement of a flat profile (explained 14 Oct)                                                                                                                                        | default                   |
| 15  | 2026-10-14 | `requirements.txt` is `pip freeze` output taken when only the six runtime packages are installed (pins transitive deps too); `requirements-dev.txt` is hand-written: `-r requirements.txt` plus pytest and ruff pinned. Changed from hand-pinned direct deps on 2026-10-14 at the user's request | Reproducible Docker build whenever the reviewers run it; dev tools stay out of the image. The six direct packages are documented in the README and `docs/backend-stack.md`, which covers the lost "which did I choose" information | decided                   |
| 16  | 2026-10-14 | Not used: JWT, CORS middleware, Alembic, dotenv, chart library, TanStack Query, react-hook-form                                                                                                                                                                                                  | Fewer dependencies to explain; CSS bars and controlled inputs confirmed by the user                                                                                                                                                | decided                   |
| 17  | 2026-10-14 | Docker: `node:24-alpine` build stage → `python:3.14-slim` runtime (3.13 fallback), non-root user, one uvicorn worker, SQLite at `data/solar.db`                                                                                                                                                  | Matches local Python 3.14.8; Node 24 is the current LTS (local is 26.11.1; the lockfile makes the difference irrelevant)                                                                                                           | decided                   |
| 18  | 2026-10-14 | Backend tests required (auth, ownership, validation, CSRF, energy maths, PVGIS error mapping); frontend unit tests skipped                                                                                                                                                                       | Grading is on correctness and safety; time                                                                                                                                                                                         | decided                   |
| 19  | 2026-10-14 | Email via `EmailStr` (`pydantic[email]`); password 8 to 128 characters, no complexity rules                                                                                                                                                                                                      | One word, widely recognised; argon2 handles long inputs (explained 14 Oct)                                                                                                                                                         | default                   |
| 20  | 2026-10-14 | Sessions expire 7 days after login (fixed, not sliding); logout requires a session and CSRF; logout without a session returns 401                                                                                                                                                                | Standard for an internal tool; one timestamp compare (explained 14 Oct)                                                                                                                                                            | default                   |
| 21  | 2026-10-14 | Ownership helper `get_owned_site(id, user, db)` shared by get/put/delete                                                                                                                                                                                                                         | One place to get the authorisation right                                                                                                                                                                                           | decided                   |
| 22  | 2026-10-14 | Deadline Monday 19 Oct 12:00; plan completes Sunday night; eight to ten hours a day; `month` is the integer 1 to 12                                                                                                                                                                              | User's answers A1, A2, D9                                                                                                                                                                                                          | decided                   |
| 23  | 2026-10-14 | Repository is public; `CLAUDE.md` and `docs/` are committed; README has an AI-usage paragraph                                                                                                                                                | Transparency about AI use; the brief allows it and asks for explanations, which the docs provide                                                                                                                                   | decided                   |
| 24  | 2026-10-14 | CI: GitHub Actions workflow; docker build job in phase 1, pytest and npm build jobs in phase 6                                                                                                                                                                                                   | Proves the hand-in command on every push                                                                                                                                                                                           | decided                   |
| 25  | 2026-10-14 | Branch protection on `main` (require PR, require the CI check) enabled after the phase 1 PR                                                                                                                                                                                                      | Seatbelt for a solo workflow; after phase 0 because phase 0 commits directly to `main`                                                                                                                                             | default                   |
| 26  | 2026-10-14 | Design system: Tailwind 4 `@theme` tokens (colour roles, type scale, radii, shadows, focus ring), light mode only, base components; built Thursday evening in a two-hour timebox (phase 1b), polish pass of two hours in phase 6                                                                 | Design is the user's differentiator; timeboxed so features stay on schedule                                                                                                                                                        | decided (timing: default) |
| 27  | 2026-10-14 | Claude explains Python syntax from JavaScript the first time each construct appears (L0); primer at `docs/python-for-js-devs.md`                                                                                                                                                                 | User has no Python                                                                                                                                                                                                                 | decided                   |
| 28  | 2026-10-14 | No Claude Code hook. CLAUDE.md §3.2 and the user's diff review are the only guardrail                                                                                                                                                                                                            | Time is better spent on the project than on Claude Code configuration                                                                                                                                                              | decided                   |
| 29  | 2026-10-14 | Claude lists every command run and every docs edit in its reply                                                                                                                                                                                                                                  | User wants visibility of actions outside the chat                                                                                                                                                                                  | decided                   |
| 30  | 2026-10-14 | Deployment considered only after hand-in; never paid hosting                                                                                                                                                                                                                                     | Brief: optional; time                                                                                                                                                                                                              | decided                   |

## 10. Open questions

None blocking. Rows marked **default** in §9 (14, 19, 20, 25, and the timing of 26) apply until the
user says `change #n`. Anything new goes here first, then into §9 once answered.

## 11. Pointers

- Brief: [docs/projet-brief.md](docs/projet-brief.md)
- Plan, status codes, data model, PVGIS facts, energy model, design system: [docs/plan.md](docs/plan.md)
- Package rationale: [docs/backend-stack.md](docs/backend-stack.md)
- Python syntax from JavaScript: [docs/python-for-js-devs.md](docs/python-for-js-devs.md)
- Git and GitHub: [docs/git-workflow.md](docs/git-workflow.md)
- PVGIS API docs: https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis/getting-started-pvgis/api-non-interactive-service_en
- Tailwind 4 theme variables: https://tailwindcss.com/docs/theme
