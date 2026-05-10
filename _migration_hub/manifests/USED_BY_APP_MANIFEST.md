# USED_BY_APP_MANIFEST

Purpose: enumerate active runtime entrypoints and their canonical data dependencies before pruning.

## Route Entrypoints (source: `src/app/AppRoutes.tsx`)
- `/` -> `Dashboard`
- `/studio` -> `StudioHub`
- `/performance` -> `PerformanceHub`
- `/analytics` -> `SimpleAnalytics`
- `/projects` -> `Projects`
- `/settings` -> `Settings`
- `/shorts` -> `ShortsStudio`
- `/project-calendar` -> `ProjectCalendarPage`
- `/reference-studio/:tabId` -> `ReferenceStudio`
- `/charts-gallery` -> `ChartsGalleryHome`
- `/charts-gallery/master-graphs` -> `MasterGraphsPage`

## Canonical Analytics Data Path (production path target)
- Contract: `src/services/analyticsContract.ts`
- Selectors: `src/services/analyticsSelectors.ts`
- Main selectors:
  - `getMasterRows(window, sourceMode, csvFiles)`
  - `getMetricSummary(window, sourceMode, csvFiles)`
  - `canonicalRowsToMasterTableRows(rows)`

## Reference Studio Consolidation Tabs (source: `src/views/ReferenceStudio.tsx`)
- `toolbox-system`
- `component-grid`
- `section-sources-lab`
- `component-catalog`
- `chart-catalog`
- `chart-spec-implementation`
- `toolbox-recreation`
- `analytics-lab`
- `thumbnail`
- `library`
- `native`
- `legacy`

## Active Consumers (confirmed by import/reference scan)
- `src/views/Dashboard.tsx` -> `getMetricSummary`
- `src/views/PerformanceHub.tsx` -> `getMasterRows`, `getMetricSummary`
- `src/views/SimpleAnalytics.tsx` -> `getMasterRows`, `getMetricSummary`
- `src/views/DataVizualizations.tsx` -> `getMasterRows`
- `src/views/Channelytics.tsx` -> `getMasterRows`
- `src/components/SimpleAnalyticsChart.tsx` -> `getMasterRows`
- `src/components/DataDashboard.tsx` -> `getMasterRows`, `getMetricSummary`
- `src/views/referenceStudio/useCanonicalAnalytics.ts` -> `getMasterRows`, `getMetricSummary`
- `src/views/referenceStudio/ChartCatalog.tsx` -> canonical hook consumer
- `src/views/referenceStudio/ChartSpecImplementation.tsx` -> canonical hook consumer
- `src/views/referenceStudio/ToolboxRecreation.tsx` -> canonical hook consumer

## Guardrail
Any analytics-related file move must preserve the selector contract above; duplicate computation paths should be archived only after consumers are migrated.

## 2026-04-08 Recovery Pass Addendum
- New source-scoped runtime module:
  - `src/views/referenceStudio/sourceModules.tsx`
- Active consumers:
  - `src/views/referenceStudio/SectionSourcesLab.tsx`
  - `src/views/referenceStudio/ComponentCatalog.tsx`
  - `src/views/referenceStudio/ToolboxRecreation.tsx`
- Chart contract consumer updates:
  - `src/views/referenceStudio/chartSystem.tsx` -> explicit chart key/renderer map, deterministic adapters, solid-grid style tokens.
- Performance contract consumer updates:
  - `src/views/PerformanceHub.tsx` -> dataset table contracts (`master`,`daily`,`traffic`,`audience`,`country`,`device`) + metric applicability policy.
  - `src/views/SimpleAnalytics.tsx` -> solid-grid cursor style compliance.
- Video manager sync contract update:
  - `src/views/VideoManager.tsx` -> post-sync list refresh path used by `yt_analytics_synced` listener.

## 2026-04-08 Completion Ledger (append-only)

### not_started
- Full dependency-minimization reconciliation pass (`package.json` + lockfile diff -> clean reinstall -> runtime validation) remains pending.
  - Evidence path: `/Users/cwb/Downloads/viewtube/package.json`
  - Evidence path: `/Users/cwb/Downloads/viewtube/package-lock.json`

