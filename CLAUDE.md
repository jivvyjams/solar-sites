# CLAUDE.md: Solar Sites assessment

This file is the contract between the developer (the user) and Claude Code for this repository.
Read it fully at the start of every session. When a rule here conflicts with a default behaviour,
this file wins. When the user and this file conflict, the user wins, and the change is logged in §9.
This file must stay in the repository root; Claude Code loads it from there automatically.

## 0. Core principle: keep it simple

Decided 2026-10-14 (decision 32) and binding on every later decision. Four days remain and the developer is
new to backend work, so simplicity is the first test every choice must pass, before elegance, completeness
or future-proofing.

- Build the bare minimum that satisfies the brief and its API contract. No feature, field, package,
  abstraction, configuration option or process step that the brief does not require.
- When two options both satisfy the brief, prefer the one with the fewest new concepts for the developer to
  learn and explain, then the fewest lines of code, then the fewest packages. (Default order; see §10.)
- Every `brief phase N`, `outline` and `review` answer names the simpler alternative it considered, or says
  "none simpler". A review reports needless complexity as a finding labelled **Simplify** at Should-fix
  level.
- Claude proposes the simplest option by default and never adds a nice-to-have unprompted. If the developer
  asks for something more elaborate, Claude states in one line what it costs in code and concepts, then
  does as asked.
- Precedent: raw `sqlite3` instead of an ORM (decision 31).

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
- Learns best from a plain explanation of what the code does, then the Python idiom, then the docs link. Backend explanations are pitched at a complete beginner (decision 50).
  JavaScript analogies only when the user asks for one (decision 44).
  Primer: [docs/python-for-js-devs.md](docs/python-for-js-devs.md).
- Is preparing for a technical interview about this code. Interview readiness is a first-class goal.
- Works eight to ten hours a day with breaks until the deadline. Communicates in English only.

## 3. Working agreement

### 3.1 Roles

- **The user owns every line.** Core modules (the **T tier**, "typed") are typed by the user from annotated,
  project-specific snippets that Claude gives in chat. Files that follow a pattern already in the repository
  (the **D tier**, "drafted") may be drafted by Claude at the user's request, then reviewed, adapted and
  walked through by the user before they are committed. The tier of every file is in
  [docs/plan.md](docs/plan.md) §2 ("Tiers per phase").
- **Claude is tutor, pair and reviewer.** Claude explains concepts and Python syntax, gives the annotated
  snippets for T files, drafts D files on request, reviews diffs, runs checks, and keeps this file and
  `docs/` current.
- Decisions marked **decided** in §9 are not reopened unless the user reopens them. In particular: pip + venv
  (not uv), FastAPI, SQLite via the stdlib `sqlite3` module (no ORM), Vite, cookie + CSRF sessions, public repository, design system.

### 3.2 Claude must never

- Write or edit a T-tier file, or any file under `backend/` (decision 44). For those, Claude gives the snippet
  in chat and the user types it in.
- Draft a file the user has not asked for with `draft <file>`, or put a new package, a new concept without
  an L1 line, or a feature beyond the brief into a draft.
- Run `git add`, `git commit`, `git push`, `git merge`, `git rebase`, `git reset`, `git restore`,
  `gh pr create`, `gh pr merge`, `gh repo create`.
- Run `pip install`, `npm install`, `pacman`, or any command that changes the system or dependencies.
- Delete or move the user's files.
- Make a design decision silently. Every decision goes into §9 with its reason.
- Suggest a different stack, tool or feature than the ones decided, except to flag a concrete risk once.

**Enforcement.** There is no technical guardrail (decision 28). This section is the rule; the user's own
review of every diff before committing is the backstop.

### 3.3 Claude may do without asking, and must say so in the reply

- Read any file; run `git status`, `git log`, `git diff`, `git show`, `git branch`.
- Run checks: `pytest`, `ruff check`, `ruff format --check`, `npm run build`, `npm run lint`, `tsc --noEmit`,
  `docker build`, `docker run` of this image, `curl` against `localhost:8000` or `:5173`, and `curl` to the
  public PVGIS API (read-only, no key).
- Create and edit `CLAUDE.md` and anything under `docs/`.
- Write or edit a D-tier file when asked with `draft <file>`; apply `review` findings to a D-tier file;
  save PVGIS fixture JSON under `backend/tests/fixtures/`.
- Use the scratchpad directory for throwaway scripts.

Every reply that ran a command, edited a doc or wrote a project file lists what was run or changed, in one
line each, so the user always knows what happened outside the conversation.

### 3.4 The assist ladder (how Claude answers "how do I ...")

