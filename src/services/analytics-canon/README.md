# analytics-canon — the single source of truth for analytics data

Every consumer that reads analytics/channel data — the Dashboard, Channelytics, PerformanceHub (until it's retired), every tool view, the AI/brain code paths — reads through this namespace. The data underneath comes exclusively from **VT Sync Local** (the `/analytics` page's store).

## Why this exists

Historically the app had two parallel stores:

- **Legacy** — `services/analytics/{DataStore,Selectors}.ts` + `SyncCoordinator` + `coreLifetimeSync`, backed by localStorage under `yt_analytics_cache`. Populated by the Performance Hub pipeline.
- **New** — `features/vt-sync-local/adapters/snapshot.ts`, backed by an in-memory + IndexedDB store. Populated by the VT Sync bundles the user sees on `/analytics`.

The homepage was reading from both. Every setState on the legacy path fanned out into re-renders that reached the vt-sync-subscribed widgets too — the mobile-freeze storm we hunted down came from exactly this coupling.

**Direction:** VT Sync is the source of truth. Legacy is being retired. This module is the shape adapter that lets us migrate consumers one file at a time without a big-bang cutover.

## Migration cheat sheet

| Legacy API | Canonical replacement |
| --- | --- |
| `getMasterRows(window, "hybrid", brain.csvFiles)` | `useCanonicalRows(window)` |
| `getMetricSummary(window, "hybrid", brain.csvFiles)` | `useCanonicalMetricSummary(window)` |
| `readYouTubeAnalyticsCache().profile` | `useCanonicalChannelIdentity()` |
| Any imperative call from a service | `getCanonicalRowsFromVtSync(getVtSyncSnapshot(), window)` |

The `brain.csvFiles` argument is gone. Under the legacy path CSVs were a separate data source that had to be merged with API results at read-time; VT Sync's dataset ingest handles CSV as just another bundle that lands in the snapshot. Consumers no longer manage CSV bookkeeping.

## What's in each file

| File | Purpose |
| --- | --- |
| `contracts.ts` | Type re-exports. Consumers depend on THESE types, not the legacy ones. When the legacy files are deleted, only the runtime disappears — the types keep their canonical home here. |
| `vtSyncAdapter.ts` | Pure, side-effect-free reshape of `VtSyncSnapshot` into `CanonicalVideoRow[]` / `MetricSummary` / `WindowTotals`. Safe to call from anywhere (tests, workers, AI code). |
| `useAnalytics.ts` | React hooks — `useCanonicalRows`, `useCanonicalMetricSummary`, `useCanonicalWindowTotals`, `useCanonicalChannelIdentity`. Each subscribes to the vt-sync snapshot version and memoizes per-window so `React.memo` boundaries stay stable. |
| `vtSyncAdapter.test.ts` | Shape parity tests — proves the adapter emits every field legacy consumers expect. |
| `index.ts` | Public barrel — the ONLY entry point. If it's not re-exported here, it's not part of the canonical API. |

## Rules

1. **Consumers import from `services/analytics-canon` only.** Never from `services/analytics/*` directly. When we grep for legacy imports at retirement time, this is what makes the sweep straightforward.
2. **No consumer touches VT Sync internals directly** (`getVtSyncSnapshot`, `subscribeToVtSyncSnapshot`) for analytics data. Go through this module — the adapter is where the shape stability lives.
3. **The adapter stays pure.** No React, no side effects, no fetching. That's why it's testable, worker-safe, and cheap.
4. **Additive changes only until Phase 5.** During the migration we don't rename or move legacy files; we just steer consumers toward this module. Deletions land in Phase 5 after all consumers are cut over.

## Migration phases

- **Phase 0** — Foundation (this module lands, zero consumer changes). ← *you are here*
- **Phase 1** — Dashboard: `useDashboardData` + `DashboardCanvas` widgets drop legacy imports for canonical hooks.
- **Phase 2** — Auth adapter: `GlobalDataContext.hydrateAuthStateFromAnalyticsCache` becomes `hydrateAuthStateFromVtSync`, sourcing channel identity from `useCanonicalChannelIdentity`.
- **Phase 3** — Tool views: Channelytics, MediaAnalyzer, HookGenerator, ThumbnailStudio, VideoPublisher, PerformanceHub-as-consumer, etc.
- **Phase 4** — AI/brain: `bootstrapFirstRunBrain`, `AIBrainCommandInterface`, `BrainCommandCenter` read from vt-sync via this module.
- **Phase 5** — Retire legacy: delete `services/analytics/DataStore.ts`, `Selectors.ts`, `services/SyncCoordinator.ts`, `services/youtube/coreLifetimeSync.ts`; loosen `vtSyncLocalIsolation.test.ts` (or rewrite it as a legacy-import-forbidden test in the OTHER direction).

## When you add a new field

1. Add it to `VtSyncSnapshot` (or the relevant VT Sync record type) so the data actually lands in the store.
2. Add a projection in `vtSyncAdapter.ts` if it's a video-row field, or a new selector if it's an aggregate.
3. Add a hook in `useAnalytics.ts` if consumers will read it directly.
4. Add a test in `vtSyncAdapter.test.ts` that asserts the shape.
5. Re-export from `index.ts`.

## When you migrate a consumer

1. Delete every `import { ... } from "services/analytics/DataStore"` and `"services/analytics/Selectors"`.
2. Delete `brain.csvFiles` arguments — they're not part of the canonical API.
3. Replace with the equivalent hook / function from `services/analytics-canon`.
4. Add a test if none exists.
5. If the consumer had a `useEffect` listening to `yt_analytics_synced` or `vt_local_data_changed`, delete it — canonical hooks re-render automatically when vt-sync mutates.
