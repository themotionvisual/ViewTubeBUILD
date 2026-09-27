---
name: viewtube-ai-system-governor
description: Govern, streamline, audit, extend and optimize integrated ViewTube Brain/AI, YouTube, analytics, ContentBuild, asset, editor, dashboard, toolbox, widget, settings, sync, and UI features without creating overlapping owners. Use when designing, researching, implementing, consolidating, auditing, or verifying ViewTube tools, workflows, capabilities, YouTube integrations, editor functions, or cross-system product changes.
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

## Integrated feature and capability development

Use this section when the request involves a new tool, workflow, dashboard widget, toolbox module, editor capability, YouTube action, AI function, or cross-system consolidation.

### Re-audit before planning

Confirm the repository path, branch/ref, commit, worktree, package scripts, and environment. Inventory the request's domain and adjacent domains. Read the relevant living authorities from `references/source-of-truth-map.md`. Search source for existing routes, registries, hooks, services, schemas, widgets, primitives, and tests. Trace current data flow from user entry to persistence, render, publish, and learning. Record current behavior and gaps; do not infer implementation from documents alone.

### Frame the capability

Write a compact capability contract covering the user goal/persona; entry surfaces and natural-language intent; canonical owners; inputs, outputs, identity keys, and schemas; evidence/context; permissions and external side effects; sync/async behavior, job lifecycle, cancellation/retry; asset/project/editor/publish connections; responsive/accessibility requirements; acceptance criteria; non-goals; and migration targets. Ask only questions that change architecture, permissions, product behavior, or destructive impact. Otherwise choose the smallest reversible assumption and record it.

### Use one integrated identity chain

Prefer the sequence `goal → evidence → brief → project/ContentBuild → Brain proposal → approval → typed operation/job/API → asset/provenance → editor/timeline/widget/dashboard → quality gate → package/publish → outcome → learning`. Keep one identity across the chain. Do not introduce parallel project, analytics, memory, asset, prompt, auth, job, or learning stores.

### Route AI, generation, and YouTube correctly

Route reasoning through BrainRuntime/BrainModelGateway with bounded context and structured schemas. UI surfaces must not call providers directly. Route asynchronous media generation through Video Director; register generated outputs in Asset Engine/Vault before durable project/editor use; record prompt/model/reference/seed/policy/output provenance; keep proposals separate from mutations; and meter expensive work through the canonical usage path.

For YouTube, use the server-owned typed session/API path. Validate scope, capability, channel/content-owner context, quota, payload, rate limits, concurrency, idempotency, and recovery server-side. Preserve remote IDs, exact approved variants, request IDs, and audit events. Distinguish reconnect-required, permission, quota, invalid-request, no-data, and provider-failure states. Never add browser token storage, direct browser Google calls, generic arbitrary URL proxies, or widget-specific auth.

### Standard end-to-end workflow

1. Enter from a goal launcher or existing surface.
2. Resolve context and canonical evidence.
3. Select or create the Project/ContentBuild.
4. Produce a structured proposal with provenance and confidence.
5. Show the approval boundary and preview/diff.
6. Execute a typed operation, API call, or recoverable job.
7. Register assets and lineage.
8. Connect the result to editor, timeline, widget, dashboard, settings, sync, data visuals, tables, or chat as appropriate.
9. Run quality gates and deterministic preview/final output checks.
10. Package/export/publish only after explicit readiness.
11. Capture outcomes and evaluate them.
12. Update the relevant living authority, registry, status ledger, and handoff log.

### Build the UI through canonical systems

Classify the surface as page, Studio Hub, Toolbox, Subtoolbox, dashboard widget, editor sidecar, settings, or chat handoff. Reuse the existing primitive and registry. Preserve canonical shell geometry, typography, tokens, spacing, motion, responsive rules, and state semantics. Implement connected, disconnected, loading/progress, empty, partial/unsupported, error/retry, permission/quota-blocked, and success/next-action states. Keep disconnected, empty, error, and missing UI distinct. Support keyboard, screen readers, touch, narrow widget widths, long content, and reduced motion. Update the UI Reference Library and certification ledger when a system-level primitive changes.

Do not copy large CSS blocks, invent a parallel widget shell, hard-code feature inventories, create feature-local intelligence state, or promote standalone HTML/screenshots into production authority.

### Plan by canonical owner

Separate implementation into bounded slices for Brain/context/evidence; project/ContentBuild schema; assets/provenance; typed API/YouTube integration; operation/job store and worker; editor/render parity; dashboard/widget/toolbox surface; settings/permissions; data visualization/table/sync; tests/observability/docs. Name files and existing contracts before adding new ones. Prefer a vertical slice that proves the whole user goal over broad scaffolding.

### Verify before handoff

Run the narrowest relevant checks first, followed by broader gates: schema/type/unit tests; capability and permission tests; project/asset/provenance round trips; provider/job idempotency, retry, cancel, and recovery; editor preview/final render parity; widget/toolbox contracts and visual certification; API integration; build, smoke, responsive, accessibility, privacy, and security checks. Report passed, failed, blocked, and pre-existing debt separately. Never claim visual, runtime, preview, or deployment evidence that was not actually verified.

Use `references/feature-planning-template.md` for substantial feature briefs, `references/ui-certification-checklist.md` for UI surfaces, `references/youtube-integration-checklist.md` for YouTube/AI integrations, `references/source-of-truth-map.md` for authority discovery, and `scripts/scan_viewtube_authorities.py` for a compact repository inventory. Use `templates/integrated-feature-brief.md` when creating a reusable plan artifact.
