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

## Persistence authority

Phase 6 intelligence history now follows the application's existing account-owned production persistence model rather than treating browser storage as the durable authority.

```text
Browser local cache
      ↕ hydrate / write-through
Authenticated /api/brain-intelligence
      ↓
Session + connected-channel ownership check
      ↓
ViewTube production PostgreSQL (DATABASE_URL)
```

- `viewtube_brain_intelligence_events` stores stable Algorithm Intelligence events as user + channel + event-ID scoped JSONB records.
- `viewtube_brain_lifecycle_observations` stores genuine lifecycle measurements as user + channel scoped records.
- The API derives `viewtube_user_id` exclusively from the existing `vt_session` cookie. Client requests never supply a user ID.
- A requested channel must match the channel connected to the authenticated ViewTube account before data can be read or written.
- Local storage remains a bounded browser cache/offline continuity layer; it is hydrated from server history before evaluation/calibration advancement when the Brain Evaluation Inbox opens.
- New events and lifecycle observations write locally first and then write through to durable storage. A temporary persistence failure does not destroy the local workflow state.
- Production persistence requires the existing `DATABASE_URL`. Development without that database uses the server adapter's in-memory fallback.
- The schema is isolated from analytics ownership: durable Brain history stores intelligence/evaluation lineage and lifecycle observations, while VT-SYNC and analytics-canon remain the owners of analytics acquisition/canonical evidence.

## Canonical services

### AlgorithmIntelligenceEventLedger
Tracks stable lineage across anomaly escalations, opportunities, priming plans/steps, recommendations, handoffs, workflows, monitoring checkpoints, measured outcomes, learning candidates, reviews, and governed promotions. Stable IDs prevent repeated Brain portfolio builds from manufacturing duplicate history. The browser ledger is now a cache that hydrates from and writes through to the authenticated durable Brain store.

### AlgorithmEvaluationEngine
Evaluates declared metric targets after their final checkpoint. It returns pending, insufficient-data, positive, neutral, negative, or mixed rather than inventing success when evidence is missing. Each source action owns one idempotent measured-outcome event so evidence retries cannot inflate calibration or learning sample sizes.

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
Each recommendation or Priming execution receives a monitoring schedule built from standard horizons: T+1h, T+6h, T+24h, T+48h, T+72h, and T+7d when the declared evaluation window extends that far. Horizons after the action's declared final evaluation window are omitted. Intermediate checkpoints have role `observe`; exactly one checkpoint has role `final_evaluation`.

Intermediate monitoring checkpoints may create `CHECKPOINT_REACHED` lineage events, but they deliberately do **not** create `OUTCOME_MEASURED` events. Therefore one recommendation checked six times still counts as one action/outcome for learning purposes.

### AlgorithmMonitoringResolver
Automatically resolves due video-scoped monitoring checkpoints only when matching lifecycle evidence has actually been captured. All declared checkpoint metrics must be present; evidence must belong to the same channel/video and be close enough to the real checkpoint time. Much-later current/lifetime observations cannot satisfy earlier horizons. Auto-resolution records `CHECKPOINT_REACHED` only, never `OUTCOME_MEASURED`.

### AlgorithmFinalEvaluationResolver
Final-outcome processing is automatic only after the declared final monitoring horizon has actually been reached. The resolver preflights canonical observations plus explicit/lifecycle baselines. Pending or insufficient-data previews are not committed; only positive, neutral, negative, or mixed terminal results become measured outcomes.

### BrainEvaluationInbox
The Inbox combines intermediate observation checkpoints, overdue final evaluations, missing-evidence retries, measured outcomes, learning-review items, full attribution lineage, priority, and governance summaries. On channel activation it hydrates durable event/lifecycle history first, then advances capture -> monitoring resolution -> resolvable final evaluation, and only then subscribes to subsequent VT-SYNC updates.

### BrainCheckpointPolicy
Classifies overdue final checkpoints as `due`, `aging`, `stale`, or `critical`. Aging changes review priority only; it never causes automatic external action.

### AlgorithmLifecycleCohorts
Defines fair historical comparison using genuine lifecycle observations. T+24h outcomes are compared with peer observations measured near T+24h, not with current lifetime totals. Matching can consider channel, metric, lifecycle hour, format, duration tolerance, and topic key. Too few comparable peers returns `insufficient_peers`; the median is preferred to reduce outlier distortion.

