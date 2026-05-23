import { metricCellValue } from "../../../services/analyticsSelectors"

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
])

export type KeywordMetricMode = "views" | "likes" | "shares" | "comments" | "engagement_matrix"

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

interface KeywordVideoPoint {
  title: string
  views: number
  likes: number
  shares: number
  comments: number
  keywords: Set<string>
}

const round2 = (value: number): number => Math.round(value * 100) / 100

const safeNum = (value: unknown): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export const tokenizeTitleKeywords = (title: string): string[] => {
  const normalized = (title || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ")
  const tokens = normalized.split(/\s+/).filter(Boolean)
  return Array.from(new Set(tokens.filter((token) => token.length >= 3 && !STOP_WORDS.has(token))))
}

const toVideoPoints = (rows: any[]): KeywordVideoPoint[] => {
  return rows
    .map((row) => {
      const title = String(row?.title || "").trim()
      if (!title) return null
      const keywords = new Set(tokenizeTitleKeywords(title))
      if (!keywords.size) return null

      const views = safeNum(metricCellValue(row?.metrics?.views))
      const likes = safeNum(metricCellValue(row?.metrics?.likes))
      const comments = safeNum(metricCellValue(row?.metrics?.comments))
      const shares = safeNum(metricCellValue(row?.metrics?.shares))

      return {
        title,
        views,
        likes,
        shares,
        comments,
        keywords,
      }
    })
    .filter(Boolean) as KeywordVideoPoint[]
}

const engagementMatrix = (avgViews: number, avgLikes: number, avgShares: number, avgComments: number): number => {
  const safeViews = Math.max(1, avgViews)
  const rate = (avgLikes + avgComments + avgShares) / safeViews
  const volume = Math.log(Math.max(1, avgViews))
  return 0.6 * rate + 0.4 * volume
}

const byModeValue = (mode: KeywordMetricMode, avgViews: number, avgLikes: number, avgShares: number, avgComments: number): number => {
  if (mode === "views") return avgViews
  if (mode === "likes") return avgLikes
  if (mode === "shares") return avgShares
  if (mode === "comments") return avgComments
  return engagementMatrix(avgViews, avgLikes, avgShares, avgComments)
}

const slotForRank = (rank: number): number => {
  if (rank <= 3) return rank - 1
  if (rank <= 6) return rank - 1
  return rank - 1
}

const tierForRank = (rank: number): KeywordNode["tier"] => {
  if (rank <= 3) return "core"
  if (rank <= 6) return "mid"
  return "outer"
}

export const buildKeywordConstellationDataset = (rows: any[], mode: KeywordMetricMode): KeywordConstellationDataset => {
  const videos = toVideoPoints(rows)
  const totalVideos = videos.length

  const acc = new Map<string, { views: number; likes: number; shares: number; comments: number; count: number }>()

  videos.forEach((video) => {
    video.keywords.forEach((word) => {
      const current = acc.get(word) || { views: 0, likes: 0, shares: 0, comments: 0, count: 0 }
      current.views += video.views
      current.likes += video.likes
      current.shares += video.shares
      current.comments += video.comments
      current.count += 1
      acc.set(word, current)
    })
  })

  const ranked = Array.from(acc.entries())
    .map(([word, stats]) => {
      const avgViews = stats.count ? stats.views / stats.count : 0
      const avgLikes = stats.count ? stats.likes / stats.count : 0
      const avgShares = stats.count ? stats.shares / stats.count : 0
      const avgComments = stats.count ? stats.comments / stats.count : 0
      const primaryMetricValue = byModeValue(mode, avgViews, avgLikes, avgShares, avgComments)
      const engagementMatrixValue = engagementMatrix(avgViews, avgLikes, avgShares, avgComments)
      const coveragePct = totalVideos > 0 ? (stats.count / totalVideos) * 100 : 0

      return {
        word,
        videoCount: stats.count,
        avgViews: round2(avgViews),
        avgLikes: round2(avgLikes),
        avgShares: round2(avgShares),
        avgComments: round2(avgComments),
        coveragePct: round2(coveragePct),
        primaryMetricValue,
        engagementMatrixValue,
      }
    })
    .filter((item) => item.videoCount >= 2)
    .sort((a, b) => {
      if (b.primaryMetricValue !== a.primaryMetricValue) return b.primaryMetricValue - a.primaryMetricValue
      if (b.videoCount !== a.videoCount) return b.videoCount - a.videoCount
      return a.word.localeCompare(b.word)
    })
    .slice(0, 10)

  const nodes: KeywordNode[] = ranked.map((entry, index) => {
    const rank = index + 1
    return {
      word: entry.word,
      rank,
      slot: slotForRank(rank),
      tier: tierForRank(rank),
      videoCount: entry.videoCount,
      coveragePct: entry.coveragePct,
      avgViews: entry.avgViews,
      avgLikes: entry.avgLikes,
      avgShares: entry.avgShares,
      avgComments: entry.avgComments,
      primaryMetricValue: round2(entry.primaryMetricValue),
      engagementMatrixValue: round2(entry.engagementMatrixValue),
    }
  })

  return {
    mode,
    nodes,
    totalVideos,
  }
}

export const buildKeywordSelectionSummary = (
  rows: any[],
  selectedKeywords: string[],
  mode: KeywordMetricMode,
): KeywordSelectionSummary | null => {
  if (!selectedKeywords.length) return null

  const videos = toVideoPoints(rows)
  if (!videos.length) return null

  const normalizedSelection = Array.from(new Set(selectedKeywords.map((item) => item.toLowerCase()))).slice(0, 3)
  if (!normalizedSelection.length) return null

  const matches = videos.filter((video) => normalizedSelection.every((keyword) => video.keywords.has(keyword)))
  const videoCount = matches.length

  const totalViews = matches.reduce((sum, item) => sum + item.views, 0)
  const totalLikes = matches.reduce((sum, item) => sum + item.likes, 0)
  const totalShares = matches.reduce((sum, item) => sum + item.shares, 0)
  const totalComments = matches.reduce((sum, item) => sum + item.comments, 0)

  const avgViews = videoCount ? totalViews / videoCount : 0
  const avgLikes = videoCount ? totalLikes / videoCount : 0
  const avgShares = videoCount ? totalShares / videoCount : 0
  const avgComments = videoCount ? totalComments / videoCount : 0

  const coveragePct = videos.length > 0 ? (videoCount / videos.length) * 100 : 0
  const primaryMetricValue = byModeValue(mode, avgViews, avgLikes, avgShares, avgComments)

  const sampleTitles = matches
    .slice()
    .sort((a, b) => {
      if (b.views !== a.views) return b.views - a.views
      return a.title.localeCompare(b.title)
    })
    .slice(0, 3)
    .map((item) => item.title)

  return {
    keywords: normalizedSelection,
    mode,
    videoCount,
    coveragePct: round2(coveragePct),
    avgViews: round2(avgViews),
    avgLikes: round2(avgLikes),
    avgShares: round2(avgShares),
    avgComments: round2(avgComments),
    primaryMetricValue: round2(primaryMetricValue),
    sampleTitles,
  }
}

export const modeLabel = (mode: KeywordMetricMode): string => {
  if (mode === "engagement_matrix") return "Engagement Matrix"
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}
