import type { CanonicalMetricKey, CanonicalVideoRow } from "./analytics/DataStore"
import { resolveMetricNumber } from "./analytics/MetricRegistry"
import { metricCellValue } from "./analytics/Selectors"

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "with",
  "for",
  "to",
  "of",
  "from",
  "at",
  "by",
  "is",
  "are",
  "was",
  "were",
  "this",
  "that",
  "it",
  "as",
  "be",
  "how",
  "what",
  "why",
  "who",
  "when",
  "where",
  "which",
  "video",
  "videos",
  "your",
  "you",
  "our",
  "their",
  "his",
  "her",
  "its",
  "into",
  "over",
  "under",
  "after",
  "before",
  "through",
  "about",
  "from",
  "than",
  "then",
  "just",
  "more",
  "most",
  "less",
  "very",
  "ever",
  "really",
  "also",
  "used",
  "use",
  "using",
  "make",
  "made",
  "get",
  "got",
  "can",
  "will",
  "not",
  "too",
])

export type KeywordMetricKey =
  | "impressions"
  | "views"
  | "engagedViews"
  | "averageViewDuration"
  | "averageViewPercentage"
  | "rpm"
  | "subscribersGained"
  | "likes"
  | "comments"
  | "shares"
  | "revenue"
  | "engagement_matrix"

type AggregationMode = "sum" | "average" | "derived_average"

export interface KeywordMetricDefinition {
  key: KeywordMetricKey
  label: string
  aggregation: AggregationMode
  canonicalMetricKey?: CanonicalMetricKey
}

export interface KeywordVennVideoRow {
  rowId: string
  videoId: string
  title: string
  keywords: string[]
  metrics: Record<KeywordMetricKey, number>
}

export interface KeywordClusterStat {
  word: string
  rank: number
  videoCount: number
  coveragePct: number
  metricValue: number
  metrics: Record<KeywordMetricKey, number>
  videoIds: string[]
  sampleTitles: string[]
}

export interface KeywordCombinationStat {
  keywords: string[]
  videoCount: number
  coveragePct: number
  metricValue: number
  metrics: Record<KeywordMetricKey, number>
  videoIds: string[]
  sampleTitles: string[]
}

const DEFINITIONS: Record<KeywordMetricKey, KeywordMetricDefinition> = {
  impressions: { key: "impressions", label: "Impressions", aggregation: "sum", canonicalMetricKey: "impressions" },
  views: { key: "views", label: "Views", aggregation: "sum", canonicalMetricKey: "views" },
  engagedViews: { key: "engagedViews", label: "Engaged Views", aggregation: "sum", canonicalMetricKey: "engagedViews" },
  averageViewDuration: {
    key: "averageViewDuration",
    label: "Average View Duration",
    aggregation: "average",
    canonicalMetricKey: "avdSeconds",
  },
  averageViewPercentage: {
    key: "averageViewPercentage",
    label: "Average View Percentage",
    aggregation: "average",
    canonicalMetricKey: "avp",
  },
  rpm: { key: "rpm", label: "RPM", aggregation: "average", canonicalMetricKey: "rpm" },
  subscribersGained: {
    key: "subscribersGained",
    label: "Subscribers Gained",
    aggregation: "sum",
    canonicalMetricKey: "subscribersGained",
  },
  likes: { key: "likes", label: "Likes", aggregation: "sum", canonicalMetricKey: "likes" },
  comments: { key: "comments", label: "Comments", aggregation: "sum", canonicalMetricKey: "comments" },
  shares: { key: "shares", label: "Shares", aggregation: "sum", canonicalMetricKey: "shares" },
  revenue: { key: "revenue", label: "Revenue", aggregation: "sum", canonicalMetricKey: "revenue" },
  engagement_matrix: { key: "engagement_matrix", label: "Engagement Matrix", aggregation: "derived_average" },
}

const METRIC_KEYS = Object.keys(DEFINITIONS) as KeywordMetricKey[]

