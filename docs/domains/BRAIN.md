# ViewTube Brain

**Production Date:** 2026-09-26  
**Last Edited:** 2026-09-26  
**Class:** DOMAIN_AUTHORITY  
**Status:** ACTIVE  
**Concern:** creator-facing AI reasoning, context, evidence use, specialist intelligence integration, model routing, actions, outcomes and governed learning  
**Owner:** BrainRuntime  
**Registry ID:** DOC-DOMAIN-BRAIN  
**Last Audited Main SHA:** 82460536651d1de368e09a2fb685a335cd27f312  
**Supersedes:** docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md; docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md after Phase D migration certification  
**Related Authorities:** docs/architecture/PRODUCT_ARCHITECTURE.md; docs/specifications/PROMPTS.md; docs/analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md; docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md; docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md; docs/governance/CONVERSATION_OS.md

## Purpose

This is the bounded Brain/AI domain authority for ViewTube.

It defines the intended architecture and durable rules for creator-facing reasoning, context selection, evidence use, specialist intelligence, model/provider routing, generation/action handoff, outcomes, evaluation and governed learning.

It does **not** own:
- repository-agent conversation continuity;
- task status or work claims;
- Crown missions;
- analytics truth;
- Project/ContentBuild truth;
- asset identity/storage;
- publishing transactions;
- documentation governance.

Those concerns belong to their current authorities.

## Canonical runtime

Creator-facing AI surfaces converge on one runtime contract:

```text
UI / Chat / Tool / Widget
        ↓
runBrainTask / BrainRuntime
        ↓
BrainOrchestrator
        ↓
Task / Capability Profile
        ↓
BrainContextBroker / Creator Context resolution
        ↓
Evidence + Specialist Intelligence
        ↓
Prompt policy / task family
        ↓
BrainModelGateway or governed operation
        ↓
Response / Asset / ActionPacket
        ↓
Trace + Receipt
        ↓
Outcome → Evaluation → Learning Candidate
```

BrainRuntime is the creator reasoning/orchestration entry point. UI surfaces request capabilities; they do not assemble separate provider stacks.

## Product-system relationship

Brain participates in the six-system product convergence model without absorbing the other owners:

1. **Creator Context & Knowledge** — creator/channel/profile/style/project/surface context.
2. **Evidence & Intelligence** — measured evidence, deterministic signals and specialist interpretation.
3. **Project / Content / Asset Graph** — Project, ContentBuild and durable asset identity.
4. **Creator Operations & Generation** — reasoning/generation/transform/research/render/tool-operation identity and provenance.
5. **Outcomes, Evaluation & Learning** — action attribution, measured outcomes, evaluation and governed promotion.
6. **Brain Runtime & Experience** — orchestration and creator-facing AI experience.

Brain Runtime coordinates these capabilities; it does not silently become their persistence owner.

## Canonical ownership boundaries

| Concern | Owner | Brain rule |
| --- | --- | --- |
| Raw YouTube acquisition/freshness | VT-SYNC | consume through canonical analytics boundaries |
| Normalized analytics evidence | analytics-canon | no surface-local analytics truth |
| Creator/channel confirmed facts | Channel Profile / Channel Knowledge | models cannot silently promote inference |
| Project/work identity | Projects / ContentBuild | preserve IDs through every AI operation |
| Artifact/version provenance | Asset Engine / Vault | generated outputs enter canonical asset lineage |
| Reasoning/orchestration | BrainRuntime | one creator reasoning facade |
| Model/provider execution | BrainModelGateway / provider layer | direct UI/provider calls are migration debt |
| Context selection | BrainContextBroker / Creator Context resolver | bounded, evidence-aware, task-specific |
| Deterministic calculations | analytics/statistics specialists | models interpret; they do not invent calculations |
| Specialist interpretation | Statistics / Audience / Channel / Opportunity / Algorithm modules | specialists remain modules, not separate brains |
| Cross-tool internal handoff | ActionPacket / operation handoff | handoff never grants external permission |
| Publishing/external mutation | Publishing owner | creator approval/idempotency/recovery remain outside Brain |
| Outcome attribution | canonical outcome owners / Brain outcome projection | separate creator preference from measured result |
| Evaluation | evaluation owners | preserve scope/comparability/insufficient-data states |
| Durable learning | learning governance + Channel Knowledge | no one-shot silent promotion |