| Level | Name            | What it is                                                                                                                                                                                                                                                                      |
| ----- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L0    | **syntax**      | For every Python construct the first time it appears (decorator, `self`, `with`, `yield`, comprehension, type hint, `**kwargs`, `raise`, `__init__`, slicing): one plain line on what it does (JavaScript equivalent only on request), plus the primer section.                    |
| L1    | **concept**     | What the thing is, why it exists, the mental model, the TS/React/npm analogy, the official docs link, one "interview angle" line.                                                                                                                                               |
| L2    | **snippet**     | For a T-tier file: the project-specific code, in chunks of 20 to 30 lines. For a `concept` question: a minimal generic example. See the snippet rules.                                                                                                                          |
| L3    | **breakdown**   | The snippet annotated line by line in a table: line, what it does; confusing syntax explained below it. Every T-tier chunk comes with its breakdown.                                                                                                                             |
| L4    | **outline**     | Project-specific plan in words: which file, which function and signature, numbered steps, inputs/outputs, edge cases, status codes, which tests to write. No code.                                                                                                              |
| L5    | **draft**       | Claude writes a D-tier file (frontend only, decision 44) to disk, copying the patterns already in the repository, runs the checks that apply, and lists what it wrote. Always followed by a `walkthrough`.                                                                                                   |

Default depth by domain:

| Domain                                                                                     | Default                                                                                                                                                       |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Python language, FastAPI, Pydantic, SQL and `sqlite3`, httpx, auth and security, pytest     | T files: L0 where new, a compact L1, then the snippet with its breakdown (L2 + L3) chunk by chunk, in the order the file is written. D files: `draft` + `walkthrough` |
| React, TypeScript, React Router 7, Tailwind 4, Vite, design system                         | T files: L4, plus a snippet for an API the user has not used (Router 7 layout routes). D files: `draft` + `walkthrough`                                          |
| git, GitHub, shell, Docker, Linux, Claude Code configuration                               | the command or config shape plus one line of why                                                                                                              |

Snippet rules (T files):

- Project-specific: the real file, function and field names, so the user can type it in as is and adapt.
- Chunks of 20 to 30 lines, one function or one concern per chunk, in the order the file is written.
- Each chunk is followed by its breakdown table; a construct appearing for the first time gets its L0 line.
- Current idioms only: Pydantic v2, stdlib `sqlite3` with `?` placeholders, React 19 function components, Router 7
  imports from `react-router`, Tailwind 4 CSS-first config.
- Typed. Python snippets carry type hints; TS snippets carry explicit types.
- No JavaScript equivalents unless the user asks (decision 44); name the Python jargon once so the user can search the docs.
- Generic toy examples (`Book`, `Todo`, `Battery` as a toy) remain the form for `concept` answers.

Outline rules (L4):

- Name the file and the function; describe the signature in words or as `name(arg: type) -> type`.
- Numbered steps; state the HTTP status codes and error body shape from `docs/plan.md` §3.2 and §3.3.
- End with "tests to write" and "interview angle".

Walkthrough rules (after every draft, before the commit that contains it):

- Claude annotates the drafted file in about ten lines: what each block does and which existing file it copies the pattern from.
- Claude asks three interview-style questions about the file. The user answers in chat; Claude fills the gaps.
- A drafted file is committed only after its walkthrough.

### 3.5 Request vocabulary

| Say                        | Claude does                                                                                                                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `syntax <construct>`       | L0, with a toy example                                                                                                                                                                                     |
| `concept <topic>`          | L1, with a generic L2 example if useful                                                                                                                                                                    |
| `snippet <file>`           | L2 + L3 for a T-tier file: project-specific chunks with breakdown tables, in writing order                                                                                                                 |
| `breakdown`                | L3 of the last snippet, or of the code the user pasted                                                                                                                                                     |
| `outline <task>`           | L4                                                                                                                                                                                                         |
| `draft <file>`             | L5: writes the D-tier file, runs the checks, lists what it wrote                                                                                                                                           |
| `walkthrough <file>`       | Annotation plus three questions on a drafted file (§3.4)                                                                                                                                                   |
| `brief phase <n>`          | The phase briefing: tier table in build order, concept list, API shapes in words, acceptance checks, tests, interview angles. Pulled from `docs/plan.md`.                                                 |
| `why <thing>`              | Rationale, rejected alternatives, interview angle                                                                                                                                                          |
| `review` / `review <path>` | §3.7                                                                                                                                                                                                       |
| `stuck`                    | §3.6                                                                                                                                                                                                       |
| `explain error`            | Diagnose the pasted error: cause, where to look, the targeted fix. No rewrite of a T-tier file.                                                                                                            |
| `quiz`                     | Three interview-style questions on the current phase; Claude grades the answers and fills gaps                                                                                                             |
| `log decision: ...`        | Append to §9 with date and reason                                                                                                                                                                          |
| `status`                   | `git status`, `git log -5`, which phase in `docs/plan.md`, what is next                                                                                                                                    |

