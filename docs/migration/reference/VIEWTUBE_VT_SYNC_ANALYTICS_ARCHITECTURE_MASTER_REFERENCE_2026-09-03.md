# ViewTube VT-SYNC + YouTube Analytics
## Data Architecture Master Resource & Reference

**Date:** 2026-09-03  
**Scope:** VT-SYNC, analytics datasets, data tables, sync controllers, metrics, dimensions, windows, queries, pagination, storage, CSV, visuals, insights, missing/planned datasets, and Deep Dive architecture.

**Important:** This document is independent of PR #77 merge mechanics. Current-state sections reflect the active ViewTube codebase and the VT-SYNC implementation visible in the consolidation branch. Planned/recommended sections are explicitly labeled.

---

## 1. What VT-SYNC Is

VT-SYNC is ViewTube's canonical YouTube data acquisition and persistence layer.

Its responsibility is to turn multiple sources into stable, provenance-aware datasets that every analytics table, visual, Brain feature and intelligence system can trust.

```text
YouTube Data API
YouTube Analytics API
YouTube Reporting / partner exports
YouTube Studio CSV
ViewTube CSV
manual import sources
        |
        v
query / import adapters
        |
        v
raw records
        |
        v
canonical normalized dataset rows
        |
        v
IndexedDB / packed storage / snapshot projections
        |
        v
analytics-canon
        |
        +--> Data Tables
        +--> Data Visuals
        +--> deterministic Insights
        +--> Brain Evidence
        +--> Anomaly Intelligence
        +--> Algorithm Momentum
```

VT-SYNC should not own Brain memory, project intent, creator preferences, Channel Profile durable learnings, or UI-local display state.

## 2. Data Sources and Provenance

Every value should be traceable to a source.

Recommended source vocabulary:

```text
youtube_data_v3
youtube_analytics_v2
youtube_reporting
youtube_studio_csv
viewtube_csv
manual_import
derived
simulated
```

Each canonical field or row should retain source, dataset ID, captured/synced time, date range, channel ID, video ID where relevant, provenance/version and availability status.

### Provenance precedence

For the same fact:

1. direct canonical API source;
2. trusted Studio/Reporting import;
3. ViewTube canonical export/import;
4. derived calculation;
5. simulated data never merges into production truth.

## 3. Current Time-Window Model

Current VT-SYNC analytics windows include `7d`, `28d`, `90d`, `365d`, and `lifetime`. A snapshot may carry `selectedTimeWindow`.

### Recommended distinction

Stored grain and selected UI window are separate concepts.

For day-grained datasets, store lifetime daily history where practical and derive 7/28/90/365/custom filters locally. For aggregate window datasets, one row per aggregate window is valid.

### Planned window modes

- custom start/end;
- previous-period comparison;
- previous-year comparison;
- upload-relative age;
- first 24h;
- first 48h;
- first 72h;
- first 7 days;
- first 28 days.

## 4. Dates, Time Zones and Date Filters

Canonical daily dates should use a stable date key such as `YYYY-MM-DD`. UI date filters should not mutate stored facts.

Recommended shared context:

```ts
type AnalyticsViewContext = {
  datasetIds: string[]
  metricKeys: string[]
  dimensions: string[]
  window: "7d" | "28d" | "90d" | "365d" | "lifetime" | "custom"
  startDate?: string
  endDate?: string
  comparison?: "none" | "previous_period" | "previous_year"
  filters: Record<string, string[]>
  sort?: { key: string; direction: "asc" | "desc" }
  limit?: number
  aggregation?: "total" | "average" | "weighted"
  provenance?: "all" | "api" | "csv"
}
```

Data Tables, Data Visuals, top-right controllers, deterministic insight calculations and Brain evidence requests should consume the same context.

## 5. Query Construction

The YouTube Analytics query path can use `ids`, `startDate`, `endDate`, `metrics`, `dimensions`, `sort`, `maxResults`, `filters`, and `startIndex`.

