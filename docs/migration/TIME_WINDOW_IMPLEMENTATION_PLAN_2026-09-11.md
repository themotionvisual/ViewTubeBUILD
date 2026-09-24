# ViewTube — 7 / 28 / 90 / 365 Day Time Window Implementation Plan

**Status:** ACTIVE IMPLEMENTATION HISTORY + REMAINING MIGRATION PLAN  
**Current authority:** `../analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md`  
**Last re-audited:** 2026-09-24 against main `e8313cceb2b6ab1fbcff6ff28a9648192f559854`  
**Current state:** `analytics/windows.ts` owns the vocabulary/range resolver, VT-SYNC aliases that type, IndexedDB v2 keys dataset windows, `datasetsByWindow` exists, and per-video `metricsByWindow`/window-source projection exists. Consumer and dataset coverage remains incomplete, so the plan is not archival yet. Treat phase-local "shipped" notes below as implementation history, not a substitute for the current master.

**Date:** 2026-09-11
**Branch:** `claude/time-window-implementation-plan-lyyj7f`
**Scope:** every analytics dataset, all three sync engines, their storage keys, the
sync controller options, and the consumer selectors that read windowed facts.
**Grounding docs:**
`docs/migration/reference/VIEWTUBE_VT_SYNC_ANALYTICS_ARCHITECTURE_MASTER_REFERENCE_2026-09-03.md` §3–§9
and `docs/VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md` task 11.

---

## 0. Executive summary

The window *vocabulary* already exists and is already correct:
`AnalyticsWindow = "7d" | "28d" | "90d" | "365d" | "lifetime"`
(`src/services/analytics/DataStore.ts:294`), re-exported by
`src/services/canonicalSync/contracts.ts:1` and mirrored as
`VtSyncAnalyticsWindow` in `src/features/vt-sync-local/adapters/contracts.ts:1`.

What does **not** exist is consistent *coverage*. Three sync engines run in
parallel and each implements windows differently:

| Engine | Windows actually fetched | Verdict |
|---|---|---|
| `src/services/canonicalSync/*` | channel summaries: all 5 + previous-period. Most other datasets: `lifetime/365d/90d/28d` (**7d missing**) | closest to target |
| `src/features/vt-sync-local/*` (the shipping controller) | `channel_totals` only: all 5. **Everything else: lifetime only** | largest gap |
| `SyncCoordinator` + `coreLifetimeSync` | video metrics: all 5. Segments: lifetime only. Channel: `day28/day90/day365` (**7d missing, non-canonical keys**) | inconsistent |

Three defects make the current windowed numbers actively wrong, and each gets
worse as the window shortens — which is exactly what adding 7d does:

1. **Window filtering by upload date, not by metric window.**
   `filterCanonicalRowsByWindow` (`src/services/analytics-canon/vtSyncAdapter.ts:207`)
   keeps rows whose `uploadDate` is inside the window and then reports their
   **lifetime** metric values. "28-day views" is really "lifetime views of
   videos published in the last 28 days". This flows into
   `useCanonicalRows` / `useCanonicalMetricSummary` / `useCanonicalWindowTotals`
   and into Intelligence Hub evidence (`intelligenceEvidence.ts:306`).
2. **Two different end-date conventions.**
   `channelWindowSync.ts:75` ends windows at `latestCompleteAnalyticsDate()`
   (yesterday, UTC). `query.ts:27` `getWindowRange` ends at `new Date()` (today).
   Today's YouTube Analytics row is always incomplete. On 365d that is a 0.3%
   error; on 7d it is up to 14%, and the two stores will disagree visibly.
3. **Non-canonical window keys.**
   `coreLifetimeSync.ts:1447` emits `day28` / `day90` / `day365`, which
   `SyncCoordinator.ts:748` writes as ledger keys
   `youtube_analytics_v2::channel::::day28`. Nothing that looks up `28d` will
   ever match them, and 7d is absent entirely.