export const KEYWORD_VENN_METRIC_OPTIONS: KeywordMetricKey[] = [
  "impressions",
  "views",
  "engagedViews",
  "averageViewDuration",
  "averageViewPercentage",
  "rpm",
  "subscribersGained",
  "likes",
  "comments",
  "shares",
  "revenue",
]

const LEGACY_MODE_MAP = {
  views: "views",
  likes: "likes",
  shares: "shares",
  comments: "comments",
  engagement_matrix: "engagement_matrix",
} as const

export type LegacyKeywordMetricMode = keyof typeof LEGACY_MODE_MAP

const round2 = (value: number): number => Math.round(value * 100) / 100

const safeNum = (value: unknown): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const topLevelMetricAliases: Record<KeywordMetricKey, string[]> = {
  impressions: ["impressions", "Impressions"],
  views: ["views", "Views"],
  engagedViews: ["engagedViews", "Engaged views", "Engaged Views"],
  averageViewDuration: ["averageViewDuration", "Average view duration", "Average View Duration", "avdSeconds", "AVD"],
  averageViewPercentage: ["averageViewPercentage", "Average percentage viewed (%)", "AVP %", "avp"],
  rpm: ["rpm", "RPM"],
  subscribersGained: ["subscribersGained", "Subscribers gained", "Subscribers Gained"],
  likes: ["likes", "Likes"],
  comments: ["comments", "Comments", "Comments added"],
  shares: ["shares", "Shares"],
  revenue: ["revenue", "Revenue", "Estimated revenue (USD)", "Estimated Revenue (USD)"],
  engagement_matrix: [],
}

