import React, { useCallback, useState, useEffect, useRef } from "react"
import {
 addSimpleVideoToPlaylist,
 fetchSimplePlaylists,
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
 Upload,
 Sparkles,
 Image as ImageIcon,
 AlertCircle,
 CheckCircle,
 Edit,
 Settings,
 Search,
} from "lucide-react"
import {
 MiniSubToolbox,
 SubToolboxGridActionButton,
 ToolboxScaffold,
 SubToolbox,
} from "../components/Toolbox"
import { SubToolboxActions, SubToolboxGrid, SubToolboxSection, SubToolboxStack } from "../components/subtoolbox/SubToolboxLayouts"
import {
 SubToolboxAlert,
 SubToolboxButton,
 SubToolboxDataTable,
 SubToolboxIconButton,
 SubToolboxLabeledInput,
 SubToolboxLabeledTextArea,
 SubToolboxLinkButton,
 SubToolboxOutputCard,
 SubToolboxRemovableTag,
 SubToolboxSelectableTag,
 SubToolboxStatePanel,
 SubToolboxSurface,
 SubToolboxTag,
 SubToolboxTagEditor,
 SubToolboxTopTitleDropdown,
 SubToolboxVideoSelector,
} from "../components/subtoolbox/SubToolboxPrimitives"

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
   const videoBundle = await fetchSimpleVideoBundle(videoId)
   const details = videoBundle.details
   setVideoDetails(details)
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

 const handleManagedTagsChange = (nextTags: string[]) => {
  const next = nextTags.map((tag) => tag.trim()).filter(Boolean).join(", ")
  if (next.length > MAX_TAG_CHARS) {
   alert("Character limit exceeded. Tags must be 500 characters or less including spaces.")
   return
  }
  setEditTags(next)
  setExistingTagAnalysis((prev) => prev.filter((analysis) => nextTags.some((tag) => tag.toLowerCase() === analysis.tag.toLowerCase())))
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

 const formatPublishedDate = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" }).toUpperCase()
 }

 const formatDuration = (value?: string) => {
  if (!value) return ""
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return value
  const hours = Number(match[1] || 0)
  const minutes = Number(match[2] || 0)
  const seconds = Number(match[3] || 0)
  return hours > 0
   ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
   : `${minutes}:${String(seconds).padStart(2, "0")}`
 }

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
  title: video.title,
  thumbnail: video.thumbnail,
  dateLabel: formatPublishedDate(video.publishedAt),
  durationLabel: video.duration ? formatDuration(video.duration) : "",
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
    {error && <SubToolboxAlert level="l1" tone="danger" className="mb-6" icon={<AlertCircle size={20} />} title="Video Manager Issue" detail={error} />}
    {saveSuccess && <SubToolboxAlert level="l1" tone="success" className="mb-6" icon={<CheckCircle size={20} />} title="Asset Deployed Successfully" />}

    {showRankDetails && existingTagAnalysis.length > 0 && (
     <div className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-center justify-center p-6" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setShowRankDetails(false) }}>
      <SubToolboxOutputCard
       level="l0"
       role="dialog"
       aria-modal="true"
       aria-label="Tag Rank Calculations"
       className="w-full max-w-4xl !overflow-hidden"
       title={<span className="flex min-w-0 flex-col"><strong>Tag Rank Calculations</strong><small>Score balances search volume, competition, title match, and triple keyword signal.</small></span>}
       action={<SubToolboxIconButton level="l1" icon={<X size={18} />} ariaLabel="Close tag rankings" onClick={() => setShowRankDetails(false)} />}
      >
       <SubToolboxDataTable
        level="l1"
        className="max-h-[70vh]"
        columns={[
         { key: "tag", label: "Tag" },
         { key: "score", label: "Score", align: "right" },
         { key: "searchVolume", label: "Search Vol", align: "right" },
         { key: "competition", label: "Competition", align: "right" },
         { key: "rank", label: "Rank", align: "center" },
         { key: "tripleKeyword", label: "Triple Keyword", align: "center" },
        ]}
        rows={existingTagAnalysis.map((analysis) => ({
         tag: <strong className="uppercase">{analysis.tag}</strong>,
         score: analysis.score,
         searchVolume: analysis.searchVolume.toLocaleString(),
         competition: analysis.competition.toLocaleString(),
         rank: <SubToolboxTag level="l2">#{analysis.rank}</SubToolboxTag>,
         tripleKeyword: analysis.tripleKeyword ? "YES" : "NO",
        }))}
        getRowKey={(_row, index) => existingTagAnalysis[index]?.tag ?? index}
       />
      </SubToolboxOutputCard>
     </div>
    )}

    {connected && videoListLoadState === "idle" && !hasLoadedInitialData ? (
     <div className="min-h-[200px] sm:min-h-[320px] lg:min-h-[500px] flex items-center justify-center">
      <SubToolboxStatePanel
       level="l0"
       state="ready"
       className="w-full max-w-2xl"
       message="Ready to load your YouTube channel catalog."
       action={<SubToolboxGridActionButton label={loading ? "Loading..." : "Load Channel Catalog"} iconName="video" tone="green" onClick={() => void loadInitialData(true)} disabled={loading} />}
      />
     </div>
    ) : connected && videoListLoadState === "error" && videos.length === 0 ? (
     <div className="min-h-[200px] sm:min-h-[320px] lg:min-h-[500px] flex items-center justify-center">
      <SubToolboxStatePanel
       level="l0"
       state="error"
       className="w-full max-w-2xl"
       message={error || "We couldn't load your YouTube assets. Try reload, or reconnect your channel in Settings."}
       action={<SubToolboxGridActionButton label={loading ? "Retrying..." : "Retry Catalog Load"} iconName="video" tone="orange" onClick={() => void loadInitialData(true)} disabled={loading} />}
      />
     </div>
    ) : connected && videoListLoadState === "empty" ? (
     <div className="min-h-[200px] sm:min-h-[320px] lg:min-h-[500px] flex items-center justify-center">
      <SubToolboxStatePanel
       level="l0"
       state="empty"
       className="w-full max-w-2xl"
       message="Your YouTube channel is connected, but no videos were detected yet."
       action={<SubToolboxActions columns={2}><SubToolboxLinkButton level="l0" tone="success" href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer">Open YouTube Studio</SubToolboxLinkButton><SubToolboxGridActionButton label={loading ? "Reloading..." : "Reload Assets"} iconName="video" tone="blue" onClick={() => void loadInitialData(true)} disabled={loading} /></SubToolboxActions>}
      />
     </div>
    ) : (selectedVideo || !connected || catalogLoading) ? (
     <div className="vm-manager-stack animate-in fade-in slide-in-from-bottom-4 duration-500">
      {catalogLoading ? (
       <SubToolboxGridActionButton
        label="Loading Your YouTube Video Catalog…"
        iconName="video"
        tone="blue"
        disabled
       />
      ) : connected ? (
       <SubToolboxVideoSelector
        level="l0"
        value={selectedVideoId || ""}
        options={selectorOptions}
        onValueChange={(videoId) => void handleSelectVideo(videoId)}
        searchValue={videoSearchQuery}
        onSearchValueChange={setVideoSearchQuery}
        searchIcon={<Search size={20} strokeWidth={3} />}
        searchPlaceholder="SEARCH VIDEOS..."
        ariaLabel="Choose video"
       />
      ) : (
       <SubToolboxGridActionButton
        label={connectionLabel}
        iconName="video"
        tone="green"
        onClick={() => auth.login("/video-manager")}
        disabled={auth.loading}
       />
      )}

      <SubToolbox
       title="Video Details"
       icon={<Settings size={20} strokeWidth={3} />}
       collapsible
       isOpenInitial
      >
       <SubToolboxStack density="dense">
        <SubToolboxLabeledInput
         id="video-manager-title"
         level="l1"
         overlayLabel="TITLE"
         aria-label="Video title"
         value={editTitle}
         onChange={(event) => setEditTitle(event.target.value)}
         placeholder=" "
         disabled={!connected || !selectedVideo}
        />

        <MiniSubToolbox
         title="Thumbnail"
         icon={<ImageIcon size={18} strokeWidth={3} />}
         className="vm-thumbnail-mini"
         actions={(
          <>
           <SubToolboxButton
            level="l2"
            onClick={() => fileInputRef.current?.click()}
            disabled={!connected || !selectedVideo}
           >
            Upload
           </SubToolboxButton>
           <SubToolboxButton
            level="l2"
            onClick={() => navigate("/thumbnail-studio", { state: { source: "video-manager", videoId: selectedVideoId, title: editTitle, thumbnail: thumbnailPreview || selectedVideo?.thumbnail || null } })}
            disabled={!selectedVideoId}
           >
            Generate
           </SubToolboxButton>
          </>
         )}
        >
         <div
          className={`vm-thumbnail-canvas ${isDraggingThumbnail ? "is-dragging" : ""}`}
          onDragOver={(event) => { if (!connected || !selectedVideo) return; event.preventDefault(); setIsDraggingThumbnail(true) }}
          onDragLeave={() => setIsDraggingThumbnail(false)}
          onDrop={(event) => {
           if (!connected || !selectedVideo) return
           event.preventDefault()
           setIsDraggingThumbnail(false)
           if (event.dataTransfer.files[0]) handleThumbnailChange(event.dataTransfer.files[0])
          }}
         >
          {thumbnailPreview || selectedVideo?.thumbnail ? (
           <img src={thumbnailPreview || selectedVideo?.thumbnail} alt={`${editTitle || "Video"} thumbnail`} />
          ) : (
           <div className="vm-thumbnail-empty">
            <Upload size={32} />
            <strong>{catalogLoading ? "LOADING THUMBNAIL" : "SELECT A VIDEO TO LOAD THUMBNAIL"}</strong>
           </div>
          )}
         </div>
        </MiniSubToolbox>

        <SubToolboxLabeledTextArea
         level="l1"
         overlayLabel="DESCRIPTION"
         aria-label="Video description"
         value={editDescription}
         onChange={(event) => setEditDescription(event.target.value)}
         height="fill"
         className="vm-description-field"
         placeholder=" "
         disabled={!connected || !selectedVideo}
        />

        <SubToolboxSection label="Publishing Controls">
         <SubToolboxGrid minItemWidth="compact" className="vm-publishing-grid">
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

      <SubToolbox title="Video Tags" icon={<Tag size={20} strokeWidth={3} />} collapsible isOpen={isTagsExpanded} onToggle={() => setIsTagsExpanded((prev) => !prev)}>
       <SubToolboxStack density="dense">
        <SubToolboxTagEditor
         level="l1"
         tags={editTags.split(",").map((tag) => tag.trim()).filter(Boolean)}
         onTagsChange={handleManagedTagsChange}
         addIcon={<Plus size={18} strokeWidth={3} />}
         saveIcon={<CheckCircle size={18} strokeWidth={3} />}
         removeIcon={<X size={13} strokeWidth={3.2} />}
         label="VIDEO TAGS"
        />
        <span className="vm-tag-character-count">{editTags.length}/{MAX_TAG_CHARS}</span>

        <SubToolboxActions columns={2} className="vm-tag-actions">
         <SubToolboxButton size="action" onClick={handleGenerateTags} disabled={!connected || !selectedVideo || isGeneratingTags || editTags.length >= MAX_TAG_CHARS}>
          {isGeneratingTags ? "Scanning Market..." : "Generate High Ranking Video Tags"}
         </SubToolboxButton>
         <SubToolboxButton type="button" size="action" tone="neutral" onClick={handleRankTags} disabled={!connected || !selectedVideo || isAnalyzingTags || !editTags}>
          {isAnalyzingTags ? "Ranking..." : existingTagAnalysis.length > 0 ? "View Rankings" : "Rank Tags"}
         </SubToolboxButton>
        </SubToolboxActions>

        {suggestedTags.length > 0 ? (
         <SubToolboxSection label="Ranked Suggestions">
          <SubToolboxSurface className="flex flex-wrap gap-2">
           {suggestedTags.map((suggestion) => (
            <TagBadge
             key={suggestion.tag}
             tag={suggestion.tag}
             isSuggested
             isAdded={editTags.toLowerCase().includes(suggestion.tag.toLowerCase())}
             onAdd={() => handleAddTag(suggestion.tag, suggestion)}
             analysis={suggestion}
            />
           ))}
          </SubToolboxSurface>
         </SubToolboxSection>
        ) : null}
       </SubToolboxStack>
      </SubToolbox>

      <SubToolboxGridActionButton
       onClick={connected ? handleSave : () => auth.login("/video-manager")}
       disabled={connected ? saving || !selectedVideoId : auth.loading}
       tone="blue"
       iconName="settings"
       showIconSection
       className="vm-update-video-action"
       label={!connected ? connectionLabel : catalogLoading ? "Loading Video Catalog..." : saving ? "Transmitting to Server..." : "Update Video Details"}
      />
     </div>
    ) : (
     <div className="min-h-[180px] sm:min-h-[320px] lg:h-[500px] flex flex-col items-center justify-center gap-3 sm:gap-5 font-black uppercase text-xl sm:text-2xl lg:text-3xl tracking-tighter text-black/20"><Edit size={100} strokeWidth={1} className="mb-2 opacity-50" />Awaiting Asset Selection</div>
    )}

    <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleThumbnailChange(e.target.files[0])} className="hidden" accept="image/*" />
   </div>
  </ToolboxScaffold>
 )
}

export default VideoManager
