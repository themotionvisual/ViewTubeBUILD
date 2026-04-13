import React, { useCallback, useState, useEffect, useRef } from "react"
import {
 fetchVideoList,
 fetchVideoDetails,
 updateVideo,
 updateVideoThumbnail,
 fetchVideoStats,
 fetchSingleVideoAnalytics,
 fetchVideoCategories,
 fetchUserPlaylists,
 fetchVideoPlaylistMemberships,
 addToPlaylist,
 removeFromPlaylist,
} from "../services/youtubeService"
import type {
 VideoSnippet,
 VideoDetails,
 VideoStats,
 SingleVideoAnalytics,
 VideoCategory,
 Playlist,
 PlaylistMembership,
} from "../services/youtubeService"
import { useBrain } from "../context/GlobalDataContext"
// Removed isChannelConnected import
import {
 generateTagSuggestions,
 analyzeExistingTags,
 hasGeminiKey,
} from "../services/gemini"
import type { TagSuggestion } from "../services/gemini"
import {
 X,
 Loader2,
 Plus,
 Search,
 Tag,
 FileVideo,
 Eye,
 ThumbsUp,
 MessageSquare,
 Share2,
 MousePointerClick,
 DollarSign,
 Clock,
 Upload,
 Trash2,
 Save,
 ChevronDown,
 Sparkles,
 BarChart3,
 Image as ImageIcon,
 AlertCircle,
 CheckCircle,
 AlignLeft,
 Edit,
 ExternalLink,
} from "lucide-react"
import { ToolboxScaffold, SubToolbox } from "../components/Toolbox"

const TagBadge: React.FC<{
 tag: string
 analysis?: TagSuggestion
 onRemove?: () => void
 onAdd?: () => void
 isSuggested?: boolean
 isAdded?: boolean
}> = ({ tag, analysis, onRemove, onAdd, isSuggested, isAdded }) => {
 const [showTooltip, setShowTooltip] = useState(false)
 const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number } | null>(null)
 const badgeRef = useRef<HTMLButtonElement>(null)

 const getScoreColor = (score: number) => {
  if (score >= 90) return "#00CCFF"
  if (score >= 80) return "#ccff00"
  if (score >= 70) return "#ffdd00"
  return "#ff3399"
 }

 return (
  <div className="relative group">
   <button
    ref={badgeRef}
    type="button"
    onClick={isAdded ? undefined : onAdd || onRemove}
    onMouseEnter={() => {
     if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect()
      setTooltipPos({ left: rect.left + rect.width / 2, top: rect.top })
     }
     setShowTooltip(true)
    }}
    onMouseLeave={() => setShowTooltip(false)}
    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-[900] uppercase border-[3px] border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0"
    style={{
     backgroundColor: isAdded
      ? "#E5E7EB"
      : analysis
        ? getScoreColor(analysis.score)
        : "#FFFFFF",
     opacity: isAdded ? 0.65 : 1,
     cursor: isAdded ? "not-allowed" : "pointer",
    }}>
    <span className="max-w-[140px] truncate text-black">{tag}</span>
    {(onRemove || (isSuggested && !isAdded)) && (
     <span
      className="w-4 h-4 flex items-center justify-center rounded-full bg-black text-white"
      onClick={(e) => {
       e.stopPropagation()
       if (onRemove) onRemove()
      }}>
      {onRemove ? <X size={10} strokeWidth={3.2} /> : <Plus size={10} strokeWidth={3.2} />}
     </span>
    )}
   </button>
   {showTooltip && analysis && tooltipPos && (
    <div
     className="fixed z-[200] w-52 bg-white text-black p-3 rounded-2xl border-[3px] border-black shadow-[6px_6px_0px_0px_black] pointer-events-none"
     style={{ left: tooltipPos.left, top: tooltipPos.top - 12, transform: "translate(-50%, -100%)" }}
    >
     <div className="space-y-2 text-[10px] font-bold uppercase">
      <div className="flex justify-between border-b border-black/20 pb-1 mb-1">
       <span className="text-black/60">SEO Metrics</span>
       <span
        className="text-black px-2 py-0.5 rounded-full font-black border border-black"
        style={{ backgroundColor: getScoreColor(analysis.score) }}>
        {analysis.score}
       </span>
      </div>
      <div className="flex justify-between">
       <span>Search Vol:</span>
       <span>{(analysis.searchVolume / 1000).toFixed(1)}K</span>
      </div>
      <div className="flex justify-between">
       <span>Comp:</span>
       <span>{analysis.competition}</span>
      </div>
      <div className="flex justify-between">
       <span>Rank:</span>
       <span className="text-black">#{analysis.rank}</span>
      </div>
      <div className="flex justify-between mt-1 pt-1 border-t border-black/20">
       <span>Triple Keyword:</span>
       <span>
        {analysis.tripleKeyword ? (
         <span className="text-black flex items-center gap-1">
          <CheckCircle size={10} /> YES
         </span>
        ) : (
         <span className="text-black flex items-center gap-1">
          <X size={10} /> NO
         </span>
        )}
       </span>
      </div>
     </div>
     <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-black" />
    </div>
   )}
  </div>
 )
}

interface VideoManagerProps {
 embedded?: boolean
 collapsible?: boolean
 isOpenInitial?: boolean
 paletteIndex?: number
}

type VideoListLoadState = "idle" | "loading" | "success" | "empty" | "error"

