# Implementation Plan — ViewTube Brain Quality & Learning

Date: 2026-09-24
Status: planning; no application code changes in this branch yet.

## Architecture
Canonical data → evidence-contract → channel-knowledge → task context resolver → prompt system → AI quality loop → creator action → outcome evaluation → learning governance → Channel Profile.

## Wave 1 — Evidence quality
1. Inventory current evidence types/builders and map them to the shared epistemic contract.
2. Add an additive evidence projection/adapter rather than replacing analytics-canon contracts.
3. Add evidence-health calculation: coverage, freshness, scope, missingness, contradiction.
4. Integrate bounded evidence health into BrainContextBroker/BrainRuntime.
5. Add architecture tests for scope/provenance and missing != zero.

Checkpoint: no model behavior regression; analytics-canon remains sole normalized analytics owner.

## Wave 2 — Channel knowledge
6. Inventory ChannelProfileAdapter and existing learning/governance records.
7. Add typed knowledge projection and temporal metadata under Channel Profile ownership.
8. Add reinforcement/contradiction/supersession rules.
9. Add task-scoped knowledge retrieval.
10. Connect governed learning promotion to typed Channel Knowledge.

Checkpoint: model cannot directly write validated learning.

## Wave 3 — Context resolution
11. Define task context requirements by Brain capability.
12. Rank evidence/knowledge by relevance, confidence, freshness and scope.
13. Deduplicate and expose contradictions.
14. Add token/context budgets and explicit omissions.
15. Replace broad context assembly incrementally.

## Wave 4 — Prompt system
16. Inventory creator-facing prompts and direct Gemini generation paths.
17. Introduce shared prompt constitution.
18. Split prompts into versioned families: evidence, analytics, audience, strategy, packaging, content, community, critique, evaluation.
19. Store prompt/schema/context-resolver versions with generation provenance.
20. Remove unsupported causal claims, fabricated SEO metrics and pseudo-precision.

## Wave 5 — AI quality loop
21. Define task profiles: direct, generate+validate, strategy+generate+critique+validate+revise.
22. Add deterministic validators for structural constraints.
23. Add evidence-backed critique for high-value outputs.
24. Require package-level title/thumbnail/hook evaluation where applicable.
25. Measure retry/revision cost and avoid unnecessary multi-pass generation.

## Wave 6 — Outcome evaluation
26. Ensure recommendation/generation/package IDs survive into creator action and publish state.
27. Evaluate at appropriate windows (1h/6h/24h/72h/7d/28d where supported).
28. Compare against correct format/topic/traffic/duration cohorts.
29. Separate observation from causal conclusion.
30. Surface unattributed outcomes and evaluation backlog.

## Wave 7 — Governed learning
31. Create/reuse learning candidates from evaluations.
32. Accumulate supporting and contradictory observations.
33. Apply promotion/hold/reject/supersede governance.
34. Promote only through canonical Channel Profile path.
35. Add stale-knowledge review/decay.

## Wave 8 — Assistant continuity
36. Give Sidebar/Brain Hub/full Brain workspace the same resolver and knowledge path.
37. Resolve current page/tool/project/video context.
38. Support explain-why/evidence trace for recommendations.
39. Learn creator preferences separately from performance learnings.
40. Add Brain health view: evidence coverage, stale knowledge, contradictions, evaluation backlog and learning candidates.

## Verification gates
Every behavioral slice: focused tests → architecture guards → typecheck → production build. UI slices additionally require browser/mobile verification. Compare failures against same-day main baseline.

## Rollout
Each wave lands as small reversible PRs. Current main is rebased/merged forward before each PR. Historical branches are donors only; never wholesale merge stale AI branches.


## Prompt modernization authority

Wave 4 and all later creator-generation migrations use these current references:

- `docs/brain/VIEWTUBE_PROMPT_SYSTEM_AUTHORITY_2026-09-24.md`
- `docs/brain/VIEWTUBE_PROMPT_IMPROVEMENT_PROGRAM_2026-09-24.md`
- `docs/brain/VIEWTUBE_PROMPT_REGISTRY_2026-09-24.json`

The registry expands the original Brain-only Prompt System wave to cover legacy `prompts.ts`, legacy `gemini.ts` generation/refinement functions, Oracle/editor prompt templates, Brain task profiles and governed AssetGenerator strategies. Do not create a second prompt modernization track.
