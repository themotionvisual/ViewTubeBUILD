import React, { useRef, useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { WidgetScrollArea, WidgetSelect } from "../WidgetPrimitives"
import { Image as ImageIcon, Sparkles, Download, Search, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react"
import {
  firstYouTubeThumbnailCandidate,
  nextYouTubeThumbnailCandidate,
} from "../../../services/youtube/thumbnailFallback"

export const ThumbAIWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove, data }: any) => {
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
  
  const [mode, setMode] = useState<"generate" | "analyze">("generate")
  const [prompt, setPrompt] = useState("")
  const [concept, setConcept] = useState("")
  const [largeText, setLargeText] = useState("")
  const [smallText, setSmallText] = useState("")
  const [stylePreset, setStylePreset] = useState("neo-brutalist")
  const [palette, setPalette] = useState("neon")
  const [resolution, setResolution] = useState("2K")
  const [aspectRatio, setAspectRatio] = useState("16:9")
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [isDragImage, setIsDragImage] = useState(false)
  const refImageInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedVideo, setSelectedVideo] = useState("")
  const [videoSearch, setVideoSearch] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const videos = data.videoAssets || []
  
  // For fallback analysis mock
  const activeVideo = videos.find((v: any) => v.videoId === selectedVideo)

  const handleGenerate = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setResult({type: "generation", imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop", onDecSize, onCycleHeight, onDecHeight})
      setIsProcessing(false)
    }, 2000)
  }

  const handleAnalyze = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setResult({
        type: "analysis",
        score: 84,
        ctrPotential: "High",
        emotion: "Curiosity / Surprise",
        flags: [
          { type: "good", text: "Strong color contrast (green on pink)" },
          { type: "good", text: "Face is highly visible and expressive" },
          { type: "warn", text: "Text is slightly small for mobile viewing" }
        ]
      })
      setIsProcessing(false)
    }, 2000)
  }

  const reset = () => {
    setResult(null)
    setPrompt("")
    setSelectedVideo("")
  }

  return (
    <WidgetShell {...common} icon={<ImageIcon size={22} />}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "8px", minHeight: 0 }}>

        {/* Mode Tabs */}
        {!result && (
          <div style={{ display: "flex", gap: "4px", background: "#f5f5f5", padding: "4px", borderRadius: "8px", border: "2px solid #000" }}>
            <button
              onClick={() => setMode("generate")}
              style={{ flex: 1, padding: "6px", background: mode === "generate" ? "#FF83EA" : "transparent", color: mode === "generate" ? "#000" : "rgba(0,0,0,0.5)", border: mode === "generate" ? "2px solid #000" : "2px solid transparent", borderRadius: "6px", fontSize: "10px", fontWeight: 900, textTransform: "uppercase", cursor: "pointer", boxShadow: mode === "generate" ? "1px 1px 0 0 #000" : "none" }}
            >
              Generate
            </button>
            <button
              onClick={() => setMode("analyze")}
              style={{ flex: 1, padding: "6px", background: mode === "analyze" ? "#00D2FF" : "transparent", color: mode === "analyze" ? "#000" : "rgba(0,0,0,0.5)", border: mode === "analyze" ? "2px solid #000" : "2px solid transparent", borderRadius: "6px", fontSize: "10px", fontWeight: 900, textTransform: "uppercase", cursor: "pointer", boxShadow: mode === "analyze" ? "1px 1px 0 0 #000" : "none" }}
            >
              Analyze
            </button>
          </div>
        )}

        {/* Dynamic Content Area */}
        <WidgetScrollArea ariaLabel="Thumbnail AI editor" contentClassName="flex min-h-full flex-col gap-2">
          
          {/* GENERATE MODE */}
          {!result && mode === "generate" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%" }}>
              <input
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Concept..."
                style={{ padding: "8px", background: "#fff", border: "2px solid #000", borderRadius: "8px", fontSize: "11px", fontWeight: 800, outline: "none" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <input value={largeText} onChange={(e) => setLargeText(e.target.value)} placeholder="Large text..." style={{ padding: "8px", background: "#fff", border: "2px solid #000", borderRadius: "8px", fontSize: "11px", fontWeight: 800, outline: "none" }} />
                <input value={smallText} onChange={(e) => setSmallText(e.target.value)} placeholder="Small text..." style={{ padding: "8px", background: "#fff", border: "2px solid #000", borderRadius: "8px", fontSize: "11px", fontWeight: 800, outline: "none" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px" }}>
                <WidgetSelect value={stylePreset} onChange={setStylePreset} label="Thumbnail style" options={[
                  { value: "neo-brutalist", label: "Neo brutalist" }, { value: "cinematic", label: "Cinematic" },
                  { value: "minimal", label: "Minimal" }, { value: "dramatic", label: "Dramatic" },
                ]} />
                <WidgetSelect value={palette} onChange={setPalette} label="Thumbnail palette" options={[
                  { value: "neon", label: "Neon" }, { value: "warm", label: "Warm" },
                  { value: "cool", label: "Cool" }, { value: "mono", label: "Mono" },
                ]} />
                <WidgetSelect value={resolution} onChange={setResolution} label="Thumbnail resolution" options={[
                  { value: "1K", label: "1K" }, { value: "2K", label: "2K" }, { value: "4K", label: "4K" },
                ]} />
                <WidgetSelect value={aspectRatio} onChange={setAspectRatio} label="Thumbnail aspect ratio" options={[
                  { value: "16:9", label: "16:9" }, { value: "1:1", label: "1:1" }, { value: "9:16", label: "9:16" },
                ]} />
              </div>
              <div
                className={`widget-upload-frame ${isDragImage ? "is-dragging" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragImage(true)
                }}
                onDragLeave={() => setIsDragImage(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragImage(false)
                  const file = e.dataTransfer.files?.[0]
                  if (!file || !file.type.startsWith("image/")) return
                  const reader = new FileReader()
                  reader.onload = () => setReferenceImage(reader.result as string)
                  reader.readAsDataURL(file)
                }}
                style={{
                  minHeight: "74px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}>
                {referenceImage ? (
                  <img src={referenceImage} alt="reference" style={{ width: "100%", height: "74px", objectFit: "cover" }} />
                ) : (
                  <button
                    onClick={() => refImageInputRef.current?.click()}
                    style={{ fontSize: "10px", fontWeight: 900, opacity: 0.7, textTransform: "uppercase", border: "2px solid #000", borderRadius: "6px", padding: "6px 8px", background: "#fff" }}>
                    Drag/drop image or upload reference
                  </button>
                )}
                <input
                  ref={refImageInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => setReferenceImage(reader.result as string)
                    reader.readAsDataURL(file)
                  }}
                />
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your thumbnail concept (e.g., 'A person looking shocked at a glowing laptop screen, neon cyberpunk style')..."
                style={{ flex: 1, padding: "10px", background: "#fff", border: "2px solid #000", borderRadius: "8px", fontSize: "12px", fontFamily: "inherit", resize: "none", outline: "none" }}
              />
              <button
                onClick={handleGenerate}
                disabled={isProcessing || !(prompt.trim() || concept.trim())}
                className="vt-button primary"
                style={{ height: "36px", width: "100%", opacity: !(prompt.trim() || concept.trim()) ? 0.5 : 1 }}
              >
                {isProcessing ? <div style={{ width: "12px", height: "12px", border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <Sparkles size={14} />}
                {isProcessing ? "Generating..." : "Generate Concept"}
              </button>
            </div>
          )}

          {/* ANALYZE MODE */}
          {!result && mode === "analyze" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%" }}>
              <div style={{ display: "flex", gap: "4px" }}>
               <WidgetSelect
                 value={selectedVideo}
                 onChange={setSelectedVideo}
                 label="Select a video to analyze"
                 placeholder="Select a video to analyze…"
                 style={{ flex: 2, padding: "8px", background: "#fff", border: "2px solid #000", borderRadius: "8px", fontSize: "12px", fontWeight: 900, outline: "none" }}
                 options={videos
                  .filter((v: any) => !videoSearch || v.title?.toLowerCase().includes(videoSearch.toLowerCase()))
                  .slice(0, 50)
                  .map((v: any) => ({ value: v.videoId, label: v.title || v.id }))}
               />
               <input
                className="vt-input"
                value={videoSearch}
                onChange={(e) => setVideoSearch(e.target.value)}
                placeholder="Search..."
                style={{ flex: 1, padding: "8px", background: "#fff", border: "2px solid #000", borderRadius: "8px", fontSize: "12px", fontWeight: 900, outline: "none" }}
               />
              </div>
              
              {activeVideo && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", background: "#f5f5f5", border: "2px solid #000", borderRadius: "8px", overflow: "hidden" }}>
                  <img 
                    src={firstYouTubeThumbnailCandidate(activeVideo.videoId, [activeVideo.thumbnailUrl])}
                    alt="Thumbnail Preview" 
                    onError={(e) => {
                      const target = e.currentTarget
                      target.src = nextYouTubeThumbnailCandidate(activeVideo.videoId, target.src, [activeVideo.thumbnailUrl])
                    }}
                    style={{ width: "100%", height: "120px", objectFit: "cover", borderBottom: "2px solid #000" }} 
                  />
                  <div style={{ padding: "8px" }}>
                     <button
                        onClick={handleAnalyze}
                        disabled={isProcessing}
                        className="vt-button primary"
                        style={{ width: "100%", height: "36px" }}
                      >
                        {isProcessing ? <div style={{ width: "12px", height: "12px", border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <Search size={14} />}
                        {isProcessing ? "Analyzing..." : "Analyze Thumbnail"}
                      </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RESULTS MODE */}
          {result && result.type === "generation" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%" }}>
               <img src={result.imageUrl} alt="Generated" style={{ width: "100%", height: "160px", objectFit: "cover", border: "2px solid #000", borderRadius: "8px", flexShrink: 0 }} />
               <div style={{ display: "flex", gap: "6px", marginTop: "auto" }}>
                 <button onClick={reset} className="vt-button" style={{ flex: 1 }}>Back</button>
                 <button className="vt-button primary" style={{ flex: 2 }}>
                   <Download size={14} /> Download
                 </button>
               </div>
            </div>
          )}

          {result && result.type === "analysis" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                 <div style={{ flex: 1, background: "#fff", border: "2px solid #000", borderRadius: "8px", padding: "10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "2px 2px 0 0 #4FFF5B" }}>
                    <span style={{ fontSize: "28px", fontWeight: 1000, color: "#000", lineHeight: 1 }}>{result.score}</span>
                    <span style={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase", opacity: 0.5, marginTop: "4px" }}>Hook Score</span>
                 </div>
                 <div style={{ flex: 2, background: "#fff", border: "2px solid #000", borderRadius: "8px", padding: "8px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px", boxShadow: "2px 2px 0 0 #000" }}>
                    <div style={{ fontSize: "10px", fontWeight: 900, display: "flex", justifyContent: "space-between" }}><span>CTR Potential:</span> <span style={{ color: "#008B00" }}>{result.ctrPotential}</span></div>
                    <div style={{ fontSize: "10px", fontWeight: 900, display: "flex", justifyContent: "space-between" }}><span>Emotion:</span> <span>{result.emotion}</span></div>
                 </div>
              </div>
              <div style={{ flex: 1, background: "#fff", border: "2px solid #000", borderRadius: "8px", padding: "8px" }}>
                 <div style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", borderBottom: "1px solid #eee", paddingBottom: "4px", marginBottom: "6px" }}>AI Breakdown</div>
                 <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {result.flags.map((flag: any, i: number) => (
                      <div key={i} style={{ display: "flex", gap: "6px", alignItems: "flex-start", fontSize: "10px", fontWeight: 700, lineHeight: 1.3 }}>
                         {flag.type === "good" ? <CheckCircle2 size={12} color="#008B00" style={{ marginTop: "1px" }} /> : <AlertTriangle size={12} color="#D32F2F" style={{ marginTop: "1px" }} />}
                         <span>{flag.text}</span>
                      </div>
                    ))}
                 </div>
              </div>
              <button onClick={reset} className="vt-button" style={{ width: "100%" }}>
                <ArrowRight size={14} style={{ transform: "rotate(180deg)" }} /> Back to Editor
              </button>
            </div>
          )}

        </WidgetScrollArea>

      </div>
    </WidgetShell>
  )
}
