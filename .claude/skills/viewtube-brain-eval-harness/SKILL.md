---
name: viewtube-brain-eval-harness
description: Build, extend and gate ViewTube Brain/AI evaluation across evidence grounding, context selection, prompt versions, tool/action trajectories, creator assets, traces, outcomes and governed learning. Use when a change can alter AI output quality; this is separate from general PR/build verification.
---

# ViewTube Brain Eval Harness

## Responsibility

Make Brain quality measurable so AI changes are engineering changes rather than prompt intuition.

This skill owns **AI-quality evaluation**, not repository mission sign-off. General completion/build/runtime review remains owned by `viewtube-verification-chancellor`.

## Current canonical sources

- `src/services/brain/BrainTrace.ts`
- `src/services/brain/BrainAnswerQuality.ts`
- `src/services/brain/numericClaims.ts`
- `src/services/brain/PromptConstitution.ts`
- `src/services/brain/AssetGenerator.ts`
- `src/services/brain/StyleProfile.ts`
- `src/services/brain/BrainOutcomeEvaluation.ts`
- `src/services/brain/AlgorithmEvaluationEngine.ts`
- `src/services/brain/fixtures/`
- `docs/brain/PR241_DONOR_HARVEST_AUDIT_2026-09-24.md`
- historical donor: `docs/migration/reference/PR241_VIEWTUBE_AI_SYSTEMS_VERIFIED_AUDIT_AND_IMPLEMENTATION_PLAN_2026-09-12.md`

## Grader channels

Use all applicable channels:

1. **Deterministic graders** — evidence refs, scope, schema validity, numeric grounding, permission/control compliance, tool-call budgets, trace continuity, outcome linkage.
2. **Rubric/model judges** — criterion-by-criterion quality judgments where deterministic rules cannot decide. Prefer binary/explicit rubric items over one holistic 0–100 score.
3. **Human/creator review** — style, strategic usefulness, taste and high-impact release sampling.

Do not treat a strong final paragraph as proof that the underlying trajectory was correct.

## Required fixture states

The suite must cover more than rich channels:

- rich channel;
- sparse channel;
- empty channel;
- analytics disabled;
- stale/partial evidence;
- conflicting Channel Knowledge;
- missing project/video scope;
- provider/model substitution;
- failed repair / needs-review state.

Sparse and empty fixtures are mandatory because they expose invented specificity.

## Numeric grounding

Use `numericClaims.ts`; never substring-match numbers in serialized evidence.

Distinguish:
- fabricated/unsupported magnitudes → blocking quality failure;
- legitimate deterministic derived values → allowed when derivation is explicit/canonical;
- unverified derived rates/percentages → warning/review state until deterministic statistics supplies them.

## Provenance

Every evaluable Brain/asset operation should make available:

- `traceId`
- output/asset/recommendation ID
- prompt constitution/family/version
- context-resolver version
- model requested/served
- evidence IDs and omissions
- repair count
- style/grounding grades
- creator decision where available
- measured outcome where attributable

An eval without model-served and evidence/context provenance is not comparable.

## Metrics

Report distributions and regressions for:

- factual accuracy;
- evidence precision/recall;
- unsupported-claim rate;
- missing-data honesty;
- task/context routing;
- tool/action trajectory;
- schema validity;
- style fidelity;
- context size/tokens;
- latency/cost where available;
- repair rate;
- creator acceptance/correction/rejection;
- measured recommendation/asset success where attribution is valid.

Do not conflate creator acceptance with measured performance.

## Release gate

AI-quality gating should be independently visible from existing repository-wide static-quality debt.

A valid gate must:
- have a recorded baseline;
- fail on a deliberate grounding/style regression;
- report exact failing cases and grader channel;
- not be silently converted to green because unrelated lint debt exists.

## Procedure

1. Identify the AI contract changed.
2. Add/choose representative fixtures first.
3. Define deterministic acceptance criteria.
4. Add rubric/human criteria only where needed.
5. Record context/prompt/model provenance.
6. Run focused tests/evals.
7. Compare distributions to baseline.
8. If quality regresses, block or explicitly document a bounded tradeoff.
9. Update the eval registry/baseline.

## Result format

Return: case count by state/category; metric deltas; failing examples; model/context provenance; regressions; uninstrumented metrics; release disposition.

## Handoff

- architecture/evidence/prompt ownership → `viewtube-ai-system-governor`
- creator asset quality → `viewtube-creator-asset-generation`
- repository/runtime completion verification → `viewtube-verification-chancellor`