This plan therefore has two halves: **fix the semantics**, then **extend the
coverage**. Doing the extension first would multiply a wrong number by five.

---

## 1. Target model (restated from the architecture reference)

Per §3 of the master reference, stored grain and selected window are separate
concepts. Every dataset falls into exactly one of three classes, and the class
decides how its windows are produced:

| Class | Datasets | How windows are produced | Extra quota |
|---|---|---|---|
| **A — day-grained** | `daily_metrics`, `traffic_day`, `monthly_metrics` (month), `creator_content_type` (month), canonical `channelDailySeries` | Store lifetime daily history once, **derive** 7/28/90/365 locally by summing/weighting date keys | **none** |
| **B — aggregate** | traffic overview + 14 traffic details, geography (country/city/province/DMA), demographics, devices, OS, device×OS, playback location, subscription status, sharing service, ad type, revenue source, playlists, audience segments, per-video metrics, owner-mode reach | One row **per window**; requires one Analytics request per window | ×N windows requested |
| **C — window-invariant or window-restricted** | `video_inventory` / `video_metadata` (not windowed), `viewer_cohorts` (API supports 7d/28d/90d only), `retention` (elapsed-ratio grain) | Class C is exempt or capped; the restriction must be stored as a reason code, not silently dropped | n/a |

Rule that follows: **never issue an Analytics request for a window a class-A
dataset can derive**, and never fabricate a window a class-C dataset cannot
support — emit `window_not_supported_*` the way
`viewerCohortSync.ts:36` already does.

---

## 2. Phase 0 — One window contract (no behavior change)

Create `src/services/analytics/windows.ts` as the single source of truth and
re-export from both feature contracts so the two systems cannot drift again.

```ts
export type AnalyticsWindow = "7d" | "28d" | "90d" | "365d" | "lifetime"
export type ComparableAnalyticsWindow = Exclude<AnalyticsWindow, "lifetime">

export const ANALYTICS_WINDOWS: AnalyticsWindow[]            // lifetime,365d,90d,28d,7d
export const COMPARABLE_WINDOWS: ComparableAnalyticsWindow[] // 365d,90d,28d,7d
export const WINDOW_DAYS: Record<ComparableAnalyticsWindow, number>
export const WINDOW_LABELS: Record<AnalyticsWindow, string>

/** The last date YouTube Analytics has complete data for (UTC, yesterday). */
export const latestCompleteAnalyticsDate: (now?: Date) => Date

/** ONE range resolver. Handles lifetime clamping, previous-period, coverage. */
export const resolveWindowRange: (input: {
  window: AnalyticsWindow
  period?: "current" | "previous"
  channelPublishedAt?: string | null
  endDate?: Date
}) => { startDate: string; endDate: string; coverage: "complete" | "partial" }
```

`resolveWindowRange` is `resolveChannelPeriodRange`
(`src/services/canonicalSync/channelWindowSync.ts:80`) promoted verbatim — it is
already the correct implementation: inclusive non-overlapping ranges,
publishedAt clamping, `coverage: "partial"` when the channel predates the range.

**Then delete the duplicates and re-point their callers:**

