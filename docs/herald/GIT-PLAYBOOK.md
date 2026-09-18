# Git playbook

Moved out of `CLAUDE.md`, which is charged against every session. Read when relevant.

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

> Moved out of `CLAUDE.md` 2026-09-18. Note: `/codebase-audit-pre-push` is not present in
> `.claude/commands/` or `agent/skills/` — verify it still exists before relying on it.
