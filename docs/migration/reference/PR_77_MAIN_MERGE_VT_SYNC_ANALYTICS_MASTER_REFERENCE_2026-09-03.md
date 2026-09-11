# PR #77 → Main Merge, Feature Combination & VT-SYNC / Analytics Master Reference

**Date:** 2026-09-03  
**Repository:** `themotionvisual/ViewTubeBUILD`  
**Source:** PR #77 — `refactor/viewtubex-clean-consolidation`  
**Target:** `main`  
**Role of this document:** merge runbook + feature-combination guide + VT-SYNC/analytics architecture reference.

> This document distinguishes **current code in PR #77**, **legacy/quarantined code**, and **planned/recommended architecture**. Planned items are not described as production-complete.

---

# PART I — PR #77 → MAIN

## 1. Why #77 is not a normal merge

PR #77 is a broad ViewTubeX consolidation branch. It includes or touches:

- VT-SYNC local adapters, sync engine, registries and controller
- analytics-canon
- Analytics / Data Visuals
- Intelligence Hub / Brain integration
- account/auth and YouTube transports
- dashboard/widget systems
- User Guide registries
- Comment Responder / creator engagement
- Shorts Generator
- editor bridge work
- feature gating
- YouTube API expert skill/reference
- quarantine of legacy Performance Hub / chart / toolbox code
- package/build configuration

Because these systems cross canonical ownership boundaries, the goal is not merely “make Git conflict resolution pass.” The goal is to combine #77 with main while preserving the **best current owner for each behavior**.

## 2. Merge principle

Use this priority order for conflicts:

1. **Current main behavior that has been verified after #77 branched**
2. **Canonical contracts/owners**
3. **#77 feature additions that extend those owners**
4. **Compatibility adapters**
5. **Quarantined/historical code only as reference**

Never restore an older whole file just to recover one feature.

## 3. Canonical ownership during the merge

| Concern | Canonical owner after merge |
|---|---|
| login/session/account | current server-owned account/auth contracts |
| YouTube request transport | canonical Google/YouTube transport layer |
| raw analytics facts | VT-SYNC |
| analytics public interface | analytics-canon |
| video identity | canonical video asset/catalog layer |
| durable channel intelligence | Channel Profile |
| AI orchestration | Brain |
| tool registry | Super Tool / Tool Capability registry |
| data table definitions | VT-SYNC table registry |
| sync controls | VT-SYNC sync-unit/category registries |
| local analytics persistence | VT-SYNC IndexedDB repository |
| CSV classification | CSV taxonomy + canonical import adapters |
| visual definitions | visual module registry |
| documentation | User Guide/system registries |

## 4. Before merging #77

Create recovery anchors for:

- current `main`
- #77 head
- auth/session known-good state
- current VT-SYNC/analytics known-good state

Record:

- main SHA
- #77 SHA
- current production deployment SHA
- known failing tests on main
- known failing tests on #77

Do not judge #77 solely by “all tests green” if main already contains unrelated known failures. Use **failure delta**.

## 5. High-risk overlap review

Manually inspect conflicts/changes in these families:

### Auth/account

- `api/auth*`
- `server/account-auth.mjs`
- `server/billing-server.mjs`
- account coordinator/contracts
- UnifiedAccountContext
- Google/YouTube transports

**Rule:** analytics/cache state can never grant authentication.

### VT-SYNC

- `src/features/vt-sync-local/**`
- sync registries
- localSyncEngine
- IndexedDB repository
- snapshot normalization
- manual imports
- packed datasets
- Data Visuals toolbox

**Rule:** do not reintroduce Performance Hub as a competing analytics authority.

### analytics-canon

- contracts
- evidence builders
- channel report evidence
- public exports

**Rule:** consumers should converge here instead of importing VT-SYNC internals ad hoc.

### Brain/Intelligence

Preserve evidence/provenance boundaries. Brain should consume canonical evidence, not own analytics.

