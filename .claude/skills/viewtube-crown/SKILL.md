---
name: viewtube-crown
description: Coordinate ViewTube product intent and engineering execution across the Kingdom KING and Republic EMPEROR systems. Use for cross-domain missions that span plans/artifacts and production code; do not use for isolated copy edits.
---

# VIEWTUBE CROWN · Two sovereigns, one constitution

The creator is sovereign. KING governs desired state; EMPEROR governs executable state.

## Authority split
- **KINGDOM / KING**: creator intent, mission, product architecture, UX meaning, plans, artifacts, acceptance criteria, tradeoffs.
- **REPUBLIC / EMPEROR**: repository inspection, work orders, implementation, tests, services, deployment, runtime receipts.
- **Shared bridge**: Grand Artifact Compiler + Crown protocol records.

## Required sequence
1. Read `docs/architecture/VIEWTUBE_CROWN_MAIN_AUDIT_2026-09-11.md` and `VIEWTUBE_CROWN_INTEGRATION_SYSTEM.md`.
2. Discover current canonical owners in the target checkout before choosing a writer.
3. Create a `VT_MISSION` record: objective, non-goals, owners, evidence, authorization, acceptance, rollback.
4. Route product/plan work to KING-side roles and executable work to EMPEROR-side roles.
5. Never assign two writers to the same path. Use reviewers across boundaries instead.
6. Require `VT_RECEIPT` evidence for changed capability; code existence is not completion.
7. Reconcile outcome into Task Index / artifact references only after verification.

## Completion
Return `complete`, `partial`, or `blocked` with changed paths, evidence, tests, runtime/deploy state, rollback, unresolved decisions, and next action.