Canonical process:

```text
sync unit / dataset registry
 -> choose dataset
 -> choose time grain/range
 -> choose dimensions
 -> choose compatible metric bundle
 -> add required sort metric
 -> add filters
 -> execute Analytics v2
 -> map column headers + row arrays
 -> normalize field names
 -> preserve raw report
 -> compile canonical rows
 -> persist
 -> update freshness/provenance
```

If a query sorts by a metric such as `-views`, that metric must also be selected to avoid Analytics API errors.

## 6. Metric x Dimension Compatibility

YouTube Analytics does not support every metric with every dimension. ViewTube should use an explicit compatibility registry instead of repeatedly learning incompatibility from failed requests.

Recommended definition:

```ts
type QueryDefinition = {
  datasetId: string
  dimensions: string[]
  metricBundles: string[][]
  filters?: string[]
  timeGrain: "aggregate" | "day" | "month" | "retention"
  pagination: "none" | "rows" | "date_windows" | "video_batches"
  quotaClass?: string
  requiresContentOwner?: boolean
  availability?: string[]
  fallbackPolicy?: string
}
```

Special/blocked metric families include revenue/CPM, playback CPM, monetized playbacks, ad impressions, Premium/Red, cards and annotation families.

## 7. Pagination: Four Separate Concepts

### A. Data API page-token pagination

Video inventory uses `maxResults=50`, `pageToken`, and `nextPageToken`. Initial catalog acquisition may traverse the uploads playlist. Incremental catalog sync can stop after enough overlap with known videos.

### B. Analytics row pagination

Analytics reports use `startIndex` and `maxResults`. The engine can request fixed-size pages, advance the start index, stop on a short page, detect repeated pages and preserve partial results if a later page fails.

### C. Date-window pagination

Large time ranges can be broken into bounded date windows. Current code includes an analytics window size around 500 days for bounded requests.

### D. Video batching

Per-video analytics can be queried in video ID batches; current batch size is around 200 videos.

### Rule

Never merge row pages, date windows or video batches without a dataset-specific deterministic key.

## 8. Raw Data

Raw data is the direct API/import representation: Analytics API columns and rows, Data API responses, Studio CSV rows, Reporting exports. Preserve it for audit, debugging, future re-normalization, provenance and repair. UI components should not repeatedly decode raw API arrays during render.

## 9. Compiled / Canonical Data

Canonical rows use stable ViewTube field names and stable grain, such as `date`, `videoId`, `views`, `watchTimeMinutes`, `averageViewDuration`, `averageViewPercentage`, `trafficSource`, `trafficDetail`, `country`, `deviceType`, and `subscribedStatus`.

Canonical data powers Data Tables, visual data bridges, analytics-canon, anomaly detection, deterministic insights and Brain evidence.

A dataset is defined by grain, not merely by metric names.

Examples:

```text
daily = day
traffic_day = day x traffic source
video_daily = video x day
country = country
video_country = video x country
```

## 10. Formatted / Presentation Data

Formatting belongs after canonical calculation. Examples: compact numbers, duration strings, percentages, localized dates, title/thumbnail display. Formatted values should never overwrite canonical raw numbers. Exports should distinguish raw/canonical from presentation/formatted exports.

## 11. Simulated Metrics and Demo Data

Simulated data is valid for UI prototypes, component labs, promo visuals and empty-state demos. It must be explicitly marked `simulated`, `demo`, or `placeholder`. Production analytics should reject simulated values unless the UI is explicitly in demo mode. Never silently fill a missing metric with mock data.

## 12. Local Analytics Database

Current database: `ViewTubeVtSyncLocalDB`, version `3`.

Current store families include:

- `channel_index`
- `channel_dimensions`
- `video_inventory`
- `video_dimensions`
- `sync_runs`
- `sync_cursors`
- `dataset_raw_reports`
- `dataset_table_rows`
- `dataset_manifests`
- `dataset_chunks`
- `raw_report_blobs`

