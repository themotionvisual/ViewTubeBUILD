# CLAUDE.md — session guidance for this repo

This file is loaded automatically at the start of every Claude Code session in
this repo. Keep it short. Longer notes belong in `docs/` or per-feature READMEs.

---

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

## Living architecture references

For work touching Projects, Asset Engine, ContentBuild, Video Package, Publishing
Package, creator workflow continuity, or post-publish attribution, read and
update:

- `docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md`
- `docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md`

The first file is the cross-system current-state / target-state / bugs / planned
work authority. Do not split Project, ContentBuild and Video Package identity
without explicitly updating that reference.

## Loss-safety pattern for big consolidations

When multiple branches or long-lived local edits are being merged and any of
them might introduce regressions, always create these three refs first so
nothing can be lost, and mention them in the PR body:

```bash
# 1. Tag the current main so you can always roll back
git tag pre-<name>-$(date +%Y-%m-%d) origin/main

# 2. Branch pointer at the current HEAD of your work
git branch snapshot/pre-<name>-HEAD-$(date +%Y-%m-%d)

# 3. Preserve any uncommitted WT changes as a durable ref (won't be lost by
#    stash pop, reset, or checkout)
SNAP=$(git stash create "pre-<name> local edits $(date +%Y-%m-%d)")
git update-ref refs/snapshots/local-edits-$(date +%Y-%m-%d) "$SNAP"
```

`refs/snapshots/*` are custom refs that don't show up in `git branch` /
`git tag` listings but stay reachable — perfect for "just in case" backups.

## Common pitfalls this workflow avoids

- **Dev server on main during a merge**: files thrash under Vite while you're
  cherry-picking, causing HMR errors and dev-server confusion. Always work on
  a feature branch so your dev server sees a stable target.
- **`git add -A` sweeping unrelated WIP**: name the exact paths you're
  committing. If a stray WIP file is in the WT, snapshot it first (see above)
  before doing anything that could stage everything.
- **`git checkout <ref> -- <path>` also stages**: it updates both the index
  and the working tree. Follow with `git reset HEAD -- <path>` if you want
  the file in the WT but unstaged.
- **Vite `server.fs.deny` on odd filenames**: `!!!Foo:Bar.svg` etc. fail in
  CI even when they load locally. Keep asset filenames simple ASCII.

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

## Reference commands

```bash
# Enumerate branches by recency, remote-side
git for-each-ref --sort=-committerdate \
  --format='%(committerdate:short) %(refname:short)' refs/remotes/origin

# Compute ahead/behind vs main
git rev-list --count origin/main..<branch>   # commits <branch> has, main doesn't
git rev-list --count <branch>..origin/main   # commits main has, <branch> doesn't

# Verify a candidate for deletion has no unique content (patch-equal check)
git cherry origin/main <branch>              # - = present on main; + = unique
```
