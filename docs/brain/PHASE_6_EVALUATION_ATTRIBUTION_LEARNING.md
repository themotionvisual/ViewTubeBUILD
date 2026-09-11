# ViewTube Brain Phase 6 — Evaluation, Attribution & Learning

## Purpose

Phase 6 closes the loop between intelligence, creator-approved execution, measured outcomes, and durable learning.

The core rule is:

> Detection is not success. Recommendation is not success. Execution is not success. Only measured outcomes can support durable learning.

## Lifecycle

```text
Signal / Anomaly / Opportunity / Priming
  -> Recommendation or Priming Step
  -> approved ActionPacket / Handoff
  -> Tool execution
  -> Evaluation checkpoint
  -> analytics-canon / workflow observations
  -> measured outcome
  -> repeated learning candidate
  -> learning governance review
  -> Channel Intelligence
  -> separately governed Channel Profile promotion
```

## Canonical services

### AlgorithmIntelligenceEventLedger
Tracks stable lineage across anomaly escalations, opportunities, priming plans/steps, recommendations, handoffs, workflows, evaluation checkpoints, measured outcomes, learning candidates, and learning-candidate reviews.

Stable IDs are used for source-level provenance events and candidate events so repeated Brain portfolio builds do not manufacture duplicate history. Existing timestamps and evidence lineage are preserved on upsert.

### AlgorithmEvaluationEngine
Evaluates declared metric targets after their checkpoint. It returns pending, insufficient-data, positive, neutral, negative, or mixed rather than inventing success when evidence is missing.

Evaluation targets may be hydrated with a canonical baseline snapshot. The measured outcome stores the exact target set and canonical evidence references used for the comparison.

### CanonicalAlgorithmEvaluation
Bridges Phase 6 to the existing `VT-SYNC -> analytics-canon` ownership path.

Brain evaluation concepts are mapped onto canonical evidence rather than creating another analytics store:

- `ctr` -> canonical CTR/import fields when available
- `watch_quality` -> average percentage viewed / canonical watch-quality fields
- `qualified_views` -> engaged views, with views as the bounded fallback
- `session_continuation` -> playlist/end-screen continuation evidence when available
- `followup_demand` -> search/suggested/traffic demand evidence

Video-scoped events prefer the matching canonical video row. Channel-scoped events use canonical metric summaries. Failed/unavailable datasets are never accepted as evaluation evidence.

Workflow-only concepts such as `diagnosis_complete` are intentionally excluded from analytics resolution; they must come from the tool/workflow outcome path.

### BrainEvaluationLoop
Finds due evaluations, processes manual or canonical observations, records measured outcomes, refreshes learning candidates, and summarizes loop health for Brain-facing surfaces.

It now supports:

- one-event evaluation from a current VT-SYNC snapshot
- optional pre-intervention baseline snapshots
- batch evaluation of due checkpoints
- baseline resolver per event
- retry behavior for `insufficient_data`

An insufficient-data result does **not** permanently close a checkpoint. It remains due and can be re-evaluated after another sync/import.

### AlgorithmLearningCandidates
Aggregates repeated measured outcomes into evidence-backed learning candidates. A minimum repeated-evidence threshold is required before a candidate can influence Channel Intelligence.

Learning-candidate events use stable IDs so refreshing the loop updates the same candidate rather than duplicating it.

This service does **not** write directly to durable Channel Profile memory.

### AlgorithmLearningGovernance
Adds the review boundary between a measured learning candidate and any future durable Channel Profile promotion.

Available decisions:

- `hold`
- `reject`
- `approve_for_profile_review`

Approval here means only that the candidate is eligible for a later Profile-promotion flow. It does not mutate Channel Profile itself.

## Provenance starts before execution

Phase 6 records stable provenance as soon as an Algorithm Intelligence portfolio is built:

- material anomaly escalations
- opportunities
- Algorithm Priming plans
- Algorithm recommendations

Execution events later attach ActionPacket IDs, workflow IDs, evaluation targets, and checkpoints to that earlier evidence lineage.

This makes it possible to answer:

- Which anomaly or opportunity caused this recommendation?
- Which priming plan produced this tool action?
- Did the creator execute it?
- Which canonical metrics changed afterward?
- Did that tactic repeatedly help this channel?
- Has the resulting learning candidate been reviewed?

## Attribution

Executed Algorithm recommendations and Algorithm Priming steps record:

- stable event ID
- source signal / step ID
- recommendation ID or priming plan/step ID
- action packet ID
- workflow ID
- evidence IDs
- evaluation target(s)
- checkpoint time
- creator/project/video scope
- canonical current snapshot ID
- canonical baseline snapshot ID when supplied

## Learning boundary

Phase 6 deliberately separates four levels:

1. **Outcome** — one measured result.
2. **Learning candidate** — repeated measured evidence with enough consistency.
3. **Governance decision** — hold, reject, or approve for Profile review.
4. **Durable Channel Profile learning** — a separately governed promotion decision.

Channel Intelligence may surface measured learning candidates, but it must label them as candidates and preserve their evidence/sample size.

## Remaining Phase 6 build slices

1. Add Brain-facing Evaluation Inbox and attribution UI.
2. Add workflow-native observations for non-analytics targets such as diagnosis completion.
3. Add experiment cohort matching so pre/post comparisons use comparable lifecycle windows.
4. Add recommendation calibration: predicted confidence vs measured success.
5. Add stale/pending checkpoint policies without automatic external actions.
6. Add a separately permissioned Channel Profile promotion adapter for approved candidates.
7. Add retention limits / archival policy for the 2,000-event local ledger before production persistence migration.
