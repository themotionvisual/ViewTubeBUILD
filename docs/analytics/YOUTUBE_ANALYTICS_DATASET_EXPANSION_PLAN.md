# YouTube Analytics Dataset, Window, and Video Deep-Dive Expansion Plan

**Status:** implementation plan
**Authoritative product surface:** `/analytics` / VT-SYNC
**Runtime data policy:** real YouTube responses and user imports only; no mock, estimated, or fabricated runtime rows
**Last audited:** 2026-08-27 against `origin/main` and the live VT-SYNC registries

## Outcome

Expand VT-SYNC from its current 34 visible-table intelligence contract into a window-aware analytics system that covers:

- playback-location type and embedded playback-location detail;
- playback-detail dimensions (`creatorContentType`, `liveOrOnDemand`, `subscribedStatus`, and `youtubeProduct`);
- every traffic-source type returned by YouTube, with source-detail reports only where Google actually supports them;
- selected-video deep-dive tables;
- standard `7d`, `28d`, `90d`, `365d`, `lifetime`, and custom windows wherever the underlying report supports a date range;
- a separately authorized content-owner lane for `uploaderType` + `claimedStatus`.

This is an additive migration. Existing VT-SYNC datasets, the 200-video Analytics batches, one-switch-per-dataset behavior, canonical imports, navigation, animations, and stored rows remain intact.

The machine-readable implementation inventory is in [`youtube-analytics-dataset-expansion-matrix.csv`](./youtube-analytics-dataset-expansion-matrix.csv).

## Impact, risk, and verification

### Impact

- Gives every supported analytics table a consistent time-window context.
- Adds missing playback and video-investigation workflows without turning the global Videos sync into a dependency of unrelated datasets.
- Makes overview-only traffic sources such as Notifications visible without pretending Google returned unavailable referrer details.
- Connects the data to creator workflows: strategy uses traffic/search/video trends; packaging uses reach and source movement; scripting and production use retention/playback; Shorts uses content type, sound pages, and remix traffic; distribution uses traffic and playback locations.

### Risk

- Google documents some `insightTrafficSourceDetail` values at the dimension level while the channel-report contract explicitly rejects several of them. Activation therefore requires a real-account capability probe, not documentation alone.
- `liveOrOnDemand` cannot be combined with `averageViewPercentage`; these must remain separate metric bundles.
- Top-N detail reports require `sort` and `maxResults <= 25`. Pagination must preserve previously stored pages if a later page fails.
- Applying every window to every physical table would multiply storage and requests unnecessarily. Window applicability must be explicit.
- `uploaderType` is a content-owner filter, not a normal channel dimension. It must never appear for ordinary channel accounts.

### Verification

- Registry and query-shape tests for every dataset, capability, window strategy, metric bundle, and incompatible combination.
- Real authenticated contract probes before a category changes from `disabled_unvalidated` to `stable`.
- Merge tests proving partial pages, empty responses, and failed windows never clear prior rows.
- Browser tests proving one switch starts one dataset process and closed tables perform no work.
- Comparison against YouTube Studio for representative channel, video, traffic, playback, and time-window totals.
- Protected Vercel preview before a separate production approval.

## Current-state audit

### Already present and reusable