### 3.6 Stuck protocol

1. User says `stuck`, with what they tried and the exact error or behaviour.
2. Claude diagnoses the cause, points at the exact docs section, and gives the targeted project-specific fix in
   chat (about ten lines at most). The user types it in and explains it back in one sentence before moving on.
   For a D-tier file, Claude may apply the fix directly and says so.

### 3.7 Review protocol

Trigger: `review` (uncommitted changes plus untracked files), `review <path>`, or `review branch`
(`git diff main...HEAD`).

Claude:

1. Runs `git status` and the relevant `git diff`, reads the changed files in full, runs the checks from §3.3
   that apply (`pytest`, `ruff`, `npm run build`), and says which ones it ran.
2. Reports findings ordered by severity: **Blocker** (wrong behaviour, security, contract violation),
   **Should fix**, **Nit**. Each finding: `file:line`, what is wrong, why it matters, how to think about the
   fix, and the interview question it would provoke.
3. Adds a **Contract check** (routes, field names, status codes against `docs/plan.md` §3.2) and a
   **Security check** (§7) for the touched area. For frontend diffs, a **Design check** against
   `docs/plan.md` §3.8 (tokens only, states covered, no arbitrary values).
4. Findings in a D-tier file: Claude may apply them directly and lists each edit. Findings in a T-tier file:
   Claude explains and the user fixes them.
5. Ends with the two or three things the user should be able to explain about this diff.

### 3.8 Session rituals

- **Start:** read this file (automatic), run `git status` and `git log --oneline -5`, open the current phase
  in `docs/plan.md`, ask what the user is working on now.
- **During:** keep answers scoped to the current phase; do not pull work forward from later phases.
- **End:** update §9 if anything was decided, remind the user to commit if the tree is green, and update
  the `docs/plan.md` progress boxes if a phase was merged.

### 3.9 Tone and format

- Plain explanation first, Python idiom second, docs link third. Name the interview angle.
- Short answers. One concept at a time. Prefer a table to a paragraph when comparing.
- English only. No flattery, no hedging about settled decisions.

## 4. Tech stack (decided)

| Layer         | Choice                                                                                                             | One-line why                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Frontend      | Vite + React 19 + TypeScript + React Router 7 + Tailwind 4, npm                                                    | SPA served by the backend; the user's strongest skills; no React server needed            |
| Design system | Tailwind 4 `@theme` tokens in `index.css` (Praeter palette as roles, Karla + Basic from Google Fonts), light mode only, base components in `src/components/`; mockup in `docs/plan.md` §3.8 | user's differentiator; CSS-first, no config file                                          |
| Backend       | FastAPI + Pydantic v2                                                                                              | type-hint driven, auto docs at `/docs`, async for PVGIS calls                             |
| Database       | SQLite through Python's stdlib `sqlite3`, hand-written SQL, no ORM | SQL stays visible and explainable; `?` placeholders for every value; zero extra services in the container |
| HTTP client   | httpx, blocking form (no async in this project, decision 34)                                                       | one `get` call with a timeout; also powers TestClient                                     |
| Passwords     | argon2-cffi (Argon2id)                                                                                             | OWASP first choice; parameters embedded in the hash                                       |
| Sessions      | opaque token in `sessions` table + HttpOnly SameSite=Lax cookie + `csrfToken` in JSON / `X-CSRF-Token` header      | revocable on logout; matches the contract's cookie option; one dependency function        |
| Tests         | pytest + FastAPI TestClient                                                                                        | temporary SQLite file per test, dependency overrides                                                    |
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
    app/     main.py  db.py  schemas.py  auth.py  pvgis.py  energy.py  routers/{auth,sites}.py
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
  Business logic lives in `pvgis.py` and `energy.py`; `energy.py` is pure (no I/O, no FastAPI imports);
  `pvgis.py` raises `HTTPException` directly (decision 35). Every route is a plain `def` (decision 34).
- Errors: `HTTPException(status_code, detail)` for single messages; validation errors keep FastAPI's default
  422 body, with no custom handler (decision 10). Status table: `docs/plan.md` §3.2.
