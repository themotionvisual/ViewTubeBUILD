import {
 METRIC_REGISTRY,
 canonicalMetricOrder,
 canonicalizeMetricKey,
 type CanonicalMetricKey,
 type MetricCell,
} from "./analyticsContract"
import { DATA_COVERAGE_CATALOG } from "./dataCoverageCatalog"
import {
 getWindowCapabilityReason,
 markDeprecatedLocalStorageRead,
 getCanonicalAnalyticsCache,
} from "./canonicalAnalyticsStore"

export type DataCoverageSource =
 | "youtube"
 | "ga4"
 | "history_placeholder"
 | "formula"
export type DataCoverageScope =
 | "channel"
 | "video_shared"
 | "short_only"
 | "long_only"
 | "geo"
 | "demographic"
 | "traffic"
 | "device"
 | "retention"
 | "monetization"
 | "daily"
 | "history"

export type DataCoverageStatus =
 | "received"
 | "missing"
 | "not_applicable"
 | "not_connected"

export interface DataCoverageRow {
 categoryName: string
 canonicalKey: string
 source: DataCoverageSource
 scope: DataCoverageScope
 status: DataCoverageStatus
 example: string
 exampleChannel: string
 reason: string
 formulaCapable: boolean
}

export interface DataCoverageSummary {
 totalCategories: number
 perScope: Record<DataCoverageScope, number>
 historyNotConnected: number
 receivedCount: number
 connectedSourcesTotal: number
 fullCatalogTotal: number
}

export interface DataCoverageInventory {
 expandedRows: DataCoverageRow[]
 rows: DataCoverageRow[]
 summary: DataCoverageSummary
}

const HISTORY_PLACEHOLDER_CATEGORIES = [
 "googleSearchHistory",
 "youtubeWatchHistory",
 "youtubeSearchHistory",
 "googleDiscoverHistory",
]

const emptyScopeCounts = (): Record<DataCoverageScope, number> => ({
 channel: 0,
 video_shared: 0,
 short_only: 0,
 long_only: 0,
 geo: 0,
 demographic: 0,
 traffic: 0,
 device: 0,
 retention: 0,
 monetization: 0,
 daily: 0,
 history: 0,
})

const safeParse = <T>(raw: string | null, fallback: T): T => {
 if (!raw) return fallback
 try {
  return JSON.parse(raw) as T
 } catch {
  return fallback
 }
}

const isScalar = (value: unknown): boolean =>
 value === null ||
 value === undefined ||
 typeof value === "string" ||
 typeof value === "number" ||
 typeof value === "boolean"

const toDisplay = (value: unknown): string => {
 if (value === null || value === undefined) return "-"
 if (typeof value === "object") return "[Object]"
 const str = String(value).trim()
 return str ? str : "-"
}

const asNumber = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return null
 const cleaned = value.replace(/,/g, "").replace(/%/g, "").trim()
 if (!cleaned) return null
 const parsed = Number(cleaned)
 return Number.isFinite(parsed) ? parsed : null
}

const asDurationSeconds = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return null
 const trimmed = value.trim()
 if (!trimmed) return null
 if (/^\d+:\d{1,2}(?::\d{1,2})?$/.test(trimmed)) {
  const parts = trimmed.split(":").map((part) => Number(part))
  if (parts.some((p) => !Number.isFinite(p))) return null
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
 }
 return asNumber(trimmed)
}

const firstNumeric = (
 row: Record<string, unknown>,
 keys: string[],
): number | null => {
 for (const key of keys) {
  const value = asNumber(row[key])
  if (value !== null) return value
 }
 return null
}

const firstDurationSeconds = (
 row: Record<string, unknown>,
 keys: string[],
): number | null => {
 for (const key of keys) {
  const value = asDurationSeconds(row[key])
  if (value !== null) return value
 }
 return null
}

const toPercent = (value: number | null): number | null => {
 if (value === null) return null
 return value <= 1 ? value * 100 : value
}

const median = (values: number[]): number | null => {
 const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
 if (sorted.length === 0) return null
 const mid = Math.floor(sorted.length / 2)
 if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2
 return sorted[mid]
}

const parseReportRows = (report: unknown): Record<string, unknown>[] => {
 if (!report || typeof report !== "object") return []
 const payload = report as {
  rows?: unknown[]
  columnHeaders?: Array<{ name?: string }>
 }
 if (!Array.isArray(payload.rows)) return []
 if (!Array.isArray(payload.columnHeaders)) {
  return payload.rows.filter(
   (row: unknown): row is Record<string, unknown> =>
    !!row && typeof row === "object" && !Array.isArray(row),
  )
 }
 const headers: string[] = payload.columnHeaders.map((h: { name?: string }) =>
  String(h?.name || ""),
 )
 return payload.rows
  .map((row: unknown) => {
   if (!Array.isArray(row)) {
    if (row && typeof row === "object") return row as Record<string, unknown>
    return null
   }
   const rowValues = row as unknown[]
   const obj: Record<string, unknown> = {}
   headers.forEach((header: string, idx: number) => {
    if (header) obj[header] = rowValues[idx]
   })
   return obj
  })
  .filter(
   (row: Record<string, unknown> | null): row is Record<string, unknown> =>
    !!row,
  )
}

