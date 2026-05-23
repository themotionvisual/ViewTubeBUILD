import React, { useEffect, useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { useEntitlement } from "../../../app/AppShell"
import { Image as ImageIcon, Sparkles, Download, Search, CheckCircle2, AlertTriangle, Upload, ArrowRight } from "lucide-react"
import { canAffordAiTokensFromState } from "../../../services/billingEntitlement"

type TabMode = "generate" | "analyze" | "abtest"

export const ThumbnailLabWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onCycleHeight, onDecSize, onDecHeight, onRemove, data }: any) => {
  const common = {
  widget,
  instance,
  editMode,
  canEdit: true,
  onToggleCollapse,
  onCycleSize,
  onCycleHeight,
  onRemove,
  onDecSize,
  onCycleHeight,
  onDecHeight,
 }

  const [mode, setMode] = useState<TabMode>("generate")
  const [prompt, setPrompt] = useState("")
  const [selectedVideo, setSelectedVideo] = useState("")
  const [videoSearch, setVideoSearch] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [inboundImageUrl, setInboundImageUrl] = useState<string | null>(null)

  // A/B Test state
  const [variants, setVariants] = useState([
    { label: "A", image: null as string | null, title: "", score: 0 },
    { label: "B", image: null as string | null, title: "", score: 0 },
    { label: "C", image: null as string | null, title: "", score: 0 },
  ])
  const [abAnalyzing, setAbAnalyzing] = useState(false)

  const videos = data.canonicalRows || []
  const activeVideo = videos.find((v: any) => v.videoId === selectedVideo)
  const modeTokenCost = mode === "generate" ? 8 : 5
  const entitlement = useEntitlement()
  const canAffordModeCost = canAffordAiTokensFromState(entitlement, modeTokenCost)

  const modeGuardReason = (() => {
    if (mode === "generate" && !prompt.trim()) return "Add prompt before generating."
    if ((mode === "analyze" || mode === "abtest") && !selectedVideo) return "Select video first."
    if (mode === "abtest" && !variants.some((v) => v.image)) return "Upload at least one variant."
    if (!canAffordModeCost) {
      if (entitlement.tier === "free") return "Upgrade to a paid plan to use AI."
      return `Need ${modeTokenCost} credits for this action.`
    }
    return null
  })()

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

  const handleUpload = (idx: number, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setVariants(prev => prev.map((v, i) => i === idx ? { ...v, image: e.target?.result as string } : v))
    }
    reader.readAsDataURL(file)
  }

  const analyzeThumbnails = async () => {
    setAbAnalyzing(true)
    await new Promise(r => setTimeout(r, 1500))
    setVariants(prev => prev.map(v => ({...v, score: v.image ? Math.round(30 + Math.random() * 65) : 0, onDecSize, onCycleHeight, onDecHeight})))
    setAbAnalyzing(false)
  }

  const reset = () => { setResult(null); setPrompt(""); setSelectedVideo("") }

  useEffect(() => {
    const applyImage = (payload: any) => {
      if (!payload?.imageUrl) return
      setMode("analyze")
      setInboundImageUrl(payload.imageUrl)
      setResult({
        type: "generation",
        imageUrl: payload.imageUrl,
      })
    }

    const onBridge = (event: Event) => {
      const detail = (event as CustomEvent<any>).detail
      if (!detail || detail.targetWidget !== "thumb-ai") return
      applyImage(detail)
    }

    window.addEventListener("vt_dashboard_generated_image", onBridge as EventListener)
    try {
      const cached = localStorage.getItem("vt_bridge_image_thumb-ai")
      if (cached) applyImage(JSON.parse(cached))
    } catch {}
    return () => window.removeEventListener("vt_dashboard_generated_image", onBridge as EventListener)
  }, [])
  const bestIdx = variants.reduce((best, v, i) => v.score > variants[best].score ? i : best, 0)

  const TABS: { id: TabMode; label: string; color: string }[] = [
    { id: "generate", label: "Generate", color: "#FF83EA" },
    { id: "analyze", label: "Analyze", color: "#00D2FF" },
    { id: "abtest", label: "A/B Test", color: "#C9F830" },
  ]

  const modeTabBar = (
    <div style={{ display: "flex", gap: "0", background: "#f5f5f5", padding: "3px", borderRadius: "8px", border: "2px solid #000" }}>
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => { setMode(tab.id); setResult(null) }}
          style={{
            flex: 1, padding: "5px 4px",
            background: mode === tab.id ? tab.color : "transparent",
            color: mode === tab.id ? "#000" : "rgba(0,0,0,0.4)",
            border: mode === tab.id ? "2px solid #000" : "2px solid transparent",
            borderRadius: "6px", fontSize: "9px", fontWeight: 900,
            textTransform: "uppercase", cursor: "pointer",
            boxShadow: mode === tab.id ? "1px 1px 0 0 #000" : "none",
          }}>
          {tab.label}
        </button>
      ))}
    </div>
  )

  // Video dropdown (shared by analyze + abtest)
  const videoDropdown = (
    <div style={{ display: "flex", gap: "4px" }}>
      <select
        className="vt-select"
        value={selectedVideo}
        onChange={(e) => setSelectedVideo(e.target.value)}
        style={{ flex: 2 }}>
        <option value="" disabled>Select a video...</option>
        {videos
         .filter((v: any) => !videoSearch || v.title?.toLowerCase().includes(videoSearch.toLowerCase()))
         .slice(0, 15)
         .map((v: any) => (
          <option key={v.videoId} value={v.videoId}>{v.title || v.id}</option>
        ))}
      </select>
      <input
        className="vt-input"
        value={videoSearch}
        onChange={(e) => setVideoSearch(e.target.value)}
        placeholder="Search..."
        style={{ flex: 1, fontSize: "10px" }}
      />
    </div>
  )

  return (
    <WidgetShell
      {...common}
      icon={<ImageIcon size={22} />}
      headerContent={modeTabBar}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "8px", overflowY: "auto" }}>

        {/* GENERATE MODE */}
        {mode === "generate" && !result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            <textarea
              className="vt-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your thumbnail concept (e.g., 'A person looking shocked at a glowing laptop screen, neon cyberpunk style')..."
              style={{ flex: 1 }}
            />
            <button
              onClick={handleGenerate}
              disabled={isProcessing || !prompt.trim() || !canAffordModeCost}
              className="vt-button primary"
              style={{ height: "36px", width: "100%", opacity: !prompt.trim() ? 0.5 : 1 }}>
              {isProcessing ? <div style={{ width: "12px", height: "12px", border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <Sparkles size={14} />}
              {isProcessing ? "Generating..." : "Generate Concept"}
            </button>
          </div>
        )}

        {/* ANALYZE MODE */}
        {mode === "analyze" && !result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            {inboundImageUrl && (
              <div style={{ border: "2px solid #000", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
                <img src={inboundImageUrl} alt="Inbound generated asset" style={{ width: "100%", height: "100px", objectFit: "cover", borderBottom: "2px solid #000" }} />
                <div style={{ padding: "4px 8px", fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.7 }}>
                  Incoming Generated Image
                </div>
              </div>
            )}
            {videoDropdown}
            {activeVideo && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", background: "#f5f5f5", border: "2px solid #000", borderRadius: "8px", overflow: "hidden" }}>
                <img 
                  src={activeVideo.thumbnailUrl || `https://i.ytimg.com/vi/${activeVideo.videoId}/maxresdefault.jpg`} 
                  alt="Preview" 
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.includes('maxresdefault.jpg')) {
                      target.src = target.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
                    } else if (target.src.includes('hqdefault.jpg')) {
                      target.src = target.src.replace('hqdefault.jpg', 'mqdefault.jpg');
                    }
                  }}
                  style={{ width: "100%", height: "120px", objectFit: "cover", borderBottom: "2px solid #000" }} 
                />
                <div style={{ padding: "8px" }}>
                  <button
                    onClick={handleAnalyze}
                    disabled={isProcessing || !canAffordModeCost}
                    className="vt-button primary"
                    style={{ width: "100%", height: "36px" }}>
                    {isProcessing ? <div style={{ width: "12px", height: "12px", border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <Search size={14} />}
                    {isProcessing ? "Analyzing..." : "Analyze Thumbnail"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* A/B TEST MODE */}
        {mode === "abtest" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            {videoDropdown}
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
                  <input
                    className="vt-input"
                    value={v.title}
                    onChange={(e) => setVariants(prev => prev.map((p, i) => i === idx ? { ...p, title: e.target.value } : p))}
                    placeholder={`Title ${v.label}...`}
                    style={{ fontSize: "9px", padding: "4px 6px" }}
                  />
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
              disabled={abAnalyzing || !variants.some(v => v.image) || !canAffordModeCost}
              className={`vt-button ${abAnalyzing ? "" : "primary"}`}
              style={{
                height: "36px", width: "100%"
              }}>
              <Sparkles size={14} /> {abAnalyzing ? "Analyzing..." : "Predict CTR"}
            </button>
          </div>
        )}

        {/* RESULTS: Generation */}
        {result && result.type === "generation" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            <img src={result.imageUrl} alt="Generated" style={{ width: "100%", height: "160px", objectFit: "cover", border: "2px solid #000", borderRadius: "8px", flexShrink: 0 }} />
            <div style={{ display: "flex", gap: "6px", marginTop: "auto" }}>
              <button onClick={reset} className="vt-button" style={{ flex: 1 }}>Back</button>
              <button className="vt-button primary" style={{ flex: 2 }}>
                <Download size={14} /> Download
              </button>
            </div>
          </div>
        )}

        {/* RESULTS: Analysis */}
        {result && result.type === "analysis" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ flex: 1, background: "#fff", border: "2px solid #000", borderRadius: "8px", padding: "10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "2px 2px 0 0 #4FFF5B" }}>
                <span style={{ fontSize: "28px", fontWeight: 1000, lineHeight: 1 }}>{result.score}</span>
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

      </div>
    </WidgetShell>
  )
}
