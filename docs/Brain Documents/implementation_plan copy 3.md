# Implementation Plan - Advanced Chart Collection Expansion

Add 10 new high-priority, data-driven chart visualizations to the Research Lab to provide deeper algorithmic insights for creators.

## User Review Required

> [!IMPORTANT]
> This update adds 10 new complex chart types. Some charts depend on specific CSV headers (e.g., 'Country' for the Geo Heatmap, 'Publish Time' for the Momentum Heatmap). If these headers are missing in the uploaded data, fallback mock logic or "No Data" states will be shown.

> [!WARNING]
> `ResearchLab.tsx` is an extremely large file. implementing these charts in one pass requires careful management of the `chartConfigs` array and the `RenderGoogleChart` handler to avoid performance regressions.

## Proposed Changes

### 📡 Data Layer & Types

#### [MODIFY] [ResearchLab.tsx](file:///Users/cwb/Downloads/viewtube/src/views/ResearchLab.tsx)
- Extend `getChartData` or create specific data utility functions for:
    - **Geo CPM**: Filter for 'Country' and 'Revenue'/'CPM' columns.
    - **Momentum Heatmap**: Group data into a 7 (Day) x 24 (Hour) matrix.
    - **Funnel Logic**: Aggregate `Impressions -> Views -> Clicks`.
    - **Box Plot Logic**: Calculate Min, Q1, Median, Q3, and Max views for series analysis.
    - **Normalization Logic**: Re-index video timelines so they all start at `Day 0`.

### 📊 Visualization Components

#### [MODIFY] [ResearchLab.tsx](file:///Users/cwb/Downloads/viewtube/src/views/ResearchLab.tsx)
- Update `RenderGoogleChart` to support:
    - `CandlestickChart` (for Box Plots).
    - `TreeMap` (if needed for advanced distribution).
    - `ComboChart` (for Dual-Axis Algorithm Trigger).
    - `SteppedAreaChart` (for Funnel-style visuals).
- Add specific rendering handlers for the **Momentum Heatmap** (Grid-based UI) and **Radar Overlays**.

### 🏗️ Station Configuration

#### [MODIFY] [ResearchLab.tsx](file:///Users/cwb/Downloads/viewtube/src/views/ResearchLab.tsx)
- Append 10 new `ChartConfig` objects to the `chartConfigs` array:
    1.  **Geography of High CPMs** (GeoChart Heatmap)
    2.  **Published Time vs. Momentum** (2D Grid Heatmap)
    3.  **End Screen Effectiveness** (Funnel Chart)
    4.  **Series vs. Standalone Performance** (Candlestick / Box Plot)
    5.  **Seasonal RPM Radar** (Radar Chart)
    6.  **Thumbnail A/B Test Annotation** (Annotated Line)
    7.  **Algorithm Trigger Matrix** (Dual-Axis Combo)
    8.  **OS Revenue vs Volume** (Nested Donut / Sunburst)
    9.  **Long-Tail Shelf Life** (Normalized Line Chart)
    10. **Golden Ratio Benchmark** (Overlay Radar)

## Open Questions

- **Heatmap Implementation**: Should the 24x7 grid heatmap be a Google `TreeMap` with color intensity, or a custom HTML/Flex grid for maximum Neo-Brutalist styling? (Recommended: Custom Flex grid to match the "Station" aesthetic).
- **Data Fallbacks**: If a user uploads a CSV missing specific columns (like 'Country'), should we hide the chart entirely or show a "Sample Data" mode? (Recommended: "Station Idle: Missing [Header] Data" state).

## Verification Plan

### Automated Tests
- Build check: `npm run build` to ensure the huge file still compiles correctly.
- Render test: Verify all 10 new station cards appear at the bottom of the Research Lab.

### Manual Verification
- Upload sample CSVs with varying headers to test data mapping robustness.
- Hover over each new chart type to verify that the **Stacked Hover Banner** shows correct numeric data.
- Toggle sorting/filtering on the new charts where applicable.