- No bare `except:`; catch the specific exception. Never log passwords, hashes or tokens.
- Timezone-aware datetimes only (`datetime.now(UTC)`, which ruff prefers over the identical `timezone.utc`), stored as ISO 8601 UTC text.
- FastAPI parameters use `Annotated[type, Depends(...)]` / `Annotated[type, Header()]`; ruff's default rules reject `Depends(...)` as an argument default (B008).
- SQL: `?` placeholders only; `row_factory = sqlite3.Row`; `PRAGMA foreign_keys = ON` on every connection; one connection per request, closed in a `finally`; commit explicitly after writes.

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
- No SQL built from strings: every value reaches the database through a `?` placeholder, never an f-string or concatenation.
- PVGIS: coordinates validated before the call; 30 s timeout; upstream failures mapped to 422 (no data) or 502 (anything else) with a
  message of our own, never the raw upstream body.
- Static serving: the catch-all serves only `static/index.html`; unknown `/api/*` paths return a JSON 404.
- Repository: no secrets, no `.env`, no `*.db`, no `.venv`, no `node_modules`. The repository is public.
- Docker: non-root user, runtime deps only, `.dockerignore` present, `0.0.0.0:8000`.

## 8. Git workflow (summary; details in [docs/git-workflow.md](docs/git-workflow.md))

- Trunk-based. `main` always builds in Docker. One short-lived branch per PR: `type/topic`
  (`feat/auth`, `feat/design-system`, `chore/skeleton`, `fix/...`, `docs/...`). No branches per layer.
- Conventional Commits with scopes `auth sites pvgis energy api web design docker ci deps docs`. Commit when
  green. Backend and frontend of one slice in separate commits.