const buildAliasMap = (): Map<string, string> => {
 const map = new Map<string, string>()
 Object.values(METRIC_REGISTRY).forEach((def) => {
  map.set(canonicalizeMetricKey(def.key), def.key)
  map.set(canonicalizeMetricKey(def.label), def.key)
  def.aliases.forEach((alias) => {
   map.set(canonicalizeMetricKey(alias), def.key)
  })
 })
 return map
}

const CANONICAL_SCOPE_OVERRIDES: Partial<Record<string, DataCoverageScope>> = {
 stw: "short_only",
 cardClickRate: "long_only",
 endScreenClickRate: "long_only",
}

const resolveScopeFromPresence = (
 canonicalKey: string,
 inShort: boolean,
 inLong: boolean,
): DataCoverageScope => {
 const forced = CANONICAL_SCOPE_OVERRIDES[canonicalKey]
 if (forced) return forced
 if (inShort && inLong) return "video_shared"
 if (inShort) return "short_only"
 if (inLong) return "long_only"
 return "video_shared"
}

const extractObjectKeys = (
 obj: Record<string, unknown> | null | undefined,
): string[] => {
 if (!obj) return []
 return Object.keys(obj).filter(
  (key) => key && key !== "_originalData" && !key.startsWith("__"),
 )
}

const normalizeKey = (
 rawKey: string,
 aliasMap: Map<string, string>,
 fallbackMap: Map<string, string>,
): string => {
 const normalized = canonicalizeMetricKey(rawKey)
 return fallbackMap.get(normalized) || aliasMap.get(normalized) || rawKey
}

const resolveValueFromRows = (
 rows: Array<Record<string, unknown>>,
 keyCandidates: string[],
): string => {
 for (const row of rows) {
  const originalData =
   row._originalData && typeof row._originalData === "object"
    ? (row._originalData as Record<string, unknown>)
    : {}
  const merged = { ...row, ...originalData } as Record<string, unknown>
  const keys = Object.keys(merged)

  for (const candidate of keyCandidates) {
   // Try exact match first
   if (merged[candidate] !== undefined) {
    const display = toDisplay(merged[candidate])
    if (display !== "-") return display
   }

   // Try case-insensitive match
   const lowerCandidate = candidate.toLowerCase()
   const match = keys.find((k) => k.toLowerCase() === lowerCandidate)
   if (match) {
    const display = toDisplay(merged[match])
    if (display !== "-") return display
   }
  }
 }
 return "-"
}

const resolveValueFromObjects = (
 objects: Array<Record<string, unknown>>,
 keyCandidates: string[],
): string => {
 for (const obj of objects) {
  const keys = Object.keys(obj)
  for (const candidate of keyCandidates) {
   // Try exact match first
   if (obj[candidate] !== undefined) {
    const display = toDisplay(obj[candidate])
    if (display !== "-") return display
   }

   // Try case-insensitive match
   const lowerCandidate = candidate.toLowerCase()
   const match = keys.find((k) => k.toLowerCase() === lowerCandidate)
   if (match) {
    const display = toDisplay(obj[match])
    if (display !== "-") return display
   }
  }
 }
 return "-"
}

type KeyShape = {
 rawNames: Set<string>
 canonicalKey: string
 source: DataCoverageSource
 scope: DataCoverageScope
}

const upsertShape = (
 map: Map<string, KeyShape>,
 canonicalKey: string,
 rawName: string,
 source: DataCoverageSource,
 scope: DataCoverageScope,
) => {
 const key = `${source}::${scope}::${canonicalKey}`
 const existing = map.get(key)
 if (existing) {
  existing.rawNames.add(rawName)
  return
 }
 map.set(key, {
  rawNames: new Set([rawName]),
  canonicalKey,
  source,
  scope,
 })
}

const extractScalarKeysFromRows = (
 rows: Array<Record<string, unknown>>,
): Set<string> => {
 const keys = new Set<string>()
 rows.forEach((row) => {
  const originalData =
   row._originalData && typeof row._originalData === "object"
    ? (row._originalData as Record<string, unknown>)
    : {}
  const merged = { ...row, ...originalData } as Record<string, unknown>
  Object.entries(merged).forEach(([key, value]) => {
   if (!key || key.startsWith("__") || key === "_originalData") return
   if (isScalar(value)) keys.add(key)
  })
 })
 return keys
}

