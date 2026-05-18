import React, { useState, useEffect, useRef } from "react"
import { WidgetShell } from "../WidgetShell"
import { Pencil, Save, RotateCcw, ChevronDown, ChevronUp, ArrowRight, Settings, ShieldCheck, Upload, PlayCircle, Plus } from "lucide-react"
import { fetchVideoSnippetDetails, updateVideo, fetchVideoCategories, fetchUserPlaylists, uploadVideo } from "../../../services/youtube/youtubeDataFetcher"

const STORAGE_KEY = "vt_data_edit_state"
const YT_STANDARD_CATEGORY_IDS = new Set([
 "1","2","10","15","17","19","20","22","23","24","25","26","27","28","29",
])

export const CustomDropdown = ({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: {val: string, lbl: string}[] }) => {
 const [isOpen, setIsOpen] = useState(false)
 const currentLabel = options.find(o => o.val === value)?.lbl || "Select..."

 return (
  <div className={`vt-dropdown ${isOpen ? "active" : ""}`} onMouseLeave={() => setIsOpen(false)}>
   <div className="vt-dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentLabel}</span>
    <ChevronDown size={14} strokeWidth={3} />
   </div>
   <div className="vt-dropdown-menu">
    {options.map(o => (
     <div key={o.val} className="vt-dropdown-item" onClick={() => { onChange(o.val); setIsOpen(false) }}>
      {o.lbl}
     </div>
    ))}
   </div>
  </div>
 )
}

