import {
 CANONICAL_ANALYTICS_WINDOWS,
 compareMetricContexts,
 type CanonicalIntelligenceDatasetManifest,
 type CanonicalIntelligenceDatasetStatus,
 type CanonicalIntelligenceEvidenceBundle,
 type CanonicalMetricDefinition,
 type MetricAggregation,
 type MetricAvailabilityForComparison,
 type MetricComparisonContext,
 type MetricEntityScope,
 type MetricFormatScope,
} from "../analytics-canon"

export type EvidenceOwner =
 | "analytics-canon"
 | "youtube-read"
 | "comments"
 | "transcript"
 | "vault"
 | "project"
 | "publishing"
 | "outcomes"
 | "experiment"
 | "research"
 | "creator-confirmed"

export type EvidenceEpistemicState =
 | "observed"
 | "derived"
 | "creator_confirmed"
 | "stale"
 | "missing"

export interface EvidenceRecord {
 id: string
 owner: EvidenceOwner
 sourceRef: string
 sourceSnapshotId?: string | null

 channelId?: string | null
 projectId?: string | null
 contentBuildId?: string | null
 videoId?: string | null
 assetId?: string | null

 datasetId?: string | null
 entityType?: string | null
 entityId?: string | null

 metric?: string | null
 value?: number | string | boolean | null
 unit?: CanonicalMetricDefinition["unit"] | null
 aggregation?: MetricAggregation | null

 population?: string | null
 format?: string | null
 geography?: string | null

 window?: {
  kind: string
  start?: string | null
  end?: string | null
 } | null

 observedAt?: string | null
 updatedAt?: string | null
 freshness: "fresh" | "stale" | "unknown"
 epistemicState: EvidenceEpistemicState
 confidence?: number | null
 coverage?: number | null
 availability?: MetricAvailabilityForComparison

 missingness?: string[]
 limitations?: string[]

 provenance: {
  evidenceIds: string[]
  sourceRoute?: string | null
  sourceVersion?: string | null
 }
}

export type DerivedSignalKind =
 | "trend"
 | "comparison"
 | "anomaly"
 | "opportunity"
 | "cohort"
 | "audience"
 | "search"
 | "packaging"
 | "retention"
 | "revenue"
 | "format"
 | "relationship"

export interface DerivedSignal {
 id: string
 kind: DerivedSignalKind
 channelId?: string | null
 projectId?: string | null
 contentBuildId?: string | null
 videoId?: string | null

 label: string
 metric?: string | null
 currentValue?: number | null
 baselineValue?: number | null
 delta?: number | null
 relativeDelta?: number | null

 confidence: number
 impact?: number | null
 evidenceIds: string[]

 derivation: {
  method: string
  version: string
  deterministic: boolean
 }

 limitations?: string[]
 metadata?: Record<string, string | number | boolean | null>
}

export interface EvidenceComparabilityResult {
 comparable: boolean
 level: "exact" | "normalized" | "directional" | "invalid"
 reasons: string[]
 normalization: string | null
}

const metricUnit = (metric: string): CanonicalMetricDefinition["unit"] => {
 const key = metric.toLowerCase()
 if (key.includes("percentage") || key.includes("percent") || key === "ctr" || key.endsWith("_ctr")) return "percent"
 if (key.includes("watchhour") || key.includes("watch_hours")) return "hours"
 if (key.includes("duration") || key.includes("seconds")) return "seconds"
 if (key.includes("revenue") || key.includes("rpm") || key.includes("cpm")) return "currency"
 if (key.includes("rate") || key.includes("ratio")) return "rate"
 return "count"
}

const metricAggregation = (
 metric: string,
 unit: CanonicalMetricDefinition["unit"],
): MetricAggregation => {
 const key = metric.toLowerCase()
 if (
  unit === "percent"
  || unit === "rate"
  || key.includes("average")
  || key.startsWith("avg")
  || key.includes("rpm")
  || key.includes("cpm")
 ) return "average"
 return "sum"
}

