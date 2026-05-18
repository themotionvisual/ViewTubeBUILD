---
name: vt-analytics-ops
description: Use when working on ViewTube statistics pipelines, YouTube Analytics sync reliability, PerformanceHub chart correctness, metric alias conflicts, diagnostics triage, or AI-token-gated analytics behaviors across `viewtubeX`.
---

# VT Analytics Ops

## Overview
Use this skill to run ViewTube analytics work end-to-end with consistent contracts: query shape, sync diagnostics, metric mapping, chart readiness, and gated AI behavior.

## Trigger Conditions
Use this skill when requests mention any of the following:
- Missing or zeroed analytics values in PerformanceHub (especially impressions/CTR)
- YouTube Analytics API 400 errors, invalid metric/dimension/filter combinations, or split-retry loops
- Metric alias drift between API fields, canonical rows, and table/chart labels
- Data sync quality, cache consistency, or diagnostics interpretation (`knownInvalidCombos`, failed groups)
- AI feature failures tied to plan/tokens/entitlements that affect analytics-facing widgets

## Workflow
1. Preflight and source-of-truth alignment
2. Query-shape and API-compatibility validation
3. Sync diagnostics triage and failure classification
4. Canonical row + chart contract verification
5. AI entitlement + queue behavior verification (analytics-adjacent)
6. PerformanceHub acceptance checks

Read references by need:
- API dimensions/metrics truth: `references/youtube-analytics-dimensions-metrics.md`
- Operational sync behavior and retry rules: `references/vt-sync-playbook.md`
- Table/chart canonical field contracts: `references/chart-contracts.md`
- Final acceptance checks in PerformanceHub: `references/performancehub-validation.md`

## Execution Rules
- Never assume column order in API payloads; map by `columnHeaders` names.
- Treat `videoThumbnailImpressions` and `videoThumbnailImpressionsClickRate` as first-class required video sync metrics unless explicitly disabled by session diagnostics.
- For thumbnail impressions/CTR, prefer the channel-scoped top-videos report shape and local video filtering over per-video filtered requests when the API rejects `filters=video==...`.
- If the thumbnail report class is still rejected (`HTTP 400`) after grouped + minimal-paging + per-metric probes, keep table values as `-`, keep columns visible, and direct users to CSV import guidance.
- Persist request-shape outcomes into `syncDiagnostics` and `syncRunSummary.analyticsVerification`; launch verification should read cache state, not infer health from console noise.
- Validate video-scope eligibility before adding a metric to active sync. `viewerPercentage` is not a generic per-video metric in VT; it belongs to demographic/playback-detail reports, not the main `dimensions=video` sync path.
- Do not alias annotation metrics to card metrics. `annotationClickThroughRate` and `cardClickRate` must remain separate semantics even if they are both long-form interaction signals.
- Keep `creatorContentType` failures quarantined from thumbnail metric health. Format-aware surfaces may degrade, but impressions/CTR status must remain independently readable.
- Keep fixes additive and observable: update diagnostics + user-visible evidence in validation surfaces.
- Prefer targeted validation over repo-wide churn.
- Preserve manual-sync behavior unless user explicitly asks to change it.

## Do / Don't
- Do:
  - Validate request shape first when 400s appear.
  - Reconcile docs -> capability registry -> active fetch groups before calling a metric "missing."
  - Inspect `syncDiagnostics.failureReasons`, `disabledMetrics`, `knownInvalidCombos`, and `splitRetries` before changing transforms.
  - Verify mapping from raw metric -> canonical row -> displayed table/chart column.
- Don't:
  - Silence failures without diagnostics.
  - Introduce render-time side effects in entitlement reads.
  - Treat API docs as sufficient without checking VT runtime contracts.

## Fast Checklist
- Query params valid for target report and dimensions?
- Metric group fallback/split logic deterministic?
- Diagnostics preserve root cause and impacted group?
- Canonical aliases for impressions/CTR consistent everywhere?
- PerformanceHub shows actionable sync state and non-drifted headers?

## Output Expectations
When finishing analytics work, include:
- What failed (group/metric/request shape)
- What changed (contracts, fetch shape, mapping, or diagnostics)
- How verified (specific checks + outcomes)
- Any residual risk (API thresholds, anonymization, lag windows)
