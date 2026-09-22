import React, { useCallback, useState, useEffect, useRef } from "react"
import {
 addSimpleVideoToPlaylist,
 fetchSimplePlaylists,
 fetchSimpleSingleVideoAnalytics,
 fetchSimpleVideoBundle,
 fetchSimpleVideoInventory,
 fetchSimpleVideoPlaylistMemberships,
 patchSimpleOwnedVideo,
 removeSimpleVideoFromPlaylist,
 setSimpleVideoThumbnail,
 type SimplePlaylist as Playlist,
 type SimplePlaylistMembership as PlaylistMembership,
 type SimpleVideoDetails as VideoDetails,
 type SimpleVideoSnippet as VideoSnippet,
 type SimpleVideoStats as VideoStats,
 type SimpleSingleVideoAnalytics as SingleVideoAnalytics,
} from "../services/simpleYouTubeApi"
import { useSimpleAuth } from "../auth/AuthProvider"
import { useNavigate } from "react-router-dom"
import {
 generateTagSuggestions,
 analyzeExistingTags,
 hasGeminiKey,
} from "../services/gemini"
import type { TagSuggestion } from "../services/gemini"
import {
 X,
 Plus,
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
 Sparkles,
 BarChart3,
 Image as ImageIcon,
 AlertCircle,
 CheckCircle,
 AlignLeft,
 Edit,
 Settings,
} from "lucide-react"
import {
 SubToolboxGridActionButton,
 ToolboxScaffold,
 SubToolbox,
} from "../components/Toolbox"
import { SubToolboxActions, SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../components/subtoolbox/SubToolboxLayouts"
import {
 SubToolboxButton,
 SubToolboxFieldLabel,
 SubToolboxIconButton,
 SubToolboxInput,
 SubToolboxLinkButton,
 SubToolboxMetric,
 SubToolboxRemovableTag,
 SubToolboxSelectableTag,
 SubToolboxSurface,
 SubToolboxTag,
 SubToolboxTextArea,
 SubToolboxTopTitleDropdown,
} from "../components/subtoolbox/SubToolboxPrimitives"
import { SubToolboxSplitButton, SubToolboxSplitDropdown } from "../studio-ui"
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
 const getRankColor = (rank?: number) => {
  if (typeof rank !== "number") return "#36E0F6"
  if (rank >= 1 && rank <= 10) return "#36E0F6"
  if (rank >= 11 && rank <= 20) return "#3FEE56"
  if (rank >= 21 && rank <= 30) return "#FFDA47"
  if (rank >= 31 && rank <= 40) return "#FFA85C"
  return "#FA618A"
 }

 const rankColor = getRankColor(analysis?.rank)
 const title = analysis
  ? `SEO score ${analysis.score} · search volume ${analysis.searchVolume.toLocaleString()} · competition ${analysis.competition.toLocaleString()} · rank #${analysis.rank}${analysis.tripleKeyword ? " · triple keyword" : ""}`
  : undefined
 const label = <>{tag}{analysis ? <span aria-hidden="true"> · #{analysis.rank}</span> : null}</>
 const style = {
  ["--pair-a" as string]: rankColor,
  ["--pair-b" as string]: "#ffffff",
 } as React.CSSProperties

 if (onRemove) {
  return (
   <SubToolboxRemovableTag
    level="l2"
    onRemove={onRemove}
    removeIcon={<X size={12} strokeWidth={3.2} />}
    style={style}
    title={title}
   >
    {label}
   </SubToolboxRemovableTag>
  )
 }

 if (isSuggested) {
  return (
   <SubToolboxSelectableTag
    level="l2"
    selected={Boolean(isAdded)}
    selectedIcon={<CheckCircle size={12} strokeWidth={3} />}
    unselectedIcon={<Plus size={12} strokeWidth={3} />}
    disabled={isAdded}
    onClick={() => { if (!isAdded) onAdd?.() }}
    style={style}
    title={title}
   >
    {label}
   </SubToolboxSelectableTag>
  )
 }

 return <SubToolboxTag level="l2" style={style} title={title}>{label}</SubToolboxTag>
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
 const auth = useSimpleAuth()
 const connected = auth.session.status === "ready" && auth.session.capabilities.youtubeRead
 const canManageVideos = auth.session.status === "ready" && auth.session.capabilities.youtubeWrite
 const navigate = useNavigate()
 const basePalette = paletteIndex ?? 0
 const [allVideos, setAllVideos] = useState<VideoSnippet[]>([])
 const [videos, setVideos] = useState<VideoSnippet[]>([])
 const [videoSearchQuery, setVideoSearchQuery] = useState("")
 const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
 const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null)
 const [videoStats, setVideoStats] = useState<VideoStats | null>(null)
 const [videoAnalytics, setVideoAnalytics] = useState<SingleVideoAnalytics | null>(null)
 const [loading, setLoading] = useState(false)
 const [saving, setSaving] = useState(false)
 const [saveSuccess, setSaveSuccess] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const lastSearchRef = useRef("")
 const activeChannelIdRef = useRef(auth.session.channel?.id || "")

 const [editTitle, setEditTitle] = useState("")
 const [editDescription, setEditDescription] = useState("")
 const [editTags, setEditTags] = useState("")
 const [editPrivacy, setEditPrivacy] = useState("public")
 const [editCategoryId, setEditCategoryId] = useState("27")

 const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([])
 const [currentPlaylists, setCurrentPlaylists] = useState<PlaylistMembership[]>([])
 const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([])

 const [isGeneratingTags, setIsGeneratingTags] = useState(false)
 const [isAnalyzingTags, setIsAnalyzingTags] = useState(false)
 const [suggestedTags, setSuggestedTags] = useState<TagSuggestion[]>([])
 const [existingTagAnalysis, setExistingTagAnalysis] = useState<TagSuggestion[]>([])
 const [showRankDetails, setShowRankDetails] = useState(false)
 const [isTagsExpanded, setIsTagsExpanded] = useState(false)
 const [tagInput, setTagInput] = useState("")
 const fileInputRef = useRef<HTMLInputElement>(null)
 const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
 const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
 const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false)
 const [isOpen, setIsOpen] = useState(isOpenInitial)
 const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false)
 const [videoListLoadState, setVideoListLoadState] = useState<VideoListLoadState>("idle")
 const hasTriggeredInitialLoadRef = useRef(false)
 const chooseVideoPalette = getToolboxPaletteColors(basePalette + 1)
 const updateDetailsPalette = getToolboxPaletteColors(basePalette + 5)

 const showHeaderLoadAssetsButton = connected && videos.length === 0

 const formatVideoLoadError = (err: any) => {
  const raw = err?.message || "Failed to load channel assets."
  if (/session|auth|401|expired|invalid/i.test(raw)) {
   return "YouTube session expired. Reconnect your channel in Settings, then reload assets."
  }
  return raw
 }

 const selectedVideo: (VideoSnippet & Partial<VideoDetails>) | null = selectedVideoId
  ? ({
     ...(allVideos.find((v) => v.videoId === selectedVideoId) ?? {}),
     ...(videoDetails ?? {}),
    } as VideoSnippet & Partial<VideoDetails>)
  : null
 // The catalog can still be arriving while the tool is fully usable. Keep the
 // default layout mounted and say so on the selector instead of replacing the
 // whole tool body with an empty box.
 const catalogLoading = connected && videoListLoadState === "loading" && videos.length === 0 && !selectedVideo

 useEffect(() => {
  const channelId = auth.session.channel?.id || ""
  if (activeChannelIdRef.current === channelId) return
  activeChannelIdRef.current = channelId
  setSelectedVideoId(null)
  setVideoDetails(null)
  setVideoStats(null)
  setVideoAnalytics(null)
  setUserPlaylists([])
  setCurrentPlaylists([])
  setSelectedPlaylistIds([])
  setAllVideos([])
  setVideos([])
  setHasLoadedInitialData(false)
  hasTriggeredInitialLoadRef.current = false
 }, [auth.session.channel?.id])

 const loadInitialData = useCallback(async (_force = false) => {
  if (!connected) return
  setVideoListLoadState("loading")
  setLoading(true)
  setError(null)
  try {
   const [inventory, playlists] = await Promise.all([
    fetchSimpleVideoInventory(),
    fetchSimplePlaylists(),
   ])
   setAllVideos(inventory.videos)
   setVideos(inventory.videos)
   setUserPlaylists(playlists)
   setHasLoadedInitialData(true)
   setVideoListLoadState(inventory.videos.length > 0 ? "success" : "empty")
  } catch (err: any) {
   console.error(err)
   setError(formatVideoLoadError(err))
   setHasLoadedInitialData(true)
   setVideoListLoadState("error")
  } finally {
   setLoading(false)
  }
 }, [connected])

 useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
   const nextQuery = videoSearchQuery.trim().toLowerCase()
   if (nextQuery === lastSearchRef.current) return
   lastSearchRef.current = nextQuery
   const nextVideos = !nextQuery
    ? allVideos
    : allVideos.filter((video) =>
       video.title.toLowerCase().includes(nextQuery) || video.videoId.toLowerCase().includes(nextQuery),
      )
   setVideos(nextVideos.slice(0, 50))
  }, 180)
  return () => clearTimeout(delayDebounceFn)
 }, [allVideos, videoSearchQuery])

 useEffect(() => {
  if (!connected) {
   hasTriggeredInitialLoadRef.current = false
   return
  }
  if (hasLoadedInitialData || hasTriggeredInitialLoadRef.current) return
  if (collapsible && !isOpen) return
  hasTriggeredInitialLoadRef.current = true
  void loadInitialData()
 }, [collapsible, connected, hasLoadedInitialData, isOpen, loadInitialData])

 useEffect(() => {
  if (!connected || videos.length === 0 || selectedVideoId) return
  const firstVideoId = videos[0]?.videoId
  if (!firstVideoId) return
  void handleSelectVideo(firstVideoId, userPlaylists)
 }, [connected, videos, selectedVideoId, userPlaylists])

 const handleSelectVideo = async (videoId: string, playlistsToUse = userPlaylists) => {
  if (!connected) return
  setSelectedVideoId(videoId)
  setLoading(true)
  setError(null)
  setSaveSuccess(false)
  setThumbnailPreview(null)
  setThumbnailFile(null)
  try {
   const [videoBundle, analytics] = await Promise.all([
    fetchSimpleVideoBundle(videoId),
    fetchSimpleSingleVideoAnalytics(videoId),
   ])
   const details = videoBundle.details
   setVideoDetails(details)
   setVideoStats(videoBundle.stats)
   setVideoAnalytics(analytics)
   setEditTitle(details.title)
   setEditDescription(details.description)
   setEditTags(details.tags.join(", "))
   setEditPrivacy(details.privacyStatus)
   setEditCategoryId(details.categoryId)
   setSuggestedTags([])

   try {
    const memberships = await fetchSimpleVideoPlaylistMemberships(videoId, playlistsToUse.map((p) => p.id))
    setCurrentPlaylists(memberships)
    setSelectedPlaylistIds(memberships.map((m) => m.playlistId))
   } catch (playlistError) {
    console.warn("Video details loaded, but playlist membership sync failed.", playlistError)
    setCurrentPlaylists([])
    setSelectedPlaylistIds([])
   }
  } catch (err: any) {
   console.error(err)
   setError("Failed to load video details.")
  } finally {
   setLoading(false)
  }
 }

 const buildLocalTagAnalysis = (title: string, description: string, tags: string[]): TagSuggestion[] => {
  const titleWords = new Set(title.toLowerCase().split(/\W+/).filter(Boolean))
  const combinedText = `${title} ${description}`.toLowerCase()
  return tags
   .map((tag) => {
    const words = tag.toLowerCase().split(/\W+/).filter(Boolean)
    const titleHits = words.filter((word) => titleWords.has(word)).length
    const bodyHits = words.filter((word) => combinedText.includes(word)).length
    const tripleKeyword = titleHits > 0 && bodyHits === words.length
    const searchVolume = Math.max(200, Math.round(5800 - words.length * 280 + titleHits * 900 + bodyHits * 350))
    const competition = Math.max(80, Math.round(4100 + words.length * 500 - titleHits * 450))
    const score = Math.min(99, Math.max(35, Math.round((searchVolume / Math.max(searchVolume + competition, 1)) * 100 + titleHits * 8 + bodyHits * 3 + (tripleKeyword ? 7 : 0))))
    return { tag, score, searchVolume, competition, rank: 0, tripleKeyword }
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
   const tags = editTags.split(",").map((t) => t.trim()).filter(Boolean)
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
   setSuggestedTags([...suggestions].sort((a, b) => b.score - a.score).slice(0, 10))
  } catch (err) {
   console.error(err)
  } finally {
   setIsGeneratingTags(false)
  }
 }

 const handleAddTag = (tag: string, analysis?: TagSuggestion) => {
  const trimmed = tag.trim()
  if (!trimmed) return
  const current = editTags.split(",").map((t) => t.trim()).filter(Boolean)
  if (current.map((t) => t.toLowerCase()).includes(trimmed.toLowerCase())) {
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
  setEditTags(editTags.split(",").map((t) => t.trim()).filter((t) => t.toLowerCase() !== tag.toLowerCase()).join(", "))
  setExistingTagAnalysis((prev) => prev.filter((t) => t.tag.toLowerCase() !== tag.toLowerCase()))
 }

 const togglePlaylist = (playlistId: string) => {
  setSelectedPlaylistIds((prev) => prev.includes(playlistId) ? prev.filter((id) => id !== playlistId) : [...prev, playlistId])
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
  if (!connected || !canManageVideos) {
   auth.login("/video-manager")
   return
  }
  if (!selectedVideoId) return
  setSaving(true)
  setError(null)
  setSaveSuccess(false)
  try {
   await patchSimpleOwnedVideo(selectedVideoId, {
    snippet: {
     title: editTitle,
     description: editDescription,
     tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
     categoryId: editCategoryId,
    },
    status: { privacyStatus: editPrivacy },
   })
   if (thumbnailFile) {
    await setSimpleVideoThumbnail(selectedVideoId, thumbnailFile)
    setThumbnailFile(null)
   }
   const toAdd = selectedPlaylistIds.filter((id) => !currentPlaylists.some((m) => m.playlistId === id))
   const toRemove = currentPlaylists.filter((m) => !selectedPlaylistIds.includes(m.playlistId))
   await Promise.all([
    ...toAdd.map((id) => addSimpleVideoToPlaylist(id, selectedVideoId)),
    ...toRemove.map((m) => removeSimpleVideoFromPlaylist(m.playlistItemId)),
   ])
   setSaveSuccess(true)
   void handleSelectVideo(selectedVideoId, userPlaylists)
   setAllVideos((current) => current.map((video) => video.videoId === selectedVideoId ? { ...video, title: editTitle } : video))
   setVideos((current) => current.map((video) => video.videoId === selectedVideoId ? { ...video, title: editTitle } : video))
   void loadInitialData()
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
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0)
 }

 const formatDuration = (durationValue: string) => {
  const totalSeconds = /^\d+$/.test(String(durationValue)) ? parseInt(String(durationValue), 10) : parseIsoDurationToSeconds(String(durationValue))
  if (isNaN(totalSeconds)) return "0:00"
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  return `${m}:${s.toString().padStart(2, "0")}`
 }

 const selectedVideoMetrics = React.useMemo(() => {
  if (!selectedVideoId) {
   return { views: 0, likes: 0, comments: 0, shares: 0, watchHours: 0, impressions: 0, ctr: 0, stw: 0, endScreenClickRate: 0, cardClickRate: 0, isShort: false, revenue: parseNumeric(videoAnalytics?.estimatedRevenue || 0) }
  }
  try {
   const cacheRaw = localStorage.getItem("yt_analytics_cache")
   if (!cacheRaw) throw new Error("No cache")
   const cache = JSON.parse(cacheRaw) as any
   const stats = cache?.stats?.[selectedVideoId] || {}
   const analytics = cache?.analytics || {}
   const headers = (analytics?.columnHeaders || []).map((h: any) => String(h?.name || ""))
   const rows = Array.isArray(analytics?.rows) ? analytics.rows : []
   const row = rows.find((r: any) => {
    if (Array.isArray(r)) {
     const idx = headers.findIndex((h: string) => h.toLowerCase() === "video")
     return idx >= 0 ? String(r[idx] || "") === selectedVideoId : false
    }
    return String(r?.video || r?.Video || r?.["Video ID"] || r?.Dimension || "") === selectedVideoId
   })
   const getRowValue = (keyList: string[]): number => {
    if (!row) return 0
    if (Array.isArray(row)) {
     for (const key of keyList) {
      const idx = headers.findIndex((h: string) => h.toLowerCase() === key.toLowerCase())
      if (idx >= 0) {
       const n = Number(String(row[idx] ?? "").replace(/[^0-9.-]/g, ""))
       if (Number.isFinite(n) && n > 0) return n
      }
     }
     return 0
    }
    for (const key of keyList) {
     const n = Number(String(row?.[key] ?? "").replace(/[^0-9.-]/g, ""))
     if (Number.isFinite(n) && n > 0) return n
    }
    return 0
   }
   const watchHours = getRowValue(["Watch Time (Hours)", "Watch time (hours)", "Watch Hrs"]) || getRowValue(["estimatedMinutesWatched"]) / 60
   const ctr = getRowValue(["Click-Through Rate (CTR)", "CTR (%)", "Impressions click-through rate (%)", "impressionClickThroughRate"]) || parseNumeric(videoAnalytics?.clickThroughRate || "0")
   return {
    views: parseNumeric(videoStats?.views || 0) || getRowValue(["Views", "views"]),
    likes: parseNumeric(videoStats?.likes || 0) || getRowValue(["Likes", "likes"]),
    comments: parseNumeric(videoStats?.comments || 0) || getRowValue(["Comments", "comments"]),
    shares: getRowValue(["Shares", "shares"]) || parseNumeric(videoAnalytics?.shares || 0),
    watchHours,
    impressions: getRowValue(["Impressions", "impressions"]),
    ctr: Number.isFinite(ctr) ? ctr : 0,
    stw: getRowValue(["STW %", "Stayed to watch (%)"]),
    endScreenClickRate: getRowValue(["End screen click rate", "Clicks per end screen element shown (%)"]),
    cardClickRate: getRowValue(["Card click rate", "annotationClickThroughRate"]),
    isShort: stats?.isShort === true || (Number(stats?.durationSeconds || videoStats?.duration || 0) <= 180 && stats?.contentType === "shorts"),
    revenue: Number(videoAnalytics?.estimatedRevenue || 0) || getRowValue(["Revenue", "Estimated revenue", "estimatedRevenue"]),
   }
  } catch {
   return {
    views: parseNumeric(videoStats?.views || 0), likes: parseNumeric(videoStats?.likes || 0), comments: parseNumeric(videoStats?.comments || 0), shares: parseNumeric(videoAnalytics?.shares || 0), watchHours: 0, impressions: 0, ctr: parseNumeric(videoAnalytics?.clickThroughRate || "0"), stw: 0, endScreenClickRate: 0, cardClickRate: 0, isShort: Number(videoStats?.duration || 0) <= 180, revenue: Number(videoAnalytics?.estimatedRevenue || 0),
   }
  }
 }, [selectedVideoId, videoStats, videoAnalytics])

 const kpiCards = [
  { key: "views", label: "Views", value: formatViews(String(selectedVideoMetrics.views || 0)), accentColor: "#40C6E9" },
  { key: "watch", label: "Watch Hrs", value: selectedVideoMetrics.watchHours.toFixed(2), accentColor: "#B9FF58" },
  { key: "likes", label: "Likes", value: formatViews(String(selectedVideoMetrics.likes || 0)), accentColor: "#FF83EA" },
  { key: "comments", label: "Comments", value: formatViews(String(selectedVideoMetrics.comments || 0)), accentColor: "#FFFF61" },
  { key: "shares", label: "Shares", value: formatViews(String(selectedVideoMetrics.shares || 0)), accentColor: "#FFB570" },
  { key: "revenue", label: "Revenue", value: `$${selectedVideoMetrics.revenue.toFixed(2)}`, accentColor: "#4FFF5B" },
  { key: "length", label: "Length", value: formatDuration(videoStats?.duration || "0"), accentColor: "#FFE357" },
  { key: "end-screen", label: "End Screen %", value: `${selectedVideoMetrics.endScreenClickRate.toFixed(1)}%`, accentColor: "#9CEBFF" },
 ]

 const categoryOptions = [
  { value: "2", label: "Autos & Vehicles" }, { value: "23", label: "Comedy" }, { value: "27", label: "Education" }, { value: "24", label: "Entertainment" }, { value: "1", label: "Film & Animation" }, { value: "20", label: "Gaming" }, { value: "26", label: "Howto & Style" }, { value: "10", label: "Music" }, { value: "25", label: "News & Politics" }, { value: "29", label: "Nonprofits & Activism" }, { value: "22", label: "People & Blogs" }, { value: "15", label: "Pets & Animals" }, { value: "28", label: "Science & Technology" }, { value: "17", label: "Sports" }, { value: "19", label: "Travel & Events" },
 ]
 const selectedCategoryLabel = categoryOptions.find((option) => option.value === editCategoryId)?.label || "Select Category"
 const [subtitleStep, setSubtitleStep] = useState(0)
 const subtitleBase = "Generate titles, descriptions, tags, and everything else you need to publish your video with just a simple click of a button all you need to do is upload the video!"
 const subtitleAdditions = ["If you don't have a video just upload a script!", "And if you don't have that we can create it all from a concept!", "If you don't have a concept, we can still build the whole thing with you.", "If you have no idea what you wanna create we can help with that too."]
 const subtitleButtonLabels = ["don't have a video?", "don't have a script?", "don't have a concept?"]
 const subtitleHelpRail = (
  <div className="flex flex-wrap items-center gap-2">
   <span className="uppercase tracking-[0.12em]">{subtitleBase}</span>
   {subtitleStep > 0 && <span className="uppercase tracking-[0.12em]">{subtitleAdditions[0]}</span>}
   {subtitleStep > 1 && <span className="uppercase tracking-[0.12em]">{subtitleAdditions[1]}</span>}
   {subtitleStep > 2 && <span className="uppercase tracking-[0.12em]">{subtitleAdditions[2]}</span>}
   {subtitleStep > 3 && <span className="uppercase tracking-[0.12em]">{subtitleAdditions[3]}</span>}
   {subtitleStep < subtitleButtonLabels.length && (
    <SubToolboxButton
     level="l2"
     size="compact"
     tone="neutral"
     className="!w-auto"
     onClick={(event) => { event.stopPropagation(); setSubtitleStep((prev) => Math.min(prev + 1, subtitleButtonLabels.length + 1)) }}
    >
     {subtitleButtonLabels[subtitleStep]}
    </SubToolboxButton>
   )}
  </div>
 )

 const selectorOptions = videos.map((video) => ({
  value: video.videoId,
  label: <span className="block min-w-0 truncate font-black uppercase">{video.title}</span>,
  icon: <img src={video.thumbnail} alt="" className="h-full w-full object-cover" />,
 }))
 const connectionLabel = auth.loading
  ? "CONNECTING YOUR YOUTUBE CHANNEL…"
  : auth.session.status === "reconnect_required"
    ? "RECONNECT YOUR YOUTUBE CHANNEL TO LOAD VIDEOS"
    : "CONNECT YOUR YOUTUBE CHANNEL TO LOAD VIDEOS"

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
   headerActions={showHeaderLoadAssetsButton ? (
    <SubToolboxButton
     level="l2"
     size="compact"
     tone="ink"
     className="!w-auto"
     onClick={(event) => { event.stopPropagation(); lastSearchRef.current = ""; setVideoSearchQuery(""); void loadInitialData(true) }}
     disabled={loading}
    >
     {loading ? "REFRESHING..." : "LOAD SPACE ASSETS"}
    </SubToolboxButton>
   ) : null}
   shellClassName="animate-fade-in"
   contentClassName={embedded ? "p-0" : "p-8"}>
   <div className="flex flex-col h-full">
    {error && <div className="mb-6 bg-[#ffb158]/20 border-[4px] border-[#ffb158] p-4 rounded-2xl flex items-center gap-4 text-[#ffb158] font-black uppercase shadow-[4px_4px_0px_0px_#ffb158]"><AlertCircle size={24} /><p>{error}</p></div>}
    {saveSuccess && <div className="mb-6 bg-[#00ff99]/20 border-[4px] border-[#00ff99] p-4 rounded-2xl flex items-center gap-4 text-black font-black uppercase shadow-[4px_4px_0px_0px_#00ff99]"><CheckCircle size={24} className="text-[#00ff99]" /><p>Asset Deployed Successfully</p></div>}

    {showRankDetails && existingTagAnalysis.length > 0 && (
     <div className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white border-[6px] border-black rounded-2xl shadow-[12px_12px_0px_0px_black] overflow-hidden">
       <div className="bg-[#CCFF00] border-b-[4px] border-black px-5 py-4 flex items-center justify-between">
        <div><h3 className="text-2xl font-[1000] uppercase tracking-tight">Tag Rank Calculations</h3><p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/50 mt-1">Score balances search volume, competition, title match, and triple keyword signal.</p></div>
        <SubToolboxIconButton level="l1" icon={<X size={18} />} ariaLabel="Close tag rankings" onClick={() => setShowRankDetails(false)} />
       </div>
       <div className="p-4 overflow-x-auto">
        <table className="w-full border-collapse min-w-[760px]">
         <thead><tr className="bg-black text-white text-left"><th className="p-2 text-[10px] font-black uppercase tracking-wider">Tag</th><th className="p-2 text-[10px] font-black uppercase tracking-wider">Score</th><th className="p-2 text-[10px] font-black uppercase tracking-wider">Search Vol</th><th className="p-2 text-[10px] font-black uppercase tracking-wider">Competition</th><th className="p-2 text-[10px] font-black uppercase tracking-wider">Rank</th><th className="p-2 text-[10px] font-black uppercase tracking-wider">Triple Keyword</th></tr></thead>
         <tbody>{existingTagAnalysis.map((analysis) => <tr key={analysis.tag} className="border-b border-black/10"><td className="p-2 text-xs font-black uppercase">{analysis.tag}</td><td className="p-2 text-xs font-black">{analysis.score}</td><td className="p-2 text-xs font-black">{analysis.searchVolume.toLocaleString()}</td><td className="p-2 text-xs font-black">{analysis.competition.toLocaleString()}</td><td className="p-2 text-xs font-black"><span className="px-2 py-0.5 rounded-md border border-black" style={{ backgroundColor: analysis.rank <= 10 ? "#ccff00" : analysis.rank <= 20 ? "#ffdd00" : "#ffffff" }}>#{analysis.rank}</span></td><td className="p-2 text-xs font-black">{analysis.tripleKeyword ? "YES" : "NO"}</td></tr>)}</tbody>
        </table>
       </div>
      </div>
     </div>
    )}

    {connected && videoListLoadState === "idle" && !hasLoadedInitialData ? (
     <div className="h-[500px] flex flex-col items-center justify-center gap-5 font-black uppercase text-3xl tracking-tighter text-black/30"><Edit size={100} strokeWidth={1} className="mb-2 opacity-50" />Ready To Load Channel Catalog<SubToolboxButton level="l0" tone="success" className="!w-auto" onClick={() => void loadInitialData(true)} disabled={loading}>{loading ? "Loading..." : "Load Channel Catalog"}</SubToolboxButton></div>
    ) : connected && videoListLoadState === "error" && videos.length === 0 ? (
     <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 min-h-[500px]"><div className="w-24 h-24 bg-[#ffb158] rounded-full flex items-center justify-center border-[4px] border-black shadow-[4px_4px_0px_0px_black]"><AlertCircle size={48} className="text-black" /></div><div className="space-y-4 max-w-lg"><h2 className="text-5xl font-[1000] uppercase tracking-tighter leading-none">Sync Failed</h2><p className="text-black/60 font-bold uppercase text-xs tracking-widest leading-relaxed">{error || "We couldn't load your YouTube assets. Try reload, or reconnect your channel in Settings."}</p><SubToolboxButton level="l0" tone="warning" onClick={() => void loadInitialData(true)} disabled={loading}>{loading ? "Retrying..." : "Retry Catalog Load"}</SubToolboxButton></div></div>
    ) : connected && videoListLoadState === "empty" ? (
     <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 min-h-[500px]"><div className="w-24 h-24 bg-[#FF3399] rounded-full flex items-center justify-center border-[4px] border-black shadow-[4px_4px_0px_0px_black] -rotate-12"><FileVideo size={48} className="text-[#CCFF00]" /></div><div className="space-y-4 max-w-lg"><h2 className="text-5xl font-[1000] uppercase tracking-tighter leading-none">Zero Assets Detected</h2><p className="text-black/50 font-bold uppercase text-xs tracking-widest leading-relaxed">Your YouTube channel is connected, but we couldn't detect any videos. Upload your first video to YouTube to unlock the full power of Creator OS Pro.</p><SubToolboxLinkButton level="l0" tone="success" href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer">Open YouTube Studio</SubToolboxLinkButton><SubToolboxButton level="l1" tone="neutral" onClick={() => void loadInitialData(true)} disabled={loading}>{loading ? "Reloading..." : "Reload Assets"}</SubToolboxButton></div></div>
    ) : (selectedVideo || !connected || catalogLoading) ? (
     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative z-20 space-y-2">
       <label className="text-[12px] font-black uppercase tracking-widest text-black/50 ml-1">Choose Video</label>
       {catalogLoading ? (
        <SubToolboxSplitButton
         icon={<FileVideo size={20} strokeWidth={3} />}
         railColor={chooseVideoPalette.icon}
         labelColor={chooseVideoPalette.header}
         disabled
        >
         LOADING YOUR YOUTUBE VIDEO CATALOG…
        </SubToolboxSplitButton>
       ) : connected ? (
        <SubToolboxSplitDropdown
         value={selectedVideoId || ""}
         options={selectorOptions}
         onChange={(videoId) => void handleSelectVideo(videoId)}
         icon={<FileVideo size={20} strokeWidth={3} />}
         ariaLabel="Choose video"
         railColor={chooseVideoPalette.icon}
         labelColor={chooseVideoPalette.header}
        />
       ) : (
        <SubToolboxSplitButton
         icon={<FileVideo size={20} strokeWidth={3} />}
         railColor={chooseVideoPalette.icon}
         labelColor={chooseVideoPalette.header}
         onClick={() => auth.login("/video-manager")}
         disabled={auth.loading}
        >
         {connectionLabel}
        </SubToolboxSplitButton>
       )}
       {connected && (
        <SubToolboxInput
         aria-label="Search videos"
         value={videoSearchQuery}
         onChange={(event) => setVideoSearchQuery(event.target.value)}
         placeholder={catalogLoading ? "LOADING VIDEOS..." : "SEARCH VIDEOS..."}
         disabled={catalogLoading}
        />
       )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
       <SubToolbox title="Video Details" icon={<Settings size={20} strokeWidth={3} />} collapsible isOpenInitial={true} shellClassName="h-full" contentClassName="h-full">
        <SubToolboxStack>
         <SubToolboxSection label={<SubToolboxFieldLabel htmlFor="video-manager-title">Title</SubToolboxFieldLabel>}><SubToolboxInput id="video-manager-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder={!connected ? "CONNECT CHANNEL TO LOAD TITLE" : catalogLoading ? "LOADING VIDEO TITLE..." : "TITLE..."} disabled={!connected || !selectedVideo} /></SubToolboxSection>
         <SubToolboxSection label="Video Stats"><SubToolboxGrid minItemWidth="compact">{kpiCards.map((card) => <SubToolboxMetric key={card.key} label={card.label} value={card.value} accentColor={card.accentColor} />)}</SubToolboxGrid></SubToolboxSection>
         <SubToolboxSection label="Publishing Controls">
          <SubToolboxGrid minItemWidth="compact">
           <SubToolboxTopTitleDropdown
            level="l1"
            label="PRIVACY"
            value={editPrivacy}
            options={[{ value: "public", label: "public" }, { value: "unlisted", label: "unlisted" }, { value: "private", label: "private" }]}
            onValueChange={setEditPrivacy}
            ariaLabel="Video privacy"
           />
           <SubToolboxTopTitleDropdown
            level="l1"
            label="CATEGORY"
            value={selectedCategoryLabel}
            options={categoryOptions.map((option) => ({ value: option.value, label: option.label }))}
            onValueChange={setEditCategoryId}
            ariaLabel="Video category"
           />
           <SubToolboxTopTitleDropdown
            level="l1"
            label="PLAYLISTS"
            value={!connected ? "CONNECT CHANNEL" : catalogLoading ? "LOADING..." : selectedPlaylistIds.length === 0 ? "NONE SELECTED" : `${selectedPlaylistIds.length} LINKED`}
            options={userPlaylists.map((playlist) => ({ value: playlist.id, label: playlist.title }))}
            onValueChange={togglePlaylist}
            multiSelect
            selectedValues={selectedPlaylistIds}
            ariaLabel="Video playlists"
           />
          </SubToolboxGrid>
         </SubToolboxSection>
        </SubToolboxStack>
       </SubToolbox>

       <SubToolbox title="Thumbnail" icon={<ImageIcon size={20} strokeWidth={3} />} collapsible isOpenInitial={true} shellClassName="h-full" contentClassName="h-full">
        <SubToolboxStack className="h-full">
         <div className="flex items-center justify-between gap-3 px-1"><span className="text-[10px] font-black uppercase tracking-[0.12em] text-black/50 ml-auto">{!connected ? "Connect Channel to Load Thumbnail" : catalogLoading ? "Loading Thumbnail" : "Drag + Drop to Replace"}</span></div>
         <SubToolboxSurface className={`relative flex min-h-[220px] flex-1 flex-col items-center justify-center overflow-hidden !p-3 transition-colors ${isDraggingThumbnail ? "!bg-[#FF83EA]/10" : "!bg-gray-50"}`} onDragOver={(e) => { if (!connected || !selectedVideo) return; e.preventDefault(); setIsDraggingThumbnail(true) }} onDragLeave={() => setIsDraggingThumbnail(false)} onDrop={(e) => { if (!connected || !selectedVideo) return; e.preventDefault(); setIsDraggingThumbnail(false); if (e.dataTransfer.files[0]) handleThumbnailChange(e.dataTransfer.files[0]) }}>
          {thumbnailPreview || selectedVideo?.thumbnail ? (
           <div className="relative w-full aspect-video group"><img src={thumbnailPreview || selectedVideo?.thumbnail} alt="Preview" className="w-full h-full object-cover rounded-lg" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-lg backdrop-blur-sm"><SubToolboxButton aria-label="Replace thumbnail" onClick={() => fileInputRef.current?.click()} size="compact" tone="warning" icon={<Upload size={20} strokeWidth={3} />} className="!w-12" />{thumbnailPreview && <SubToolboxButton aria-label="Remove replacement thumbnail" onClick={() => { setThumbnailFile(null); setThumbnailPreview(null) }} size="compact" tone="danger" icon={<Trash2 size={20} strokeWidth={3} />} className="!w-12" />}</div></div>
          ) : (
           <div className="text-center"><Upload size={48} className="mx-auto mb-4 text-black/20" /><p className="font-black uppercase text-sm text-black/40">{!connected ? "Thumbnail Preview" : catalogLoading ? "Loading Thumbnail..." : "Select a Video to Load Thumbnail"}</p></div>
          )}
         </SubToolboxSurface>
        </SubToolboxStack>
       </SubToolbox>
      </div>

      <SubToolbox title="Description" icon={<AlignLeft size={18} strokeWidth={3} />} collapsible isOpenInitial={true}>
       <SubToolboxTextArea aria-label="Video description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="!min-h-80 text-base vm-scrollless" placeholder={!connected ? "CONNECT CHANNEL TO LOAD DESCRIPTION" : catalogLoading ? "LOADING DESCRIPTION..." : "DESCRIPTION..."} disabled={!connected || !selectedVideo} />
      </SubToolbox>

      <SubToolbox title="Video Tags" icon={<Tag size={20} strokeWidth={3} />} collapsible isOpen={isTagsExpanded} onToggle={() => setIsTagsExpanded((prev) => !prev)}>
       <SubToolboxStack density="comfortable">
        <SubToolboxActions columns={2}><SubToolboxInput aria-label="Add video tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTag(tagInput)} placeholder={!connected ? "CONNECT CHANNEL TO LOAD TAGS" : catalogLoading ? "LOADING TAGS..." : "ADD TAG..."} maxLength={MAX_TAG_CHARS} disabled={!connected || !selectedVideo} /><SubToolboxButton onClick={() => handleAddTag(tagInput)} disabled={!connected || !selectedVideo || [...editTags.split(",").map((t) => t.trim()).filter(Boolean), tagInput.trim()].filter(Boolean).join(", ").length > MAX_TAG_CHARS}>{tagInput.split(",").map((t) => t.trim()).filter(Boolean).length <= 1 ? "Add Tag" : "Add Tags"}</SubToolboxButton></SubToolboxActions>
        <SubToolboxSurface className="relative flex min-h-[132px] w-full flex-wrap content-start gap-2 !pb-9">
         {editTags ? editTags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => <TagBadge key={t} tag={t} onRemove={() => handleRemoveTag(t)} analysis={existingTagAnalysis.find((a) => a.tag.toLowerCase() === t.toLowerCase())} />) : <p className="text-black/30 font-black uppercase text-sm w-full text-center py-6">{!connected ? "Connect channel to load tags" : catalogLoading ? "Loading tags..." : "No tags populated..."}</p>}
         <span className="absolute right-3 bottom-2 text-[11px] font-black uppercase tracking-[0.08em] text-black/55">{editTags.length}/{MAX_TAG_CHARS}</span>
        </SubToolboxSurface>
        <SubToolboxStack><SubToolboxActions columns={2}><SubToolboxButton size="action" onClick={handleGenerateTags} disabled={!connected || !selectedVideo || isGeneratingTags || editTags.length >= MAX_TAG_CHARS}>{isGeneratingTags ? "Scanning Market..." : "Generate High Ranking Video Tags"}</SubToolboxButton><SubToolboxButton type="button" size="action" tone="neutral" onClick={handleRankTags} disabled={!connected || !selectedVideo || isAnalyzingTags || !editTags}>{isAnalyzingTags ? "Ranking..." : existingTagAnalysis.length > 0 ? "View Rankings" : "Rank Tags"}</SubToolboxButton></SubToolboxActions>{suggestedTags.length > 0 && <SubToolboxSection label="Ranked Suggestions"><SubToolboxSurface className="flex flex-wrap gap-2">{suggestedTags.map((st) => <TagBadge key={st.tag} tag={st.tag} isSuggested isAdded={editTags.toLowerCase().includes(st.tag.toLowerCase())} onAdd={() => handleAddTag(st.tag, st)} analysis={st} />)}</SubToolboxSurface></SubToolboxSection>}</SubToolboxStack>
       </SubToolboxStack>
      </SubToolbox>

      <SubToolboxGridActionButton
       onClick={connected ? handleSave : () => auth.login("/video-manager")}
       disabled={connected ? saving || !selectedVideoId : auth.loading}
       tone="blue"
       surfaceColor={updateDetailsPalette.header}
       controlColor={updateDetailsPalette.icon}
       shadowColor={hexToRgba(updateDetailsPalette.header, 0.45)}
       iconName="settings"
       showIconSection
       label={!connected ? connectionLabel : catalogLoading ? "Loading Video Catalog..." : saving ? "Transmitting to Server..." : "Update Video Details"}
      />
     </div>
    ) : (
     <div className="h-[500px] flex flex-col items-center justify-center gap-5 font-black uppercase text-3xl tracking-tighter text-black/20"><Edit size={100} strokeWidth={1} className="mb-2 opacity-50" />Awaiting Asset Selection</div>
    )}

    <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleThumbnailChange(e.target.files[0])} className="hidden" accept="image/*" />
   </div>
  </ToolboxScaffold>
 )
}

export default VideoManager
