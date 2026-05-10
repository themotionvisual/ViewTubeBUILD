import React, {
 createContext,
 useState,
 useMemo,
 useEffect,
 ReactNode,
 useContext,
} from "react"

// --- TYPES ---
export interface RawVideoData {
 videoId: string
 date: string // YYYY-MM-DD
 title: string
 views: number
 revenue: number
 ctr: number // Click-Through Rate %
 averageViewPercentage: number
 likes: number
 comments: number
 shares: number
 subscribersGained: number
 duration: number // in seconds
 impressions: number
}

export interface NormalizedVideo extends RawVideoData {
 contentArchetype: string
 titleLength: number
 engagementRate: number
 subscriberConversionRate: number
 adjustedAVP: number
}

export interface WorkspaceBrainContext {
 normalizedVideos: NormalizedVideo[]
 selectedVideoIds: string[]
 setSelectedVideoIds: (ids: string[]) => void
 searchQuery: string
 setSearchQuery: (query: string) => void
 dateRange: { start: string; end: string } | null
 setDateRange: (range: { start: string; end: string } | null) => void
}

// --- DEDUPLICATION & ENRICHMENT ALGORITHM ---
function processAndEnrichData(rawData: RawVideoData[]): NormalizedVideo[] {
 const dedupMap = new Map<string, RawVideoData>()

 // 1. The Deduplication Algorithm (composite key: videoId + date)
 // Requirement: Keep the version with the highest `views` count.
 for (const row of rawData) {
  const key = `${row.videoId}_${row.date}`
  if (dedupMap.has(key)) {
   const existing = dedupMap.get(key)!
   if ((row.views || 0) > (existing.views || 0)) {
    dedupMap.set(key, row)
   }
  } else {
   dedupMap.set(key, row)
  }
 }

 // 2. Derive Required Metrics
 return Array.from(dedupMap.values()).map((video) => {
  // Archetype Rules
  let archetype = "Standard"
  if (video.duration < 180) archetype = "Short-Form"
  else if (video.duration > 1200) archetype = "Long-Form Documentary"
  else if (video.title?.includes("Types of") || video.title?.includes("Ways"))
   archetype = "Explainer/List"

  // Null-Safety check per brief
  const totalViews = video.views || 0
  const likes = video.likes || 0
  const comments = video.comments || 0
  const shares = video.shares || 0
  const subsGained = video.subscribersGained || 0
  const avp = video.averageViewPercentage || 0

  // Bug Fix Rule: engagementRate MUST use Math.max(0, rate) to prevent negative/div-zero
  let engagementRate = 0
  if (totalViews > 0) {
   engagementRate = Math.max(
    0,
    ((likes + comments + shares) / totalViews) * 100,
   )
  }

  // Subscriber Conversion Rate (Subs per 1k views)
  const subscriberConversionRate =
   totalViews > 0 ? (subsGained / totalViews) * 1000 : 0

  // Bug Fix Rule: adjustedAVP MUST be capped at 200%
  const adjustedAVP = Math.min(avp, 200)

  return {
   ...video,
   contentArchetype: archetype,
   titleLength: video.title ? video.title.length : 0,
   engagementRate,
   subscriberConversionRate,
   adjustedAVP,
  }
 })
}

// --- CONTEXT & PROVIDER ---
export const GlobalDataContext = createContext<WorkspaceBrainContext | null>(
 null,
)

export const GlobalDataProvider = ({ children }: { children: ReactNode }) => {
 const [rawData, setRawData] = useState<RawVideoData[]>([])
 const [searchQuery, setSearchQuery] = useState("")
 const [dateRange, setDateRange] = useState<{
  start: string
  end: string
 } | null>(null)
 const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([])

 // Dual-Intake System & Stale Data Fallback Rule
 useEffect(() => {
  // 1. Instant cache fallback on load
  const cached = localStorage.getItem("yt_analytics_cache")
  if (cached) {
   try {
    setRawData(JSON.parse(cached))
   } catch (e) {
    console.error("Cache parsing failed", e)
   }
  }

  // 2. Listen for Real-Time API Dispatch
  const handleSync = (e: CustomEvent) => {
   const newData = e.detail
   setRawData((prev) => [...prev, ...newData])
   localStorage.setItem("yt_analytics_cache", JSON.stringify(newData))
  }

  window.addEventListener("yt_analytics_synced" as any, handleSync)
  return () =>
   window.removeEventListener("yt_analytics_synced" as any, handleSync)
 }, [])

 // Enforce Volatility Safety: Process only when rawData changes
 const enrichedData = useMemo(() => processAndEnrichData(rawData), [rawData])

 // Apply Global Brain Filters simultaneously
 const normalizedVideos = useMemo(() => {
  return enrichedData.filter((v) => {
   const matchesSearch =
    v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true
   const matchesDate = dateRange
    ? v.date >= dateRange.start && v.date <= dateRange.end
    : true
   return matchesSearch && matchesDate
  })
 }, [enrichedData, searchQuery, dateRange])

 return (
  <GlobalDataContext.Provider
   value={{
    normalizedVideos,
    selectedVideoIds,
    setSelectedVideoIds,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
   }}>
   {children}
  </GlobalDataContext.Provider>
 )
}
