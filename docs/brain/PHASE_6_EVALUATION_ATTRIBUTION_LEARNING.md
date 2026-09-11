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
  -> canonical metric observations
  -> measured outcome
  -> repeated learning candidate
  -> Channel Intelligence
  -> separately governed Channel Profile promotion
```

## New canonical services

### AlgorithmIntelligenceEventLedger
Tracks stable lineage across anomaly escalations, opportunities, priming plans/steps, recommendations, handoffs, workflows, evaluation checkpoints, measured outcomes, and learning candidates.

### AlgorithmEvaluationEngine
Evaluates declared metric targets after their checkpoint. It returns pending, insufficient-data, positive, neutral, negative, or mixed rather than inventing success when evidence is missing.

### AlgorithmLearningCandidates
Aggregates repeated measured outcomes into evidence-backed learning candidates. A minimum repeated-evidence threshold is required before a candidate can influence Channel Intelligence.

This service does **not** write directly to durable Channel Profile memory.

### BrainEvaluationLoop
Finds due evaluations, processes metric observations, records measured outcomes, refreshes learning candidates, and summarizes loop health for Brain-facing surfaces.

## Attribution

Executed Algorithm recommendations and Algorithm Priming steps now record:

- stable event ID
- source signal / step ID
- recommendation ID or priming plan/step ID
- action packet ID
- workflow ID
- evidence IDs
- evaluation target(s)
- checkpoint time
- creator/project/video scope

This makes it possible to answer:

- Did this recommendation help?
- Did this priming tactic help?
- Which tool/workflow produced the result?
- Was an anomaly actually strategically useful?
- Which opportunities repeatedly produced positive outcomes?
- Which learned patterns are strong enough to become Channel Profile candidates?

## Learning boundary

Phase 6 deliberately separates three levels:

1. **Outcome** — one measured result.
2. **Learning candidate** — repeated measured evidence with enough consistency.
3. **Durable Channel Profile learning** — a separately governed promotion decision.

Channel Intelligence may surface measured learning candidates, but it must label them as candidates and preserve their evidence/sample size.

## Next build slice

1. Connect evaluation observations to analytics-canon / VT-SYNC metric readers.
2. Add event capture at anomaly/opportunity creation time, not only at execution time.
3. Add Brain-facing Evaluation Inbox and attribution UI.
4. Add promotion/rejection controls for learning candidates.
5. Add experiment cohort matching so pre/post comparisons use comparable lifecycle windows.
6. Add recommendation calibration: predicted confidence vs measured success.
7. Add automatic stale/pending checkpoint handling without automatic external actions.
