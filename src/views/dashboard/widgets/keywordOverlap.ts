import {
  buildKeywordClustersFromMasterRows,
  buildKeywordSelectionSummary as buildSharedKeywordSelectionSummary,
  countKeywordVideos,
  legacyKeywordMetricModeToKey,
  tokenizeTitleKeywords,
  type KeywordClusterStat,
  type KeywordCombinationStat,
  type LegacyKeywordMetricMode,
} from "../../../services/keywordVennAnalysis"

export type KeywordMetricMode = LegacyKeywordMetricMode

export interface KeywordNode {
  word: string
  rank: number
  slot: number
  tier: "core" | "mid" | "outer"
  videoCount: number
  coveragePct: number
  avgViews: number
  avgLikes: number
  avgShares: number
  avgComments: number
  primaryMetricValue: number
  engagementMatrixValue: number
}

export interface KeywordSelectionSummary {
  keywords: string[]
  mode: KeywordMetricMode
  videoCount: number
  coveragePct: number
  avgViews: number
  avgLikes: number
  avgShares: number
  avgComments: number
  primaryMetricValue: number
  sampleTitles: string[]
}

export interface KeywordConstellationDataset {
  mode: KeywordMetricMode
  nodes: KeywordNode[]
  totalVideos: number
}

const slotForRank = (rank: number): number => rank - 1

const tierForRank = (rank: number): KeywordNode["tier"] => {
  if (rank <= 3) return "core"
  if (rank <= 6) return "mid"
  return "outer"
}

const toKeywordNode = (entry: KeywordClusterStat): KeywordNode => ({
  word: entry.word,
  rank: entry.rank,
  slot: slotForRank(entry.rank),
  tier: tierForRank(entry.rank),
  videoCount: entry.videoCount,
  coveragePct: entry.coveragePct,
  avgViews: entry.videoCount > 0 ? entry.metrics.views / entry.videoCount : 0,
  avgLikes: entry.videoCount > 0 ? entry.metrics.likes / entry.videoCount : 0,
  avgShares: entry.videoCount > 0 ? entry.metrics.shares / entry.videoCount : 0,
  avgComments: entry.videoCount > 0 ? entry.metrics.comments / entry.videoCount : 0,
  primaryMetricValue: entry.metricValue,
  engagementMatrixValue: entry.metrics.engagement_matrix,
})

const toSelectionSummary = (
  summary: KeywordCombinationStat,
  mode: KeywordMetricMode,
): KeywordSelectionSummary => ({
  keywords: summary.keywords,
  mode,
  videoCount: summary.videoCount,
  coveragePct: summary.coveragePct,
  avgViews: summary.videoCount > 0 ? summary.metrics.views / summary.videoCount : 0,
  avgLikes: summary.videoCount > 0 ? summary.metrics.likes / summary.videoCount : 0,
  avgShares: summary.videoCount > 0 ? summary.metrics.shares / summary.videoCount : 0,
  avgComments: summary.videoCount > 0 ? summary.metrics.comments / summary.videoCount : 0,
  primaryMetricValue: summary.metricValue,
  sampleTitles: summary.sampleTitles,
})

export const buildKeywordConstellationDataset = (
  rows: any[],
  mode: KeywordMetricMode,
): KeywordConstellationDataset => {
  const metricKey = legacyKeywordMetricModeToKey(mode)
  const clusters = buildKeywordClustersFromMasterRows(rows, metricKey, {
    minSupport: 2,
    maxKeywords: 10,
  })

  return {
    mode,
    nodes: clusters.map(toKeywordNode),
    totalVideos: countKeywordVideos(rows),
  }
}

export const buildKeywordSelectionSummary = (
  rows: any[],
  selectedKeywords: string[],
  mode: KeywordMetricMode,
): KeywordSelectionSummary | null => {
  const metricKey = legacyKeywordMetricModeToKey(mode)
  const summary = buildSharedKeywordSelectionSummary(rows, selectedKeywords, metricKey)
  return summary ? toSelectionSummary(summary, mode) : null
}

export const modeLabel = (mode: KeywordMetricMode): string => {
  if (mode === "engagement_matrix") return "Engagement Matrix"
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

export { tokenizeTitleKeywords }
