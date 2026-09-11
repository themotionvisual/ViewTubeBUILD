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
  -> analytics-canon + workflow observations
  -> measured outcome
  -> Evaluation Inbox / attribution
  -> repeated learning candidate
  -> learning governance review
  -> Channel Intelligence
  -> separately governed Channel Profile promotion
```

## Canonical services

### AlgorithmIntelligenceEventLedger
Tracks stable lineage across anomaly escalations, opportunities, priming plans/steps, recommendations, handoffs, workflows, evaluation checkpoints, measured outcomes, learning candidates, and learning-candidate reviews. Stable IDs prevent repeated Brain portfolio builds from manufacturing duplicate history.

### AlgorithmEvaluationEngine
Evaluates declared metric targets after their checkpoint. It returns pending, insufficient-data, positive, neutral, negative, or mixed rather than inventing success when evidence is missing. Evaluation targets may be hydrated with a canonical baseline snapshot.

### CanonicalAlgorithmEvaluation
Bridges Phase 6 to the existing `VT-SYNC -> analytics-canon` ownership path. Brain evaluation concepts map onto canonical evidence rather than creating another analytics store. Video-scoped events prefer matching canonical video rows; channel-scoped events use canonical summaries. Failed/unavailable datasets are not evidence.

Workflow-only concepts such as `diagnosis_complete` are excluded from analytics resolution.

### AlgorithmWorkflowOutcomeBridge
Provides the complementary non-analytics evidence path. Explicit workflow completion/rejection/abandonment can resolve workflow-only evaluation targets by ActionPacket ID, workflow ID, or Algorithm event ID. Analytics never fabricates tool completion.

### BrainEvaluationLoop
Finds due evaluations, processes manual/canonical observations, records measured outcomes, refreshes learning candidates, and summarizes loop health. Insufficient-data results remain retryable after later sync/import evidence arrives.

### BrainEvaluationInbox
Builds the Brain-facing review model without creating another store. It combines:

- overdue checkpoints
- insufficient-data retries
- measured positive/negative/mixed outcomes
- learning candidates awaiting governance review
- full event lineage / attribution IDs
- priority based on severity and overdue duration
- learning-loop and governance summary counts

This model can feed a compact Brain panel, Stats Chat, or a dedicated Algorithm Intelligence surface.

### AlgorithmLearningCandidates
Aggregates repeated measured outcomes into evidence-backed learning candidates. Candidate events use stable IDs so loop refreshes update the same candidate rather than duplicating it.

### AlgorithmLearningGovernance
Adds the review boundary between a measured candidate and future durable Channel Profile promotion. Decisions are `hold`, `reject`, or `approve_for_profile_review`. Approval does not mutate Channel Profile.

### AlgorithmRecommendationCalibration
Compares recommendation confidence with measured outcomes. It reports success rate by low/medium/high confidence and by recommendation command, plus warnings when a confidence bucket is materially over- or under-calibrated. Calibration remains descriptive in Phase 6; it does not silently rewrite strategy weights.

## Provenance starts before execution

Phase 6 records stable provenance when an Algorithm Intelligence portfolio is built for material anomaly escalations, opportunities, Algorithm Priming plans, and Algorithm recommendations. Execution events attach ActionPacket IDs, workflow IDs, evaluation targets, and checkpoints to that earlier evidence lineage.

This allows ViewTube to answer: what caused the recommendation, whether it was executed, which tool/workflow acted, which canonical metrics changed, whether the tactic repeatedly helped, and whether the resulting learning has been reviewed.

## Learning boundary

Phase 6 separates four levels:

1. **Outcome** — one measured result.
2. **Learning candidate** — repeated measured evidence with enough consistency.
3. **Governance decision** — hold, reject, or approve for Profile review.
4. **Durable Channel Profile learning** — a separately permissioned promotion decision.

## Remaining Phase 6 build slices

1. Mount the Evaluation Inbox into a creator-facing Brain / Algorithm Intelligence UI.
2. Connect `AlgorithmWorkflowOutcomeBridge` directly to the canonical Brain Outcome Ledger lifecycle.
3. Add experiment cohort matching so pre/post comparisons use comparable lifecycle windows.
4. Add stale/pending checkpoint policies without automatic external actions.
5. Add a separately permissioned Channel Profile promotion adapter for approved candidates.
6. Add retention/archival policy for the local event ledger before production persistence migration.
7. Use calibration as evidence for a future governed strategy-weight adjustment system rather than changing recommendation behavior automatically.