### Dashboard/User Guide

Keep UI/guide improvements, but ensure they do not introduce separate data registries that contradict VT-SYNC.

## 6. Recommended merge process

### Phase A — branch integration

Create a dedicated integration branch from the latest main:

`integration/pr77-to-main-2026-09-03`

Merge/reapply #77 there first.

### Phase B — resolve by subsystem

Resolve in this order:

1. package/build/tooling
2. auth/account/YouTube transport
3. VT-SYNC contracts + storage
4. VT-SYNC query engine
5. table/sync registries
6. CSV/import systems
7. analytics-canon
8. Brain/Intelligence
9. data tables
10. visuals
11. dashboard/tool surfaces
12. User Guide
13. quarantine/governance

This order prevents UI conflict decisions from dictating data architecture.

### Phase C — gates

Run:

- auth/server tests
- YouTube transport tests
- VT-SYNC adapter tests
- lifetime/inventory tests
- manual import tests
- packed dataset tests
- table registry tests
- Data Visuals tests
- analytics-canon tests
- Brain integration tests
- dashboard registry/widget tests
- User Guide registry tests
- typecheck
- build
- full test suite

### Phase D — real-data smoke test

Using a real connected test channel:

1. login
2. reload
3. sync channel metadata
4. sync video catalog
5. sync daily lifetime analytics
6. sync traffic overview
7. sync one traffic detail family
8. sync demographics/geography
9. sync revenue if available
10. close/reopen browser
11. verify IndexedDB recovery
12. upload one known CSV
13. verify additive merge
14. open Data Tables
15. open Data Visuals
16. verify Brain evidence reads same canonical values

### Phase E — merge

Prefer a merge strategy that preserves the #77 consolidation PR review history while producing a clearly identifiable integration point. Tag the post-merge main before starting #78.

---

# PART II — VT-SYNC CANONICAL DATA MODEL

## 7. What VT-SYNC is

VT-SYNC should be treated as the canonical acquisition/persistence layer for YouTube facts.

Its job is:

```text
YouTube Data API
YouTube Analytics API
YouTube Reporting/API-derived sources
Manual CSV imports
        ↓
query / import adapters
        ↓
raw records + normalized table rows
        ↓
snapshot projections
        ↓
analytics-canon
        ↓
tables / visuals / Brain / intelligence
```

It should not become a second Brain, project system, or UI-specific cache.

## 8. Analytics windows

The current VT-SYNC contract defines:

- 7d
- 28d
- 90d
- 365d
- lifetime

A snapshot can carry `selectedTimeWindow`.

### Important distinction

A **stored lifetime daily series** and a **UI date/window filter** are not the same thing.

Preferred architecture:

- sync day-grained datasets at lifetime grain where practical;
- derive 7/28/90/365/custom views locally;
- do not resync five copies of the same daily fact unless API constraints require it.

Channel-total window rows may legitimately store multiple aggregate windows.

## 9. Query construction

The local Analytics query helper builds requests with:

- `ids`
- `startDate`
- `endDate`
- `metrics`
- optional `dimensions`
- optional `sort`
- optional `maxResults`
- optional `filters`
- optional `startIndex`

The helper also ensures a sort metric is selected in metrics/dimensions, preventing Analytics API 400s when a metric bundle sorts by `-views` without selecting `views`.

### Query process

```text
registry/sync unit
 → determine dataset
 → determine date range
 → choose dimension combination
 → choose compatible metric bundle
 → add required sort metric
 → request Analytics v2
 → fallback only where permitted
 → map columnHeaders + row arrays into objects
 → normalize field names
 → persist raw report
 → persist canonical table rows
 → update snapshot/freshness
```

## 10. Metric bundles and compatibility

Do not assume every metric can be queried with every dimension.

The code already separates required metric descriptors/bundles and has a blocked-metric fallback set for metrics such as:

- revenue/CPM families
- ad impressions
- Premium/Red metrics
- cards
- annotations

