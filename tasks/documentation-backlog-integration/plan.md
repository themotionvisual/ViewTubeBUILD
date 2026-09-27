# Plan: Integrate Plans and Unfinished Work into ViewTube Governance

**Production Date:** 2026-09-27  
**Status:** PLANNING  
**Audited Main SHA:** `76519e3d81f33df4a3084f49a369f5edbb1ee937`  
**Governing authorities:** Documentation Governance, Task Authority, Conversation OS, Verification, Product Architecture, Integrated Application Program.

## Objective

Convert the fragmented collection of:
- conversation-derived plans and backlog ideas;
- old unfinished-work audits;
- active Finish Program lists;
- One-Goal status rows;
- domain plans/specifications;
- handoff documents;
- donor/reference files;
- recent merged work;
- receipts and verification evidence;

into one governed knowledge/task system **without losing unique work, recreating completed features, or creating another master backlog**.

## Primary outcome

At completion:

1. current main determines implementation status;
2. Product Architecture/capabilities describe accepted durable product abilities;
3. Integrated Application Program owns cross-system unfinished program structure;
4. each bounded Domain Authority owns current architecture;
5. Task Authority owns exact work identity/lifecycle once VNext writer is resolved;
6. active backlog/status projections contain only real unfinished or verification work;
7. completed/superseded plan families are harvested and moved to Removed Archive;
8. conversations and handoffs point to governed objects rather than acting as truth stores;
9. every surviving unfinished item has one owner, one task identity or candidate, acceptance criteria, evidence state and destination authority.

## Existing-plan conflict decision

The root `tasks/plan.md` and `tasks/todo.md` still describe the Settings redesign, which has since landed. Per Plan-plugin rules, this mission does **not** overwrite them.

This mission uses the dedicated workspace:

`tasks/documentation-backlog-integration/`

A later execution task will reconcile/close the stale Settings workspace against current main and archive or supersede it according to Documentation Governance.

## Dependency graph

```
Current main audit ─────┐
                       ├─> Work identity reconciliation ─> Authority routing
Source-family inventory ┘                 │                    │
                                         ├─> Projection cleanup│
                                         └─> Mutation proposals│
                                                              v
Donor harvesting -> consolidation manifests -> Removed Archive migration
                                                              │
Receipts / decisions / exchange links ------------------------┤
                                                              v
Automation / stale-state gates -> final no-loss + current-main certification
```

## Phase 0 — Freeze evidence and inventory

### Task 0.1 — Capture current-main reconciliation baseline

Use the audit in this workspace as the starting evidence and refresh it immediately before execution.

Acceptance:
- exact main SHA recorded;
- completed foundations are not present as build-from-scratch work;
- VERIFYING foundations retain only their narrower verification/integration tasks;
- every elimination has current source/test/receipt evidence.

Verification:
- source/test path check;
- recent merge history check;
- compare One-Goal and Finish Program statuses to code.

### Task 0.2 — Inventory all backlog/planning source families

Inventory and hash:
- current conversation backlog candidates;
- old 100-item audit;
- old unfinished-work master;
- Finish Program backlog/plan/todo;
- One-Goal ledger;
- system-convergence workspace;
- AI/Brain task workspaces;
- domain active plans;
- handoffs;
- resource/reference idea catalogs;
- recent 80 page-feature opportunities;
- registry-declared MASTER_SOURCE references, especially `docs/references/DEEP_RESEARCH_CONSTRUCTION_SOURCE.md`;
- stale root task plans;
- Crown/Exchange mission and receipt records.

Acceptance:
- every source has class, authority role, lifecycle and intended disposition;
- no source family is silently omitted.

## Phase 1 — Reconcile task identity before moving prose

### Task 1.1 — Resolve canonical Task Index writer/storage

This is the hard prerequisite for canonical lifecycle mutation.

Acceptance:
- actual current canonical Task Index storage/writer path is proven;
- if VNext still does not exist, execution remains proposal-only;
- no second ledger is introduced.

### Task 1.2 — Dedupe surviving work against existing identities

For every surviving candidate:
1. match existing VT ID when possible;
2. match A/B/C/D/P/S program aliases;
3. classify NEW / CONTINUATION / DUPLICATE / SUPERSEDES / EXPANDS / BUG / VERIFICATION_ONLY / DONOR;
4. preserve aliases/history.