## Evidence and epistemic contract

The Brain must preserve distinctions between:

- KNOWN
- OBSERVED
- CALCULATED
- USER_PROVIDED
- INFERRED
- HYPOTHESIS
- ESTIMATE
- STALE
- MISSING
- CONFLICTING

Rules:
1. Missing is never numeric zero.
2. Synthetic/demo data is never presented as live evidence.
3. Current measured evidence outranks stale learning.
4. Creator-confirmed preference outranks model-inferred preference.
5. Correlation is not causal proof.
6. Unsupported fabricated numbers are blockers.
7. Scope mismatch fails closed.
8. Channel/project/video/content-type/time-window scope remains visible.
9. Evidence UI may not imply confidence unsupported by the evidence contract.
10. Models do not create permissions or authorization.

## Context contract

Context is scarce and task-specific.

Target process:

```text
request
→ task/capability profile
→ required evidence/context classes
→ candidate sources
→ relevance / authority / freshness / scope / contradiction scoring
→ bounded context budget
→ model/operation
```

Candidate context may include:
- explicit creator instruction;
- creator controls;
- Channel Profile;
- Channel Knowledge;
- active Project / ContentBuild;
- canonical analytics/statistics;
- specialist intelligence;
- research when current external information is explicitly required;
- relevant assets/outcomes;
- current surface/selection;
- conversation history only when useful.

Avoid giant profile dumps, unrelated analytics payloads and fixed clipping when task-specific retrieval is available.

## Task envelope

Migrated creator-AI calls should resolve to a typed task envelope equivalent to:

```ts
type UnifiedAITask = {
  taskId: string
  surface: string
  channelId?: string | null
  projectId?: string | null
  contentBuildId?: string | null
  videoId?: string | null
  intent: string
  capability: string
  userInput: unknown
  visibleContext?: unknown
  constraints?: unknown
  requestedOutputs?: string[]
}
```

Runtime enrichment adds only relevant context and provenance.

## Specialist intelligence

Specialists remain bounded behind shared evidence/runtime contracts:
- Statistics Intelligence;
- Audience Intelligence;
- Channel Intelligence;
- Opportunity Intelligence;
- Anomaly / Signal Intelligence;
- Algorithm Intelligence;
- Packaging / content-strategy specialists.

A specialist may interpret evidence and generate structured signals. It does not become a second analytics store, Brain runtime or independent provider client.

## Model and provider boundary

BrainModelGateway is the creator text/reasoning model boundary.

Rules:
- provider choice is an implementation/profile concern, not a UI concern;
- requested and served model should be traceable for consequential generation;
- provider fallback must preserve schema/evidence/permission contracts;
- direct legacy `gemini.ts` generation paths are compatibility seams to migrate, not new architecture;
- safety/product/evidence rules outrank provider-specific prompt behavior.

## Prompt boundary

Prompt architecture is defined in `docs/specifications/PROMPTS.md`.

Brain supplies:
- task/capability identity;
- selected context/evidence;
- creator/project constraints;
- tool/operation permissions;
- provenance requirements.

Prompt families do not redefine Brain ownership or analytics truth.

## Generation and operation contract

Significant creator operations should preserve:

```text
operationId
channelId
projectId
contentBuildId
task/capability
inputAssetIds
evidenceIds
contextFingerprint
prompt/version
requested/served model
provider/job
outputAssetIds
permissions
status
receipt
rollback/undo metadata
```

GenerationRecord, ActionPacket, ToolReceipt and related current types may converge through shared operation identity over time without unsafe forced rewrites.

Generated creator assets should preserve:
- project/content scope;
- prompt and model profile;
- creator instructions;
- evidence refs;
- generated variants;
- selected/final variant;
- asset lineage;
- later outcome links where attribution is valid.

## Handoff and action safety

