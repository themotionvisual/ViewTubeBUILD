# Migration to /analytics (VT Sync) as the source of truth

**Purpose.** ViewTube's analytics data, auth signals, and legacy Performance-Hub-era tools currently live across three parallel systems. This directory tracks the migration to a single source of truth: **VT Sync Local (`/analytics`)** for data, and a single unified auth signal for identity.

Dataset expansion planning for playback details, playback locations, traffic-source parity, selected-video deep dives, standard time windows, and content-owner uploader filters lives in [`docs/analytics/YOUTUBE_ANALYTICS_DATASET_EXPANSION_PLAN.md`](../analytics/YOUTUBE_ANALYTICS_DATASET_EXPANSION_PLAN.md). Its machine-readable implementation inventory is [`docs/analytics/youtube-analytics-dataset-expansion-matrix.csv`](../analytics/youtube-analytics-dataset-expansion-matrix.csv).

This document is the north star. Every migration PR is scoped from here. Every feature we discover during migration gets logged here so nothing gets dropped by accident.

## Status snapshot (2026-08-24)

| Track | Foundation | Consumers migrated | Legacy retired |
| --- | --- | --- | --- |
| **analytics-canon** | ✅ Phase 0 shipped ([PR #34](https://github.com/themotionvisual/ViewTubeBUILD/pull/34)) | Intelligence Hub migrated locally; 34 legacy-importing files remain | — |
| **auth-canon** | ✅ Phase 0 shipped ([PR #36](https://github.com/themotionvisual/ViewTubeBUILD/pull/36)) | 0 / 48 | — |

Surgical unblock fixes already shipped so mobile users can keep using the app during the migration:
- [PR #33](https://github.com/themotionvisual/ViewTubeBUILD/pull/33) — GlobalDataProvider render storm (1,000+ renders/sec) broken by stabilizing `hydrateAuthStateFromAnalyticsCache`
- [PR #35](https://github.com/themotionvisual/ViewTubeBUILD/pull/35) — auth invalidation now actually clears the token; VerificationExplainerWidget hides when connected

## The five phases (per track)

Each track has the same structure. Consumer migration is the long tail — plan for a lot of small PRs.

| Phase | analytics-canon | auth-canon |
| --- | --- | --- |
| 0 — Foundation | ✅ `src/services/analytics-canon/` | ✅ `src/services/auth-canon/` |
| 1 — Dashboard | `useDashboardData` + `DashboardCanvas` widgets | `AppShell`, `AdaptiveNavigationShell`, `DashboardHeader` |
| 2 — Provider adapter | `GlobalDataContext.hydrateAuthStateFromAnalyticsCache` → vt-sync | `GlobalDataContext.authState.isAuthenticated` sourced from auth-canon |
| 3a — **Intelligence Hub extraction** | ✅ Embedded at `/analytics#intelligence` (own `ToolboxScaffold`), top-level `/intelligence` route + pageRegistry entry, canonical 34-dataset evidence + Brain persistence, PerformanceHub mount removed (governance test enforces) | — |
| 3b — **CSV pipeline extraction** | Surface CSV upload/detect/merge inside `/analytics`; preserve auto-detection UX | — |
| 3c — Tool views | Channelytics, MediaAnalyzer, HookGenerator, ThumbnailStudio, VideoPublisher, SEOGenerator, Subscribe, Settings | All 48 useBrain() consumers |
| 4 — AI / brain | `bootstrapFirstRunBrain`, `AIBrainCommandInterface`, `BrainCommandCenter`, `DailyAdviceWidget` | Same set — auth signals from auth-canon |
| 5 — Retire legacy | Delete `services/analytics/{DataStore,Selectors}.ts`, `SyncCoordinator.ts`, `coreLifetimeSync.ts`; delete PerformanceHub after 3a+3b land; loosen `vtSyncLocalIsolation.test.ts` | Delete duplicate auth-check sites; keep `unifiedAuth` as the auth *service* but not a consumer-facing API |

## Consumer migration surface

Real numbers from `rg` over `src/`:

- **48 files** call `useBrain()` (GlobalDataContext consumers → auth-canon targets)
- **34 files** still import from `services/analytics/{Selectors,DataStore}.ts` after the Intelligence Hub cutover (analytics-canon targets; recounted 2026-08-24)
- Overlap is significant — a file often needs both migrations, so grouping them per PR is efficient.

Priority order (from user-visible impact to internals):
1. Homepage — `useDashboardData`, `DashboardCanvas`, `WidgetRenderer` (26 widgets)
2. Nav shell — `AppShell`, `AdaptiveNavigationShell`, `DashboardHeader`, `AccountActionButton`
3. Core tool views — `Channelytics`, `PerformanceHub`, `MediaAnalyzer`, `HookGenerator`, `ThumbnailStudio`, `VideoPublisher`, `SEOGenerator`
4. AI / brain — `AIBrainCommandInterface`, `BrainCommandCenter`, `DailyAdviceWidget`, `bootstrapFirstRunBrain`
5. Utilities / editors — `EditorV1Page`, `StoryboardStudio`, `MediaAnalyzer`, `ProjectStudio`
6. Everything else in the 48 (peripheral widgets, settings screens, subscribe flow)

## Features worth preserving from Performance Hub era

Discovered by reading `src/views/PerformanceHub.tsx` (5,855 lines) and comparing against the current `/analytics` page. Items marked ⚠ are things the new page does not yet have.

### Table controls
- **Time-window picker** (7d / 28d / 90d / 365d / lifetime) — present in PerformanceHub, not visible on the vt-sync data table shell as a first-class control. `VtSyncToolboxDataTable` has `selectedTimeWindow` in state but no window picker in the toolbar. ⚠
- **Source-mode toggle** (api / csv / hybrid) — present in PerformanceHub. VT Sync deliberately dropped CSV as a separate mode (CSVs are ingested as bundles), so this shouldn't be recreated — but a "which source populated this row" indicator is worth adding.
- **Format filter** (short / long / live) — ✅ VT Sync has this in the table toolbar (`formatFilter` state).
- **Column filters per column** — ✅ VT Sync has this (`columnFilters` record).
- **Search across rows** — ✅ VT Sync has this.
- **Column pinning (left / right)** — ✅ VT Sync has this via `pinned` in `VtSyncTableColumnDefinition`.
- **Column visibility (show / hide)** — ✅ VT Sync has this via `defaultVisible` + toolbar toggles.
- **Sort by column** — ✅ VT Sync has this.
- **Export to CSV / JSON** — ✅ VT Sync has this via `exportName` and per-column `format`.
- **Row-level exclude/include checkboxes** (bulk selection) — PerformanceHub has patterns for this. VT Sync table needs verification. ⚠ (to confirm)
- **Metric availability coverage indicator** — PerformanceHub renders `MetricAvailability` per metric. VT Sync has `datasetFreshness` per dataset which is coarser. Worth mirroring per-metric coverage. ⚠

### Data-shape features
- **Hybrid API+CSV merge** (`mergeRowsForHybrid`) — deliberately not recreated in vt-sync. CSVs are ingested as bundles.
- **`VideoStatsVerificationSummary`** — PerformanceHub verifies "did the sync succeed? are metrics mapped?" and shows a health panel. VT Sync surfaces sync-run status but not per-metric mapping verification. Worth adding as a diagnostic dashboard within `/analytics`. ⚠
- **`buildTableMetricMappingStatus`** — PerformanceHub's "healthy / request_failure / missing_upstream / mapping_failure" per-table status. Same as above — worth mirroring. ⚠
- **`DatasetCoverageSummary`** — dataset-level coverage panel. Partial vt-sync equivalent via freshness. Worth strengthening. ⚠

## Tools / features to migrate (from user's list)

### Confirmed live surfaces (need proper migration)
- **PerformanceHub** (`/performance` → `src/views/PerformanceHub.tsx`, 5,855 lines) — the monolith itself. Big migration. Split into digestible sub-features.
- **Channelytics** (`/legacy/channelytics` → 535 lines) — old channel analytics view. Already "legacy" in the route path. Assess whether to migrate or delete.
- **MediaAnalyzer** (`/media-analyzer` → 655 lines) — asset/media inspection.
- **HookGenerator** (`/hook-generator` → 256 lines) — AI hook generator.
- **ThumbnailStudio** — route redirects to `/reference-studio/thumbnail-studio`.
- **SEOGenerator** (`/seo-generator`) — SEO metadata generator.
- **VideoPublisher** (`/video-publisher`) — publish flow.

### Deprecated / already re-homed (verify then delete)
- **Algorithm Architect** (`/algorithm-architect` → redirects to `/ai-brain?ask=algorithm-diagnosis`) — the route is a `<Navigate>`. The 345-line file `AlgorithmArchitect.tsx` may be dead code. **Action:** confirm no imports, then delete.
- **DashboardLegacy** (`/dashboard-legacy`) — kept behind a flag. Retirement candidate once new Dashboard is confirmed stable.

### The two critical extractions (per user 2026-08-24)

Both of these live inside PerformanceHub today. Retiring PerformanceHub without extracting them first would kill core features. These become their own migration phases, not consumer PRs.

**A — Intelligence Hub** (`src/components/IntelligenceHub/IntelligenceHub.tsx`)
- The AI-powered report generator. **This is where "Oracle", "Executive Summary", "Channel Report", "Algorithm Diagnosis", and "Keyword Analysis" actually live** — types in `IntelligenceHub/types.ts` include `OracleReport`, `AlgorithmDiagnosis`, `KeywordAnalysis`, `UltimateChannelReport`.
- Canonical owner is now the lazy, closed-by-default toolbox at `/analytics#intelligence`, mounted after the VT-SYNC data table and before Data Visuals.
- The Analytics boundary derives exactly 34 active datasets from `VT_SYNC_VISIBLE_TABLE_DEFINITIONS`, preserves source/freshness/unavailable states, and builds bounded evidence only when generation is requested.
- Scoped report history uses `vt_ultimate_channel_report_v1:{channelId}` and `vt_ultimate_generation_history_v1:{channelId}`. The old unscoped report key remains readable as a legacy artifact but is never attached to a channel or written into Brain automatically.
- Emit signal: `vt_generate_ultimate_report`.
- Report generation no longer imports `services/analytics/Selectors` or reads `yt_analytics_cache`. It consumes one pinned `CanonicalIntelligenceEvidenceBundle`, preserves the 12-section generation lifecycle and 14 rendered report blocks, and marks `/analytics` as authoritative.
- Before generation it consults channel-scoped Brain context; after generation it persists `BrainGenerationRecord`, `ChannelKnowledgeModel`, and `ToolContextPack`. Channel/snapshot mismatch rejects the write while retaining the report.
- Performance Hub no longer mounts a duplicate report generator; its Intelligence toolbox is a compatibility handoff to `/analytics#intelligence` while the rest of the monolith remains available.
- **Remaining gate:** authenticated real-data browser run and protected preview validation. Production promotion is manual.

**B — CSV Upload / Type Detector / Merge System** (5 files, 2,289 lines)
- [`csvImportDetector.ts`](src/services/csvImportDetector.ts) — 403 lines. Auto-detects CSV category from headers, returns `CsvImportDetection` with confidence + merge target.
- [`csvTaxonomy.ts`](src/services/csvTaxonomy.ts) — 983 lines. The full CSV family/type registry (upload types, families, tags).
- [`csvImportUtils.ts`](src/services/csvImportUtils.ts) — 380 lines. Import helpers.
- [`csvPackageIngestion.ts`](src/services/csvPackageIngestion.ts) — 526 lines. Bundle ingestion.
- [`trafficCsvMerge.ts`](src/services/canonicalSync/trafficCsvMerge.ts) — 197 lines. Merges CSV into vt-sync (already in the canonicalSync namespace).
- **Migration phase:** Expose CSV upload + type-detect + merge as a first-class action inside `/analytics` (probably next to the existing sync bundles). Preserve the auto-detection UX so users don't have to categorize their downloads manually.

### Types-only ghosts (verified — these ARE the Intelligence Hub's contents)

The types `OracleState`, `ChannelOraclePromptVersion`, `ExecutiveSummary`, `ChannelReport` and friends live in `src/types.ts`. They aren't dead — they're the report shapes the Intelligence Hub produces. Migrating the Intelligence Hub (item A above) is what preserves them.

### Deprecated tools (verified dead-ends)
- **AlgorithmArchitect** (`/algorithm-architect`) — route is a `<Navigate to="/ai-brain?ask=algorithm-diagnosis" replace />`. The AI Brain surface owns this now.
- **DashboardLegacy** — kept behind flag, retirement candidate once new Dashboard stabilizes.

### AI / brain surfaces
- **AIBrainCommandInterface** (`/ai-brain` → 1,171 lines) — the current AI brain hub. Absorbed the Algorithm Architect flow. Reads from GlobalDataContext (`authState.isAuthenticated`). Needs auth-canon migration and analytics-canon migration.
- **BrainCommandCenter** — separate view that reads useBrain(). Assess overlap with AIBrainCommandInterface.
- **DailyAdviceWidget** — AI-powered daily brief on the dashboard. Reads `authState.isAuthenticated`.

## How each migration PR should look

1. **One PR = one migration boundary.** Either "consumer X moves off legacy" or "phase Y foundation lands". Never both.
2. **Purely additive first.** Foundation PRs (`analytics-canon`, `auth-canon`) added namespaces without touching consumers.
3. **Consumer PRs delete legacy imports.** After Phase 0, every consumer PR should reduce the legacy import count. Grep `rg -l "from.*services/analytics/(Selectors|DataStore)" src/` before and after — the after must be smaller.
4. **Shape-parity test if new hooks are added.** Any new hook exposed from a `-canon` namespace gets a test in that namespace's `*.test.ts`.
5. **PR body links here.** The PR body always cites the phase from this document.
6. **Update this document.** Every merged consumer PR bumps the "consumers migrated" count in the Status snapshot table above.

## What to add to this document as we go

- Each Phase-1+ PR appends its name + link to a "History" section at the bottom.
- Every previously-unlisted tool discovered during a migration goes in "Tools / features to migrate".
- Every UX control we discover missing between PerformanceHub and vt-sync gets added to "Table controls" with a ⚠.
- Every consumer that turns out to be dead code goes in "Deprecated / already re-homed".

## History

- 2026-08-24 — Intelligence Hub Phase 3a implemented locally: 34-dataset analytics-canon evidence, `/analytics#intelligence` lazy toolbox, channel-scoped Brain loop, and Performance Hub compatibility handoff. Focused tests and production build pass; authenticated preview remains open.
- 2026-08-24 — [PR #36](https://github.com/themotionvisual/ViewTubeBUILD/pull/36): auth-canon Phase 0 foundation (`useAccountStatus()`).
- 2026-08-24 — [PR #34](https://github.com/themotionvisual/ViewTubeBUILD/pull/34): analytics-canon Phase 0 foundation.
- 2026-08-24 — [PR #35](https://github.com/themotionvisual/ViewTubeBUILD/pull/35): surgical fix — auth invalidation clears token; VerificationExplainerWidget gated by connection state.
- 2026-08-24 — [PR #33](https://github.com/themotionvisual/ViewTubeBUILD/pull/33): render-storm root cause fix in GlobalDataContext (stabilize `hydrateAuthStateFromAnalyticsCache`).