Acceptance:
- no duplicate task identities for the same observable work;
- broad historical tasks split into narrower follow-ons only where current implementation proves the foundation exists.

### Task 1.3 — Emit task mutation proposals

Create governed proposals, not direct status guesses, for:
- DONE candidates;
- VERIFYING demotions;
- SUPERSEDED/DUPLICATE relationships;
- newly accepted concrete work;
- stale status corrections.

Acceptance:
- every proposal cites current-main evidence and owning authority;
- no permanent new ID is allocated unless Task Authority permits it.

## Phase 2 — Route durable meaning to the correct authority

### Task 2.1 — Product Architecture / capabilities reconciliation

Route accepted durable features/systems from plans and the 80-opportunity integration into:
- `PRODUCT_ARCHITECTURE.md`;
- `capabilities.json`.

Do **not** copy task state into architecture.

Acceptance:
- one capability owner per accepted durable ability;
- `docs/registry.json` updated in the same change whenever an authority/concern relationship changes;
- opportunity ideas remain opportunities unless accepted;
- no UI surface invents a duplicate capability.

### Task 2.2 — Integrated Application Program reconciliation

Update cross-system dependencies and unfinished convergence only.

Primary surviving programs:
- Project/Asset/Publish;
- Outcome/Evaluation/Learning;
- Brain/Context/Prompt;
- UI/Editor/Widgets/Certification;
- Data/VT-SYNC;
- Vault;
- Agent/public readiness.

Acceptance:
- program contains dependencies and seams, not hundreds of leaf tasks;
- completed foundations listed in “already landed” are refreshed from current main.

### Task 2.3 — Domain Authority reconciliation

For each domain:
- Analytics/VT-SYNC;
- Projects/ContentBuild;
- Asset Engine/Vault;
- Toolbox/UI/Widgets;
- Brain/Prompts;
- Editor/Remotion;
- Auth;
- Deployment;
- User Guide/Resource Library;

harvest durable current behavior from active plans/handoffs and update the owning authority only.

Acceptance:
- exact bounded concern has one authority;
- each domain reconciliation records the exact main SHA actually inspected;
- `docs/registry.json` changes in the same PR when metadata/supersession/relationships change;
- task/status history stays out of architecture prose;
- Last Audited Main SHA updates only after code reconciliation.

### Task 2.4 — Specifications / Decisions

Promote:
- detailed contracts → Specifications;
- durable owner/tradeoff decisions → Decision records.

Examples likely to need explicit specs/decisions:
- Task Index VNext storage;
- Asset Slot Registry;
- Launch Package;
- Context Resolver recipes;
- outcome correlation/idempotency;
- server-authoritative persistence migration.

## Phase 3 — Clean active task/status projections

### Task 3.1 — Reconcile Finish Program BACKLOG-REGISTRY

Use current main to:
- remove completed foundation work from the **active unfinished projection while preserving identity/history/aliases**;
- replace broad tasks with narrower remaining integration/certification tasks;
- preserve aliases to historical IDs;
- absorb only accepted nonduplicate items from the conversation/100-item audit/80 opportunities.

### Task 3.2 — Reconcile One-Goal status ledger

Correct stale rows using current evidence.

Examples from current audit:
- VT-001/002/003/004 are foundations on main and should remain VERIFYING only for unsatisfied gates;
- no row should still say a missing contract when source/tests exist;
- specific Toolbox/Video Manager/Settings completed migrations should not remain generic IN_PROGRESS descriptions.

### Task 3.3 — Close stale task workspaces

Current examples:
- root Settings `tasks/plan.md` / `todo.md` are stale after implementation;
- dated Finish Program task file is donor/provenance;
- completed document-system / Conversation OS phase folders already have receipts and should remain receipts, not active plans.

For each:
- write/attach completion or supersession receipt;
- preserve unique unfinished certification work by moving it to active tasks;
- archive or mark historical only after no-loss check.

## Phase 4 — Lossless donor consolidation

### Task 4.1 — Consolidate old unfinished-work audits

Sources:
- 2026-09-11 unfinished master;
- 2026-09-25 100-item audit;
- conversation 410-item reconstruction;
- older dated domain plans.

