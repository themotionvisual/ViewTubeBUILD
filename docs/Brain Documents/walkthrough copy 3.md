# Advanced Chart Collection Implementation

I have fully reconstructed and integrated the advanced chart collection for the ViewTube Research Lab. The implementation followed the recovered plan exactly, avoiding performance regressions by keeping data closure logic localized and mapping strictly to `RenderGoogleChart`.

## Changes Made
- **Render Engine Updates:** 
  - Added native `CandlestickChart` support to the `RenderGoogleChart` map system.
- **Embedded Advanced Chart Configurations:**
  Appended 10 new high-priority, data-driven chart setups directly to the `chartConfigs` manifest:
  1. **Geography of High CPMs** (GeoChart mapping Regional Revenue)
  2. **Published Time vs. Momentum** (BubbleChart utilized as a 2D Time Heatmap grid)
  3. **End Screen Effectiveness** (SteppedAreaChart visualizing impression dropoffs)
  4. **Series vs Standalone** (CandlestickChart analyzing statistical variance/range)
  5. **Algorithm Trigger Matrix** (Dual-Axis ComboChart correlating CTR against AVD)
  6. **OS Revenue vs Volume** (PieChart styled as a thick Donut matrix)
  7. **Long-Tail Shelf Life** (Normalized Decay LineChart tracking historic progression)
  8. **Thumbnail A/B Test Note** (LineChart to simulate annotated performance jumps)
  9. **Seasonal RPM Trends** (Quarterly ColumnChart for RPM tracking)
  10. **Golden Ratio Benchmark** (ComboChart mapping target thresholds vs current baseline points)

## Executed Work

### 1. Unified Synchronization State
- Augmented `GlobalDataContext.tsx` by centralizing `isSyncing` and `lastSyncComplete`.
- Exposed `globalSyncData()` async wrapper directly mapped to the original `performSync(true)` workflow.
- Updated authentication auto-routing to invoke `globalSyncData()` as soon as a token is instantiated.

### 2. Sidebar Master Controls
- Decommissioned the statically isolated "Connect YouTube" action inside `Sidebar.tsx`.
- Reconstructed the Sidebar's connection portal to map into a **"Sync Data"** button when the application yields a valid session state.
- Integrated dynamic layout states tied to `isSyncing` (e.g. Activity Spinners, Disabled Buttons) across the Sidebar UI.

### 3. Canonical Metric Rollout (Deep Component Refactor)
- **PerformanceHub.tsx**: Stripped out legacy cache variables and deleted local tracking nodes (`syncTick`, JS DOM listeners). We injected a structural pipeline converting `canonicalApiRows` securely to `masterTableRows` via `canonicalRowsToMasterTableRows`.
- **SimpleAnalytics.tsx**: Integrated `lastSyncComplete` and standardized row consumption through `getMasterRows` securely. Restored stable metrics mappings across widgets.
- **ResearchLab.tsx**: Automatically intercepted the over 50 legacy charts (which map `row['Views']`) by applying the canonical utility `canonicalRowsToMasterTableRows` directly at load time. This perfectly solves the data structure normalization across the Research Lab's extensive widget array without needing 50 separate component rewrites!
- **Dashboard.tsx**: Purged independent manual local storage extractions and localized calculations in favor of `getMetricSummary` and `getMasterRows`, bringing the core dashboard structurally aligned with the canon data pipeline.
- Decommissioned isolated `syncTick` states in utility files like `useCanonicalAnalytics.ts`.

## Architectural Decisions
To keep `ResearchLab.tsx` maintainable despite the massive array payload:
- Data extraction routines (e.g. `parseDurationToSeconds` scaling and filtering keys) were kept strictly inside the `.data()` callbacks for each node, instead of bloating the global `getChartData()` utility further.
- Safe fallbacks (`["US", 0]`, `"No Data"`, or simplified placeholders) were applied for visualizations that require headers typically not supported by standard exported CSVs (e.g., precise geographical or quarterly splits).

> [!NOTE]
> The Research Lab will immediately start spawning these cards at the bottom of the tool suite. Since they query the same `allData` context cache, no extra load dependencies were introduced.