Indexes/dimensions own stable identity and metadata; sync runs/cursors own acquisition state; raw reports preserve source truth; table rows preserve product-ready canonical facts; manifests/chunks store large packed datasets; blobs preserve raw source efficiently.

## 13. Packed Dataset Architecture

Large datasets can be stored as manifest, schema, chunks, generation ID, logical size, encoded size and compression diagnostics.

Use a lightweight snapshot for fast boot/common projections while large full datasets live in packed persistent storage. Do not let one in-memory snapshot become a duplicate database of every historical row.

## 14. Current Dataset / Data Table Families

### Videos
- Video Metadata & Metrics

### Time
- Daily Stats
- Weekly Stats
- Monthly Stats
- Traffic x Day

### Channel
- Channel Totals
- Subscriber Status

### Traffic Sources
- Traffic Overview
- Traffic Details
- Search Terms
- External Websites
- Suggested Videos
- Hashtags
- Sound Pages
- Channel Pages
- Shorts Feed
- Browse Features
- Shorts Content Links
- Campaign Cards
- Info Cards
- End Screens
- Live Redirects
- Notifications
- Embedded Players
- Direct / Unknown
- Playlist Traffic
- YouTube Playlist Pages
- Other Features
- Advertising
- Subscriber Detail
- Playback Locations
- source-specific traffic detail datasets

### Demographics
- Age x Gender
- Age
- Gender
- Audience Behavior
- New vs Returning

### Geography
- Countries
- Cities
- US States
- DMA
- Continents / sub-regions

### Devices
- Device Types
- Operating Systems
- Device x OS

### Content
- Content Type
- Format x Subscribers
- Retention
- Sharing Services

### Playlists
- Playlist Statistics

### Revenue
- Revenue Overview
- Ad Types

## 15. Data Table Registry Responsibilities

Each table definition can declare table ID, category, title/description, canonical dataset ID, snapshot keys, sync unit, columns, default sort, pinned/collapsed groups, export file name, layout density, presentation mode, export mode, scroll behavior and summary behavior.

The table registry should remain the single structural owner of analytics table definitions.

## 16. Core Video Dimensions

Examples include thumbnail, title, video ID/URL, upload date/day/time, description preview, tags/topics, category, title length, format, duration, privacy, definition and captions.

## 17. Core Metrics

Examples include views, engaged views, engagement rate, watch time, average percentage viewed, average view duration, comments, shares, likes/dislikes, playlist adds/removes, subscribers gained/lost/net, estimated revenue, RPM, CPM, playback CPM, monetized playbacks, ad impressions, Premium metrics, cards, card clicks/rates, teasers and teaser clicks/rates.

Derived per-100-view metrics can include subscribers, likes, comments, shares, saves and revenue per 100 views.

## 18. Important Dimensions

Examples include day, month, aggregate window, video, traffic source/detail, country, city, state/province, DMA, age group, gender, device type, operating system, content type, subscribed status, sharing service, playback location, playlist, ad type and retention position.

## 19. Sync Unit Registry

The unified VT-SYNC controller is driven by a sync-unit registry rather than hardcoded buttons. User-facing groups include Channel, Time, Traffic, Audience, Geography and Revenue. A sync unit can own label, description, group/category, dependencies, default selection, data outcome, freshness/status, progress and special selectors such as retention video or content owner.

Any other sync-control UI should project the same registry.

## 20. Sync Controller States

Useful states include idle, queued, syncing, partial, available, stale, failed, unsupported, blocked by scope, blocked by quota, requires content owner, and needs video selection. Do not collapse these into generic "no data."

## 21. CSV Taxonomy

Current CSV taxonomy classifies uploads into Video Data, Daily Metrics, Search Intelligence, Traffic, Geography, Audience, Surfaces & Discovery, Revenue & Monetization and Unknown.

A taxonomy record can define detected category, major family, merge target, merge-key strategy, upload hint, default tag, subtable, capability sources and freshness class.

