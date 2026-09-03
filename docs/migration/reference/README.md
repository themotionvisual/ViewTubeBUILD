# ViewTube system reference — consolidated branch

**Current refresh:** 2026-09-03  
**Branch:** `codex/docs/viewtube-system-reference-2026-08-27`  
**PR:** #75

This branch is documentation/reference only. It is now the consolidated evidence and architecture index for ViewTube's active development systems, migration decisions, donor branches, Brain stack, analytics/VT-SYNC work, editor work, anomaly intelligence, auth consolidation, and ViewTubeX/branch-check history.

## Start here

1. **[VIEWTUBE_UNIFIED_SYSTEMS_ARCHITECTURE_2026-09-03.md](VIEWTUBE_UNIFIED_SYSTEMS_ARCHITECTURE_2026-09-03.md)** — current master architecture: canonical owners, system atlas, shared contracts, integrated loops, PR/branch consolidation rules, target code spine, and unification roadmap.
2. **[VIEWTUBE_SYSTEM_REFERENCE_REFRESH_2026-09-03.md](VIEWTUBE_SYSTEM_REFERENCE_REFRESH_2026-09-03.md)** — current branch/PR refresh and how newer Brain, ViewTubeX consolidation, editor, and anomaly work changes the older audits.
3. **[VIEWTUBE_DEVELOPMENT_STATUS_2026-09-03.md](VIEWTUBE_DEVELOPMENT_STATUS_2026-09-03.md)** — current Brain/tool integration state, Handoff Inbox, Outcome Ledger, PR #72 production chains, PR #78 anomaly foundation, and next implementation pass.

## Current application-development branches represented

- PR #72 — `themotionvisual/feat/brain-phase-five-production-chains`
- PR #77 — `refactor/viewtubex-clean-consolidation`
- PR #78 — `feature/anomaly-intelligence-foundation`
- PR #66 — `feat/vt-e1-unification-2026-08-27`
- PR #69 — `chore/auth-pr-consolidation-audit`
- PR #75 — this documentation/reference branch

The reference branch does **not** authorize merging those branches wholesale. It records how their systems fit together and what should be harvested or normalized.

## Merge resources

- [PR_78_SAFE_MERGE_TO_MAIN_2026-09-03.md](PR_78_SAFE_MERGE_TO_MAIN_2026-09-03.md) — focused correction, verification, squash-merge, rollback and follow-up plan for landing PR #78 safely on main.

## PR merge + analytics master references

- [PR_77_MAIN_MERGE_VT_SYNC_ANALYTICS_MASTER_REFERENCE_2026-09-03.md](PR_77_MAIN_MERGE_VT_SYNC_ANALYTICS_MASTER_REFERENCE_2026-09-03.md) — full #77→main merge runbook plus VT-SYNC datasets, queries, pagination, storage, CSV, tables, controllers, visuals, insights and deep-dive architecture reference.

## Machine-readable architecture

- [VIEWTUBE_SYSTEM_REGISTRY_2026-09-03.json](VIEWTUBE_SYSTEM_REGISTRY_2026-09-03.json) — canonical owner/status/dependency/branch/PR registry for active ViewTube systems.
- [VIEWTUBE_SYSTEM_INTEGRATION_MATRIX_2026-09-03.md](VIEWTUBE_SYSTEM_INTEGRATION_MATRIX_2026-09-03.md) — implementation crosswalk from system ownership into data, Brain, workflow, safety, evaluation and learning loops.
- [VIEWTUBE_CANONICAL_OWNER_MIGRATION_PLAN_2026-09-03.md](VIEWTUBE_CANONICAL_OWNER_MIGRATION_PLAN_2026-09-03.md) — step-by-step owner migration, donor-branch harvesting rules, retirement gates and implementation waves.

## Current prototype references

- [prototypes/VIEWTUBE_BRAIN_USER_CONTROL_CENTER_2026-09-03.html](prototypes/VIEWTUBE_BRAIN_USER_CONTROL_CENTER_2026-09-03.html) — creator-controlled Brain policy, personalization, learning, safety, retention and per-tool permissions reference.
- [prototypes/ADAPTIVE_BRAIN_ORCHESTRATOR_2026-09-03.html](prototypes/ADAPTIVE_BRAIN_ORCHESTRATOR_2026-09-03.html) — adaptive orchestration reference for goals, profile, ranking, explanation, autonomy mode and approval-gated publishing.

## Historical / migration references

- [BRANCH_CHECK_TO_VIEWTUBEX_RELOCATION_2026-08-30.md](BRANCH_CHECK_TO_VIEWTUBEX_RELOCATION_2026-08-30.md) — local application relocation, preservation, verification and recovery reference.
- [PARENT_DOCUMENTATION_UPDATES_2026-08-30.patch](PARENT_DOCUMENTATION_UPDATES_2026-08-30.patch) — retained documentation-only patch evidence.
- [VIEWTUBEX_VS_BRANCH_CHECK_REFRESH_2026-08-29.md](VIEWTUBEX_VS_BRANCH_CHECK_REFRESH_2026-08-29.md) — refreshed comparison after Simple Auth, YouTube stabilization, editor, VT_E1 and User Guide merges.
- [VIEWTUBE_UNDEPLOYED_SYSTEMS_AUTH_MERGE_INDEX_2026-08-27.md](VIEWTUBE_UNDEPLOYED_SYSTEMS_AUTH_MERGE_INDEX_2026-08-27.md) — original undeployed-system/auth/merge audit; historical snapshot.
- [VIEWTUBE_UNDEPLOYED_SYSTEMS_INDEX_2026-08-27.json](VIEWTUBE_UNDEPLOYED_SYSTEMS_INDEX_2026-08-27.json) — machine-readable historical index.
- [VIEWTUBE_AUTH_ARCHITECTURE_REVIEW_2026-08-27.html](VIEWTUBE_AUTH_ARCHITECTURE_REVIEW_2026-08-27.html) — visual auth architecture review.

## Consolidated architectural decision

Use current `main` as the application integration base.

Normalize all active work around these owners:

- **VT-SYNC** — raw analytics/API/import evidence
- **analytics-canon** — the only public analytics boundary
- **Channel Profile** — durable creator/channel knowledge and validated learnings
- **Projects** — project intent/workflow state
- **Brain** — orchestration, evidence reasoning and recommendations
- **ActionPacket / Handoff** — cross-tool work transport
- **Outcome / Evaluation** — recommendation and action results
- **Learning Ledger** — candidate learnings and promotion decisions
- **Video Assets / Vault** — canonical video/media identities
- **Tool Runtime** — execution surfaces with shared permissions and approval gates

The core target loop is:

```text
VT-SYNC
 → analytics-canon
 → Brain / Anomaly
 → Momentum / recommendation
 → ActionPacket
 → Tool
 → Outcome Ledger
 → Learning Ledger
 → approved Channel Profile learning
```

## Documentation rules

- New reference files should link back to the master architecture rather than inventing a parallel status authority.
- Point-in-time audits must be labeled historical after their assumptions move.
- Runtime branches remain separate from this branch.
- Secrets, local account stores, private backups, generated caches and credentials never belong here.
- Standalone HTML/UI artifacts are reference/prototype evidence unless explicitly mounted in the application.
- The long-term goal is to derive documentation from canonical route/tool/system registries so docs cannot drift from product truth.
