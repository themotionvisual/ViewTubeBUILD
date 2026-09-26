---
name: viewtube-task-artifact-bridge
description: Read and reconcile Crown mission records with ViewTube Task Index IDs and artifact/document references without mutating canonical task status. Use when a mission must be traced to vt-#### work, plans, demos, receipts, or unresolved blockers.
---

# ViewTube Task + Artifact Bridge

This skill is read-only. Canonical mutation is always routed through the separate `viewtube-task-authority` skill after the active Task Index writer path is positively resolved.

## Purpose
Build one inspectable dossier linking:
- canonical Task Index identity/state;
- Crown mission and work order;
- decisions, conflicts and handoffs;
- plans, demos, reports and source artifacts;
- code/PR references;
- verification receipts and deployment evidence.

## Procedure
1. Read `.viewtube/exchange/README.md`, `docs/governance/TASK_AUTHORITY.md`, `docs/governance/CROWN.md`, and `docs/architecture/VIEWTUBE_CROWN_PHASE3_READ_ONLY_BRIDGE.md`.
2. Locate the canonical Task Index copy for the current workspace; do not guess its path or status.
3. Run or emulate `scripts/report-crown-links.mjs`, optionally supplying `--task-index=<path>`.
4. Resolve `taskIds` from missions against the canonical Task Index and report missing references.
5. Group artifact records by mission/task and preserve their status: CANONICAL, RECOVERY, PROTOTYPE, REFERENCE, SUPERSEDED, PARTIAL or UNKNOWN.
6. Attach verification receipts by reference only; do not promote task state from a commit, prototype or unit test alone.
7. Return unresolved blockers and the next evidence required for a supported status change.

## Rules
- Task Index remains task authority.
- Royal Exchange remains coordination/provenance authority.
- Artifact records do not make prototypes canonical.
- Repository/runtime evidence determines implementation claims.
- Never rewrite, rename, delete or move the Task Index or artifact source from this skill.

## Result
Produce a compact Task Dossier showing Task -> Mission -> Decisions -> Work Order -> Artifacts -> Receipts -> Remaining verification.
