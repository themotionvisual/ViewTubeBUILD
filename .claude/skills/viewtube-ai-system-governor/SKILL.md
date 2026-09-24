---
name: viewtube-ai-system-governor
description: Govern, streamline, audit, extend, and optimize ViewTube's AI Brain, Channel Intelligence, Algorithm Intelligence, analytics evidence, creator-generation systems, learning loops, AI tools, and Brain-facing UI. Use this whenever work touches Brain architecture, prompts, model calls, context, memory, Channel Profile, intelligence engines, evidence, analytics-to-AI integration, generated creator assets, recommendation/evaluation loops, agent workflows, AI widgets, Brain UI, or any proposal that could create overlapping AI ownership.
---

# ViewTube AI System Governor

**Primary orientation resource:** `docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md`

Read the living master resource before planning or modifying a cross-system AI concern. It is the management/orientation authority; bounded runtime/data/domain owners remain canonical for implementation.

Keep ViewTube's AI system powerful, explainable, source-grounded, and consolidated.

## Core rule

Prefer one shared runtime and clear specialized owners over parallel brains, duplicate stores, duplicate prompts, or surface-specific AI stacks.

## Canonical owners

- VT-SYNC owns raw analytics acquisition and freshness.
- analytics-canon owns normalized AI/consumer analytics access.
- Channel Profile owns durable creator/channel knowledge.
- Projects own project-specific intent and workflow state.
- Vault / Video Assets own artifact identity and provenance.
- Brain Runtime owns routing, context assembly, reasoning, explanations, and orchestration.
- Statistics Intelligence owns deterministic analytical calculations.
- Channel Intelligence owns derived longitudinal channel patterns.
- Audience Intelligence owns derived audience understanding.
- Signal / Anomaly Intelligence owns unusual-change detection.
- Opportunity Intelligence owns strategically useful openings.
- Algorithm Priming owns proactive launch/momentum planning.
- Algorithm Decision owns ranked recommended actions.
- Creator Asset Engine owns AI-generated creator assets and generation provenance.
- ActionPacket / Handoff owns cross-tool work transport.
- Outcome / Evaluation owns measured results.
- Learning owns candidates, contradiction, calibration, and promotion governance.

## Procedure

1. Classify the requested AI change.
2. Locate the current canonical owner before proposing code.
3. Identify overlapping services, prompts, stores, adapters, routes, tools, and UI surfaces.
4. State the creator decision the change should improve.
5. Define required evidence and what must remain unknown.
6. Define the smallest context packet the model actually needs.
7. Decide which work is deterministic and which genuinely requires model reasoning.
8. Prefer semantic agent tools that complete meaningful creator tasks.
9. Define output schemas, provenance, confidence, missing-data behavior, and approval requirements.
10. Define how the result will be evaluated before implementing.
11. Define how advice/generation can later be linked to real outcomes.
12. Define whether the result may produce a Learning Candidate.
13. Prevent direct promotion to durable Channel Profile unless governance policy permits it.
14. Define all affected user-facing Brain surfaces.
15. Require a trace path: `Evidence -> recommendation/generation -> creator decision -> ActionPacket/artifact -> outcome -> evaluation -> learning`.
16. Implement only after architecture boundaries are clear.
17. Run code tests plus Brain/eval regression tests.
18. Compare behavior, latency, context size, token use, unsupported-claim rate, and creator utility.
19. Remove superseded parallel paths only after parity is verified.
20. Update architecture docs and registries.

## Anti-duplication checks

Before adding anything, ask:

- Does another Brain/model gateway already do this?
- Does this create a second analytics reader?
- Does this create another Channel Profile or memory store?
- Does this duplicate Intelligence Hub reasoning?
- Does this add a model call where deterministic code is sufficient?
- Does this add a low-level agent tool that should be a semantic workflow?
- Does this write durable learning from one observation?
- Does this make an external action without the required approval?
- Does this make a causal claim without adequate evidence?
- Does this bypass analytics-canon?
- Does this make the UI own intelligence state?

If yes, redesign before implementation.

## Context rules

- Treat context as scarce.
- Retrieve just-in-time instead of dumping full histories.
- Rank candidate context by relevance, authority, freshness, and contradiction risk.
- Keep raw analytics out of prompts unless the task needs them.
- Use typed summaries and evidence refs.
- Explicitly represent missing and partial evidence.
- Never reconstruct creator-disabled private context from memory.

## Tool rules

Prefer semantic tools such as:

- `analyze_video_performance`
- `compare_video_cohort`
- `explain_retention_drop`
- `inspect_traffic_shift`
- `find_channel_opportunities`
- `build_launch_plan`
- `generate_video_package`
- `prepare_packaging_experiment`
- `prepare_editor_package`
- `prepare_publish_package`
- `evaluate_recommendation`

Avoid broad catalogs of low-level getters/setters unless they are demonstrably more effective in evals.

Every mutating tool declares permission, approval gate, side effects, reversibility, inputs, outputs and evidence requirements.

## Generation rules

All significant creator assets should store project/video scope, task type, prompt version, model profile, profile/style version, creator instructions, evidence refs, generated variants, selected/used variant and outcome links.

Do not claim an asset was effective until outcome evidence exists.

## Learning rules

Separate `Observation -> Outcome -> Learning Candidate -> Durable Profile knowledge`.

Use different promotion thresholds for explicit creator teaching, preferences, analytics patterns, experiments, temporary anomalies and causal claims.

Support contradiction, supersession, expiry, confidence decay and creator review.

## UI rules

Brain-facing UI should expose what the Brain knows, what evidence it used, what it is uncertain about, what it recommends, what awaits approval, what worked or failed, what it has learned, and what the creator can edit, reject, or retire.

Do not make chat the only representation of the Brain.

## Eval rules

Every significant AI change needs representative eval cases.

Measure factual accuracy, evidence precision, unsupported claims, missing-data honesty, routing, tool trajectory, style fidelity, schema validity, latency, tokens, repair rate, creator acceptance and measured downstream success where attributable.

Use deterministic graders first, model graders second, and human review where subjective.

## Result format

Return:

1. Current owner(s)
2. Problem
3. Proposed architecture
4. Data/evidence flow
5. Context/model/tool flow
6. UI impact
7. Evaluation plan
8. Learning/outcome path
9. Risks and duplication checks
10. Migration/removal plan
11. Verification receipts
12. Updated docs/registries

## Handoff

For code implementation, hand off clear acceptance criteria to the repository execution workflow. Preserve canonical owners and attach verification receipts.


## Operational health / reachability ratchet

PR #241 identified a recurring class of failures where correct-looking AI systems were built but unreachable, writer-less, inert or bypassed by surface-specific provider code.

For AI-affecting release work and periodic health reviews, read:

- [references/operational-health-check.md](references/operational-health-check.md)

Use `node scripts/audit/reach.mjs` as the first reachability signal, then classify every apparent orphan/bypass against current architecture before deleting or wiring it. Re-measure current counts; never reuse historical PR #241 counts as present truth.


## Living master update rule

When AI work changes cross-system ownership, reachability, prompt families, context/evidence flow, persistence, action permissions, outcome/evaluation/learning paths, or deprecates a prior authority:

1. update the bounded owner document;
2. update `docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md`;
3. update `docs/DOCUMENTATION_REGISTRY.md` when lifecycle/authority changed;
4. add a work claim/finished-work receipt through the current agent-work governance flow;
5. preserve or archive superseded documents only after reference and unique-information checks.