const isLikelyShort = (row: Record<string, unknown>): boolean => {
 const candidates = [
  row?.Format,
  row?.format,
  row?.contentType,
  row?.videoType,
  row?.type,
  row?.creatorContentType,
 ].filter((v) => typeof v === "string") as string[]
 return candidates.some((v) => v.toLowerCase().includes("short"))
}

const isLikelyLong = (row: Record<string, unknown>): boolean => {
 const candidates = [
  row?.Format,
  row?.format,
  row?.contentType,
  row?.videoType,
  row?.type,
  row?.creatorContentType,
 ].filter((v) => typeof v === "string") as string[]
 return candidates.some((v) => {
  const low = v.toLowerCase()
  return low.includes("long") || low.includes("video") || low.includes("vod")
 })
}

const rowFormat = (row: Record<string, unknown>): string => {
 const canonical = row.__canonical as { format?: string } | undefined
 const fromCanonical = String(canonical?.format || "").toLowerCase()
 if (fromCanonical) return fromCanonical
 return String(row.Format || row.format || row.contentType || "").toLowerCase()
}

const rowMatchesScope = (
 row: Record<string, unknown>,
 scope: DataCoverageScope,
): boolean => {
 const format = rowFormat(row)
 if (scope === "short_only") return format.includes("short")
 if (scope === "long_only")
  return format.includes("long") || format.includes("video")
 if (scope === "video_shared") return true
 return true
}

const canonicalCellForScope = (
 rows: Array<Record<string, unknown>>,
 metricKey: CanonicalMetricKey,
 scope: DataCoverageScope,
): MetricCell | null => {
 let unavailable: MetricCell | null = null
 for (const row of rows) {
  if (!rowMatchesScope(row, scope)) continue
  const cells = row.__metricCells as Record<string, MetricCell> | undefined
  const cell = cells?.[metricKey]
  if (!cell) continue
  if (cell.status !== "unavailable") return cell
  unavailable = unavailable || cell
 }
 return unavailable
}

