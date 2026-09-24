# ViewTube Analytics / VT-SYNC — Master Resource

**Status:** Canonical living analytics architecture / migration authority  
**Created:** 2026-09-24  
**Last audited main:** `0c4610629bfba98ffc0703a42e422352d5f31514`  
**Canonical owner / concern:** Analytics data ownership, VT-SYNC dataset/sync contracts, analytics-canon consumer boundary, time-window semantics, Data Visual contract boundaries, and legacy analytics migration state.  
**Executable authorities:** `src/features/vt-sync-local/**`, `src/services/analytics-canon/**`, `src/services/analytics/windows.ts`, and their contract tests.  
**Related scoped authorities:** `docs/migration/data-visual-canvas-contract.md` owns bounded Data Visual canvas geometry; `docs/MOBILE_VISUAL_RESPONSIVE_CONTRACT.md` owns Analytics Data Visual responsive composition; controller and mark-scale documents remain active implementation plans.

## 1. Governing architecture

ViewTube analytics has four distinct layers. They must not be collapsed into parallel stores or competing registries.

```text
YouTube / imported evidence
        ↓
VT-SYNC Local
raw rows + manifests + sync registries
        ↓
analytics-canon
normalized public consumer API
        ↓
Dashboard / Analytics / Brain / tools
        ↓
Data Visual contracts
presentation only; never a metric store
```

### Canonical ownership

| Concern | Owner |
| --- | --- |
| Raw synced analytics evidence | VT-SYNC Local |
| Selectable/visible dataset definitions | `VT_SYNC_VISIBLE_TABLE_DEFINITIONS` |
| Sync operations and dataset ownership | VT-SYNC sync/category/report registries |
| Consumer-facing normalized analytics | `services/analytics-canon` public barrel |
| Analytics window vocabulary/ranges | `src/services/analytics/windows.ts` |
| Intelligence evidence manifest | `analytics-canon/intelligenceEvidence.ts` |
| Data Visual bounded canvas | `data-visual-canvas-contract.md` + production `DataVisualCanvas` |
| Data Visual phone/desktop responsive intent | `MOBILE_VISUAL_RESPONSIVE_CONTRACT.md` + `VtSyncVisualFrame` |
| Data Visual controller migration | `data-visual-controller-unification-plan.md` until complete |
| Dashboard widget identity | Dashboard `WidgetRegistry.ts`, not Analytics docs |

No page, widget, Brain service, or visualization should invent another analytics truth store.

## 2. Audited production state

The following is code-backed on main `0c4610629bfba98ffc0703a42e422352d5f31514`.

### Dataset and evidence system

- `VT_SYNC_VISIBLE_TABLE_DEFINITIONS` is the canonical visible-table registry.
- The Intelligence evidence boundary currently enforces **34 active datasets** through `CANONICAL_INTELLIGENCE_DATASET_COUNT`.
- A versioned Analytics report registry exists in production: **registry v1 with 27 report definitions** on the audited main.
- Table/category/sync registries derive visible and selectable Analytics behavior instead of requiring copied documentation inventories.
- Dataset expansion is additive. The current 34-dataset Intelligence compatibility contract must not be silently renumbered or replaced.

### Window system

The canonical production window vocabulary is:

```text
7d · 28d · 90d · 365d · lifetime
```

`src/services/analytics/windows.ts` owns that vocabulary and the complete-row end-date rule.

Implemented foundations include:

- VT-SYNC re-exports the canonical AnalyticsWindow type instead of redeclaring it.
- VT-SYNC Local IndexedDB v2 adds the analytics window to persisted dataset identity.
- `VtSyncSnapshot.datasetsByWindow` stores non-lifetime aggregate windows without corrupting lifetime compatibility fields.
- video records can carry `metricsByWindow`.
- analytics-canon projects requested-window video metrics and explicitly labels `window_exact`, `lifetime_fallback`, or `unavailable`.
- `getCurrentCanonicalIntelligenceEvidence()` now provides a public imperative analytics-canon evidence entry point for non-React consumers such as BrainRuntime, so Brain services do not need to reach into VT-SYNC internals.
- selected Analytics time-window state is present in the VT-SYNC snapshot/tooling.

Still open:

- `custom` is **not** part of the canonical `AnalyticsWindow` type.
- not every legacy consumer reads the canonical per-window path.
- legacy Analytics selectors/cache consumers remain in production code.
- dataset-specific window coverage still varies and must respect API/report capabilities.

### Data Visual system

Production currently includes:

- `DataVisualCanvas`;
- **8 registered Data Visual canvas contracts** in `DATA_VISUAL_MODULE_CONTRACTS`;
- `VtSyncVisualFrame` as the responsive boundary;
- reusable mobile responsive presets;
- shared `VisualControllerRail` placement for the declarative Analytics shells.

Migration is not finished:

- the legacy `data-visual-preview-16x9.js` compatibility layer is still loaded;
- `controllerSpec` still exists in live Analytics shell code;
- not every visualization is fully registry-native;
- controller vocabulary/orientation cleanup and mark-scale migration remain active work.