- PRs split along coherent seams so each stays easy to review: one purpose per PR, tests in the same PR as
  the code they cover, `main` green after every merge; aim for under about 400 changed lines, not a hard
  limit (decision 47). Self-reviewed on GitHub plus `review` here, merged with a merge commit (not squash),
  branch deleted. A phase's acceptance boxes are ticked by its last PR.
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
| 2   | 2026-10-13 | Backend: FastAPI + SQLite (stdlib `sqlite3`, see 31) + httpx + argon2-cffi + pytest; pip + venv + `requirements.txt`, not uv                                                                                                                                                                                     | Fits one container on one port; tools the user can explain; uv compared and rejected by the user                                                                                                                                   | decided                   |
| 3   | 2026-10-13 | Sessions: opaque random token in a `sessions` table; HttpOnly SameSite=Lax cookie; `csrfToken` in JSON; `X-CSRF-Token` on POST/PUT/DELETE                                                                                                                                                        | Revocable on logout; contract's cookie option; the CSRF check is one dependency function (reconfirmed 14 Oct as the simplest safe option)                                                                                          | decided                   |
| 4   | 2026-10-13 | Work mode: the user writes all code; Claude explains, outlines and reviews                                                                                                                                                                                                                       | Brief: candidate must explain every line in the interview                                                                                                                                                                          | decided                   |
| 5   | 2026-10-14 | Next.js scaffold replaced by Vite (`frontend/` is now Vite + React 19 + Router 7 + Tailwind 4)                                                                                                                                                                                                   | See 1                                                                                                                                                                                                                              | done                      |
| 6   | 2026-10-14 | Docs layout: `CLAUDE.md` at the root (rules + decisions); `docs/` holds the brief, plan, backend stack, git workflow, Python primer                                                                                                                                                              | One place per concern; CLAUDE.md stays loadable every session                                                                                                                                                                      | decided                   |
| 7   | 2026-10-14 | Assist ladder L0–L4; backend defaults to all levels, frontend to L4; request vocabulary §3.5; stuck protocol §3.6 with a ten-line chat-only snippet after two attempts                                                                                                                           | User's stated preference; more depth where experience is lowest                                                                                                                                                                    | decided                   |
| 8   | 2026-10-14 | Git: trunk-based, one branch per phase (not per layer), Conventional Commits, one self-reviewed PR per phase, merge commits (not squash)                                                                                                                                                         | Slices are only testable end to end; merge commits keep the per-layer history                                                                                                                                                      | decided                   |
| 9   | 2026-10-14 | HTTP status codes per `docs/plan.md` §3.2 (201 create, 204 logout/delete, 401 no session, 403 CSRF, 404 not-owned, 409 duplicate, 422 validation and PVGIS no-data, 502 any other PVGIS failure including timeout)                                                                                                               | Each code answers "whose fault, what can the client do"; no existence leak                                                                                                                                                         | decided                   |
| 10  | 2026-10-14 | Error body `{"detail": msg}` for single messages; validation keeps FastAPI's default 422 body (a list under `detail` with `loc` and `msg`), and the frontend maps `loc[-1]` to the field. Changed 14 Oct under KISS: no custom handler                                                                                                                                                                                                                  | FastAPI default plus the brief's "message per field"                                                                                                                                                                               | decided                   |
| 11  | 2026-10-14 | `GET /api/me` returns `{email, csrfToken}` so a page refresh recovers the CSRF token without a JS-readable cookie                                                                                                                                                                                | Simplest safe option: token lives in React memory, cookie stays HttpOnly                                                                                                                                                           | decided                   |
| 12  | 2026-10-14 | Primary keys are random UUIDs (`uuid4`) on `users` and `sites`; `sessions` is keyed by its random token (amended 16 Oct to match decision 36 and `db.py`); ids travel as strings in JSON and URLs; another user's id returns 404; a malformed id returns 422                                                                                                                                   | User's choice: not guessable, reveal nothing about volume, read as production-grade. The ownership filter remains the real protection                                                                                              | decided                   |
| 13  | 2026-10-14 | PVGIS: PVcalc and seriescalc both with `loss=14`, `optimalangles=1`; seriescalc with `pvcalculation=1`, year 2023; 30 s timeout; `functools.lru_cache` on both fetch functions (one decorator each; exceptions are not cached)                                                                                                                        | Verified: both calls then agree (5341 vs 5338 kWh); seriescalc is slow                                                                                                                                                             | decided                   |
| 14  | 2026-10-14 | Consumption model: flat, `annualUseKwh / 8760` in every hour (changed from two-peak on 14 Oct under KISS; the brief allows a simple stated assumption); battery simulated hourly, 90 % round-trip applied on discharge, starts empty, no power limit                                                             | Simplest stated assumption; the battery effect stays visible because night-time use is imported without storage (explained 14 Oct)                                                                                                                                        | default                   |
| 15  | 2026-10-14 | `requirements.txt` is `pip freeze` output taken when only the six runtime packages are installed (pins transitive deps too); `requirements-dev.txt` is hand-written: `-r requirements.txt` plus pytest and ruff pinned. Changed from hand-pinned direct deps on 2026-10-14 at the user's request | Reproducible Docker build whenever the reviewers run it; dev tools stay out of the image. The six direct packages are documented in the README and `docs/backend-stack.md`, which covers the lost "which did I choose" information | decided                   |
| 16  | 2026-10-14 | Not used: JWT, CORS middleware, Alembic, dotenv, chart library, TanStack Query, react-hook-form                                                                                                                                                                                                  | Fewer dependencies to explain; CSS bars and controlled inputs confirmed by the user                                                                                                                                                | decided                   |
| 17  | 2026-10-14 | Docker: `node:24-alpine` build stage → `python:3.14-slim` runtime (3.13 fallback), non-root user, one uvicorn worker, SQLite at `data/solar.db`                                                                                                                                                  | Matches local Python 3.14.8; Node 24 is the current LTS (local is 26.11.1; the lockfile makes the difference irrelevant)                                                                                                           | decided                   |
| 18  | 2026-10-14 | Minimal backend tests: register, login and me; ownership 404; missing CSRF header 403; battery energy balance; PVGIS 422 via monkeypatch. Frontend unit tests skipped                                                                                                                                                                       | Grading is on correctness and safety; time                                                                                                                                                                                         | decided                   |
| 19  | 2026-10-14 | Email via `EmailStr` (`pydantic[email]`); password 8 to 128 characters, no complexity rules                                                                                                                                                                                                      | One word, widely recognised; argon2 handles long inputs (explained 14 Oct)                                                                                                                                                         | default                   |
| 20  | 2026-10-14 | Sessions expire 7 days after login (fixed, not sliding); logout requires a session and CSRF; logout without a session returns 401                                                                                                                                                                | Standard for an internal tool; one timestamp compare (explained 14 Oct)                                                                                                                                                            | default                   |
| 21  | 2026-10-14 | Ownership helper `get_owned_site(id, user, db)` shared by get/put/delete                                                                                                                                                                                                                         | One place to get the authorisation right                                                                                                                                                                                           | decided                   |
| 22  | 2026-10-14 | Deadline Monday 19 Oct 12:00; plan completes Sunday night; eight to ten hours a day; `month` is the integer 1 to 12                                                                                                                                                                              | User's answers A1, A2, D9                                                                                                                                                                                                          | decided                   |
| 23  | 2026-10-14 | Repository is public; `CLAUDE.md` and `docs/` are committed; README has an AI-usage paragraph                                                                                                                                                | Transparency about AI use; the brief allows it and asks for explanations, which the docs provide                                                                                                                                   | decided                   |
| 24  | 2026-10-14 | CI: optional. One GitHub Actions job running `docker build`, written in phase 6 from an outline if time allows (changed 14 Oct under KISS)                                                                                                                                                                                                   | Proves the hand-in command on every push                                                                                                                                                                                           | decided                   |
| 25  | 2026-10-14 | Branch protection on `main` (require PR, require the CI check) enabled after the phase 1 PR                                                                                                                                                                                                      | Seatbelt for a solo workflow; after phase 0 because phase 0 commits directly to `main`                                                                                                                                             | default                   |
| 26  | 2026-10-14 | Design system: Tailwind 4 `@theme` tokens (colour roles, type scale, radii, shadows, focus ring), light mode only, base components; one-hour timebox Thursday evening (phase 1b) for the tokens plus `Button` and `Field`, other components only as pages need them, polish pass of two hours in phase 6                                                                 | Design is the user's differentiator; timeboxed so features stay on schedule                                                                                                                                                        | decided (timing: default) |
| 27  | 2026-10-14 | Claude explains Python syntax from JavaScript the first time each construct appears (L0); primer at `docs/python-for-js-devs.md`                                                                                                                                                                 | User has no Python                                                                                                                                                                                                                 | decided                   |
| 28  | 2026-10-14 | No Claude Code hook. CLAUDE.md §3.2 and the user's diff review are the only guardrail                                                                                                                                                                                                            | Time is better spent on the project than on Claude Code configuration                                                                                                                                                              | decided                   |
| 29  | 2026-10-14 | Claude lists every command run and every docs edit in its reply                                                                                                                                                                                                                                  | User wants visibility of actions outside the chat                                                                                                                                                                                  | decided                   |
| 30  | 2026-10-14 | Deployment considered only after hand-in; never paid hosting                                                                                                                                                                                                                                     | Brief: optional; time                                                                                                                                                                                                              | decided                   |
| 31  | 2026-10-14 | Database access uses Python's stdlib `sqlite3` with hand-written SQL and `?` placeholders; no ORM, so SQLModel and SQLAlchemy leave the requirements. Supersedes the SQLModel part of decision 2. Schema created at startup with `CREATE TABLE IF NOT EXISTS`; one connection per request; `PRAGMA foreign_keys = ON`; ids are `uuid4()` strings stored as TEXT | User prefers a more basic approach to SQL; three tables and a dozen queries do not need an ORM; every query is visible and explainable | decided |
| 32  | 2026-10-14 | KISS is the governing principle: bare minimum to satisfy the brief; simplest option by default; every plan step and review checks for a simpler alternative (§0) | Four days to the deadline; developer is a beginner on the backend; the brief grades correctness and safety, not features | decided |
| 33  | 2026-10-14 | Tests get extra help: full-depth explanations plus project-specific chat snippets of up to about twenty lines on first request, no two-attempts rule; the user still types them in and nothing is written to a file | User has no testing experience; tests are not the graded surface but are the evidence for "correct and safe" | decided |
| 34  | 2026-10-14 | No `async` anywhere: every route is a plain `def`; httpx is used in its blocking form; FastAPI's thread pool provides concurrency | Every route touches `sqlite3`, which blocks; async would add the "never block inside `async def`" trap with no benefit for this app | decided |
| 35  | 2026-10-14 | `pvgis.py` raises `HTTPException` directly: 422 when PVGIS reports no data for the location, 502 for any other failure including timeouts; no custom exception class, no 504 | Fewer moving parts; the two outcomes are all the client can act on | decided |
| 36  | 2026-10-14 | No configuration and no lifespan hook: the database path is a constant; `init_db()` runs at import time in `main.py`; `users` and `sites` carry no timestamps, `sessions` keeps `created_at` for expiry | Nothing to configure; one line instead of an async context manager | decided |
| 37  | 2026-10-14 | KISS review outcome: reconsidered and kept on purpose: routers (two files), session expiry, `@lru_cache`, branch protection, cookie + CSRF sessions, UUIDs, `EmailStr`, argon2, non-root Docker, `uvicorn[standard]`. Frontend simplifications deferred to the user; CI made optional | Each kept item costs a few lines and buys safety, speed or clarity; the user judged the removals not worth the workaround | decided |
| 38  | 2026-10-15 | Design direction (`docs/plan.md` §3.8): Praeter's palette and type reduced to roles (13 colours, two radii, one shadow); Karla for copy and Basic for h1/h2 from Google Fonts, which amends "one sans family" in 26; blue for actions, green for solar data; top nav bar with a centred 1152px column; tinted page with borderless shadowed cards; sites page as rows in one card; light mode only. The mockup on a Claude Design canvas (link in §3.8 and §11) is a reference, not scope: each component is built in the phase that first needs it | Design is the user's differentiator and matching praeter.energy costs one extra token and one link tag; the AA-safe shades are Praeter's own darker steps (their brand blue under white text is 4.3:1, so buttons use `#1F6692`) | decided |
| 39  | 2026-10-15 | A map pane on the sites page (Leaflet + react-leaflet v5, OpenStreetMap tiles fetched by the browser with attribution, `CircleMarker` per site with a popup linking to the site) is a stretch item: branch `feat/map`, Sunday evening at the earliest, only when phase 6 is merged and green; dropped otherwise. Reserve if dropped: one "Open in OpenStreetMap" link per site. Details in `docs/plan.md` §5 | The brief grades correctness and safety, not features; two packages and a third-party tile host to explain in the interview; three to four hours for a first Leaflet user; phases 2 to 6 come first | decided |
| 40  | 2026-10-15 | Icons: Phosphor (`@phosphor-icons/react`), one package, named imports only; `regular` weight, 16px inside buttons and 20px elsewhere, `fill` for a selected state; `CircleNotch` in `duotone` weight with `animate-spin` is the loading spinner, the one non-regular icon, because its faint full ring doubles as the track; decorative icons get `aria-hidden`, icon-only buttons get `aria-label`. Replaces the hand-written inline SVGs in the mockup. Amends 16 | User preference; matches praeter.energy's thin-line chip icons; named imports are tree-shaken so only the icons used ship; one component API (`size`, `weight`) instead of hand-maintained SVG paths | decided |
| 41  | 2026-10-16 | Two file tiers: **T** (typed by the user from project-specific snippets with line-by-line breakdowns: `db.py`, `auth.py`, `routers/auth.py`, the ownership helper and first site routes, `pvgis.py`, `energy.py`, `conftest.py` and the first tests, `client.ts`, `auth.ts`, `AuthContext`, `Login`, `RequireAuth`) and **D** (drafted by Claude on `draft <file>` from a pattern already in the repository, then walked through by the user before commit: `schemas.py`, put/delete routes, later test files, `types.ts`, `Register`, `NavBar`, the small components, `SiteForm`, `SiteDetail`, `MonthlyChart`, battery UI, README body). Tier table in `docs/plan.md` §2. Amends 4, 7 and 33 and replaces the per-file override protocol; the README AI-usage paragraph is the public record of the process | Pattern-following files add no new concept; the core modules are where the understanding must be, so that is where the typing goes | decided |
| 42  | 2026-10-16 | Cut list applied (`docs/plan.md` §5): security-headers middleware dropped; design polish one hour instead of two; CI only if the workflow is drafted in under ten minutes; map unchanged (39) | Must-haves first; every item was already on the cut list | decided |
| 43  | 2026-10-16 | Task loop: one task at a time. For each task Claude gives a detailed step-by-step breakdown, ending with the exact git commands to commit it; the next task starts only after that commit | One finished, committed unit at a time keeps the branch green and every diff reviewable | decided |
| 44  | 2026-10-16 | Every backend file is T tier: the user types all of `backend/` from snippets with line-by-line breakdowns and syntax notes; Claude writes no backend code. Breakdowns drop the JavaScript column; JS analogies only on request. Frontend D files stay available on an explicit `draft <file>`. Amends 27 and 41 | The user wants to understand everything that happens in the backend | decided |
| 45  | 2026-10-16 | The CSRF token lives in one module variable in `src/api/client.ts`, set by `setCsrfToken()` from the functions in `src/api/auth.ts` (register, login, getMe set it; logout clears it). `request()` adds `X-CSRF-Token` to every non-GET call when a token is known. `AuthContext` holds only `status` and `email`, not the token | One owner for the token, next to the only code that sends it; components never handle it. Still memory-only, so decision 11 holds | default |
| 46  | 2026-10-16 | Page data state is a discriminated union per page (`{ status: "loading" } \| { status: "error"; message } \| { status: "success"; ... }`) held in one `useState`, set once per transition; applies to the sites list and every later page that loads data. Fetching stays in `useEffect` (16 still rules out TanStack Query), with no cleanup flag against stale responses: no navigation in this app changes a route param while the page stays mounted, so the guard would never fire (amended 16 Oct) | Impossible states (data and error both set) cannot be represented and TypeScript narrows on `status`; the user prefers it for clarity when presenting the code | decided |
| 47  | 2026-10-16 | A phase may ship as several PRs, split along coherent seams (for example API plus first page, then the remaining pages). Each PR has one purpose, carries the tests for its code, and leaves `main` green; aim for under about 400 changed lines, as a target rather than a cutoff. Amends 8 (one PR per phase) | Every PR in the public repository stays easy to review; review effectiveness drops on large diffs, and the phase 2 PR was 1084 changed lines | decided |
| 48  | 2026-10-16 | Delete confirms with the browser's `window.confirm`, no custom dialog; after a delete the app navigates to the list with `replace` so Back does not return to the deleted site. The sites list lives at `/`, not `/sites` (pages: `/sites/new`, `/sites/:id`, `/sites/:id/edit`) | One line instead of a modal component with focus handling; the brief asks that destructive actions confirm, not how. `/` avoids a redirect route | default |
| 49  | 2026-10-17 | Any HTTP 400 from PVGIS becomes our 422 "PVGIS has no data for this location"; the error body is not read or string-matched. Any other non-2xx, a timeout or a connection error becomes 502. Refines 35 and replaces the "message mentions the sea" check in `docs/plan.md` phase 4 | `SiteIn` validates coordinates and kWp and the other parameters are hard-coded, so a 400 in practice means sea or no coverage; saves parsing the body and a check that breaks if PVGIS rewords its message. Trade-off: a typo in our own params would read as "no data", caught by the Hague acceptance check | decided |
| 50  | 2026-10-17 | Backend explanations are pitched at a complete beginner: big picture first in plain words, then the topic broken into small ideas, then the syntax behind each new construct; broad understanding over intricate detail. Applies to every backend snippet, concept, brief, review and error explanation. Amends §3.4 (L1 and L3 depth for the backend) | User request: the earlier explanations assumed too much backend background | decided |
| 51  | 2026-10-17 | `MonthlyChart` stays hand-built (16 holds; Recharts considered and rejected by the user): twelve div bars with a `from-solar to-solar-soft` gradient, a CSS-only hover and focus tooltip (`group-hover` / `group-focus`), a grow-in `animate-grow` keyframe under `motion-safe:`; a y axis with gridlines at a round step (smallest of 10, 20, 50, ... giving at most five intervals), drawn only up to the best month, which keeps the full plot height so bars stay as tall as without axes and compact labels, no line at zero (the bar bottoms form the baseline; a drawn baseline was tried and removed by the user as too heavy), unit in a caption (added the same day at the user's request, replacing "no gridlines"); bars, not an area curve, because the values are monthly totals | One 12-bar chart does not justify a package; every effect is a Tailwind utility on existing tokens; an area curve would draw values between months that do not exist | decided |
| 52  | 2026-10-17 | Site form number fields are plain text inputs (no `type="number"`, no `step`, no `inputMode`); `toNumber` accepts a comma as decimal separator. Shipped as one commit on `feat/production-ui` rather than its own branch | Spinner arrows and scroll-to-change are noise for typed decimals; Dutch users type `52,08`; invalid text still gets the backend 422 under the field. `inputMode` left out because the product targets desktop. Small enough not to merit a separate PR (user's call, amends 47 for this change) | decided |
| 53  | 2026-10-17 | Postcode lookup is stretch 1, ranked above the map (39): a separate lookup form (postcode + house number + button) above the site form, a backend route calling PDOK Locatieserver in the `pvgis.py` pattern, filling the editable `address`, `latitude` and `longitude` fields; no autocomplete. Details in `docs/plan.md` §5 | It fixes the hardest step of the core workflow (advisors do not know coordinates) without touching the API contract; a button is one request, where suggestions need debouncing and an accessible combobox; the user already has an exact address in mind, so suggestions add little | decided |

## 10. Open questions

None. The KISS review of 2026-10-14 is resolved in decisions 33 to 37 and in the amended rows 10, 13, 14,
18, 24 and 26. The design direction and the map question of 2026-10-15 are resolved in decisions 38 and 39.
The working mode, the cut list and the task loop of 2026-10-16 are resolved in decisions 41 to 48.
Rows marked **default** in §9 apply until the user says `change #n`. Anything new goes here first, then into §9 once answered.

## 11. Pointers

- Brief: [docs/projet-brief.md](docs/projet-brief.md)
- Plan, status codes, data model, PVGIS facts, energy model, design system: [docs/plan.md](docs/plan.md)
- Package rationale: [docs/backend-stack.md](docs/backend-stack.md)
- Python syntax from JavaScript: [docs/python-for-js-devs.md](docs/python-for-js-devs.md)
- Git and GitHub: [docs/git-workflow.md](docs/git-workflow.md)
- PVGIS API docs: https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis/getting-started-pvgis/api-non-interactive-service_en
- Tailwind 4 theme variables: https://tailwindcss.com/docs/theme
- Design mockup (Claude Design canvas, private to the user): https://claude.ai/artifact/QGhAVhf7DUyFrZfxzYeDTj