export const buildDataCoverageInventory = (
 masterTableRows: Array<Record<string, unknown>>,
): DataCoverageInventory => {
 const aliasMap = buildAliasMap()
 const fallbackMap = new Map<string, string>([
  ["viewerpercentage", "viewerPercentage"],
  ["viewspercentage", "viewerPercentage"],
  ["videothumbnailimpressions", "impressions"],
  ["videothumbnailimpressionsclickrate", "ctr"],
 ])

 markDeprecatedLocalStorageRead(
  "dataCoverageInventory.build",
  "yt_analytics_cache",
 )
 const ytCache = getCanonicalAnalyticsCache() as Record<string, unknown>
 const ga4Cache = safeParse<Record<string, unknown>>(
  localStorage.getItem("ga4_analytics_cache"),
  {},
 )

 const shortRows = masterTableRows.filter(
  (r) =>
   r?.Format === "Shorts" || r?.Format === "SHORTS" || r?.format === "shorts",
 )
 const longRows = masterTableRows.filter(
  (r) =>
   r?.Format === "Video" ||
   r?.Format === "VIDEO" ||
   r?.Format === "VIDEO_ON_DEMAND" ||
   r?.format === "video",
 )

 const cachedVideoRows = [
  ...(Array.isArray(ytCache.videos) ? ytCache.videos : []),
  ...(Array.isArray(ytCache.stats) ? ytCache.stats : []),
 ]
 const cachedShortRows = cachedVideoRows.filter((row) => isLikelyShort(row))
 const cachedLongRows = cachedVideoRows.filter(
  (row) => isLikelyLong(row) && !isLikelyShort(row),
 )
 const cachedUnscopedVideoRows = cachedVideoRows.filter(
  (row) => !isLikelyShort(row) && !isLikelyLong(row),
 )

 const analyticsByWindowRows: Record<string, unknown>[] = []
 if (
  ytCache.analyticsByWindow &&
  typeof ytCache.analyticsByWindow === "object"
 ) {
  Object.values(ytCache.analyticsByWindow as Record<string, unknown>).forEach(
   (reportObj: any) => {
    const payload = reportObj?.report || reportObj
    analyticsByWindowRows.push(...parseReportRows(payload))
   },
  )
 }

 const shortVideoPool = [...shortRows, ...cachedShortRows]
 const longVideoPool = [...longRows, ...cachedLongRows]
 const sharedVideoPool = [
  ...shortRows,
  ...longRows,
  ...cachedVideoRows,
  ...analyticsByWindowRows,
 ]

 const shapes = new Map<string, KeyShape>()
 const catalogLabelByShapeKey = new Map<string, string>()

 // Full research catalog baseline: every known category should appear even
 // when the current sync payload is partial or unsupported for some metrics.
 DATA_COVERAGE_CATALOG.forEach((entry) => {
  const normalizedCanonicalKey = normalizeKey(
   entry.canonicalKey,
   aliasMap,
   fallbackMap,
  )
  const shapeKey = `${entry.source}::${entry.scope}::${normalizedCanonicalKey}`
  catalogLabelByShapeKey.set(
   shapeKey,
   entry.categoryName || entry.rawName || entry.canonicalKey,
  )
  upsertShape(
   shapes,
   normalizedCanonicalKey,
   entry.rawName || entry.canonicalKey,
   entry.source,
   entry.scope,
  )
 })

 // Channel-level (profile + channel analytics + daily rollups)
 const profile = (ytCache.profile || {}) as Record<string, unknown>
 extractObjectKeys(profile).forEach((raw) => {
  upsertShape(
   shapes,
   normalizeKey(raw, aliasMap, fallbackMap),
   raw,
   "youtube",
   "channel",
  )
 })

 const channelRows = parseReportRows(ytCache.channelAnalytics)
 channelRows.forEach((row) => {
  extractObjectKeys(row).forEach((raw) => {
   upsertShape(
    shapes,
    normalizeKey(raw, aliasMap, fallbackMap),
    raw,
    "youtube",
    "channel",
   )
  })
 })

 const dailyRows = parseReportRows(ytCache.dailyMetrics)
 dailyRows.forEach((row) => {
  extractObjectKeys(row).forEach((raw) => {
   upsertShape(
    shapes,
    normalizeKey(raw, aliasMap, fallbackMap),
    raw,
    "youtube",
    "daily",
   )
  })
 })

 // Ledger-based inventory (The dominant source)
 const ledger = (ytCache.ledger || {}) as Record<string, any>
 const ledgerExampleObjects: Record<string, unknown>[] = []
 Object.values(ledger).forEach((entry) => {
  const payloadRows = parseReportRows(entry.payload)
  ledgerExampleObjects.push(...payloadRows)
  payloadRows.forEach((row) => {
   extractObjectKeys(row).forEach((raw) => {
    const scope: DataCoverageScope =
     entry.context === "channel"
      ? "channel"
      : entry.context === "traffic_source"
        ? "traffic"
        : entry.context === "geography"
          ? "geo"
          : entry.context === "demographics"
            ? "demographic"
            : "video_shared"
    upsertShape(
     shapes,
     normalizeKey(raw, aliasMap, fallbackMap),
     raw,
     entry.source === "ga4" ? "ga4" : "youtube",
     scope,
    )
   })
  })
 })

 const demographicRows = parseReportRows(ytCache.demographics)
 demographicRows.forEach((row) => {
  extractObjectKeys(row).forEach((raw) => {
   const normalized = canonicalizeMetricKey(raw)
   const scope: DataCoverageScope =
    normalized.includes("country") ||
    normalized.includes("city") ||
    normalized.includes("province")
     ? "geo"
     : "demographic"
   upsertShape(
    shapes,
    normalizeKey(raw, aliasMap, fallbackMap),
    raw,
    "youtube",
    scope,
   )
  })
 })
 const trafficRows = parseReportRows(ytCache.trafficSources)
 trafficRows.forEach((row) => {
  extractObjectKeys(row).forEach((raw) => {
   upsertShape(
    shapes,
    normalizeKey(raw, aliasMap, fallbackMap),
    raw,
    "youtube",
    "traffic",
   )
  })
 })

 const geographyRows = parseReportRows(ytCache.geography)
 geographyRows.forEach((row) => {
  extractObjectKeys(row).forEach((raw) => {
   upsertShape(
    shapes,
    normalizeKey(raw, aliasMap, fallbackMap),
    raw,
    "youtube",
    "geo",
   )
  })
 })

 // GA4 inventory
 // Video/shared metrics from master rows with shorts-vs-long applicability
 const shortKeys = extractScalarKeysFromRows(shortVideoPool)
 const longKeys = extractScalarKeysFromRows(longVideoPool)
 const unknownVideoKeys = extractScalarKeysFromRows([
  ...cachedUnscopedVideoRows,
  ...analyticsByWindowRows,
 ])
 const unionVideoKeys = new Set<string>([...shortKeys, ...longKeys])
 unknownVideoKeys.forEach((key) => unionVideoKeys.add(key))
 unionVideoKeys.forEach((raw) => {
  const inShort = shortKeys.has(raw)
  const inLong = longKeys.has(raw)
  const canonicalKey = normalizeKey(raw, aliasMap, fallbackMap)
  const scope = resolveScopeFromPresence(canonicalKey, inShort, inLong)
  upsertShape(shapes, canonicalKey, raw, "youtube", scope)
 })

 // Keep canonical contract keys visible only when they are explicitly observed in
 // payloads, preserving catalog-first truth without injecting hidden baselines.
 Object.values(METRIC_REGISTRY).forEach((def) => {
  const appearsInShort = Array.from(shortKeys).some(
   (raw) => normalizeKey(raw, aliasMap, fallbackMap) === def.key,
  )
  const appearsInLong = Array.from(longKeys).some(
   (raw) => normalizeKey(raw, aliasMap, fallbackMap) === def.key,
  )
  const appearsInUnknown = Array.from(unknownVideoKeys).some(
   (raw) => normalizeKey(raw, aliasMap, fallbackMap) === def.key,
  )
  if (!appearsInShort && !appearsInLong && !appearsInUnknown) return
  const scope = resolveScopeFromPresence(def.key, appearsInShort, appearsInLong)
  upsertShape(shapes, def.key, def.label, "youtube", scope)
 })

 // GA4 inventory
 if (ga4Cache && typeof ga4Cache === "object") {
  const overview = (ga4Cache.overview || {}) as Record<string, unknown>
  extractObjectKeys(overview).forEach((raw) => {
   upsertShape(
    shapes,
    normalizeKey(raw, aliasMap, fallbackMap),
    raw,
    "ga4",
    "channel",
   )
  })
  ;["trafficSources", "topPages", "conversions"].forEach((bucket) => {
   const rows = Array.isArray(ga4Cache[bucket]) ? ga4Cache[bucket] : []
   rows.forEach((row: Record<string, unknown>) => {
    extractObjectKeys(row).forEach((raw) => {
     upsertShape(
      shapes,
      normalizeKey(raw, aliasMap, fallbackMap),
      raw,
      "ga4",
      "traffic",
     )
    })
   })
  })

  const demographics = (ga4Cache.demographics || {}) as Record<string, unknown>
  ;["ageGroups", "countries", "cities"].forEach((bucket) => {
   const rows = Array.isArray(demographics[bucket]) ? demographics[bucket] : []
   rows.forEach((row: Record<string, unknown>) => {
    extractObjectKeys(row).forEach((raw) => {
     const scope: DataCoverageScope =
      bucket === "countries" || bucket === "cities" ? "geo" : "demographic"
     upsertShape(
      shapes,
      normalizeKey(raw, aliasMap, fallbackMap),
      raw,
      "ga4",
      scope,
     )
    })
   })
  })
 }

 // Personal Google history placeholders (plan stub in this pass)
 HISTORY_PLACEHOLDER_CATEGORIES.forEach((key) => {
  upsertShape(shapes, key, key, "history_placeholder", "history")
 })

 const channelExampleObjects: Record<string, unknown>[] = [
  profile,
  ...(channelRows as Record<string, unknown>[]),
  ...(dailyRows as Record<string, unknown>[]),
  ...(demographicRows as Record<string, unknown>[]),
  ...(trafficRows as Record<string, unknown>[]),
  ...(geographyRows as Record<string, unknown>[]),
  ...ledgerExampleObjects,
  ...((ga4Cache.overview && typeof ga4Cache.overview === "object"
   ? [ga4Cache.overview as Record<string, unknown>]
   : []) as Record<string, unknown>[]),
 ]
 const mergedSharedRows = [
  ...sharedVideoPool.map((row) => {
   const originalData =
    row._originalData && typeof row._originalData === "object"
     ? (row._originalData as Record<string, unknown>)
     : {}
   return { ...row, ...originalData } as Record<string, unknown>
  }),
  ...ledgerExampleObjects,
 ]

 const metricKeys = {
  views: ["views", "Views", "viewCount", "statistics.viewCount"],
  likes: ["likes", "Likes"],
  comments: ["comments", "Comments"],
  shares: ["shares", "Shares"],
  subsGained: [
   "subscribersGained",
   "subscribers_gained",
   "subsPlus",
   "subs+",
   "Subs",
   "Subscribers Gained",
   "Subs +",
  ],
  impressions: [
   "impressions",
   "Impressions",
   "videoThumbnailImpressions",
   "video_thumbnail_impressions",
  ],
  ctr: [
   "ctr",
   "CTR",
   "CTR (%)",
   "Click-Through Rate (CTR)",
   "videoThumbnailImpressionsClickRate",
   "impressionsClickThroughRate",
   "impressionClickThroughRate",
   "video_thumbnail_impressions_ctr",
  ],
  revenue: [
   "estimatedRevenue",
   "Revenue",
   "revenue",
   "estimated_partner_revenue",
   "Estimated revenue",
  ],
  watchMinutes: [
   "estimatedMinutesWatched",
   "watchTimeMinutes",
   "WatchTime",
   "Watch Time (Hours)",
   "Watch time (hours)",
  ],
  avd: [
   "averageViewDuration",
   "average_view_duration_seconds",
   "avgViewDuration",
   "AVD (Average View Duration)",
   "AVD (Sec)",
  ],
  apv: [
   "averageViewPercentage",
   "average_view_duration_percentage",
   "avgPercentageViewed",
   "AVP (%)",
   "Average percentage viewed (%)",
  ],
  duration: [
   "videoLengthSeconds",
   "lengthSeconds",
   "durationSeconds",
   "Length",
   "length",
  ],
 }

 const ctrValues = mergedSharedRows
  .map((row) => toPercent(firstNumeric(row, metricKeys.ctr)))
  .filter((value): value is number => value !== null)
 const avdValues = mergedSharedRows
  .map((row) => firstNumeric(row, metricKeys.avd))
  .filter((value): value is number => value !== null)
 const apvValues = mergedSharedRows
  .map((row) => firstNumeric(row, metricKeys.apv))
  .filter((value): value is number => value !== null)
 const rpmValues = mergedSharedRows
  .map((row) => {
   const views = firstNumeric(row, metricKeys.views)
   const revenue = firstNumeric(row, metricKeys.revenue)
   if (views === null || views <= 0 || revenue === null) return null
   return (revenue / views) * 1000
  })
  .filter((value): value is number => value !== null)

 const medians = {
  avd: median(avdValues),
  apv: median(apvValues),
  ctr: median(ctrValues),
  rpm: median(rpmValues),
 }

 const formatFormulaValue = (value: number, canonicalKey: string): string => {
  if (
   canonicalKey.includes("rpm") ||
   canonicalKey.includes("revenue") ||
   canonicalKey.includes("revenue_split")
  ) {
   return `$${value.toFixed(2)}`
  }
  if (
   canonicalKey.includes("rate") ||
   canonicalKey.includes("percent") ||
   canonicalKey.includes("conversion") ||
   canonicalKey.includes("_lift_")
  ) {
   return `${value.toFixed(2)}%`
  }
  if (canonicalKey.includes("rpm") || canonicalKey.includes("revenue")) {
   return `$${value.toFixed(2)}`
  }
  return value.toFixed(3)
 }

 const computeFormulaValue = (
  row: Record<string, unknown>,
  canonicalKey: string,
 ): number | null => {
  const views = firstNumeric(row, metricKeys.views)
  const likes = firstNumeric(row, metricKeys.likes)
  const comments = firstNumeric(row, metricKeys.comments)
  const shares = firstNumeric(row, metricKeys.shares)
  const subsGained = firstNumeric(row, metricKeys.subsGained)
  const impressionsRaw = firstNumeric(row, metricKeys.impressions)
  const ctrRaw = toPercent(firstNumeric(row, metricKeys.ctr))
  const revenue = firstNumeric(row, metricKeys.revenue)
  const watchMinutes = firstNumeric(row, metricKeys.watchMinutes)
  const avd = firstNumeric(row, metricKeys.avd)
  const apv = firstNumeric(row, metricKeys.apv)
  const durationSeconds = firstDurationSeconds(row, metricKeys.duration)

  const uniqueViewers = firstNumeric(row, [
   "uniqueViewers",
   "Unique Viewers",
   "unique_viewers",
  ])
  const returningViewers = firstNumeric(row, [
   "returningViewers",
   "Returning Viewers",
   "returning_viewers",
  ])
  const cpm = firstNumeric(row, ["cpm", "CPM", "CPM (USD)"])
  const authenticatedViewers = firstNumeric(row, [
   "authenticatedViewers",
   "Authenticated Viewers",
   "authenticated_viewers",
  ]) // Approximation or placeholder if not directly available

  if (canonicalKey === "watch_hours") {
   if (watchMinutes === null) return null
   return watchMinutes / 60
  }
  if (canonicalKey === "engagement_rate") {
   if (views === null || views <= 0) return null
   return (((likes ?? 0) + (comments ?? 0) + (shares ?? 0)) / views) * 100
  }
  if (canonicalKey === "rpm_formula") {
   if (views === null || views <= 0 || revenue === null) return null
   return (revenue / views) * 1000
  }
  if (canonicalKey === "subscriber_conversion") {
   if (views === null || views <= 0 || subsGained === null) return null
   return (subsGained / views) * 100
  }
  if (canonicalKey === "ctr_percent_formula") {
   if (ctrRaw !== null) return ctrRaw
   if (views === null || impressionsRaw === null || impressionsRaw <= 0)
    return null
   return (views / impressionsRaw) * 100
  }
  if (canonicalKey === "impressions_formula") {
   if (impressionsRaw !== null) return impressionsRaw
   if (views === null || ctrRaw === null || ctrRaw <= 0) return null
   return views / (ctrRaw / 100)
  }
  if (canonicalKey === "attention_minutes_per_impression") {
   const impressions =
    impressionsRaw !== null
     ? impressionsRaw
     : views !== null && ctrRaw !== null && ctrRaw > 0
       ? views / (ctrRaw / 100)
       : null
   if (watchMinutes === null || impressions === null || impressions <= 0)
    return null
   return watchMinutes / impressions
  }
  if (canonicalKey === "like_rate_per_1k_views") {
   if (views === null || views <= 0 || likes === null) return null
   return (likes / views) * 1000
  }
  if (canonicalKey === "comment_rate_per_1k_views") {
   if (views === null || views <= 0 || comments === null) return null
   return (comments / views) * 1000
  }
  if (canonicalKey === "share_rate_per_1k_views") {
   if (views === null || views <= 0 || shares === null) return null
   return (shares / views) * 1000
  }
  if (canonicalKey === "watch_time_per_video_minute") {
   if (avd === null || durationSeconds === null || durationSeconds <= 0)
    return null
   return avd / durationSeconds
  }
  if (canonicalKey === "relative_lift_vs_channel_median_avd") {
   if (avd === null || medians.avd === null || medians.avd <= 0) return null
   return ((avd - medians.avd) / medians.avd) * 100
  }
  if (canonicalKey === "relative_lift_vs_channel_median_apv") {
   if (apv === null || medians.apv === null || medians.apv <= 0) return null
   return ((apv - medians.apv) / medians.apv) * 100
  }
  if (canonicalKey === "relative_lift_vs_channel_median_ctr") {
   if (ctrRaw === null || medians.ctr === null || medians.ctr <= 0) return null
   return ((ctrRaw - medians.ctr) / medians.ctr) * 100
  }
  if (canonicalKey === "relative_lift_vs_channel_median_rpm") {
   if (
    views === null ||
    views <= 0 ||
    revenue === null ||
    medians.rpm === null ||
    medians.rpm <= 0
   )
    return null
   const rpm = (revenue / views) * 1000
   return ((rpm - medians.rpm) / medians.rpm) * 100
  }

  // --- NEW FORMULAS ---
  if (canonicalKey === "impression_ctr_derived") {
   const clicks = firstNumeric(row, [
    "clicks",
    "annotationClicks",
    "cardClicks",
   ]) // Approximate clicks if CTR isn't directly available
   if (clicks === null || impressionsRaw === null || impressionsRaw <= 0)
    return null
   return (clicks / impressionsRaw) * 100
  }
  if (canonicalKey === "retention_quality_index") {
   if (apv === null || durationSeconds === null || durationSeconds <= 0)
    return null
   return apv / (durationSeconds / 60)
  }
  if (canonicalKey === "monetization_efficiency") {
   if (
    views === null ||
    views <= 0 ||
    revenue === null ||
    cpm === null ||
    cpm <= 0
   )
    return null
   const rpm = (revenue / views) * 1000
   return (rpm / cpm) * 100
  }
  if (canonicalKey === "audience_loyalty_score") {
   if (
    returningViewers === null ||
    uniqueViewers === null ||
    uniqueViewers <= 0
   )
    return null
   return (returningViewers / uniqueViewers) * 100
  }
  if (canonicalKey === "shorts_viral_threshold") {
   if (ctrRaw === null || apv === null) return null
   return (ctrRaw * apv) / 100
  }
  if (canonicalKey === "audience_quality_score") {
   if (authenticatedViewers === null || views === null || views <= 0)
    return null
   return (authenticatedViewers / views) * 100
  }
  return null
 }

 const resolveFormulaExample = (canonicalKey: string): string => {
  for (const row of mergedSharedRows) {
   const value = computeFormulaValue(row, canonicalKey)
   if (value !== null) return formatFormulaValue(value, canonicalKey)
  }
  return "-"
 }

 const expandedRows: DataCoverageRow[] = Array.from(shapes.values()).map(
  (shape) => {
   const shapeKey = `${shape.source}::${shape.scope}::${shape.canonicalKey}`
   const preferredLabel = catalogLabelByShapeKey.get(shapeKey)
   const keyCandidates = Array.from(shape.rawNames)
   if (!keyCandidates.includes(shape.canonicalKey))
    keyCandidates.unshift(shape.canonicalKey)

   const isHistory =
    shape.scope === "history" || shape.source === "history_placeholder"
   const canonicalMetricKey = canonicalMetricOrder.find(
    (key) => key === shape.canonicalKey,
   ) as CanonicalMetricKey | undefined
   const scopedCanonicalCell = canonicalMetricKey
    ? canonicalCellForScope(masterTableRows, canonicalMetricKey, shape.scope)
    : null

   const example =
    shape.source === "formula"
     ? resolveFormulaExample(shape.canonicalKey)
     : shape.scope === "short_only"
       ? resolveValueFromRows(shortVideoPool, keyCandidates)
       : shape.scope === "long_only"
         ? resolveValueFromRows(longVideoPool, keyCandidates)
         : shape.scope === "video_shared"
           ? (() => {
              const fromShort = resolveValueFromRows(
               shortVideoPool,
               keyCandidates,
              )
              if (fromShort !== "-") return fromShort
              const fromLong = resolveValueFromRows(
               longVideoPool,
               keyCandidates,
              )
              if (fromLong !== "-") return fromLong
              return resolveValueFromRows(sharedVideoPool, keyCandidates)
             })()
           : shape.scope === "history"
             ? "Not Connected"
             : resolveValueFromObjects(channelExampleObjects, keyCandidates)

   const exampleChannel = isHistory
    ? "Not Connected"
    : resolveValueFromObjects(channelExampleObjects, keyCandidates)

   const shortPoolAvailable = shortVideoPool.length > 0
   const longPoolAvailable = longVideoPool.length > 0
   const capabilityReason =
    getWindowCapabilityReason(
     ytCache as any,
     "lifetime",
     keyCandidates[0] || shape.canonicalKey,
    ) ||
    getWindowCapabilityReason(ytCache as any, "lifetime", shape.canonicalKey)
   const status: DataCoverageStatus = isHistory
    ? "not_connected"
    : shape.scope === "short_only" && !shortPoolAvailable
      ? "not_applicable"
      : shape.scope === "long_only" && !longPoolAvailable
        ? "not_applicable"
        : scopedCanonicalCell && scopedCanonicalCell.status !== "unavailable"
          ? "received"
          : example !== "-" || exampleChannel !== "-"
            ? "received"
            : capabilityReason
              ? "missing"
              : "missing"

   const reason =
    status === "not_connected"
     ? "Connector not connected."
     : status === "not_applicable"
       ? shape.scope === "short_only"
         ? "No Shorts rows available in current dataset."
         : "No Long-form rows available in current dataset."
       : status === "received"
         ? scopedCanonicalCell && scopedCanonicalCell.status !== "unavailable"
           ? scopedCanonicalCell.confidence === "raw_direct"
             ? "Value detected from canonical raw metric cell."
             : "Value detected from canonical derived metric cell."
           : example !== "-"
             ? "Value detected in scoped rows."
             : "Value detected at channel/source level."
         : scopedCanonicalCell?.reasonCode
           ? scopedCanonicalCell.reasonCode
           : capabilityReason
             ? capabilityReason
             : shape.source === "formula"
               ? "Formula category tracked but required operands were missing in current rows."
               : shape.source === "ga4"
                 ? "Key tracked but GA4 cache has no value for current window."
                 : "Key tracked but no value found in current rows/cache."

   return {
    categoryName: preferredLabel || keyCandidates[0] || shape.canonicalKey,
    canonicalKey: shape.canonicalKey,
    source: shape.source,
    scope: shape.scope,
    status,
    example,
    exampleChannel,
    reason,
    formulaCapable: shape.source === "formula",
   }
  },
 )

 const statusPriority: Record<DataCoverageStatus, number> = {
  received: 4,
  missing: 3,
  not_applicable: 2,
  not_connected: 1,
 }
 const sourcePriority: Record<DataCoverageSource, number> = {
  formula: 4,
  youtube: 3,
  ga4: 2,
  history_placeholder: 1,
 }

 // Canonical contract truth: one row per canonical key + scope combination.
 // Keep the strongest evidence row when duplicates emerge from mixed buckets/sources.
 const collapsedByCanonical = new Map<string, DataCoverageRow>()
 expandedRows.forEach((row) => {
  const key = `${row.canonicalKey}::${row.scope}`
  const existing = collapsedByCanonical.get(key)
  if (!existing) {
   collapsedByCanonical.set(key, row)
   return
  }

  const existingScore =
   statusPriority[existing.status] * 10 + sourcePriority[existing.source]
  const nextScore = statusPriority[row.status] * 10 + sourcePriority[row.source]
  if (nextScore > existingScore) {
   collapsedByCanonical.set(key, row)
   return
  }

  if (existing.example === "-" && row.example !== "-") {
   collapsedByCanonical.set(key, { ...existing, example: row.example })
  }
 })

 const rows = Array.from(collapsedByCanonical.values())

 // Sort both collections alphabetically by category name to fulfill user preference.
 const sortAlphabetical = (r: DataCoverageRow[]) => {
  r.sort((a, b) =>
   a.categoryName.localeCompare(b.categoryName, undefined, {
    sensitivity: "base",
   }),
  )
 }

 sortAlphabetical(rows)
 sortAlphabetical(expandedRows)

 const perScope = emptyScopeCounts()
 rows.forEach((row) => {
  perScope[row.scope] += 1
 })

 const receivedCount = rows.filter((row) => row.status === "received").length
 const connectedSourcesTotal = rows.filter(
  (row) =>
   row.source === "youtube" ||
   (row.source === "ga4" && ga4Cache && Object.keys(ga4Cache).length > 0) ||
   row.source === "formula",
 ).length
 const fullCatalogTotal = DATA_COVERAGE_CATALOG.length

 const summary: DataCoverageSummary = {
  totalCategories: rows.length,
  perScope,
  historyNotConnected: rows.filter((row) => row.scope === "history").length,
  receivedCount,
  connectedSourcesTotal,
  fullCatalogTotal,
 }

 return { expandedRows, rows, summary }
}