1. Brain does not duplicate domain logic.
2. Action/handoff carries typed context and evidence to the destination owner.
3. Loading a handoff may prefill a tool; it does not publish or mutate externally by itself.
4. Destination owner maps and validates final local state.
5. Publishing/community/comment/external mutations stay behind their current approvals.
6. Actions expose side effects, preconditions, reversibility and verification requirements.
7. Recommendation/proposal is distinct from creator approval and execution receipt.

## Outcomes, evaluation and learning

Canonical lifecycle:

```text
Recommendation / Generation / Action
→ Creator decision
→ Outcome
→ Evaluation
→ Learning candidate
→ hold / reject / reinforce / promote / supersede
→ Channel Knowledge
```

Rules:
- creator selection/rejection is useful preference evidence but not measured performance;
- one successful video/action does not become a universal rule;
- evaluations preserve comparable metric/unit/scope/window/format;
- insufficient evidence remains insufficient;
- contradiction and expiry are first-class;
- learning promotion is governed and reviewable.

## Brain-facing surfaces

All creator-facing AI surfaces should converge on the same runtime/context/evidence contracts, including:
- Sidebar chatbot;
- Brain Hub;
- AI Brain Command Interface;
- Studio assistants/tools;
- Dashboard AI widgets;
- Project assistants;
- Vault AI operations;
- Editor sidecar / Oracle integrations.

Surface-specific UI may differ. Surface-specific provider stacks or independent truth stores should not.

## Trace and provenance

Consequential Brain work should be traceable through:

```text
Evidence
→ context manifest
→ prompt/task policy
→ requested/served model or operation
→ output / recommendation
→ creator decision
→ ActionPacket / asset / external execution
→ receipt
→ measured outcome
→ evaluation
→ learning candidate
```

Traceability should support debugging, evaluation, rollback and creator explanation without exposing private chain-of-thought.

## Reachability and operational health

Definitions and registries do not prove production reachability.

Use current code callers, focused tests, runtime exercise and `scripts/audit/reach.mjs` where appropriate to detect:
- direct provider bypasses;
- unreachable services;
- ledgers with readers but no writer;
- duplicate context/evidence adapters;
- orphan prompt families;
- duplicated persistence;
- stale compatibility paths.

Static unused evidence alone is not deletion proof.

## Current known architecture seams

These are architecture gaps, not a second task ledger. Exact work state belongs in Task Index / Integrated Application Program.

- HookGenerator legacy direct generation path;
- Script Architect legacy direct generation path;
- default Brain model gateway still adapting the legacy Gemini provider layer;
- uneven outcome/evaluation producer coverage;
- incomplete active Project/Opportunity evidence on some Brain paths;
- publishing ApprovedPublishSnapshot dependency outside Brain;
- cross-domain metric comparability guard still required;
- continued migration from duplicate evidence/context bridges toward projections/facades.

## Anti-duplication rules

Before adding Brain/AI infrastructure, ask:
- Does BrainRuntime or BrainModelGateway already own this?
- Does this create another analytics reader/truth store?
- Does this create another creator/channel memory store?
- Does this create another Project or asset universe?
- Is deterministic code more appropriate than model reasoning?
- Can an existing specialist capability serve this surface?
- Does this UI start owning intelligence state?
- Does this path bypass canonical approval/publishing?
- Does this promote learning from weak evidence?
- Is a new bridge needed permanently, or only for migration?

Prefer adapters/projections during migration and remove them once zero reachability/parity is proven.

## Agent/work-management boundary

Repository-agent continuity, task status, claims, writer coordination and receipts no longer belong in a Brain management master.

Use:
- Conversation OS for cross-session continuity and improvement;
- Crown / Royal Exchange for missions, work orders, decisions and receipts;
- Task Authority / Task Index for exact work state;
- Documentation Governance for authority/lineage.

The AI Governor skill is an executable domain procedure, not a second work ledger.

## Change protocol

When Brain architecture materially changes:
1. update this document;
2. update Product Architecture / Capability Registry only if product topology or durable capability ownership changes;
3. update Prompt specification when prompt behavior/contracts change;
4. update Integration Program for cross-system convergence changes;
5. route exact implementation work through Task Authority;
6. preserve migration/donor sources through Documentation Governance;
7. verify code/runtime claims under the Verification authority.
