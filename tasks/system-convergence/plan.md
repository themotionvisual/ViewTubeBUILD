# System Convergence — Implementation Plan

**Status:** ACTIVE  
**Created:** 2026-09-26  
**Last edited:** 2026-09-26  
**Base main:** `86a41a68d92983e16d11d885262dab97462dab2f`

## Goal

Reduce ViewTube's overlapping AI/Brain/knowledge/evidence/project/asset/operation/outcome subsystems into six strong canonical domains while preserving all valuable behavior and avoiding destructive rewrites.

## Target systems

1. Creator Context & Knowledge
2. Evidence & Intelligence
3. Project / Content / Asset Graph
4. Creator Operations & Generation
5. Outcomes / Evaluation / Learning
6. Brain Runtime & Experience

## Work protocol

Each consolidation candidate must pass:

1. responsibility inventory;
2. production reachability;
3. donor harvest;
4. destination assignment;
5. additive successor contract;
6. parity/evaluation tests;
7. caller migration;
8. runtime observability;
9. zero-caller certification;
10. quarantine;
11. post-quarantine audit;
12. removal receipt.

## Phase 1 — Classification

- enumerate Brain/context/profile/knowledge/style services;
- enumerate evidence/intelligence adapters and specialists;
- enumerate Project/ContentBuild/package bridges;
- enumerate Asset Engine/Vault identity paths;
- enumerate generation/model/provider/tool-handoff paths;
- enumerate outcome/evaluation/learning ledgers;
- enumerate creator-facing AI surfaces;
- assign KEEP / MERGE / PROJECT / ADAPTER / PAIR / QUARANTINE candidates.

Exit: every relevant production subsystem has one proposed destination and one current owner.

## Phase 2 — Creator Context facade

Add read-only CreatorContextEnvelope + resolver over existing owners.

Must include:
- channel;
- creator preferences;
- Channel Knowledge;
- Style Profile;
- project/contentBuild;
- surface/selection;
- goals/constraints;
- permission flags;
- provenance/version refs.

Do not merge persistence yet.

Exit: BrainContextBroker can build context without callers independently stitching these domains together.

## Phase 3 — Evidence facade

Add a single evidence projection contract over analytics-canon and bounded non-analytics evidence.

Normalize:
- evidence ID;
- source;
- scope;
- entity;
- metric/value/unit;
- time window;
- freshness;
- missingness;
- confidence/provenance.

Move bridges toward projections, not owners.

Exit: all specialist intelligence consumes a consistent evidence contract.

## Phase 4 — Content/package projection convergence

Audit duplicated mutable state among:
- Project;
- ContentBuild;
- Video Package;
- Publishing Package;
- Launch Package;
- editor/tool package state.

Choose ContentBuild as canonical content-work state; turn package layers into projections where feasible.

Exit: no package field has two equal writable owners.

## Phase 5 — Asset/Vault convergence

Unify artifact identity contract.

Preserve:
- Asset Engine lifecycle/version/variant/dependency semantics;
- Vault browse/search/manage/storage UX.

Exit: a generated/uploaded asset has one ID and lineage across Vault, Projects, Editor and Publisher.

## Phase 6 — Operations convergence

Define OperationRecord lifecycle and map:
- AssetGenerator;
- GenerationWorkflow;
- model/media providers;
- ActionPacket;
- ToolReceipt;
- GenerationRecord;
- render/research/publish operations.

Do not prematurely collapse storage if different durability requirements remain.

Exit: every operation can be traced from context/evidence through outputs/receipts.

## Phase 7 — Outcomes convergence

Define shared producer identity/idempotency contract over:
- Brain outcomes;
- asset outcomes;
- project outcomes;
- publish outcomes;
- editor outcomes;
- community outcomes;
- experiment outcomes;
- algorithm lifecycle events.

Exit: all priority producers can be evaluated without duplicate writes.

## Phase 8 — Brain surface convergence

Migrate all creator-facing AI surfaces to:
- BrainRuntime;
- shared Creator Context;
- shared evidence;
- shared conversation controller;
- canonical operation/handoff system.

Exit: no UI owns a parallel reasoning stack.

## Phase 9 — Legacy generation strangler

Family order:
1. packaging/SEO;
2. hooks/titles/thumbnails;
3. scripts/storyboards;
4. community/comments;
5. analytics/report reasoning;
6. remaining direct provider callers.

Exit: direct legacy generation has explicit compatibility-only reachability or zero reachability.

## Phase 10 — Quarantine and cleanup

For every superseded subsystem:
- produce donor-harvest receipt;
- zero-caller proof;
- parity proof;
- data migration proof;
- successor reference;
- quarantine period;
- final delete decision.

## Verification

Required throughout:
- focused unit tests;
- architecture guards;
- provider-bypass audit;
- analytics-canon ownership audit;
- channel/project scope tests;
- evidence provenance tests;
- operation identity tests;
- outcome idempotency tests;
- reachability audit;
- build/typecheck baseline;
- UI screenshots for affected surfaces before completion claims.