### in_progress
- Strict visual source-fidelity parity for every extracted component is in progress (all IDs mapped, visual parity still iterative for some modules).
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/referenceStudio/sourceModules.tsx`
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/referenceStudio/SectionSourcesLab.tsx`
- Full cross-page canonical analytics migration for all legacy chart consumers is in progress (reference pages and performance data-viz updated; legacy chart engine remains in repo).
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/referenceStudio/chartSystem.tsx`
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/PerformanceHub.tsx`
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/components/ChartEngine.tsx`

### finished
- NativeUIKit leakage removed from new recovery pages (`section-sources-lab`, `component-catalog`, `toolbox-recreation`).
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/referenceStudio/SectionSourcesLab.tsx`
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/referenceStudio/ComponentCatalog.tsx`
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/referenceStudio/ToolboxRecreation.tsx`
- Source component contract coverage currently mapped 78/78 IDs in runtime layer.
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/referenceStudio/sourceModules.tsx`
  - Evidence path: `/Users/cwb/Downloads/viewtube/_migration_hub/manifests/SOURCE_COMPONENT_MAP.md`
- Performance data-viz removed old Google-style `ChannelyticsChartToolbox` embed path.
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/PerformanceHub.tsx`
- Canonical collapse indicator enforcement updated to symbol indicator path for accordion wrappers.
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/components/Toolbox.tsx`
- Video Manager sync event now hydrates list path directly from sync payload before refresh fetch fallback.
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/VideoManager.tsx`

### blocked
- Project-wide strict type build remains blocked by pre-existing non-feature TS debt outside recovery scope.
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/components/ChartEngine.tsx`
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/ResearchLab.tsx`
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/ThumbnailStudio.tsx`

## 2026-04-10 Final Closeout Ledger Update (append-only)

### not_started
- Full dependency-minimization execution (`package.json`/lockfile reconcile -> clean reinstall -> full route validation) remains pending.

### in_progress
- Repository-wide strict TS debt cleanup is still in progress and explicitly outside feature-scope completion for this pass.

### finished
- `sourceModules.tsx` strict-fidelity upgrade pass completed for remaining stand-ins while preserving 78/78 source IDs.
- Active reference/performance chart surfaces now enforce solid low-opacity grid/cursor styles with no dashed/dotted patterns.
- No NativeUIKit leakage introduced into `section-sources-lab`, `component-catalog`, or `toolbox-recreation`.

### blocked
- Full green `npm run build` remains blocked by pre-existing cross-repo TS issues unrelated to this closeout scope (documented in ACTION_LOG build output).

## 2026-04-11 Additions (append-only)
- `src/views/referenceStudio/WidgetLab.tsx` — active route surface via `ReferenceStudio` tab `widget-lab`.
- `src/views/referenceStudio/widgetContracts.ts` — widget promotion and backend status contracts consumed by Widget Lab.
- `src/services/externalIngestSources.ts` — connector readiness contract consumed by Reference Analytics Lab in `ReferenceStudio.tsx`.
- `src/services/analyticsContract.ts` — expanded with ingest/capability contract registry used by `youtubeService.ts` metric filtering.
## 2026-04-11 UI Stabilization Addendum (append-only)

### finished
- Reference Studio shell controls now use canonical 4-arrow animated toggle behavior in scoped primitives.
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/referenceStudio/ReferenceStudioPrimitives.tsx`
- Scope isolation hardening applied to main/sub shells and source frame wrappers.
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/referenceStudio/ReferenceStudioPrimitives.tsx`
- Channel Intelligence default range in Reference Analytics Lab locked to `lifetime`.
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/ReferenceStudio.tsx`

### in_progress
- Full visual parity migration of all reference pages to ToolboxUISystem shell tokens remains in progress.
  - Evidence path: `/Users/cwb/Downloads/viewtube/src/views/referenceStudio/*.tsx`
