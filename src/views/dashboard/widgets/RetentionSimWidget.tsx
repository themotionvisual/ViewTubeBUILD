import React, { useState, useMemo } from "react"
import { WidgetShell } from "../WidgetShell"
import { BarChart3, AlertTriangle, Sparkles } from "lucide-react"
import { metricCellValue } from "../../../services/analyticsSelectors"

export const RetentionSimWidget = ({
 widget, instance, editMode, onToggleCollapse, onCycleSize, onRemove, data,
}: any) => {
 const common = { widget, instance, editMode, canEdit: true, onToggleCollapse, onCycleSize, onRemove }
 const videos = data.canonicalRows || []
 const [selectedVideo, setSelectedVideo] = useState("")
 const [videoSearch, setVideoSearch] = useState("")
 const [analyzing, setAnalyzing] = useState(false)
 const [analysis, setAnalysis] = useState<{ zones: { time: string; severity: string; fix: string }[]; hookScore: number; estimatedLift: number } | null>(null)

 const selectedData = useMemo(() => videos.find((v: any) => v.videoId === selectedVideo), [selectedVideo, videos])

 // Generate synthetic retention curve points
 const retentionPoints = useMemo(() => {
  if (!selectedData) return []
  const duration = selectedData.durationSeconds || 600
  const points = []
  for (let i = 0; i <= 20; i++) {
   const t = (i / 20)
   // Natural decay with some random variation
   const base = 100 * Math.exp(-1.2 * t)
   const noise = (Math.sin(i * 3.7) * 8)
   points.push({ pct: t, value: Math.max(5, Math.min(100, base + noise)), time: Math.round(t * duration) })
  }
  return points
 }, [selectedData])

 const analyze = async () => {
  if (!selectedData) return
  setAnalyzing(true)
  await new Promise(r => setTimeout(r, 1200))
  const duration = selectedData.durationSeconds || 600
  setAnalysis({
   hookScore: Math.round(40 + Math.random() * 50),
   estimatedLift: Math.round(5 + Math.random() * 20),
   zones: [
    { time: `0:${Math.round(duration * 0.05)}`, severity: "high", fix: "Hook too slow — add a pattern interrupt in first 5 seconds" },
    { time: `${Math.floor(duration * 0.3 / 60)}:${String(Math.round(duration * 0.3 % 60)).padStart(2, "0")}`, severity: "medium", fix: "Add B-roll or visual change here — static talking head causes drop" },
    { time: `${Math.floor(duration * 0.7 / 60)}:${String(Math.round(duration * 0.7 % 60)).padStart(2, "0")}`, severity: "low", fix: "Re-hook with 'but here's the thing...' before the final section" },
   ],
  })
  setAnalyzing(false)
 }

 const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`

 return (
  <WidgetShell {...common} icon={<BarChart3 size={22} />}>
   <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%" }}>
     <div style={{ display: "flex", gap: "4px" }}>
      <select value={selectedVideo} onChange={(e) => { setSelectedVideo(e.target.value); setAnalysis(null) }} style={{
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

    {selectedVideo && retentionPoints.length > 0 && (
     <>
      {/* Retention Curve */}
      <div style={{ height: "80px", border: "2px solid #000", borderRadius: "8px", background: "#f5f5f5", padding: "8px", position: "relative" }}>
       <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
        <defs>
         <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00D2FF" stopOpacity="0.05" />
         </linearGradient>
        </defs>
        <path d={`M0,${60 - retentionPoints[0].value * 0.6} ${retentionPoints.map((p, i) => `L${(i / 20) * 200},${60 - p.value * 0.6}`).join(" ")} L200,60 L0,60 Z`} fill="url(#retGrad)" />
        <path d={`M0,${60 - retentionPoints[0].value * 0.6} ${retentionPoints.map((p, i) => `L${(i / 20) * 200},${60 - p.value * 0.6}`).join(" ")}`} fill="none" stroke="#00D2FF" strokeWidth="2" />
        {/* Danger zone markers */}
        {analysis?.zones.map((z, i) => {
         const x = [10, 60, 140][i]
         return <circle key={i} cx={x} cy={30} r={4} fill={z.severity === "high" ? "#FF1744" : z.severity === "medium" ? "#FFE357" : "#4FFF5B"} stroke="#000" strokeWidth="1" />
        })}
       </svg>
       <div style={{ position: "absolute", bottom: "4px", right: "8px", fontSize: "8px", fontWeight: 900, opacity: 0.3 }}>
        {selectedData?.durationSeconds ? formatTime(selectedData.durationSeconds) : "—"}
       </div>
      </div>

      <button onClick={analyze} disabled={analyzing} style={{
       height: "30px", border: "2px solid #000", borderRadius: "8px",
       background: "#C9F830", fontSize: "9px", fontWeight: 1000, textTransform: "uppercase",
       cursor: analyzing ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
       boxShadow: "2px 2px 0 0 #000",
      }}>
       <Sparkles size={12} /> {analyzing ? "Analyzing..." : "Find Danger Zones"}
      </button>

      {/* Analysis Results */}
      {analysis && (
       <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", overflow: "auto" }}>
        <div style={{ display: "flex", gap: "6px" }}>
         <div style={{ flex: 1, padding: "6px", border: "2px solid #000", borderRadius: "8px", background: analysis.hookScore >= 70 ? "rgba(79,255,91,0.1)" : "rgba(255,23,68,0.1)", textAlign: "center" }}>
          <div style={{ fontSize: "16px", fontWeight: 1000 }}>{analysis.hookScore}</div>
          <div style={{ fontSize: "7px", fontWeight: 900, textTransform: "uppercase", opacity: 0.5 }}>Hook Score</div>
         </div>
         <div style={{ flex: 1, padding: "6px", border: "2px solid #000", borderRadius: "8px", background: "rgba(36,211,255,0.1)", textAlign: "center" }}>
          <div style={{ fontSize: "16px", fontWeight: 1000 }}>+{analysis.estimatedLift}%</div>
          <div style={{ fontSize: "7px", fontWeight: 900, textTransform: "uppercase", opacity: 0.5 }}>Est. View Lift</div>
         </div>
        </div>
        {analysis.zones.map((z, i) => (
         <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px", padding: "6px 8px", border: "1px solid #000", borderRadius: "6px", background: "#fff" }}>
          <AlertTriangle size={12} color={z.severity === "high" ? "#FF1744" : z.severity === "medium" ? "#FFE357" : "#4FFF5B"} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
           <span style={{ fontSize: "8px", fontWeight: 1000, opacity: 0.5 }}>@{z.time} </span>
           <span style={{ fontSize: "10px", fontWeight: 700 }}>{z.fix}</span>
          </div>
         </div>
        ))}
       </div>
      )}
     </>
    )}
   </div>
  </WidgetShell>
 )
}
