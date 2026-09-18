# CLAUDE.md — session guidance for this repo

This file is loaded automatically at the start of every Claude Code session in
this repo. Keep it short. Longer notes belong in `docs/` or per-feature READMEs.

---

## Agent contracts

Overview: [`docs/herald/README.md`](docs/herald/README.md). Load `agent/contracts/`,
`agent/registry/` on demand only. `npm run brief -- <topic>` before re-deriving.

Answer **lean** — fragments, tables, exact paths. No preamble, no restating the ask.
Default: intent · prior-art verdict · plan · status (proven vs claimed). More only if it
changes the decision.

1. **`.gitignore` is deny-by-default** — `git check-ignore -v <path>` before believing a commit.
2. **Never write task status** — `ViewTube-Task-Index.html` is sole authority; propose only.
3. **Proven ≠ claimed** — code existing ≠ integrated ≠ verified ≠ deployed.
4. **Check first** — 343 branches, 1,598 tasks; `git ls-remote`, the clone is shallow.

## Deployment topology

```
local :5173  →  feature branch  →  PR  →  main  →  Vercel  →  viewtube.live
```

- **`main` is production.** Vercel's **`viewtubebuild`** project
  (`prj_xCtpqziBwueQncNa8sEVKAXAgPbi`) owns the `viewtube.live` and
  `www.viewtube.live` aliases and auto-deploys every commit landed on `main`.
  There is no separate release step.
- Vercel also deploys **preview URLs** for every pushed branch, so pushing a
  feature branch gives you a live URL you can share and inspect without
  touching production.
- **The `viewtube` project does *not* serve `viewtube.live`.** It builds the same
  repo and its aliases are `viewtube-red.vercel.app` plus the per-branch
  `*-cbrewsterart-1584s-projects.vercel.app` hosts. It is useful as a preview
  surface; a green deploy there says nothing about what production is serving.
  Verify the alias list on the deployment before concluding a change is live:

  ```bash
  # which project actually owns the domain
  vercel project ls           # or the Vercel MCP get_project → .domains
  ```

- Both projects share one **Neon** database via the Vercel integration, and the
  free plan caps the org at **10 database branches**. Each preview deployment
  provisions one. When the cap is reached, deployments fail at *Provisioning
  Integrations* with `Resource provisioning failed` and **no build logs** —
  which looks like a broken build but is a quota problem. Delete archived
  `preview/*` branches in Neon, or disable automatic branch creation for
  previews.

## Golden rules

1. **Never dev on `main`.** Cut a short-lived feature branch off `main` for any
   change:
   ```bash
   git checkout main && git pull
   git checkout -b feature/<short-name>
   ```
2. **Push early, merge deliberately.** Pushing the branch gives you a Vercel
   preview URL to compare against production. Merge the PR only when the
   preview looks right — merging is the production deploy.
3. **PRs into `main` only.** No direct commits to `main`, no intermediate
   long-lived integration branches. If a change is big, split it into a stack
   of small PRs rather than an "integration/*" branch that lives for weeks.
4. **Local ↔ production alignment = the PR merge.** To separate them again,
   just cut a new feature branch. Local can drift as far as you want; the
   moment you want the drift live, open a PR.

## Pre-push audit habit

Before pushing a branch that will open a PR to `main`, run the pre-push audit
skill:

```
/codebase-audit-pre-push
```

It scans for junk files, secrets, and root-directory pollution. On this repo,
the `.gitignore` is deny-by-default so most cruft never gets tracked, but the
audit still catches things like generated build artifacts, unreferenced
scripts, and license-sensitive assets.

## Known lint debt (2026-08-23)

`npm run lint:runtime` reports ~1,800 pre-existing errors, mostly
`@typescript-eslint/no-explicit-any` and `no-unused-vars`. This is a debt
inventory, not a new-regression signal: `main` has them all. Until the debt
is paid down in its own dedicated PR, expect `static-quality` on the release
gates to fail — and admin-bypass on merges is the current norm. Fix a slice
of the debt any time you're editing a file for another reason.

## Git playbook

Loss-safety refs before a big consolidation, the pitfalls this workflow avoids, and the
branch-comparison commands: [`docs/herald/GIT-PLAYBOOK.md`](docs/herald/GIT-PLAYBOOK.md).