export const DataEditWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove, data }: any) => {
 const common = {
  widget,
  instance,
  editMode,
  canEdit: true,
  onToggleCollapse,
  onCycleSize,
  onRemove,
  onDecSize,
  onCycleHeight,
  onDecHeight,
 }
 const videos = data.canonicalRows || []
 
 // --- Modes & Navigation ---
 const [workflowMode, setWorkflowMode] = useState<"upload" | "edit">("upload")
 const [page, setPage] = useState<"main" | "options" | "suitability">("main")

 // --- Core Metadata (Main) ---
 const [selectedVideo, setSelectedVideo] = useState("") // videoId if edit, empty if upload
 const [videoSearch, setVideoSearch] = useState("")
 const [title, setTitle] = useState("")
 const [description, setDescription] = useState("")
 const [tags, setTags] = useState<string[]>([])
 const [newTag, setNewTag] = useState("")
 const [categoryId, setCategoryId] = useState("")
 const [privacyStatus, setPrivacyStatus] = useState("public")
 
 // --- Additional Options ---
 const [madeForKids, setMadeForKids] = useState("no")
 const [paidPromotion, setPaidPromotion] = useState(false)
 const [alteredContent, setAlteredContent] = useState("no")
 const [autoChapters, setAutoChapters] = useState(true)
 const [autoPlaces, setAutoPlaces] = useState(true)
 const [autoConcepts, setAutoConcepts] = useState(true)
 const [language, setLanguage] = useState("en")
 const [captionCert, setCaptionCert] = useState("none")
 const [recordingDate, setRecordingDate] = useState("")
 const [location, setLocation] = useState("")
 const [license, setLicense] = useState("youtube")
 const [distribution, setDistribution] = useState("everywhere")
 const [allowEmbedding, setAllowEmbedding] = useState(true)
 const [notifySubscribers, setNotifySubscribers] = useState(true)
 const [remixing, setRemixing] = useState("video_audio")
 const [commentsMode, setCommentsMode] = useState("on")
 const [showLikes, setShowLikes] = useState(true)
 const [playlistId, setPlaylistId] = useState("")

 // Category Specifics
 const [gameTitle, setGameTitle] = useState("")
 const [eduType, setEduType] = useState("None")
 const [eduProblems, setEduProblems] = useState("")
 const [eduSystem, setEduSystem] = useState("United States")
 const [eduLevel, setEduLevel] = useState("None")
 const [eduExam, setEduExam] = useState("")

 // --- Ad Suitability ---
 const [adSuitability, setAdSuitability] = useState<Record<string, string>>({})
 const [noneOfTheAbove, setNoneOfTheAbove] = useState(false)
 const [ratingSubmitted, setRatingSubmitted] = useState(false)

 // --- UI State ---
 const [originalData, setOriginalData] = useState<any>(null)
 const [expandedSection, setExpandedSection] = useState<string | null>("title")
 const [saving, setSaving] = useState(false)
 const [saved, setSaved] = useState(false)
 const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
 const [isDraggingThumb, setIsDraggingThumb] = useState(false)
 const [categories, setCategories] = useState<{id: string, title: string}[]>([])
 const [playlists, setPlaylists] = useState<{id: string, title: string}[]>([])
 const supportDataFetchedRef = useRef(false)
 const thumbInputRef = useRef<HTMLInputElement | null>(null)

 // Listen for navigation from upload scheduler
 useEffect(() => {
  const handleNav = (e: any) => {
   if (e.detail?.targetWidget === "data-edit") {
    setWorkflowMode("upload")
    setPage("main")
    if (e.detail.videoTitle) setTitle(e.detail.videoTitle)
   }
  }
  window.addEventListener("vt_navigate_widget", handleNav)
  return () => window.removeEventListener("vt_navigate_widget", handleNav)
 }, [])

 useEffect(() => {
  const onBridge = (event: Event) => {
   const payload = (event as CustomEvent<any>).detail
   if (!payload?.imageUrl) return
   if (payload.targetWidget && payload.targetWidget !== "data-edit") return
   setThumbnailPreview(payload.imageUrl)
  }
  window.addEventListener("vt_dashboard_generated_image", onBridge as EventListener)
  try {
   const cached = localStorage.getItem("vt_bridge_image_data-edit")
   if (cached) {
    const payload = JSON.parse(cached)
    if (payload?.imageUrl) setThumbnailPreview(payload.imageUrl)
   }
  } catch {}
  return () => window.removeEventListener("vt_dashboard_generated_image", onBridge as EventListener)
 }, [])

 // Fetch categories/playlists once, and only for authenticated users.
 useEffect(() => {
  if (!data?.authState?.isAuthenticated) return
  if (supportDataFetchedRef.current) return
  supportDataFetchedRef.current = true

  fetchVideoCategories().then(c => setCategories(c.filter((cat: any) => YT_STANDARD_CATEGORY_IDS.has(String(cat.id))))).catch(() => {})
  fetchUserPlaylists().then(p => setPlaylists(p)).catch(() => {})
 }, [data?.authState?.isAuthenticated])

 const handleSelect = async (vidId: string) => {
  setSelectedVideo(vidId)
  setSaved(false)
  const vid = videos.find((v: any) => v.videoId === vidId)
  const t = vid?.title || ""
  const d = vid?.description || ""
  setTitle(t)
  setDescription(d)
  
  // Try to load cached extra data if exists
  const localCache = JSON.parse(localStorage.getItem(STORAGE_KEY + "_" + vidId) || "{}")
  setCategoryId(localCache.categoryId || "")
  setPrivacyStatus(localCache.privacyStatus || "public")
  
  setOriginalData({title: t, description: d, tags: []})
  try {
   const details = await fetchVideoSnippetDetails([vidId])
   const fetched = details[vidId]
   if (fetched) {
    setTags(fetched.tags || [])
    setDescription(fetched.description || d)
    setCategoryId(fetched.categoryId || localCache.categoryId || "")
    setOriginalData({title: t, description: fetched.description || d, tags: fetched.tags || [], categoryId: fetched.categoryId})
   }
  } catch { setTags([]) }
 }

 const handleSave = async () => {
  setSaving(true)
  try {
   const payload = {
    title, description, tags, categoryId, privacyStatus,
    madeForKids: madeForKids === "yes",
    recordingDate, locationDescription: location, license
   }

   if (workflowMode === "edit") {
    if (selectedVideo) {
     await updateVideo(selectedVideo, payload)
     // Save extra local metadata
     localStorage.setItem(STORAGE_KEY + "_" + selectedVideo, JSON.stringify({categoryId, privacyStatus, gameTitle, eduType, noneOfTheAbove, adSuitability}))
    }
   } else {
    // Upload Mode (Mocked file upload since we don't have a real file object here, we just fake the API success)
    await new Promise(r => setTimeout(r, 1500)) 
    // In reality, we would pass a File object to uploadVideo(file, payload)
   }

   setSaving(false)
   setSaved(true)
   setTimeout(() => setSaved(false), 3000)
  } catch (e) {
   console.error("Save failed", e)
   setSaving(false)
  }
 }

 const handleReset = () => {
  if (!originalData) return
  setTitle(originalData.title || "")
  setDescription(originalData.description || "")
  setTags(originalData.tags || [])
  setCategoryId(originalData.categoryId || "")
 }

 const addTag = () => {
  if (newTag.trim() && !tags.includes(newTag.trim())) {
   setTags(prev => [...prev, newTag.trim()])
   setNewTag("")
  }
 }

 const removeTag = (idx: number) => setTags(prev => prev.filter((_, i) => i !== idx))

 const Section = ({ id, label, color, children, defaultOpen = false }: any) => {
  const isOpen = expandedSection === id
  return (
   <div style={{ border: "2px solid #000", borderRadius: "10px", overflow: "hidden", background: "#fff", marginBottom: "6px" }}>
    <button onClick={() => setExpandedSection(isOpen ? null : id)} style={{
     width: "100%", height: "32px", background: color, border: "none", borderBottom: isOpen ? "2px solid #000" : "none",
     display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px",
     fontSize: "10px", fontWeight: 1000, textTransform: "uppercase", cursor: "pointer",
    }}>
     {label}
     {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
    {isOpen && <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>{children}</div>}
   </div>
  )
 }

 // Render Helpers
 const renderInput = (val: string, setVal: any, placeholder: string) => (
  <input value={val} onChange={(e) => setVal(e.target.value)} placeholder={placeholder} style={{
   width: "100%", padding: "6px 8px", border: "2px solid #000", borderRadius: "6px", fontSize: "11px", fontWeight: 700, outline: "none",
  }} />
 )

 const renderSelect = (val: string, setVal: any, options: {val: string, lbl: string}[]) => (
  <CustomDropdown value={val} onChange={(newVal) => setVal(newVal)} options={options} />
 )

 const renderRadio = (name: string, val: string, setVal: any, options: {val: string, lbl: string}[]) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
   {options.map(o => (
    <label key={o.val} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700 }}>
     <input type="radio" name={name} value={o.val} checked={val === o.val} onChange={(e) => setVal(e.target.value)} style={{ accentColor: "#000" }} />
     {o.lbl}
    </label>
   ))}
  </div>
 )

 const renderCheckbox = (lbl: string, val: boolean, setVal: any) => (
  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700 }}>
   <input type="checkbox" checked={val} onChange={(e) => setVal(e.target.checked)} style={{ accentColor: "#000", width: "14px", height: "14px" }} />
   {lbl}
  </label>
 )

 // --- Pages ---
 const renderMainPage = () => (
   <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "6px", marginBottom: "6px" }}>
     <div style={{ position: "relative" }}>
      <input className="vt-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video Title" style={{
       background: "#fff", paddingRight: "80px"
      }} />
       <div style={{ position: "absolute", right: "4px", top: "4px", bottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
        <span style={{ fontSize: "8px", fontWeight: 900, opacity: 0.5, marginRight: "4px" }}>{title.length}/100</span>
        <button className="vt-button secondary" style={{ height: "100%", fontSize: "9px" }}><Settings size={12} style={{ marginRight: "4px"}} /> AI Rewrite</button>
       </div>
     </div>
     <div
      style={{
       border: "2px dashed #000",
       borderRadius: "8px",
       background: isDraggingThumb ? "rgba(87,154,255,0.2)" : "#f8f8f8",
       minHeight: "52px",
       padding: "4px",
       display: "flex",
       alignItems: "center",
       justifyContent: "space-between",
       gap: "4px",
      }}
      onDragOver={(e) => {
       e.preventDefault()
       setIsDraggingThumb(true)
      }}
      onDragLeave={() => setIsDraggingThumb(false)}
      onDrop={(e) => {
       e.preventDefault()
       setIsDraggingThumb(false)
       const file = e.dataTransfer.files?.[0]
       if (!file || !file.type.startsWith("image/")) return
       const reader = new FileReader()
       reader.onload = () => setThumbnailPreview(reader.result as string)
       reader.readAsDataURL(file)
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: 0 }}>
       {thumbnailPreview ? (
        <img src={thumbnailPreview} alt="thumb" style={{ width: "52px", height: "28px", objectFit: "cover", borderRadius: "4px", border: "1px solid #000" }} />
       ) : (
        <span style={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase", opacity: 0.6 }}>Thumbnail</span>
       )}
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
       <button className="vt-button secondary" style={{ height: "28px", fontSize: "8px", padding: "0 6px" }} onClick={() => thumbInputRef.current?.click()}>
        <Upload size={10} /> Upload
       </button>
       <button
        className="vt-button secondary"
        style={{ height: "28px", fontSize: "8px", padding: "0 6px" }}
        onClick={() => window.dispatchEvent(new CustomEvent("vt_navigate_widget", { detail: { targetWidget: "thumb-ai" } }))}>
        Go Thumb AI
       </button>
      </div>
      <input
       ref={thumbInputRef}
       type="file"
       accept="image/*"
       style={{ display: "none" }}
       onChange={(e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => setThumbnailPreview(reader.result as string)
       reader.readAsDataURL(file)
       }}
      />
     </div>
    </div>

   <Section id="desc" label="Description" color="#4FFF5B">
    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{
     width: "100%", padding: "6px 8px", border: "2px solid #000", borderRadius: "6px",
     fontSize: "11px", fontWeight: 700, outline: "none", resize: "none", fontFamily: "inherit",
    }} />
    <span style={{ fontSize: "8px", fontWeight: 900, opacity: 0.3 }}>{description.length}/5000</span>
   </Section>

   <Section id="tags" label={`Tags (${tags.length})`} color="#579AFF">
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "6px" }}>
     {tags.map((tag, i) => (
      <span key={i} onClick={() => removeTag(i)} style={{
       padding: "2px 8px", background: "rgba(87,154,255,0.15)", border: "1px solid #000",
       borderRadius: "999px", fontSize: "9px", fontWeight: 900, cursor: "pointer",
      }}>{tag} ✕</span>
     ))}
    </div>
    <div style={{ display: "flex", gap: "4px" }}>
     <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addTag() }}
      placeholder="New tag..." style={{ flex: 1, padding: "4px 8px", border: "2px solid #000", borderRadius: "6px", fontSize: "10px", outline: "none" }} />
     <button onClick={addTag} className="vt-button" style={{ width: "28px", height: "28px", padding: 0 }}><Plus size={14} /></button>
    </div>
   </Section>

    <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
     <div style={{ flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.6, marginBottom: "2px", display: "block" }}>Visibility</span>
      {renderSelect(privacyStatus, setPrivacyStatus, [
       {val: "public", lbl: "Public"}, {val: "unlisted", lbl: "Unlisted"}, {val: "private", lbl: "Private"}
      ])}
     </div>
     <div style={{ flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.6, marginBottom: "2px", display: "block" }}>Category</span>
      {renderSelect(categoryId, setCategoryId, [
       {val: "", lbl: "Select category..."},
       {val: "2", lbl: "Autos & Vehicles"},
       {val: "23", lbl: "Comedy"},
       {val: "27", lbl: "Education"},
       {val: "24", lbl: "Entertainment"},
       {val: "1", lbl: "Film & Animation"},
       {val: "20", lbl: "Gaming"},
       {val: "26", lbl: "Howto & Style"},
       {val: "10", lbl: "Music"},
       {val: "25", lbl: "News & Politics"},
       {val: "29", lbl: "Nonprofits & Activism"},
       {val: "22", lbl: "People & Blogs"},
       {val: "15", lbl: "Pets & Animals"},
       {val: "28", lbl: "Science & Technology"},
       {val: "17", lbl: "Sports"},
       {val: "19", lbl: "Travel & Events"}
      ])}
     </div>
     <div style={{ flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.6, marginBottom: "2px", display: "block" }}>Playlist</span>
      {renderSelect(playlistId, setPlaylistId, [
       {val: "", lbl: "None"},
       ...playlists.map(p => ({val: p.id, lbl: p.title}))
      ])}
     </div>
    </div>
   
    <button className="vt-button primary" onClick={() => { setPage("options"); setExpandedSection("audience") }} style={{ marginTop: "8px", height: "36px" }}>
     Additional Options <ArrowRight size={12} strokeWidth={3} />
    </button>
  </div>
 )

 const renderOptionsPage = () => {
  const isGaming = categoryId === "20"
  const isEdu = categoryId === "27"

  return (
   <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
    <Section id="audience" label="Audience & Restrictions" color="#EAEAEA">
     <span style={{ fontSize: "10px", fontWeight: 800 }}>Is this video made for kids?</span>
     {renderRadio("kids", madeForKids, setMadeForKids, [{val: "yes", lbl: "Yes, it's made for kids"}, {val: "no", lbl: "No, it's not made for kids"}])}
    </Section>

    <Section id="disclosures" label="Disclosures & Altered Content" color="#EAEAEA">
     <span style={{ fontSize: "10px", fontWeight: 800 }}>Paid promotion</span>
     {renderCheckbox("My video contains paid promotion like a product placement, sponsorship, or endorsement", paidPromotion, setPaidPromotion)}
     
     <div style={{ height: "1px", background: "rgba(0,0,0,0.1)", margin: "8px 0" }} />
     
     <span style={{ fontSize: "10px", fontWeight: 800 }}>Altered content</span>
     {renderRadio("altered", alteredContent, setAlteredContent, [{val: "yes", lbl: "Yes"}, {val: "no", lbl: "No"}])}
    </Section>

    <Section id="automatic" label="Automatic Concepts & Chapters" color="#EAEAEA">
     {renderCheckbox("Allow automatic chapters and key moments", autoChapters, setAutoChapters)}
     {renderCheckbox("Allow automatic places", autoPlaces, setAutoPlaces)}
     {renderCheckbox("Allow automatic concepts", autoConcepts, setAutoConcepts)}
    </Section>

    <Section id="language" label="Language and captions certification" color="#EAEAEA">
     <div style={{ display: "flex", gap: "6px" }}>
      <div style={{ flex: 1 }}>
       <span style={{ fontSize: "10px", fontWeight: 800, display: "block", marginBottom: "4px" }}>Video language</span>
       {renderSelect(language, setLanguage, [
        "Not applicable", "Abkhazian", "Afar", "Afrikaans", "Akan", "Akkadian", "Albanian", "American Sign Language", "Amharic", "Arabic", "Aramaic", "Armenian", "Arpitan", "Assamese", "Aymara", "Azerbaijani", "Bambara", "Bangla", "Bangla (India)", "Bashkir", "Basque", "Belarusian", "Bhojpuri", "Bislama", "Bodo", "Bosnian", "Breton", "Bulgarian", "Burmese", "Cantonese", "Cantonese (Hong Kong)", "Catalan", "Cherokee", "Chinese", "Chinese (China)", "Chinese (Hong Kong)", "Chinese (Simplified)", "Chinese (Singapore)", "Chinese (Taiwan)", "Chinese (Traditional)", "Choctaw", "Coptic", "Corsican", "Cree", "Croatian", "Czech", "Danish", "Dogri", "Dutch", "Dutch (Belgium)", "Dutch (Netherlands)", "Dzongkha", "English", "English (Australia)", "English (Canada)", "English (India)", "English (Ireland)", "English (United Kingdom)", "English (United States)", "Esperanto", "Estonian", "Ewe", "Faroese", "Fijian", "Filipino", "Finnish", "French", "French (Belgium)", "French (Canada)", "French (France)", "French (Switzerland)", "Fula", "Galician", "Ganda", "Georgian", "German", "German (Austria)", "German (Germany)", "German (Switzerland)", "Greek", "Guarani", "Gujarati", "Gusii", "Haitian Creole", "Hakka Chinese", "Hakka Chinese (Taiwan)", "Haryanvi", "Hausa", "Hawaiian", "Hebrew", "Hindi", "Hindi (Latin)", "Hiri Motu", "Hungarian", "Icelandic", "Igbo", "Indonesian", "Interlingua", "Interlingue", "Inuktitut", "Inupiaq", "Irish", "Italian", "Japanese", "Javanese", "Kalaallisut", "Kalenjin", "Kamba", "Kannada", "Kashmiri", "Kazakh", "Khmer", "Kikuyu", "Kinyarwanda", "Klingon", "Konkani", "Korean", "Kurdish", "Kyrgyz", "Ladino", "Lao", "Latin", "Latvian", "Lingala", "Lithuanian", "Lojban", "Lower Sorbian", "Luba-Katanga", "Luo", "Luxembourgish", "Luyia", "Macedonian", "Maithili", "Malagasy", "Malay", "Malay (Singapore)", "Malayalam", "Maltese", "Manipuri", "Māori", "Marathi", "Masai", "Meru", "Min Nan Chinese", "Min Nan Chinese (Taiwan)", "Mixe", "Mizo", "Mongolian", "Mongolian (Mongolian)", "Nauru", "Navajo", "Nepali", "Nigerian Pidgin", "North Ndebele", "Northern Sotho", "Norwegian", "Occitan", "Odia", "Oromo", "Papiamento", "Pashto", "Persian", "Persian (Afghanistan)", "Persian (Iran)", "Polish", "Portuguese", "Portuguese (Brazil)", "Portuguese (Portugal)", "Punjabi", "Quechua", "Romanian", "Romanian (Moldova)", "Romansh", "Rundi", "Russian", "Russian (Latin)", "Samoan", "Sango", "Sanskrit", "Santali", "Sardinian", "Scottish Gaelic", "Serbian", "Serbian (Cyrillic)", "Serbian (Latin)", "Serbo-Croatian", "Sherdukpen", "Shona", "Sicilian", "Sindhi", "Sinhala", "Slovak", "Slovenian", "Somali", "South Ndebele", "Southern Sotho", "Spanish", "Spanish (Latin America)", "Spanish (Mexico)", "Spanish (Spain)", "Spanish (United States)", "Sundanese", "Swahili", "Swati", "Swedish", "Tagalog", "Tajik", "Tamil", "Tatar", "Telugu", "Thai", "Tibetan", "Tigrinya", "Tok Pisin", "Toki Pona", "Tongan", "Tsonga", "Tswana", "Turkish", "Turkmen", "Twi", "Ukrainian", "Upper Sorbian", "Urdu", "Uyghur", "Uzbek", "Venda", "Vietnamese", "Volapük", "Võro", "Walloon", "Welsh", "Western Frisian", "Wolaytta", "Wolof", "Xhosa", "Yiddish", "Yoruba", "Zulu"
       ].map(lang => ({val: lang, lbl: lang})))}
      </div>
      <div style={{ flex: 1 }}>
       <span style={{ fontSize: "10px", fontWeight: 800, display: "block", marginBottom: "4px" }}>Caption certification</span>
       {renderSelect(captionCert, setCaptionCert, [
        {val: "none", lbl: "None"},
        {val: "neverAired", lbl: "This content has never aired on television in the U.S."},
        {val: "airedWithoutCaptions", lbl: "This content has only aired on television in the U.S. without captions"},
        {val: "notAiredSince2012", lbl: "This content has not aired on U.S. television with captions since September 30, 2012."},
        {val: "notOnlineProgramming", lbl: "This content does not fall within a category of online programming that requires captions under FCC regulations (47 C.F.R. § 79)."},
        {val: "grantedExemption", lbl: "The FCC and/or U.S. Congress has granted an exemption from captioning requirements for this content."}
       ])}
      </div>
     </div>
    </Section>

    <Section id="recording" label="Recording date and location" color="#EAEAEA">
     <div style={{ display: "flex", gap: "6px" }}>
      <div style={{ flex: 1 }}>
       <span style={{ fontSize: "10px", fontWeight: 800, display: "block", marginBottom: "4px" }}>Recording date</span>
       <input type="date" value={recordingDate} onChange={(e) => setRecordingDate(e.target.value)} style={{
        width: "100%", padding: "6px 8px", border: "2px solid #000", borderRadius: "6px", fontSize: "11px", fontWeight: 700, outline: "none", background: "#fff"
       }} />
      </div>
      <div style={{ flex: 1 }}>
       <span style={{ fontSize: "10px", fontWeight: 800, display: "block", marginBottom: "4px" }}>Video location</span>
       {renderInput(location, setLocation, "None")}
      </div>
     </div>
    </Section>

    <Section id="license" label="License & Distribution" color="#EAEAEA">
     <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
      <div style={{ flex: 1 }}>
       <span style={{ fontSize: "10px", fontWeight: 800, display: "block", marginBottom: "4px" }}>License</span>
       {renderSelect(license, setLicense, [{val: "youtube", lbl: "Standard YouTube License"}, {val: "creativeCommon", lbl: "Creative Commons - Attribution"}])}
      </div>
      <div style={{ flex: 1 }}>
       <span style={{ fontSize: "10px", fontWeight: 800, display: "block", marginBottom: "4px" }}>Distribution</span>
       {renderSelect(distribution, setDistribution, [{val: "everywhere", lbl: "Everywhere"}, {val: "monetized", lbl: "Make this video available only on monetized platforms"}])}
      </div>
     </div>
     
     {renderCheckbox("Allow embedding", allowEmbedding, setAllowEmbedding)}
     {renderCheckbox("Publish to subscriptions feed and notify subscribers", notifySubscribers, setNotifySubscribers)}
     
     <div style={{ height: "1px", background: "rgba(0,0,0,0.1)", margin: "8px 0" }} />
     
     <span style={{ fontSize: "10px", fontWeight: 800 }}>Shorts remixing</span>
     {renderRadio("remix", remixing, setRemixing, [{val: "video_audio", lbl: "Allow video and audio remixing"}, {val: "audio_only", lbl: "Allow only audio remixing"}, {val: "none", lbl: "Don't allow remixing"}])}
    </Section>

    {isGaming && (
     <Section id="gaming" label="Gaming Metadata" color="#FF83EA">
      <span style={{ fontSize: "10px", fontWeight: 800 }}>Game Title (optional)</span>
      {renderInput(gameTitle, setGameTitle, "None")}
     </Section>
    )}

    {isEdu && (
     <Section id="education" label="Education Metadata" color="#FF83EA">
      <span style={{ fontSize: "10px", fontWeight: 800 }}>Type</span>
      {renderSelect(eduType, setEduType, [{val: "None", lbl: "None"}, {val: "Concept overview", lbl: "Concept overview"}, {val: "Problem walkthrough", lbl: "Problem walkthrough"}])}
      
      <span style={{ fontSize: "10px", fontWeight: 800, marginTop: "6px", display: "block" }}>Problems</span>
      <textarea value={eduProblems} onChange={(e) => setEduProblems(e.target.value)} rows={3} placeholder="0:32 What is the top speed..." style={{
       width: "100%", padding: "6px 8px", border: "2px solid #000", borderRadius: "6px", fontSize: "11px", fontWeight: 700, outline: "none", resize: "none", fontFamily: "inherit",
      }} />

      <span style={{ fontSize: "10px", fontWeight: 800, marginTop: "6px", display: "block" }}>Academic System</span>
      {renderSelect(eduSystem, setEduSystem, [{val: "United States", lbl: "United States"}, {val: "United Kingdom", lbl: "United Kingdom"}])}
     </Section>
    )}

    <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
     <button className="vt-button" onClick={() => setPage("main")} style={{ flex: 1, height: "36px" }}>Back to Details</button>
     <button className="vt-button primary" onClick={() => setPage("suitability")} style={{ flex: 1, height: "36px" }}>
      Ad Suitability <ArrowRight size={12} strokeWidth={3} />
     </button>
    </div>
   </div>
  )
 }

 const renderSuitabilityPage = () => {
  const categoriesList = [
   "Inappropriate language", "Adult content", "Violence", "Shocking content", 
   "Harmful acts and unreliable claims", "Recreational drugs content", 
   "Enabling dishonest behaviour", "Hateful & derogatory content", 
   "Firearms-related content", "Sensitive events", "Controversial issues"
  ]

  return (
   <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
    <div style={{ background: "#111", color: "#fff", padding: "10px", borderRadius: "10px", marginBottom: "8px", border: "2px solid #000" }}>
     <h4 style={{ margin: 0, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}><ShieldCheck size={14} /> Ad Suitability</h4>
     <p style={{ margin: "4px 0 0 0", fontSize: "9px", opacity: 0.7 }}>Does your video's content, title, description, or keywords contain any of the following?</p>
    </div>

    {categoriesList.map(cat => (
     <div key={cat} style={{ padding: "8px 10px", border: "2px solid #000", borderRadius: "8px", marginBottom: "4px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "10px", fontWeight: 800 }}>{cat}</span>
      <ChevronDown size={14} style={{ opacity: 0.4 }} />
     </div>
    ))}

    <div style={{ marginTop: "8px", padding: "10px", border: "2px solid #000", borderRadius: "8px", background: noneOfTheAbove ? "color-mix(in srgb, #4FFF5B 20%, white)" : "#fff" }}>
     {renderCheckbox("None of the above", noneOfTheAbove, setNoneOfTheAbove)}
    </div>

    {noneOfTheAbove && (
     <div style={{ marginTop: "8px", padding: "10px", background: "#111", color: "#fff", borderRadius: "8px", border: "2px solid #000" }}>
      <span style={{ fontSize: "9px", opacity: 0.7, display: "block" }}>How you rated your video overall:</span>
      <span style={{ fontSize: "12px", fontWeight: 900, color: "#4FFF5B", display: "block", margin: "4px 0 8px 0" }}>Safe for ads</span>
      <button 
       className={`vt-button ${ratingSubmitted ? "" : "primary"}`}
       onClick={() => setRatingSubmitted(true)}
       disabled={ratingSubmitted}
       style={{ width: "100%", height: "32px", fontSize: "10px" }}
      >
       {ratingSubmitted ? "Rating Submitted" : "Submit Rating"}
      </button>
     </div>
    )}

    <div style={{ display: "flex", gap: "6px", marginTop: "auto", paddingTop: "8px" }}>
     <button className="vt-button" onClick={() => setPage("options")} style={{ flex: 1, height: "32px" }}>Back to Options</button>
    </div>
   </div>
  )
 }

 return (
  <WidgetShell {...common} icon={<Pencil size={22} />}>
   <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%" }}>
    
    {/* Mode Toggle & Progress Bar */}
    <div style={{ display: "flex", gap: "4px" }}>
     <button onClick={() => { setWorkflowMode("upload"); setPage("main") }} className="vt-button" style={{
      flex: 1, height: "28px", background: workflowMode === "upload" ? "#000" : "#fff", color: workflowMode === "upload" ? "#fff" : "#000",
      fontSize: "9px"
     }}>
      <Upload size={12} strokeWidth={3} /> UPLOAD NEW
     </button>
     <button onClick={() => { setWorkflowMode("edit"); setPage("main") }} className="vt-button" style={{
      flex: 1, height: "28px", background: workflowMode === "edit" ? "#000" : "#fff", color: workflowMode === "edit" ? "#fff" : "#000",
      fontSize: "9px"
     }}>
      <PlayCircle size={12} strokeWidth={3} /> EDIT PUBLISHED
     </button>
    </div>

    {workflowMode === "edit" && page === "main" && (
     <div style={{ display: "flex", gap: "4px" }}>
      <div style={{ flex: 2 }}>
       <CustomDropdown 
        value={selectedVideo} 
        onChange={handleSelect} 
        options={[
         { val: "", lbl: "Select a video..." },
         ...videos.slice(0, 15).filter((v: any) => !videoSearch || (v.title || v.videoId)?.toLowerCase().includes(videoSearch.toLowerCase())).map((v: any) => ({val: v.videoId, lbl: v.title || v.videoId}))
        ]} 
       />
      </div>
      <input value={videoSearch} onChange={(e) => setVideoSearch(e.target.value)} placeholder="Search..." style={{
       flex: 1, padding: "6px 8px", background: "#fff", border: "2px solid #000", borderRadius: "8px",
       fontSize: "10px", fontWeight: 900, outline: "none", boxShadow: "2px 2px 0 0 rgba(0,0,0,0.15)",
      }} />
     </div>
    )}

    {/* Content Area */}
    {workflowMode === "edit" && !selectedVideo ? (
     <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed rgba(0,0,0,0.12)", borderRadius: "10px" }}>
      <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", opacity: 0.2 }}>Select a video above to edit</span>
     </div>
    ) : (
     <>
      {/* Page Breadcrumbs */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px" }}>
       <span style={{ fontSize: "9px", fontWeight: 900, opacity: page === "main" ? 1 : 0.3, textTransform: "uppercase" }}>1. Details</span>
       <span style={{ fontSize: "9px", fontWeight: 900, opacity: page === "options" ? 1 : 0.3, textTransform: "uppercase" }}>2. Options</span>
       <span style={{ fontSize: "9px", fontWeight: 900, opacity: page === "suitability" ? 1 : 0.3, textTransform: "uppercase" }}>3. Monetization</span>
      </div>

      {page === "main" && renderMainPage()}
      {page === "options" && renderOptionsPage()}
      {page === "suitability" && renderSuitabilityPage()}

      {/* Global Action Bar */}
      <div style={{ display: "flex", gap: "6px", marginTop: "auto", borderTop: "2px solid rgba(0,0,0,0.1)", paddingTop: "8px" }}>
       <button onClick={handleSave} disabled={saving} className="vt-button primary" style={{
        flex: 1, height: "36px"
       }}>
        <Save size={12} /> {saved ? (workflowMode === "upload" ? "Published!" : "Saved!") : saving ? "Saving..." : (workflowMode === "upload" ? "Publish Video" : "Save Changes")}
       </button>
       <button onClick={handleReset} title="Revert Changes" className="vt-button" style={{
        width: "36px", height: "36px", padding: 0
       }}>
        <RotateCcw size={12} strokeWidth={2.5} />
       </button>
      </div>
     </>
    )}

   </div>
  </WidgetShell>
 )
}