**Optimization plan:** make metric × dimension compatibility explicit in a query registry rather than learning incompatibility only from API errors.

Each query definition should declare:

```ts
{
  datasetId,
  dimensions,
  metricBundles,
  filters,
  timeGrain,
  pagination,
  quotaClass,
  availability,
  fallbackPolicy
}
```

---

# PART III — PAGINATION, DATE WINDOWS & INVENTORY

## 11. YouTube Data API pagination

Uploads inventory uses the uploads playlist with:

- `maxResults=50`
- `pageToken`
- `nextPageToken`

Initial inventory can traverse the full playlist.

Incremental inventory stops after sufficient overlap with already-known videos, using known-page/new-item logic.

This is preferable to blindly re-reading the entire catalog every sync.

## 12. Analytics API pagination

Analytics reports use:

- `startIndex`
- `maxResults`

The code contains a paginated helper that:

- requests fixed-size pages;
- increments start index;
- stops on a short page;
- detects repeated pages;
- records page diagnostics;
- can return partial data when a later page fails.

Current constants include:

- traffic detail page size: 25
- paginated report max pages: 4 for bounded report classes
- video analytics batch size: 200
- analytics date window size: 500 days

Traffic-detail direct pagination is intentionally distinct from bounded date-window fallback behavior.

## 13. Date-window fallback

Long-running/detail reports can be split into bounded date windows.

The architecture must keep these concepts separate:

- **row pagination** = more rows for the same query period;
- **date pagination** = same query over multiple time ranges;
- **video batching** = same metric query over subsets of video IDs.

They must never be concatenated without a deterministic dedupe/merge key.

## 14. Monthly range handling

Monthly analytics use month-aligned start/end values and can build large month windows.

Do not convert daily facts into monthly merely to reduce storage. Monthly is a projection/aggregate unless the source query itself is monthly.

---

# PART IV — RAW, COMPILED, FORMATTED & SIMULATED DATA

## 15. Four data layers

### Raw

Exact API/import response rows + columns + source metadata.

Use for:

- audit
- debugging
- future reprocessing
- provenance

### Canonical/compiled

Normalized rows with stable keys/field names and merged dimensions.

Use for:

- data tables
- analytics-canon
- anomaly detection
- Brain evidence

### Formatted/presentation

Human labels, compact numbers, badges, percentages, thumbnails, local dates, derived display totals.

Use only at presentation/export-formatted boundary.

### Simulated

Mock/demo/prototype values.

**Rule:** simulated values must never silently enter canonical analytics.

Every simulated visual must expose a provenance/status such as:

`simulated | demo | placeholder`

and production analytics consumers must reject them.

---

# PART V — LOCAL STORAGE / INDEXEDDB

## 16. Current local database

Database:

`ViewTubeVtSyncLocalDB`

Current version in #77 contracts:

`3`

Stores include:

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

Indexes include record/generation and channel indexes.

## 17. Why both raw and table rows exist

Raw reports preserve source truth.

Table rows preserve product-ready canonical facts.

Do not make the UI decode raw Analytics arrays on every render.

## 18. Packed datasets

Large canonical datasets can be encoded/chunked with:

- manifest
- schema
- chunks
- generation
- compression diagnostics

The repository tracks logical/encoded size and generation health.

### Optimization

Keep small/high-frequency snapshot projections lightweight while large full datasets live in packed IndexedDB records.

The snapshot should act as a working projection, not an ever-growing duplicate database.

---

# PART VI — DATASET & DATA TABLE REGISTRY

## 19. Table categories visible in #77

Current table registry organizes major areas including:

### Videos

- Video Metadata & Metrics

### Time

- Daily Stats
- Weekly Stats
- Monthly Stats
- Traffic × Day

### Channel

- Channel Totals
- Subscriber Status

### Traffic Sources

- Overview
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
- Direct/Unknown
- Playlist Traffic
- YT Playlist Pages
- Other Features
- Advertising
- Subscriber Detail
- Playback Locations
- source-specific traffic detail tables

