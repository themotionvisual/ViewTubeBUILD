# SITE IMPROVEMENT INTELLIGENCE BACKLOG

Prioritized execution backlog generated from documentation synthesis + current data coverage status.

## Top High-Value Insights

- Shorts and long-form need explicit semantic separation for interpretation (especially `views`, CTR, and monetization).
- The current sync gets strong channel/video baseline coverage but misses most advanced segmentation dimensions (device, geo depth, retention curves).
- Monetization and Reporting API financial fields are incomplete; this limits revenue diagnostics and reconciliation workflows.
- Personal history signals are product-valuable but need a consented ingestion path (e.g., Takeout import) rather than direct API assumptions.
- Query compatibility and 400 handling must be made first-class (metric grouping + adaptive fallback + unsupported-metric memory).

## P0 Backlog (Stabilize and Unblock)

### P0-1: Build query compatibility matrix and adaptive fetch scheduler
- User value / business impact: eliminates noisy 400s and increases trust in “received vs missing” state.
- Data dependencies: `videoThumbnailImpressions`, `videoThumbnailImpressionsClickRate`, `creatorContentType`, monetization metrics.
- UI/module target: analytics sync service + Data Coverage table status confidence.
- Implementation notes: store `(dimension set + metric set)` compatibility cache; preflight known-bad combinations; degrade to scalar or channel rollup.
- Acceptance criteria: repeated 400 loops eliminated; failed combinations logged once with reason; coverage rows show deterministic status.
- Risk/constraint flags: YouTube API behavior varies by channel eligibility and window.

### P0-2: Complete canonical ingestion map for current API-only stack
- User value / business impact: “every category” table reflects true ingest reality and prevents phantom fields.
- Data dependencies: all `yes/partial/no` rows in `YOUTUBE_DATA_COVERAGE_COMPLETE.csv`.
- UI/module target: data coverage inventory builder + performance data manager table.
- Implementation notes: map each canonical key to source bucket and transform rule; enforce one canonical key and alias collapse.
- Acceptance criteria: no duplicate canonical keys in UI; each row has stable evidence source label.
- Risk/constraint flags: legacy aliases and non-core metric naming drift.

### P0-3: Add confidence metadata for each category in UI
- User value / business impact: clarifies whether a category is missing due to API limits vs implementation gaps.
- Data dependencies: `received_now`, `constraints`, `how_to_receive_if_missing`.
- UI/module target: Data Coverage table chips/legend + filtering.
- Implementation notes: render confidence badges (`ingested`, `partial`, `blocked`, `planned`).
- Acceptance criteria: users can filter to “feasible missing now” and “blocked by API/policy”.
- Risk/constraint flags: requires ongoing curation as YouTube API evolves.

## P1 Backlog (High-Value Expansion)

### P1-1: Add retention analytics pass (long-form)
- User value / business impact: unlocks hook/drop-off intelligence and stronger content optimization recommendations.
- Data dependencies: `elapsedVideoTimeRatio`, `audienceWatchRatio`, `relativeRetentionPerformance`.
- UI/module target: Performance Hub retention panel and insight cards.
- Implementation notes: separate retention endpoint pass; store sampled curve points for performant rendering.
- Acceptance criteria: at least one retention chart with exportable points per long-form video.
- Risk/constraint flags: not meaningful for Shorts; window/row size expansion.

### P1-2: Add device/playback segmentation pass
- User value / business impact: actionable packaging decisions by platform (mobile vs TV vs desktop).
- Data dependencies: `deviceType`, `operatingSystem`, `playbackLocationType`, `playbackLocationDetail`.
- UI/module target: audience context widgets and comparison charts.
- Implementation notes: introduce scoped fetch jobs and aggregated storage for segment pivots.
- Acceptance criteria: per-window breakdown tables render without affecting existing sync reliability.
- Risk/constraint flags: privacy thresholds and row cardinality growth.

### P1-3: Add advanced geography depth
- User value / business impact: better targeting by region and market-level strategy.
- Data dependencies: `continent`, `subContinent`, `province`, `city` + `country` baseline.
- UI/module target: Global Footprint graph family.
- Implementation notes: city-id lookup mapping and suppression handling for sparse buckets.
- Acceptance criteria: geo drill-down works from country to available lower-level granularity.
- Risk/constraint flags: city/province often omitted under privacy thresholds.

## P2 Backlog (Strategic Systems)

### P2-1: Reporting API warehouse ingestion for financial reconciliation
- User value / business impact: enterprise-grade revenue traceability and adjustments analysis.
- Data dependencies: reporting-only fields (`asset_id`, `claim_id`, `partner_revenue`, adjustment/policy fields).
- UI/module target: finance/reconciliation station + policy impact audit.
- Implementation notes: scheduled Reporting API jobs, file retrieval, parser, and durable storage.
- Acceptance criteria: financial CSV datasets ingested and queryable with channel/date filters.
- Risk/constraint flags: monetization eligibility, report retention windows, content-owner constraints.

### P2-2: Consent-driven personal history import pipeline
- User value / business impact: deeper personalization and creator behavior analytics.
- Data dependencies: `personal_history` rows in coverage catalog.
- UI/module target: optional personal analytics module and import wizard.
- Implementation notes: Google Takeout import format support, local parsing, explicit user consent controls.
- Acceptance criteria: user can import, review, and delete personal-history datasets from UI.
- Risk/constraint flags: privacy/legal compliance, encryption, retention policy.

### P2-3: Insight quality engine (cross-metric diagnostics)
- User value / business impact: converts raw metrics into high-value strategic recommendations.
- Data dependencies: merged canonical metrics across views, engagement, retention, traffic, monetization.
- UI/module target: recommendation cards and weekly action reports.
- Implementation notes: rules + threshold framework, later upgrade to model-based scoring.
- Acceptance criteria: each recommendation references explicit metrics and confidence reasoning.
- Risk/constraint flags: false positives if upstream data completeness is low.

## Execution QA Gates

1. Canonical key uniqueness and alias collapse validated against coverage CSV.
2. Each backlog item references at least one canonical row from coverage artifact.
3. No P0 item depends on Reporting API or personal-history ingestion to be successful.
4. UI changes preserve existing route stability and do not regress sync baseline.