## 3. Analytics consumer rule

All new analytics consumers should use `services/analytics-canon`.

New code must not:

- read `yt_analytics_cache` as canonical analytics truth;
- import legacy `services/analytics/Selectors` or `DataStore` for new functionality;
- infer dataset support from UI labels;
- treat an unavailable/missing window as numeric zero;
- filter video analytics by upload date as a substitute for metric-window data;
- merge rows from different windows into one anonymous array.

Legacy consumers remain a migration problem, not permission for new legacy reads.

## 4. Dataset expansion contract

`YOUTUBE_ANALYTICS_DATASET_EXPANSION_PLAN.md` remains the active expansion plan.

Current boundaries:

1. keep the 34-dataset Intelligence compatibility contract stable while adding registry capabilities;
2. use the v1 report registry as the production foundation;
3. add/validate datasets through explicit scope, dimensions, metrics, window strategy, capability, pagination and provenance;
4. distinguish channel, selected-video and content-owner capability;
5. preserve successful existing rows when another page/window fails;
6. never present capability-required or unsupported reports as empty data;
7. require real-account validation for combinations that public documentation alone cannot prove.

The supporting CSV matrix is a planning/reference matrix, not production truth.

## 5. Time-window migration contract

`TIME_WINDOW_IMPLEMENTATION_PLAN_2026-09-11.md` remains an implementation program because its foundation is partly shipped and its consumer migration is incomplete.

Current rule:

- **day-grained facts** may derive shorter windows from canonical dated facts when mathematically valid;
- **aggregate/ranked/ratio reports** require an exact window query or an explicitly labeled fallback;
- **window-invariant/restricted datasets** declare that fact rather than fabricating unsupported windows;
- percentages/ratios are never summed across windows.

The production range resolver ends at the latest complete Analytics day rather than a partial "today" row.

## 6. Data Visual authority boundaries

### Canvas

`data-visual-canvas-contract.md` is the canonical scoped canvas contract. One component owns a visual canvas. Migrated renderers must not fight parent shells, preview CSS, and renderer-local pixel heights simultaneously.

### Responsive composition

`MOBILE_VISUAL_RESPONSIVE_CONTRACT.md` is the canonical scoped phone/desktop responsive contract for Analytics Data Visuals.

It does **not** define Studio Toolbox geometry, Dashboard widget buckets, or arbitrary page-level mobile rules.

### Controller

`data-visual-controller-unification-plan.md` remains active until controller rows have one vocabulary/rendering path, orientation-specific composition is registry-driven, dead controller metadata is removed, row width/density ownership is singular, and custom escape hatches no longer create parallel layout behavior.

### Mark scale

`data-visual-mobile-mark-scale-plan.md` remains active until priority visuals have explicit registry-native mark density/scale behavior and legacy title/MutationObserver sizing can be removed safely.

## 7. Historical migration documents

The following are evidence/history, not current architecture authority:

- `docs/migration/README.md` — original analytics/auth migration program and PR history;
- `docs/DATA_VISUAL_MODULE_UNIFICATION.md` — early DataVisualCanvas migration bridge;
- `docs/DATA_VISUAL_MODULE_UNIFICATION_STATUS.md` — point-in-time status;
- `docs/MOBILE_VISUAL_PHASE2_CHANGELOG.md` — implementation changelog;
- mobile Analytics controller correction/acceptance/test notes — September 14 evidence;
- `docs/migration/reference/**` — migration-era snapshots and merge references;
- Herald Data Visual artifacts — branch/run evidence.

Historical documents may explain why the system changed but must not override current code or this master.

## 8. Open migration priorities

1. Remove remaining production consumers of legacy Analytics selectors/cache APIs.
2. Finish exact per-window consumption for all datasets/consumers that claim window support.
3. Complete the active dataset-expansion plan without breaking the 34-dataset Intelligence compatibility boundary.
4. Validate and gate content-owner-only report families separately from normal channels.
5. Finish Data Visual controller vocabulary/orientation migration.
6. Finish registry-native mark scale/density migration.
7. Remove `data-visual-preview-16x9.js` only after the priority visual set is contract-native and certified.
8. Complete Master Data floating/portal behavior without creating another overlay authority.
9. Keep Analytics/Brain evidence bounded, source-linked, freshness-aware and channel-scoped.
10. Update this master whenever a migration plan changes from active to complete.

## 9. Acceptance criteria

Analytics consolidation is complete when:

- VT-SYNC is the only raw analytics truth owner;
- analytics-canon is the only supported normalized consumer boundary;
- all production analytics consumers have left legacy selectors/cache truth;
- every visible dataset resolves through canonical registries;
- window semantics are exact or explicitly unavailable/fallback;
- Data Visuals have one canvas owner and one responsive contract;
- controller/mark-scale migration no longer depends on compatibility title matching;
- Brain/Intelligence evidence cites canonical datasets rather than copied metric stores;
- historical migration docs can be read without being mistaken for present state.
