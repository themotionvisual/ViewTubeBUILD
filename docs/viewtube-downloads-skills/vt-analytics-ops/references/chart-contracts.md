# Chart and Table Contracts (VT)

## Goal
Keep API metric names, canonical row fields, and rendered chart/table headers aligned.

## Primary metrics under active risk
- `videoThumbnailImpressions`
- `videoThumbnailImpressionsClickRate`
- `cardClickRate`
- `annotationClickThroughRate`

## Canonical mapping expectations
- Impressions display should resolve from canonical aliases including `videoThumbnailImpressions`.
- CTR display should resolve from canonical aliases including `videoThumbnailImpressionsClickRate` and mapped `%` headers.
- Header dedupe should prevent duplicate semantic columns (e.g., multiple CTR variants).

## Key files to inspect
- `src/services/analyticsContract.ts`
- `src/components/UniversalDataTable.tsx`
- `src/services/DataEngine.ts`
- `src/views/PerformanceHub.tsx`
- `src/data/ApiStatisticsCatalog.ts`

## Validation sequence
1. API payload contains expected fields in `columnHeaders`.
2. Merge layer preserves both fields per video key.
3. Canonical transform exposes stable keys for both values.
4. Table header canonicalization dedupes variants while preserving semantic source.
5. Display cells for master table show numeric values when data exists.

## Common drift patterns
- Mapping only one alias family (snake_case or camelCase) but not both.
- Deriving CTR from stale generic keys while ignoring thumbnail CTR metric.
- Deduping headers by raw text, not canonical identity.
- Silently replacing missing values with `-` without exposing diagnostics context.
- Reusing `annotationClickThroughRate` as a fallback alias for `cardClickRate`, which creates a false "Card %" signal in PerformanceHub.