const normalizeSelection = (selectedKeywords: string[]): string[] =>
  Array.from(
    new Set(
      selectedKeywords
        .map((item) => String(item || "").trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 3)

const readTopLevelMetric = (
  row: Record<string, unknown>,
  metricKey: KeywordMetricKey,
): number | null => {
  for (const alias of topLevelMetricAliases[metricKey]) {
    if (!Object.prototype.hasOwnProperty.call(row, alias)) continue
    const parsed = Number(row[alias])
    if (Number.isFinite(parsed)) return parsed
    if (typeof row[alias] === "string") {
      const cleaned = String(row[alias]).replace(/[$,%\s,]/g, "").trim()
      const next = Number(cleaned)
      if (Number.isFinite(next)) return next
    }
  }
  return null
}

const readMetric = (
  row: Record<string, unknown>,
  metricKey: KeywordMetricKey,
): number => {
  const definition = DEFINITIONS[metricKey]
  if (definition.canonicalMetricKey && row.metrics) {
    const canonicalLike = row as CanonicalVideoRow
    const resolved = resolveMetricNumber(canonicalLike, definition.canonicalMetricKey)
    if (typeof resolved.value === "number" && Number.isFinite(resolved.value)) {
      return resolved.value
    }

    const metricRecord = canonicalLike.metrics as Record<string, unknown>
    const directCell = metricCellValue(metricRecord[definition.canonicalMetricKey] as any)
    if (typeof directCell === "number" && Number.isFinite(directCell)) {
      return directCell
    }
  }

  const topLevel = readTopLevelMetric(row, metricKey)
  return topLevel ?? 0
}

const engagementMatrixValue = (row: KeywordVennVideoRow): number => {
  const safeViews = Math.max(1, row.metrics.views)
  const rate =
    (row.metrics.likes + row.metrics.comments + row.metrics.shares) / safeViews
  const volume = Math.log(Math.max(1, row.metrics.views))
  return 0.6 * rate + 0.4 * volume
}

const emptyMetricRecord = (): Record<KeywordMetricKey, number> =>
  METRIC_KEYS.reduce(
    (acc, key) => {
      acc[key] = 0
      return acc
    },
    {} as Record<KeywordMetricKey, number>,
  )

const computeMetricRecord = (
  rows: KeywordVennVideoRow[],
): Record<KeywordMetricKey, number> => {
  const result = emptyMetricRecord()
  if (!rows.length) return result

  for (const key of METRIC_KEYS) {
    const definition = DEFINITIONS[key]
    if (definition.aggregation === "sum") {
      result[key] = rows.reduce((sum, row) => sum + row.metrics[key], 0)
      continue
    }
    if (definition.aggregation === "average") {
      result[key] =
        rows.reduce((sum, row) => sum + row.metrics[key], 0) / rows.length
      continue
    }
    result[key] =
      rows.reduce((sum, row) => sum + engagementMatrixValue(row), 0) /
      rows.length
  }

  return METRIC_KEYS.reduce(
    (acc, key) => {
      acc[key] = round2(result[key])
      return acc
    },
    {} as Record<KeywordMetricKey, number>,
  )
}

export const tokenizeTitleKeywords = (title: string): string[] => {
  const normalized = String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
  const tokens = normalized.split(/\s+/).filter(Boolean)
  return Array.from(
    new Set(
      tokens.filter((token) => {
        if (token.length < 3) return false
        if (STOP_WORDS.has(token)) return false
        if (/^\d+$/.test(token)) return token.length >= 4
        return true
      }),
    ),
  )
}

export const buildKeywordVideoRows = (
  rows: Array<Record<string, unknown>>,
): KeywordVennVideoRow[] =>
  rows
    .map((row, index) => {
      const title = String(row?.title || "").trim()
      if (!title) return null
      const keywords = tokenizeTitleKeywords(title)
      if (!keywords.length) return null

      const videoId = String(
        row?.videoId || row?.id || row?._id || `${title}-${index}`,
      )

      const metrics = METRIC_KEYS.reduce(
        (acc, key) => {
          acc[key] = key === "engagement_matrix" ? 0 : readMetric(row, key)
          return acc
        },
        {} as Record<KeywordMetricKey, number>,
      )

      return {
        rowId: `${videoId}-${index}`,
        videoId,
        title,
        keywords,
        metrics,
      }
    })
    .filter(Boolean) as KeywordVennVideoRow[]

export const buildKeywordClustersFromMasterRows = (
  rows: Array<Record<string, unknown>>,
  metricKey: KeywordMetricKey,
  options?: { minSupport?: number; maxKeywords?: number },
): KeywordClusterStat[] => {
  const minSupport = options?.minSupport ?? 2
  const maxKeywords = options?.maxKeywords ?? 15
  const videos = buildKeywordVideoRows(rows)
  const totalVideos = videos.length
  const groups = new Map<string, KeywordVennVideoRow[]>()

  videos.forEach((video) => {
    video.keywords.forEach((keyword) => {
      const next = groups.get(keyword) || []
      next.push(video)
      groups.set(keyword, next)
    })
  })

  return Array.from(groups.entries())
    .filter(([, matched]) => matched.length >= minSupport)
    .map(([word, matched]) => {
      const metrics = computeMetricRecord(matched)
      return {
        word,
        rank: 0,
        videoCount: matched.length,
        coveragePct: totalVideos > 0 ? round2((matched.length / totalVideos) * 100) : 0,
        metricValue: metrics[metricKey],
        metrics,
        videoIds: matched.map((item) => item.videoId),
        sampleTitles: matched
          .slice()
          .sort((a, b) => b.metrics.views - a.metrics.views)
          .slice(0, 3)
          .map((item) => item.title),
      }
    })
    .sort((a, b) => {
      if (b.metricValue !== a.metricValue) return b.metricValue - a.metricValue
      if (b.videoCount !== a.videoCount) return b.videoCount - a.videoCount
      return a.word.localeCompare(b.word)
    })
    .slice(0, maxKeywords)
    .map((item, index) => ({ ...item, rank: index + 1 }))
}

const buildCombinationStatFromVideos = (
  videos: KeywordVennVideoRow[],
  keywords: string[],
  totalVideos: number,
  metricKey: KeywordMetricKey,
): KeywordCombinationStat => {
  const metrics = computeMetricRecord(videos)
  return {
    keywords,
    videoCount: videos.length,
    coveragePct: totalVideos > 0 ? round2((videos.length / totalVideos) * 100) : 0,
    metricValue: metrics[metricKey],
    metrics,
    videoIds: videos.map((item) => item.videoId),
    sampleTitles: videos
      .slice()
      .sort((a, b) => b.metrics.views - a.metrics.views)
      .slice(0, 3)
      .map((item) => item.title),
  }
}

export const buildKeywordCombinationStats = (
  rows: Array<Record<string, unknown>>,
  selectedKeywords: string[],
  metricKey: KeywordMetricKey,
): KeywordCombinationStat[] => {
  const videos = buildKeywordVideoRows(rows)
  const totalVideos = videos.length
  const selected = normalizeSelection(selectedKeywords)
  if (!selected.length) return []

  const combos: string[][] = []
  selected.forEach((keyword) => combos.push([keyword]))
  if (selected.length >= 2) {
    for (let i = 0; i < selected.length; i += 1) {
      for (let j = i + 1; j < selected.length; j += 1) {
        combos.push([selected[i], selected[j]])
      }
    }
  }
  if (selected.length === 3) combos.push([...selected])

  return combos.map((keywords) => {
    const matched = videos.filter((video) =>
      keywords.every((keyword) => video.keywords.includes(keyword)),
    )
    return buildCombinationStatFromVideos(matched, keywords, totalVideos, metricKey)
  })
}

export const buildKeywordSelectionSummary = (
  rows: Array<Record<string, unknown>>,
  selectedKeywords: string[],
  metricKey: KeywordMetricKey,
): KeywordCombinationStat | null => {
  const selected = normalizeSelection(selectedKeywords)
  if (!selected.length) return null
  const stats = buildKeywordCombinationStats(rows, selected, metricKey)
  return (
    stats.find(
      (item) =>
        item.keywords.length === selected.length &&
        item.keywords.every((keyword, index) => keyword === selected[index]),
    ) || null
  )
}

export const toggleKeywordSelection = (
  currentSelection: string[],
  nextKeyword: string,
  maxSelected = 3,
): string[] => {
  const keyword = String(nextKeyword || "").trim().toLowerCase()
  if (!keyword) return currentSelection
  if (currentSelection.includes(keyword)) {
    return currentSelection.filter((entry) => entry !== keyword)
  }
  if (currentSelection.length >= maxSelected) {
    return [...currentSelection.slice(1), keyword]
  }
  return [...currentSelection, keyword]
}

export const getKeywordMetricDefinition = (
  metricKey: KeywordMetricKey,
): KeywordMetricDefinition => DEFINITIONS[metricKey]

export const formatKeywordMetricValue = (
  metricKey: KeywordMetricKey,
  value: number,
): string => {
  if (!Number.isFinite(value)) return metricKey === "revenue" || metricKey === "rpm" ? "$0.00" : "0"
  if (metricKey === "revenue" || metricKey === "rpm") {
    return `$${value.toFixed(2)}`
  }
  if (metricKey === "averageViewPercentage") {
    return `${round2(value).toFixed(2).replace(/\.00$/, "")}%`
  }
  if (metricKey === "averageViewDuration") {
    const totalSeconds = Math.max(0, Math.round(value))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
      const remainingMinutes = minutes % 60
      return `${hours}:${String(remainingMinutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    }
    return `${minutes}:${String(seconds).padStart(2, "0")}`
  }
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return `${Math.round(value)}`
}

export const legacyKeywordMetricModeToKey = (
  mode: LegacyKeywordMetricMode,
): KeywordMetricKey => LEGACY_MODE_MAP[mode]

export const countKeywordVideos = (rows: Array<Record<string, unknown>>): number =>
  buildKeywordVideoRows(rows).length