### Demographics

- Age × Gender
- Age
- Gender
- Audience Behavior
- New vs Returning

### Geography

- Overview/country
- Cities
- US States
- DMA
- Continents/sub-regions

### Devices

- Devices
- Operating Systems
- Device × OS

### Content

- Content Type
- Format × Subscribers
- Retentions
- Sharing Services

### Playlists

- Playlist Statistics

### Revenue

- Overview
- Ad Types

## 20. Table definition responsibilities

Each table definition can own:

- table ID
- category
- description
- snapshot keys
- canonical dataset ID
- sync unit
- columns
- default sort
- pinned/collapsed groups
- export name
- layout/compact mode
- presentation mode
- export mode
- vertical/horizontal scroll behavior
- summary behavior

This registry should remain the single source of truth for table structure.

---

# PART VII — METRICS & DIMENSIONS

## 21. Core video dimensions

The Videos table includes identity/metadata such as:

- thumbnail
- title
- video ID/URL
- upload date/day/time
- description preview
- tags/topics
- category
- title length
- format
- duration
- privacy
- definition
- captions

## 22. Core video metrics

Examples currently represented:

- views
- engaged views
- engagement rate
- watch time
- average percentage viewed
- average view duration
- comments
- shares
- likes/dislikes
- playlist adds/removes
- subscribers gained/lost/net
- revenue
- RPM/CPM/playback CPM
- monetized playbacks
- ad impressions
- Premium views/watch/revenue
- cards
- card clicks/rates
- teasers
- teaser clicks/rates

Derived per-100-view metrics include subscriber, like, comment, share, save and revenue rates.

## 23. Important dimensions

Examples include:

- day/month/window
- video
- traffic source
- traffic source detail
- country/city/state/DMA
- age/gender
- device/OS
- creator content type
- subscribed status
- sharing service
- playback location
- playlist
- ad type
- retention position

A dataset is defined by **grain**, not merely by which metrics it contains.

Example:

`traffic_day = day × traffic source`

must never be treated as equivalent to:

`daily = day`

---

# PART VIII — CSV RECOGNITION & MERGE

## 24. CSV taxonomy

#77 contains a substantial CSV taxonomy that classifies uploads into major families:

- Video Data
- Daily Metrics
- Search Intelligence
- Traffic
- Geography
- Audience
- Surfaces & Discovery
- Revenue & Monetization
- Unknown

Each family definition can specify:

- detected category
- major family
- merge target
- merge-key strategy
- upload hint
- default tag
- subtable
- capability sources
- freshness class

## 25. ViewTube CSV vs YouTube CSV

Treat the distinction as **schema/provenance**, not just filename.

### YouTube-origin CSV

May contain YouTube Studio/export naming, localized labels, metrics unavailable through the current API combination, or single-video retention/audience data.

### ViewTube CSV

Should use canonical exported field names and carry enough metadata to round-trip:

- schema version
- dataset ID
- channel ID when safe
- captured/exported time
- provenance
- grain
- merge keys

### Recognition pipeline

```text
file
 → parse headers
 → normalize aliases
 → detect family
 → determine source/schema
 → determine grain
 → determine merge target
 → determine stable key
 → validate required identity fields
 → preview conflicts/new fields
 → additive merge
 → persist manual_import::<tableId>
 → refresh canonical snapshot
 → visuals/tables update
```

## 26. Additive merge rule

The manual-import adapter explicitly exists so a short CSV cannot replace a larger API dataset.

Stable identities include examples such as:

- video → video ID
- daily → date
- monthly → month/date
- channel total → window
- traffic → source/term
- demographic → age + gender
- format/subscriber → format + subscribed status
- geography → geographic identity
- device/OS → device + OS
- retention → video + retention position
- traffic detail → source/detail identity

## 27. CSV-only / CSV-important datasets

