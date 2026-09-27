# Backlog Donor Inbound Reference Map

**Production Date:** 2026-09-27  
**Status:** RECONCILING  
**Purpose:** classify inbound references that must be handled before the backlog/Finish Program donor family can move to Removed Archive.

## Rule

An archive move is blocked until every active reference either:
- points to the current survivor/current reconciliation artifact; or
- is intentionally rewritten to the future archive path/manifest.

Historical documents may retain lineage references only if those links remain resolvable after the move.

| Donor | Referencer | Classification | Required action |
| --- | --- | --- | --- |
| `docs/VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md` | `agent/registry/references.md` | `ACTIVE_REWIRE` | Rewire to the current survivor/current reconciliation source before archive. |
| `docs/VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md` | `docs/DOCUMENTATION_REGISTRY.md` | `HISTORICAL_LINEAGE` | When archived, update this historical link to the archived path or consolidation manifest so provenance remains resolvable. |
| `docs/VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md` | `docs/programs/INTEGRATED_APPLICATION.md` | `INTENTIONAL_DONOR_LINEAGE` | Keep donor semantics, but update to archive path/manifest in the archive wave. |
| `docs/VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md` | `docs/brain/ai-systems/DOCUMENT_CONSOLIDATION_REGISTER_2026-09-24.md` | `HISTORICAL_LINEAGE` | When archived, update this historical link to the archived path or consolidation manifest so provenance remains resolvable. |
| `docs/VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md` | `docs/migration/TIME_WINDOW_IMPLEMENTATION_PLAN_2026-09-11.md` | `HISTORICAL_LINEAGE` | When archived, update this historical link to the archived path or consolidation manifest so provenance remains resolvable. |
| `docs/VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md` | `tasks/documentation-backlog-integration/CURRENT-MAIN-RECONCILIATION.md` | `ACTIVE_REWIRE` | Rewire to the current survivor/current reconciliation source before archive. |
| `docs/VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md` | `.claude/skills/viewtube-widget-dashboard-system/references/futures-prototypes-and-reference-atlas.md` | `INTENTIONAL_DONOR_LINEAGE` | Keep donor semantics, but update to archive path/manifest in the archive wave. |
| `docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md` | `docs/programs/INTEGRATED_APPLICATION.md` | `INTENTIONAL_DONOR_LINEAGE` | Keep donor semantics, but update to archive path/manifest in the archive wave. |
| `docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md` | `tasks/documentation-backlog-integration/CURRENT-MAIN-RECONCILIATION.md` | `ACTIVE_REWIRE` | Rewire to the current survivor/current reconciliation source before archive. |
| `docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md` | `docs/architecture/VIEWTUBE_MASTER_PRODUCT_TOOLS_WORKSTATION_ARCHITECTURE.md` | `HISTORICAL_LINEAGE` | When archived, update this historical link to the archived path or consolidation manifest so provenance remains resolvable. |
| `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` | `tasks/viewtube-finish-program/todo.md` | `ACTIVE_REWIRE` | Rewire to the current survivor/current reconciliation source before archive. |
| `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` | `tasks/viewtube-finish-program-2026-09-24.md` | `HISTORICAL_LINEAGE` | When archived, update this historical link to the archived path or consolidation manifest so provenance remains resolvable. |
| `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` | `docs/DOCUMENTATION_REGISTRY.md` | `HISTORICAL_LINEAGE` | When archived, update this historical link to the archived path or consolidation manifest so provenance remains resolvable. |
| `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` | `docs/programs/INTEGRATED_APPLICATION.md` | `INTENTIONAL_DONOR_LINEAGE` | Keep donor semantics, but update to archive path/manifest in the archive wave. |
| `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` | `governance/convergence/plan-merges.json` | `INTENTIONAL_DONOR_LINEAGE` | Keep donor semantics, but update to archive path/manifest in the archive wave. |
| `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` | `docs/architecture/VIEWTUBE_SYSTEM_CONVERGENCE_AND_CONSOLIDATION.md` | `HISTORICAL_LINEAGE` | When archived, update this historical link to the archived path or consolidation manifest so provenance remains resolvable. |
| `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` | `docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md` | `HISTORICAL_LINEAGE` | When archived, update this historical link to the archived path or consolidation manifest so provenance remains resolvable. |
| `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` | `docs/registry.json` | `INTENTIONAL_DONOR_LINEAGE` | Keep donor semantics, but update to archive path/manifest in the archive wave. |
| `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` | `docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md` | `HISTORICAL_LINEAGE` | When archived, update this historical link to the archived path or consolidation manifest so provenance remains resolvable. |
| `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` | `docs/migration/reference/PR241_VIEWTUBE_AI_BRAIN_BRAINSTORM_AND_FRONTEND_DESIGN_2026-09-12.md` | `HISTORICAL_LINEAGE` | When archived, update this historical link to the archived path or consolidation manifest so provenance remains resolvable. |
| `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` | `governance/ai-systems/registry/plans.json` | `INTENTIONAL_DONOR_LINEAGE` | Keep donor semantics, but update to archive path/manifest in the archive wave. |
| `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` | `docs/migration/reference/PR241_VIEWTUBE_AI_SYSTEMS_VERIFIED_AUDIT_AND_IMPLEMENTATION_PLAN_2026-09-12.md` | `HISTORICAL_LINEAGE` | When archived, update this historical link to the archived path or consolidation manifest so provenance remains resolvable. |
| `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` | `docs/migration/reference/brain-ai-history/VIEWTUBE_AI_CREATOR_INTELLIGENCE_OS_IMPLEMENTATION_PLAN_2026-09-11.md` | `HISTORICAL_LINEAGE` | When archived, update this historical link to the archived path or consolidation manifest so provenance remains resolvable. |

## Active rewires required before archive

1. [x] `agent/registry/references.md` — rewired to Task Authority / current governance; the September 11 file remains donor lineage only.
2. [x] `tasks/viewtube-finish-program/todo.md` — rewired to `docs/programs/INTEGRATED_APPLICATION.md` and explicitly demoted to a transition/alias projection.
3. [ ] `tasks/documentation-backlog-integration/CURRENT-MAIN-RECONCILIATION.md` — after the archive move, reference the consolidation manifest / archived source rather than the active root path.

## Intentional lineage

`docs/programs/INTEGRATED_APPLICATION.md`, `docs/registry.json`, `governance/convergence/plan-merges.json`, AI plan registry, and widget donor/reference material intentionally name historical sources for provenance. Their references must remain resolvable, but they do not make those donors current authority.

## Archive gate

- [x] source family inventoried;
- [x] unique task/program/idea/governance/reference material has a destination;
- [x] inbound references discovered and classified;
- [ ] active references rewired — 2 of 3 immediate rewires complete; final audit link waits for archive destination;
- [ ] historical references updated to archive/manifest destinations;
- [ ] source bytes copied to Removed Archive;
- [ ] registry/archive index updated;
- [ ] post-move broken-link audit clean.
