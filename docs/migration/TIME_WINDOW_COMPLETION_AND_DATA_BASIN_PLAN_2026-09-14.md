# ViewTube — Time Window Completion + Canonical Data Basin

**Date:** 2026-09-14
**Branch:** `claude/time-window-implementation-plan-lyyj7f`
**Predecessor:** `TIME_WINDOW_IMPLEMENTATION_PLAN_2026-09-11.md` (phases 0–4 landed; see §1)
**Scope:** finish windows across every sync controller, dataset, data table and data
visual, and consolidate the three analytics stores into one canonical basin.

---

## 0. What this plan is, and the one thing it must not become

The request is for "a simple, stable, optimized system to hold all of the different
data for all of the different time windows, so they're uniform and accessible from a
centralized location."

The failure mode is obvious and worth naming up front: **ViewTube already has three
analytics stores because each was, at the time, a reasonable answer to that same
sentence.** A fourth "unified" store that the other three keep writing to is not
consolidation, it is a fourth store. Per `viewtube-solution-finder`, the bar is *the
smallest solution that satisfies acceptance without duplicating ownership*.

So the basin in §5 is defined as a **migration with deletions**, not an addition. Every
phase names what gets removed. If a phase ends with more storage systems than it
started with, it has failed.

---

## 1. Where the work actually stands

Landed on this branch (12 commits, verified at parity with `main`):

| Phase | State |
|---|---|
| 0 — one window contract (`services/analytics/windows.ts`) | ✅ all 3 engines resolve ranges through it |
| 1 — window provenance on canonical rows | ✅ `windowSource` + no lifetime-as-window substitution |
| 2 — canonical `7d` coverage | ✅ 6 modules; cohort/daily correctly excluded |
| 3 — VT-SYNC storage (DB v2) + engine loops + derivation primitive | ✅ segments, ad types, sharing services |
| 4 — controller chips + data table window rail | ✅ both surfaces |

Defects found and fixed along the way, none of which were in the original plan:
upload-date filtering masquerading as metric windowing; two different window end-date
conventions; `day28`/`day90`/`day365` ledger keys nothing could read; those same
windowed reports written outside `.ledger` entirely; dataset records keyed without a
window so a second window both collided *and* deleted the first.

**Still open, and the reason this plan exists:**

| Gap | Consequence today |
|---|---|
| `videos_analytics` fetches lifetime only (`startDate: "2000-01-01"`) | every video-scoped table/visual reports `not_synced` for 7/28/90/365 |
| traffic details + playlists not looped | ~16 traffic detail datasets are lifetime-only |
| Data visuals have no window control | 49 modules read `snapshot.selectedTimeWindow`, which nothing sets |
| `ChannelDataSyncControls` + canonical `actions.ts` have no window option | 2 of 3 controllers still can't choose windows |
| 3 stores, 2 row shapes | flat legacy fields + `datasetsByWindow` is a deliberate temporary compromise |
| No request budget | nothing stops a 5-window × 55-category run |

Counts this plan works against: **24 sync units · 55 categories · 42 tables · 49 visual
modules · 14 canonical sync modules · 3 stores.**

---

## 2. Skills and connectors

### Skills — already installed, no new ones needed

`.claude/skills/` carries 20 ViewTube skills. The ones that own this work:

| Skill | Role here |
|---|---|
| `viewtube-prince-observatory` | **lead** — VT-SYNC owns ingestion, analytics-canon owns consumer access |
| `viewtube-solution-finder` | gate on §5 — three solution classes, smallest that fits |
| `viewtube-widget-dashboard` | data visual controls, widget data states |
| `viewtube-mobile-widget-system` | window rails must survive phone width |
| `youtube-api-expert` | Analytics v2 quota, metric×dimension compatibility |
| `viewtube-verification-chancellor` | independent verification before merge |
| `viewtube-docs-grill` | stress-test this plan against repo docs before implementing |
| `dataviz` | **load before writing visual control UI** |

**Gap check (per `viewtube-skill-finder` step 4):** no existing skill owns
"analytics storage schema + migration." That responsibility currently lives in
scattered comments. §5 produces `docs/` architecture notes rather than a new skill —
a skill is warranted only if the basin outlives this migration and needs ongoing
governance. Revisit after Phase C.

### Connectors — already attached; none to add