The taxonomy explicitly marks several families as CSV-only or CSV-capable, including:

- new vs returning
- watch behavior
- single-video retention curves/activity
- stayed-to-watch procedure
- some surfaces/discovery families
- post/translation/language-related exports
- other YouTube Studio-only combinations

This is the correct architectural place to add metrics that cannot be reliably synced via the current APIs.

## 28. Video-ID enrichment

For per-video Studio CSVs, Video ID should be the preferred join key.

When a CSV contains metrics unavailable from APIs, merge them into the matching canonical video record/dataset without replacing API fields that are newer or more authoritative.

Recommended field-level provenance:

```ts
{
 value,
 source: "youtube_analytics_v2" | "youtube_data_v3" | "youtube_studio_csv" | "viewtube_csv" | "derived",
 capturedAt,
 datasetId
}
```

---

# PART IX — SYNC CONTROLLERS

## 29. Current VT-SYNC controller

The #77 controller is a unified console driven by `VT_SYNC_SYNC_UNITS`.

It organizes user-facing sync work by groups such as:

- Channel
- Time
- Traffic
- Audience
- Geography
- Revenue

The controller owns **user-facing outcomes**, while dependencies may execute underneath a unit.

It supports:

- default selected units
- Sync All
- Sync Selected
- per-group sync
- per-unit status/freshness
- queued/live/failed/partial state
- retention video selection
- content-owner selection
- progress diagnostics

## 30. Older/parallel ChannelDataSyncControls

Another control surface exposes grouped actions:

- Core Sync
- Expand Data
- Audience & Geography
- Advanced
- Segment Datasets

and segment controls for:

- Device × OS
- Traffic × Day
- Ad Type
- Sharing Service
- Subscription Status
- Subscription Source
- Subscriber Detail
- Content Type
- Playlists
- Retention

### Consolidation recommendation

Do not maintain two independent definitions of sync capability.

Make both surfaces projections of the same `VT_SYNC_SYNC_UNITS / query registry`.

---

# PART X — TOP-RIGHT CONTROLLER

## 31. Current visual controller metadata

The Data Visuals registry already carries per-visual concepts such as:

- source table IDs
- active metric keys
- dimension keys
- controller explanation
- controller spec
- controls
- canvas fit
- footer insight
- legend/axis metadata

Examples of current controller mappings:

- format visuals → window + aggregation
- engagement → count + format + ranking
- word network → metric + word limit

## 32. Top-right controller master plan

The top-right controller should become a **shared analytics context controller**, not a collection of chart-specific ad hoc dropdowns.

### Phase 1 — display controls

- metric
- ranking
- count/top N
- format
- aggregation

### Phase 2 — temporal controls

- 7d / 28d / 90d / 365d / lifetime
- custom start/end
- compare previous period
- upload-relative age

### Phase 3 — dimension controls

- channel/video
- traffic source
- geography
- demographic
- device
- subscribed status
- content type

### Phase 4 — source/provenance

- API
- CSV
- combined
- raw
- canonical
- formatted

### Phase 5 — intelligence

- explain this visual
- detect anomaly
- compare cohorts
- identify driver
- ask Brain
- send insight to Algorithm Momentum

## 33. Shared controller contract

Recommended:

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

Tables, visuals and insights should all consume this same context.

---

# PART XI — DATASET ↔ VISUAL CONNECTIONS

## 34. Current visual registry

The Data Visuals toolbox combines:

- core visual modules
- Tube Explorer visual modules
- VT2 modules

and assigns source tables based on visual purpose.

Examples:

- traffic visual → traffic tables
- keyword/word network → videos + search
- publish/upload time → videos + daily
- age/audience → demographics
- revenue → videos + ads
- subscriber → videos + subs

## 35. Required improvement: explicit dependency graph

Replace string-ID heuristics over time with an explicit registry:

```ts
{
 visualId,
 requiredDatasets,
 optionalDatasets,
 metrics,
 dimensions,
 supportedWindows,
 filters,
 minimumRows,
 missingDataBehavior,
 insightCapabilities
}
```

Then the UI can say:

- Ready
- Needs sync
- Needs CSV
- Partial
- Unsupported for this channel
- Simulated/demo only

instead of rendering misleading empty charts.

---

# PART XII — DATA INSIGHTS / VISUAL INSIGHTS

## 36. Separate facts from insights

### Data insight

A statement derived from canonical rows.

Example:

“Browse Features supplied 42% of views during the selected period.”

### Visual insight

A statement about a pattern encoded by the current visualization/context.

Example:

“The traffic-source river shows Browse accelerating while Search remains flat.”

### Intelligence insight

A hypothesis/recommendation requiring broader reasoning.

Example:

“Browse acceleration coincides with higher returning-viewer share; consider preserving the current packaging pattern.”

Each level should carry evidence refs.

## 37. Insight pipeline

```text
AnalyticsViewContext
 → canonical dataset rows
 → deterministic calculations
 → data insight
 → visual pattern extraction
 → visual insight
 → Brain/anomaly correlation
 → hypothesis
 → recommendation
 → Outcome Ledger
```

Do not let Brain invent the deterministic data insight when code can calculate it.

---

# PART XIII — VIDEO DEEP DIVE

## 38. Planned canonical video deep-dive dataset

The existing code already has:

- video catalog
- per-video metrics
- retention video selection
- video-based analytics filters/batches
- CSV single-video retention taxonomy

The next step should be a canonical deep-dive context keyed by `videoId`.

### Dataset families

For one selected video:

- metadata
- lifetime totals
- daily lifetime series
- first 24/48/72h
- rolling 7/28/90
- retention curve
- traffic overview
- traffic detail
- search terms
- external URLs
- suggested videos
- subscriber status
- geography
- demographics where API/privacy permits
- devices/OS
- playback locations
- cards/end screens
- revenue/ads
- CSV-only Studio metrics

### UI

The video deep-dive page should use the same:

- table registry
- AnalyticsViewContext
- provenance
- date controller
- insight pipeline
- visual registry

not a separate analytics implementation.

---

# PART XIV — MISSING / PLANNED DATASETS

## 39. Missing-data registry

Do not represent “missing” as one state.

Use:

- not synced
- sync failed
- API unsupported
- metric/dimension incompatible
- privacy suppressed
- quota blocked
- requires content owner
- CSV only
- planned
- deprecated
- simulated
- stale
- partial

## 40. Planned dataset combinations

Priority combinations for deeper intelligence include:

- video × day
- video × traffic source
- video × search term
- video × external URL
- video × suggested video
- video × subscriber status
- video × geography
- video × device
- format × subscriber status
- traffic source × day
- geography × day
- revenue source × day
- ad type × day
- playback location × day
- content type × day
- retention position × video
- upload age × performance metric

Each combination must be verified against API support before being marked syncable.

## 41. CSV-first planned families

Use CSV/imports where API support is absent or incomplete:

- new/returning/regular viewer exports
- stayed-to-watch / swiped-away
- Studio retention details
- thumbnail impressions/CTR combinations not available to the app's API path
- end-screen/card exports where Reporting/Studio is richer
- other Studio-only audience behavior

Do not simulate these metrics in production.

---

# PART XV — UNUSED / LEGACY ANALYTICS CODE

## 42. Quarantine in #77

#77 deliberately carries old code under `_quarantine/`, including:

- legacy Performance Hub generations
- old analytics selectors/contracts
- old Performance Hub table registries
- old lifetime sync implementations
- copied chart modules
- Toolbox UI backups
- CSS backups
- scratch repair scripts
- old editor copies

## 43. Rule for quarantine

Quarantine is evidence, not runtime.

Nothing under `_quarantine/` should be imported by production code.

Before deleting quarantine permanently:

1. inventory unique behaviors;
2. map each to a canonical replacement;
3. port only missing behavior;
4. add parity test;
5. mark replacement;
6. then delete.

---

# PART XVI — OPTIMIZATION PLAN

## 44. Query optimization

- fetch only metric bundles needed by selected sync units;
- cache freshness by dataset;
- incremental video inventory;
- batch video IDs;
- paginate only where needed;
- use date-window fallback only for proven report limits;
- dedupe before persistence;
- stop retrying known-invalid metric/dimension combinations;
- maintain a compatibility registry.

## 45. Storage optimization

- raw source preserved but compressed/chunked;
- canonical rows packed;
- lightweight snapshot projection;
- separate channel/video dimensions from repeated fact rows;
- avoid copying metadata into every daily row;
- garbage-collect superseded generations only after manifest verification.

## 46. UI optimization

- tables virtualize/paginate presentation without truncating stored data;
- visuals lazy mount using intersection/content visibility;
- controllers read registry metadata;
- never compute large joins repeatedly in React render;
- memoize projections by snapshot/dataset/context key.

## 47. Intelligence optimization

- deterministic calculations before LLM reasoning;
- compact evidence packets;
- anomaly scans over canonical rows;
- store derived anomaly events rather than rescanning full history for every Brain message;
- Profile gets validated learning, not raw observations.

---

# PART XVII — PR #77 MERGE ACCEPTANCE CHECKLIST

## 48. Data

- [ ] VT-SYNC remains canonical raw owner
- [ ] analytics-canon remains public analytics boundary
- [ ] no active Performance Hub duplicate authority
- [ ] lifetime daily rows preserved
- [ ] traffic detail pagination works
- [ ] inventory pagination/incremental behavior works
- [ ] raw + canonical rows persist/recover
- [ ] packed datasets recover correctly
- [ ] freshness/provenance survives reload

## 49. CSV

- [ ] taxonomy auto-detection works
- [ ] unknown CSV does not corrupt canonical data
- [ ] Video ID joins work
- [ ] short imports are additive
- [ ] manual import freshness is recorded
- [ ] CSV-only metrics remain distinguishable from API metrics

## 50. Tables/visuals

- [ ] every visible table maps to registry
- [ ] every sync control maps to registry
- [ ] every primary visual declares source datasets
- [ ] missing-data states are truthful
- [ ] no simulated metric appears as real
- [ ] top-right controls do not create independent data state

## 51. Auth/API

- [ ] login persists across reload
- [ ] logout clears authority
- [ ] reconnect/scopes handled
- [ ] cache never grants auth
- [ ] quota/scope failures remain distinct
- [ ] server proxy and client fallback behavior is intentional

## 52. Regression

- [ ] build
- [ ] typecheck
- [ ] focused suites
- [ ] full suite
- [ ] zero new failures against main baseline
- [ ] mobile smoke
- [ ] production deployment smoke

---

# PART XVIII — POST-#77 ORDER

## 53. Immediately after #77 lands

1. tag the post-#77 main;
2. verify production;
3. update the system reference branch;
4. rebuild/rebase PR #78 against this new canonical main;
5. manually reconcile #78 analytics-canon changes;
6. fix #78 traffic-day grouping;
7. defer/fix aggregate subscriber anomaly treatment;
8. run post-#77 delta gates;
9. merge #78 independently.

## Final architecture

```text
YouTube / CSV
   ↓
VT-SYNC acquisition
   ↓
raw report store
   ↓
canonical normalized dataset rows
   ↓
analytics-canon
   ├── Data Tables
   ├── Data Visuals
   ├── deterministic Insights
   ├── Brain Evidence
   └── Anomaly Intelligence
            ↓
      Algorithm Momentum
            ↓
      ActionPacket / Tool
            ↓
       Outcome Ledger
            ↓
       Learning Ledger
            ↓
       Channel Profile
```

**PR #77 should be merged as the consolidation of this foundation, not as permission to preserve every historical analytics path it contains.**
