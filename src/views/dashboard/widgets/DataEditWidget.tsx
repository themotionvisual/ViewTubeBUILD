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

const STORAGE_KEY = "vt_data_edit_state"
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

const limitTagsToCharacterBudget = (values: string[]) => values.reduce<string[]>((accepted, value) => {
 const tag = value.trim()
 if (!tag || accepted.includes(tag)) return accepted
 return [...accepted, tag].join(", ").length <= TAG_CHARACTER_LIMIT ? [...accepted, tag] : accepted
}, [])

// Compatibility surface for the title and retention widgets while dropdown behavior is centralized.
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
type WorkspacePage = "details" | "options" | "ads" | "timestamps"
type WidgetProps = CommonWidgetProps & { data: DashboardData }

const VideoMetadataWorkspace = ({ mode, data }: { mode: WorkflowMode; data: DashboardData }) => {
 const account = useUnifiedAccount()
 const videos = data.videoAssets
 const [page, setPage] = useState<WorkspacePage>("details")
 const [selectedVideoId, setSelectedVideoId] = useState("")
 const [videoSearch, setVideoSearch] = useState("")
 const [videoFile, setVideoFile] = useState<File | null>(null)
 const [title, setTitle] = useState("")
 const [description, setDescription] = useState("")
 const [tags, setTags] = useState<string[]>([])
 const [newTag, setNewTag] = useState("")
 const [categoryId, setCategoryId] = useState("")
 const [privacyStatus, setPrivacyStatus] = useState("public")
 const [playlistId, setPlaylistId] = useState("")
 const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
 const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
 const [madeForKids, setMadeForKids] = useState("no")
 const [paidPromotion, setPaidPromotion] = useState(false)
 const [alteredContent, setAlteredContent] = useState("no")
 const [autoChapters, setAutoChapters] = useState(true)
 const [language, setLanguage] = useState("en")
 const [captionCert, setCaptionCert] = useState("none")
 const [recordingDate, setRecordingDate] = useState("")
 const [location, setLocation] = useState("")
 const [license, setLicense] = useState("youtube")
 const [allowEmbedding, setAllowEmbedding] = useState(true)
 const [notifySubscribers, setNotifySubscribers] = useState(true)
 const [adSuitability, setAdSuitability] = useState<Record<string, string>>({})
 const [noneOfTheAbove, setNoneOfTheAbove] = useState(false)
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

 const selectedAsset = useMemo(
  () => videos.find((video) => video.videoId === selectedVideoId) || null,
  [selectedVideoId, videos],
 )

 const filteredVideoOptions = useMemo(
  () => buildVideoAssetOptions(videos, videoSearch, 60).slice(1).map((option) => ({ value: option.val, label: option.lbl })),
  [videoSearch, videos],
 )

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
  if (mode !== "upload") return
  try {
   const cached = JSON.parse(localStorage.getItem("vt_bridge_image_video-uploader") || "null")
   if (cached?.imageUrl) setThumbnailPreview(cached.imageUrl)
  } catch {
   // A corrupt optional bridge preview should never block the uploader.
  }
  const onNavigate = (event: Event) => {
   const detail = (event as CustomEvent<{ targetWidget?: string; videoTitle?: string }>).detail
   if (detail?.targetWidget !== "video-uploader" && detail?.targetWidget !== "data-edit") return
   setPage("details")
   if (detail.videoTitle) setTitle(detail.videoTitle)
  }
  const onImage = (event: Event) => {
   const detail = (event as CustomEvent<{ targetWidget?: string; imageUrl?: string }>).detail
   if (!detail?.imageUrl || (detail.targetWidget && detail.targetWidget !== "video-uploader")) return
   setThumbnailPreview(detail.imageUrl)
  }
  window.addEventListener("vt_navigate_widget", onNavigate)
  window.addEventListener("vt_dashboard_generated_image", onImage)
  return () => {
   window.removeEventListener("vt_navigate_widget", onNavigate)
   window.removeEventListener("vt_dashboard_generated_image", onImage)
  }
 }, [mode])

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

 useEffect(() => {
  if (categoryId !== "27" && page === "timestamps") setPage("details")
 }, [categoryId, page])

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
  setSaving(true)
  setError("")
  const payload = {
   title: title.trim(), description, tags, categoryId, privacyStatus,
   madeForKids: madeForKids === "yes", recordingDate, locationDescription: location,
   license, embeddable: allowEmbedding, notifySubscribers,
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

 const tabs: { id: WorkspacePage; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "options", label: "Options" },
  { id: "ads", label: "Ad suitability" },
  ...(categoryId === "27" ? [{ id: "timestamps" as const, label: "Timestamps" }] : []),
 ]

 return (
  <div className="widget-workspace">
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

     <WidgetWorkflowMain className="widget-workspace-content">
      {page === "details" ? (
        <div className="widget-details-wrapper">
          {mode === "upload" ? (
            <>
              <div className="video-uploader-title-row">
                <div className="widget-uploader-input is-title">
                  <input className="vt-input" aria-label="Video title" placeholder="Video title" value={title} maxLength={100} onChange={(event) => setTitle(event.target.value)} />
                  <span className="widget-uploader-input-meta" aria-hidden="true"><span>Video title</span><small>{title.length}/100</small></span>
                </div>
                <WidgetMediaUploadAction className="video-upload-file-action" onClick={() => videoInputRef.current?.click()} title={videoFile?.name || "Choose a source video"}>
                  {videoFile?.name || "Upload video"}
                </WidgetMediaUploadAction>
              </div>
              <div className="video-uploader-description-row">
                <div className="widget-uploader-input is-description">
                  <textarea className="vt-textarea widget-description-textarea" aria-label="Description" placeholder="Description" value={description} maxLength={5000} onChange={(event) => setDescription(event.target.value)} rows={2} />
                  <span className="widget-uploader-input-meta" aria-hidden="true"><span>Description</span><small>{description.length}/5000</small></span>
                </div>
                <div className="video-thumbnail-column">
                  <WidgetMediaUploadFrame
                    className="video-thumbnail-upload"
                    icon={<ImagePlus />}
                    title="Thumbnail"
                    detail="Drop an image file here"
                    hasValue={Boolean(thumbnailPreview)}
                    preview={thumbnailPreview ? <img src={thumbnailPreview} alt="Thumbnail preview" /> : undefined}
                    onBrowse={() => thumbnailInputRef.current?.click()}
                    onDropFile={readThumbnail}
                  />
                  <WidgetMediaUploadAction onClick={() => thumbnailInputRef.current?.click()}>
                    {thumbnailPreview ? "Replace thumbnail" : "Upload thumbnail"}
                  </WidgetMediaUploadAction>
                </div>
              </div>
              <div className="video-uploader-meta-row">
                <div className="widget-tags-entry" aria-label={`Tags (${tags.length})`}>
                  <div className="widget-tags-composer" role="group" aria-label={`Tags (${tags.length})`} onClick={() => tagInputRef.current?.focus()}>
                    <div className="widget-tags-scroll">
                      <div className="widget-tag-list">
                        {tags.map((tag) => (
                          <WidgetTag key={tag} onRemove={() => setTags((current) => current.filter((item) => item !== tag))}>{tag}</WidgetTag>
                        ))}
                      </div>
                      <input ref={tagInputRef} className="widget-tags-composer-input" aria-label="Add tag" value={newTag} maxLength={remainingTagInputLength} onChange={(event) => setNewTag(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag() } }} placeholder={tags.length ? "Add tag…" : "Tags — add tag…"} />
                      <span className="widget-tags-character-count" aria-live="polite">{Math.min(TAG_CHARACTER_LIMIT, tagDraftCharacterCount)}/{TAG_CHARACTER_LIMIT}</span>
                    </div>
                  </div>
                  <div className="widget-tags-composer-actions">
                    <button type="button" className="vt-button" disabled={defaultsLoading !== null} onClick={() => void applyChannelDefaults("description")}>{defaultsLoading === "description" ? "Loading…" : "Use default description"}</button>
                    <button type="button" className="vt-button" disabled={defaultsLoading !== null} onClick={() => void applyChannelDefaults("tags")}>{defaultsLoading === "tags" ? "Loading…" : "Use default tags"}</button>
                    <button className="vt-button primary" type="button" onClick={addTag} aria-label="Add tag"><Plus /></button>
                  </div>
                </div>
                <div className="widget-details-selects video-uploader-selects">
                  <PortalSelect value={privacyStatus} onChange={setPrivacyStatus} label="Visibility" options={[{ value: "public", label: "Public" }, { value: "unlisted", label: "Unlisted" }, { value: "private", label: "Private" }]} placeholder="Visibility" />
                  <PortalSelect value={categoryId} onChange={setCategoryId} label="Category" options={categories} placeholder="Category" />
                  <PortalSelect value={playlistId} onChange={setPlaylistId} label="Playlist" options={playlists} placeholder="Playlist" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="widget-details-layout is-manage">
                <WidgetMediaUploadFrame className="video-thumbnail-upload" icon={<ImagePlus />} title="Thumbnail" detail="Choose an image file" actionLabel={thumbnailPreview ? "Replace thumbnail" : "Upload thumbnail"} hasValue={Boolean(thumbnailPreview)} preview={thumbnailPreview ? <img src={thumbnailPreview} alt={selectedAsset ? `Current thumbnail for ${selectedAsset.title}` : "Thumbnail preview"} /> : undefined} onBrowse={() => thumbnailInputRef.current?.click()} onDropFile={readThumbnail} />
              </div>
              <Field label="Video title"><input className="vt-input" aria-label="Video title" value={title} maxLength={100} onChange={(event) => setTitle(event.target.value)} /><small className="widget-character-count">{title.length}/100</small></Field>
              <div className="widget-details-bottom">
                <Field label="Description"><textarea className="vt-textarea widget-description-textarea" aria-label="Description" value={description} maxLength={5000} onChange={(event) => setDescription(event.target.value)} rows={2} /><small className="widget-character-count">{description.length}/5000</small></Field>
                <Module title={`Tags (${tags.length})`}>
              <div className="widget-tag-list">
                {tags.map((tag) => (
                  <WidgetTag
                    key={tag}
                    onRemove={() => setTags((current) => current.filter((item) => item !== tag))}
                  >
                    {tag}
                  </WidgetTag>
                ))}
              </div>
              <div className="widget-inline-entry">
                <input 
                  className="vt-input-standard" 
                  value={newTag} 
                  onChange={(event) => setNewTag(event.target.value)} 
                  onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag() } }} 
                  placeholder="Add tag…" 
                />
                <button 
                  className="vt-button primary" 
                  type="button" 
                  onClick={addTag} 
                  aria-label="Add tag"
                >
                  <Plus />
                </button>
              </div>
                </Module>
                <div className="widget-control-grid is-three widget-details-selects">
                <PortalSelect value={privacyStatus} onChange={setPrivacyStatus} label="Visibility" options={[{ value: "public", label: "Public" }, { value: "unlisted", label: "Unlisted" }, { value: "private", label: "Private" }]} placeholder="Visibility" />
                <PortalSelect value={categoryId} onChange={setCategoryId} label="Category" options={categories} placeholder="Category" />
                <PortalSelect value={playlistId} onChange={setPlaylistId} label="Playlist" options={playlists} placeholder="Playlist" />
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* Options page and Ads page (re-wrapped to maintain scroll structure if needed by styles) */}
      <div className={page !== "details" ? "widget-disclosure-list" : ""}>
      {page === "options" ? (
        <>
        <Module title="Audience and restrictions"><Choice type="radio" name={`${mode}-kids`} value="yes" label="Yes, this video is made for kids" checked={madeForKids === "yes"} onChange={() => setMadeForKids("yes")} /><Choice type="radio" name={`${mode}-kids`} value="no" label="No, this video is not made for kids" checked={madeForKids === "no"} onChange={() => setMadeForKids("no")} /></Module>
        <Module title="Disclosures and altered content"><Choice label="Contains paid promotion" checked={paidPromotion} onChange={() => setPaidPromotion((value) => !value)} /><Choice type="radio" name={`${mode}-altered`} value="yes" label="Contains realistic altered or synthetic content" checked={alteredContent === "yes"} onChange={() => setAlteredContent("yes")} /><Choice type="radio" name={`${mode}-altered`} value="no" label="Does not contain realistic altered content" checked={alteredContent === "no"} onChange={() => setAlteredContent("no")} /></Module>
        <Module title="Automatic concepts and chapters"><Choice label="Allow automatic chapters and key moments" checked={autoChapters} onChange={() => setAutoChapters((value) => !value)} /></Module>
        <Module title="Language and captions certification"><div className="widget-control-grid"><Field label="Video language"><PortalSelect value={language} onChange={setLanguage} label="Video language" options={[{ value: "en", label: "English" }, { value: "es", label: "Spanish" }, { value: "fr", label: "French" }, { value: "de", label: "German" }, { value: "none", label: "Not applicable" }]} /></Field><Field label="Caption certification"><PortalSelect value={captionCert} onChange={setCaptionCert} label="Caption certification" options={[{ value: "none", label: "None" }, { value: "neverAired", label: "Never aired on U.S. television" }, { value: "grantedExemption", label: "FCC exemption granted" }]} /></Field></div></Module>
        <Module title="Recording date and location"><div className="widget-control-grid"><Field label="Recording date"><input className="vt-input-standard" type="date" value={recordingDate} onChange={(event) => setRecordingDate(event.target.value)} /></Field><Field label="Video location"><input className="vt-input-standard" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="None" /></Field></div></Module>
        <Module title="License and distribution"><div className="widget-control-grid"><Field label="License"><PortalSelect value={license} onChange={setLicense} label="License" options={[{ value: "youtube", label: "Standard YouTube license" }, { value: "creativeCommon", label: "Creative Commons - Attribution" }]} /></Field></div><Choice label="Allow embedding" checked={allowEmbedding} onChange={() => setAllowEmbedding((value) => !value)} /><Choice label="Notify subscribers" checked={notifySubscribers} onChange={() => setNotifySubscribers((value) => !value)} /></Module>
        </>
      ) : null}

      {page === "ads" ? (
       <div className="widget-section-workspace">
        <header><ShieldCheck /><div><strong>Ad suitability</strong><span>Declare anything in the video, title, description, or keywords.</span></div></header>
        <div className="widget-disclosure-grid">
         {AD_CATEGORIES.map((category) => (
          <Module title={category} key={category}>
           <Choice type="radio" name={`${mode}-${category}`} value="none" label="None" checked={(adSuitability[category] || "none") === "none"} onChange={() => setAdSuitability((current) => ({ ...current, [category]: "none" }))} />
           <Choice type="radio" name={`${mode}-${category}`} value="limited" label="Limited or contextual" checked={adSuitability[category] === "limited"} onChange={() => setAdSuitability((current) => ({ ...current, [category]: "limited" }))} />
           <Choice type="radio" name={`${mode}-${category}`} value="strong" label="Strong or repeated" checked={adSuitability[category] === "strong"} onChange={() => setAdSuitability((current) => ({ ...current, [category]: "strong" }))} />
          </Module>
         ))}
        </div>
       <Choice label="None of the above applies" checked={noneOfTheAbove} onChange={() => setNoneOfTheAbove((value) => !value)} />
       </div>
      ) : null}
      {page === "timestamps" ? (
       <section className="widget-section-workspace video-timestamp-workspace">
        <header><BookOpen /><div><strong>Educational timestamps</strong><span>Generate five teaching questions from the upload metadata.</span></div></header>
        {timestampQuestions.length ? (
         <ol className="video-timestamp-questions">
          {timestampQuestions.map((question, index) => <li key={`${question}-${index}`}>{question}</li>)}
         </ol>
        ) : <p className="widget-empty-copy">No timestamp questions generated yet.</p>}
        <button type="button" className="vt-button primary" disabled={timestampsLoading} onClick={() => void generateTimestampQuestions()}>
         {timestampsLoading ? <><Loader2 className="is-spinning" /> Generating…</> : "Generate timestamp questions"}
        </button>
       </section>
      ) : null}
      </div>
     </WidgetWorkflowMain>

     {error ? <div className="widget-inline-error" role="alert">{error}</div> : null}
     <WidgetFooter className="widget-toolbar widget-workflow-toolbar">
      <nav className={`widget-workflow-buttons is-${tabs.length}-up`} aria-label={`${mode === "upload" ? "Upload" : "Video manager"} sections`}>
       {tabs.map((tab) => (
        <button key={tab.id} type="button" className={`vt-button ${page === tab.id ? "primary" : ""}`.trim()} aria-pressed={page === tab.id} onClick={() => setPage(tab.id)}>{tab.label}</button>
       ))}
      </nav>
      <WidgetSplitButton type="button" tone="primary" width="full" icon={<Save />} disabled={saving} onClick={save}>
       {saving ? "Saving…" : saved ? (mode === "upload" ? "Published" : "Saved") : (mode === "upload" ? "Publish video" : "Save changes")}
      </WidgetSplitButton>
      <button type="button" className="vt-button is-icon-only" onClick={reset} aria-label="Revert changes"><RotateCcw /></button>
     </WidgetFooter>
    </>
   )}
  </div>
 )
}

const VideoWorkflowWidget = ({ mode, data, ...common }: WidgetProps & { mode: WorkflowMode }) => (
 <WidgetShell {...common} icon={mode === "upload" ? <UploadCloud size={22} /> : <Pencil size={22} />}>
  <VideoMetadataWorkspace mode={mode} data={data} />
 </WidgetShell>
)

export const VideoUploaderWidget = (props: WidgetProps) => <VideoWorkflowWidget {...props} mode="upload" />

// Keep the established data-edit renderer identity so existing layouts migrate to the redesigned manager.
export const DataEditWidget = (props: WidgetProps) => <VideoWorkflowWidget {...props} mode="manage" />