| Connector | Relevance | Use |
|---|---|---|
| **Vercel** | high | preview deploys — the only way to verify DB v2 upgrade and window rails against a real browser |
| **GitHub** | high | the PR stack |
| **Neon** | **low for this work** | see §5.4 — the basin stays client-side |
| vidIQ | none here | competitor/outlier data, unrelated to first-party windows |
| Google Drive, Replit | none | — |

No connector needs attaching. Recommending Neon for the basin would be the wrong
call, and §5.4 says why.

---

## 3. Finish the fetch side (windows for every dataset)

### 3.1 `videos_analytics` per window — with a budget, not without one

This is the heaviest block in the engine: `ceil(videos/200)` batches ×
`DAILY_ANALYTICS_METRIC_BUNDLES` × windows. A 1,000-video channel at 5 windows is
**~5× today's largest cost**. It does not ship without §3.4.

Loop `localSyncEngine.ts:~2183` over `aggregateWindows`, replacing the
`startDate: "2000-01-01"` literal with `vtSyncWindowStartDate(window, channelStartDate)`,
and write results to `video.metricsByWindow[window]` — the field already added in
commit `80c1b48` and still unpopulated. Lifetime continues writing `video.metrics`.

The payoff is immediate and already wired: `projectVtSyncVideoToCanonicalRow` prefers
`metricsByWindow[window]` and flips rows from `lifetime_fallback` to `window_exact`,
which un-empties every video table and visual at once.

### 3.2 Traffic details and playlists

~16 traffic detail sources (`trafficDetailRegistry`) plus `playlists_analytics` follow
the §3 pattern of commit `d6102ee`. Traffic details paginate, so they are the second
most expensive family — same budget rules.

### 3.3 Canonical engine + the third controller

- `canonicalSync/actions.ts`: add `supportedWindows` / `defaultWindows` to
  `CanonicalActionDefinition`, and `runCanonicalAction(id, dropdownOption?, windows?)`.
  The per-module `windows` parameter already exists on all 14 modules.
- `SyncCoordinator.syncSegmentDatasets` (`:459`): loop windows; the hardcoded
  `window: "lifetime"` at `:482` becomes the real window.
- `ChannelDataSyncControls`: `SyncOptions.windows?: AnalyticsWindow[]`.

### 3.4 The request budget (blocking prerequisite for 3.1 and 3.2)

`adapters/windowBudget.ts`, sitting beside `quotaGuard.ts`:

```ts
estimateVtSyncRunCost({ categoryIds, windows, videoCount }): {
  requests: number            // class-B categories x windows (+ video batches)
  derivedCategories: number   // class A - free
  exceedsBudget: boolean
}
```

Rules:
1. Class-A categories never count (`VT_SYNC_DERIVED_WINDOW_CATEGORY_IDS`).
2. Over budget → run windows in priority order `lifetime → 28d → 7d → 90d → 365d`,
   mark the rest `pending`. **Never fail the run** — partial coverage is already a
   first-class state in the freshness model.
3. The controller's cost line (already built) reads the same estimator, so the number
   the user sees before the run is the number the engine enforces during it.

---

## 4. Finish the read side (windows everywhere they're consumed)

### 4.1 Data visuals — the last surface with no control

Current state, verified:

- `VtSyncVisualModuleSpec.controls` already declares `{ id: "window", kind: "select" }`
  for some visuals — but it is **metadata only**. `VtSyncVisualFrame` never renders it;
  its own `controls` prop is an unrelated chrome mode (`"menu" | "inline"`).
- `visualData.ts:466/504/562` reads `snapshot.selectedTimeWindow`, which
  `snapshot.ts:358` sets to `"lifetime"` once and nothing ever changes.
- `visualData.ts:11` **redeclares `AnalyticsWindow` locally** — a fourth copy of the
  vocabulary that Phase 0 missed. Fix first; it is a one-line import.

Work:
1. Point `visualData.ts` at `services/analytics/windows`; delete the local type.
2. Add a real `VtSyncVisualControlSpec` renderer to `VtSyncVisualFrame`, driven by the
   existing `controls` array so all 49 modules opt in declaratively rather than each
   building its own picker.
3. Route visual data through the same resolver the tables use, so a visual reports
   `derived` / `window_exact` / `not_synced` identically. **A chart that silently
   redraws lifetime data under a "28d" label is worse than a table doing it** — there
   is no column header to check.