const metricValue = (
 metric: string,
 dataset: CanonicalIntelligenceDatasetManifest,
): { value: number; unit: CanonicalMetricDefinition["unit"]; aggregation: MetricAggregation } | null => {
 const summary = dataset.metrics[metric]
 if (!summary) return null
 const unit = metricUnit(metric)
 const aggregation = metricAggregation(metric, unit)
 const value = aggregation === "average" ? summary.average : summary.sum
 if (!Number.isFinite(value)) return null
 return { value, unit, aggregation }
}

const freshnessFor = (
 status: CanonicalIntelligenceDatasetStatus,
): EvidenceRecord["freshness"] => {
 if (status === "stale") return "stale"
 if (status === "failed" || status === "unavailable") return "unknown"
 return "fresh"
}

const epistemicStateFor = (
 status: CanonicalIntelligenceDatasetStatus,
): EvidenceEpistemicState => {
 if (status === "stale") return "stale"
 if (status === "failed" || status === "unavailable") return "missing"
 return "observed"
}

const availabilityFor = (
 status: CanonicalIntelligenceDatasetStatus,
): MetricAvailabilityForComparison => {
 if (status === "available" || status === "stale") return "available"
 if (status === "partial") return "partial"
 return "unavailable"
}

const confidenceFor = (status: CanonicalIntelligenceDatasetStatus): number => {
 if (status === "available") return 1
 if (status === "partial") return 0.6
 if (status === "stale") return 0.35
 return 0
}

export const projectCanonicalEvidenceRecords = (
 bundle: CanonicalIntelligenceEvidenceBundle,
): EvidenceRecord[] =>
 bundle.datasets.flatMap((dataset) =>
  Object.keys(dataset.metrics).flatMap((metric) => {
   const projected = metricValue(metric, dataset)
   if (!projected) return []
   return [{
    id: `analytics:${bundle.snapshotId}:${dataset.id}:${metric}`,
    owner: "analytics-canon" as const,
    sourceRef: dataset.id,
    sourceSnapshotId: bundle.snapshotId,
    channelId: bundle.channelId,
    datasetId: dataset.id,
    metric,
    value: projected.value,
    unit: projected.unit,
    aggregation: projected.aggregation,
    population: null,
    format: null,
    geography: null,
    window: { kind: bundle.selectedWindow },
    observedAt: bundle.capturedAt,
    updatedAt: dataset.updatedAt || bundle.generatedAt,
    freshness: freshnessFor(dataset.status),
    epistemicState: epistemicStateFor(dataset.status),
    confidence: confidenceFor(dataset.status),
    coverage: dataset.status === "available" ? 1 : dataset.status === "partial" ? 0.6 : null,
    availability: availabilityFor(dataset.status),
    missingness: [...dataset.missingMetrics],
    limitations: dataset.status === "stale"
     ? ["Canonical dataset is stale."]
     : dataset.status === "partial"
      ? ["Canonical dataset has partial coverage."]
      : [],
    provenance: {
     evidenceIds: [...new Set(dataset.evidenceRefs)],
     sourceRoute: "/analytics",
     sourceVersion: bundle.version,
    },
   }]
  }),
 )

const normalizeFormat = (value?: string | null): MetricFormatScope => {
 const format = String(value || "").trim().toLowerCase()
 if (!format) return "unknown"
 if (format === "all") return "all"
 if (format === "short" || format === "shorts") return "shorts"
 if (format === "long" || format === "longform") return "long"
 if (format === "live") return "live"
 if (format === "story") return "story"
 return "unknown"
}

const entityScopeFor = (record: EvidenceRecord): MetricEntityScope => {
 const dataset = String(record.datasetId || record.sourceRef || "").toLowerCase()
 const population = String(record.population || "").toLowerCase()
 if (population.includes("video") || dataset.includes("video")) return "video"
 if (dataset.includes("traffic")) return "traffic_source"
 if (dataset.includes("search")) return "search_term"
 if (dataset.includes("geo") || dataset.includes("city") || dataset.includes("province")) return "geography"
 if (
  population.includes("viewer")
  || population.includes("audience")
  || population.includes("impression")
  || dataset.includes("audience")
  || dataset.includes("demographic")
  || dataset.includes("subscriber")
 ) return "audience"
 if (dataset.includes("playlist")) return "playlist"
 if (dataset.includes("channel")) return "channel"
 return "unknown"
}

