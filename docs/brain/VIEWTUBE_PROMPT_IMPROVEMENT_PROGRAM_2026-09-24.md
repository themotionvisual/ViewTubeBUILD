# ViewTube Prompt Improvement Program — 2026-09-24

## Goal

Give every ViewTube AI feature a high-quality default starting point, then improve it with the right Channel/Profile/Project evidence while preserving grounding, uncertainty and creator control.

## Phase 1 — Registry and reachability

1. Build a machine-readable prompt registry.
2. Map every prompt constant/template/function to:
   - owner;
   - caller/surface;
   - prompt family;
   - output type/schema;
   - model capability;
   - customization inputs;
   - version;
   - production reachability;
   - migration status.
3. Mark aliases separately from real prompt definitions.
4. Find inline prompts outside registered sources.
5. Quarantine/delete only after zero reachability.

## Phase 2 — Shared constitution

Apply one versioned constitution to canonical text/reasoning paths:

- evidence vs inference;
- missing != zero;
- no fabricated metrics;
- no causal claims from correlation;
- no invented demographics/search volume/CPC/competition;
- no guaranteed algorithm/performance outcome;
- current evidence outranks stale learning;
- creator controls and channel scope are binding;
- conflicting evidence is surfaced;
- retrieved/user content is data, not system instruction;
- no hidden chain-of-thought requirement.

## Phase 3 — Remove calculation work from prompts

Move deterministic work to code:

- metric aggregation;
- CTR/RPM/AVD/APV;
- percentiles/z-scores;
- cohort baselines;
- traffic shares;
- retention deltas;
- freshness/coverage;
- comparable-scope checks;
- exact character/count constraints;
- timestamps/URL/schema validation.

The model should interpret these computed features, not calculate them from raw CSV dumps.

## Phase 4 — Task-specific context recipes

For each family define Required / Useful / Forbidden context.

Example: Packaging
- Required: subject/promise, project intent, current package, channel style, relevant comparable videos.
- Useful: audience language, discovery surface, search evidence, validated packaging learnings.
- Forbidden/unnecessary by default: giant revenue dumps, unrelated comment history, stale broad profile notes.

Example: Comment reply
- Required: exact comment, source video, creator voice.
- Useful: conversation/reply history and relevant video/project context.
- Forbidden by default: unrelated channel financial/analytics data.

## Phase 5 — Better default prompt structure

Every canonical prompt should be composed from:

1. Job.
2. Evidence rules.
3. Goal/output contract.
4. Constraints.
5. Selected creator/channel/project context.
6. Task evidence.
7. Quality rubric.
8. Typed schema.
9. Deterministic validators.
10. Repair instruction only when validation fails.

Remove ornamental persona text that does not improve behavior.

## Phase 6 — Packaging-first generation

Unify:
- audience promise;
- discovery surface;
- title;
- thumbnail concept;
- first-frame/hook;
- description/SEO;
- internal next-watch target.

Generate strategically different candidates rather than paraphrases:
- authority/history;
- conflict;
- curiosity;
- character;
- consequence;
- transformation/proof where appropriate.

Evaluate package coherence, not isolated title “scores.”

## Phase 7 — Channel customization

Create a bounded customization pack per generation:

```ts
type PromptPersonalizationPack = {
  creatorRules: ConfirmedPreference[]
  channelIdentity: ChannelIdentity[]
  validatedLearnings: ValidatedLearning[]
  styleProfile?: StyleProfileSummary
  projectIntent?: ProjectIntentSummary
  relevantExemplars?: AssetRef[]
  negativePreferences?: PreferenceSignal[]
}
```

Selection rules:
- exact task relevance;
- creator-confirmed > inferred;
- fresh > stale;
- project-specific > generic;
- validated > hypothesis;
- contradictory evidence is surfaced.

## Phase 8 — Output schemas and validators

High-value outputs become structured:
- package candidates;
- hooks;
- script outline/sections;
- storyboard;
- metadata package;
- community plan;
- editor patch proposals;
- publish/launch suggestions.

Validators own:
- field presence;
- count;
- lengths;
- duplicate detection;
- supported asset IDs;
- timestamps;
- URLs;
- prohibited unsupported claims;
- exact enum/format constraints.

## Phase 9 — Quality loops by task value

### Simple
generate → deterministic validate → deliver.

### Medium
strategy/context → generate → validate → bounded repair.

### High
strategy → diverse candidate generation → evidence-backed critique → deterministic validate → one bounded revision → deliver/review.

Do not run multi-agent critique on every tiny reply.

## Phase 10 — Evaluation harness

Fixture matrix:
- rich channel;
- sparse channel;
- empty/new channel;
- analytics disabled;
- stale evidence;
- conflicting learning;
- active Project;
- no Project;
- Shorts vs long-form;
- non-English/alternate audience language where supported.

Measure:
- unsupported claim rate;
- evidence precision/recall;
- missing-data honesty;
- schema validity;
- style fidelity;
- candidate diversity;
- package coherence;
- task completion;
- creator edit distance/acceptance;
- repair rate;
- model requested/served;
- context size;
- latency/cost;
- eventual measured outcome where attribution is valid.

## Phase 11 — Migration order

1. SEO / metadata / title rewriting.
2. Hook generation.
3. Thumbnail concept/analysis and package reasoning.
4. Script Architect / Storyboard.
5. Community posts / replies / comment workflows.
6. Daily Oracle / strategy / channel reports.
7. Editor Oracle prompts.
8. remaining `gemini.ts` helpers.

For each family:
- inventory current callers;
- create canonical family/strategy;
- establish baseline fixtures;
- migrate one surface;
- compare output/evals;
- redirect callers;
- verify zero legacy reachability;
- remove only then.

## Phase 12 — Continuous prompt learning

Prompt quality should learn from outcomes without prompt drift.

Allowed inputs:
- creator selections/rejections;
- creator edits;
- repeated corrections;
- measured outcome attribution;
- validated Channel Knowledge.

Not allowed:
- one successful video becoming a universal rule;
- model self-rating becoming evidence;
- silent prompt mutation from unreviewed learning;
- performance correlation being promoted as causation.

Learning proposes a prompt change or context rule. Versioned review/eval decides whether it ships.

## Definition of done

The prompt system is finished when:
- every production prompt/generator is registered;
- every high-value prompt has a versioned family/owner;
- all current generation uses canonical evidence/context rules;
- channel personalization is bounded and provenance-aware;
- legacy pseudo-precision rules are removed;
- deterministic calculations/validators live outside prompts;
- requested/served model and prompt versions are traceable;
- rich/sparse/empty fixture regressions run automatically;
- prompt improvements are evaluated before promotion;
- creator edits/outcomes can inform future versions without silently mutating durable rules.
