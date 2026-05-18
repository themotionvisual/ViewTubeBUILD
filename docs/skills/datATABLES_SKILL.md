---
name: reformat-viewtube-master-tables
description: Reformat master data tables to display full segmented datasets (Audience, Geography, Traffic) with descriptive labels and flattened columns.
---

## When to Use
- User requests that master tables (Audience, Traffic, Geography) show all rows instead of just a sample.
- Dimension values (e.g., "Age: 18-24", "US", "YouTube Search") need to be easily visible and used in row labels.
- Column headers need to be mapped from raw API keys (e.g., `insightTrafficSourceType`) to human-readable names (e.g., "Traffic Source").

## Procedure

1.  **Support Multiple Rows in Domain Conversion**:
    - In `src/services/masterTables.ts`, update `toDomainRows` to iterate over all `sourceRows`:
      ```typescript
      return sourceRows.map((row, index) => ({
        ...row,
        canonicalKey: `${scope}_${index}`,
        // ... other properties
      }))
      ```

2.  **Generate Descriptive Display Names**:
    - Within `toDomainRows`, search for dimension keys (`type`, `group`, `gender`, `country`, `date`) to create a context-rich `displayName`:
      ```typescript
      const dimensionKey = Object.keys(row).find(k => k.toLowerCase().includes('type') || ...)
      const dimensionValue = dimensionKey ? String(row[dimensionKey]) : null
      const displaySuffix = dimensionValue ? `: ${dimensionValue}` : ` #${index + 1}`
      ```

3.  **Normalize Row Keys**:
    - Rename internal API keys to standardized headers within the row object before spreading:
      ```typescript
      if (k === 'insightTrafficSourceType') targetKey = 'Traffic Source'
      if (k === 'ageGroup') targetKey = 'Age Group'
      ```

4.  **Configure UI Display Order**:
    - In `src/components/UniversalDataTable.tsx`, update `COLUMN_DISPLAY_ORDER` and `COLUMN_ALIASES` to ensure these new dimension columns are prioritized and deduplicated.

## Pitfalls and Fixes
- **Duplicate Columns**: Raw API keys and normalized headers both appearing -> **Fix**: Ensure all aliases are registered in `COLUMN_ALIASES` in `UniversalDataTable.tsx`.
- **Data Coverage Inventory Breakage**: Changing headers to human-readable names (e.g., "AVD (Sec)") can break the inventory engine's lookup logic if it's only looking for internal API keys (e.g., `averageViewDuration`).
  - **Fix**: Add the new human-readable headers as aliases in the `metricKeys` object within `src/services/dataCoverageInventory.ts`.
- **Missing Statistic Column**: First column is empty -> **Fix**: Ensure `primaryKey` selection in `toDomainRows` skips internal keys (starting with `_`).

## Verification
- Open the System panel and inspect the Audience, Traffic, or Geography tables.
- Each row should have a unique, descriptive name (e.g., `Audience: 18-24`) instead of `Audience Entry #1`.
- Verify that segmented values (e.g., views per country) are displayed as first-class columns.