const VideoManager: React.FC<VideoManagerProps> = ({
 embedded = false,
 collapsible = false,
 isOpenInitial = true,
 paletteIndex,
}) => {
 const { authState, login } = useBrain()
 const basePalette = paletteIndex ?? 0
 const [videos, setVideos] = useState<VideoSnippet[]>([])
 const [videoSearchQuery, setVideoSearchQuery] = useState("")
 const [isSearchingVideos, setIsSearchingVideos] = useState(false)
 const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
 const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null)
 const [videoStats, setVideoStats] = useState<VideoStats | null>(null)
 const [videoAnalytics, setVideoAnalytics] =
  useState<SingleVideoAnalytics | null>(null)
 const [loading, setLoading] = useState(false)
 const [saving, setSaving] = useState(false)
 const [saveSuccess, setSaveSuccess] = useState(false)
 const [error, setError] = useState<string | null>(null)

 const [dropdownOpen, setDropdownOpen] = useState(false)
 const dropdownRef = useRef<HTMLDivElement>(null)
 const lastSearchRef = useRef("")
 const [playlistMenuOpen, setPlaylistMenuOpen] = useState(false)
 const playlistMenuRef = useRef<HTMLDivElement>(null)

 // Edit State
 const [editTitle, setEditTitle] = useState("")
 const [editDescription, setEditDescription] = useState("")
 const [editTags, setEditTags] = useState("")
 const [editPrivacy, setEditPrivacy] = useState("public")
 const [editCategoryId, setEditCategoryId] = useState("27")

 // Playlists
 const [categories, setCategories] = useState<VideoCategory[]>([])
 const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([])
 const [currentPlaylists, setCurrentPlaylists] = useState<PlaylistMembership[]>(
  [],
 )
 const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([])

 // AI State
 const [isGeneratingTags, setIsGeneratingTags] = useState(false)
 const [isAnalyzingTags, setIsAnalyzingTags] = useState(false)
 const [suggestedTags, setSuggestedTags] = useState<TagSuggestion[]>([])
 const [existingTagAnalysis, setExistingTagAnalysis] = useState<
  TagSuggestion[]
 >([])
 const [showRankDetails, setShowRankDetails] = useState(false)
 const [isTagsExpanded, setIsTagsExpanded] = useState(false)

 const [tagInput, setTagInput] = useState("")
 const fileInputRef = useRef<HTMLInputElement>(null)
 const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
 const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
 const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false)
  const [cacheTick, setCacheTick] = useState(0)
 const [isOpen, setIsOpen] = useState(isOpenInitial)
 const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false)
 const [videoListLoadState, setVideoListLoadState] =
  useState<VideoListLoadState>("idle")
 const hasTriggeredInitialLoadRef = useRef(false)

 const connected = authState.isAuthenticated

 const formatVideoLoadError = (err: any) => {
  const raw = err?.message || "Failed to load channel assets."
  if (/session|auth|401|expired|invalid/i.test(raw)) {
   return "YouTube session expired. Reconnect your channel in Settings, then reload assets."
  }
  return raw
 }

 const normalizeVideoSnippets = (input: unknown[]): VideoSnippet[] =>
  input
   .map((video) => {
    const record = (video || {}) as Record<string, unknown>
    return {
     videoId: String(record.videoId || "").trim(),
     title: String(record.title || "").trim(),
     publishedAt: String(record.publishedAt || ""),
     thumbnail: String(record.thumbnail || ""),
    }
   })
   .filter((video) => video.videoId.length > 0)

 const getCachedVideos = (): VideoSnippet[] => {
  try {
   const raw = localStorage.getItem("yt_analytics_cache")
   if (!raw) return []
   const parsed = JSON.parse(raw) as { videos?: any[] }
   const fromCache = Array.isArray(parsed?.videos) ? parsed.videos : []
   return normalizeVideoSnippets(fromCache)
  } catch {
   return []
  }
 }

 // Derived: the full selected video object used throughout JSX
 const selectedVideo: (VideoSnippet & Partial<VideoDetails>) | null =
  selectedVideoId
   ? ({
      ...(videos.find((v) => v.videoId === selectedVideoId) ?? {}),
      ...(videoDetails ?? {}),
     } as VideoSnippet & Partial<VideoDetails>)
   : null

 useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
   if (
    dropdownRef.current &&
    !dropdownRef.current.contains(event.target as Node)
   ) {
    setDropdownOpen(false)
   }
  }
  document.addEventListener("mousedown", handleClickOutside)
  return () => document.removeEventListener("mousedown", handleClickOutside)
 }, [])

 useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
   if (
    playlistMenuRef.current &&
    !playlistMenuRef.current.contains(event.target as Node)
   ) {
    setPlaylistMenuOpen(false)
   }
  }
  document.addEventListener("mousedown", handleClickOutside)
  return () => document.removeEventListener("mousedown", handleClickOutside)
 }, [])

 const loadInitialData = async () => {
  setVideoListLoadState("loading")
  setLoading(true)
  setError(null)
  try {
   const results = await Promise.allSettled([
    fetchVideoList(50),
    fetchVideoCategories(),
    fetchUserPlaylists(),
   ])

   if (results[0].status === "rejected") {
    throw results[0].reason;
   }

   const apiVideoList = results[0].value || [];
   const cacheVideoList = getCachedVideos()
   const videoList =
    apiVideoList.length > 0 ? apiVideoList : cacheVideoList
   const categoryList = results[1].status === "fulfilled" ? results[1].value : [];
   const playlists = results[2].status === "fulfilled" ? results[2].value : [];

   setVideos(videoList)
   setCategories(categoryList)
   setUserPlaylists(playlists)
   setHasLoadedInitialData(true)
   setVideoListLoadState(videoList.length === 0 ? "empty" : "success")
   if (apiVideoList.length === 0 && videoList.length > 0) {
    console.info("[VideoManager] Hydrated videos from analytics cache", {
     source: "yt_analytics_cache.videos",
     count: videoList.length,
    })
   }
   if (videoList.length === 0 && connected) {
    console.info("[VideoManager] Empty video list after initial sync", {
     isAuthenticated: connected,
     maxResults: 50,
     query: null,
    })
   }
  } catch (err: any) {
   console.error(err)
   setError(formatVideoLoadError(err))
   setHasLoadedInitialData(true)
   setVideoListLoadState("error")
  } finally {
   setLoading(false)
  }
 }

 const loadVideos = async (
  query?: string,
  options?: { background?: boolean; searching?: boolean },
 ) => {
  if (!query) setVideoListLoadState("loading")
  if (!options?.background) setLoading(true)
  if (options?.searching) setIsSearchingVideos(true)
  try {
   const data = await fetchVideoList(50, query)
   const fallbackCacheVideos = !query && data.length === 0 ? getCachedVideos() : []
   const finalVideos =
    !query && fallbackCacheVideos.length > 0 ? fallbackCacheVideos : data
   setVideos(finalVideos)
   if (!query) {
    setVideoListLoadState(finalVideos.length === 0 ? "empty" : "success")
    if (data.length === 0 && fallbackCacheVideos.length > 0) {
     console.info("[VideoManager] Reload hydrated videos from analytics cache", {
      source: "yt_analytics_cache.videos",
      count: fallbackCacheVideos.length,
     })
    }
    if (finalVideos.length === 0 && connected) {
     console.info("[VideoManager] Empty video list after reload", {
      isAuthenticated: connected,
      maxResults: 50,
      query: null,
     })
    }
   }
  } catch (err: any) {
   setError(formatVideoLoadError(err))
   if (!query) setVideoListLoadState("error")
  } finally {
   if (options?.searching) setIsSearchingVideos(false)
   if (!options?.background) setLoading(false)
  }
 }

 const refreshVideosAfterSync = useCallback(async () => {
  if (!connected) return
  try {
   setVideoListLoadState("loading")
   const data = await fetchVideoList(50)
   const cacheVideos = getCachedVideos()
   const merged = data.length > 0 ? data : cacheVideos
   setVideos(merged)
   setHasLoadedInitialData(true)
   setVideoListLoadState(merged.length === 0 ? "empty" : "success")
   setError(null)
   console.info("[VideoManager] Sync refresh complete", {
    apiCount: data.length,
    cacheCount: cacheVideos.length,
    finalCount: merged.length,
   })
  } catch (err: any) {
   console.error("[VideoManager] Sync refresh failed", err)
   setError(formatVideoLoadError(err))
   setVideoListLoadState("error")
  }
 }, [connected])

 useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
   if (!dropdownOpen) return
   const nextQuery = videoSearchQuery.trim()
   if (nextQuery === lastSearchRef.current) return
   lastSearchRef.current = nextQuery
   loadVideos(nextQuery || undefined, { background: true, searching: true })
  }, 260)
  return () => clearTimeout(delayDebounceFn)
 }, [videoSearchQuery, dropdownOpen])

 useEffect(() => {
  const onSynced = (event: Event) => {
   setCacheTick((v) => v + 1)
   const detail = (event as CustomEvent<{ videos?: unknown[] }>).detail
   const syncedVideos = Array.isArray(detail?.videos)
    ? normalizeVideoSnippets(detail.videos)
    : []
   if (syncedVideos.length > 0) {
    setVideos(syncedVideos)
    setHasLoadedInitialData(true)
    setVideoListLoadState("success")
    setError(null)
   }
   void refreshVideosAfterSync()
  }
  window.addEventListener("yt_analytics_synced", onSynced)
  return () => window.removeEventListener("yt_analytics_synced", onSynced)
 }, [refreshVideosAfterSync])

 useEffect(() => {
  if (!connected) {
   hasTriggeredInitialLoadRef.current = false
   return
  }
  if (hasLoadedInitialData || hasTriggeredInitialLoadRef.current) return
  if (collapsible && !isOpen) return

  hasTriggeredInitialLoadRef.current = true
  loadInitialData()
 }, [connected, hasLoadedInitialData, collapsible, isOpen])

 useEffect(() => {
  if (!connected) return
  if (videos.length === 0) return
  if (selectedVideoId) return
  const firstVideoId = videos[0]?.videoId
  if (!firstVideoId) return
  handleSelectVideo(firstVideoId, userPlaylists)
 }, [connected, videos, selectedVideoId, userPlaylists])

 const handleSelectVideo = async (
  videoId: string,
  playlistsToUse = userPlaylists,
 ) => {
  setSelectedVideoId(videoId)
  setLoading(true)
  setError(null)
  setSaveSuccess(false)
  setDropdownOpen(false)
  setThumbnailPreview(null)
  setThumbnailFile(null)
  try {
   const [details, stats, analytics] = await Promise.all([
    fetchVideoDetails(videoId),
    fetchVideoStats([videoId]),
    fetchSingleVideoAnalytics(videoId),
   ])
   setVideoDetails(details)
   setVideoStats(stats[0] || null)
   setVideoAnalytics(analytics)
   setEditTitle(details.title)
   setEditDescription(details.description)
   setEditTags(details.tags.join(", "))
   setEditPrivacy(details.privacyStatus)
   setEditCategoryId(details.categoryId)
   setSuggestedTags([])

   const memberships = await fetchVideoPlaylistMemberships(
    videoId,
    playlistsToUse.map((p) => p.id),
   )
   setCurrentPlaylists(memberships)
   setSelectedPlaylistIds(memberships.map((m) => m.playlistId))

   // Tag analysis is user-initiated via "Rank Tags" to avoid background AI calls.
  } catch (err: any) {
   console.error(err)
   setError("Failed to load video details.")
  } finally {
   setLoading(false)
  }
 }

 const buildLocalTagAnalysis = (
  title: string,
  description: string,
  tags: string[],
 ): TagSuggestion[] => {
  const titleWords = new Set(title.toLowerCase().split(/\W+/).filter(Boolean))
  const combinedText = `${title} ${description}`.toLowerCase()

  return tags
   .map((tag) => {
    const words = tag.toLowerCase().split(/\W+/).filter(Boolean)
    const titleHits = words.filter((word) => titleWords.has(word)).length
    const bodyHits = words.filter((word) => combinedText.includes(word)).length
    const tripleKeyword = titleHits > 0 && bodyHits === words.length
    const searchVolume = Math.max(
     200,
     Math.round(5800 - words.length * 280 + titleHits * 900 + bodyHits * 350),
    )
    const competition = Math.max(
     80,
     Math.round(4100 + words.length * 500 - titleHits * 450),
    )
    const score = Math.min(
     99,
     Math.max(
      35,
      Math.round(
       (searchVolume / Math.max(searchVolume + competition, 1)) * 100 +
        titleHits * 8 +
        bodyHits * 3 +
        (tripleKeyword ? 7 : 0),
      ),
     ),
    )
    return {
     tag,
     score,
     searchVolume,
     competition,
     rank: 0,
     tripleKeyword,
    }
   })
   .sort((a, b) => b.score - a.score)
   .map((item, index) => ({ ...item, rank: index + 1 }))
 }

 const handleRankTags = async () => {
  if (!editTags) return
  setIsAnalyzingTags(true)
  try {
   const tags = editTags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
   if (tags.length === 0) return

   const analysis = hasGeminiKey()
    ? await analyzeExistingTags(editTitle, editDescription, tags)
    : buildLocalTagAnalysis(editTitle, editDescription, tags)

   setExistingTagAnalysis(analysis)
   setShowRankDetails(true)
  } catch (err) {
   console.error("Failed to rank tags:", err)
  } finally {
   setIsAnalyzingTags(false)
  }
 }

 const handleGenerateTags = async () => {
  if (!hasGeminiKey()) return
  setIsGeneratingTags(true)
  try {
   const suggestions = await generateTagSuggestions(editTitle, editDescription)
   const sorted = [...suggestions]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
   setSuggestedTags(sorted)
  } catch (err) {
   console.error(err)
  } finally {
   setIsGeneratingTags(false)
  }
 }

 const handleAddTag = (tag: string, analysis?: TagSuggestion) => {
  const trimmed = tag.trim()
  if (!trimmed) return
  const current = editTags
   .split(",")
   .map((t) => t.trim())
   .filter(Boolean)
  if (!current.map((t) => t.toLowerCase()).includes(trimmed.toLowerCase())) {
   setEditTags([...current, trimmed].join(", "))
   if (analysis) setExistingTagAnalysis((prev) => [...prev, analysis])
  }
  setTagInput("")
 }

 const handleRemoveTag = (tag: string) => {
  setEditTags(
   editTags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.toLowerCase() !== tag.toLowerCase())
    .join(", "),
  )
  setExistingTagAnalysis((prev) =>
   prev.filter((t) => t.tag.toLowerCase() !== tag.toLowerCase()),
  )
 }

 const togglePlaylist = (playlistId: string) => {
  setSelectedPlaylistIds((prev) =>
   prev.includes(playlistId)
    ? prev.filter((id) => id !== playlistId)
    : [...prev, playlistId],
  )
 }

 const handleThumbnailChange = (file: File) => {
  if (file.size > 2 * 1024 * 1024) {
   alert("Image size must be under 2MB")
   return
  }
  setThumbnailFile(file)
  const reader = new FileReader()
  reader.onloadend = () => setThumbnailPreview(reader.result as string)
  reader.readAsDataURL(file)
 }

 const handleSave = async () => {
  if (!selectedVideoId) return
  setSaving(true)
  setError(null)
  setSaveSuccess(false)
  try {
   await updateVideo(selectedVideoId, {
    title: editTitle,
    description: editDescription,
    tags: editTags
     .split(",")
     .map((t) => t.trim())
     .filter(Boolean),
    categoryId: editCategoryId,
    privacyStatus: editPrivacy as any,
   })

   if (thumbnailFile) {
    await updateVideoThumbnail(selectedVideoId, thumbnailFile)
    setThumbnailFile(null)
   }

   const toAdd = selectedPlaylistIds.filter(
    (id) => !currentPlaylists.some((m) => m.playlistId === id),
   )
   const toRemove = currentPlaylists.filter(
    (m) => !selectedPlaylistIds.includes(m.playlistId),
   )

   await Promise.all([
    ...toAdd.map((id) => addToPlaylist(id, selectedVideoId)),
    ...toRemove.map((m) => removeFromPlaylist(m.playlistItemId)),
   ])

   setSaveSuccess(true)
   handleSelectVideo(selectedVideoId, userPlaylists)
   loadVideos(videoSearchQuery || undefined, { background: true }) // refresh title in list
  } catch (err: any) {
   setError("Save failed: " + err.message)
  } finally {
   setSaving(false)
  }
 }

 const formatViews = (views: string) => {
  const num = parseInt(views)
  if (isNaN(num)) return "0"
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toString()
 }

  const formatDuration = (secondsStr: string) => {
  const totalSeconds = parseInt(secondsStr, 10)
  if (isNaN(totalSeconds)) return "0:00"
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0)
   return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  return `${m}:${s.toString().padStart(2, "0")}`
 }

 const selectedVideoMetrics = React.useMemo(() => {
  if (!selectedVideoId) {
   return {
    watchHours: 0,
    impressions: 0,
    ctr: 0,
    stw: 0,
    endScreenClickRate: 0,
    cardClickRate: 0,
    isShort: false,
    revenue: Number(videoAnalytics?.estimatedRevenue || 0),
   }
  }

  try {
   const cacheRaw = localStorage.getItem("yt_analytics_cache")
   if (!cacheRaw) throw new Error("No cache")
   const cache = JSON.parse(cacheRaw) as any
   const stats = cache?.stats?.[selectedVideoId] || {}
   const analytics = cache?.analytics || {}
   const headers = (analytics?.columnHeaders || []).map((h: any) =>
    String(h?.name || ""),
   )
   const rows = Array.isArray(analytics?.rows) ? analytics.rows : []
   const row = rows.find((r: any) => {
    if (Array.isArray(r)) {
     const idx = headers.findIndex((h: string) => h.toLowerCase() === "video")
     return idx >= 0 ? String(r[idx] || "") === selectedVideoId : false
    }
    return (
     String(r?.video || r?.Video || r?.["Video ID"] || r?.Dimension || "") ===
     selectedVideoId
    )
   })

   const getRowValue = (keyList: string[]): number => {
    if (!row) return 0
    if (Array.isArray(row)) {
     for (const key of keyList) {
      const idx = headers.findIndex(
       (h: string) => h.toLowerCase() === key.toLowerCase(),
      )
      if (idx >= 0) {
       const n = Number(String(row[idx] ?? "").replace(/[^0-9.-]/g, ""))
       if (Number.isFinite(n) && n > 0) return n
      }
     }
     return 0
    }
    for (const key of keyList) {
      const raw = row?.[key]
      const n = Number(String(raw ?? "").replace(/[^0-9.-]/g, ""))
      if (Number.isFinite(n) && n > 0) return n
    }
    return 0
   }

   const watchHours =
    getRowValue(["Watch Time (Hours)", "Watch time (hours)", "Watch Hrs"]) ||
    getRowValue(["estimatedMinutesWatched"]) / 60

   const ctr =
    getRowValue([
     "Click-Through Rate (CTR)",
     "CTR (%)",
     "Impressions click-through rate (%)",
     "impressionClickThroughRate",
    ]) || Number(String(videoAnalytics?.clickThroughRate || "0").replace("%", ""))

   return {
    watchHours,
    impressions: getRowValue(["Impressions", "impressions"]),
    ctr,
    stw: getRowValue(["STW %", "Stayed to watch (%)"]),
    endScreenClickRate: getRowValue([
     "End screen click rate",
     "Clicks per end screen element shown (%)",
    ]),
    cardClickRate: getRowValue(["Card click rate", "annotationClickThroughRate"]),
    isShort:
     stats?.isShort === true ||
     (Number(stats?.durationSeconds || videoStats?.duration || 0) <= 180 &&
      stats?.contentType === "shorts"),
    revenue:
     Number(videoAnalytics?.estimatedRevenue || 0) ||
     getRowValue(["Revenue", "Estimated revenue", "estimatedRevenue"]),
   }
  } catch {
   return {
    watchHours: 0,
    impressions: 0,
    ctr: Number(String(videoAnalytics?.clickThroughRate || "0").replace("%", "")),
    stw: 0,
    endScreenClickRate: 0,
    cardClickRate: 0,
    isShort: Number(videoStats?.duration || 0) <= 180,
    revenue: Number(videoAnalytics?.estimatedRevenue || 0),
   }
  }
 }, [selectedVideoId, videoStats, videoAnalytics, cacheTick])

 if (!connected) {
  return (
   <ToolboxScaffold
    title="VIDEO MANAGER"
    subtitle="Manage + Edit all the titles, details, thumbnails + more of your published videos"
    icon={<FileVideo size={40} strokeWidth={3} className="text-black" />}
    headerColor="bg-[#00CCFF]"
    iconBoxColor="bg-[#FFDD00]"
    paletteIndex={paletteIndex}
    collapsible={collapsible}
    isOpen={isOpen}
    onToggle={() => setIsOpen(!isOpen)}
    embedded={embedded}
    helpText="Manage existing videos in one place. Update titles, descriptions, tags, playlists, and thumbnails without leaving the app."
    shellClassName="animate-fade-in"
    contentClassName={embedded ? "p-0" : "p-8"}>
    <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
     <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-[4px] border-black shadow-[4px_4px_0px_0px_black]">
      <FileVideo size={48} className="text-black" />
     </div>
     <div className="space-y-4 max-w-md">
      <h2 className="text-4xl font-[1000] uppercase tracking-tighter">
       Channel Offline
      </h2>
      <p className="text-gray-600 font-bold">
       Connect your YouTube channel in Settings to manage assets, optimize
       metadata, and run AI tag analysis.
      </p>
      <button
       onClick={login}
       className="w-full bg-[#FF3399] text-white border-[4px] border-black rounded-xl p-4 font-black uppercase text-xl shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3">
       <Sparkles size={24} /> Connect YouTube Account
      </button>
     </div>
    </div>
   </ToolboxScaffold>
  )
 }

 return (
 <ToolboxScaffold
   title="VIDEO MANAGER"
   subtitle="Manage + Edit all the titles, details, thumbnails + more of your published videos"
   icon={<FileVideo size={40} strokeWidth={3} className="text-black" />}
   headerColor="bg-[#00CCFF]"
   iconBoxColor="bg-[#CC99FF]"
   paletteIndex={paletteIndex}
   collapsible={collapsible}
   isOpen={isOpen}
   onToggle={() => setIsOpen(!isOpen)}
   embedded={embedded}
   helpText="Manage existing videos in one place. Update titles, descriptions, tags, playlists, and thumbnails without leaving the app."
   shellClassName="animate-fade-in"
   contentClassName={embedded ? "p-0" : "p-8"}>
   <div className="flex flex-col h-full">
    {error && (
     <div className="mb-6 bg-[#ffb158]/20 border-[4px] border-[#ffb158] p-4 rounded-2xl flex items-center gap-4 text-[#ffb158] font-black uppercase shadow-[4px_4px_0px_0px_#ffb158]">
      <AlertCircle size={24} />
      <p>{error}</p>
     </div>
    )}
   {saveSuccess && (
     <div className="mb-6 bg-[#00ff99]/20 border-[4px] border-[#00ff99] p-4 rounded-2xl flex items-center gap-4 text-black font-black uppercase shadow-[4px_4px_0px_0px_#00ff99]">
      <CheckCircle size={24} className="text-[#00ff99]" />
      <p>Asset Deployed Successfully</p>
     </div>
    )}
    <div className="mb-6 flex justify-end">
     <button
      onClick={() => {
       lastSearchRef.current = ""
       setVideoSearchQuery("")
       loadInitialData()
      }}
      disabled={loading}
      className="bg-white text-black border-[3px] border-black px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50">
      {loading ? "Syncing..." : "Reload Assets"}
     </button>
    </div>
    {showRankDetails && existingTagAnalysis.length > 0 && (
     <div className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white border-[5px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden">
       <div className="bg-[#CCFF00] border-b-[4px] border-black px-5 py-4 flex items-center justify-between">
        <div>
         <h3 className="text-2xl font-[1000] uppercase tracking-tight">
          Tag Rank Calculations
         </h3>
         <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/50 mt-1">
          Score balances search volume, competition, title match, and triple
          keyword signal.
         </p>
        </div>
        <button
         onClick={() => setShowRankDetails(false)}
         className="h-10 w-10 rounded-lg border-[3px] border-black bg-white flex items-center justify-center">
         <X size={18} />
        </button>
       </div>
       <div className="p-4 overflow-x-auto">
        <table className="w-full border-collapse min-w-[760px]">
         <thead>
          <tr className="bg-black text-white text-left">
           <th className="p-2 text-[10px] font-black uppercase tracking-wider">
            Tag
           </th>
           <th className="p-2 text-[10px] font-black uppercase tracking-wider">
            Score
           </th>
           <th className="p-2 text-[10px] font-black uppercase tracking-wider">
            Search Vol
           </th>
           <th className="p-2 text-[10px] font-black uppercase tracking-wider">
            Competition
           </th>
           <th className="p-2 text-[10px] font-black uppercase tracking-wider">
            Rank
           </th>
           <th className="p-2 text-[10px] font-black uppercase tracking-wider">
            Triple Keyword
           </th>
          </tr>
         </thead>
         <tbody>
          {existingTagAnalysis.map((analysis) => (
           <tr key={analysis.tag} className="border-b border-black/10">
            <td className="p-2 text-xs font-black uppercase">{analysis.tag}</td>
            <td className="p-2 text-xs font-black">{analysis.score}</td>
            <td className="p-2 text-xs font-black">
             {analysis.searchVolume.toLocaleString()}
            </td>
            <td className="p-2 text-xs font-black">
             {analysis.competition.toLocaleString()}
            </td>
            <td className="p-2 text-xs font-black">#{analysis.rank}</td>
            <td className="p-2 text-xs font-black">
             {analysis.tripleKeyword ? "YES" : "NO"}
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      </div>
     </div>
    )}

    {videoListLoadState === "idle" && !hasLoadedInitialData ? (
     <div className="h-[500px] flex flex-col items-center justify-center gap-5 font-black uppercase text-3xl tracking-tighter text-black/30">
      <Edit size={100} strokeWidth={1} className="mb-2 opacity-50" />
      Ready To Sync Channel Assets
      <button
       onClick={loadInitialData}
       disabled={loading}
       className="bg-[#CCFF00] text-black px-8 py-4 rounded-xl border-[4px] border-black shadow-[6px_6px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-sm">
       {loading ? "Loading..." : "Load Channel Assets"}
      </button>
     </div>
    ) : videoListLoadState === "loading" && videos.length === 0 && !selectedVideo ? (
     <div className="h-[500px] flex flex-col items-center justify-center font-black uppercase text-2xl text-black/20 animate-pulse">
      <Loader2 size={48} className="mb-4 animate-spin" />
      Syncing Database...
     </div>
    ) : videoListLoadState === "error" && videos.length === 0 ? (
     <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 min-h-[500px]">
      <div className="w-24 h-24 bg-[#ffb158] rounded-full flex items-center justify-center border-[4px] border-black shadow-[4px_4px_0px_0px_black]">
       <AlertCircle size={48} className="text-black" />
      </div>
      <div className="space-y-4 max-w-lg">
       <h2 className="text-5xl font-[1000] uppercase tracking-tighter leading-none">
        Sync Failed
       </h2>
       <p className="text-black/60 font-bold uppercase text-xs tracking-widest leading-relaxed">
        {error || "We couldn't load your YouTube assets. Try reload, or reconnect your channel in Settings."}
       </p>
       <button
        onClick={loadInitialData}
        disabled={loading}
        className="inline-block w-full bg-[#CCFF00] border-[4px] border-black rounded-xl p-5 font-black uppercase text-xl text-black shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mt-4 disabled:opacity-50">
        {loading ? "Retrying..." : "Retry Sync"}
       </button>
      </div>
     </div>
    ) : videoListLoadState === "empty" ? (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 min-h-[500px]">
       <div className="w-24 h-24 bg-[#FF3399] rounded-full flex items-center justify-center border-[4px] border-black shadow-[4px_4px_0px_0px_black] -rotate-12">
        <FileVideo size={48} className="text-[#CCFF00]" />
       </div>
       <div className="space-y-4 max-w-lg">
        <h2 className="text-5xl font-[1000] uppercase tracking-tighter leading-none">
         Zero Assets Detected
        </h2>
        <p className="text-black/50 font-bold uppercase text-xs tracking-widest leading-relaxed">
         Your YouTube channel is connected, but we couldn't detect any videos. Upload your first video to YouTube to unlock the full power of Creator OS Pro.
        </p>
        <a
         href="https://studio.youtube.com"
         target="_blank"
         rel="noopener noreferrer"
         className="inline-block w-full bg-[#CCFF00] border-[4px] border-black rounded-xl p-5 font-black uppercase text-xl text-black shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mt-4">
         Open YouTube Studio
        </a>
        <button
         onClick={loadInitialData}
         disabled={loading}
         className="inline-block w-full bg-white border-[4px] border-black rounded-xl p-4 font-black uppercase text-sm text-black shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50">
         {loading ? "Syncing..." : "Reload Assets"}
        </button>
       </div>
      </div>
    ) : selectedVideo ? (
     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* V3 Dropdown Selector */}
      <div className="relative z-40" ref={dropdownRef}>
       <div
       onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 rounded-[24px] border-[4px] border-black transition-all cursor-pointer group ${dropdownOpen ? "bg-gray-100 shadow-none translate-y-1" : "bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] hover:bg-gray-50"}`}>
        <div className="flex gap-6 items-center flex-1 min-w-0">
         <div className="relative flex-shrink-0 w-56 aspect-video rounded-xl border-[3px] border-black overflow-hidden bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
          <img
           src={selectedVideo.thumbnail}
           alt={selectedVideo.title}
           className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
         </div>
         <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-[1000] uppercase leading-tight line-clamp-2 mb-2 group-hover:text-[#FF3399] transition-colors tracking-tighter">
           {selectedVideo.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
           <a
            href={`https://youtube.com/watch?v=${selectedVideo.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-[#00CCFF] hover:text-[#FF3399] transition-colors">
            View on YouTube <ExternalLink size={14} strokeWidth={3} />
           </a>
          </div>
         </div>
        </div>
        <div className="flex items-center justify-center pl-4 group-hover:scale-110 transition-transform">
         <ChevronDown
          size={48}
          strokeWidth={3}
          className={`text-black transition-transform duration-300 ${dropdownOpen ? "rotate-180 text-[#FF3399]" : ""}`}
         />
        </div>
       </div>

       {dropdownOpen && (
        <div className="absolute left-0 right-0 top-full mt-0 z-[260] bg-white border-[5px] border-black border-t-0 rounded-b-[24px] shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden">
         <div className="bg-[#00CCFF] p-6 border-b-[5px] border-black flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-[1000] text-3xl uppercase tracking-tighter text-black whitespace-nowrap">
           Videos
          </span>
          <div className="relative w-full max-w-md">
           <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40"
            size={24}
           />
           <input
            type="text"
            placeholder="SEARCH VIDEOS..."
            value={videoSearchQuery}
            onChange={(e) => setVideoSearchQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-full pl-14 pr-4 py-4 bg-white border-[4px] border-black rounded-xl font-black uppercase text-lg outline-none focus:bg-[#00CCFF]/10 transition-colors"
           />
          </div>
          <div className="flex gap-4">
           <button
            onClick={(e) => {
             e.stopPropagation()
             lastSearchRef.current = videoSearchQuery.trim()
             loadVideos(videoSearchQuery || undefined, {
              background: true,
              searching: true,
             })
            }}
            className="bg-white text-black border-[3px] border-black px-6 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
            Refresh
           </button>
          </div>
         </div>
         <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-gray-50">
          {isSearchingVideos ? (
           <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-black" size={48} />
           </div>
          ) : videos.length === 0 ? (
           <div className="text-center py-20 font-black text-black/30 uppercase tracking-widest text-xl">
            No videos found matching "{videoSearchQuery}"
           </div>
          ) : (
           <div className="grid grid-cols-1 divide-y-[3px] divide-black/10">
            {videos.map((video) => (
             <div
              key={video.videoId}
              onClick={(e) => {
               e.stopPropagation()
               handleSelectVideo(video.videoId)
              }}
              className={`group relative flex items-center gap-6 p-4 cursor-pointer transition-all duration-300 hover:bg-white ${selectedVideo?.videoId === video.videoId ? "bg-[#CCFF00]/20" : ""}`}>
              <div className="w-32 aspect-video rounded-lg border-[3px] border-black overflow-hidden bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform">
               <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
               />
              </div>
              <div className="flex-1 min-w-0">
               <h3 className="font-[1000] text-xl uppercase tracking-tighter line-clamp-2 group-hover:text-[#FF3399] transition-colors">
                {video.title}
               </h3>
              <div className="flex items-center gap-4 mt-2">
                {selectedVideo?.videoId === video.videoId && (
                 <span className="bg-white text-black border-[2px] border-black px-3 py-1 rounded-md text-[10px] font-black uppercase">
                  Active
                 </span>
                )}
               </div>
              </div>
             </div>
            ))}
           </div>
          )}
         </div>
        </div>
       )}
      </div>
      {/* Main Editor Elements */}
      {/* Stats & Thumbnail Row */}
      <div className="grid grid-cols-1 xl:grid-cols-[4fr_7fr] gap-6">
       <SubToolbox
        title="Video Stats"
        icon={<BarChart3 size={20} strokeWidth={3} />}
        paletteIndex={basePalette + 1}
        collapsible
        isOpenInitial={true}
        contentClassName="p-4 flex-1 flex flex-col space-y-3"
       >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         <div className="bg-gray-50 border-[3px] border-black rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center hover:bg-[#40C6E9] hover:text-black transition-colors group h-16">
          <Eye
           className="text-[#40C6E9] group-hover:text-black mb-1"
           size={20}
           strokeWidth={3}
          />
          <span className="font-[1000] text-lg">
           {formatViews(videoStats?.views || "0")}
          </span>
          <span className="text-[8px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">
           Views
          </span>
         </div>
         <div className="bg-gray-50 border-[3px] border-black rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center hover:bg-[#B9FF58] hover:text-black transition-colors group h-16">
          <Clock className="text-[#B9FF58] group-hover:text-black mb-1" size={20} strokeWidth={3} />
          <span className="font-[1000] text-lg">
           {selectedVideoMetrics.watchHours.toFixed(2)}
          </span>
          <span className="text-[8px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">
           Watch Hrs
          </span>
         </div>
         <div className="bg-gray-50 border-[3px] border-black rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center hover:bg-[#FF83EA] hover:text-black transition-colors group h-16">
          <ThumbsUp
           className="text-[#FF83EA] group-hover:text-black mb-1"
           size={20}
           strokeWidth={3}
          />
          <span className="font-[1000] text-lg">
           {formatViews(videoStats?.likes || "0")}
          </span>
          <span className="text-[8px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">
           Likes
          </span>
         </div>
         <div className="bg-gray-50 border-[3px] border-black rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center hover:bg-[#FFFF61] hover:text-black transition-colors group h-16">
          <MessageSquare
           className="text-[#FFFF61] group-hover:text-black mb-1"
           size={20}
           strokeWidth={3}
          />
          <span className="font-[1000] text-lg">
           {formatViews(videoStats?.comments || "0")}
          </span>
          <span className="text-[8px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">
           Comments
          </span>
         </div>
         <div className="bg-gray-50 border-[3px] border-black rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center hover:bg-[#FFB570] hover:text-black transition-colors group h-16">
          <Share2
           className="text-[#FFB570] group-hover:text-black mb-1"
           size={20}
           strokeWidth={3}
          />
          <span className="font-[1000] text-lg">
           {formatViews(videoAnalytics?.shares || "0")}
          </span>
          <span className="text-[8px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">
           Shares
          </span>
         </div>
         <div className="bg-gray-50 border-[3px] border-black rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center hover:bg-[#5EE4FF] hover:text-black transition-colors group h-16">
          <Eye className="text-[#5EE4FF] group-hover:text-black mb-1" size={20} strokeWidth={3} />
          <span className="font-[1000] text-lg">
           {formatViews(String(selectedVideoMetrics.impressions || 0))}
          </span>
          <span className="text-[8px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">
           Impressions
          </span>
         </div>
         <div className="bg-gray-50 border-[3px] border-black rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center hover:bg-[#FF8AAF] hover:text-black transition-colors group h-16">
          <MousePointerClick
           className="text-[#FF8AAF] group-hover:text-black mb-1"
           size={20}
           strokeWidth={3}
          />
          <span className="font-[1000] text-lg">
           {selectedVideoMetrics.isShort
            ? `${selectedVideoMetrics.stw.toFixed(1)}%`
            : `${selectedVideoMetrics.ctr.toFixed(1)}%`}
          </span>
          <span className="text-[8px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">
           {selectedVideoMetrics.isShort ? "STW %" : "CTR"}
          </span>
         </div>
         <div className="bg-gray-50 border-[3px] border-black rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center hover:bg-[#4FFF5B] hover:text-black transition-colors group h-16">
          <DollarSign
           className="text-[#4FFF5B] group-hover:text-black mb-1"
           size={20}
           strokeWidth={3}
          />
          <span className="font-[1000] text-lg">
           ${selectedVideoMetrics.revenue.toFixed(2)}
          </span>
          <span className="text-[8px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">
           Revenue
          </span>
         </div>
         <div className="bg-gray-50 border-[3px] border-black rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center hover:bg-[#FFE357] hover:text-black transition-colors group h-16">
          <Clock className="text-[#FFE357] group-hover:text-black mb-1" size={20} strokeWidth={3} />
          <span className="font-[1000] text-lg">{formatDuration(videoStats?.duration || "0")}</span>
          <span className="text-[8px] font-black uppercase tracking-widest text-black/40 group-hover:text-black/60">Length</span>
         </div>
        </div>
       </SubToolbox>

       <SubToolbox
        title="Thumbnail Asset"
        icon={<ImageIcon size={20} strokeWidth={3} />}
        paletteIndex={basePalette + 2}
        collapsible
        isOpenInitial={true}
        contentClassName="p-4 flex-1 flex flex-col space-y-3"
       >
        <div
         className={`flex-1 relative rounded-xl border-[4px] border-dashed flex flex-col items-center justify-center p-4 transition-all overflow-hidden min-h-[180px] ${isDraggingThumbnail ? "border-[#FF83EA] bg-[#FF83EA]/10" : "border-black/20 bg-gray-50"}`}
         onDragOver={(e) => {
          e.preventDefault()
          setIsDraggingThumbnail(true)
         }}
         onDragLeave={() => setIsDraggingThumbnail(false)}
         onDrop={(e) => {
          e.preventDefault()
          setIsDraggingThumbnail(false)
          if (e.dataTransfer.files[0])
           handleThumbnailChange(e.dataTransfer.files[0])
         }}>
         {thumbnailPreview || selectedVideo.thumbnail ? (
          <div className="relative w-full h-full group">
           <img
            src={thumbnailPreview || selectedVideo.thumbnail}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
           />
           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-lg backdrop-blur-sm">
            <button
             onClick={() => fileInputRef.current?.click()}
             className="bg-[#FFFF61] p-4 rounded-xl border-[4px] border-black hover:scale-110 transition-transform">
             <Upload size={24} strokeWidth={3} />
            </button>
            {thumbnailPreview && (
             <button
              onClick={() => {
               setThumbnailFile(null)
               setThumbnailPreview(null)
              }}
              className="bg-[#FF83EA] text-white p-4 rounded-xl border-[4px] border-black hover:scale-110 transition-transform">
              <Trash2 size={24} strokeWidth={3} />
             </button>
            )}
           </div>
          </div>
         ) : (
          <div className="text-center">
           <Upload size={48} className="mx-auto mb-4 text-black/20" />
           <p className="font-black uppercase text-sm text-black/40">
            Drag Image Here
           </p>
          </div>
         )}
        </div>
       </SubToolbox>
      </div>

      {/* Video Details */}
      <SubToolbox
       title="Video Details"
       icon={<AlignLeft size={20} strokeWidth={3} />}
       paletteIndex={basePalette + 3}
       collapsible
       isOpenInitial={true}
      >
       <div className="space-y-6">
        <div className="space-y-2">
         <label className="text-[12px] font-black uppercase tracking-widest text-black/50 ml-1">
          Video Title
         </label>
         <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full bg-gray-50 border-[4px] border-black rounded-xl p-5 font-black uppercase text-xl focus:bg-white focus:border-[#00CCFF] focus:shadow-[4px_4px_0px_0px_#00CCFF] outline-none transition-all"
          placeholder="TITLE..."
         />
        </div>
        <div className="space-y-2">
         <label className="text-[12px] font-black uppercase tracking-widest text-black/50 ml-1">
          Description
         </label>
         <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full h-80 bg-gray-50 border-[4px] border-black rounded-xl p-5 font-bold text-base focus:bg-white focus:border-[#00CCFF] focus:shadow-[4px_4px_0px_0px_#00CCFF] outline-none resize-none transition-all"
          placeholder="DESCRIPTION..."
         />
        </div>
        <div className="space-y-2">
         <label className="text-[12px] font-black uppercase tracking-widest text-black/50 ml-1">
          Tags
         </label>
         <input
          value={editTags}
          onChange={(e) => setEditTags(e.target.value)}
          className="w-full bg-gray-50 border-[4px] border-black rounded-xl p-5 font-black uppercase text-sm focus:bg-white focus:border-[#00CCFF] focus:shadow-[4px_4px_0px_0px_#00CCFF] outline-none transition-all"
          placeholder="TAG ONE, TAG TWO, TAG THREE..."
         />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="space-y-2">
          <label className="text-[12px] font-black uppercase tracking-widest text-black/50 ml-1">
           Privacy
          </label>
          <select
           value={editPrivacy}
           onChange={(e) => setEditPrivacy(e.target.value)}
           className="w-full bg-gray-50 border-[4px] border-black rounded-xl p-4 font-black uppercase outline-none text-lg">
           <option value="public">Public</option>
           <option value="unlisted">Unlisted</option>
           <option value="private">Private</option>
          </select>
         </div>
         <div className="space-y-2">
          <label className="text-[12px] font-black uppercase tracking-widest text-black/50 ml-1">
           Category
          </label>
          <select
           value={editCategoryId}
           onChange={(e) => setEditCategoryId(e.target.value)}
           className="w-full bg-gray-50 border-[4px] border-black rounded-xl p-4 font-black uppercase outline-none text-lg">
           {categories.map((c) => (
            <option key={c.id} value={c.id}>
             {c.title}
            </option>
           ))}
          </select>
         </div>
         <div className="space-y-2">
          <label className="text-[12px] font-black uppercase tracking-widest text-black/50 ml-1">
           Playlists
          </label>
          <div className="relative" ref={playlistMenuRef}>
           <button
            onClick={(e) => {
             e.stopPropagation()
             setPlaylistMenuOpen(!playlistMenuOpen)
            }}
            className="w-full bg-gray-50 border-[4px] border-black rounded-xl p-4 font-black uppercase flex justify-between items-center hover:bg-gray-100 transition-colors text-lg">
            <span className="truncate">
             {selectedPlaylistIds.length === 0
              ? "None Selected"
              : `${selectedPlaylistIds.length} Linked`}
            </span>
            <ChevronDown size={20} />
           </button>
           {playlistMenuOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border-[4px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] max-h-72 overflow-y-auto z-50 p-3 space-y-2">
             {userPlaylists.length > 0 ? (
              userPlaylists.map((p) => (
               <label
                key={p.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-[3px] cursor-pointer transition-all ${selectedPlaylistIds.includes(p.id) ? "border-[#00CCFF] bg-[#00CCFF]/10" : "border-black hover:bg-gray-100"}`}>
                <input
                 type="checkbox"
                 checked={selectedPlaylistIds.includes(p.id)}
                 onChange={() => togglePlaylist(p.id)}
                 className="w-6 h-6 border-[3px] border-black accent-black"
                />
                <span className="font-black text-sm uppercase truncate">
                 {p.title}
                </span>
               </label>
              ))
             ) : (
              <p className="font-bold text-sm uppercase text-center py-6 text-black/40">
               No Playlists Found
              </p>
             )}
            </div>
           )}
          </div>
         </div>
        </div>
       </div>
      </SubToolbox>

      {/* Tag Manager */}
      <SubToolbox
       title="Video Tags"
       icon={<Tag size={20} strokeWidth={3} />}
       paletteIndex={basePalette + 4}
       collapsible
       isOpenInitial={false}
       actionButton={
        <div className="flex gap-2">
         <button
          onClick={handleRankTags}
          disabled={isAnalyzingTags || !editTags}
          className="bg-black text-white px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 flex items-center gap-2">
          {isAnalyzingTags ? (
           <Loader2 size={14} className="animate-spin" />
          ) : (
           <BarChart3 size={14} />
          )}{" "}
          Rank Tags
         </button>
         <button
          onClick={() => setIsTagsExpanded(!isTagsExpanded)}
          className="bg-black text-white p-2 rounded-lg hover:bg-white hover:text-black transition-colors">
          <ChevronDown
           size={16}
           className={`transition-transform ${isTagsExpanded ? "rotate-180" : ""}`}
          />
         </button>
        </div>
       }>
       <div className="space-y-6">
        <div className="flex gap-4">
         <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTag(tagInput)}
          className="flex-1 bg-gray-50 border-[4px] border-black rounded-xl p-5 font-black uppercase text-lg focus:bg-white outline-none"
          placeholder="ADD TAG..."
         />
         <button
          onClick={() => handleAddTag(tagInput)}
          className="bg-black text-white px-10 font-black uppercase rounded-xl border-[4px] border-black shadow-[6px_6px_0px_0px_#FF3399] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#FF3399] transition-all text-xl">
          ADD
         </button>
        </div>

        <div
         className={`w-full border-[4px] border-black rounded-2xl bg-white p-3 flex flex-wrap gap-2 content-start transition-all ${isTagsExpanded ? "min-h-[132px]" : "min-h-[92px]"}`}>
         {editTags ? (
          editTags
           .split(",")
           .map((t) => t.trim())
           .filter(Boolean)
           .map((t) => (
            <TagBadge
             key={t}
             tag={t}
             onRemove={() => handleRemoveTag(t)}
             analysis={existingTagAnalysis.find(
              (a) => a.tag.toLowerCase() === t.toLowerCase(),
             )}
            />
           ))
         ) : (
          <p className="text-black/30 font-black uppercase text-sm w-full text-center py-6">
           No tags populated...
          </p>
         )}
        </div>

        {isTagsExpanded && (
         <div className="space-y-6 pt-6 border-t-[4px] border-dashed border-black/10">
          <button
           onClick={handleGenerateTags}
           disabled={isGeneratingTags}
           className="w-full bg-[#FF3399] text-white p-6 rounded-2xl border-[4px] border-black font-[1000] uppercase text-2xl flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_black] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50">
           {isGeneratingTags ? (
            <Loader2 size={32} className="animate-spin" />
           ) : (
            <Sparkles size={32} />
           )}
           {isGeneratingTags
            ? "Scanning Market..."
            : "Generate Algorithm Suggestions"}
          </button>
          {suggestedTags.length > 0 && (
           <div className="space-y-4">
            <label className="text-[12px] font-black uppercase tracking-widest text-black/50 ml-1">
             Ranked Suggestions
            </label>
            <div className="flex flex-wrap gap-2 p-6 border-[4px] border-black rounded-xl bg-white shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)]">
             {suggestedTags.map((st) => (
              <TagBadge
               key={st.tag}
               tag={st.tag}
               isSuggested
               isAdded={editTags.toLowerCase().includes(st.tag.toLowerCase())}
               onAdd={() => handleAddTag(st.tag, st)}
               analysis={st}
              />
             ))}
            </div>
           </div>
          )}
         </div>
        )}
       </div>
      </SubToolbox>

      {/* Update Button */}
      <button
       onClick={handleSave}
       disabled={saving}
       className="w-full bg-[#FFFF61] border-[6px] border-black text-black p-8 rounded-[32px] font-[1000] uppercase text-4xl tracking-tighter shadow-[16px_16px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-[8px_8px_0px_0px_black] active:translate-y-3 active:shadow-none transition-all flex items-center justify-center gap-6 disabled:opacity-50 mt-8">
       {saving ? (
        <Loader2 className="animate-spin" size={40} />
       ) : (
        <Save size={40} strokeWidth={3} />
       )}
       {saving ? "Transmitting to Server..." : "UPDATE VIDEO DETAILS"}
      </button>
     </div>
    ) : (
     <div className="h-[500px] flex flex-col items-center justify-center gap-5 font-black uppercase text-3xl tracking-tighter text-black/20">
      <Edit size={100} strokeWidth={1} className="mb-2 opacity-50" />
      Awaiting Asset Selection
     </div>
    )}
    <input
     type="file"
     ref={fileInputRef}
     onChange={(e) =>
      e.target.files?.[0] && handleThumbnailChange(e.target.files[0])
     }
     className="hidden"
     accept="image/*"
    />
   </div>
  </ToolboxScaffold>
 )
}

export default VideoManager
