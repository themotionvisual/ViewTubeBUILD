# Implementation Plan — ViewTube AI Systems Management

## Architecture decision

Extend `viewtube-ai-system-governor` into the single AI Systems Management skill. Do not create a second governor. The Living Master Resource is the human control-plane authority; machine registries and runtime projections remain additive.

## Phase 1 — Authority foundation

- [ ] Finalize living master scope and current-owner map.
- [ ] Add dedicated AI Governor reference modules.
- [ ] Register living master in documentation authority map.
- [ ] Complete AI-document archival/broken-reference certification.
- [ ] Define stable ID naming rules.

**Checkpoint**
- [ ] A blind agent can identify the correct AI owner and current authority in under one orientation pass.
- [ ] No historical AI audit remains in an active authority path.

## Phase 2 — Machine registries and schemas

- [ ] Define JSON Schema 2020-12 authority record.
- [ ] Define agent-report event schema.
- [ ] Define evidence/prompt/managed-action reference schemas.
- [ ] Seed systems/capabilities/integrations/donors/plans registries from current main.
- [ ] Import Prompt Registry by reference, not copy.
- [ ] Record exact audited-main SHA per record.

**Checkpoint**
- [ ] All seed records validate.
- [ ] No duplicate canonical owner is introduced.
- [ ] PR merged state and current-main state are independently represented.

## Phase 3 — Claims, receipts and Herald integration

- [ ] Define claim/release/block/handoff/completion event types.
- [ ] Map them to Herald threads/JSONL rather than a second execution ledger.
- [ ] Add finished-work receipt validation.
- [ ] Add collision/stale-claim detection.
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

- [ ] Validate registry schemas.
- [ ] Detect broken doc links and paths.
- [ ] Detect duplicate authority claims.
- [ ] Detect stale canonical audit SHAs.
- [ ] Detect direct provider bypass and analytics-canon bypass.
- [ ] Run `audit:reach`.
- [ ] Detect open stale claims / missing completion receipts.
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
