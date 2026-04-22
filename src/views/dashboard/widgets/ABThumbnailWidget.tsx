import React, { useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { Images, Upload, Sparkles } from "lucide-react"

export const ABThumbnailWidget = ({
 widget, instance, editMode, onToggleCollapse, onCycleSize, onRemove, data,
}: any) => {
 const common = { widget, instance, editMode, canEdit: true, onToggleCollapse, onCycleSize, onRemove }
 const [variants, setVariants] = useState([
  { label: "A", image: null as string | null, title: "", score: 0 },
  { label: "B", image: null as string | null, title: "", score: 0 },
  { label: "C", image: null as string | null, title: "", score: 0 },
 ])
 const [analyzing, setAnalyzing] = useState(false)

 const handleUpload = (idx: number, file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
   setVariants(prev => prev.map((v, i) => i === idx ? { ...v, image: e.target?.result as string } : v))
  }
  reader.readAsDataURL(file)
 }

 const analyzeThumbnails = async () => {
  setAnalyzing(true)
  // Simulate AI scoring (replace with Gemini vision API)
  await new Promise(r => setTimeout(r, 1500))
  setVariants(prev => prev.map(v => ({
   ...v,
   score: v.image ? Math.round(30 + Math.random() * 65) : 0,
  })))
  setAnalyzing(false)
 }

 const bestIdx = variants.reduce((best, v, i) => v.score > variants[best].score ? i : best, 0)

 return (
  <WidgetShell {...common} icon={<Images size={22} />}>
   <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%" }}>
    <div style={{ display: "flex", gap: "8px", flex: 1 }}>
     {variants.map((v, idx) => (
      <div key={v.label} style={{
       flex: 1, display: "flex", flexDirection: "column", gap: "4px",
       background: "#fff", border: "2px solid #000", borderRadius: "10px",
       padding: "6px", boxShadow: "2px 2px 0 0 #000",
      }}>
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12px", fontWeight: 1000 }}>Variant {v.label}</span>
        {v.score > 0 && idx === bestIdx && (
         <span style={{ fontSize: "7px", fontWeight: 900, background: "#C9F830", border: "1px solid #000", borderRadius: "4px", padding: "1px 4px", textTransform: "uppercase" }}>AI Favored</span>
        )}
       </div>
       {/* Image Drop Zone */}
       <label style={{
        width: "100%", aspectRatio: "16/9", border: v.image ? "2px solid #000" : "2px dashed #999",
        borderRadius: "8px", background: v.image ? "transparent" : "#f5f5f5",
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        overflow: "hidden", position: "relative",
       }}>
        {v.image ? (
         <img src={v.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <Upload size={16} opacity={0.3} />
          <span style={{ fontSize: "7px", fontWeight: 900, textTransform: "uppercase", opacity: 0.3 }}>Drop {v.label}</span>
         </div>
        )}
        <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleUpload(idx, e.target.files[0]) }} style={{ display: "none" }} />
       </label>
       {/* Title Input */}
       <input
        value={v.title}
        onChange={(e) => setVariants(prev => prev.map((p, i) => i === idx ? { ...p, title: e.target.value } : p))}
        placeholder={`Title ${v.label}...`}
        style={{ width: "100%", padding: "4px 6px", border: "1px solid #000", borderRadius: "4px", fontSize: "9px", fontWeight: 700, outline: "none" }}
       />
       {/* Score Bar */}
       {v.score > 0 && (
        <div style={{ width: "100%", height: "10px", background: "#eee", borderRadius: "5px", border: "1px solid #000", overflow: "hidden", position: "relative" }}>
         <div style={{ height: "100%", width: `${v.score}%`, background: "linear-gradient(90deg, #FF7497, #FFE357, #C9F830)", borderRadius: "4px" }} />
         <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "7px", fontWeight: 1000, mixBlendMode: "difference", color: "#fff" }}>CTR: {(v.score / 10).toFixed(1)}%</span>
        </div>
       )}
      </div>
     ))}
    </div>
    <button
     onClick={analyzeThumbnails}
     disabled={analyzing || !variants.some(v => v.image)}
     style={{
      height: "36px", border: "2px solid #000", borderRadius: "10px",
      background: analyzing ? "#eee" : "#24D3FF", fontSize: "10px", fontWeight: 1000,
      textTransform: "uppercase", cursor: analyzing ? "wait" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
      boxShadow: "3px 3px 0 0 #000",
     }}>
     <Sparkles size={14} /> {analyzing ? "Analyzing..." : "Predict CTR"}
    </button>
   </div>
  </WidgetShell>
 )
}
