import React, { useMemo } from "react"
import { WidgetShell } from "../WidgetShell"
import { WidgetSection } from "../WidgetPrimitives"
import { Search } from "lucide-react"
import { getMasterRows, metricCellValue } from "../../../services/analytics/Selectors"
import { readYouTubeAnalyticsCache } from "../../../services/analytics/DataStore"
import { getInitialChannelBootstrapSnapshot } from "../../../services/initialChannelBootstrap"
import { getVtSyncSnapshot } from "../../../features/vt-sync-local"

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "of", "from", "by",
  "is", "are", "was", "were", "this", "that", "it", "how", "what", "why", "who", "when", "where",
  "which", "you", "your", "my", "our", "their", "his", "her", "its", "into", "over", "under",
  "after", "before", "through", "about", "than", "then", "just", "more", "most", "less", "very",
  "ever", "really", "also", "used", "use", "using", "make", "made", "get", "got", "can", "will",
  "not", "too", "video", "videos", "shorts", "ep", "part", "vs", "full", "hd", "720p", "1080p", "4k"
])

function extractKeywordsFromText(text: string): string[] {
  if (!text || typeof text !== "string") return []
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w) && !/^\d{1,3}$/.test(w))
}

function resolveVideoViews(row: any, cacheStats?: Record<string, any>): number {
  if (!row) return 0
  const orig = row.originalData || row._originalData || row.rawVideo || {}
  const rawId = String(row.videoId || row.id || row.VideoId || orig.id || orig.videoId || "").trim()
  const cleanId = rawId.replace(/^(api-|video-|row-)/, "")

  // 1. Direct views properties
  for (const target of [row, orig]) {
    if (typeof target.views === "number" && !isNaN(target.views) && target.views > 0) return target.views
    if (typeof target.viewCount === "number" && !isNaN(target.viewCount) && target.viewCount > 0) return target.viewCount
    if (typeof target.Views === "number" && !isNaN(target.Views) && target.Views > 0) return target.Views

    if (target.views && !isNaN(Number(target.views)) && Number(target.views) > 0) return Number(target.views)
    if (target.viewCount && !isNaN(Number(target.viewCount)) && Number(target.viewCount) > 0) return Number(target.viewCount)
    if (target.Views && !isNaN(Number(target.Views)) && Number(target.Views) > 0) return Number(target.Views)

    if (target.statistics?.viewCount && !isNaN(Number(target.statistics.viewCount)) && Number(target.statistics.viewCount) > 0) {
      return Number(target.statistics.viewCount)
    }
    if (target.snippet?.statistics?.viewCount && !isNaN(Number(target.snippet.statistics.viewCount)) && Number(target.snippet.statistics.viewCount) > 0) {
      return Number(target.snippet.statistics.viewCount)
    }
  }

  // 2. Metrics & MetricCell objects across windows
  for (const target of [row, orig]) {
    if (target.metricsByWindow) {
      for (const win of ["lifetime", "28d", "90d", "365d", "7d"]) {
        const winObj = target.metricsByWindow[win]
        if (winObj) {
          const v = winObj.views ?? winObj.viewCount ?? winObj.Views
          const val = typeof v === "object" && v !== null ? (metricCellValue(v) ?? v.value ?? v.actual ?? v.numericValue) : Number(v)
          if (typeof val === "number" && !isNaN(val) && val > 0) return val
        }
      }
    }

    if (target.metrics?.views) {
      const v = target.metrics.views
      const val = typeof v === "object" && v !== null ? (metricCellValue(v) ?? v.value ?? v.actual ?? v.numericValue) : Number(v)
      if (typeof val === "number" && !isNaN(val) && val > 0) return val
    }
  }

  // 3. Look up in cacheStats by cleanId or rawId
  if (cacheStats) {
    for (const key of [cleanId, rawId]) {
      if (key && cacheStats[key]) {
        const stat = cacheStats[key]
        const val = Number(stat.viewCount || stat.views || stat.Views || stat.statistics?.viewCount || 0)
        if (!isNaN(val) && val > 0) return val
      }
    }
  }

  return 0
}

