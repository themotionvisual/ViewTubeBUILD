# Capability Map: Documentation Backlog Reconciliation

**Production Date:** 2026-09-27  
**Status:** PLANNING  
**Audited Main SHA:** `76519e3d81f33df4a3084f49a369f5edbb1ee937`  
**Governance:** `docs/governance/DOCUMENTATION.md`, `TASK_AUTHORITY.md`, `CONVERSATION_OS.md`, `VERIFICATION.md`

This task workspace reconciles conversation-derived plans, historical unfinished-work audits, active program backlogs, current main, domain authorities, and task projections without creating another canonical backlog.

| Module id | Responsibility | Depends on |
|---|---|---|
| current-main-reconciliation | Prove what is already implemented, verifying, superseded, or still absent | current main + tests |
| source-family-inventory | Inventory every plan/audit/task/handoff/reference source family and its authority role | documentation registry |
| task-reconciliation | Dedupe unfinished work against existing VT / A-D / P / S identities and emit mutation proposals | current-main-reconciliation, source-family-inventory |
| authority-routing | Route durable product/system meaning into Product Architecture, Integrated Program, Domain Authorities and Specifications | task-reconciliation |
| projection-cleanup | Reconcile active backlog/status projections and close stale task workspaces | task-reconciliation |
| donor-consolidation | Harvest unique material from superseded plans/audits/handoffs before archive | source-family-inventory, authority-routing |
| archive-migration | Move certified superseded sources to Removed Archive with manifests and lineage | donor-consolidation |
| receipt-and-log-integration | Link work receipts, decisions, Crown missions, exchange artifacts and verification evidence | task-reconciliation |
| automation-and-gates | Add stale-plan, registry, broken-link, duplicate-authority and projection-freshness checks | all reconciliation modules |
| final-certification | Prove one owner per concern and one active task identity per real unfinished unit | all modules |

Build order:

`current-main-reconciliation + source-family-inventory → task-reconciliation → authority-routing + projection-cleanup → donor-consolidation → archive-migration → receipt/log integration → automation → final certification`

## Boundary

This plan does **not**:
- create hundreds of permanent Task IDs;
- overwrite the unresolved Task Index VNext writer;
- treat conversation memory as canonical truth;
- reopen implemented foundations as new features;
- archive or delete any source before no-loss consolidation;
- change product code.