## 22. YouTube CSV vs ViewTube CSV

### YouTube CSV

Typically contains Studio/export column names, possible localization, Studio-only metrics/dimensions, narrow/single-video context and YouTube provenance.

### ViewTube CSV

Should use canonical ViewTube field names and carry schema version, dataset ID, grain, export time, provenance and merge-key metadata.

Detection should use schema/headers rather than filename alone.

## 23. CSV Recognition Pipeline

```text
file
 -> parse headers
 -> normalize aliases
 -> detect source
 -> detect family
 -> detect grain
 -> choose merge target
 -> choose stable identity key
 -> validate required fields
 -> preview conflicts/new fields
 -> additive merge
 -> persist manual import
 -> update freshness/provenance
 -> rebuild canonical projection
```

## 24. Additive CSV Merge

A short manual import must never replace a larger API dataset. Recommended stable keys include video ID, date, month, window, traffic source/detail, age+gender, format+subscriber status, geographic identity, device+OS, video+retention position and source+detail+scope.

Conflicting fields should consider source authority, captured time, null vs populated and whether a field is API-only or CSV-only.

## 25. CSV-Only / CSV-Important Data

Important families include new vs returning viewers, regular viewer behavior, stayed-to-watch/swiped-away, single-video retention details, some thumbnail/impression combinations, end-screen/card Studio exports, language/translation/post-related exports and other Studio-only combinations.

These belong in canonical analytics with provenance, not in a disconnected Performance Hub.

## 26. Analytics Storage Index

Recommended index responsibilities:

- Channel index: channel identity, metadata, active snapshot pointer.
- Video inventory index: video ID, publication metadata, current catalog state.
- Dataset manifest index: dataset ID, grain, source, row/chunk count, generation, captured range, freshness, availability.
- Sync cursor index: next page token/start index/date window/overlap/retry metadata.
- Raw report index: request signature, columns, rows/blob and captured time.

## 27. Data Visuals Registry

Current visual metadata concepts include source table IDs, active metric keys, dimension keys, controller explanation/spec, controls, canvas fit, footer insight and legend/axis metadata.

Recommended explicit definition:

```ts
type VisualDefinition = {
  visualId: string
  requiredDatasets: string[]
  optionalDatasets: string[]
  metrics: string[]
  dimensions: string[]
  supportedWindows: string[]
  supportedFilters: string[]
  minimumRows?: number
  missingDataBehavior: string
  insightCapabilities: string[]
}
```

## 28. Dataset -> Visual Connection Examples

Traffic data can feed traffic river/area charts, source rankings, discovery flows, external networks and search networks. Audience data can feed audience matrices, demographic distributions, subscriber mix and format overlap. Revenue data can feed revenue trajectories, RPM/CPM scatter, geo CPM and video revenue ranking. Retention data can feed braids, cliff detectors, first-30-second survival and relative retention comparisons.

## 29. Top-Right Controller: Current Concept

Current visual metadata supports chart-specific controls such as window, aggregation, count, format, ranking, metric and word limit.

## 30. Top-Right Controller Master Plan

### Phase 1 - visual/display controls
- metric
- ranking
- Top N
- format
- aggregation
- visual-specific mode

### Phase 2 - time
- 7d
- 28d
- 90d
- 365d
- lifetime
- custom date
- previous period/year
- upload-relative age

### Phase 3 - dimensions/filters
- channel/video
- traffic source
- geography
- demographics
- device
- subscriber status
- content type
- source detail

### Phase 4 - provenance/data layer
- API only
- CSV only
- combined
- canonical
- raw
- formatted

### Phase 5 - intelligence actions
- Explain this visual
- Detect anomalies
- Compare cohorts
- Find the driver
- Ask Brain
- Send to Algorithm Momentum
- Create content opportunity

The controller changes `AnalyticsViewContext`; it does not create a second dataset store.

## 31. Deterministic Data Insights

