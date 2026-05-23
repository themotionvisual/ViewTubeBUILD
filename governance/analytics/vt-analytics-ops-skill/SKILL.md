---
name: vt-analytics-ops
description: Use when working on ViewTube statistics pipelines, YouTube Analytics sync reliability, PerformanceHub chart correctness, metric alias conflicts, diagnostics triage, or AI-token-gated analytics behaviors across `viewtubeX`.
---

# VT Analytics Ops

## Overview
Use this skill to run ViewTube analytics work end-to-end with consistent contracts: query shape, sync diagnostics, metric mapping, chart readiness, source-of-truth API selection, and gated AI behavior.

## Trigger Conditions
Use this skill when requests mention any of the following:
- Missing or zeroed analytics values in PerformanceHub (especially impressions/CTR)
- YouTube Analytics API 400 errors, invalid metric/dimension/filter combinations, or split-retry loops
- Metric alias drift between API fields, canonical rows, and table/chart labels
- Data sync quality, cache consistency, or diagnostics interpretation (`knownInvalidCombos`, failed groups)
- CSV auto-detect, source provenance, or API-vs-CSV merge conflicts
- Reporting API coverage questions, delayed bulk jobs, or report-type selection
- AI feature failures tied to plan/tokens/entitlements that affect analytics-facing widgets

## Workflow
1. Preflight and source-of-truth alignment
2. Choose the correct source layer: `data_api`, `analytics_api`, `reporting_api`, or `csv`
3. Query-shape and API-compatibility validation
4. Sync diagnostics triage and failure classification
5. Canonical row + chart contract verification
6. AI entitlement + queue behavior verification (analytics-adjacent)
7. PerformanceHub acceptance checks

Read references by need:
- Full system guide and consolidation roadmap: `../PERFORMANCE_HUB_MASTER_WORKFLOW_GUIDE.md`
- Full API layer/source map: `references/youtube-api-source-map.md`
- Metrics/dimensions truth and drift notes: `references/youtube-analytics-dimensions-metrics.md`
- Operational sync behavior and retry rules: `references/vt-sync-playbook.md`
- Table/chart canonical field contracts: `references/chart-contracts.md`
- Final acceptance checks in PerformanceHub: `references/performancehub-validation.md`
- Optimization and consolidation backlog: `references/performancehub-optimization-roadmap.md`

## Execution Rules
- Never assume column order in API payloads; map by `columnHeaders` names.
- Treat YouTube as three official source layers, not one combined schema.
- Prefer `YouTube Data API v3` for metadata and lifetime public resource stats.
- Prefer `YouTube Analytics API` for fast targeted syncs and user-facing tables.
- Prefer `YouTube Reporting API` for delayed bulk history and warehouse-style coverage.
- Keep Studio CSV imports as first-class for retention packages and Studio-only cuts.
- Treat `videoThumbnailImpressions` and `videoThumbnailImpressionsClickRate` as first-class required video sync metrics unless explicitly disabled by session diagnostics.
- For thumbnail impressions/CTR, prefer the channel-scoped top-videos report shape and local video filtering over per-video filtered requests when the API rejects `filters=video==...`.
- Validate video-scope eligibility before adding a metric to active sync. `viewerPercentage` is not a generic per-video metric in VT; it belongs to demographic/playback-detail report shapes, not the canonical `dimensions=video` fetch loop.
- Do not alias annotation metrics to card metrics. `annotationClickThroughRate` and `cardClickRate` must remain separate semantics even if they are both long-form interaction signals.
- Do not hardcode Reporting IDs from stale docs alone; use `reportTypes.list` as the runtime source of truth.
- Keep fixes additive and observable: update diagnostics + user-visible evidence in validation surfaces.
- Prefer targeted validation over repo-wide churn.
- Preserve manual-sync behavior unless user explicitly asks to change it.

## Do / Don't
- Do:
  - Validate request shape first when 400s appear.
  - Reconcile docs -> capability registry -> active fetch groups before calling a metric "missing."
  - Inspect `syncDiagnostics.failureReasons`, `disabledMetrics`, `knownInvalidCombos`, and `splitRetries` before changing transforms.
  - Verify mapping from raw metric -> canonical row -> displayed table/chart column.
  - Document provenance whenever CSVs fill gaps the APIs cannot reliably cover.
- Don't:
  - Silence failures without diagnostics.
  - Introduce render-time side effects in entitlement reads.
  - Treat API docs as sufficient without checking VT runtime contracts.
  - Flatten Data API, Analytics API, and Reporting API into one fake capability layer.

## Fast Checklist
- Correct source layer chosen for this dataset?
- Query params valid for target report and dimensions?
- Metric group fallback/split logic deterministic?
- Diagnostics preserve root cause and impacted group?
- Canonical aliases for impressions/CTR consistent everywhere?
- PerformanceHub shows actionable sync state and non-drifted headers?

## Output Expectations
When finishing analytics work, include:
- What failed (group/metric/request shape/source layer)
- What changed (contracts, fetch shape, mapping, provenance, or diagnostics)
- How verified (specific checks + outcomes)
- Any residual risk (API thresholds, anonymization, lag windows, doc drift)

## Documentation rule
If analytics work changes the canonical source decision, sync phase behavior, CSV family routing, or chart/table contracts, update the matching reference file in this skill package and the master workflow guide in `governance/analytics/`.
