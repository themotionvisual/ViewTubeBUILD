import type {
 AnalyticsWindow,
 CanonicalMetricKey,
 CanonicalVideoRow,
 MetricConfidence,
 MetricSource,
 MetricStatus,
} from "./analyticsContract"

export type CanonicalMetricAvailability = "available" | "unavailable"

export interface CanonicalMetricValue {
 value: number | null
 availability: CanonicalMetricAvailability
 confidence: MetricConfidence
 reasonCode?: string
 lineage?: {
  sourceField?: string
  formulaId?: string
  inputMetrics?: CanonicalMetricKey[]
 }
}

export interface MetricCapability {
 metric: string
 status: "available" | "unsupported"
 reasonCode?: string
 source?: "api" | "csv"
}

export interface CanonicalDatasetWindow {
 window: AnalyticsWindow
 rows: CanonicalVideoRow[]
 syncedAt: number | null
 startDate?: string
 endDate?: string
}

export interface CanonicalDataset {
 channelLifetime: {
  startDate?: string
  endDate?: string
  syncedAt: number | null
 }
 videosLifetime: CanonicalVideoRow[]
 windows: Partial<Record<AnalyticsWindow, CanonicalDatasetWindow>>
 capabilities: Partial<Record<AnalyticsWindow, MetricCapability[]>>
 syncMeta: {
  lastSynced: number | null
  source: MetricSource
 }
}

export interface ChartDefinition {
 id: string
 requiredMetrics: CanonicalMetricKey[]
 acceptedConfidences: MetricConfidence[]
 failClosedBehavior: "show_missing_metrics_panel" | "hide_chart"
}

const YT_ANALYTICS_CACHE_KEY = "yt_analytics_cache"
const warnedStorageReads = new Set<string>()

export type RawAnalyticsCache = Record<string, unknown> & {
 analyticsByWindow?: Partial<
  Record<
   AnalyticsWindow,
   {
    startDate?: string
    endDate?: string
    fetchedAt?: number
    report?: unknown
   }
  >
 >
 metricCapabilitiesByWindow?: Partial<Record<AnalyticsWindow, MetricCapability[]>>
 lastSyncedByWindow?: Partial<Record<AnalyticsWindow, number>>
 lastSynced?: number
}

const safeParse = <T>(raw: string | null, fallback: T): T => {
 if (!raw) return fallback
 try {
  return JSON.parse(raw) as T
 } catch {
  return fallback
 }
}

export const markDeprecatedLocalStorageRead = (
 caller: string,
 key = YT_ANALYTICS_CACHE_KEY,
): void => {
 const warningKey = `${caller}::${key}`
 if (warnedStorageReads.has(warningKey)) return
 warnedStorageReads.add(warningKey)
 console.warn(
  `[canonical-store] Deprecated direct localStorage read detected in ${caller}. Use canonical analytics store selectors instead.`,
 )
}

export const readYouTubeAnalyticsCache = (): RawAnalyticsCache =>
 safeParse<RawAnalyticsCache>(localStorage.getItem(YT_ANALYTICS_CACHE_KEY), {})

export const writeYouTubeAnalyticsCache = (cache: RawAnalyticsCache): void => {
 localStorage.setItem(YT_ANALYTICS_CACHE_KEY, JSON.stringify(cache))
}

export const getWindowCapabilityReason = (
 cache: RawAnalyticsCache,
 window: AnalyticsWindow,
 metric: string,
): string | null => {
 const capabilities = cache.metricCapabilitiesByWindow?.[window]
 if (!Array.isArray(capabilities)) return null
 const match = capabilities.find((cap) => cap.metric === metric)
 if (!match || match.status !== "unsupported") return null
 return match.reasonCode || "api_unsupported"
}

export const buildCanonicalMetricValue = (
 value: number | null,
 status: MetricStatus,
 confidence: MetricConfidence,
 reasonCode?: string,
 sourceField?: string,
 formulaId?: string,
 inputMetrics?: CanonicalMetricKey[],
): CanonicalMetricValue => {
 const availability: CanonicalMetricAvailability =
  status === "unavailable" || value === null ? "unavailable" : "available"
 return {
  value,
  availability,
  confidence,
  reasonCode,
  lineage:
   sourceField || formulaId || (inputMetrics && inputMetrics.length > 0)
    ? {
       sourceField,
       formulaId,
       inputMetrics,
      }
    : undefined,
 }
}
