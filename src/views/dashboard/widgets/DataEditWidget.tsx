import React, { useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { Pencil, Save, RotateCcw, ChevronDown, ChevronUp } from "lucide-react"
import { fetchVideoSnippetDetails } from "../../../services/youtube/youtubeDataFetcher"

export const DataEditWidget = ({
 widget, instance, editMode, onToggleCollapse, onCycleSize, onRemove, data,
}: any) => {
 const common = { widget, instance, editMode, canEdit: true, onToggleCollapse, onCycleSize, onRemove }
 const videos = data.canonicalRows || []
 const [selectedVideo, setSelectedVideo] = useState("")
 const [videoSearch, setVideoSearch] = useState("")
 const [title, setTitle] = useState("")
 const [description, setDescription] = useState("")
 const [tags, setTags] = useState<string[]>([])
 const [newTag, setNewTag] = useState("")
 const [originalData, setOriginalData] = useState<any>(null)
 const [expandedSection, setExpandedSection] = useState<string | null>("title")
 const [saving, setSaving] = useState(false)
 const [saved, setSaved] = useState(false)

 const handleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  const vidId = e.target.value
  setSelectedVideo(vidId)
  setSaved(false)
  const vid = videos.find((v: any) => v.videoId === vidId)
  const t = vid?.title || ""
  const d = vid?.description || ""
  setTitle(t)
  setDescription(d)
  setOriginalData({ title: t, description: d, tags: [] })
  try {
   const details = await fetchVideoSnippetDetails([vidId])
   const fetched = details[vidId]
   if (fetched) {
    setTags(fetched.tags || [])
    setDescription(fetched.description || d)
    setOriginalData({ title: t, description: fetched.description || d, tags: fetched.tags || [] })
   }
  } catch { setTags([]) }
 }

 const handleSave = async () => {
  setSaving(true)
  // Would call youtube.videos.update here
  await new Promise(r => setTimeout(r, 1000))
  setSaving(false)
  setSaved(true)
  setTimeout(() => setSaved(false), 3000)
 }

 const handleReset = () => {
  if (!originalData) return
  setTitle(originalData.title)
  setDescription(originalData.description)
  setTags(originalData.tags)
 }

 const addTag = () => {
  if (newTag.trim() && !tags.includes(newTag.trim())) {
   setTags(prev => [...prev, newTag.trim()])
   setNewTag("")
  }
 }

 const removeTag = (idx: number) => setTags(prev => prev.filter((_, i) => i !== idx))

 const Section = ({ id, label, color, children }: any) => {
  const isOpen = expandedSection === id
  return (
   <div style={{ border: "2px solid #000", borderRadius: "10px", overflow: "hidden" }}>
    <button onClick={() => setExpandedSection(isOpen ? null : id)} style={{
     width: "100%", height: "32px", background: color, border: "none", borderBottom: isOpen ? "2px solid #000" : "none",
     display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px",
     fontSize: "10px", fontWeight: 1000, textTransform: "uppercase", cursor: "pointer",
    }}>
     {label}
     {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
    {isOpen && <div style={{ padding: "8px" }}>{children}</div>}
   </div>
  )
 }

 return (
  <WidgetShell {...common} icon={<Pencil size={22} />}>
   <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%" }}>
     <div style={{ display: "flex", gap: "4px" }}>
      <select value={selectedVideo} onChange={handleSelect} style={{
       flex: 2, padding: "8px", background: "#fff", border: "2px solid #000", borderRadius: "8px",
       fontSize: "11px", fontWeight: 900, boxShadow: "2px 2px 0 0 rgba(255,131,234,0.4)", outline: "none",
      }}>
       <option value="" disabled>Select a video...</option>
       {videos.slice(0, 15).filter((v: any) => !videoSearch || (v.title || v.videoId)?.toLowerCase().includes(videoSearch.toLowerCase())).map((v: any) => (
        <option key={v.videoId} value={v.videoId}>{v.title || v.videoId}</option>
       ))}
      </select>
      <input value={videoSearch} onChange={(e) => setVideoSearch(e.target.value)} placeholder="Search..." style={{
       flex: 1, padding: "6px 8px", background: "#fff", border: "2px solid #000", borderRadius: "8px",
       fontSize: "10px", fontWeight: 900, outline: "none", boxShadow: "2px 2px 0 0 rgba(0,0,0,0.15)",
      }} />
     </div>

    {selectedVideo ? (
     <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", overflow: "auto" }}>
      <Section id="title" label="Title" color="#FFFF61">
       <input value={title} onChange={(e) => setTitle(e.target.value)} style={{
        width: "100%", padding: "6px 8px", border: "2px solid #000", borderRadius: "6px",
        fontSize: "12px", fontWeight: 700, outline: "none",
       }} />
       <span style={{ fontSize: "8px", fontWeight: 900, opacity: 0.3, marginTop: "4px", display: "block" }}>{title.length}/100 characters</span>
      </Section>
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
         placeholder="New tag..." style={{ flex: 1, padding: "4px 8px", border: "1px solid #000", borderRadius: "6px", fontSize: "10px", outline: "none" }} />
        <button onClick={addTag} style={{ width: "28px", height: "28px", border: "2px solid #000", borderRadius: "6px", background: "#4FFF5B", cursor: "pointer", fontSize: "14px", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
       </div>
      </Section>

      <div style={{ display: "flex", gap: "6px", marginTop: "auto" }}>
       <button onClick={handleSave} disabled={saving} style={{
        flex: 1, height: "32px", background: saved ? "#4FFF5B" : "#C9F830", border: "2px solid #000", borderRadius: "8px",
        fontSize: "10px", fontWeight: 1000, textTransform: "uppercase", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", boxShadow: "2px 2px 0 0 #000",
       }}>
        <Save size={12} /> {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
       </button>
       <button onClick={handleReset} style={{
        width: "32px", height: "32px", border: "2px solid #000", borderRadius: "8px", background: "#fff", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
       }}>
        <RotateCcw size={12} />
       </button>
      </div>
     </div>
    ) : (
     <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed rgba(0,0,0,0.12)", borderRadius: "10px" }}>
      <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", opacity: 0.2 }}>Select a video above to edit metadata</span>
     </div>
    )}
   </div>
  </WidgetShell>
 )
}
