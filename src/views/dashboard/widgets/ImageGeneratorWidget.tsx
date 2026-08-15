import React, { useMemo, useState } from "react"
import { Image as ImageIcon, Send, Sparkles } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { WidgetFooter, WidgetHeaderToggle, WidgetWorkflowMain } from "../WidgetPrimitives"
import { AspectRatio, ImageSize } from "../../../types"
import { generateEndScreenImage, generateThumbnail, hasGeminiKey } from "../../../services/gemini"

const IMAGE_BRIDGE_EVENT = "vt_dashboard_generated_image"

type TargetWidget = "community-post" | "comment-replier" | "thumb-ai" | "video-uploader"
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
  const templateToggle = (
    <WidgetHeaderToggle
      label="Image template type"
      value={mode}
      onChange={(value) => setMode(value as TemplateMode)}
      items={[
        { id: "thumbnail", label: "Thumbnail" },
        { id: "endscreen", label: "End\nScreen" },
      ]}
    />
  )

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
          : await generateThumbnail(
            finalPrompt,
            AspectRatio.LANDSCAPE_16_9,
            ImageSize.SIZE_1K,
            [headline, subline].filter(Boolean).join(" — "),
            "mobile",
          )
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
    <WidgetShell {...common} icon={<ImageIcon size={22} />} headerContent={templateToggle}>
      <div className="widget-workspace image-generator-workspace">
      <WidgetWorkflowMain className="image-generator-main">
        <div className="image-generator-copy-grid">
          <textarea
            className="vt-textarea"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={mode === "thumbnail" ? "Describe thumbnail concept..." : "Describe end screen template background..."}
          />
          <div className="image-generator-text-fields">
            <input className="vt-input" value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="Large text" />
            <input className="vt-input" value={subline} onChange={(event) => setSubline(event.target.value)} placeholder="Small text" />
          </div>
        </div>

        <div className="image-generator-style-grid" aria-label="Image styles">
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style}
              onClick={() => toggleStyle(style)}
              className={`vt-button${selectedStyles.includes(style) ? " is-selected" : ""}`}
              aria-pressed={selectedStyles.includes(style)}
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

        <div className="image-generator-preview">
          {generatedImage ? (
            <img src={generatedImage} alt="Generated output" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "10px", fontWeight: 900, opacity: 0.35, textTransform: "uppercase" }}>Generated image preview</span>
          )}
        </div>

      </WidgetWorkflowMain>
        <WidgetFooter divider={false} className="image-generator-footer">
        <div className="image-generator-send-grid">
          <button className="vt-button" aria-label="Send image to Community Post" onClick={() => sendToWidget("community-post")} disabled={!generatedImage}>
            <Send size={12} /> Community
          </button>
          <button className="vt-button" aria-label="Send image to Comment Responder" onClick={() => sendToWidget("comment-replier")} disabled={!generatedImage}>
            <Send size={12} /> Comments
          </button>
          <button className="vt-button" aria-label="Send image to Thumbnail AI" onClick={() => sendToWidget("thumb-ai")} disabled={!generatedImage}>
            <Send size={12} /> Thumb AI
          </button>
          <button className="vt-button" aria-label="Send image to Video Uploader" onClick={() => sendToWidget("video-uploader")} disabled={!generatedImage}>
            <Send size={12} /> Uploader
          </button>
        </div>
        {lastTarget ? <span className="widget-action-status">Sent to: {lastTarget}</span> : null}
        </WidgetFooter>
      </div>
    </WidgetShell>
  )
}
