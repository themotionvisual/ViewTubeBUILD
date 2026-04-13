import { METRIC_REGISTRY, canonicalizeMetricKey } from "./analyticsContract"

export type DataCoverageSource = "youtube" | "ga4" | "history_placeholder"
export type DataCoverageScope =
 | "channel"
 | "video_shared"
 | "short_only"
 | "long_only"
 | "geo"
 | "demographic"
 | "traffic"
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
}

export interface DataCoverageSummary {
 totalCategories: number
 perScope: Record<DataCoverageScope, number>
 historyNotConnected: number
}

export interface DataCoverageInventory {
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

const parseReportRows = (report: any): Record<string, unknown>[] => {
 if (!report || !Array.isArray(report.rows)) return []
 if (!Array.isArray(report.columnHeaders)) {
  return report.rows.filter(
   (row: unknown): row is Record<string, unknown> =>
    !!row && typeof row === "object" && !Array.isArray(row),
  )
 }
 const headers: string[] = report.columnHeaders.map((h: { name?: string }) =>
  String(h?.name || ""),
 )
 return report.rows
  .map((row: unknown) => {
   if (!Array.isArray(row)) return null
   const rowValues = row as unknown[]
   const obj: Record<string, unknown> = {}
   headers.forEach((header: string, idx: number) => {
    if (header) obj[header] = rowValues[idx]
   })
   return obj
  })
  .filter((row: Record<string, unknown> | null): row is Record<string, unknown> => !!row)
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

const extractObjectKeys = (obj: Record<string, unknown> | null | undefined): string[] => {
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
 rows: any[],
 keyCandidates: string[],
): string => {
 for (const row of rows) {
  const merged = { ...(row || {}), ...((row && row._originalData) || {}) } as Record<string, unknown>
  for (const key of keyCandidates) {
   const value = merged[key]
   const display = toDisplay(value)
   if (display !== "-") return display
  }
 }
 return "-"
}

const resolveValueFromObjects = (
 objects: Array<Record<string, unknown>>,
 keyCandidates: string[],
): string => {
 for (const obj of objects) {
  for (const key of keyCandidates) {
   const value = obj[key]
   const display = toDisplay(value)
   if (display !== "-") return display
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

const extractScalarKeysFromRows = (rows: any[]): Set<string> => {
 const keys = new Set<string>()
 rows.forEach((row) => {
  const merged = { ...(row || {}), ...((row && row._originalData) || {}) } as Record<string, unknown>
  Object.entries(merged).forEach(([key, value]) => {
   if (!key || key.startsWith("__") || key === "_originalData") return
   if (isScalar(value)) keys.add(key)
  })
 })
 return keys
}

const isLikelyShort = (row: any): boolean => {
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

const isLikelyLong = (row: any): boolean => {
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

export const buildDataCoverageInventory = (
 masterTableRows: any[],
): DataCoverageInventory => {
 const aliasMap = buildAliasMap()
 const fallbackMap = new Map<string, string>([
  ["viewerpercentage", "viewerPercentage"],
  ["viewspercentage", "viewerPercentage"],
  ["videothumbnailimpressions", "impressions"],
  ["videothumbnailimpressionsclickrate", "ctr"],
 ])

 const ytCache = safeParse<Record<string, any>>(
  localStorage.getItem("yt_analytics_cache"),
  {},
 )
 const ga4Cache = safeParse<Record<string, any>>(
  localStorage.getItem("ga4_analytics_cache"),
  {},
 )

 const shortRows = masterTableRows.filter(
  (r) => r?.Format === "Shorts" || r?.Format === "SHORTS" || r?.format === "shorts",
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
 const cachedLongRows = cachedVideoRows.filter((row) => isLikelyLong(row) && !isLikelyShort(row))
 const cachedUnscopedVideoRows = cachedVideoRows.filter(
  (row) => !isLikelyShort(row) && !isLikelyLong(row),
 )

 const analyticsByWindowRows: Record<string, unknown>[] = []
 if (ytCache.analyticsByWindow && typeof ytCache.analyticsByWindow === "object") {
  Object.values(ytCache.analyticsByWindow as Record<string, unknown>).forEach((report) => {
   analyticsByWindowRows.push(...parseReportRows(report))
  })
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

 const demographicRows = parseReportRows(ytCache.demographics)
 demographicRows.forEach((row) => {
  extractObjectKeys(row).forEach((raw) => {
   const normalized = canonicalizeMetricKey(raw)
   const scope: DataCoverageScope =
    normalized.includes("country") || normalized.includes("city") || normalized.includes("province")
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
  const scope: DataCoverageScope = inShort && inLong ? "video_shared" : inShort ? "short_only" : inLong ? "long_only" : "video_shared"
  upsertShape(
   shapes,
   normalizeKey(raw, aliasMap, fallbackMap),
   raw,
   "youtube",
   scope,
  )
 })

 // Keep contract keys visible even if absent in current payloads.
 Object.values(METRIC_REGISTRY).forEach((def) => {
  const norm = canonicalizeMetricKey(def.key)
  const appearsInShort = Array.from(shortKeys).some(
   (raw) => normalizeKey(raw, aliasMap, fallbackMap) === def.key,
  )
  const appearsInLong = Array.from(longKeys).some(
   (raw) => normalizeKey(raw, aliasMap, fallbackMap) === def.key,
  )
  const scope: DataCoverageScope =
   appearsInShort && appearsInLong
    ? "video_shared"
    : appearsInShort
     ? "short_only"
     : appearsInLong
      ? "long_only"
      : "video_shared"
  upsertShape(shapes, aliasMap.get(norm) || def.key, def.label, "youtube", scope)
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
  ...((ga4Cache.overview && typeof ga4Cache.overview === "object"
   ? [ga4Cache.overview as Record<string, unknown>]
   : []) as Record<string, unknown>[]),
 ]

 const rows: DataCoverageRow[] = Array.from(shapes.values()).map((shape) => {
  const keyCandidates = Array.from(shape.rawNames)
  if (!keyCandidates.includes(shape.canonicalKey)) keyCandidates.unshift(shape.canonicalKey)

  const isHistory = shape.scope === "history" || shape.source === "history_placeholder"

  const example =
   shape.scope === "short_only"
    ? resolveValueFromRows(shortVideoPool, keyCandidates)
    : shape.scope === "long_only"
     ? resolveValueFromRows(longVideoPool, keyCandidates)
     : shape.scope === "video_shared"
      ? (() => {
         const fromShort = resolveValueFromRows(shortVideoPool, keyCandidates)
         if (fromShort !== "-") return fromShort
         const fromLong = resolveValueFromRows(longVideoPool, keyCandidates)
         if (fromLong !== "-") return fromLong
         return resolveValueFromRows(sharedVideoPool, keyCandidates)
        })()
      : shape.scope === "history"
       ? "Not Connected"
       : resolveValueFromObjects(channelExampleObjects, keyCandidates)

  const exampleChannel =
   isHistory ? "Not Connected" : resolveValueFromObjects(channelExampleObjects, keyCandidates)

  const shortPoolAvailable = shortVideoPool.length > 0
  const longPoolAvailable = longVideoPool.length > 0
  const status: DataCoverageStatus = isHistory
   ? "not_connected"
   : shape.scope === "short_only" && !shortPoolAvailable
    ? "not_applicable"
    : shape.scope === "long_only" && !longPoolAvailable
     ? "not_applicable"
     : example !== "-" || exampleChannel !== "-"
      ? "received"
      : "missing"

  return {
   categoryName: keyCandidates[0] || shape.canonicalKey,
   canonicalKey: shape.canonicalKey,
   source: shape.source,
   scope: shape.scope,
   status,
   example,
   exampleChannel,
  }
 })

 const scopeOrder: DataCoverageScope[] = [
  "channel",
  "video_shared",
  "short_only",
  "long_only",
  "geo",
  "demographic",
  "traffic",
  "daily",
  "history",
 ]
 rows.sort((a, b) => {
  const scopeDiff = scopeOrder.indexOf(a.scope) - scopeOrder.indexOf(b.scope)
  if (scopeDiff !== 0) return scopeDiff
  return a.categoryName.localeCompare(b.categoryName, undefined, { sensitivity: "base" })
 })

 const perScope = emptyScopeCounts()
 rows.forEach((row) => {
  perScope[row.scope] += 1
 })

 const summary: DataCoverageSummary = {
  totalCategories: rows.length,
  perScope,
  historyNotConnected: rows.filter((row) => row.scope === "history").length,
 }

 return { rows, summary }
}
