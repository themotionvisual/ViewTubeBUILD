import React, { useEffect, useMemo, useRef, useState } from "react"
import {
 FileVideo2,
 ImagePlus,
 BookOpen,
 Loader2,
 Pencil,
 Plus,
 RotateCcw,
 Save,
 ShieldCheck,
 UploadCloud,
 Calendar,
 X,
 Sparkles,
} from "lucide-react"
import {
 fetchUserPlaylists,
 fetchVideoCategories,
 fetchVideoSnippetDetails,
 fetchChannelPublishingDefaults,
 updateVideoThumbnail,
 updateVideo,
 uploadVideo,
} from "../../../services/youtubeService"
import { generateEducationalTimestampQuestions } from "../../../services/gemini"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import {
 WidgetChoice as Choice,
 WidgetDisclosure as Module,
 WidgetField as Field,
 WidgetSelect as PortalSelect,
 WidgetFooter,
 WidgetHeaderToggle,
 WidgetMediaUploadAction,
 WidgetMediaUploadFrame,
 WidgetSplitButton,
 WidgetTag,
 WidgetWorkflowMain,
 type WidgetSelectOption as SelectOption,
} from "../WidgetPrimitives"
import { WidgetShell } from "../WidgetShell"
import { buildVideoAssetOptions } from "./videoAssetOptions"
import { useUnifiedAccount } from "../../../context/UnifiedAccountContext"
import { readYouTubeAnalyticsCache } from "../../../services/analytics/DataStore"

const STORAGE_KEY = "vt_data_edit_state"
const PROJECTS_STORAGE_KEY = "vt_video_uploader_projects_v2"
const TAG_CHARACTER_LIMIT = 500
const YT_STANDARD_CATEGORY_IDS = new Set([
 "1", "2", "10", "15", "17", "19", "20", "22", "23", "24", "25", "26", "27", "28", "29",
])

const FALLBACK_CATEGORIES = [
 ["2", "Autos & Vehicles"], ["23", "Comedy"], ["27", "Education"], ["24", "Entertainment"],
 ["1", "Film & Animation"], ["20", "Gaming"], ["26", "Howto & Style"], ["10", "Music"],
 ["25", "News & Politics"], ["29", "Nonprofits & Activism"], ["22", "People & Blogs"],
 ["15", "Pets & Animals"], ["28", "Science & Technology"], ["17", "Sports"], ["19", "Travel & Events"],
] as const

const AD_CATEGORIES = [
 "Inappropriate language",
 "Adult content",
 "Violence",
 "Shocking content",
 "Harmful acts and unreliable claims",
 "Recreational drugs content",
 "Enabling dishonest behaviour",
 "Hateful and derogatory content",
 "Firearms-related content",
 "Sensitive events",
 "Controversial issues",
] as const

export interface VideoProjectDraft {
 id: string
 name: string
 createdAt: number
 title: string
 description: string
 tags: string[]
 categoryId: string
 privacyStatus: string
 scheduledDate: string
 scheduledTime: string
 playlistId: string
 thumbnailPreview: string | null
 madeForKids: string
 paidPromotion: boolean
 alteredContent: string
 autoChapters: boolean
 language: string
 captionCert: string
 recordingDate: string
 location: string
 license: string
 allowEmbedding: boolean
 notifySubscribers: boolean
 adSuitability: Record<string, string>
 noneOfTheAbove: boolean
}

const createDefaultDraft = (name = "Project 1"): VideoProjectDraft => ({
 id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
 name,
 createdAt: Date.now(),
 title: "",
 description: "",
 tags: [],
 categoryId: "22",
 privacyStatus: "public",
 scheduledDate: "",
 scheduledTime: "12:00",
 playlistId: "",
 thumbnailPreview: null,
 madeForKids: "no",
 paidPromotion: false,
 alteredContent: "no",
 autoChapters: true,
 language: "en",
 captionCert: "none",
 recordingDate: "",
 location: "",
 license: "youtube",
 allowEmbedding: true,
 notifySubscribers: true,
 adSuitability: {},
 noneOfTheAbove: false,
})

const loadSavedProjects = (): VideoProjectDraft[] => {
 try {
  const saved = localStorage.getItem(PROJECTS_STORAGE_KEY)
  if (saved) {
   const parsed = JSON.parse(saved)
   if (Array.isArray(parsed) && parsed.length > 0) return parsed
  }
 } catch {}
 return [createDefaultDraft()]
}

const limitTagsToCharacterBudget = (values: string[]) => values.reduce<string[]>((accepted, value) => {
 const tag = value.trim()
 if (!tag || accepted.includes(tag)) return accepted
 return [...accepted, tag].join(", ").length <= TAG_CHARACTER_LIMIT ? [...accepted, tag] : accepted
}, [])