### AlgorithmLifecycleObservationStore
Captures genuine lifecycle observations from canonical VT-SYNC snapshots. The local store is now a cache/write-through layer for the durable user/channel-scoped server store. Each record retains actual video age, metric value, format/duration/topic metadata when available, and canonical evidence reference.

### AlgorithmLifecycleBaseline
Hydrates missing evaluation baselines from persisted lifecycle peers only when a concrete video and evaluation horizon exist. Explicit baselines always win.

### AlgorithmAttributionDetail
Builds a drill-down model for one recommendation/Priming/evaluation event. It follows ancestor lineage and related events sharing recommendation, Priming step, ActionPacket, or workflow identity, separating source provenance, decisions, execution, monitoring, outcomes, learning, lifecycle evidence, and calibration.

### BrainAttributionDetailPanel
The Evaluation Inbox exposes a **Trace evidence** action. The read-only creator-facing drill-down displays evidence/checkpoint/outcome/learning counts, measured result, command/confidence calibration, monitoring schedule, and the evidence -> decision -> execution -> monitoring -> outcome -> learning timeline.

### AlgorithmLearningCandidates
Aggregates repeated measured outcomes into evidence-backed learning candidates. Stable candidate IDs prevent duplicate history. Intermediate monitoring checkpoints do not contribute to candidate sample size.

### AlgorithmLearningGovernance
Adds the review boundary between a measured candidate and durable Channel Profile promotion. Decisions are `hold`, `reject`, or `approve_for_profile_review`. Approval at this stage still does not mutate Channel Profile.

### AlgorithmLearningProfilePromotion
The final promotion adapter requires both prior governance approval and explicit creator approval at promotion time. It respects Brain personalization/learning controls and reuses the existing Brain teaching/promotion path rather than introducing a second Channel Profile writer.

### AlgorithmRecommendationCalibration
Compares recommendation confidence with measured outcomes. It reports success rate by low/medium/high confidence and by command, plus warnings for meaningful over/under-confidence. Calibration is descriptive only in Phase 6.

### BrainAlgorithmIntelligenceContext
The Brain-facing context includes urgent evaluation items, overdue/insufficient-data counts, monitoring state, auto-resolved checkpoint counts, stale/critical checkpoints, learning reviews, calibration, warnings, and lifecycle-evidence coverage.

### Brain task routing and Context Broker
`BrainTaskProfileRegistry` recognizes evaluation questions such as “What worked?”, “What failed?”, “Which recommendation actually helped?”, “What still needs evidence?”, “What should I stop doing?”, and “How reliable are your high-confidence recommendations?” These route to a distinct evaluation task profile. `BrainContextBroker` conditionally injects Phase 6 context through the standard Brain path whenever the resolved task is `evaluation`.

## Learning boundary

Phase 6 separates six levels:

1. **Monitoring observation** — an intermediate horizon was reached; not learnable by itself.
2. **Execution** — a workflow/action occurred.
3. **Outcome** — the final result was actually measured.
4. **Learning candidate** — repeated measured outcomes with enough consistency.
5. **Governance decision** — hold, reject, or approve for Profile review.
6. **Durable Channel Profile learning** — explicit creator-approved promotion through the existing Brain memory system.

## Regression coverage added

Focused tests cover evaluation status behavior, canonical metric resolution, lifecycle-cohort baselines, evaluation-intent routing, workflow/analytics ownership boundaries, governed learning promotion, one-final-outcome monitoring schedules, evidence-backed monitoring resolution, rejection of much-later observations, the video-scope requirement, and user/channel isolation in the durable persistence adapter.

These tests are committed; they are not CI-verified until a workflow or verified local runner executes them.

## Remaining Phase 6 build slices

1. Add richer creator controls for filtering attribution traces by video, command, source signal, and outcome.
2. Add migration/backfill controls for any existing local-only Phase 6 history that predates durable persistence.
3. Use calibration only as evidence for a future governed strategy-weight adjustment system; do not silently modify recommendation behavior.
4. Run the focused Phase 6 test set and build/typecheck through CI or a verified local runner before marking the follow-up PR ready for review.
