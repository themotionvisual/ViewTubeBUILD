---
name: viewtube-ai-system-governor
description: Govern, streamline, audit, extend and optimize ViewTube Brain/AI architecture, specialist intelligence, evidence/context, prompts, model routing, creator generation, outcomes/evaluation/learning, AI tools and Brain-facing UI without creating overlapping owners.
---

# ViewTube AI System Governor

## Canonical authorities

Read first:
1. `docs/domains/BRAIN.md`
2. `docs/specifications/PROMPTS.md` when prompt/model behavior is involved
3. `docs/architecture/PRODUCT_ARCHITECTURE.md`
4. owning bounded authorities such as Analytics, Projects/ContentBuild, Asset Engine, Editor or Publishing
5. `docs/governance/CONVERSATION_OS.md`, `docs/governance/CROWN.md`, `docs/governance/TASK_AUTHORITY.md`, and `docs/governance/VERIFICATION.md` for work coordination

`governance/ai-systems/**` is an operational audit/reachability projection, not a second architecture, conversation or task authority.

## Core rule

Prefer one shared Brain runtime and clear specialized owners over parallel brains, duplicate stores, duplicate prompt systems, surface-specific provider stacks or AI-specific work ledgers.

## Procedure

1. ORIENT through Conversation OS and current main.
2. Resolve the existing capability/domain owner.
3. Inspect current code callers, tests and runtime reachability.
4. Identify overlapping services, prompts, stores, adapters, routes and UI surfaces.
5. Define the creator decision/job the change should improve.
6. Define required evidence and what must remain unknown.
7. Define the smallest context packet needed.
8. Separate deterministic computation from model reasoning.
9. Route creator reasoning through BrainRuntime and model calls through BrainModelGateway.
10. Preserve Project/ContentBuild and Asset identity.
11. Define output schema, provenance, missing-data behavior, permissions and approval gates.
12. Define evaluation before implementation.
13. Define outcome attribution and whether a Learning Candidate is allowed.
14. Prevent silent durable-learning promotion.
15. Implement through the owning domain/skill.
16. Verify tests + runtime + visible UI/responsive state where applicable.
17. Compare behavior, unsupported-claim rate, latency/context/token cost and creator utility when relevant.
18. Remove superseded parallel paths only after reachability/parity evidence.
19. Update Brain/Prompt/domain authorities and machine projections.
20. Propose task-state changes through Task Authority.

## Canonical owner reminders

- VT-SYNC: raw acquisition/freshness.
- analytics-canon: normalized analytics evidence.
- Channel Profile / Channel Knowledge: durable confirmed creator/channel knowledge.
- Projects / ContentBuild: project/content identity.
- Asset Engine / Vault: artifact identity/provenance.
- BrainRuntime: creator reasoning/orchestration.
- BrainModelGateway: model/provider boundary.
- BrainContextBroker / Creator Context resolver: bounded context.
- specialist intelligence modules: deterministic/derived interpretation.
- Publishing: external publication state/side effects.
- outcome/evaluation owners: measured results/evaluation.
- learning governance: promotion into durable knowledge.

## Anti-duplication checks

Before adding anything:
- Does BrainRuntime/BrainModelGateway already provide this?
- Does this create a second analytics or memory store?
- Does this duplicate an existing specialist capability?
- Is deterministic code more appropriate?
- Does this UI start owning intelligence state?
- Does this bypass analytics-canon or Project/Asset identity?
- Does this bypass creator approval for side effects?
- Does this make a causal/quantitative claim unsupported by evidence?
- Does this silently promote learning?
- Is this bridge permanent architecture or only migration scaffolding?

If yes, redesign first.

## Context / evidence

- Missing != zero.
- Synthetic != live.
- Treat context as scarce.
- Retrieve just-in-time.
- Rank by relevance, authority, freshness, scope and contradiction.
- Keep evidence provenance and coverage visible.
- Never reconstruct creator-disabled private context.
- Current measured evidence outranks stale inferred learning.

## Prompt work

Use `docs/specifications/PROMPTS.md` and `docs/specifications/prompt-registry.json`.
Do not create another prompt authority or family for a new surface when an existing family can serve it.

## Generation / action

Significant creator outputs preserve task, project/content identity, evidence refs, prompt/model provenance, variants, selected output, asset lineage and later outcome refs.

Every mutating tool/action declares permission, approval, side effects, reversibility and verification.

## Outcome / learning

Preserve:
Observation → creator decision → Outcome → Evaluation → Learning Candidate → governed promotion.

One success/correction/correlation is not durable knowledge by default.

## Operational health

Use `node scripts/audit/reach.mjs` and [references/operational-health-check.md](references/operational-health-check.md) as reachability signals.

Definitions are not reachability proof. Static unused evidence is not deletion proof.

## External improvement research

Conversation OS may recommend current models/providers/repositories/video-generation systems/agent tooling. Verify current existence/capability before recommending or adopting them, then reconcile against existing Brain owners.

## Durable updates

When AI architecture changes:
- update `docs/domains/BRAIN.md`;
- update `docs/specifications/PROMPTS.md` for prompt contract changes;
- update Product Architecture/Capability Registry only if durable product topology changes;
- update Integrated Application Program for cross-system convergence;
- update operational projections only after their source authority changes;
- route exact task status through Task Authority;
- attach Verification receipts.

## Supporting references

Load only as needed:
- [references/operational-health-check.md](references/operational-health-check.md)
- [references/prompt-and-model-governance.md](references/prompt-and-model-governance.md)
- [references/donor-migration.md](references/donor-migration.md)
- historical management/claims references only for migration provenance; Conversation OS/Crown/Task Authority now own those functions.
