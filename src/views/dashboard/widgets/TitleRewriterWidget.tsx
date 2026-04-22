import React, { useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { Type, Sparkles, Copy, Check, RefreshCw } from "lucide-react"

const STYLE_PRESETS = [
 { label: "Mr Beast", emoji: "🤯", desc: "Extreme, numbers-heavy" },
 { label: "Educational", emoji: "📚", desc: "Clear, value-forward" },
 { label: "Storytelling", emoji: "📖", desc: "Narrative hooks" },
 { label: "Curiosity", emoji: "❓", desc: "Gap/intrigue-based" },
]

export const TitleRewriterWidget = ({
 widget, instance, editMode, onToggleCollapse, onCycleSize, onRemove, data,
}: any) => {
 const common = { widget, instance, editMode, canEdit: true, onToggleCollapse, onCycleSize, onRemove }
 const videos = data.canonicalRows || []
 const [selectedVideo, setSelectedVideo] = useState("")
 const [originalTitle, setOriginalTitle] = useState("")
 const [style, setStyle] = useState(0)
 const [alternatives, setAlternatives] = useState<{ title: string; score: number }[]>([])
 const [generating, setGenerating] = useState(false)
 const [copiedIdx, setCopiedIdx] = useState(-1)
 const [videoSearch, setVideoSearch] = useState("")

 const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const vidId = e.target.value
  setSelectedVideo(vidId)
  setAlternatives([])
  const vid = videos.find((v: any) => v.videoId === vidId)
  setOriginalTitle(vid?.title || "")
 }

 const generate = async () => {
  setGenerating(true)
  try {
   const { rewriteTitle } = await import("../../../services/gemini")
   const results = await rewriteTitle(originalTitle, STYLE_PRESETS[style].label, brain)
   setAlternatives(results)
  } catch {
   // Fallback
   setAlternatives([
    { title: `${originalTitle} (That Nobody Expected)`, score: 82 },
    { title: `I Tested ${originalTitle} — Here's What Happened`, score: 78 },
    { title: `The Truth About ${originalTitle.split(" ").slice(0, 4).join(" ")}...`, score: 74 },
    { title: `Why ${originalTitle} Changes Everything`, score: 70 },
    { title: `${originalTitle} — The Ultimate Breakdown`, score: 66 },
   ])
  }
  setGenerating(false)
 }

 const copyTitle = (idx: number) => {
  navigator.clipboard.writeText(alternatives[idx].title)
  setCopiedIdx(idx)
  setTimeout(() => setCopiedIdx(-1), 2000)
 }

 return (
  <WidgetShell {...common} icon={<Type size={22} />}>
   <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%" }}>
    <div style={{ display: "flex", gap: "4px" }}>
     <select value={selectedVideo} onChange={handleSelect} style={{
      flex: 2, padding: "6px 8px", background: "#fff", border: "2px solid #000", borderRadius: "8px",
      fontSize: "11px", fontWeight: 900, outline: "none", boxShadow: "2px 2px 0 0 #000",
     }}>
      <option value="" disabled>Select a video...</option>
      {videos.slice(0, 15).filter((v: any) => !videoSearch || v.title?.toLowerCase().includes(videoSearch.toLowerCase())).map((v: any) => (
       <option key={v.videoId} value={v.videoId}>{v.title}</option>
      ))}
     </select>
     <input value={videoSearch} onChange={(e) => setVideoSearch(e.target.value)} placeholder="Search..." style={{
      flex: 1, padding: "6px 8px", background: "#fff", border: "2px solid #000", borderRadius: "8px",
      fontSize: "10px", fontWeight: 900, outline: "none", boxShadow: "2px 2px 0 0 rgba(0,0,0,0.15)",
     }} />
    </div>

    {selectedVideo && (
     <>
      {/* Style Selector */}
      <div style={{ display: "flex", gap: "4px" }}>
       {STYLE_PRESETS.map((s, i) => (
        <button key={i} onClick={() => setStyle(i)} style={{
         flex: 1, padding: "4px", border: style === i ? "2px solid #000" : "2px solid transparent",
         borderRadius: "6px", background: style === i ? "#FFE357" : "#f5f5f5",
         fontSize: "8px", fontWeight: 900, cursor: "pointer", textAlign: "center",
         boxShadow: style === i ? "1px 1px 0 0 #000" : "none",
        }}>
         <div>{s.emoji}</div>
         <div style={{ textTransform: "uppercase" }}>{s.label}</div>
        </button>
       ))}
      </div>

      <button onClick={generate} disabled={generating} style={{
       height: "32px", border: "2px solid #000", borderRadius: "8px",
       background: "#FF83EA", fontSize: "10px", fontWeight: 1000, textTransform: "uppercase",
       cursor: generating ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
       boxShadow: "2px 2px 0 0 #000",
      }}>
       {generating ? <RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={12} />}
       {generating ? "Rewriting..." : "Generate 5 Titles"}
      </button>

      {/* Results */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", overflow: "auto" }}>
       {alternatives.map((alt, i) => (
        <div key={i} style={{
         display: "flex", alignItems: "center", gap: "6px", padding: "6px 8px",
         background: "#fff", border: "2px solid #000", borderRadius: "8px",
         boxShadow: i === 0 ? "2px 2px 0 0 rgba(79,255,91,0.5)" : "none",
        }}>
         <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: alt.score >= 75 ? "#4FFF5B" : alt.score >= 60 ? "#FFE357" : "#FF8AAF", border: "1px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 1000, flexShrink: 0 }}>
          {alt.score}
         </div>
         <span style={{ flex: 1, fontSize: "11px", fontWeight: 700, lineHeight: 1.3 }}>{alt.title}</span>
         <button onClick={() => copyTitle(i)} style={{
          width: "24px", height: "24px", border: "1px solid #000", borderRadius: "4px",
          background: copiedIdx === i ? "#4FFF5B" : "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
         }}>
          {copiedIdx === i ? <Check size={12} /> : <Copy size={12} />}
         </button>
        </div>
       ))}
      </div>
     </>
    )}
   </div>
  </WidgetShell>
 )
}