A data insight is calculated from canonical rows in code. Example: "Browse Features produced 42.1% of views in the selected 28-day period." Each deterministic insight should expose formula, source dataset, window, filters and evidence ref.

## 32. Visual Insights

A visual insight describes a pattern encoded by the current projection, such as Browse accelerating while Search stays flat. It should be calculated from the same chart data and should not invent causality.

## 33. Intelligence Insights

Brain/Anomaly/Strategy can add hypotheses, evidence refs, confidence, competing explanations, suggested actions and later outcome evaluation.

## 34. Planned Video Deep Dive Dataset

A single-video analytics system should be keyed by `videoId`.

Core families:

- metadata
- lifetime totals
- lifetime daily history
- first 24h/48h/72h
- first 7d/28d
- retention curve
- traffic overview/detail
- search terms
- external URLs
- suggested videos
- subscriber status
- geography
- demographics where privacy/API permits
- devices/OS
- playback locations
- cards/end screens
- revenue/ad types
- CSV-only Studio metrics

Recommended Deep Dive table sections: identity/publication, totals, launch trajectory, retention, traffic, audience, geography, technology, revenue, conversion/session actions, CSV-only enrichment, provenance/availability.

## 35. Planned Deep Dive Visuals

- first 72h actual vs cohort
- retention + relative retention
- traffic source evolution
- search-term emergence
- external source network
- suggested-video adjacency
- subscriber mix shift
- geography map
- device mix
- revenue timeline
- end-screen/session continuation
- anomaly timeline

All should consume the same `AnalyticsViewContext` and canonical datasets as tables.

## 36. Missing Data States

Use typed states: not synced, sync queued, sync failed, API unsupported, metric/dimension incompatible, privacy suppressed, quota blocked, scope blocked, content-owner required, CSV only, planned, deprecated, simulated, stale and partial. Tables, visuals and Brain evidence should expose these honestly.

## 37. Planned Dataset Combinations

Priority combinations include video x day, video x traffic source, video x search term, video x external URL, video x suggested video, video x subscriber status, video x country, video x device, format x subscriber status, traffic source x day, geography x day, revenue x geography, ad type x day, playback location x day, content type x day, retention position x video and upload age x metric.

Every combination must be verified against YouTube API compatibility before being marked syncable.

## 38. Planned Dataset Registry Fields

```ts
type DatasetDefinition = {
  id: string
  label: string
  family: string
  grain: string[]
  dimensions: string[]
  metrics: string[]
  sourcePriority: string[]
  syncable: boolean
  csvImportable: boolean
  supportedWindows: string[]
  paginationMode: string
  privacyClass?: string
  availabilityReasons: string[]
  tableIds: string[]
  visualIds: string[]
}
```

## 39. Unused / Legacy Analytics Code

The repository contains quarantined historical Performance Hub generations, old analytics contracts/selectors, old table registries, old core lifetime sync implementations, copied chart engines/GraphsPageCharts/ResearchLab/Intelligence chart modules, old Toolbox UI and scratch repair scripts.

`_quarantine/` is not production code. Before deletion: inventory unique behavior, identify canonical replacement, port missing behavior, add parity test, document replacement, retire.

## 40. Analytics Code Folder Plan

Recommended target:

```text
src/
  features/
    vt-sync-local/
      adapters/
      upstream/
      shell/
  services/
    analytics-canon/
    analytics/
      queries/
      compatibility/
      insights/
      exports/
      imports/
  components/
    DataVisuals/
  views/
    analytics/
      tables/
      deep-dive/
      data-explorer/
```

Avoid recreating analytics ownership inside dashboard widgets, Brain components, Editor, User Guide or isolated toolboxes.

## 41. Query Optimization

- query only metric bundles required by selected sync units;
- cache freshness by dataset;
- incremental video inventory;
- batch video IDs;
- paginate only where necessary;
- split date windows only where required;
- dedupe deterministically;
- remember unsupported combinations;
- avoid repeated failed metric/dimension requests;
- prioritize high-value sync units.

