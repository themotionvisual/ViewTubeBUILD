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
  -> evidence-backed checkpoint resolution
  -> final evaluation checkpoint
  -> analytics-canon + canonical Brain Outcome Ledger
  -> lifecycle-comparable measured outcome
  -> Evaluation Inbox / attribution trace
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
Each recommendation or Priming execution receives a monitoring schedule built from standard horizons:

- T+1h
- T+6h
- T+24h
- T+48h
- T+72h
- T+7d when the declared evaluation window extends that far

Horizons after the action's declared final evaluation window are omitted. Intermediate checkpoints have role `observe`; exactly one checkpoint has role `final_evaluation`.

Intermediate monitoring checkpoints may create `CHECKPOINT_REACHED` lineage events, but they deliberately do **not** create `OUTCOME_MEASURED` events. Therefore one recommendation checked six times still counts as one action/outcome for learning purposes.

Both `AlgorithmWorkflowRecipes` and `AlgorithmPrimingWorkflow` attach these schedules to their canonical intelligence events.

### AlgorithmMonitoringResolver
Automatically resolves due video-scoped monitoring checkpoints only when matching lifecycle evidence has actually been captured.

Resolution rules:

- all declared checkpoint metrics must be present before a checkpoint is fully resolved;
- evidence must belong to the same channel and video;
- evidence must be close to the checkpoint's real due time;
- early checkpoints use tighter timing tolerances than later checkpoints;
- a much later lifetime/current observation cannot satisfy an earlier T+1h/T+6h/T+24h checkpoint;
- partial evidence remains partial and visible;
- non-video-scoped checkpoints cannot be resolved from video lifecycle evidence;
- auto-resolution records `CHECKPOINT_REACHED` only, never `OUTCOME_MEASURED`.

The Brain Evaluation Inbox runs this resolver after canonical VT-SYNC lifecycle capture, so monitoring can advance automatically as real evidence arrives without manufacturing success/failure.

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

### AlgorithmAttributionDetail
Builds a drill-down model for one recommendation/Priming/evaluation event. It follows both ancestor lineage and related events sharing recommendation, Priming step, ActionPacket, or workflow identity.

The detail model separates:

- source signals / opportunities / Priming provenance
- decision events
- execution/handoff events
- monitoring checkpoints
- measured outcomes
- learning/review/promotion events
- canonical evidence references
- lifecycle observations relevant to the action's metrics
- confidence-bucket and command-level calibration

This makes it possible to answer not just “did it work?” but “what evidence caused this recommendation, what tool acted, which checkpoints were reached, what changed, and how reliable has this class of recommendation historically been?”

### BrainAttributionDetailPanel
The Evaluation Inbox now exposes a **Trace evidence** action. The creator-facing drill-down displays:

- evidence/checkpoint/outcome/learning counts;
- current measured result;
- command/confidence calibration;
- monitoring schedule with reached checkpoints;
- evidence → decision → execution → monitoring → outcome → learning timeline;
- calibration warnings when present.

This panel remains read-only with respect to execution. It does not create external actions or alter strategy weights.

### AlgorithmLearningCandidates
Aggregates repeated measured outcomes into evidence-backed learning candidates. Stable candidate IDs prevent duplicate history. Intermediate monitoring checkpoints do not contribute to candidate sample size.

### AlgorithmLearningGovernance
Adds the review boundary between a measured candidate and durable Channel Profile promotion. Decisions are `hold`, `reject`, or `approve_for_profile_review`. Approval at this stage still does not mutate Channel Profile.

### AlgorithmLearningProfilePromotion
The final promotion adapter requires both prior governance approval and explicit creator approval at promotion time. It respects Brain personalization/learning controls and reuses the existing Brain teaching/promotion path rather than introducing a second Channel Profile writer.

### AlgorithmRecommendationCalibration
Compares recommendation confidence with measured outcomes. It reports success rate by low/medium/high confidence and by command, plus warnings for meaningful over/under-confidence. Calibration is descriptive only in Phase 6.

### BrainAlgorithmIntelligenceContext
The Brain-facing context includes urgent evaluation items, overdue/insufficient-data counts, monitoring state, auto-resolved checkpoint counts, stale/critical checkpoints, learning reviews, calibration, warnings, and lifecycle-evidence coverage. `buildBrainAlgorithmEvaluationContext(channelId)` supplies the feedback-loop context without rebuilding the full Phase 5 portfolio.

### Brain task routing and Context Broker
`BrainTaskProfileRegistry` recognizes evaluation questions such as:

- What worked?
- What failed?
- Which recommendation actually helped?
- What still needs evidence?
- What should I stop doing?
- How reliable are your high-confidence recommendations?

These route to a distinct evaluation task profile. `BrainContextBroker` conditionally injects Phase 6 context through the standard Brain path whenever the resolved task is `evaluation`, using the active Brain channel or connected channel handle. This gives the full Brain Hub, Sidebar Chatbot, dashboard Brain surfaces, and other standard orchestrator consumers the same evidence without bloating unrelated prompts.

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
- monitoring auto-resolution requires all declared metrics and rejects much-later evidence
- non-video-scoped actions are not falsely resolved from video lifecycle evidence

These tests are committed to the Phase 6 branch; no GitHub Actions run has been observed yet, so they should not be described as CI-verified until a workflow actually runs.

## Remaining Phase 6 build slices

1. Move lifecycle observations and Algorithm event history from bounded local storage into the production persistence layer once the persistence migration contract is finalized.
2. Add automatic final-outcome processing when a final horizon is reached and all canonical evaluation requirements are present, while preserving the current approval/ownership boundaries.
3. Add richer creator controls for filtering attribution traces by video, command, source signal, and outcome.
4. Use calibration only as evidence for a future governed strategy-weight adjustment system; do not silently modify recommendation behavior.
5. Run the focused Phase 6 test set and build/typecheck through CI or a verified local runner before marking PR #88 ready for review.
