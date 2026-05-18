---
name: manage-viewtube-data-coverage
description: Update the data coverage inventory to show missing metrics, handle pre-normalized objects, preserve raw API fields, and map human-readable headers.
---

## When to Use
- User reports that specific metrics (e.g., Views, Revenue, CTR) are missing from the Data Coverage or Data Transparency Center tables.
- Metrics are missing for specific scopes (e.g., channel-level data is missing while video-level is present).
- The data coverage table shows "-" even though the API sync was successful.
- Summary counts (Received/Connected/Master) need to be clarified in the UI.

## Procedure

1.  **Expand Metric Request Gaps**:
    - If a metric is missing after sync, check `src/services/youtubeService.ts`.
    - Ensure functions like `getChannelAnalytics`, `getVideoAnalytics`, and `fetchDailyAnalytics` include the missing metrics (e.g., `estimatedRevenue`, `monetizedPlaybacks`, `videoThumbnailImpressions`) in their `metrics` string or array.
    - **Warning**: Verify dimension compatibility (e.g., impressions might only work with `dimensions=video`).

2.  **Preserve Raw API Data (Prevent Data Loss)**:
    - In `src/services/analyticsSelectors.ts`, ensure the normalization process doesn't discard raw fields needed for formulas or inventory examples.
    - Inside `apiRowsForWindow` or similar mapping functions, assign the raw row to an `originalData` property:
      ```typescript
      const row: Partial<MasterTableRow> = {
        // ... standardized fields
        originalData: rawRow, // Preserve all raw API fields
      }
      ```

3.  **Update Key Mapping Aliases**:
    - In `src/services/dataCoverageInventory.ts`, update the `metricKeys` object to map internal keys to human-readable headers used in master tables.
    - Add aliases for common variations:
      ```typescript
      subsGained: ["subscribersGained", "Subs +", "Subscribers Gained"],
      revenue: ["estimatedRevenue", "Revenue", "Estimated revenue"],
      avd: ["averageViewDuration", "AVD (Average View Duration)", "AVD (Sec)"],
      ```

4.  **Refine Formula and Example Formatting**:
    - Update `formatFormulaValue` in `src/services/dataCoverageInventory.ts` to handle currency and percentages correctly for specific keys.
    - Ensure derived metrics like CTR or RPM are displayed with 2 decimal places and the correct symbol (`%` or `$`).

5.  **Identify Missing Catalog Entries**:
    - Check `src/services/dataCoverageCatalog.ts`.
    - If a metric exists in multiple scopes but only one is listed, add the missing scope entry.

6.  **Implement Detailed Summary Counts**:
    - Expand `DataCoverageSummary` to include `receivedCount`, `connectedSourcesTotal`, and `fullCatalogTotal`.
    - Update the UI (e.g., `SystemStatisticsSubToolbox.tsx`) to show "Received X / Connected Y" as a primary metric.

## Pitfalls and Fixes
- **Empty Example Column**:
  - Cause 1: Case mismatch -> **Fix**: Use case-insensitive lookup in `resolveValueFromRows`.
  - Cause 2: Key mapping mismatch -> **Fix**: Add the human-readable header (e.g., "AVD (Sec)") to the metric aliases in `metricKeys`.
  - Cause 3: Data loss -> **Fix**: Ensure `originalData` is preserved during normalization.
- **Reporting API Metrics**: ~70 metrics require Job-based sync, not just Analytics API calls.
  - **Fix**: Surface "Reporting API Job Required" in the `reason` column.

## Verification
- Check the "Data Coverage Reference" table: the "Example Channel" column should be populated with actual values (not just "-").
- Verify that Revenue and CPM values show `$` and CTR shows `%`.
- Run unit tests in `src/services/dataCoverageInventory.test.ts` to verify the inventory engine logic.
