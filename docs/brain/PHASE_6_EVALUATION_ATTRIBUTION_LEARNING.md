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
  -> analytics-canon + canonical Brain Outcome Ledger
  -> lifecycle-comparable measured outcome
  -> Evaluation Inbox / attribution
  -> repeated learning candidate
  -> learning governance review
  -> explicit creator approval
  -> existing Brain memory / Channel Profile promotion path
```

## Canonical services

### AlgorithmIntelligenceEventLedger
Tracks stable lineage across anomaly escalations, opportunities, priming plans/steps, recommendations, handoffs, workflows, evaluation checkpoints, measured outcomes, learning candidates, reviews, and governed promotions. Stable IDs prevent repeated Brain portfolio builds from manufacturing duplicate history.

### AlgorithmEvaluationEngine
Evaluates declared metric targets after their checkpoint. It returns pending, insufficient-data, positive, neutral, negative, or mixed rather than inventing success when evidence is missing. Evaluation targets may be hydrated with a canonical baseline snapshot.

### CanonicalAlgorithmEvaluation
Bridges Phase 6 to the existing `VT-SYNC -> analytics-canon` ownership path. Brain evaluation concepts map onto canonical evidence rather than creating another analytics store. Video-scoped events prefer matching canonical video rows; channel-scoped events use canonical summaries. Failed/unavailable datasets are not evidence.

Workflow-only concepts such as `diagnosis_complete` are excluded from analytics resolution.

### AlgorithmWorkflowOutcomeBridge
Provides the complementary non-analytics evidence path. The canonical Brain Outcome Ledger now feeds this bridge automatically for attributed ActionPackets/workflows.

The bridge may only satisfy explicitly workflow-native targets such as:

- `diagnosis_complete`
- `workflow_completed`
- `creator_accepted`

A completed workflow can never satisfy CTR, retention, views, revenue, or another analytics target.

### BrainEvaluationLoop
Finds due evaluations, processes manual/canonical observations, records measured outcomes, refreshes learning candidates, and summarizes loop health. Insufficient-data results remain retryable after later sync/import evidence arrives.

### BrainEvaluationInbox
Builds the Brain-facing review model without creating another store. It combines overdue checkpoints, missing-evidence retries, measured outcomes, learning-review items, full attribution lineage, priority, and governance summaries.

### BrainCheckpointPolicy
Classifies overdue checkpoints as `due`, `aging`, `stale`, or `critical`. Aging only changes review priority; it never causes automatic external action. Seven-day-overdue checkpoints require manual review before being treated as learnable.

### AlgorithmLifecycleCohorts
Defines fair historical comparison using genuine lifecycle observations. T+24h outcomes must be compared with peer observations measured near T+24h, not with current lifetime totals.

Cohort matching can consider:

- channel
- metric
- lifecycle hour
- format
- duration tolerance
- topic key

If too few comparable peers exist, the result is `insufficient_peers`. The service prefers the cohort median to reduce outlier distortion.

### AlgorithmLearningCandidates
Aggregates repeated measured outcomes into evidence-backed learning candidates. Candidate events use stable IDs so loop refreshes update the same candidate rather than duplicating it.

### AlgorithmLearningGovernance
Adds the review boundary between a measured candidate and future durable Channel Profile promotion. Decisions are `hold`, `reject`, or `approve_for_profile_review`. Approval at this stage still does not mutate Channel Profile.

### AlgorithmLearningProfilePromotion
Provides the final governed promotion adapter. Promotion requires both:

1. prior `approve_for_profile_review` governance status; and
2. explicit creator approval at promotion time.

It also respects Brain personalization/learning controls and reuses the existing Brain teaching/promotion path rather than introducing a second Channel Profile writer. Successful promotion is recorded as `LEARNING_PROMOTED` in the Algorithm Intelligence ledger.

### AlgorithmRecommendationCalibration
Compares recommendation confidence with measured outcomes. It reports success rate by low/medium/high confidence and by command, plus warnings for meaningful over/under-confidence. Phase 6 keeps calibration descriptive; it does not silently change strategy weights.

### BrainAlgorithmIntelligenceContext
The Brain-facing Algorithm Intelligence context now includes bounded Phase 6 information:

- urgent evaluation items
- overdue/insufficient-data counts
- stale/critical checkpoint counts
- learning reviews awaiting action
- recommendation calibration
- calibration warnings

This allows the AI Brain to answer questions about what worked, what remains unresolved, and how reliable its prior confidence estimates have been without confusing execution with success.

## Learning boundary

Phase 6 separates five levels:

1. **Execution** — a workflow/action occurred.
2. **Outcome** — a result was actually measured.
3. **Learning candidate** — repeated measured evidence with enough consistency.
4. **Governance decision** — hold, reject, or approve for Profile review.
5. **Durable Channel Profile learning** — explicit creator-approved promotion through the existing Brain memory system.

## Remaining Phase 6 build slices

1. Mount the Evaluation Inbox into a creator-facing Brain / Algorithm Intelligence UI.
2. Add a canonical persistence/archival policy for the local 2,000-event Algorithm ledger before production persistence migration.
3. Connect lifecycle cohort observations to a persisted first-24h/72h video evidence source once that canonical dataset is available; do not synthesize lifecycle rows from lifetime totals.
4. Add explicit tests around Outcome Ledger -> workflow evaluation integration and governed Profile promotion.
5. Use calibration as evidence for a future governed strategy-weight adjustment system rather than changing recommendation behavior automatically.