export const CustomDropdown = ({ value, onChange, options }: {
 value: string
 onChange: (value: string) => void
 options: { key?: string; val: string; lbl: string }[]
}) => (
 <PortalSelect
  value={value}
  onChange={onChange}
  label="Select option"
  options={options.map((option) => ({ value: option.val, label: option.lbl }))}
 />
)

type WorkflowMode = "upload" | "manage"
type WorkspacePage = "details" | "options_compliance"
type WidgetProps = CommonWidgetProps & { data: DashboardData }

const VideoMetadataWorkspace = ({ mode, data, ...common }: WidgetProps & { mode: WorkflowMode }) => {
 const account = useUnifiedAccount()
 const videos = data.videoAssets
 const [page, setPage] = useState<WorkspacePage>("details")

 // Multi-project workspace state (Upload mode)
 const [projects, setProjects] = useState<VideoProjectDraft[]>(() => loadSavedProjects())
 const [activeProjectId, setActiveProjectId] = useState<string>(() => projects[0]?.id || "")

 const activeProject = useMemo(
  () => projects.find((p) => p.id === activeProjectId) || projects[0] || createDefaultDraft(),
  [projects, activeProjectId],
 )

 // Project-scoped metadata state
 const [selectedVideoId, setSelectedVideoId] = useState("")
 const [videoSearch, setVideoSearch] = useState("")
 const [videoFile, setVideoFile] = useState<File | null>(null)
 const [title, setTitle] = useState(activeProject.title)
 const [description, setDescription] = useState(activeProject.description)
 const [tags, setTags] = useState<string[]>(activeProject.tags)
 const [newTag, setNewTag] = useState("")
 const [categoryId, setCategoryId] = useState(activeProject.categoryId)
 const [privacyStatus, setPrivacyStatus] = useState(activeProject.privacyStatus)
 const [scheduledDate, setScheduledDate] = useState(activeProject.scheduledDate)
 const [scheduledTime, setScheduledTime] = useState(activeProject.scheduledTime)
 const [playlistId, setPlaylistId] = useState(activeProject.playlistId)
 const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(activeProject.thumbnailPreview)
 const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
 const [madeForKids, setMadeForKids] = useState(activeProject.madeForKids)
 const [paidPromotion, setPaidPromotion] = useState(activeProject.paidPromotion)
 const [alteredContent, setAlteredContent] = useState(activeProject.alteredContent)
 const [autoChapters, setAutoChapters] = useState(activeProject.autoChapters)
 const [language, setLanguage] = useState(activeProject.language)
 const [captionCert, setCaptionCert] = useState(activeProject.captionCert)
 const [recordingDate, setRecordingDate] = useState(activeProject.recordingDate)
 const [location, setLocation] = useState(activeProject.location)
 const [license, setLicense] = useState(activeProject.license)
 const [allowEmbedding, setAllowEmbedding] = useState(activeProject.allowEmbedding)
 const [notifySubscribers, setNotifySubscribers] = useState(activeProject.notifySubscribers)
 const [adSuitability, setAdSuitability] = useState<Record<string, string>>(activeProject.adSuitability)
 const [noneOfTheAbove, setNoneOfTheAbove] = useState(activeProject.noneOfTheAbove)

 const [categories, setCategories] = useState<SelectOption[]>(() => FALLBACK_CATEGORIES.map(([value, label]) => ({ value, label })))
 const [playlists, setPlaylists] = useState<SelectOption[]>([])
 const [saving, setSaving] = useState(false)
 const [saved, setSaved] = useState(false)
 const [error, setError] = useState("")
 const [defaultsLoading, setDefaultsLoading] = useState<"description" | "tags" | null>(null)
 const [timestampQuestions, setTimestampQuestions] = useState<string[]>([])
 const [timestampsLoading, setTimestampsLoading] = useState(false)
 const [originalData, setOriginalData] = useState({ title: "", description: "", tags: [] as string[], categoryId: "" })

 const videoInputRef = useRef<HTMLInputElement>(null)
 const thumbnailInputRef = useRef<HTMLInputElement>(null)
 const tagInputRef = useRef<HTMLInputElement>(null)
 const pageRef = useRef<HTMLDivElement>(null)

 // Sync active project changes to projects list & local storage
 useEffect(() => {
  if (mode !== "upload") return
  setProjects((current) => {
   const next = current.map((p) => (p.id === activeProjectId ? {
    ...p,
    title,
    description,
    tags,
    categoryId,
    privacyStatus,
    scheduledDate,
    scheduledTime,
    playlistId,
    thumbnailPreview,
    madeForKids,
    paidPromotion,
    alteredContent,
    autoChapters,
    language,
    captionCert,
    recordingDate,
    location,
    license,
    allowEmbedding,
    notifySubscribers,
    adSuitability,
    noneOfTheAbove,
   } : p))
   try { localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(next)) } catch {}
   return next
  })
 }, [
  mode, activeProjectId, title, description, tags, categoryId, privacyStatus,
  scheduledDate, scheduledTime, playlistId, thumbnailPreview, madeForKids, paidPromotion,
  alteredContent, autoChapters, language, captionCert, recordingDate, location,
  license, allowEmbedding, notifySubscribers, adSuitability, noneOfTheAbove,
 ])

 // Switch project draft
 const selectProject = (draftId: string) => {
  const target = projects.find((p) => p.id === draftId)
  if (!target) return
  setActiveProjectId(target.id)
  setTitle(target.title)
  setDescription(target.description)
  setTags(target.tags)
  setCategoryId(target.categoryId)
  setPrivacyStatus(target.privacyStatus)
  setScheduledDate(target.scheduledDate)
  setScheduledTime(target.scheduledTime)
  setPlaylistId(target.playlistId)
  setThumbnailPreview(target.thumbnailPreview)
  setMadeForKids(target.madeForKids)
  setPaidPromotion(target.paidPromotion)
  setAlteredContent(target.alteredContent)
  setAutoChapters(target.autoChapters)
  setLanguage(target.language)
  setCaptionCert(target.captionCert)
  setRecordingDate(target.recordingDate)
  setLocation(target.location)
  setLicense(target.license)
  setAllowEmbedding(target.allowEmbedding)
  setNotifySubscribers(target.notifySubscribers)
  setAdSuitability(target.adSuitability)
  setNoneOfTheAbove(target.noneOfTheAbove)
  setError("")
 }

 const createNewProject = () => {
  const newIndex = projects.length + 1
  const draft = createDefaultDraft(`Project ${newIndex}`)
  const updated = [...projects, draft]
  setProjects(updated)
  try { localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated)) } catch {}
  selectProject(draft.id)
 }

 const deleteProject = (draftId: string, event: React.MouseEvent) => {
  event.stopPropagation()
  if (projects.length <= 1) return
  const remaining = projects.filter((p) => p.id !== draftId)
  setProjects(remaining)
  try { localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(remaining)) } catch {}
  if (activeProjectId === draftId) {
   selectProject(remaining[0].id)
  }
 }

 const selectedAsset = useMemo(
  () => videos.find((video) => video.videoId === selectedVideoId) || null,
  [selectedVideoId, videos],
 )

 const filteredVideoOptions = useMemo(
  () => buildVideoAssetOptions(videos, videoSearch, 60).slice(1).map((option) => ({ value: option.val, label: option.lbl })),
  [videoSearch, videos],
 )

 const mostViewedVideoId = useMemo(() => {
  if (!videos || videos.length === 0) return ""
  const canonicalRows = data.canonicalRows || []
  let maxViews = -1
  let bestId = videos[0]?.videoId || ""
  const viewMap = new Map<string, number>()
  canonicalRows.forEach((row: any) => {
   const orig = row.originalData || row._originalData || {}
   const vid = String(row.videoId || row.id || orig.id || orig.videoId || "").replace(/^api-/, "")
   const v = (typeof row.metricsByWindow?.lifetime?.views === "object" ? row.metricsByWindow?.lifetime?.views?.value : row.metricsByWindow?.lifetime?.views)
    ?? (typeof row.metrics?.views === "object" ? row.metrics?.views?.value : row.metrics?.views)
    ?? row.views ?? row.viewCount ?? orig.views ?? orig.viewCount ?? orig.statistics?.viewCount ?? 0
   const numViews = Number(v) || 0
   if (vid) viewMap.set(vid, Math.max(viewMap.get(vid) || 0, numViews))
  })

  let cacheStats: Record<string, any> = {}
  try { cacheStats = readYouTubeAnalyticsCache()?.stats || {} } catch {}

  videos.forEach((video) => {
   const vid = video.videoId
   const viewsFromMap = viewMap.get(vid) ?? -1
   const viewsFromCache = Number(cacheStats[vid]?.viewCount || cacheStats[vid]?.views || -1)
   const effectiveViews = Math.max(viewsFromMap, viewsFromCache)
   if (effectiveViews > maxViews) {
    maxViews = effectiveViews
    bestId = vid
   }
  })
  return bestId
 }, [videos, data.canonicalRows])

 useEffect(() => {
  if (mode === "manage" && !selectedVideoId && mostViewedVideoId) {
   setSelectedVideoId(mostViewedVideoId)
  }
 }, [mode, selectedVideoId, mostViewedVideoId])

 useEffect(() => {
  if (!data.authState.isAuthenticated) return
  Promise.allSettled([fetchVideoCategories(), fetchUserPlaylists()]).then(([categoryResult, playlistResult]) => {
   if (categoryResult.status === "fulfilled") {
    setCategories(categoryResult.value
     .filter((category: { id: string }) => YT_STANDARD_CATEGORY_IDS.has(String(category.id)))
     .map((category: { id: string; title: string }) => ({ value: String(category.id), label: category.title })))
   }
   if (playlistResult.status === "fulfilled") {
    setPlaylists(playlistResult.value.map((playlist: { id: string; title: string }) => ({ value: playlist.id, label: playlist.title })))
   }
  })
 }, [data.authState.isAuthenticated])

 useEffect(() => {
  if (mode !== "manage" || !selectedVideoId) return
  const asset = videos.find((video) => video.videoId === selectedVideoId)
  const base = { title: asset?.title || "", description: "", tags: [] as string[], categoryId: "" }
  setTitle(base.title)
  setDescription("")
  setTags([])
  setThumbnailPreview(asset?.thumbnailUrl || `https://img.youtube.com/vi/${selectedVideoId}/hqdefault.jpg`)
  const cached = JSON.parse(localStorage.getItem(`${STORAGE_KEY}_${selectedVideoId}`) || "{}")
  setCategoryId(cached.categoryId || "")
  setPrivacyStatus(cached.privacyStatus || "public")
  setOriginalData(base)
  fetchVideoSnippetDetails([selectedVideoId]).then((details) => {
   const detail = details[selectedVideoId]
   if (!detail) return
   const next = {
    title: asset?.title || "",
    description: detail.description || "",
    tags: detail.tags || [],
    categoryId: detail.categoryId || cached.categoryId || "",
   }
   setDescription(next.description)
   setTags(next.tags)
   setCategoryId(next.categoryId)
   setOriginalData(next)
  }).catch(() => undefined)
 }, [mode, selectedVideoId, videos])

 useEffect(() => {
  pageRef.current?.scrollTo?.({ top: 0 })
 }, [page])

 const readThumbnail = (file?: File) => {
  if (!file || !file.type.startsWith("image/")) return
  setThumbnailFile(file)
  const reader = new FileReader()
  reader.onload = () => setThumbnailPreview(String(reader.result || ""))
  reader.readAsDataURL(file)
 }

 const addTag = () => {
  const next = newTag.trim()
  if (!next || tags.includes(next)) return
  if ([...tags, next].join(", ").length > TAG_CHARACTER_LIMIT) {
   setError(`Tags are limited to ${TAG_CHARACTER_LIMIT} characters.`)
   return
  }
  setTags((current) => [...current, next])
  setNewTag("")
 }

 const tagCharacterCount = tags.join(", ").length
 const tagDraftCharacterCount = tagCharacterCount + (newTag ? (tags.length ? 2 : 0) + newTag.length : 0)
 const remainingTagInputLength = Math.max(0, TAG_CHARACTER_LIMIT - tagCharacterCount - (tags.length ? 2 : 0))

 const applyChannelDefaults = async (target: "description" | "tags") => {
  setDefaultsLoading(target)
  setError("")
  try {
   const defaults = await fetchChannelPublishingDefaults()
   if (target === "description") {
    setDescription(defaults.description)
    if (!defaults.description) setError("Your channel has no default description in YouTube branding settings.")
   } else {
    setTags(limitTagsToCharacterBudget(defaults.tags))
    if (!defaults.tags.length) setError("Your channel has no default keywords in YouTube branding settings.")
   }
  } catch (cause) {
   setError(cause instanceof Error ? cause.message : "Unable to load channel defaults.")
  } finally {
   setDefaultsLoading(null)
  }
 }

 const generateTimestampQuestions = async () => {
  setTimestampsLoading(true)
  setError("")
  try {
   setTimestampQuestions(await generateEducationalTimestampQuestions({ title, description, tags }, data.brain))
  } catch (cause) {
   setError(cause instanceof Error ? cause.message : "Unable to generate timestamp questions.")
  } finally {
   setTimestampsLoading(false)
  }
 }

 const reset = () => {
  setTitle(originalData.title)
  setDescription(originalData.description)
  setTags(originalData.tags)
  setCategoryId(originalData.categoryId)
  setError("")
 }

 const save = async () => {
  if (mode === "manage" && !selectedVideoId) return setError("Select a published video first.")
  if (mode === "upload" && !videoFile) return setError("Choose a video file before publishing.")
  if (!title.trim()) return setError("Add a video title before continuing.")
  const requiredCapability = mode === "upload" ? "youtube_upload" : "youtube_comments"
  if (account.serverEnabled && !account.snapshot.grantedCapabilities.includes(requiredCapability)) {
   setError("Reconnect Channel to grant YouTube management permission.")
   void account.start("reconnect_channel", window.location.pathname)
   return
  }

  // Format scheduled publish time
  let publishAt: string | undefined
  let effectivePrivacy = privacyStatus
  if (privacyStatus === "scheduled" || scheduledDate) {
   if (scheduledDate) {
    try {
     const dateTimeStr = `${scheduledDate}T${scheduledTime || "12:00"}:00`
     publishAt = new Date(dateTimeStr).toISOString()
     effectivePrivacy = "private"
    } catch {}
   }
  }

  setSaving(true)
  setError("")
  const payload = {
   title: title.trim(),
   description,
   tags,
   categoryId,
   privacyStatus: effectivePrivacy,
   publishAt,
   madeForKids: madeForKids === "yes",
   recordingDate,
   locationDescription: location,
   license,
   embeddable: allowEmbedding,
   notifySubscribers,
  }

  try {
   if (mode === "manage") {
    await updateVideo(selectedVideoId, payload)
    localStorage.setItem(`${STORAGE_KEY}_${selectedVideoId}`, JSON.stringify({ categoryId, privacyStatus, playlistId, adSuitability, noneOfTheAbove }))
   } else {
    const uploaded = await uploadVideo(videoFile!, payload) as { id?: string }
    if (uploaded.id && thumbnailFile) await updateVideoThumbnail(uploaded.id, thumbnailFile)
   }
   setSaved(true)
   window.setTimeout(() => setSaved(false), 3000)
  } catch (reason) {
   setError(reason instanceof Error ? reason.message : "The video could not be saved. Try again.")
  } finally {
   setSaving(false)
  }
 }

   const headerDraftControls = mode === "upload" ? (
    <div className="video-uploader-header-drafts flex items-center gap-1.5" role="group" aria-label="Draft projects">
     <WidgetHeaderToggle
      label="Project Drafts"
      value={activeProjectId}
      items={projects.map((p) => ({ id: p.id, label: p.name || "Draft" }))}
      onChange={selectProject}
     />
     <button
      type="button"
      className="vt-button is-icon-only video-uploader-header-add"
      onClick={createNewProject}
      title="New Draft Project"
      aria-label="New Draft"
     >
      <Plus size={12} strokeWidth={3} />
     </button>
    </div>
   ) : undefined

   return (
    <WidgetShell
     {...common}
     icon={mode === "upload" ? <UploadCloud size={22} /> : <Pencil size={22} />}
     headerContent={headerDraftControls}
    >
     <div className="widget-workspace video-uploader-workspace">
      {/* Published video selector (Manage Mode) */}
      {mode === "manage" ? (
       <section className="video-manager-selection" aria-label="Published video selection">
        <input className="vt-input" value={videoSearch} onChange={(event) => setVideoSearch(event.target.value)} aria-label="Search published videos" placeholder="Search videos…" />
        <PortalSelect value={selectedVideoId} onChange={(value) => { setSelectedVideoId(value); setPage("details"); setError("") }} options={filteredVideoOptions} label="Published video" placeholder="Select a published video…" />
       </section>
      ) : null}

      <input ref={videoInputRef} hidden type="file" accept="video/*" onChange={(event) => setVideoFile(event.target.files?.[0] || null)} />
      <input ref={thumbnailInputRef} hidden type="file" accept="image/*" onChange={(event) => readThumbnail(event.target.files?.[0])} />

      {mode === "manage" && !selectedAsset ? (
       <div className="widget-empty-state"><FileVideo2 /><strong>Select a published video</strong><span>Its thumbnail and editable metadata will appear here.</span></div>
      ) : (
       <>
        {mode === "manage" && selectedAsset ? (
         <article className="widget-selection-card">
          <img src={thumbnailPreview || selectedAsset.thumbnailUrl} alt={`Thumbnail for ${selectedAsset.title}`} />
          <div><span>Editing published video</span><strong>{selectedAsset.title}</strong><small>{selectedAsset.videoId}</small></div>
         </article>
        ) : null}

        <WidgetWorkflowMain className="widget-workspace-content video-uploader-content">
         {/* ── PAGE 1: DETAILS TAB (3 Synchronized Aligned Rows) ── */}
         {page === "details" ? (
          <div className="video-uploader-details-rows">
           {/* ROW 1: Video Title (Left) + Upload Video (Right) */}
           <div className="video-uploader-title-row">
            <div className="widget-uploader-input is-title">
             <input
              className="vt-input"
           aria-label="Video title"
           placeholder="VIDEO TITLE"
           value={title}
           maxLength={100}
           onChange={(event) => setTitle(event.target.value)}
          />
          <span className="widget-uploader-input-meta">
           <span>Video title</span>
           <small>{title.length}/100</small>
          </span>
         </div>

         {mode === "upload" ? (
          <WidgetMediaUploadAction
           className="video-upload-file-action"
           onClick={() => videoInputRef.current?.click()}
           title={videoFile?.name || "Choose a source video"}
          >
           <UploadCloud size={16} />
           <span>{videoFile?.name || "UPLOAD VIDEO"}</span>
          </WidgetMediaUploadAction>
         ) : <div className="video-uploader-row-spacer" />}
        </div>

        {/* ROW 2: Description (Left) + Thumbnail Frame & Button (Right) */}
        <div className="video-uploader-description-row">
         <div className="widget-uploader-input is-description">
          <textarea
           className="vt-textarea widget-description-textarea"
           aria-label="Description"
           placeholder="DESCRIPTION"
           value={description}
           maxLength={5000}
           onChange={(event) => setDescription(event.target.value)}
           rows={4}
          />
          <span className="widget-uploader-input-meta">
           <span>Description</span>
           <small>{description.length}/5000</small>
          </span>
         </div>

         <div className="video-thumbnail-column">
          <div className="video-thumbnail-frame-wrap">
           <WidgetMediaUploadFrame
            className="video-thumbnail-upload"
            icon={<ImagePlus size={22} />}
            title="THUMBNAIL"
            detail="Drop an image file here"
            hasValue={Boolean(thumbnailPreview)}
            preview={thumbnailPreview ? <img src={thumbnailPreview} alt="Thumbnail preview" /> : undefined}
            onBrowse={() => thumbnailInputRef.current?.click()}
            onDropFile={readThumbnail}
           />
          </div>
          <WidgetMediaUploadAction onClick={() => thumbnailInputRef.current?.click()}>
           {thumbnailPreview ? "REPLACE THUMBNAIL" : "UPLOAD THUMBNAIL"}
          </WidgetMediaUploadAction>
         </div>
        </div>

        {/* ROW 3: Tags Composer & Defaults (Left) + 3 Dropdowns (Right) */}
        <div className="video-uploader-meta-row">
         <div className="widget-tags-entry" aria-label={`Tags (${tags.length})`}>
          <div className="widget-tags-composer" role="group" aria-label={`Tags (${tags.length})`} onClick={() => tagInputRef.current?.focus()}>
           <div className="widget-tags-scroll">
            <div className="widget-tag-list">
             {tags.map((tag) => (
              <WidgetTag key={tag} onRemove={() => setTags((current) => current.filter((item) => item !== tag))}>{tag}</WidgetTag>
             ))}
            </div>
            <input
             ref={tagInputRef}
             className="widget-tags-composer-input"
             aria-label="Add tag"
             value={newTag}
             maxLength={remainingTagInputLength}
             onChange={(event) => setNewTag(event.target.value)}
             onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag() } }}
             placeholder={tags.length ? "Add tag…" : "Tags — add tag…"}
            />
            <span className="widget-tags-character-count" aria-live="polite">{Math.min(TAG_CHARACTER_LIMIT, tagDraftCharacterCount)}/{TAG_CHARACTER_LIMIT}</span>
           </div>
          </div>
          <div className="widget-tags-composer-actions">
           <button type="button" className="vt-button" disabled={defaultsLoading !== null} onClick={() => void applyChannelDefaults("description")}>
            {defaultsLoading === "description" ? "Loading…" : "USE DEFAULT DESCRIPTION"}
           </button>
           <button type="button" className="vt-button" disabled={defaultsLoading !== null} onClick={() => void applyChannelDefaults("tags")}>
            {defaultsLoading === "tags" ? "Loading…" : "USE DEFAULT TAGS"}
           </button>
           <button className="vt-button primary" type="button" onClick={addTag} aria-label="Add tag"><Plus size={14} /></button>
          </div>
         </div>

         <div className="video-uploader-selects">
          <PortalSelect
           value={privacyStatus}
           onChange={setPrivacyStatus}
           label="Visibility"
           options={[
            { value: "public", label: "PUBLIC" },
            { value: "unlisted", label: "UNLISTED" },
            { value: "private", label: "PRIVATE" },
            { value: "scheduled", label: "SCHEDULED" },
           ]}
           placeholder="Visibility"
          />
          <PortalSelect value={categoryId} onChange={setCategoryId} label="Category" options={categories} placeholder="Category" />
          <PortalSelect value={playlistId} onChange={setPlaylistId} label="Playlist" options={playlists} placeholder="Playlist" />
         </div>
        </div>

        {/* Compact Schedule Inputs (When visibility is Scheduled) */}
        {privacyStatus === "scheduled" || scheduledDate ? (
         <div className="video-uploader-schedule-strip">
          <div className="video-uploader-schedule-label">
           <Calendar size={13} />
           <span>PUBLISH SCHEDULE:</span>
          </div>
          <input
           type="date"
           className="vt-input-standard video-schedule-date"
           value={scheduledDate}
           onChange={(e) => setScheduledDate(e.target.value)}
           aria-label="Publish date"
          />
          <input
           type="time"
           className="vt-input-standard video-schedule-time"
           value={scheduledTime}
           onChange={(e) => setScheduledTime(e.target.value)}
           aria-label="Publish time"
          />
         </div>
        ) : null}
       </div>
      ) : null}

      {/* ── PAGE 2: OPTIONS & COMPLIANCE (Compact, Zero-Waste Grid) ── */}
      {page === "options_compliance" ? (
       <div className="video-uploader-compliance-page">
        {/* Section 1: Ad Suitability */}
        <section className="video-uploader-compliance-card">
         <header className="video-uploader-card-header">
          <div className="video-uploader-card-title">
           <ShieldCheck size={16} />
           <strong>AD SUITABILITY</strong>
          </div>
          <Choice label="None of the above applies" checked={noneOfTheAbove} onChange={() => setNoneOfTheAbove((value) => !value)} />
         </header>
         <div className="video-uploader-ads-grid">
          {AD_CATEGORIES.map((category) => (
           <Module title={category} key={category}>
            <Choice type="radio" name={`${mode}-${category}`} value="none" label="None" checked={(adSuitability[category] || "none") === "none"} onChange={() => setAdSuitability((current) => ({ ...current, [category]: "none" }))} />
            <Choice type="radio" name={`${mode}-${category}`} value="limited" label="Limited or contextual" checked={adSuitability[category] === "limited"} onChange={() => setAdSuitability((current) => ({ ...current, [category]: "limited" }))} />
            <Choice type="radio" name={`${mode}-${category}`} value="strong" label="Strong or repeated" checked={adSuitability[category] === "strong"} onChange={() => setAdSuitability((current) => ({ ...current, [category]: "strong" }))} />
           </Module>
          ))}
         </div>
        </section>

        {/* Section 2: Publishing Options & Disclosures */}
        <section className="video-uploader-compliance-card">
         <header className="video-uploader-card-header">
          <div className="video-uploader-card-title">
           <Sparkles size={16} />
           <strong>PUBLISHING OPTIONS & DISCLOSURES</strong>
          </div>
         </header>
         <div className="video-uploader-options-grid">
          <Module title="Audience and restrictions">
           <Choice type="radio" name={`${mode}-kids`} value="yes" label="Yes, this video is made for kids" checked={madeForKids === "yes"} onChange={() => setMadeForKids("yes")} />
           <Choice type="radio" name={`${mode}-kids`} value="no" label="No, this video is not made for kids" checked={madeForKids === "no"} onChange={() => setMadeForKids("no")} />
          </Module>
          <Module title="Disclosures and altered content">
           <Choice label="Contains paid promotion" checked={paidPromotion} onChange={() => setPaidPromotion((value) => !value)} />
           <Choice type="radio" name={`${mode}-altered`} value="yes" label="Contains realistic altered or synthetic content" checked={alteredContent === "yes"} onChange={() => setAlteredContent("yes")} />
           <Choice type="radio" name={`${mode}-altered`} value="no" label="Does not contain realistic altered content" checked={alteredContent === "no"} onChange={() => setAlteredContent("no")} />
          </Module>
          <Module title="Automatic concepts and chapters">
           <Choice label="Allow automatic chapters and key moments" checked={autoChapters} onChange={() => setAutoChapters((value) => !value)} />
          </Module>
          <Module title="Language and captions certification">
           <div className="widget-control-grid">
            <Field label="Video language">
             <PortalSelect value={language} onChange={setLanguage} label="Video language" options={[{ value: "en", label: "English" }, { value: "es", label: "Spanish" }, { value: "fr", label: "French" }, { value: "de", label: "German" }, { value: "none", label: "Not applicable" }]} />
            </Field>
            <Field label="Caption certification">
             <PortalSelect value={captionCert} onChange={setCaptionCert} label="Caption certification" options={[{ value: "none", label: "None" }, { value: "neverAired", label: "Never aired on U.S. television" }, { value: "grantedExemption", label: "FCC exemption granted" }]} />
            </Field>
           </div>
          </Module>
          <Module title="Recording date and location">
           <div className="widget-control-grid">
            <Field label="Recording date">
             <input className="vt-input-standard" type="date" value={recordingDate} onChange={(event) => setRecordingDate(event.target.value)} />
            </Field>
            <Field label="Video location">
             <input className="vt-input-standard" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="None" />
            </Field>
           </div>
          </Module>
          <Module title="License and distribution">
           <div className="widget-control-grid">
            <Field label="License">
             <PortalSelect value={license} onChange={setLicense} label="License" options={[{ value: "youtube", label: "Standard YouTube license" }, { value: "creativeCommon", label: "Creative Commons - Attribution" }]} />
            </Field>
           </div>
           <Choice label="Allow embedding" checked={allowEmbedding} onChange={() => setAllowEmbedding((value) => !value)} />
           <Choice label="Notify subscribers" checked={notifySubscribers} onChange={() => setNotifySubscribers((value) => !value)} />
          </Module>
         </div>
        </section>

        {/* Section 3: Educational Timestamps (When category is 27) */}
        {categoryId === "27" ? (
         <section className="video-uploader-compliance-card video-timestamp-workspace">
          <header className="video-uploader-card-header">
           <div className="video-uploader-card-title">
            <BookOpen size={16} />
            <strong>EDUCATIONAL TIMESTAMPS</strong>
           </div>
          </header>
          {timestampQuestions.length ? (
           <ol className="video-timestamp-questions">
            {timestampQuestions.map((question, index) => <li key={`${question}-${index}`}>{question}</li>)}
           </ol>
          ) : <p className="widget-empty-copy">No timestamp questions generated yet.</p>}
          <button type="button" className="vt-button primary" disabled={timestampsLoading} onClick={() => void generateTimestampQuestions()}>
           {timestampsLoading ? <><Loader2 className="is-spinning" size={14} /> Generating…</> : "Generate timestamp questions"}
          </button>
         </section>
        ) : null}
       </div>
      ) : null}
     </WidgetWorkflowMain>

     {error ? (
      <div className="widget-inline-error" role="alert">
       <span>{error}</span>
       <button type="button" className="widget-inline-error-dismiss" onClick={() => setError("")} aria-label="Dismiss error">
        <X size={12} strokeWidth={3} />
       </button>
      </div>
     ) : null}

     {/* Clean 2-Tab Footer Toolbar */}
     <WidgetFooter className="widget-toolbar widget-workflow-toolbar video-uploader-footer">
      <nav className="video-uploader-nav-tabs" aria-label="Workspace sections">
       <button
        type="button"
        className={`vt-button ${page === "details" ? "primary" : ""}`}
        aria-pressed={page === "details"}
        onClick={() => setPage("details")}
       >
        DETAILS
       </button>
       <button
        type="button"
        className={`vt-button ${page === "options_compliance" ? "primary" : ""}`}
        aria-pressed={page === "options_compliance"}
        onClick={() => setPage("options_compliance")}
       >
        OPTIONS & SUITABILITY
       </button>
      </nav>

      <div className="video-uploader-footer-actions">
       <WidgetSplitButton type="button" tone="primary" width="full" icon={<Save size={14} />} disabled={saving} onClick={save}>
        {saving ? "Saving…" : saved ? (mode === "upload" ? "Published" : "Saved") : (mode === "upload" ? "Publish video" : "Save changes")}
       </WidgetSplitButton>
       <button type="button" className="vt-button is-icon-only" onClick={reset} aria-label="Revert changes">
        <RotateCcw size={14} />
       </button>
      </div>
      </WidgetFooter>
     </>
    )}
   </div>
  </WidgetShell>
 )
}

const VideoWorkflowWidget = ({ mode, data, ...common }: WidgetProps & { mode: WorkflowMode }) => (
 <VideoMetadataWorkspace mode={mode} data={data} {...common} />
)

export const VideoUploaderWidget = (props: WidgetProps) => <VideoWorkflowWidget {...props} mode="upload" />
export const DataEditWidget = (props: WidgetProps) => <VideoWorkflowWidget {...props} mode="manage" />