const canonicalWindow = (record: EvidenceRecord): MetricComparisonContext["window"] => {
 const kind = String(record.window?.kind || "")
 return (CANONICAL_ANALYTICS_WINDOWS as readonly string[]).includes(kind)
  ? kind as MetricComparisonContext["window"]
  : "unknown"
}

const comparisonAvailability = (record: EvidenceRecord): MetricAvailabilityForComparison => {
 if (record.availability) return record.availability
 return record.epistemicState === "missing" ? "unavailable" : "available"
}

const asMetricContext = (record: EvidenceRecord): MetricComparisonContext | null => {
 const metric = String(record.metric || "").trim()
 const unit = record.unit || null
 const aggregation = record.aggregation || null
 if (!metric || !unit || !aggregation) return null
 return {
  metricKey: metric,
  unit,
  entityScope: entityScopeFor(record),
  formatScope: normalizeFormat(record.format),
  window: canonicalWindow(record),
  aggregation,
  coverage: record.coverage ?? null,
  availability: comparisonAvailability(record),
 }
}

const different = (left?: string | null, right?: string | null): boolean =>
 Boolean(left && right && left !== right)

const explicitDimensionReasons = (
 left: EvidenceRecord,
 right: EvidenceRecord,
): string[] => {
 const reasons: string[] = []
 if (different(left.channelId, right.channelId)) reasons.push("Channel scope does not match.")
 if (different(left.population, right.population)) reasons.push("Population scope does not match.")
 if (different(left.format, right.format)) reasons.push("Content format scope does not match.")
 if (different(left.geography, right.geography)) reasons.push("Geography scope does not match.")
 return reasons
}

const supportsWindowNormalization = (aggregation: MetricAggregation): boolean =>
 aggregation === "average" || aggregation === "rate" || aggregation === "ratio"

export const compareEvidenceRecords = (
 left: EvidenceRecord,
 right: EvidenceRecord,
): EvidenceComparabilityResult => {
 const dimensionReasons = explicitDimensionReasons(left, right)
 const leftContext = asMetricContext(left)
 const rightContext = asMetricContext(right)

 if (!leftContext || !rightContext) {
  return {
   comparable: false,
   level: "invalid",
   reasons: [...dimensionReasons, "Metric, unit, and aggregation metadata are required for comparison."],
   normalization: null,
  }
 }

 if (dimensionReasons.length) {
  return {
   comparable: false,
   level: "invalid",
   reasons: dimensionReasons,
   normalization: null,
  }
 }

 const windowsDiffer = leftContext.window !== rightContext.window
 const canNormalizeWindows = windowsDiffer
  && leftContext.aggregation === rightContext.aggregation
  && supportsWindowNormalization(leftContext.aggregation)

 const metricComparison = compareMetricContexts(
  leftContext,
  rightContext,
  { allowDifferentWindows: canNormalizeWindows },
 )

 if (!metricComparison.comparable) {
  return {
   comparable: false,
   level: "invalid",
   reasons: metricComparison.reasons.map((reason) => reason.message),
   normalization: null,
  }
 }

 if (left.freshness === "stale" || right.freshness === "stale") {
  return {
   comparable: true,
   level: "directional",
   reasons: ["One or both evidence records are stale; use the comparison directionally."],
   normalization: null,
  }
 }

 if (canNormalizeWindows) {
  return {
   comparable: true,
   level: "normalized",
   reasons: [],
   normalization: "Compared using window-independent average/rate/ratio semantics.",
  }
 }

 return {
  comparable: true,
  level: "exact",
  reasons: [],
  normalization: null,
 }
}
