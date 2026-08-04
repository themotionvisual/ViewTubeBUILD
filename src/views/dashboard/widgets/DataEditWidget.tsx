import React, { useEffect, useMemo, useRef, useState } from "react"
import {
 FileVideo2,
 ImagePlus,
 Pencil,
 Plus,
 RotateCcw,
 Save,
 Search,
 ShieldCheck,
 Upload,
 UploadCloud,
 CircleX,
 X,
} from "lucide-react"
import {
 fetchUserPlaylists,
 fetchVideoCategories,
 fetchVideoSnippetDetails,
 updateVideoThumbnail,
 updateVideo,
 uploadVideo,
} from "../../../services/youtubeService"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import {
 WidgetChoice as Choice,
 WidgetDisclosure as Module,
 WidgetField as Field,
 WidgetSelect as PortalSelect,
 type WidgetSelectOption as SelectOption,
} from "../WidgetPrimitives"
import { WidgetShell } from "../WidgetShell"
import { buildVideoAssetOptions } from "./videoAssetOptions"

const STORAGE_KEY = "vt_data_edit_state"
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
type WorkspacePage = "details" | "options" | "ads"
type WidgetProps = CommonWidgetProps & { data: DashboardData }

const VideoMetadataWorkspace = ({ mode, data }: { mode: WorkflowMode; data: DashboardData }) => {
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
 const [originalData, setOriginalData] = useState({ title: "", description: "", tags: [] as string[], categoryId: "" })
 const videoInputRef = useRef<HTMLInputElement>(null)
 const thumbnailInputRef = useRef<HTMLInputElement>(null)
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
  setTags((current) => [...current, next])
  setNewTag("")
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
 ]

 return (
  <div className="widget-workspace">
   {mode === "manage" ? (
    <section className="video-manager-selection" aria-label="Published video selection">
     <div className="widget-search-control"><Search aria-hidden="true" /><input className="vt-input-standard" value={videoSearch} onChange={(event) => setVideoSearch(event.target.value)} aria-label="Search published videos" placeholder="Search videos…" /></div>
     <PortalSelect value={selectedVideoId} onChange={(value) => { setSelectedVideoId(value); setPage("details"); setError("") }} options={filteredVideoOptions} label="Published video" placeholder="Select a published video…" />
    </section>
   ) : (
    <button
     type="button"
     className="vt-button primary video-upload-button"
     onClick={() => videoInputRef.current?.click()}
     aria-label={videoFile ? `Upload video. Selected file: ${videoFile.name}` : "Upload video"}
     title={videoFile?.name}
    >
     <Upload aria-hidden="true" />
     Upload video
    </button>
   )}
   <input ref={videoInputRef} hidden type="file" accept="video/*" onChange={(event) => setVideoFile(event.target.files?.[0] || null)} />

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

     <div className="widget-scroll-region" ref={pageRef}>
      {page === "details" ? (
       <>
        <div className="widget-feature-grid">
         <div className="widget-details-primary">
          <Field label="Video title"><input className="vt-input" aria-label="Video title" value={title} maxLength={100} onChange={(event) => setTitle(event.target.value)} /><small className="widget-character-count">{title.length}/100</small></Field>
          <div className="widget-control-grid is-three widget-details-selects">
           <PortalSelect value={privacyStatus} onChange={setPrivacyStatus} label="Visibility" options={[{ value: "public", label: "Public" }, { value: "unlisted", label: "Unlisted" }, { value: "private", label: "Private" }]} placeholder="Visibility" />
           <PortalSelect value={categoryId} onChange={setCategoryId} label="Category" options={categories} placeholder="Category" />
           <PortalSelect value={playlistId} onChange={setPlaylistId} label="Playlist" options={playlists} placeholder="Playlist" />
          </div>
         </div>
         <div className="widget-media-picker">
          {thumbnailPreview ? <img src={thumbnailPreview} alt={mode === "manage" && selectedAsset ? `Current thumbnail for ${selectedAsset.title}` : "Thumbnail preview"} /> : <div><ImagePlus /><span>Thumbnail</span></div>}
          <button className="vt-button secondary" type="button" onClick={() => thumbnailInputRef.current?.click()}><Upload />{thumbnailPreview ? "Replace" : "Add"}</button>
          <input ref={thumbnailInputRef} hidden type="file" accept="image/*" onChange={(event) => readThumbnail(event.target.files?.[0])} />
         </div>
        </div>
        <Field label="Description"><textarea className="vt-textarea widget-description-textarea" aria-label="Description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} /><small className="widget-character-count">{description.length}/5000</small></Field>
        <Module title={`Tags (${tags.length})`}>
  <div className="widget-tag-list">
    {tags.map((tag) => (
      <button 
        className="chip" 
        type="button" 
        key={tag} 
        onClick={() => setTags((current) => current.filter((item) => item !== tag))}
      >
        {tag}
        {/* Adjusted icon to match the black close circle in your mockups */}
        <CircleX size={16} fill="black" stroke="white" />
      </button>
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
       </>
      ) : null}

      {page === "options" ? (
       <div className="widget-disclosure-list">
        <Module title="Audience and restrictions"><Choice type="radio" name={`${mode}-kids`} value="yes" label="Yes, this video is made for kids" checked={madeForKids === "yes"} onChange={() => setMadeForKids("yes")} /><Choice type="radio" name={`${mode}-kids`} value="no" label="No, this video is not made for kids" checked={madeForKids === "no"} onChange={() => setMadeForKids("no")} /></Module>
        <Module title="Disclosures and altered content"><Choice label="Contains paid promotion" checked={paidPromotion} onChange={() => setPaidPromotion((value) => !value)} /><Choice type="radio" name={`${mode}-altered`} value="yes" label="Contains realistic altered or synthetic content" checked={alteredContent === "yes"} onChange={() => setAlteredContent("yes")} /><Choice type="radio" name={`${mode}-altered`} value="no" label="Does not contain realistic altered content" checked={alteredContent === "no"} onChange={() => setAlteredContent("no")} /></Module>
        <Module title="Automatic concepts and chapters"><Choice label="Allow automatic chapters and key moments" checked={autoChapters} onChange={() => setAutoChapters((value) => !value)} /></Module>
        <Module title="Language and captions certification"><div className="widget-control-grid"><Field label="Video language"><PortalSelect value={language} onChange={setLanguage} label="Video language" options={[{ value: "en", label: "English" }, { value: "es", label: "Spanish" }, { value: "fr", label: "French" }, { value: "de", label: "German" }, { value: "none", label: "Not applicable" }]} /></Field><Field label="Caption certification"><PortalSelect value={captionCert} onChange={setCaptionCert} label="Caption certification" options={[{ value: "none", label: "None" }, { value: "neverAired", label: "Never aired on U.S. television" }, { value: "grantedExemption", label: "FCC exemption granted" }]} /></Field></div></Module>
        <Module title="Recording date and location"><div className="widget-control-grid"><Field label="Recording date"><input className="vt-input-standard" type="date" value={recordingDate} onChange={(event) => setRecordingDate(event.target.value)} /></Field><Field label="Video location"><input className="vt-input-standard" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="None" /></Field></div></Module>
        <Module title="License and distribution"><div className="widget-control-grid"><Field label="License"><PortalSelect value={license} onChange={setLicense} label="License" options={[{ value: "youtube", label: "Standard YouTube license" }, { value: "creativeCommon", label: "Creative Commons - Attribution" }]} /></Field></div><Choice label="Allow embedding" checked={allowEmbedding} onChange={() => setAllowEmbedding((value) => !value)} /><Choice label="Notify subscribers" checked={notifySubscribers} onChange={() => setNotifySubscribers((value) => !value)} /></Module>
       </div>
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
     </div>

     {error ? <div className="widget-inline-error" role="alert">{error}</div> : null}
     <footer className="widget-toolbar widget-workflow-toolbar vt-full-bleed-bottom">
      <nav className="widget-workflow-buttons" aria-label={`${mode === "upload" ? "Upload" : "Video manager"} sections`}>
       {tabs.map((tab) => (
        <button key={tab.id} type="button" className={`vt-button ${page === tab.id ? "primary" : ""}`.trim()} aria-pressed={page === tab.id} onClick={() => setPage(tab.id)}>{tab.label}</button>
       ))}
      </nav>
      <button type="button" className="vt-button primary is-primary" disabled={saving} onClick={save}><Save />{saving ? "Saving…" : saved ? (mode === "upload" ? "Published" : "Saved") : (mode === "upload" ? "Publish video" : "Save changes")}</button>
      <button type="button" className="vt-button is-icon-only" onClick={reset} aria-label="Revert changes"><RotateCcw /></button>
     </footer>
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