| Capability | Current owner | Current state | Required follow-up |
| --- | --- | --- | --- |
| Standard windows | `VtSyncAnalyticsWindow`, analytics-canon | `7d`, `28d`, `90d`, `365d`, `lifetime` exist | Add `custom`; expose one shared picker and propagate window identity to all applicable tables |
| Channel totals | `channel_totals` | Queries all five standard windows | Keep as the window reference implementation |
| Video catalog + per-video metrics | `videos` | One table switch owns uploads, metadata, and Analytics phases | Preserve 200-video Analytics batching and non-destructive merges |
| Playback location type | `playback_location` / `locations` | Stable `insightPlaybackLocationType` query | Add windows, optional selected-video scope, and `day` breakdown |
| Creator content type | `creator_content_type` / `creator` | Stable monthly `creatorContentType` rows | Generalize to shared playback-detail query contracts and windows |
| Subscriber status | `subscription_status` / `subs` | Stable `subscribedStatus` rows | Add windows and selected-video scope |
| Traffic overview | `traffic_overview` / `traffic` | Stable `insightTrafficSourceType` query | Preserve unknown source values; add every returned source to presentation registry |
| Traffic by day | `traffic_day` | Stable day × source rows | Use as the preferred derivation source for additive traffic windows |
| Active traffic details | traffic-detail registry | Advertising, external sites, hashtags, subscriber paths, other pages, search, related videos, sound pages, channel pages | Add window identity and live capability evidence |
| Retention | `retention` / `retentions` | Selected-video workflow exists | Reuse inside Video Deep Dive; do not auto-run it |
| Daily/monthly facts | `daily_metrics`, `monthly_metrics` | Stable | Derive weekly and standard additive windows without duplicate API calls |

### Gaps confirmed by the audit

1. The table shell knows the standard windows, but it does not expose one first-class window picker across the dataset system.
2. `insightPlaybackLocationDetail` has no dataset, table, storage key, or sync unit.
3. `youtubeProduct` and `liveOrOnDemand` have no dedicated dataset/table contracts.
4. Playback-detail combinations are hard-coded into a few segment queries instead of generated from a validated report registry.
5. Several traffic source types have dormant table labels but no validated query or honest overview-only state.
6. The selected-video workflow is spread across the Videos table and Retention rather than presented as a complete deep-dive toolbox.
7. `uploaderType` is absent—which is correct for normal channels—but there is no documented content-owner implementation lane.
8. The 34-dataset Intelligence contract cannot simply be changed in place; expansion needs a versioned registry contract and compatibility period.

## Non-negotiable API boundaries

### Targeted YouTube Analytics API

Use for interactive channel, selected-video, playback, traffic, audience, and window queries.

- Channel requests use `ids=channel==MINE` or the owned channel ID.
- Playback-location detail uses `dimensions=insightPlaybackLocationDetail`, requires `insightPlaybackLocationType==EMBEDDED`, requires sorting, and caps each request at 25 rows.
- Traffic-source detail uses `dimensions=insightTrafficSourceDetail`, requires an `insightTrafficSourceType` filter, requires sorting, and caps each request at 25 rows.
- `liveOrOnDemand` and `averageViewPercentage` must be fetched in different metric bundles.
- For traffic overview with multiple videos, enforce Google's `video count x day count <= 50,000` limit by splitting video filters and/or date ranges.

### YouTube Data API v3

Use only for resource identity and enrichment:

- channel and uploads-playlist identity;
- complete video catalog;
- video metadata and public statistics in batches of at most 50 IDs;
- title/channel/playlist enrichment for Analytics identifiers.

The Data API must not be treated as a substitute for private Analytics metrics.

### YouTube Reporting API

Add only after the targeted-query expansion is stable. It is the scalable lane for bulk daily facts and the 2026 channel reach reports (`channel_reach_basic_a1`, `channel_reach_combined_a1`). Do not mix bulk-report jobs into the interactive targeted-query queue.

### Content-owner reports

`uploaderType` and `claimedStatus` belong to content-owner reporting. They require explicit partner capability and content-owner selection. Normal channel accounts receive an unavailable/capability-required state, not an empty table.

### Membrane

Membrane may be used as an operator-only contract-discovery harness when a READY YouTube Analytics connection exists. It does not replace ViewTube's canonical server-owned Google OAuth, proxy, storage, or production query engine.

## Canonical architecture

### 1. Versioned report registry

Add a canonical `VtSyncAnalyticsReportDefinition` registry that owns:

```ts
type VtSyncAnalyticsReportDefinition = {
  datasetId: string
  tableId: string
  scope: "channel" | "selected_video" | "content_owner"
  dimensions: string[]
  metricBundles: Array<{ id: string; metrics: string[] }>
  requiredFilters?: Record<string, string>
  optionalFilters?: string[]
  sort?: string
  pageSize?: number
  pagination: "none" | "start_index_until_empty"
  windows: Array<"7d" | "28d" | "90d" | "365d" | "lifetime" | "custom">
  strategy: "derive_daily" | "query_each_window" | "metadata_freshness" | "unsupported"
  capability?: "channel" | "content_owner" | "monetary"
  conflicts?: Array<{ dimension: string; metric: string }>
}
```

The category registry, sync-unit registry, table registry, progress rail, evidence manifest, exports, and query engine derive from this contract. Static tests prevent a visible table from existing without an owning dataset, query strategy, and sync unit.

### 2. Window identity, not dataset duplication

Use one canonical key:

```text
channelId + datasetId + scopeType + scopeId + windowId + dimensionsHash
```

Window rules:

- **Derive from daily facts:** daily, weekly, channel additive metrics, and traffic-by-day.
- **Query each window:** ranked/top-N traffic details, playback-location detail, demographics percentages, average-duration/percentage metrics, selected-video ranked breakdowns.
- **Metadata freshness only:** channel metadata, uploads catalog, and video metadata. These are not date-window analytics datasets.
- **Custom:** inclusive start/end dates using YouTube's Pacific-day semantics.
- **Lifetime:** channel start date through the latest complete Analytics date, not the browser's current partial day.

Never sum ratios or percentages. Recompute from additive numerators/denominators or query the window directly.

### 3. Non-destructive persistence

For every dataset/window/scope:

- commit each successful page or metric bundle incrementally;
- merge by a stable row identity that includes dimensions and scope;
- preserve fields omitted by later responses;
- preserve prior successful windows when another window fails;
- distinguish legitimate zero, unavailable, anonymized/thresholded, partial, permission-blocked, and not-applicable;
- retain request ID, query shape, API family, window, page index, source, freshness, and coverage in the manifest;
- never replace real rows with placeholders, fallback estimates, or mock data.

### 4. One switch per dataset/table/process

- One user switch owns one dataset/table process.
- A dataset may have internal metric bundles or pages, but those remain one progress unit.
- Video Deep Dive actions are scoped to the selected video and never trigger the global video catalog/analytics process.
- Unrelated dataset runs must not auto-run video metadata, video analytics, retention, or another table's process.

## Dataset workstreams

### A. Playback locations

1. Upgrade the existing Playback Locations table with shared windows, selected-video filtering, and optional daily breakdown.
2. Add **Embedded Playback Detail**:
   - dimension: `insightPlaybackLocationDetail`;
   - filter: `insightPlaybackLocationType==EMBEDDED`;
   - metrics: `engagedViews`, `views`, `estimatedMinutesWatched` in compatible bundles;
   - sort: `-views` by default, optionally `-estimatedMinutesWatched`;
   - page size: 25; request `startIndex=1,26,51...` until an empty page, repeated-page guard, or explicit terminal response;
   - preserve partial pages if YouTube fails after page one;
   - selected-video filter is optional but first-class.

### B. Playback details

Add independently selectable tables:

- Content Type (`creatorContentType`) — migrate the current query to the shared registry.
- Live vs On Demand (`liveOrOnDemand`).
- Subscriber Status (`subscribedStatus`) — migrate the current query.
- YouTube Product (`youtubeProduct`: CORE, GAMING, KIDS, MUSIC, UNKNOWN).
- Content Type × Subscriber Status.
- Content Type × YouTube Product.
- Device × YouTube Product.
- Country/Province × selected playback detail, only through validated combinations.

Maintain two metric bundles:

- `playback_live_bundle`: includes `liveOrOnDemand`, excludes `averageViewPercentage`.
- `playback_avp_bundle`: includes `averageViewPercentage`, excludes `liveOrOnDemand`.

The table UI joins compatible bundles by dimension key and labels unavailable fields; it never issues an invalid combined query.

### C. Traffic source coverage

#### Overview coverage

The overview table must accept every `insightTrafficSourceType` value returned by Google, including unknown future values. Add labels for currently missing/dormant types such as `ANNOTATION`, `END_SCREEN`, `LIVE_REDIRECT`, `NO_LINK_EMBEDDED`, `NO_LINK_OTHER`, `NOTIFICATION`, `PLAYLIST`, `PRODUCT_PAGE`, `PROMOTED`, `SHORTS`, `VIDEO_REMIXES`, `WATCH_WITH`, and current playlist-page variants.

These are overview rows. They do not automatically imply a detail report.

#### Detail coverage

Keep active detail queries registry-driven. Before enabling a source, run both channel-scope and selected-video contract probes. The channel-report documentation explicitly lists `VIDEO_REMIXES`, `NOTIFICATION`, `END_SCREEN`, `CAMPAIGN_CARD`, and `NO_LINK_EMBEDDED` among unsupported detail filters even though the dimensions reference describes some detail values.

Classification:

- **Stable channel detail:** keep the nine currently working source families.
- **Probe selected-video detail:** `WATCH_WITH` and any source where dimension docs and report docs disagree.
- **Overview-only:** Notifications, End Screens, Video Remixes, Shorts, no-link sources, and any rejected source. Give these honest overview/window tables instead of issuing invalid detail queries.
- **Content-owner-only:** Campaign Cards and future CMS-only sources.

For supported details, retain 25-row pages and `startIndex` pagination. A later-page 5xx marks the run partial and keeps earlier pages.

### D. Video Deep Dive toolbox

Add a lazy, closed-by-default toolbox attached to a selected canonical video ID. Its independent tables are:

1. Summary by `7d`, `28d`, `90d`, `365d`, `lifetime`, custom.
2. Daily/monthly timeline.
3. Playback Details.
4. Playback Locations.
5. Embedded Playback Detail.
6. Traffic Overview.
7. Supported Traffic Details.
8. Device × OS × YouTube Product.
9. Geography.
10. Audience Retention (reuse the current retention dataset and controller).

Every query is filtered by the selected video. Changing the selected video cancels the old controller and prevents cross-video writes. The previous successful deep dive remains visible when a refresh fails.

### E. Content-owner uploader type

Implement only after partner capability validation:

- filters: supported combinations of `uploaderType` and `claimedStatus`;
- content-owner ID required;
- separate storage namespace and manifests;
- no silent fallback to channel scope;
- hidden or capability-required for ordinary channel users;
- Campaign Card and other CMS reports activate only in this lane.

### F. Reporting API and reach

After targeted-query parity:

- register and ingest bulk channel report jobs separately;
- add `channel_reach_basic_a1` and `channel_reach_combined_a1` for thumbnail impressions and CTR;
- reconcile bulk daily facts with targeted windows using provenance and report completion dates;
- expose reach evidence to Packaging and Intelligence Hub without replacing targeted-query data silently.

## Implementation phases

### Phase 0 — contract freeze and probes

- Add the versioned report registry and matrix-backed audit test.
- Record real-account capability probe results without storing tokens or raw credentials.
- Add compatibility mapping from the existing 34 visible datasets.
- Exit gate: every current table maps exactly once and no currently stable dataset changes behavior.

### Phase 1 — shared window system

- Add `custom` to the window contract.
- Add a shared window picker to the VT-SYNC table shell and deep links.
- Implement window-aware persistence keys, freshness, progress, exports, and Intelligence evidence.
- Exit gate: `7/28/90/365/lifetime/custom` works on reference tables without duplicate React/data work.

### Phase 2 — playback locations and details