4. Per `dataviz` + `viewtube-widget-dashboard`: empty, loading, partial, stale and
   `not_synced` are part of acceptance, at phone width too.

### 4.2 One shared view context

Per the architecture reference §4, tables, visuals, insights and Brain evidence should
consume one context rather than each holding its own `useState`:

```ts
type AnalyticsViewContext = {
  window: AnalyticsWindow | "custom"
  startDate?: string; endDate?: string
  comparison?: "none" | "previous_period" | "previous_year"
  filters: Record<string, string[]>
  provenance?: "all" | "api" | "csv"
}
```

Scope discipline: introduce it as a React context with the **current per-surface state
as its default**, migrate table → visuals → Brain one at a time. Do not rewrite all
three at once.

### 4.3 Table and visual registries

42 tables get a `window` column where the grain warrants it (only `channel_totals` has
one today). Visuals get `supportedWindows` in their spec so a window-invariant module
(e.g. channel identity) hides the control rather than showing a dead one.

---

## 5. The canonical data basin

### 5.1 The problem, stated as an observable

Today one logical fact — "views, geography, 28d" — can live in three places with three
shapes:

| Store | Shape | Written by |
|---|---|---|
| `VtSyncLocalDB` (IndexedDB v2) | flat legacy fields (lifetime) **+** `datasetsByWindow` | `localSyncEngine` |
| `ViewTubeCanonicalAnalyticsDB` (IndexedDB v5) | rows carrying `window` | `canonicalSync/*` |
| `localStorage` `yt_analytics_cache` + `yt_canonical_<channel>` | ledger keyed `source::context::dims::window` | `SyncCoordinator` |

Success condition: **one addressable location**, `(channelId, datasetId, window, grain)`
→ rows + provenance, that every tool reads without knowing which engine produced it.

### 5.2 Three solution classes

| | Scope | Reversibility | Risk | Verdict |
|---|---|---|---|---|
| **A. Reuse/repair** — keep 3 stores, add a read-through facade | small | high | facade hides but does not remove divergence; 3 write paths keep drifting | insufficient alone |
| **B. Consolidate/migrate** — one store, one shape, engines write through one writer, other stores deleted | medium-large | medium (needs migration + backfill) | real migration risk, mitigated by DB-version backfill already proven in v2 | **recommended** |
| **C. New implementation** — server-side basin in Neon | large | low-ish | new auth/privacy/cost surface; contradicts VT-SYNC-local; offline breaks | rejected — see 5.4 |

### 5.3 Recommended: B, executed as a facade that becomes the store

The sequencing matters more than the schema, because it is what prevents a fourth store.

**Phase A — read facade (additive, no migration).**
`services/analytics/basin/` exposes the single read API:

```ts
readBasin({ channelId, datasetId, window, grain? }): BasinResult
// BasinResult = { rows, window, resolvedWindow, source, provenance, syncedAt, coverage }
```

Internally it reads the three existing stores in priority order and normalizes. Nothing
is migrated. Consumers (tables, visuals, Brain, insights) move onto it one at a time.
This is Option A's facade, but explicitly as a *step*, not a destination — its value is
that it decouples consumer migration from storage migration.

**Phase B — single writer.**
All three engines write through `writeBasin(...)` instead of their own persistence. The
underlying store is still whichever exists; the write path is now one function with one
row shape and one identity rule `(channelId, datasetId, window, grain)`.

**Phase C — collapse the stores, and delete.**
Once every read goes through `readBasin` and every write through `writeBasin`, the
backing store becomes one IndexedDB database. Migration mirrors the v2 upgrade already
proven in `b2a7180`: version bump, backfill in the versionchange transaction,
put-before-delete, all-or-nothing.

Deletions that make this consolidation rather than accretion:
- `ViewTubeCanonicalAnalyticsDB` retired after its rows are migrated.
- `localStorage` ledger retired (it is a cache; it can be rebuilt by a sync).
- `snapshot.datasetsByWindow` **and** the flat legacy fields both collapse into basin
  rows — removing the two-shape compromise §1 flags.

**Phase D — optimize, only once correct.** Indices on `(channelId, datasetId, window)`,
lazy row hydration, and a retention policy for raw reports (keep lifetime + latest run).
Measure snapshot size before choosing; `datasetsByWindow` grows ~linearly with windows.

