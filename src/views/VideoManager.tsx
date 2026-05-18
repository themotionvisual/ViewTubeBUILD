import React, { useCallback, useState, useEffect, useRef } from "react"
import {
 fetchVideoList,
 fetchVideoDetails,
 updateVideo,
 updateVideoThumbnail,
 fetchVideoStats,
 fetchSingleVideoAnalytics,
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
 Playlist,
 PlaylistMembership,
} from "../services/youtubeService"
import { useBrain } from "../context/useBrain"
// Removed isChannelConnected import
import {
 generateTagSuggestions,
 analyzeExistingTags,
 hasGeminiKey,
} from "../services/gemini"
import { StandardButton } from "../components/NativeUIKit"
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
 ChevronDown,
 Sparkles,
 BarChart3,
 Image as ImageIcon,
 AlertCircle,
 CheckCircle,
 AlignLeft,
 Edit,
 ExternalLink,
 Settings,
} from "lucide-react"
import {
 StandardInput,
 StandardTextArea,
 SubToolboxGridActionButton,
 SubToolboxInnerActionButton,
 ToolboxScaffold,
 SubToolbox,
 SubToolboxDropdownTopTitleControl,
} from "../components/Toolbox"
import { getToolboxPaletteColors } from "../styles/toolboxPalette"
import { hexToRgba } from "../components/ToolboxUISystem"

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
 const [isHovered, setIsHovered] = useState(false)
 const badgeRef = useRef<HTMLButtonElement>(null)

 const getRankColor = (rank?: number) => {
  if (typeof rank !== "number") return "#ffffff"
  if (rank >= 1 && rank <= 10) return "#45C8E9" // cyan
  if (rank >= 11 && rank <= 20) return "#57F15C" // green
  if (rank >= 21 && rank <= 30) return "#F9F36B" // yellow
  if (rank >= 31 && rank <= 40) return "#FFB158" // orange
  return "#FF7497" // red
 }

 return (
  <div className="relative group">
   <button
    ref={badgeRef}
   type="button"
    onClick={isAdded ? undefined : onAdd || onRemove}
    onMouseEnter={() => {
      setIsHovered(true)
     if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect()
      setTooltipPos({ left: rect.left + rect.width / 2, top: rect.top })
     }
     setShowTooltip(true)
    }}
    onMouseLeave={() => {
      setShowTooltip(false)
      setIsHovered(false)
    }}
   className="inline-flex items-center px-3 py-1 text-xs font-[900] uppercase border-[3px] border-black rounded-full shadow-[3px_3px_0px_0px_var(--vt-subtoolbox-shadow,rgba(0,0,0,0.35))]"
    style={{
     backgroundColor: isAdded
      ? "#E5E7EB"
      : isHovered
        ? "#FFFFFF"
        : analysis
          ? getRankColor(analysis.rank)
          : "#FFFFFF",
     opacity: isAdded ? 0.65 : 1,
     cursor: isAdded ? "not-allowed" : "pointer",
    }}>
    <span className="whitespace-nowrap text-black">{tag}</span>
    {analysis && <span className="ml-1 font-[1000] text-black">#{analysis.rank}</span>}
    {(onRemove || (isSuggested && !isAdded)) && (
     <span
      className="w-4 h-4 flex shrink-0 items-center justify-center rounded-full bg-black text-white ml-2 border border-transparent hover:bg-[#ff3b30] hover:text-black hover:border-transparent"
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
     className="fixed z-[200] w-52 bg-white text-black p-3 rounded-2xl border-[4px] border-black shadow-[6px_6px_0px_0px_black] pointer-events-none"
     style={{ left: tooltipPos.left, top: tooltipPos.top - 12, transform: "translate(-50%, -100%)" }}
    >
     <div className="space-y-2 text-[10px] font-bold uppercase">
      <div className="flex justify-between border-b border-black/20 pb-1 mb-1">
       <span className="text-black/60">SEO Metrics</span>
       <span
        className="text-black px-2 py-0.5 rounded-full font-black border border-black"
        style={{ backgroundColor: getRankColor(analysis.rank) }}>
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
const MAX_TAG_CHARS = 500
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

 // Edit State
 const [editTitle, setEditTitle] = useState("")
 const [editDescription, setEditDescription] = useState("")
 const [editTags, setEditTags] = useState("")
 const [editPrivacy, setEditPrivacy] = useState("public")
 const [editCategoryId, setEditCategoryId] = useState("27")

 // Playlists
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
 const chooseVideoPalette = getToolboxPaletteColors(basePalette + 1)
 const updateDetailsPalette = getToolboxPaletteColors(basePalette + 5)

 const connected = authState.isAuthenticated
 const showHeaderLoadAssetsButton = videos.length === 0

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
      thumbnail: `https://img.youtube.com/vi/${String(record.videoId || "").trim()}/hqdefault.jpg`,
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


 const loadInitialData = async () => {
  setVideoListLoadState("loading")
  setLoading(true)
  setError(null)
  try {
   const results = await Promise.allSettled([
   Promise.resolve(getCachedVideos()),
    fetchUserPlaylists(),
   ])

   if (results[0].status === "rejected") {
    throw results[0].reason;
   }

   const videoList = results[0].value || [];
   const playlists = results[1].status === "fulfilled" ? results[1].value : [];

   setVideos(videoList)
   setUserPlaylists(playlists)
   setHasLoadedInitialData(true)
   setVideoListLoadState(videoList.length === 0 ? "empty" : "success")
   if (videoList.length > 0) {
    console.info("[VideoManager] Hydrated videos from analytics cache", {
     source: "yt_analytics_cache.videos",
     count: videoList.length,
    })
   } else if (connected) {
    console.info("[VideoManager] Empty video list after initial load", {
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
    const data = query ? await fetchVideoList(50, query) : getCachedVideos()
    setVideos(data)
    if (!query) {
     setVideoListLoadState(data.length === 0 ? "empty" : "success")
     if (data.length > 0) {
      console.info("[VideoManager] Reload hydrated videos from analytics cache", {
       source: "yt_analytics_cache.videos",
       count: data.length,
      })
     } else if (connected) {
      console.info("[VideoManager] Empty video list after reload", {
       isAuthenticated: connected,
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
   const cacheVideos = getCachedVideos()
   setVideos(cacheVideos)
   setHasLoadedInitialData(true)
   setVideoListLoadState(cacheVideos.length === 0 ? "empty" : "success")
   setError(null)
   console.info("[VideoManager] Sync refresh complete", {
    cacheCount: cacheVideos.length,
    finalCount: cacheVideos.length,
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
  if (existingTagAnalysis.length > 0) {
   setShowRankDetails(true)
   return
  }
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
  const normalizedCurrent = current.map((t) => t.toLowerCase())
  if (normalizedCurrent.includes(trimmed.toLowerCase())) {
   setTagInput("")
   return
  }
  const prospective = [...current, trimmed].join(", ")
  if (prospective.length > MAX_TAG_CHARS) {
   alert("Character limit exceeded. Tags must be 500 characters or less including spaces.")
   return
  }
  setEditTags(prospective)
  if (analysis) setExistingTagAnalysis((prev) => [...prev, analysis])
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

 const parseNumeric = (value: unknown): number => {
  const n = Number(String(value ?? "").replace(/[^0-9.-]/g, ""))
  return Number.isFinite(n) ? n : 0
 }

 const parseIsoDurationToSeconds = (iso: string): number => {
  if (!iso || typeof iso !== "string") return 0
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = Number(match[1] || 0)
  const minutes = Number(match[2] || 0)
  const seconds = Number(match[3] || 0)
  return hours * 3600 + minutes * 60 + seconds
 }

 const formatDuration = (durationValue: string) => {
  const totalSeconds = /^\d+$/.test(String(durationValue))
   ? parseInt(String(durationValue), 10)
   : parseIsoDurationToSeconds(String(durationValue))
  if (isNaN(totalSeconds)) return "0:00"
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
 if (h > 0)
   return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  return `${m}:${s.toString().padStart(2, "0")}`
 }

 const selectedVideoPublishedDate = selectedVideo?.publishedAt
  ? new Date(selectedVideo.publishedAt).toLocaleDateString()
  : "NO DATE"
 const selectedVideoLength =
  videoStats?.duration && videoStats.duration !== "0"
   ? formatDuration(videoStats.duration)
   : "--:--"
 const pendingTagCount = tagInput
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean).length
 const addTagButtonLabel = pendingTagCount <= 1 ? "Add Tag" : "Add Tags"

 const selectedVideoMetrics = React.useMemo(() => {
  if (!selectedVideoId) {
   return {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    watchHours: 0,
    impressions: 0,
    ctr: 0,
    stw: 0,
    endScreenClickRate: 0,
    cardClickRate: 0,
    isShort: false,
    revenue: parseNumeric(videoAnalytics?.estimatedRevenue || 0),
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
    ]) || parseNumeric(videoAnalytics?.clickThroughRate || "0")

   return {
    views:
     parseNumeric(videoStats?.views || 0) ||
     getRowValue(["Views", "views"]),
    likes:
     parseNumeric(videoStats?.likes || 0) ||
     getRowValue(["Likes", "likes"]),
    comments:
     parseNumeric(videoStats?.comments || 0) ||
     getRowValue(["Comments", "comments"]),
    shares: getRowValue(["Shares", "shares"]) || parseNumeric(videoAnalytics?.shares || 0),
    watchHours,
    impressions: getRowValue(["Impressions", "impressions"]),
    ctr: Number.isFinite(ctr) ? ctr : 0,
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
    views: parseNumeric(videoStats?.views || 0),
    likes: parseNumeric(videoStats?.likes || 0),
    comments: parseNumeric(videoStats?.comments || 0),
    shares: parseNumeric(videoAnalytics?.shares || 0),
    watchHours: 0,
    impressions: 0,
    ctr: parseNumeric(videoAnalytics?.clickThroughRate || "0"),
    stw: 0,
    endScreenClickRate: 0,
    cardClickRate: 0,
    isShort: Number(videoStats?.duration || 0) <= 180,
    revenue: Number(videoAnalytics?.estimatedRevenue || 0),
   }
  }
 }, [selectedVideoId, videoStats, videoAnalytics, cacheTick])

  const kpiCards = [
  {
   key: "views",
   label: "Views",
   value: formatViews(String(selectedVideoMetrics.views || 0)),
   tone: "bg-[#40C6E9]",
  },
  {
   key: "watch",
   label: "Watch Hrs",
   value: selectedVideoMetrics.watchHours.toFixed(2),
   tone: "bg-[#B9FF58]",
  },
  {
   key: "likes",
   label: "Likes",
   value: formatViews(String(selectedVideoMetrics.likes || 0)),
   tone: "bg-[#FF83EA]",
  },
  {
   key: "comments",
   label: "Comments",
   value: formatViews(String(selectedVideoMetrics.comments || 0)),
   tone: "bg-[#FFFF61]",
  },
  {
   key: "shares",
   label: "Shares",
   value: formatViews(String(selectedVideoMetrics.shares || 0)),
   tone: "bg-[#FFB570]",
  },
  {
   key: "revenue",
   label: "Revenue",
   value: `$${selectedVideoMetrics.revenue.toFixed(2)}`,
   tone: "bg-[#4FFF5B]",
  },
  {
   key: "length",
   label: "Length",
   value: formatDuration(videoStats?.duration || "0"),
   tone: "bg-[#FFE357]",
  },
  {
   key: "end-screen",
   label: "End Screen %",
   value: `${selectedVideoMetrics.endScreenClickRate.toFixed(1)}%`,
   tone: "bg-[#9CEBFF]",
  },
  ]

 const categoryOptions = [
  { value: "2", label: "Autos & Vehicles" },
  { value: "23", label: "Comedy" },
  { value: "27", label: "Education" },
  { value: "24", label: "Entertainment" },
  { value: "1", label: "Film & Animation" },
  { value: "20", label: "Gaming" },
  { value: "26", label: "Howto & Style" },
  { value: "10", label: "Music" },
  { value: "25", label: "News & Politics" },
  { value: "29", label: "Nonprofits & Activism" },
  { value: "22", label: "People & Blogs" },
  { value: "15", label: "Pets & Animals" },
  { value: "28", label: "Science & Technology" },
  { value: "17", label: "Sports" },
  { value: "19", label: "Travel & Events" },
 ]
 const selectedCategoryLabel =
  categoryOptions.find((option) => option.value === editCategoryId)?.label ||
  "Select Category"

 const [subtitleStep, setSubtitleStep] = useState(0)
 const subtitleBase =
  "Generate titles, descriptions, tags, and everything else you need to publish your video with just a simple click of a button all you need to do is upload the video!"
 const subtitleAdditions = [
  "If you don't have a video just upload a script!",
  "And if you don't have that we can create it all from a concept!",
  "If you don't have a concept, we can still build the whole thing with you.",
  "If you have no idea what you wanna create we can help with that too.",
 ]
 const subtitleButtonLabels = [
  "don't have a video?",
  "don't have a script?",
  "don't have a concept?",
 ]
 const subtitleHelpRail = (
  <div className="flex flex-wrap items-center gap-2">
   <span className="uppercase tracking-[0.12em]">{subtitleBase}</span>
   {subtitleStep > 0 && (
    <span className="uppercase tracking-[0.12em]">{subtitleAdditions[0]}</span>
   )}
   {subtitleStep > 1 && (
    <span className="uppercase tracking-[0.12em]">{subtitleAdditions[1]}</span>
   )}
   {subtitleStep > 2 && (
    <span className="uppercase tracking-[0.12em]">{subtitleAdditions[2]}</span>
   )}
   {subtitleStep > 3 && (
    <span className="uppercase tracking-[0.12em]">{subtitleAdditions[3]}</span>
   )}
   {subtitleStep < subtitleButtonLabels.length && (
    <button
     type="button"
     onClick={(event) => {
      event.stopPropagation()
      setSubtitleStep((prev) => Math.min(prev + 1, subtitleButtonLabels.length + 1))
     }}
     className="h-7 px-3 rounded-full border-[3px] border-black bg-white text-[9px] font-black uppercase tracking-[0.12em] shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
    >
     {subtitleButtonLabels[subtitleStep]}
    </button>
   )}
  </div>
 )

 if (!connected) {
  return (
   <ToolboxScaffold
    title="VIDEO MANAGER"
    subtitle={subtitleBase}
    icon={<FileVideo size={40} strokeWidth={3} className="text-black" />}
    headerColor="bg-[#00CCFF]"
    iconBoxColor="bg-[#FFDD00]"
    paletteIndex={paletteIndex}
    collapsible={collapsible}
    isOpen={isOpen}
    onToggle={() => setIsOpen(!isOpen)}
    embedded={embedded}
    helpText={subtitleHelpRail}
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
   subtitle={subtitleBase}
   icon={<FileVideo size={40} strokeWidth={3} className="text-black" />}
   headerColor="bg-[#00CCFF]"
   iconBoxColor="bg-[#CC99FF]"
   paletteIndex={paletteIndex}
   collapsible={collapsible}
   isOpen={isOpen}
   onToggle={() => setIsOpen(!isOpen)}
   embedded={embedded}
   helpText={subtitleHelpRail}
   headerActions={
    showHeaderLoadAssetsButton ? (
     <button
      type="button"
      onClick={(event) => {
       event.stopPropagation()
       lastSearchRef.current = ""
       setVideoSearchQuery("")
       loadInitialData()
      }}
      disabled={loading}
      className={`h-[38px] px-4 rounded-[12px] border-[3px] border-black bg-black text-white text-[10px] font-black uppercase tracking-[0.14em] shadow-[2px_2px_0px_0px_black] transition-all ${
       loading
        ? "opacity-60 cursor-not-allowed"
        : "hover:bg-[#111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_black]"
      }`}>
      {loading ? "SYNCING..." : "LOAD SPACE ASSETS"}
     </button>
    ) : null
   }
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
    {showRankDetails && existingTagAnalysis.length > 0 && (
     <div className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white border-[6px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden">
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
         className="h-10 w-10 rounded-lg border-[4px] border-black bg-white flex items-center justify-center">
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
            <td className="p-2 text-xs font-black">
             <span
              className="px-2 py-0.5 rounded-md border border-black"
              style={{
               backgroundColor:
                analysis.rank <= 10
                 ? "#ccff00"
                 : analysis.rank <= 20
                  ? "#ffdd00"
                  : "#ffffff",
              }}
             >
              #{analysis.rank}
             </span>
            </td>
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
      <div className={`relative ${dropdownOpen ? "z-[120]" : "z-10"} space-y-2`}>
       <label className="text-[12px] font-black uppercase tracking-widest text-black/50 ml-1">Choose Video</label>
       <div className="relative" ref={dropdownRef}>
          <button
           onClick={() => setDropdownOpen((prev) => !prev)}
           className={`group w-full border-[3px] border-black overflow-hidden transition-[border-radius] duration-300 ease-out block appearance-none p-0 ${
            dropdownOpen ? "rounded-t-[16px] rounded-b-none" : "rounded-[16px]"
           }`}
           style={{
            backgroundColor: chooseVideoPalette.header,
            boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.25)",
            height: "100px",
           }}
          >
           <div className="h-full flex items-stretch">
            <div className="w-[56px] h-full border-r-[3px] border-black flex items-center justify-center" style={{ backgroundColor: chooseVideoPalette.icon }}>
             <FileVideo size={20} strokeWidth={3} className="text-black" />
            </div>
            <div className="flex-1 h-full flex items-center gap-3 px-3 pr-10">
             <div className="h-14 w-24 shrink-0 rounded-md border-[3px] border-black overflow-hidden bg-black">
              <img
               src={selectedVideo?.thumbnail}
               alt={selectedVideo?.title || "Selected video thumbnail"}
               className="w-full h-full object-cover"
              />
             </div>
             <div className="min-w-0 text-left">
              <div className="flex items-center justify-between gap-3">
               <p className="text-[8px] font-black uppercase tracking-[0.14em] text-black/60 shrink-0">Selected Video</p>
               <p className="text-[9px] font-black uppercase tracking-[0.1em] text-black/55 truncate">
                <a
                 href={`https://youtube.com/watch?v=${selectedVideo.videoId}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 onClick={(event) => event.stopPropagation()}
                 className="inline-flex items-center gap-1 text-[#00CCFF] hover:text-[#FF3399] transition-colors mr-2"
                >
                 View on YouTube <ExternalLink size={12} strokeWidth={3} />
                </a>
                {selectedVideoPublishedDate} • {selectedVideoLength}
               </p>
              </div>
              <p className="font-[1000] uppercase tracking-tighter text-[20px] leading-[1] truncate text-black mt-0.5">
               {selectedVideo?.title || "Select video"}
              </p>
             </div>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
             <ChevronDown
              size={20}
              strokeWidth={3}
              className={`text-black transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
             />
            </div>
           </div>
          </button>
          {dropdownOpen && (
           <div className="absolute left-0 right-0 top-full bg-white border-x-[3px] border-b-[3px] border-black rounded-b-[16px] shadow-[4px_4px_0px_0px_rgba(252,175,87,0.45)] max-h-[460px] overflow-y-auto z-[160] p-3 space-y-3">
            <div className="relative">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
             <input
              value={videoSearchQuery}
              onChange={(e) => setVideoSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border-[3px] border-black rounded-lg font-black uppercase text-xs outline-none focus:border-[#00CCFF] focus:bg-white"
             />
            </div>
            {isSearchingVideos && (
             <p className="text-[10px] font-black uppercase tracking-[0.12em] text-black/50">Searching...</p>
            )}
            <div className="space-y-2">
             {videos.map((video) => (
              <button
               key={video.videoId}
               onClick={() => {
                handleSelectVideo(video.videoId)
                setDropdownOpen(false)
               }}
               className={`w-full text-left p-2 rounded-xl border-[3px] transition-all ${
                selectedVideoId === video.videoId
                 ? "border-[#00CCFF] bg-[#00CCFF]/10 shadow-[2px_2px_0px_0px_#00CCFF]"
                 : "border-black bg-white hover:bg-gray-100"
               }`}
              >
               <div className="flex items-start gap-3">
                <img
                 src={video.thumbnail}
                 alt={video.title}
                 className="w-20 h-12 object-cover rounded-md border-[2px] border-black bg-black"
                />
                <div className="min-w-0">
                 <p className="font-black uppercase text-[11px] leading-tight line-clamp-2">{video.title}</p>
                 <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/50 mt-1">
                  {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : "NO DATE"}
                 </p>
                </div>
               </div>
              </button>
             ))}
            </div>
           </div>
          )}
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
       <SubToolbox
        title="Video Details"
        icon={<Settings size={20} strokeWidth={3} />}
        paletteIndex={basePalette + 1}
        collapsible
        isOpenInitial={true}
        shellClassName="h-full"
        contentClassName="p-4 h-full flex flex-col gap-4"
       >
        <div className="space-y-2">
         <label className="text-[12px] font-black uppercase tracking-widest text-black/50 ml-1">Title</label>
         <StandardInput
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full"
          placeholder="TITLE..."
         />
        </div>

        <div className="space-y-2">
         <label className="text-[12px] font-black uppercase tracking-widest text-black/50 ml-1">Video Stats</label>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpiCards.map((card) => (
           <div
            key={card.key}
            className="rounded-xl border-[3px] border-black bg-white shadow-[2px_2px_0px_0px_black] overflow-hidden flex flex-col min-h-[106px]"
           >
            <div className={`py-1 border-b-[2px] border-black ${card.tone} shrink-0 flex items-center justify-center`}>
             <span className="text-[10px] font-black uppercase tracking-[0.1em] text-black">
              {card.label}
             </span>
            </div>
            <div className="px-2 py-2 flex-1 flex flex-col items-center justify-center text-center">
             <span className="font-[1000] text-[28px] leading-none tracking-tighter">{card.value}</span>
            </div>
           </div>
          ))}
         </div>
        </div>

        <div className="space-y-2">
         <label className="text-[12px] font-black uppercase tracking-widest text-black/50 ml-1">Publishing Controls</label>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
           <SubToolboxDropdownTopTitleControl
            label="PRIVACY"
            value={editPrivacy}
            options={[
             { value: "public", label: "public" },
             { value: "unlisted", label: "unlisted" },
             { value: "private", label: "private" },
            ]}
            onChange={setEditPrivacy}
            tone="green"
            borderWidth={3}
           />
          </div>

          <div className="space-y-2">
           <SubToolboxDropdownTopTitleControl
            label="CATEGORY"
            value={selectedCategoryLabel}
            options={categoryOptions.map((option) => ({ value: option.value, label: option.label }))}
            onChange={setEditCategoryId}
            tone="green"
            borderWidth={3}
           />
          </div>

          <div className="space-y-2">
           <SubToolboxDropdownTopTitleControl
            label="PLAYLISTS"
            value={selectedPlaylistIds.length === 0 ? "NONE SELECTED" : `${selectedPlaylistIds.length} LINKED`}
            options={userPlaylists.map((playlist) => ({ value: playlist.id, label: playlist.title }))}
            onChange={togglePlaylist}
            multiSelect
            selectedValues={selectedPlaylistIds}
            tone="green"
            borderWidth={3}
           />
          </div>
         </div>
        </div>
       </SubToolbox>

       <SubToolbox
        title="Thumbnail"
        icon={<ImageIcon size={20} strokeWidth={3} />}
        paletteIndex={basePalette + 1}
        collapsible
        isOpenInitial={true}
        shellClassName="h-full"
        contentClassName="p-4 h-full flex flex-col"
       >
        <div className="space-y-2 h-full flex flex-col">
         <div className="flex items-center justify-between gap-3 px-1">
          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-black/50 ml-auto">Drag + Drop to Replace</span>
         </div>
         <div
          className={`relative rounded-xl border-[4px] border-dashed flex-1 flex flex-col items-center justify-center p-4 transition-all overflow-hidden min-h-[220px] ${isDraggingThumbnail ? "border-[#FF83EA] bg-[#FF83EA]/10" : "border-black/20 bg-gray-50"}`}
          onDragOver={(e) => {
           e.preventDefault()
           setIsDraggingThumbnail(true)
          }}
          onDragLeave={() => setIsDraggingThumbnail(false)}
          onDrop={(e) => {
           e.preventDefault()
           setIsDraggingThumbnail(false)
           if (e.dataTransfer.files[0]) handleThumbnailChange(e.dataTransfer.files[0])
          }}>
          {thumbnailPreview || selectedVideo.thumbnail ? (
           <div className="relative w-full aspect-video group">
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
            <p className="font-black uppercase text-sm text-black/40">Drag Image Here</p>
           </div>
          )}
         </div>
        </div>
       </SubToolbox>
      </div>

      <SubToolbox title="Description" icon={<AlignLeft size={18} strokeWidth={3} />} paletteIndex={basePalette + 3} collapsible isOpenInitial={true}>
       <StandardTextArea
        value={editDescription}
        onChange={(e) => setEditDescription(e.target.value)}
        className="h-80 text-base vm-scrollless"
        placeholder="DESCRIPTION..."
       />
      </SubToolbox>
      <SubToolbox
       title="Video Tags"
       icon={<Tag size={20} strokeWidth={3} />}
       paletteIndex={basePalette + 4}
       collapsible
       isOpen={isTagsExpanded}
       onToggle={() => setIsTagsExpanded((prev) => !prev)}
      >
       <div>
        <div className="p-6 bg-white space-y-6">
           <div className="flex gap-4">
            <StandardInput
             value={tagInput}
             onChange={(e) => setTagInput(e.target.value)}
             onKeyDown={(e) => e.key === "Enter" && handleAddTag(tagInput)}
             className="flex-1"
             placeholder="ADD TAG..."
             maxLength={MAX_TAG_CHARS}
            />
            <div className="w-[168px]">
            <SubToolboxInnerActionButton
              onClick={() => handleAddTag(tagInput)}
              disabled={[...editTags.split(",").map((t) => t.trim()).filter(Boolean), tagInput.trim()].filter(Boolean).join(", ").length > MAX_TAG_CHARS}
              className="!transition-none hover:!translate-y-0 active:!translate-y-0"
              label={addTagButtonLabel}
             />
            </div>
           </div>
           
           <div
            className={`relative w-full border-[3px] border-black rounded-2xl bg-white p-3 pb-9 flex flex-wrap gap-2 content-start min-h-[132px] shadow-[3px_3px_0px_0px_var(--vt-subtoolbox-shadow,rgba(0,0,0,0.28))]`}>
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
            <span className="absolute right-3 bottom-2 text-[11px] font-black uppercase tracking-[0.08em] text-black/55">
             {editTags.length}/{MAX_TAG_CHARS}
            </span>
           </div>

           <div className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
             <SubToolboxInnerActionButton
             onClick={handleGenerateTags}
             disabled={isGeneratingTags || editTags.length >= MAX_TAG_CHARS}
             className="!transition-none hover:!translate-y-0 active:!translate-y-0"
             label={isGeneratingTags ? "Scanning Market..." : "Generate High Ranking Video Tags"}
             />
             <button
              type="button"
              onClick={handleRankTags}
              disabled={isAnalyzingTags || !editTags}
              className="h-[60px] px-4 rounded-[16px] border-[3px] border-black bg-white text-black text-[12px] font-black uppercase tracking-[0.08em] disabled:opacity-50 disabled:cursor-not-allowed"
             >
              {isAnalyzingTags ? "Ranking..." : existingTagAnalysis.length > 0 ? "View Rankings" : "Rank Tags"}
             </button>
            </div>
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
        </div>
       </div>
      </SubToolbox>

      {/* End Tag Manager removed as it is now integrated into Video Details */}

      <SubToolboxGridActionButton
       onClick={handleSave}
       disabled={saving}
       tone="blue"
       surfaceColor={updateDetailsPalette.header}
       controlColor={updateDetailsPalette.icon}
       shadowColor={hexToRgba(updateDetailsPalette.header, 0.45)}
       iconName="settings"
       showIconSection
       label={saving ? "Transmitting to Server..." : "Update Video Details"}
      />
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
