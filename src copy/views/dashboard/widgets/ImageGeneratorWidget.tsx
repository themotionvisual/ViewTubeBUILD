import React, { useMemo, useState } from "react"
import { Image as ImageIcon, Send, Sparkles } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { AspectRatio, ImageSize } from "../../../types"
import { generateEndScreenImage, generateThumbnail, hasGeminiKey } from "../../../services/gemini"

const IMAGE_BRIDGE_EVENT = "vt_dashboard_generated_image"

type TargetWidget = "community-post" | "comment-replier" | "thumb-ai" | "data-edit"
type TemplateMode = "thumbnail" | "endscreen"

const STYLE_OPTIONS = [
  "Educational",
  "Clickbait",
  "Cinematic",
  "Minimalist",
  "Neon/Cyberpunk",
  "Vibrant",
  "Dark & Moody",
  "Retro/Vintage",
]

export const ImageGeneratorWidget = ({
  widget,
  instance,
  editMode,
  onToggleCollapse,
  onCycleSize,
  onDecSize,
  onCycleHeight,
  onDecHeight,
  onRemove,
}: any) => {
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

  const [mode, setMode] = useState<TemplateMode>("thumbnail")
  const [prompt, setPrompt] = useState("")
  const [headline, setHeadline] = useState("")
  const [subline, setSubline] = useState("")
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastTarget, setLastTarget] = useState<TargetWidget | null>(null)

  const finalPrompt = useMemo(() => {
    const styleContext = selectedStyles.length ? ` Styles: ${selectedStyles.join(", ")}.` : ""
    return `${prompt.trim()}${styleContext}`.trim()
  }, [prompt, selectedStyles])

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) => {
      if (prev.includes(style)) return prev.filter((s) => s !== style)
      if (prev.length >= 4) return prev
      return [...prev, style]
    })
  }

  const handleGenerate = async () => {
    if (!finalPrompt) return
    setIsGenerating(true)
    try {
      const image =
        mode === "endscreen"
          ? await generateEndScreenImage(finalPrompt, AspectRatio.LANDSCAPE_16_9, ImageSize.SIZE_1K, headline, subline)
          : await generateThumbnail(finalPrompt, AspectRatio.LANDSCAPE_16_9, ImageSize.SIZE_1K, headline, subline)
      setGeneratedImage(image)
    } catch (error) {
      console.error("[ImageGeneratorWidget] generation failed", error)
      alert("Image generation failed.")
    } finally {
      setIsGenerating(false)
    }
  }

  const sendToWidget = (target: TargetWidget) => {
    if (!generatedImage) return
    const payload = {
      imageUrl: generatedImage,
      prompt: finalPrompt,
      mode,
      targetWidget: target,
      timestamp: Date.now(),
    }
    window.dispatchEvent(new CustomEvent(IMAGE_BRIDGE_EVENT, { detail: payload }))
    localStorage.setItem(`vt_bridge_image_${target}`, JSON.stringify(payload))
    setLastTarget(target)
  }

  return (
    <WidgetShell {...common} icon={<ImageIcon size={22} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "100%" }}>
        <div className="vt-tab-group" style={{ width: "170px", padding: "2px", alignSelf: "center" }}>
          <button onClick={() => setMode("thumbnail")} className={`vt-tab-btn ${mode === "thumbnail" ? "active" : ""}`} style={{ padding: "4px", fontSize: "9px" }}>
            THUMBNAIL
          </button>
          <button onClick={() => setMode("endscreen")} className={`vt-tab-btn ${mode === "endscreen" ? "active" : ""}`} style={{ padding: "4px", fontSize: "9px" }}>
            END SCREEN
          </button>
        </div>

        <textarea
          className="vt-textarea"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={mode === "thumbnail" ? "Describe thumbnail concept..." : "Describe end screen template background..."}
          style={{ minHeight: "74px" }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          <input className="vt-input" value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="Large text" />
          <input className="vt-input" value={subline} onChange={(event) => setSubline(event.target.value)} placeholder="Small text" />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style}
              onClick={() => toggleStyle(style)}
              className="vt-button"
              style={{ height: "24px", fontSize: "8px", padding: "0 8px", background: selectedStyles.includes(style) ? "var(--widget-color)" : "#fff" }}
            >
              {style}
            </button>
          ))}
        </div>

        {!hasGeminiKey() ? (
          <button className="vt-button" style={{ height: "34px" }} onClick={() => (window.location.href = "/settings")}>
            Missing API Key: Open Settings
          </button>
        ) : (
          <button className="vt-button primary" style={{ height: "34px" }} onClick={handleGenerate} disabled={isGenerating || !finalPrompt}>
            <Sparkles size={14} /> {isGenerating ? "Generating..." : "Generate Image"}
          </button>
        )}

        <div style={{ flex: 1, minHeight: "110px", border: "2px solid #000", borderRadius: "10px", overflow: "hidden", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {generatedImage ? (
            <img src={generatedImage} alt="Generated output" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "10px", fontWeight: 900, opacity: 0.35, textTransform: "uppercase" }}>Generated image preview</span>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          <button className="vt-button" style={{ height: "30px", fontSize: "9px" }} onClick={() => sendToWidget("community-post")} disabled={!generatedImage}>
            <Send size={12} /> Send → Community
          </button>
          <button className="vt-button" style={{ height: "30px", fontSize: "9px" }} onClick={() => sendToWidget("comment-replier")} disabled={!generatedImage}>
            <Send size={12} /> Send → Comments
          </button>
          <button className="vt-button" style={{ height: "30px", fontSize: "9px" }} onClick={() => sendToWidget("thumb-ai")} disabled={!generatedImage}>
            <Send size={12} /> Send → Thumb AI
          </button>
          <button className="vt-button" style={{ height: "30px", fontSize: "9px" }} onClick={() => sendToWidget("data-edit")} disabled={!generatedImage}>
            <Send size={12} /> Send → Video Manager
          </button>
        </div>

        {lastTarget ? (
          <div style={{ fontSize: "9px", fontWeight: 900, opacity: 0.65, textTransform: "uppercase" }}>
            Sent to: {lastTarget}
          </div>
        ) : null}
      </div>
    </WidgetShell>
  )
}