export const KeywordEngineWidget = ({
  widget,
  instance,
  editMode,
  onToggleCollapse,
  onCycleSize,
  onCycleHeight,
  onDecSize,
  onDecHeight,
  onRemove,
  data,
}: any) => {
  const common = {
    widget,
    instance,
    editMode,
    canEdit: true,
    onToggleCollapse,
    onCycleSize,
    onCycleHeight,
    onRemove,
    onDecSize,
    onDecHeight,
  }

  const keywords = useMemo(() => {
    let cache: any = {}
    try {
      cache = readYouTubeAnalyticsCache() || {}
    } catch {}

    const cacheStats = cache.stats || {}
    const cacheVideos = Array.isArray(cache.videos) ? cache.videos : []
    const syncSnapshot = getVtSyncSnapshot()
    const syncVideos = syncSnapshot?.videos || []
    const bootstrapSnapshot = getInitialChannelBootstrapSnapshot()
    const bootstrapVideos = bootstrapSnapshot?.videos || []
    const canonicalRows = data?.canonicalRows || []
    const videoAssets = data?.videoAssets || []
    const brainRows = data?.brain?.canonicalRows || []
    
    let masterRows: any[] = []
    try {
      masterRows = getMasterRows("lifetime", "hybrid", data?.brain?.csvFiles || [])
    } catch {}

    // Deduplicate and merge videos by videoId or title
    const videoMap = new Map<string, { title: string; tags: string[]; views: number }>()

    const ingest = (item: any) => {
      if (!item) return
      const orig = item.originalData || item._originalData || item.rawVideo || {}
      const vid = String(item.videoId || item.id || item.VideoId || orig.id || orig.videoId || "").trim()
      const title = String(
        item.title ||
        item["Video title"] ||
        item.snippet?.title ||
        orig["Video title"] ||
        orig.title ||
        orig.snippet?.title ||
        ""
      ).trim()
      if (!title && !vid) return

      const tags = Array.isArray(item.tags)
        ? item.tags
        : Array.isArray(item.snippet?.tags)
        ? item.snippet.tags
        : Array.isArray(orig.tags)
        ? orig.tags
        : Array.isArray(orig.snippet?.tags)
        ? orig.snippet.tags
        : typeof item.tags === "string"
        ? item.tags.split(",")
        : typeof orig.tags === "string"
        ? orig.tags.split(",")
        : []

      const views = resolveVideoViews(item, cacheStats)
      const key = vid || title.toLowerCase()

      if (!videoMap.has(key)) {
        videoMap.set(key, { title, tags, views })
      } else {
        const existing = videoMap.get(key)!
        if (!existing.title && title) existing.title = title
        if (existing.tags.length === 0 && tags.length > 0) existing.tags = tags
        if (views > existing.views) existing.views = views
      }
    }

    // Ingest all candidate sources
    masterRows.forEach(ingest)
    canonicalRows.forEach(ingest)
    cacheVideos.forEach(ingest)
    syncVideos.forEach(ingest)
    videoAssets.forEach(ingest)
    brainRows.forEach(ingest)
    bootstrapVideos.forEach(ingest)

    // Calculate channel benchmark views per video if individual views were missing in cache
    const totalKnownViews = Array.from(videoMap.values()).reduce((sum, v) => sum + v.views, 0)
    const channelFallbackViews = Math.max(
      100,
      Math.round(
        Number(data?.rawMetrics?.views28d || data?.rawMetrics?.viewsTotal || data?.summaryLifetime?.totals?.views || 1000) /
        Math.max(1, videoMap.size)
      )
    )

    const keywordMap = new Map<string, { views: number; count: number }>()

    videoMap.forEach(({ title, tags, views }) => {
      // If all videos in dataset lacked view counts in cache, apply channel benchmark views
      const effectiveViews = totalKnownViews > 0 ? views : channelFallbackViews
      const titleWords = extractKeywordsFromText(title)
      const tagWords = tags.flatMap((t: string) => extractKeywordsFromText(t))
      const combinedWords = Array.from(new Set([...titleWords, ...tagWords]))

      combinedWords.forEach((word) => {
        if (!keywordMap.has(word)) keywordMap.set(word, { views: 0, count: 0 })
        const stat = keywordMap.get(word)!
        stat.views += effectiveViews
        stat.count += 1
      })
    })

    const entries = Array.from(keywordMap.entries())
    // Filter to keywords appearing in at least 2 videos first to find patterns; if few, show all
    let filtered = entries.filter(([_, stat]) => stat.count >= 2)
    if (filtered.length < 3) {
      filtered = entries.filter(([_, stat]) => stat.count >= 1)
    }

    return filtered
      .map(([word, stat]) => ({
        word: word.toUpperCase(),
        avgViews: Math.round(stat.views / Math.max(1, stat.count)),
        count: stat.count,
      }))
      .sort((a, b) => {
        if (b.avgViews !== a.avgViews) return b.avgViews - a.avgViews
        return b.count - a.count
      })
      .slice(0, 10)
  }, [data?.canonicalRows, data?.videoAssets, data?.brain?.canonicalRows, data?.rawMetrics, data?.lastSyncComplete])

  const maxViews = Math.max(...keywords.map((k) => k.avgViews), 1)

  return (
    <WidgetShell {...common} icon={<Search size={22} />}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: "4px",
          minHeight: 0,
        }}
      >
        <WidgetSection edge="full" className="keyword-engine-heading">
          <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>
            Top Keywords
          </span>
          <span
            style={{
              fontSize: "9px",
              fontWeight: 900,
              textTransform: "uppercase",
              opacity: 0.5,
            }}
          >
            Avg Views
          </span>
        </WidgetSection>

        <div className="keyword-engine-list" aria-label="Keyword engine results">
          {keywords.length === 0 && (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                fontSize: "12px",
                fontWeight: 700,
                opacity: 0.5,
              }}
            >
              Not enough data
            </div>
          )}

          {keywords.map((kw) => {
            const widthPct = Math.max((kw.avgViews / maxViews) * 100, 5)
            return (
              <div key={kw.word} className="keyword-engine-bar">
                <div
                  className="keyword-engine-bar-fill"
                  style={{
                    width: `${widthPct}%`,
                  }}
                />
                <div className="keyword-engine-bar-copy">
                  <span>{kw.word}</span>
                  <strong>{kw.avgViews.toLocaleString()}</strong>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </WidgetShell>
  )
}