- Add Embedded Playback Detail.
- Add Live vs On Demand and YouTube Product.
- Migrate existing Content Type and Subscriber Status to the report registry.
- Add compatible cross-tabs and metric-bundle guards.
- Exit gate: all playback tables reconcile with Studio for at least two windows and one selected video.

### Phase 3 — traffic parity

- Accept every overview source returned by Google.
- Activate only capability-proven detail sources.
- Add overview-only window tables for Notification, End Screen, Remix, Shorts, and no-link traffic.
- Preserve 25-row pages across partial pagination.
- Exit gate: unsupported details issue zero invalid requests and display a documented availability reason.

### Phase 4 — Video Deep Dive

- Add the lazy toolbox and independent selected-video controllers.
- Reuse canonical video identity, table definitions, retention, and enrichment services.
- Exit gate: opening one deep-dive tab only loads/runs that dataset; changing video cancels cleanly.

### Phase 5 — content-owner lane

- Add `uploaderType` + `claimedStatus` contracts and CMS-only datasets.
- Exit gate: ordinary channels cannot execute or store content-owner queries.

### Phase 6 — bulk Reporting API and reach

- Add report-job lifecycle, daily fact ingestion, reach reports, and reconciliation.
- Exit gate: bulk data and targeted-query data have explicit provenance and do not overwrite one another silently.

## Test and acceptance plan

### Contract tests

- Every visible dataset has one table, one sync unit, one report definition, one storage key strategy, and one availability state.
- Every dimension/metric/filter combination is allowlisted.
- Invalid `liveOrOnDemand + averageViewPercentage` requests cannot be constructed.
- Detail reports always include sort and page size <= 25.
- Content-owner filters cannot run in channel scope.

### Persistence tests

- Failed pages/windows do not clear prior rows.
- Legitimate zero replaces an older nonzero value; omitted values do not.
- Page and window identities prevent duplicate or cross-window rows.
- Channel/video/snapshot changes cancel writes.
- Imports remain first-class and retain provenance.

### Performance tests

- Closed tables and Video Deep Dive modules do not mount, fetch, subscribe, or animate.
- One dataset switch starts one controller.
- Window changes reuse daily facts where allowed and do not refetch metadata.
- Progress rendering remains coalesced and does not rerender the complete analytics table.

### Real-data acceptance

- Validate at least one long video, one Short, and one live/on-demand case where available.
- Compare `7d`, `28d`, `90d`, `365d`, lifetime, and one custom window with YouTube Studio.
- Validate embedded playback and at least three supported traffic-detail sources.
- Record anonymized/thresholded or absent results as unavailable, not zero.
- Run authenticated local validation, protected preview validation, then request production approval separately.

## Rollback points

- Every new dataset starts `disabled_unvalidated` behind registry capability state.
- The shared window picker can ship first with only current reference tables enabled.
- Video Deep Dive is lazy and additive; removing its gate leaves existing tables unchanged.
- Content-owner and Reporting API lanes are independently feature-gated.
- No phase deletes existing snapshots, imports, tables, or compatibility adapters.

## Official references

- [YouTube Analytics API channel reports](https://developers.google.com/youtube/analytics/channel_reports)
- [YouTube Analytics dimensions](https://developers.google.com/youtube/analytics/dimensions)
- [Reports.query reference](https://developers.google.com/youtube/analytics/reference/reports/query)
- [YouTube Analytics sample requests](https://developers.google.com/youtube/analytics/sample-requests)
- [YouTube Reporting API channel reports](https://developers.google.com/youtube/reporting/v1/reports/channel_reports)
- [YouTube Reporting API available reports](https://developers.google.com/youtube/reporting/v1/reports/full_report_list)
- [YouTube Analytics revision history](https://developers.google.com/youtube/analytics/revision_history)
- [YouTube Data API v3 reference](https://developers.google.com/youtube/v3/docs)