Classify every unique contribution:
CURRENT / DURABLE / TASK / DECISION / REFERENCE / DONOR / HISTORICAL / SUPERSEDED / CONFLICT.

### Task 4.2 — Consolidate handoff families

Examples:
- Toolbox UI/CSS handoffs;
- Resource Library handoffs;
- Editor bridge handoffs;
- Vault handoffs;
- Brain/AI handoffs.

Handoffs remain evidence/provenance; durable rules move into the domain authority/specification.

### Task 4.3 — Write consolidation manifests

For each family:
- source path/hash;
- harvested contributions;
- target authority/task/reference;
- unresolved conflicts;
- archive destination.

## Phase 5 — Removed Archive migration

Move only certified superseded/historical sources.

Acceptance:
- inbound references checked;
- runtime/static consumption checked;
- unique content harvested;
- registry updated;
- archive index updated;
- original bytes preserved;
- supersession chain machine-resolvable.

Priority candidates:
- root legacy documentation governance/registry baselines;
- old One-Goal/Finish Program global sources already superseded in registry;
- stale Settings plan workspace after receipt;
- dated historical domain plans whose unique content is already harvested.

## Phase 6 — Receipts, decisions, conversation and Crown integration

### Task 6.1 — Link work receipts to tasks/programs/authorities

Use:
- Crown Mission / Work Order / Receipt;
- Royal Exchange artifacts;
- task mutation proposals;
- verification receipts;
- decisions.

Acceptance:
- conversation threads point to these records;
- receipts never become task state by themselves;
- no agent-specific private work ledger.

### Task 6.2 — Create a current documentation-integration receipt

Record:
- source families audited;
- tasks reconciled;
- authority updates;
- files archived;
- unresolved conflicts;
- current main SHA;
- verification results.

## Phase 7 — Automation and governance gates

Add after the tree is normalized:

1. stale active-plan detector;
2. unregistered docs detector;
3. duplicate ACTIVE concern detector;
4. broken internal link detector;
5. supersession-target existence check;
6. registry path existence check;
7. canonical metadata check;
8. stale Last Audited Main SHA warning;
9. stale task projection vs merged implementation warning;
10. root `docs/` miscellaneous-file prevention;
11. archive manifest completeness check;
12. task↔capability↔authority link validation.

These gates should warn first, then become blocking only after legacy debt is normalized.

## Phase 8 — Final certification

Success criteria:

- no completed foundation remains represented as an unfinished build task;
- every surviving unfinished unit has one task identity/candidate and owner;
- Product Architecture contains capabilities, not work status;
- Integrated Application contains cross-system program seams, not leaf-task duplication;
- Domain Authorities contain current bounded truth;
- Specifications contain detailed contracts;
- Decisions contain durable resolved choices;
- Task Index/projections contain exact work;
- Receipts/evidence prove work but do not own truth;
- handoffs/conversations are resumability/provenance, not authorities;
- superseded sources are losslessly archived;
- registry has no competing ACTIVE concerns;
- no broken internal links;
- stale Settings and other completed plan workspaces are closed;
- current-main audit is refreshed at the end;
- historical DONE/SUPERSEDED task identities remain queryable even when absent from the active unfinished projection.

## Parallelization

After Task 1.1 resolves task storage:
- Domain authority reconciliation can run in parallel by domain.
- Donor-family comparison can run in parallel by family.
- Projection cleanup can proceed in parallel only after task identity dedupe.
- Archive moves must wait for each family’s consolidation manifest.

## Risks

| Risk | Mitigation |
|---|---|
| Old plans call already-landed work unfinished | current-main audit before every mutation |
| One idea appears under many historical names | aliases + duplicate/supersedes relationships |
| Broad conversation backlog bloats Task Index | opportunity/capability reconciliation before task allocation |
| Task VNext writer still unresolved | proposal-only mode; no second ledger |
| New docs accidentally create another authority | registry/concern check before creation |
| Archive loses unique ideas/code | no-loss manifest + original byte preservation |
| Current main moves during reconciliation | record SHA per domain family and recheck before final mutation |
| Verification gaps get mistaken for missing implementation | split IMPLEMENTED/VERIFYING from NOT_STARTED |
