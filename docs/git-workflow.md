# Git and GitHub workflow

Solo developer, five days, one repository you own, graded partly on whether the process looks deliberate.
The goal is a `main` branch that always builds in Docker, a history a reviewer can read like a story, and
checkpoints that force you to re-read your own code before it lands.

## 1. Branching model: trunk-based with one short-lived branch per slice

- `main` is always releasable: every commit on it passes `pytest`, `npm run build`, and `docker build`.
- One branch per vertical slice (phase), merged within a day: `chore/skeleton`, `feat/design-system`,
  `feat/auth`, `feat/sites`, `feat/production`, `feat/battery`, `chore/hardening`.
- Small follow-ups get their own branch too: `fix/csrf-on-logout`, `docs/readme`.
- Phase 0 is the exception: the reset commit goes straight onto `main` because there is nothing to branch from yet.

**Why not `backend` and `frontend` branches?** Every slice touches both layers and is only testable end to
end. Layer branches would need constant cross-merging to try anything, and the history would show "backend"
and "frontend" instead of features. Separate the layers inside a slice by commit, not by branch.

**Why not nested branches like `backend/authentication`?** Git has no real branch hierarchy; the slash is
cosmetic. Nesting adds ceremony without a review or test boundary. One level, `type/topic`, is enough.

## 2. Naming

| Prefix      | Use for                                               | Examples                              |
| ----------- | ----------------------------------------------------- | ------------------------------------- |
| `feat/`     | a slice of the brief                                  | `feat/auth`, `feat/battery`           |
| `fix/`      | a bug found after merge                               | `fix/production-rounding`             |
| `chore/`    | setup, tooling, Docker, dependencies, hardening       | `chore/skeleton`, `chore/ci`          |
| `docs/`     | README, docs/, CLAUDE.md only                         | `docs/readme`                         |
| `test/`     | tests added on their own                              | `test/ownership`                      |
| `refactor/` | behaviour-preserving restructuring                    | `refactor/pvgis-errors`               |

Lowercase, hyphens, short. The topic is a noun, not a sentence.

## 3. Commits

Conventional Commits, so the log reads as a changelog and the interviewer sees intent:

```
<type>(<scope>): <imperative summary, lower case, no period, max 72 chars>

<optional body: what and why, not how; wrap at 72>
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`. Scopes used in this project: `auth`, `sites`,
`pvgis`, `energy`, `api`, `web` (frontend), `design` (tokens and base components), `docker`, `ci`, `deps`, `docs`.

Examples in the order they will probably happen:

```
chore: reset repo to Vite frontend and FastAPI backend skeleton
feat(api): add health endpoint and SPA fallback
chore(docker): multi-stage build serving frontend and API on 8000
feat(auth): add user and session models with argon2 hashing
feat(auth): register, login, logout and me endpoints with CSRF
feat(web): auth context, login and register pages, route guard
test(auth): cover duplicate email, wrong password and missing CSRF
feat(sites): CRUD routes scoped to the current user
feat(web): site list, form and detail pages
feat(pvgis): production endpoint backed by PVcalc with cache
feat(energy): battery simulation and consumption profile
docs: README with run instructions, choices and consumption model
```

Rules:
- Commit when something is green, not when the day ends. A commit is one logical change you could
  explain in one sentence.
- Within a slice, keep backend and frontend in separate commits (`feat(auth)` then `feat(web)`) so each diff
  stays reviewable.
- Stage deliberately: `git add -p` to pick hunks, `git status` and `git diff --staged` before every commit.
- Never commit `node_modules/`, `.venv/`, `dist/`, `*.db`, `.env*`, `__pycache__/`. The root `.gitignore`
  must cover them before the first commit.
- Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` only when Claude
  wrote content in that commit (docs). Code commits are yours alone, which is true, so say so.

## 4. Pull requests: one per slice, self-reviewed

Open a PR when the slice's acceptance checks pass and tests are green. The PR is the moment you re-read your
own diff as a reviewer, which is exactly the interview exercise.

Per PR:
1. Push the branch: `git push -u origin feat/auth`.
2. `gh pr create --fill --base main` (or the web UI). Title = branch purpose. Body = a short list of what
   changed, which acceptance checks you ran, and any decision taken (copy it to the CLAUDE.md decision log).
3. Read the diff on GitHub top to bottom. Fix anything you would not want to explain.
4. Ask Claude `review` locally, fix findings you understand, push again.
5. Merge with a merge commit (`gh pr merge --merge --delete-branch`), not squash (decided). A merge commit
   keeps every commit from the branch and adds one commit that ties them together. A squash merge would
   first flatten all the branch's commits into a single new commit and put only that on `main`, which
   gives a tidy one-line-per-feature history but loses the backend/frontend/test steps you want a
   reviewer to see.
6. `git switch main && git pull`, tick the phase in `docs/plan.md`, start the next branch from `main`.

A PR should live hours, not days. If a slice is dragging, merge the working half behind an obviously
unfinished UI rather than letting the branch drift.

## 5. GitHub setup (phase 0)

1. Create the repository (decided: public): `gh repo create solar-sites --public --source=. --remote=origin --push`.
   Public means the reviewers open the link without an invitation and the repository doubles as a portfolio
   piece. Nothing secret may ever be committed (see §3); there are no secrets in this project by design.
2. Branch protection on `main` (default: enable after the phase 1 PR, once CI exists). Branch protection is a
   GitHub setting (repository Settings → Branches → add a rule for `main`) that refuses direct pushes to
   `main` and only lets changes in through a pull request; it can also require a CI check to be green
   before the merge button works. For a solo repository it is a seatbelt against habit: it makes the PR step
   impossible to skip and makes a red CI block the merge. Tick "Require a pull request before merging" and
   "Require status checks to pass" (select the docker build job). Do it after phase 1, because phase 0
   commits straight to `main`. The repository owner can always lift the rule if it blocks you.
3. GitHub Actions (decided): one workflow at `.github/workflows/ci.yml`. Phase 1 adds the job that runs
   `docker build -t solar .`; phase 6 adds `pytest` in `backend/` and `npm ci && npm run build` in
   `frontend/`. The docker job alone proves the hand-in command on every push. Ask Claude
   `concept GitHub Actions` before writing it: a workflow is YAML that names a trigger (`on`), jobs, a
   runner image, and steps that are shell commands or reusable actions.
4. `CLAUDE.md` and `docs/` stay in the repository (decided). The brief allows AI tools and asks you to
   explain every line. A visible working agreement that records Claude never wrote application code, plus an
   AI-usage paragraph in the README, is transparency that works in your favour.

## 6. Day 0 cleanup (run once, phase 0)

The index currently holds Next.js files that are deleted on disk, and the root `.gitignore` and `README.md`
are Next.js boilerplate. Nothing has been committed yet, so the cleanest move is to unstage everything and
rebuild the index from the real tree.

```bash
cd ~/projects/solar-sites
git reset                                  # unstage everything; nothing is committed yet, nothing is lost
git status --short                          # only untracked files should remain
rm -rf frontend/src/assets frontend/src/App.css   # Vite demo leftovers (keep public/ if you want a favicon)
# the brief already lives at docs/projet-brief.md; the old plan and prompt files are already deleted
```

Replace the root `.gitignore` with entries for: `node_modules/`, `frontend/dist/`, `backend/.venv/`,
`__pycache__/`, `*.pyc`, `.pytest_cache/`, `.ruff_cache/`, `*.db`, `*.sqlite*`, `.env*`, `*.tsbuildinfo`,
`.DS_Store`. (The Vite scaffold's own `frontend/.gitignore` can stay.)

Replace `README.md` with a two-line placeholder (project name, "see docs/plan.md"); the real README is
written in phase 6.

Then:

```bash
git add -A
git status --short                          # read every line; nothing generated, nothing secret
git commit -m "chore: reset repo to Vite frontend and FastAPI backend skeleton"
gh repo create solar-sites --public --source=. --remote=origin --push
```

## 7. Everyday commands

```bash
git switch -c feat/auth                      # new branch from current main
git add -p && git commit                     # stage hunks, write the message in the editor
git log --oneline --graph --decorate -20     # read the story
git diff main...feat/auth                    # everything this branch adds
git stash && git switch main && git pull && git switch - && git stash pop   # park work, update, resume
git restore <file>                           # throw away uncommitted changes in one file
git restore --staged <file>                  # unstage without losing changes
```

Interactive rebase is not needed in this project; if a commit message is wrong and not pushed,
`git commit --amend`.

## 8. Hand-in

1. On `main`, after the last merge: `git tag -a v1.0.0 -m "Solar sites assessment hand-in"` then
   `git push origin v1.0.0`.
2. Clean-clone test in a temporary directory: `git clone <url> /tmp/solar-check && cd /tmp/solar-check &&
   docker build -t solar . && docker run --rm -p 8000:8000 solar`. Walk the manual script in
   `docs/plan.md` §6.
3. Check the repository page: README renders, `Dockerfile` is in the root, no secrets, no database files.
4. If the repository is private, invite the reviewers before sending the link.
