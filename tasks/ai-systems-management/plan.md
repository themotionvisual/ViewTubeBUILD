# Implementation Plan — ViewTube AI Systems Management

## Architecture decision

Extend `viewtube-ai-system-governor` into the single AI Systems Management skill. Do not create a second governor. The Living Master Resource is the human control-plane authority; machine registries and runtime projections remain additive.

## Phase 1 — Authority foundation

- [x] Finalize living master scope and current-owner map.
- [x] Add dedicated AI Governor reference modules.
- [x] Register living master in documentation authority map.
- [x] Complete AI-document archival/broken-reference certification.
- [x] Define stable ID naming rules.

**Checkpoint**
- [ ] A blind agent can identify the correct AI owner and current authority in under one orientation pass.
- [ ] No historical AI audit remains in an active authority path.

## Phase 2 — Machine registries and schemas

- [x] Define JSON Schema 2020-12 authority record.
- [x] Define agent-report event schema.
- [x] Define evidence/prompt/managed-action reference schemas.
- [x] Seed systems/capabilities/integrations/donors/plans registries from current main.
- [x] Import Prompt Registry by reference, not copy.
- [x] Record exact audited-main SHA per record.

**Checkpoint**
- [ ] All seed records validate.
- [ ] No duplicate canonical owner is introduced.
- [ ] PR merged state and current-main state are independently represented.

## Phase 3 — Claims, receipts and Herald integration

- [ ] Define claim/release/block/handoff/completion event types.
- [x] Map them to Herald threads/JSONL rather than a second execution ledger.
- [x] Add finished-work receipt validation.
- [x] Add collision/stale-claim detection.
- [ ] Add plan/task references to Finish Program and Brain-quality tasks.

**Checkpoint**
- [ ] Two agents attempting the same architecture seam can detect the collision.
- [ ] A completed task can be traced to files, commits, PR, tests and main-integration state.

## Phase 4 — Provenance and runtime projection

- [ ] Build read-only projector over BrainTrace.
- [ ] Join GenerationRequest / ContextManifest / ToolReceipt.
- [ ] Join Projects/ContentBuild.
- [ ] Join Vault/Asset Engine refs.
- [ ] Join outcomes/evaluations/learning refs.
- [ ] Preserve source ownership and avoid payload duplication.

**Checkpoint**
- [ ] One generated/recommended result can be followed from task/prompt/evidence through artifact/action/outcome/evaluation without a second canonical store.

## Phase 5 — Health and CI

- [x] Validate registry records and source references across all five registries.
- [ ] Detect broken doc links and paths.
- [x] Detect duplicate authority claims.
- [ ] Detect stale canonical audit SHAs.
- [ ] Detect direct provider bypass and analytics-canon bypass.
- [ ] Run `audit:reach`.
- [x] Detect open stale claims / missing completion receipts.
- [ ] Add prompt/model provenance coverage checks.

**Checkpoint**
- [ ] Deliberate duplicate-owner/stale-path/orphan regressions fail the gate.

## Phase 6 — Brain Hub AI Systems workspace

Read-only first:

- Overview
- Systems
- Agents & Runs
- Prompts
- Plans
- Evidence & Traces
- Knowledge & Learning
- Audit
- Health

Every view displays freshness/audited main SHA.

**Checkpoint**
- [ ] UI is a projection; editing the UI cannot directly mutate canonical evidence/knowledge/runtime records.

## Phase 7 — Managed actions

Only after read-side certification:

- [ ] Define semantic DO actions.
- [ ] Define preconditions/permission tier/approval/side effects.
- [ ] Define UNDO/rollback or explicit irreversibility.
- [ ] Add preview mode before execution.
- [ ] Keep publishing/knowledge/evidence mutations behind their canonical owner.

## Phase 8 — Skill lifecycle and certification

Use Skill Conductor lifecycle:

`CREATE → VALIDATE → REVIEW → IMPROVE → PACKAGE`

- [ ] Positive trigger tests.
- [ ] Negative trigger tests.
- [ ] Blind-agent orientation test.
- [ ] Collision/claim test.
- [ ] stale-doc test.
- [ ] donor-history test.
- [ ] completion-receipt test.
- [ ] authority-conflict test.
- [ ] update-log/freshness test.

## Migration order

1. Clean and consolidate AI docs.
2. Establish human authority.
3. Establish machine schemas/registries.
4. Normalize agent reporting via Herald.
5. Build read projector.
6. Add CI health.
7. Add read-only Brain Hub workspace.
8. Only then consider operational actions.

## Risks

| Risk | Mitigation |
|---|---|
| “Master” becomes another runtime owner | Explicit control-plane boundary and reference-only projections |
| Markdown grows uncontrollably | SKILL.md MOC + modular references + registries + append-only event stores |
| Self-report becomes truth | PROVEN requires git/test/runtime evidence |
| Merge conflicts in giant registries | Split by domain, stable IDs, deterministic ordering |
| Generated docs overwrite human decisions | Generated views are projections; canonical edits remain reviewed |
| Public agent docs leak internal data | public-safe projection boundary |
| “merged” confused with “main” | distinct integration fields + verified main SHA |


### 2026-09-26 status note

Current forward-port branch: `feat/ai-systems-governance-mainline-2026-09-26`  
Audited main: `fbc7d25c71fa89c312da32280d9f77182065b42a`

Implemented on the branch:
- current-main forward-port of schemas/validator/Herald projection from stacked PRs #422–#424;
- systems/plans/donors/integrations registries;
- 27 validated authority records with zero broken source refs;
- corrected Herald sync-script contradiction.

Not yet complete:
- missing completion-receipt enforcement and broader claim-collision semantics;
- collision/stale-claim enforcement from real thread state;
- provenance projector over BrainTrace/ToolReceipt/ContentBuild/Vault/outcomes;
- CI gate wiring;
- Brain Hub read-only management workspace.


### Coordination certification — 2026-09-26

Verified in PR #451 source-governance:
- 12/12 AI Systems governance tests pass;
- 8/8 Herald projection tests pass;
- `audit:ai-systems` passes across 5 registries / 41 records;
- 9 active Herald claims inspected;
- 5 proven completion receipts projected;
- 0 stale writer locks;
- 0 claim collisions;
- 0 missing completion receipts;
- 0 authority conflicts;
- 0 broken registered source references.

Two abandoned writer locks discovered by the first live audit were explicitly released while preserving their previous lock metadata and leaving the underlying work state unchanged.
