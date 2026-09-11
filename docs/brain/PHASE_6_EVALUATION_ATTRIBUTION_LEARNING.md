# ViewTube Brain Phase 6 — Evaluation, Attribution & Learning

## Purpose

Phase 6 closes the loop between intelligence, creator-approved execution, measured outcomes, and durable learning.

> Detection is not success. Recommendation is not success. Execution is not success. Only measured outcomes can support durable learning.

## Lifecycle

```text
Signal / Anomaly / Opportunity / Priming
  -> Recommendation or Priming Step
  -> approved ActionPacket / Handoff
  -> Tool execution
  -> multi-horizon monitoring
  -> final evaluation checkpoint
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
Tracks stable lineage across anomaly escalations, opportunities, priming plans/steps, recommendations, handoffs, workflows, monitoring checkpoints, measured outcomes, learning candidates, reviews, and governed promotions. Stable IDs prevent repeated Brain portfolio builds from manufacturing duplicate history.

### AlgorithmEvaluationEngine
Evaluates declared metric targets after their final checkpoint. It returns pending, insufficient-data, positive, neutral, negative, or mixed rather than inventing success when evidence is missing.

### CanonicalAlgorithmEvaluation
Bridges Phase 6 to the existing `VT-SYNC -> analytics-canon` ownership path. Video-scoped events prefer matching canonical video rows; channel-scoped events use canonical summaries. Failed/unavailable datasets are not evidence. Workflow-only concepts are intentionally excluded.

### AlgorithmWorkflowOutcomeBridge
The canonical Brain Outcome Ledger feeds explicit workflow-native outcomes to Algorithm evaluation for attributed ActionPackets/workflows. Workflow evidence may only satisfy declared workflow-native targets such as `diagnosis_complete`, `workflow_completed`, and `creator_accepted`. It can never satisfy CTR, retention, views, revenue, or another analytics target.

### BrainEvaluationLoop
Finds due final evaluations, processes manual/canonical observations, records measured outcomes, refreshes learning candidates, and summarizes loop health. Insufficient-data results remain retryable after later sync/import evidence arrives.

Baseline precedence is:

1. explicit pre-intervention canonical snapshot;
2. genuine historical lifecycle cohort at the declared evaluation horizon;
3. `insufficient_data`.

Current/lifetime totals are never relabeled as an earlier lifecycle baseline.

### AlgorithmMonitoringSchedule
Each recommendation or Priming execution now receives a monitoring schedule built from standard horizons:

- T+1h
- T+6h
- T+24h
- T+48h
- T+72h
- T+7d when the declared evaluation window extends that far

Horizons after the action's declared final evaluation window are omitted. Intermediate checkpoints have role `observe`; exactly one checkpoint has role `final_evaluation`.

Intermediate monitoring checkpoints may create `CHECKPOINT_REACHED` lineage events, but they deliberately do **not** create `OUTCOME_MEASURED` events. Therefore one recommendation checked six times still counts as one action/outcome for learning purposes.

Both `AlgorithmWorkflowRecipes` and `AlgorithmPrimingWorkflow` attach these schedules to their canonical intelligence events.

### BrainEvaluationInbox
Builds the Brain-facing review model without creating another store. It combines:

- intermediate observation checkpoints
- overdue final evaluations
- missing-evidence retries
- measured outcomes
- learning-review items
- full attribution lineage
- priority and governance summaries

The inbox is mounted in the Brain context rail and subscribes to canonical VT-SYNC snapshot updates. Intermediate monitoring items are explicitly labeled non-learnable.

### BrainCheckpointPolicy
Classifies overdue final checkpoints as `due`, `aging`, `stale`, or `critical`. Aging changes review priority only; it never causes automatic external action.

### AlgorithmLifecycleCohorts
Defines fair historical comparison using genuine lifecycle observations. T+24h outcomes are compared with peer observations measured near T+24h, not with current lifetime totals. Matching can consider channel, metric, lifecycle hour, format, duration tolerance, and topic key. Too few comparable peers returns `insufficient_peers`; the median is preferred to reduce outlier distortion.

### AlgorithmLifecycleObservationStore
Persists genuine lifecycle observations from canonical VT-SYNC snapshots. Each record stores the video's actual age at snapshot capture together with metric value, format, duration/topic metadata when available, and canonical evidence reference.

The store captures semantic metrics including qualified views, watch quality, CTR, views, watch time, impressions, revenue, subscribers gained, likes, comments, and shares when present. The Brain Evaluation Inbox subscribes to `subscribeToVtSyncSnapshot()`, so active syncs accumulate real lifecycle evidence without synthesizing historical T+24h/T+72h values from present lifetime totals.

### AlgorithmLifecycleBaseline
Hydrates missing evaluation baselines from persisted lifecycle peers only when a concrete video and evaluation horizon exist. Explicit baselines always win.

### AlgorithmLearningCandidates
Aggregates repeated measured outcomes into evidence-backed learning candidates. Stable candidate IDs prevent duplicate history. Intermediate monitoring checkpoints do not contribute to candidate sample size.

### AlgorithmLearningGovernance
Adds the review boundary between a measured candidate and durable Channel Profile promotion. Decisions are `hold`, `reject`, or `approve_for_profile_review`. Approval at this stage still does not mutate Channel Profile.

### AlgorithmLearningProfilePromotion
The final promotion adapter requires both prior governance approval and explicit creator approval at promotion time. It respects Brain personalization/learning controls and reuses the existing Brain teaching/promotion path rather than introducing a second Channel Profile writer.

### AlgorithmRecommendationCalibration
Compares recommendation confidence with measured outcomes. It reports success rate by low/medium/high confidence and by command, plus warnings for meaningful over/under-confidence. Calibration is descriptive only in Phase 6.

### BrainAlgorithmIntelligenceContext
The Brain-facing context includes urgent evaluation items, overdue/insufficient-data counts, monitoring state, stale/critical checkpoints, learning reviews, calibration, warnings, and lifecycle-evidence coverage. `buildBrainAlgorithmEvaluationContext(channelId)` supplies the feedback-loop context without rebuilding the full Phase 5 portfolio.

### Brain task routing and Context Broker
`BrainTaskProfileRegistry` recognizes evaluation questions such as:

- What worked?
- What failed?
- Which recommendation actually helped?
- What still needs evidence?
- What should I stop doing?
- How reliable are your high-confidence recommendations?

These route to a distinct evaluation task profile. `BrainContextBroker` now conditionally injects Phase 6 context through the standard Brain path whenever the resolved task is `evaluation`, using the active Brain channel or connected channel handle. This gives the full Brain Hub, Sidebar Chatbot, dashboard Brain surfaces, and other standard orchestrator consumers the same evidence without bloating unrelated prompts.

## Learning boundary

Phase 6 separates six levels:

1. **Monitoring observation** — an intermediate horizon was reached; not learnable by itself.
2. **Execution** — a workflow/action occurred.
3. **Outcome** — the final result was actually measured.
4. **Learning candidate** — repeated measured outcomes with enough consistency.
5. **Governance decision** — hold, reject, or approve for Profile review.
6. **Durable Channel Profile learning** — explicit creator-approved promotion through the existing Brain memory system.

## Regression coverage added

Focused tests now cover:

- evaluation status behavior and missing evidence
- canonical metric resolution
- lifecycle-cohort median baselines and rejection of mismatched ages
- evaluation-intent routing
- workflow completion cannot satisfy analytics targets
- non-terminal/unattributed workflow outcomes do not evaluate
- learning promotion requires governance + creator approval + enabled learning controls
- standard monitoring horizons produce one final evaluation and observation-only intermediate checkpoints

These tests are committed to the Phase 6 branch; no GitHub Actions run has been observed yet, so they should not be described as CI-verified until a workflow actually runs.

## Remaining Phase 6 build slices

1. Move lifecycle observations and Algorithm event history from bounded local storage into the production persistence layer once the persistence migration contract is finalized.
2. Add an explicit acknowledgement/capture lifecycle for intermediate monitoring checkpoints so resolved observations do not remain indefinitely in the Inbox.
3. Add creator-facing calibration detail and attribution drill-down views beyond the compact Inbox cards.
4. Use calibration only as evidence for a future governed strategy-weight adjustment system; do not silently modify recommendation behavior.
5. Run the focused Phase 6 test set and build/typecheck through CI or a verified local runner before marking PR #88 ready for review.
