import React, { useState, useMemo, useEffect, useRef } from "react"
import { WidgetShell } from "../WidgetShell"
import { BarChart3, AlertTriangle, Sparkles, Upload } from "lucide-react"
import { CustomDropdown } from "./DataEditWidget"
import { compressMediaForAnalysis } from "../../../services/analysisCompression"

const STORAGE_KEY = "vt_retention_reports"

export const RetentionSimWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onCycleHeight, onDecHeight, onDecSize, onRemove, data }: any) => {
 const common = {
  widget,
  instance,
  editMode,
  canEdit: true,
  onToggleCollapse,
  onCycleSize,
  onCycleHeight,
  onDecHeight,
  onRemove,
  onDecSize,
  onCycleHeight,
  onDecHeight,
 }
 const videos = data.canonicalRows || []
 const [syntheticVideos, setSyntheticVideos] = useState<any[]>([])
 const [selectedVideo, setSelectedVideo] = useState("")
 const [videoSearch, setVideoSearch] = useState("")
 const [analyzing, setAnalyzing] = useState(false)
 const [savedReports, setSavedReports] = useState<Record<string, any>>(() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") } catch { return {} }
 })
 const [analysis, setAnalysis] = useState<{ zones: { time: string; severity: string; fix: string }[]; hookScore: number; estimatedLift: number } | null>(null)
 const fileRef = useRef<HTMLInputElement>(null)
 const [compressing, setCompressing] = useState(false)
 const [compressionError, setCompressionError] = useState("")
 const [compressionStats, setCompressionStats] = useState<{ originalBytes: number; compressedBytes: number; reductionRatio: number } | null>(null)

 const allVideos = useMemo(() => [...syntheticVideos, ...videos], [syntheticVideos, videos])
 const selectedData = useMemo(() => allVideos.find((v: any) => v.videoId === selectedVideo), [selectedVideo, allVideos])

 useEffect(() => {
  if (selectedVideo) {
   setAnalysis(savedReports[selectedVideo] || null)
  }
 }, [selectedVideo, savedReports])

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
   points.push({pct: t, value: Math.max(5, Math.min(100, base + noise)), time: Math.round(t * duration), onDecSize, onCycleHeight, onDecHeight})
  }
  return points
 }, [selectedData])

 const analyze = async () => {
  if (!selectedData) return
  setAnalyzing(true)
  await new Promise(r => setTimeout(r, 1200))
  const duration = selectedData.durationSeconds || 600
  const newAnalysis = {
   hookScore: Math.round(40 + Math.random() * 50),
   estimatedLift: Math.round(5 + Math.random() * 20),
   zones: [
    { time: `0:${Math.round(duration * 0.05)}`, severity: "high", fix: "Hook too slow — add a pattern interrupt in first 5 seconds" },
    { time: `${Math.floor(duration * 0.3 / 60)}:${String(Math.round(duration * 0.3 % 60)).padStart(2, "0")}`, severity: "medium", fix: "Add B-roll or visual change here — static talking head causes drop" },
    { time: `${Math.floor(duration * 0.7 / 60)}:${String(Math.round(duration * 0.7 % 60)).padStart(2, "0")}`, severity: "low", fix: "Re-hook with 'but here's the thing...' before the final section" },
   ],
  }
  setAnalysis(newAnalysis)
  setSavedReports(prev => {
   const next = { ...prev, [selectedVideo]: newAnalysis }
   localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
   return next
  })
  setAnalyzing(false)
 }

 const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`

 const handleUpload = async (e: any) => {
  const file = e.target.files?.[0]
  if (!file) return
  setCompressionError("")
  setCompressionStats(null)
  setCompressing(true)
  try {
   const compressed = await compressMediaForAnalysis(file)
   setCompressionStats({
    originalBytes: compressed.originalBytes,
    compressedBytes: compressed.compressedBytes,
    reductionRatio: compressed.reductionRatio,
   })
  } catch (err) {
   setCompressionError(err instanceof Error ? err.message : "Compression failed for analysis upload.")
   setCompressing(false)
   if (fileRef.current) fileRef.current.value = ""
   return
  } finally {
   setCompressing(false)
  }
  const fakeId = "local_" + Date.now()
  const fakeVideo = { videoId: fakeId, title: "[Local] " + file.name, durationSeconds: Math.floor(Math.random() * 600) + 60 }
  setSyntheticVideos(prev => [...prev, fakeVideo])
  setSelectedVideo(fakeId)
  if (fileRef.current) fileRef.current.value = ""
 }

  return (
  <WidgetShell {...common} icon={<BarChart3 size={22} />}>
   <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%", overflowY: "auto", paddingBottom: "8px" }}>
     <div style={{ padding: "8px", border: "2px solid #000", borderRadius: "8px", background: "rgba(204,255,0,0.16)", fontSize: "9px", fontWeight: 900, textTransform: "uppercase", lineHeight: 1.35 }}>
      Analysis-only upload policy active: local videos are compressed before analysis to reduce AI processing cost.
     </div>
     {compressing && (
      <div style={{ padding: "8px", border: "2px solid #000", borderRadius: "8px", background: "rgba(36,211,255,0.15)", fontSize: "9px", fontWeight: 900, textTransform: "uppercase" }}>
       Compressing upload for analysis...
      </div>
     )}
     {compressionError && (
      <div style={{ padding: "8px", border: "2px solid #000", borderRadius: "8px", background: "rgba(255,23,68,0.15)", fontSize: "9px", fontWeight: 900, textTransform: "uppercase" }}>
       {compressionError}
      </div>
     )}
     {compressionStats && (
      <div style={{ padding: "8px", border: "2px solid #000", borderRadius: "8px", background: "rgba(79,255,91,0.14)", fontSize: "9px", fontWeight: 900, textTransform: "uppercase" }}>
       Compressed: {Math.round(compressionStats.originalBytes / 1024 / 1024)}MB to {Math.max(1, Math.round(compressionStats.compressedBytes / 1024 / 1024))}MB ({Math.round(compressionStats.reductionRatio * 100)}% smaller)
      </div>
     )}
     <div style={{ display: "flex", gap: "4px", zIndex: 10 }}>
      <div style={{ flex: 2, minWidth: 0 }}>
       <CustomDropdown 
        value={selectedVideo} 
        onChange={(val) => setSelectedVideo(val)} 
        options={[
         { val: "", lbl: "Select a video..." },
         ...allVideos.slice(0, 15).filter((v: any) => !videoSearch || v.title?.toLowerCase().includes(videoSearch.toLowerCase())).map((v: any) => ({val: v.videoId, lbl: v.title, onDecSize, onCycleHeight, onDecHeight}))
        ]}
       />
      </div>
      <input 
       className="vt-input" 
       value={videoSearch} 
       onChange={(e) => setVideoSearch(e.target.value)} 
       placeholder="Search..." 
       style={{ flex: 1, padding: "0 8px", height: "32px", fontSize: "10px" }} 
      />
      <button 
       className="vt-button" 
       onClick={() => fileRef.current?.click()}
       disabled={compressing}
       title="Upload Local Video"
       style={{ width: "32px", height: "32px", flexShrink: 0, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
       <Upload size={14} />
      </button>
      <input type="file" ref={fileRef} onChange={handleUpload} style={{ display: "none" }} accept="video/*" />
     </div>

    {selectedVideo && retentionPoints.length > 0 && (
     <>
      {/* Retention Curve */}
      <div style={{ height: "80px", border: "2px solid #000", borderRadius: "8px", background: "#f5f5f5", padding: "8px", position: "relative", flexShrink: 0 }}>
       <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
        <defs>
         <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00D2FF" stopOpacity="0.05" />
         </linearGradient>
        </defs>
        <path d={`M0,${60 - retentionPoints[0].value * 0.6} ${retentionPoints.map((p, i) => `L${(i / 20) * 200},${60 - p.value * 0.6}`).join(" ")} L200,60 L0,60 Z`} fill="url(#retGrad)" />
        <path d={`M0,${60 - retentionPoints[0].value * 0.6} ${retentionPoints.map((p, i) => `L${(i / 20) * 200},${60 - p.value * 0.6}`).join(" ")}`} fill="none" stroke="#00D2FF" strokeWidth="2" />
       </svg>
       {/* Danger zone markers */}
       {analysis?.zones.map((z, i) => {
        const pct = [5, 30, 70][i]
        return (
         <div key={i} style={{
          position: "absolute", left: `${pct}%`, top: "30px", width: "10px", height: "10px", borderRadius: "50%",
          background: z.severity === "high" ? "#FF1744" : z.severity === "medium" ? "#FFE357" : "#4FFF5B",
          border: "2px solid #000", transform: "translate(-50%, -50%)", zIndex: 10
         }} />
        )
       })}
       <div style={{ position: "absolute", bottom: "4px", right: "8px", fontSize: "8px", fontWeight: 900, opacity: 0.3 }}>
        {selectedData?.durationSeconds ? formatTime(selectedData.durationSeconds) : "—"}
       </div>
      </div>

      <button className="vt-button primary" onClick={analyze} disabled={analyzing} style={{
       height: "32px", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexShrink: 0
      }}>
       <Sparkles size={14} /> {analyzing ? "Analyzing..." : "Find Danger Zones"}
      </button>

      {/* Analysis Results */}
      {analysis && (
       <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: "6px" }}>
         <div style={{ flex: 1, padding: "8px", border: "2px solid #000", borderRadius: "8px", background: analysis.hookScore >= 70 ? "rgba(79,255,91,0.1)" : "rgba(255,23,68,0.1)", textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: 1000 }}>{analysis.hookScore}</div>
          <div style={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase", opacity: 0.5 }}>Hook Score</div>
         </div>
         <div style={{ flex: 1, padding: "8px", border: "2px solid #000", borderRadius: "8px", background: "rgba(36,211,255,0.1)", textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: 1000 }}>+{analysis.estimatedLift}%</div>
          <div style={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase", opacity: 0.5 }}>Est. View Lift</div>
         </div>
        </div>
        {analysis.zones.map((z, i) => (
         <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "8px", border: "2px solid #000", borderRadius: "8px", background: "#fff", boxShadow: "2px 2px 0 0 rgba(0,0,0,0.1)" }}>
          <AlertTriangle size={14} color={z.severity === "high" ? "#FF1744" : z.severity === "medium" ? "#FFE357" : "#4FFF5B"} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
           <span style={{ fontSize: "9px", fontWeight: 1000, opacity: 0.5 }}>@{z.time}</span>
           <span style={{ fontSize: "11px", fontWeight: 700, lineHeight: 1.3 }}>{z.fix}</span>
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