### 5.4 Why not Neon

`CLAUDE.md` documents a shared Neon database, and a server-side basin is superficially
attractive. It is the wrong call here:

- The data is **per-user first-party analytics already on the client**. Moving it server-side
  creates a privacy and auth surface that does not exist today.
- VT-SYNC is explicitly a *local* system; `privacyPolicy.ts` and `vtSyncLocalIsolation`
  encode that boundary.
- Offline and instant reads would regress — every table read becomes a network call.
- The Neon free plan caps the org at **10 database branches** and preview deploys already
  consume them (`CLAUDE.md`), so this would compete with deploys for a scarce resource.

Neon becomes the right answer when **cross-device sync or server-side AI over analytics**
is the requirement. Neither is in scope. Revisit then; do not pre-build for it.

---

## 6. Sequencing

| PR | Content | Depends on | Risk |
|---|---|---|---|
| 13 | `/code-review` fixes on the existing 12 commits | — | — |
| 14 | Window budget estimator + controller wiring | — | low |
| 15 | `videos_analytics` per window | 14 | **medium-high** (heaviest fetch) |
| 16 | Traffic details + playlists per window | 14 | medium |
| 17 | Canonical `actions.ts` + `SyncCoordinator` + `ChannelDataSyncControls` windows | — | low |
| 18 | `visualData` vocabulary fix + functional visual window control | — | medium |
| 19 | `AnalyticsViewContext`, tables migrated first | 18 | medium |
| 20 | Basin Phase A — read facade, consumers migrated incrementally | 19 | low (additive) |
| 21 | Basin Phase B — single writer | 20 | medium |
| 22 | Basin Phase C — collapse stores, **delete two of them** | 21 | **high** (data migration) |
| 23 | Basin Phase D — indices, retention, measured optimization | 22 | low |

PRs 13–19 deliver the user-visible feature. 20–23 are the structural payoff and can be
paused after 19 without leaving anything broken.

---

## 7. Verification

Per-PR: `npm run typecheck`, `npm run test`, `npm run check:architecture`,
`npm run check:css`, `npm run build`.

**Measure against `main`, never against zero.** `main` currently carries 56 type errors,
11 failing tests, and a broken build (two unresolved `editor-design-library` imports in
`TemplateLibraryPanel.tsx`, from commit `497c45f`, unrelated to this work). The gate is
*no new* errors/failures, established by diffing error sets — a count alone hides a swap.

Specific tests each phase owes:

- **Budget:** an over-budget run degrades to priority order and marks the rest pending;
  it never throws, and never counts class-A categories.
- **Video windows:** a video with 28d data reports `window_exact`; one without reports
  fallback; **neither reports a lifetime number labelled 28d.**
- **Visuals:** a chart at an unsynced window renders the `not_synced` state, not a
  redrawn lifetime series.
- **Basin:** every consumer returns identical rows through `readBasin` as it did through
  its old path (parity harness, run before Phase C deletes anything).
- **Migration:** seed a real pre-migration database, upgrade, assert rows survive, are
  re-keyed, and are superseded correctly by a later sync — the pattern already used in
  `localDbRepository.test.ts`.

**Not yet done and required before merge:** none of this branch has run against a real
channel. The DB v2 upgrade is proven only against `fake-indexeddb`; the window rails have
never been clicked in a browser. A Vercel preview pass covering (a) the v2 upgrade against
a real profile with existing synced data, (b) a windowed sync, and (c) each rail at phone
width is a merge gate, not a follow-up.

---

## 8. Risks

1. **A fourth store.** The single mitigation is that every basin phase names deletions,
   and Phase C does not complete until two stores are gone. Judge progress by stores
   removed, not code added.
2. **Quota.** `videos_analytics` × 5 windows is the single largest cost increase in the
   plan. It ships behind the budget or not at all.
3. **Snapshot size.** Windows multiply stored rows roughly linearly. Measure before
   defaulting to more than two.
4. **Migration.** Phase C moves real user data. Same pattern as v2, plus the parity
   harness from §7 run *before* any delete.
5. **Metric × dimension × window incompatibility.** Short windows behave differently for
   some pairs; route failures through `analyticsMetricSanitizer` and reason codes rather
   than try/catch at call sites.
6. **Scope.** PRs 20–23 are architecture, not feature. If the feature is what's wanted,
   stop cleanly after 19.