- `src/services/canonicalSync/query.ts:27` `getWindowRange` → wrapper over
  `resolveWindowRange` (**this alone fixes defect #2 for 9 sync modules**).
- `src/services/canonicalSync/videoMetricsSync.ts:29` local `getWindowRange`.
- `src/features/vt-sync-local/adapters/localSyncEngine.ts:1722` and `:1857`
  inline `daysAgo(Number(window.replace("d","")))`.
- `src/services/SyncCoordinator.ts:220` `buildWindowRanges`.
- `src/services/youtube/coreLifetimeSync.ts:1447` `windows` object literal —
  replace `day28/day90/day365` with canonical keys and add `7d` (**defect #3**).
- `src/services/analytics-canon/vtSyncAdapter.ts:199` `WINDOW_TO_DAYS`.

Acceptance: `npm run typecheck` clean; a new
`src/services/analytics/windows.test.ts` asserts 7d current is 7 inclusive days
ending yesterday, 7d previous is the 7 days before that with no overlap, and
lifetime clamps to `channelPublishedAt`.

---

## 3. Phase 1 — Fix window semantics before widening coverage

### 3.1 Windowed metrics, not upload-date filtering (blocking)

> **Correction (2026-09-11, during implementation).** This section originally
> said the fix was to read each row's per-window metric map. That is right for
> the **canonicalSync** video record, which does have
> `Record<AnalyticsWindow, …>` (`canonicalSync/contracts.ts:187`) — but
> `vtSyncAdapter` reads the **vt-sync snapshot**, and `VtSyncVideoItem.metrics`
> is a single flat map. VT-SYNC fetches `videos_analytics` from `2000-01-01`
> (`localSyncEngine.ts:2183`), so only lifetime values are ever stored.
> **Per-window video metrics do not exist until Phase 3 lands**, and rewriting
> the selector to read them first would have returned empty everywhere.
>
> Shipped instead (commit `80c1b48`): the *seam*. `CanonicalVideoRow` gained
> `window` + `windowSource` (`window_exact` | `lifetime_fallback` |
> `unavailable`), the projector takes a window and prefers
> `video.metricsByWindow[window]`, and `VtSyncVideoItem` gained the
> `metricsByWindow` field Phase 3 populates. Displayed values are unchanged —
> the mislabeling is now *labelled* rather than silent. The date predicate is
> renamed `filterRowsByUploadRecency` (old name kept as a deprecated alias).
>
> **Still open:** the consumer display policy for the gap period — what
> `useDashboardData` should show for 28d while only `lifetime_fallback` rows
> exist. See §13.

`filterCanonicalRowsByWindow` must stop being a date filter and start reading
per-window metric values. The canonical video record already has the right
shape: `Record<AnalyticsWindow, Record<string, number | null>>`
(`canonicalSync/contracts.ts:187`) with matching meta at `:191`, written by
`mergeMetricWindows`.

- `projectVtSyncVideoToCanonicalRow` (`vtSyncAdapter.ts:~180`) gains a `window`
  argument and reads that window's metric map.
- `getCanonicalRowsFromVtSync(snapshot, window)` selects metrics **for that
  window** and keeps every video whose window row exists, rather than filtering
  the roster by `uploadDate`.
- A video with no data in the requested window resolves through the existing
  `selectRowsForWindow` fallback (`canonicalSync/windowing.ts:28`) and is
  surfaced as `usedFallbackWindow: true`, never silently as a lifetime number.
- Preserve null vs zero: a missing window is `null` + reason code, never `0`.

Keep the upload-date predicate, renamed `filterRowsByUploadRecency`, for the
callers that genuinely want "videos published recently" — grep before deleting;
that is a real, separate question the UI asks.

### 3.2 Single end-date convention

Every range now ends at `latestCompleteAnalyticsDate()`. Surface the boundary in
the UI ("through {date}") so a 7d card is not read as including today.

### 3.3 Canonical ledger keys

`SyncCoordinator.ts:482` hardcodes `window: "lifetime"` on every segment ledger
entry. That becomes the actual window per Phase 4.

---

## 4. Phase 2 — Canonical sync (`src/services/canonicalSync/*`): complete the set

Each module already loops a `windows` array with a default and accepts an
override parameter, so this is a one-line change per module plus the run-record
window list. Replace each local array with `ANALYTICS_WINDOWS` / an explicit
supported subset:

| File | Line | Current | Change |
|---|---|---|---|
| `videoMetricsSync.ts` | 9 | `lifetime,365d,90d,28d` | `+ 7d` |
| `trafficSync.ts` | 18 | `lifetime,365d,90d,28d` | `+ 7d` |
| `geographySync.ts` | 16 | `lifetime,365d,90d,28d` | `+ 7d` |
| `revenueSync.ts` | 15 | `lifetime,365d,90d,28d` | `+ 7d` |
| `playlistSync.ts` | 20 | `lifetime,365d,90d,28d` | `+ 7d` |
| `ownerModeSync.ts` | 18 | `lifetime,365d,90d,28d` | `+ 7d` |
| `demographicSync.ts` | 16 | all 5 | no change |
| `audienceSegmentSync.ts` | 17 | all 5 | no change |
| `viewerCohortSync.ts` | 19 | `7d,28d,90d` | **keep** — API limit; already reason-coded |
| `retentionSync.ts` | 95 | `opts.window \|\| "lifetime"` | accept `windows[]`, default stays **single window** (see note) |
| `channelWindowSync.ts` | 18–19 | all 5 + 4 previous | no change — reference implementation |
| `channelDailySync.ts` | — | day-grained | no change — **class A, derive** |
| `videoInventorySync.ts` | — | unwindowed | no change — **class C** |

Run records must agree with what was fetched:
`repository.ts:1280` (`runCanonicalVideoMetricsSync`) currently declares
`["lifetime","365d","90d","28d"]` → add `7d`.
`repository.ts:1972` (`runCanonicalDefaultSync`) already declares all five.
`repository.ts:1914` (`runCanonicalRetentionSync`) takes a single `window` →
take `AnalyticsWindow[]`.

Storage needs no migration: canonical rows already carry `window` and
`CANONICAL_SYNC_STORE_NAMES` records are keyed by composite `id` strings that
already embed the window (e.g. `geographySync.ts:109`).

---

## 5. Phase 3 — VT-SYNC local: add the window dimension (largest change)

This is the engine behind the shipping controller and it is lifetime-only for
everything except `channel_totals`. Three layers change.

### 5.1 Storage — window becomes part of the key

`VtSyncDatasetRawReportRecord` and `VtSyncDatasetTableRowsRecord`
(`adapters/contracts.ts:303`, `:316`) key on `datasetId`. Persisting a second
window today **overwrites the first**. Add:

```ts
window: VtSyncAnalyticsWindow   // defaults to "lifetime" when reading legacy records
```

and make the record `id` `${datasetId}::${window}`. Bump
`VT_SYNC_LOCAL_DB_VERSION`; the upgrade handler in
`adapters/localDbRepository.ts:26` backfills `window: "lifetime"` onto existing
records so no synced data is lost. `persistDatasetRows`
(`localSyncEngine.ts:1054`) takes and forwards `window`.

### 5.2 Snapshot — windowed buckets for class-B datasets

Snapshot fields (`geography`, `devices`, `demographics`, `trafficOverview`, …)
are flat arrays. Introduce a parallel windowed map rather than breaking every
existing reader in one commit:

```ts
// VtSyncSnapshot
datasetsByWindow?: Partial<Record<VtSyncAnalyticsWindow, Record<string, Row[]>>>
```

The existing flat fields keep pointing at the `lifetime` bucket for the whole
migration, so `visualData.ts`, `tableData.ts` and `videoCatalogProjection.ts`
stay green while consumers are moved over one at a time.
`mergeVtSyncRowsPreservingDefined` / `vtSyncSegmentRowKey` must be called
**per window bucket** — merging across windows would silently blend ranges
(master reference §7, "never merge … without a dataset-specific deterministic
key").

### 5.3 Engine — loop requested windows per class

`runVtSyncLocalSync` (`localSyncEngine.ts:1939`) gains
`selectedWindows: VtSyncAnalyticsWindow[]` (default `["lifetime"]`, preserving
today's behavior when the caller omits it).

- **Class A** (`daily_metrics`, `monthly_metrics`, `traffic_day`,
  `creator_content_type`) — unchanged fetch. Add a derivation step that slices
  the stored lifetime day/month rows into each requested window. The machinery
  exists: `fillMissingChannelTotalsFromDaily` (`:1835`) already filters daily
  rows by `date >= startDate && date <= endDate` and re-aggregates with
  `sumAvailableMetric` / `weightedAvailableMetric`. Promote that into a reusable
  `deriveWindowRowsFromDaily(rows, window, lifetimeStartDate)`. **Zero extra
  quota.**
- **Class B** — wrap the `segmentRuns` loop (`:2691`), the traffic-detail loop,
  the revenue/sharing loop (`:2788`) and the `playlists_analytics` block in
  `for (const window of selectedWindows)`, passing
  `resolveWindowRange({ window, channelPublishedAt }).startDate` instead of the
  hardcoded `channelStartDate`, and tagging the persisted rows with `window`.
- **`videos_analytics` (`:2183`)** — the `startDate: "2000-01-01"` literal
  becomes the resolved window start, looping requested windows. This is the
  heaviest block (200-video batches × metric bundles × windows); it gets the
  budget guard in §7.
- **`channel_totals` (`:2295`)** — already correct; reuse as the pattern.
- **Retention (class C)** — stays targeted; window becomes an explicit option
  rather than an implicit lifetime.

Progress/manifest plumbing: `updatePhase`, `addManifestResult`, `markFreshness`
and `analyticsBundleDiagnostic` all take a `context` bag today — thread `window`
through so the phase rail (`CanonicalSyncPhaseRail.tsx`) and
`vtSyncProgressModel.ts` can show "Segments · 28d" instead of a bare phase.

---

## 6. Phase 4 — Sync controller options

### 6.1 VT-SYNC controller (`shell/VtSyncControllerPanel.tsx`) — primary surface

It has no window control at all today. Add a **Time Windows** section above the
category groups, styled with the existing `ToolboxScaffold` + `RetroRivets`
primitives (no new visual system):

- Five multi-select chips: `7D · 28D · 90D · 365D · LIFETIME`.
  Default selection `["28d", "lifetime"]` — matches the current default
  dashboard read (`useDashboardData.ts:123` reads `28d`/`current`) while keeping
  lifetime, which every existing consumer depends on. Lifetime is not
  deselectable while legacy flat snapshot fields still alias it.
- A live **cost line** under the chips: "12 datasets × 3 windows ≈ 41 Analytics
  requests (~3 min)", computed from the selected units and their dataset class —
  class-A units are counted once and labelled *derived*, so the panel teaches
  that 7d on Daily Stats is free.
- Per-unit window badges in the existing freshness row, so a unit synced at
  lifetime but not at 7d reads as partial rather than stale.

`onStartSync` widens to
`(categoryIds, windows, retentionVideoIds?, forceFullVideoMetadata?)`;
`startSync` in `shell/VtSyncLocalAnalyticsPage.tsx:819` forwards to
`runVtSyncLocalSync({ selectedWindows })`.

### 6.2 Canonical action controller (`src/services/canonicalSync/actions.ts`)

`CanonicalActionDefinition` already has a `dropdownOptions` mechanism (used by
traffic and retention). Extend it rather than inventing a second one:

```ts
supportedWindows: AnalyticsWindow[]       // what this family can do
defaultWindows: AnalyticsWindow[]         // what it runs when unspecified
```

`runCanonicalAction(actionId, dropdownOption?, windows?)` forwards `windows` to
the matching `runCanonical*Sync`, which forwards to the per-module `windows`
parameter that already exists. `quotaProfile` becomes a function of window count
so "Sync Video Metrics" at 5 windows reads `high` and at 1 window reads `medium`.

### 6.3 `ChannelDataSyncControls.tsx` (SyncCoordinator surface)

`SyncOptions` gains `windows?: AnalyticsWindow[]`, threaded to
`syncSegmentDatasets` (`SyncCoordinator.ts:459`) which loops windows and commits
each ledger entry with its real window instead of the hardcoded `"lifetime"` at
`:482`.

---

## 7. Phase 5 — Quota, budget and pacing

Analytics API v2 quota is separate from the Data API v3 10,000-unit/day pool and
is hard to exhaust, so **request count and wall-clock are the real constraints**,
not units. Current pacing is 75–300 ms between bundles plus 150 ms between
segment categories.

Controls, in order of preference:

1. **Derive, never fetch, class-A windows.** Daily/monthly/traffic-day/format
   windows cost nothing.
2. **Default to two windows** (`28d` + `lifetime`), not five.
3. **Per-run request budget.** A `windowBudget` guard alongside the existing
   `quotaGuard.ts`: estimate `classBDatasets × windows × bundles` before the run,
   and if it exceeds the budget, run the selected windows in priority order
   (`lifetime → 28d → 7d → 90d → 365d`) and mark the rest `pending` rather than
   failing the run. Partial coverage is already a first-class state in the
   freshness model (`markFreshness(..., "partial", missing)`).
4. **Incremental window refresh.** Short windows are cheap to re-run and go stale
   fastest; long windows move slowly. Set `refreshPolicy` per window:
   `7d/28d` each run, `90d/365d` daily, `lifetime` on demand.

---

## 8. Phase 6 — Consumers and presentation

- `analytics-canon/useAnalytics.ts` already memoizes per window — it works
  correctly once §3.1 lands.
- `canonicalSync/presentation.ts` + `tableDatasets.ts`: use
  `selectRowsForWindow` (`windowing.ts:28`) everywhere a table or chart reads a
  windowed dataset, and render `usedFallbackWindow` / `resolvedWindow` visibly
  ("no 7d data yet — showing 28d").
- `tableRegistry.ts`: today only `channel_totals` (`:395`) has a `window`
  column. Every class-B table gets one, plus the `summaryPrimaryRow` treatment.
- `vtSyncToolboxTableModel.ts:231` already reads
  `snapshot.selectedTimeWindow` for its label — wire the controller selection to
  that field (it is set once to `"lifetime"` at `adapters/snapshot.ts:358` and
  never changed; today it is a dead knob).
- Widget/dashboard window pickers (`WidgetRenderer.tsx:148`,
  `ChartControls.tsx:204`) currently carry their own string window lists — point
  them at `WINDOW_LABELS`.
- Empty / loading / partial / blocked / stale states per window are part of
  acceptance, on mobile as well as desktop.

---

## 9. Sequencing

Each step is independently shippable and independently revertable; per
`CLAUDE.md` this is a stack of small PRs into `main`, not one long-lived branch.

| PR | Content | Risk |
|---|---|---|
| 1 | Phase 0 — `windows.ts` contract, all callers re-pointed, `day28`→`28d`, unified end date | low, behavior-visible (numbers shift by one day) |
| 2 | Phase 1.1 — windowed metric selection in `vtSyncAdapter` + fallback surfacing | **medium — corrects previously wrong numbers** |
| 3 | Phase 2 — canonical `+7d` across the 6 modules, retention window list | low |
| 4 | Phase 3.1/3.2 — VT-SYNC storage + snapshot window dimension, DB upgrade, legacy backfill | medium |
| 5 | Phase 3.3 — engine window loops + class-A derivation | medium |
| 6 | Phase 4 — controller options in all three surfaces | low |
| 7 | Phase 5/6 — budget guard, table/visual window columns and states | low |

PR 2 changes displayed numbers. Per `CLAUDE.md`, tag `pre-time-windows-<date>`
off `origin/main` and take a `snapshot/` branch pointer before it merges, and
call both out in the PR body.

---

## 10. Verification

Per-PR gates:

```bash
npm run typecheck
npm run test            # vitest
npm run check:architecture
```

New tests, mirroring the existing `channelWindowSync.test.ts` style:

- `windows.test.ts` — inclusive/non-overlapping 7d current vs previous;
  end date is yesterday UTC; lifetime clamps to `channelPublishedAt`;
  `coverage: "partial"` when the channel is younger than the window.
- `vtSyncAdapter.window.test.ts` — a video with 28d data and a video with only
  lifetime data: the first reports its 28d value, the second reports fallback,
  **neither reports a lifetime number labelled 28d**. This is the regression
  test for the defect in §0.1.
- `localSyncEngine.windows.test.ts` — two windows persist two records, not one
  overwrite; class-A windows are derived with zero additional fetches;
  class-C windows emit `window_not_supported_*` instead of a fabricated row.
- `VtSyncControllerPanel.test.ts` (exists) — window selection reaches
  `onStartSync`; the cost line counts class-A units as derived.
- Derivation parity — a derived 28d daily total equals the fetched 28d
  `channel_totals` value within float tolerance. This is the cross-check that
  proves the class-A shortcut is sound, and
  `fillMissingChannelTotalsFromDaily` (`localSyncEngine.ts:1835`) already
  performs exactly this reconciliation today.

Manual, on a Vercel preview with a real channel: run 7d + lifetime, confirm the
7d card matches YouTube Studio's "Last 7 days" to within the known
last-complete-day offset, and confirm a channel younger than 365 days shows
`partial` rather than a zero.

---

## 11. Known risks

1. **Numbers will move.** The end-date fix and the metric-window fix both change
   values that are currently displayed. This is a correction, not a regression —
   say so in the PR body and in release notes.
2. **Wall-clock.** Five windows × the full class-B set is roughly 5× today's
   segment runtime. §7's budget guard and the two-window default are the
   mitigation; do not ship the window loop without them.
3. **Snapshot growth.** IndexedDB snapshot size grows ~linearly with windows for
   class-B datasets. Measure before enabling five windows by default; consider
   retaining raw reports only for `lifetime` + the most recent run.
4. **Metric × dimension × window incompatibility.** Some metric/dimension pairs
   behave differently on short ranges. Route every new failure through the
   existing `analyticsMetricSanitizer` + reason-code path rather than
   try/catching at the call site (master reference §6).
5. **Three engines.** This plan deliberately does not merge them. It makes them
   agree on the window contract; consolidation is separate work (unfinished-work
   master, priority 1).

---

## 12. Skills consulted

- `viewtube-skill-finder` — routed lead/reviewer ownership for this task.
- `viewtube-prince-observatory` (lead) — VT-SYNC owns raw/canonical ingestion;
  analytics-canon owns normalized consumer access; null vs zero and
  partial/sample coverage must survive; prefer existing controller primitives.
- `youtube-api-expert` (supporting) — Analytics API v2 vs Data API v3 quota
  pools, the `analytics_reports_query` surface, and why request count rather
  than quota units is the binding constraint here.

---

## 13. Open decision — display policy during the gap period

Raised during Phase 1 implementation; **not yet decided**.

Until Phase 3 fetches per-window video metrics, `getCanonicalRowsFromVtSync`
can only return `lifetime_fallback` rows for 7/28/90/365. The seam now labels
them, but nothing consumes the label yet, so the dashboard still renders a
lifetime number under a 28-day heading.

`useDashboardData.ts:74-79` gates on `rowCount > 0`:

```ts
const canonical28d = useCanonicalMetricSummary("28d")
const summary28d = canonical28d.rowCount > 0
  ? canonical28d                                    // lifetime values today
  : getMetricSummary("28d", "hybrid", brain.csvFiles || [])
```

Three options:

| Option | Behavior | Trade |
|---|---|---|
| **A. Leave as is** | Keeps today's numbers | The wrong number stays on screen until Phase 3 |
| **B. Return `[]` for fallback-only windows** | `rowCount` hits 0, so the dashboard falls through to its CSV path and to `bootstrap28d`, which reads `initialBootstrap.periods` — real `window === "28d"` rows from `channelWindowSync` | Likely **more** correct, but it is a live behavior change and the fallback chain needs verifying against a real channel first |
| **C. Show the value with a provenance badge** | "1.2M · lifetime — 28d not synced yet" | Most honest; needs a UI change in every consumer |

Recommendation: **B**, verified against a real channel on a preview deploy
before merge, with **C** as the follow-up once the controller can request
windows. B is the only option that routes the dashboard to a genuinely
windowed source (`channelWindowSummaries`) that already exists and is correct.
