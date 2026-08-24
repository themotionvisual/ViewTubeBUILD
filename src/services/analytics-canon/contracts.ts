// Canonical analytics contracts — the shapes every consumer depends on.
//
// This module re-exports the mature type system that already lived in
// services/analytics/DataStore.ts and services/analytics/Selectors.ts.
// The types were always correct; only the DATA SOURCE moves in this
// migration. Consumers depend on these types instead of the legacy
// files, so we can eventually delete the legacy implementations
// without touching consumer code.
//
// Import policy:
//  * Consumers → import from "services/analytics-canon" (this file, via
//    the index.ts barrel).
//  * This file → is allowed to re-export from services/analytics/* as
//    the source of truth for TYPES only. It must never re-export runtime
//    functions from there — those come from selectors.ts and use VT Sync.

export type {
 AnalyticsWindow,
 CanonicalVideoRow,
 CanonicalMetricKey,
 CanonicalMetricDefinition,
 CanonicalRowCoverageState,
 CanonicalFormatConfidence,
 CanonicalRowMatchConfidence,
 MetricCell,
 MetricSource,
} from "../analytics/DataStore"

export type {
 AnalyticsSourceMode,
 WindowTotals,
 MetricSummary,
 MetricAvailability,
 MasterTableRow,
} from "../analytics/Selectors"

/**
 * The set of analytics windows the canonical selectors accept.
 * Kept as a runtime array so consumers can iterate/validate.
 */
export const CANONICAL_ANALYTICS_WINDOWS = [
 "7d",
 "28d",
 "90d",
 "365d",
 "lifetime",
] as const

/**
 * Source-of-truth marker: every value returned by an analytics-canon
 * selector carries this so a runtime check can distinguish canonical
 * output from any lingering legacy result during migration debugging.
 */
export const CANON_SOURCE_MARKER = "vt-sync" as const
export type CanonSourceMarker = typeof CANON_SOURCE_MARKER
