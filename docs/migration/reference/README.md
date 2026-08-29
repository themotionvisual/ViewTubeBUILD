# ViewTube system reference — 2026-08-27

This directory is documentation-only. It records the repository, deployment, authentication, analytics, and merge audit anchored to `origin/main` at `f968bdb79e9d59a67ccc27e1c93add6c4396709b`.

## Artifacts

- [`VIEWTUBEX_VS_BRANCH_CHECK_REFRESH_2026-08-29.md`](VIEWTUBEX_VS_BRANCH_CHECK_REFRESH_2026-08-29.md) — refreshed comparison after Simple Auth, YouTube stabilization, editor, VT_E1, and User Guide merges.
- [`VIEWTUBE_UNDEPLOYED_SYSTEMS_AUTH_MERGE_INDEX_2026-08-27.md`](VIEWTUBE_UNDEPLOYED_SYSTEMS_AUTH_MERGE_INDEX_2026-08-27.md) — primary evidence, ratings, source-of-truth decision, and merge plan.
- [`VIEWTUBE_UNDEPLOYED_SYSTEMS_INDEX_2026-08-27.json`](VIEWTUBE_UNDEPLOYED_SYSTEMS_INDEX_2026-08-27.json) — machine-readable index of active candidates and deployment topology.
- [`VIEWTUBE_AUTH_ARCHITECTURE_REVIEW_2026-08-27.html`](VIEWTUBE_AUTH_ARCHITECTURE_REVIEW_2026-08-27.html) — visual architecture review.

## Scope and safety

- No application source was changed.
- No branch was merged, rebased, reset, or deleted.
- Dirty worktrees were inspected read-only and remain untouched.
- Vercel findings use GitHub deployment/status records because the local Vercel CLI is not authenticated.
- “Deployed” means present on the audited `main` commit and attached to a successful production deployment record. A successful preview or build is not production.