## 42. Storage Optimization

- preserve raw source;
- normalize once;
- pack large canonical rows;
- keep snapshot projections lightweight;
- avoid repeated video metadata in every fact row;
- use generation manifests;
- garbage-collect superseded generations only after integrity checks;
- index by channel/dataset/video/date/generation where appropriate.

## 43. Table Optimization

- virtualize large tables;
- paginate presentation without truncating stored data;
- memoize projections;
- use stable row keys;
- precompute expensive joins;
- expose provenance without repeating full metadata in every cell;
- share filters with visual context.

## 44. Visual Optimization

- lazy mount off-screen visuals;
- keep large SVG/canvas computations outside React render;
- memoize by snapshot/dataset/context key;
- use registry-defined controllers;
- reuse real visual components rather than duplicated demos;
- require truthful no-data/partial/simulated states.

## 45. Intelligence Optimization

- deterministic math before LLM reasoning;
- anomaly detection over canonical rows;
- compact evidence packets;
- persist derived anomaly events;
- avoid rescanning all history on every Brain request;
- Channel Profile receives validated durable learning, not raw observations;
- keep hypothesis separate from fact.

## 46. Data Quality Checks

Every dataset should answer: What is the grain? Source? Date range? Complete? Fresh? Missing metrics? Privacy suppression? Pagination? Partial success? CSV merge? Simulated values? Stable row key?

## 47. Recommended Dataset Health Object

```ts
type DatasetHealth = {
  datasetId: string
  status:
    | "available"
    | "partial"
    | "stale"
    | "failed"
    | "unsupported"
    | "csv_only"
    | "planned"
  rowCount: number
  startDate?: string
  endDate?: string
  updatedAt?: string
  sources: string[]
  missingMetrics: string[]
  warnings: string[]
  pagination?: {
    mode: string
    pages?: number
    partial?: boolean
  }
}
```

## 48. End-State Architecture

```text
SOURCE
  YouTube Data API
  YouTube Analytics API
  Reporting / Studio CSV / ViewTube CSV
        |
        v
ACQUISITION
  VT-SYNC query/import adapters
        |
        v
PERSISTENCE
  raw reports
  dimensions/indexes
  canonical table rows
  packed datasets
        |
        v
CANONICAL ACCESS
  analytics-canon
        |
        +--> tables
        +--> visuals
        +--> deterministic insights
        +--> exports
        +--> Brain evidence
        +--> anomaly detection
        |
        v
INTELLIGENCE
  Anomaly
  Algorithm Momentum
  Brain
        |
        v
ACTION / LEARNING
  tools
  Outcome Ledger
  Learning Ledger
  Channel Profile
```

## 49. Priority Next Steps

1. Complete one canonical dataset registry with grain, dimensions, metrics and query compatibility.
2. Make every Data Table reference that registry.
3. Make every Data Visual explicitly reference required datasets.
4. Unify all sync controllers onto the sync-unit registry.
5. Complete additive CSV recognition/merge with field-level provenance.
6. Add custom date filtering through shared `AnalyticsViewContext`.
7. Add planned video Deep Dive as a projection over existing datasets.
8. Build deterministic data/visual insight utilities.
9. Add truthful missing/partial state throughout UI.
10. Continue Anomaly Intelligence on canonical data.
11. Retire legacy analytics consumers after parity tests.
12. Keep simulated data isolated from production analytics.

## 50. Core Principles

- One raw analytics owner: VT-SYNC.
- One public analytics boundary: analytics-canon.
- One table definition source: table registry.
- One sync capability source: sync-unit/query registry.
- One shared analytics view/filter context.
- Grain is part of dataset identity.
- Provenance is never optional.
- CSV enriches; it does not blindly replace.
- Raw, canonical, formatted and simulated data remain distinct.
- Deterministic facts are calculated in code before AI reasoning.
- Missing data is a typed state, not a blank chart.
- Deep Dive reuses the same architecture rather than creating a second analytics stack.
