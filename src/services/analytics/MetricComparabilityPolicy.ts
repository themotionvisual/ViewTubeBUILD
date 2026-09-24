import type {
 AnalyticsWindow,
 CanonicalMetricDefinition,
 CanonicalMetricKey,
} from "./DataStore"

export type MetricEntityScope =
 | "channel"
 | "video"
 | "traffic_source"
 | "search_term"
 | "geography"
 | "audience"
 | "playlist"
 | "unknown"

export type MetricFormatScope = "all" | "shorts" | "long" | "live" | "story" | "unknown"
export type MetricAggregation = "sum" | "average" | "rate" | "ratio" | "snapshot" | "unknown"
export type MetricAvailabilityForComparison = "available" | "unavailable" | "partial"

export interface MetricComparisonContext {
 metricKey: CanonicalMetricKey | string
 unit: CanonicalMetricDefinition["unit"]
 entityScope: MetricEntityScope
 formatScope: MetricFormatScope
 window: AnalyticsWindow | "unknown"
 aggregation: MetricAggregation
 coverage: number | null
 availability: MetricAvailabilityForComparison
}

export type MetricComparabilityReasonCode =
 | "unit_mismatch"
 | "entity_scope_mismatch"
 | "format_scope_mismatch"
 | "window_mismatch"
 | "aggregation_mismatch"
 | "unavailable"
 | "insufficient_coverage"

export interface MetricComparabilityReason {
 code: MetricComparabilityReasonCode
 message: string
 left?: unknown
 right?: unknown
}

export interface MetricComparabilityResult {
 comparable: boolean
 reasons: MetricComparabilityReason[]
}

export interface MetricComparabilityOptions {
 allowDifferentWindows?: boolean
 allowDifferentFormats?: boolean
 minimumCoverage?: number
}

const mismatch = (
 code: MetricComparabilityReasonCode,
 label: string,
 left: unknown,
 right: unknown,
): MetricComparabilityReason => ({
 code,
 message: `${label} must match for a valid comparison.`,
 left,
 right,
})

export const compareMetricContexts = (
 left: MetricComparisonContext,
 right: MetricComparisonContext,
 options: MetricComparabilityOptions = {},
): MetricComparabilityResult => {
 const reasons: MetricComparabilityReason[] = []

 if (left.unit !== right.unit) reasons.push(mismatch("unit_mismatch", "Metric unit", left.unit, right.unit))
 if (left.entityScope !== right.entityScope) reasons.push(mismatch("entity_scope_mismatch", "Entity scope", left.entityScope, right.entityScope))
 if (!options.allowDifferentFormats && left.formatScope !== right.formatScope) reasons.push(mismatch("format_scope_mismatch", "Format scope", left.formatScope, right.formatScope))
 if (!options.allowDifferentWindows && left.window !== right.window) reasons.push(mismatch("window_mismatch", "Analytics window", left.window, right.window))
 if (left.aggregation !== right.aggregation) reasons.push(mismatch("aggregation_mismatch", "Aggregation", left.aggregation, right.aggregation))

 if (left.availability !== "available" || right.availability !== "available") {
  reasons.push({
   code: "unavailable",
   message: "Both metric values must be available for comparison.",
   left: left.availability,
   right: right.availability,
  })
 }

 const minimumCoverage = options.minimumCoverage ?? 0
 const belowCoverage = (coverage: number | null) =>
  coverage !== null && coverage < minimumCoverage

 if (belowCoverage(left.coverage) || belowCoverage(right.coverage)) {
  reasons.push({
   code: "insufficient_coverage",
   message: `Metric coverage must be at least ${minimumCoverage}.`,
   left: left.coverage,
   right: right.coverage,
  })
 }

 return {
  comparable: reasons.length === 0,
  reasons,
 }
}
