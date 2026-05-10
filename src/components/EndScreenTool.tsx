import React, { useState, useRef } from "react"
import {
  generateEndScreenImage,
  generateEndScreenConcept,
  hasGeminiKey,
} from "../services/gemini"
import {
  AspectRatio,
  ImageSize,
  type ThumbnailHistoryItem,
} from "../types"
import { useBrain } from "../context/useBrain"
import { CustomIcon } from "./CustomIcon"
import { SubToolbox, StandardUploadBox, StandardTextArea } from "./Toolbox"
import { StandardButton } from "./StandardButton"
import { PostActionReflection } from "./PostActionReflection"

interface ReferenceImage {
  id: string
  file: File
  previewUrl: string
  usageType: string
}
const LayoutPreview = ({ type, selected, onClick }: { type: string, selected: boolean, onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className={`aspect-video border-[2px] border-black rounded-md relative cursor-pointer overflow-hidden transition-all shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-y-[1px] hover:translate-x-[1px] ${selected ? "bg-[#FFB158]" : "bg-white"}`}
      title={type}
    >
      {type === "2 Videos" && (
        <>
          <div className="absolute top-[25%] left-[5%] w-[42%] h-[50%] border-[2px] border-black rounded-sm bg-black/10" />
          <div className="absolute top-[25%] right-[5%] w-[42%] h-[50%] border-[2px] border-black rounded-sm bg-black/10" />
        </>
      )}
      {type === "1 Video + 1 Subscribe + 1 Video" && (
        <>
          <div className="absolute top-[25%] left-[5%] w-[32%] h-[50%] border-[2px] border-black rounded-sm bg-black/10" />
          <div className="absolute top-[35%] left-[42.5%] w-[15%] aspect-square border-[2px] border-black rounded-full bg-black/10" />
          <div className="absolute top-[25%] right-[5%] w-[32%] h-[50%] border-[2px] border-black rounded-sm bg-black/10" />
        </>
      )}
      {type === "1 Subscribe + 1 Video" && (
        <>
          <div className="absolute top-[35%] left-[15%] w-[15%] aspect-square border-[2px] border-black rounded-full bg-black/10" />
          <div className="absolute top-[25%] right-[10%] w-[45%] h-[50%] border-[2px] border-black rounded-sm bg-black/10" />
        </>
      )}
      {type === "1 Video + 1 Subscribe" && (
        <>
          <div className="absolute top-[25%] left-[10%] w-[45%] h-[50%] border-[2px] border-black rounded-sm bg-black/10" />
          <div className="absolute top-[35%] right-[15%] w-[15%] aspect-square border-[2px] border-black rounded-full bg-black/10" />
        </>
      )}
      {type === "2 Videos (Stacked) + 1 Subscribe" && (
        <>
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[35%] border-[2px] border-black rounded-sm bg-black/10" />
          <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[35%] border-[2px] border-black rounded-sm bg-black/10" />
          <div className="absolute top-[35%] right-[15%] w-[15%] aspect-square border-[2px] border-black rounded-full bg-black/10" />
        </>
      )}
      {type === "1 Subscribe + 2 Videos (Stacked)" && (
        <>
          <div className="absolute top-[35%] left-[15%] w-[15%] aspect-square border-[2px] border-black rounded-full bg-black/10" />
          <div className="absolute top-[10%] right-[10%] w-[40%] h-[35%] border-[2px] border-black rounded-sm bg-black/10" />
          <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[35%] border-[2px] border-black rounded-sm bg-black/10" />
        </>
      )}
    </div>
  )
}

export const EndScreenTool: React.FC = () => {
  const { brain } = useBrain()

  // Loading States
  const [genLoading, setGenLoading] = useState(false)
  const [conceptLoading, setConceptLoading] = useState(false)

  // Core States
  const [prompt, setPrompt] = useState("")
  const [largeText, setLargeText] = useState("")
  const [smallText, setSmallText] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [history, setHistory] = useState<ThumbnailHistoryItem[]>([])
  const [selectedLayout, setSelectedLayout] = useState<string>("2 Videos")

  // Advanced States
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([])
  const [palette, setPalette] = useState<string[]>([
    "#FFB158",
    "#000000",
    "",
    "",
    "",
  ])

  const END_SCREEN_STYLES = [
    "Clean",
    "Minimalist",
    "Cinematic",
    "Neon/Cyberpunk",
    "Outrun",
    "Retro/Vintage",
    "Corporate",
    "Gaming",
    "Vibrant",
    "Dark & Moody",
    "Surreal",
    "Grunge",
  ]
  
  const LAYOUTS = [
    "2 Videos",
    "1 Video + 1 Subscribe + 1 Video",
    "1 Subscribe + 1 Video",
    "1 Video + 1 Subscribe",
    "2 Videos (Stacked) + 1 Subscribe",
    "1 Subscribe + 2 Videos (Stacked)",
  ]

  const handleManualConceptGen = async () => {
    if (!prompt) return
    setConceptLoading(true)
    try {
      const concept = await generateEndScreenConcept(prompt, brain)
      setPrompt(concept.prompt)
    } catch (e) {
      alert("Failed to generate concept.")
    } finally {
      setConceptLoading(false)
    }
  }

  const handleStyleToggle = (style: string) => {
    setSelectedStyles((prev) => {
      if (prev.includes(style)) return prev.filter((s) => s !== style)
      if (prev.length >= 4) return prev
      return [...prev, style]
    })
  }

  const handleGenerate = async () => {
    if (!prompt) return
    setGenLoading(true)
    try {
      const activeColors = palette.filter((c) => c.trim() !== "")
      const paletteContext =
        activeColors.length > 0
          ? `\n\nCRITICAL COLOR PALETTE: You MUST strictly use this color palette: ${activeColors.join(", ")}.`
          : ""
      const styleContext =
        selectedStyles.length > 0
          ? `\n\nCRITICAL STYLE REQUIREMENTS: The design MUST be generated using a combination of the following styles: ${selectedStyles.join(", ")}.`
          : ""
      const layoutContext = `\n\nCRITICAL LAYOUT REQUIREMENTS: The layout MUST be designed for the following configuration: ${selectedLayout}. Include subtle glowing empty spaces or placeholder frames where videos will go, and a subtle circle for the profile picture.`

      const finalPrompt = prompt + styleContext + paletteContext + layoutContext
      const img = await generateEndScreenImage(
        finalPrompt,
        AspectRatio.LANDSCAPE_16_9,
        ImageSize.SIZE_1K,
        largeText,
        smallText,
      )
      setGeneratedImage(img)
      const newItem: ThumbnailHistoryItem = {
        id: crypto.randomUUID(),
        url: img,
        prompt: prompt,
        timestamp: Date.now(),
      }
      setHistory([newItem, ...history])
    } catch (e: any) {
      console.error(e)
      alert("Generation Failed.")
    } finally {
      setGenLoading(false)
    }
  }

  return (
    <div className="w-full animate-fade-in bg-white relative">
      {/* Generated History Bar */}
      {history.length > 0 && (
        <div className="w-full mb-8 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setGeneratedImage(item.url)
                setPrompt(item.prompt)
              }}
              className="flex-shrink-0 w-44 h-28 border-[4px] border-black rounded-[20px] cursor-pointer hover:translate-y-[-4px] transition-all relative group bg-white overflow-hidden shadow-[6px_6px_0px_0px_black]">
              <img
                src={item.url}
                className="w-full h-full object-cover"
                alt="History"
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-full">
        {/* Column 1: Controls */}
        <div className="flex flex-col h-full gap-6">
          <SubToolbox
            collapsible
            title="Concept & Layout"
            icon={<CustomIcon name="!!!IDEA" size={20} />}
            paletteIndex={9}
            isOpenInitial={true}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-black/40 tracking-[0.2em] pl-1">
                  Layout Structure
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {LAYOUTS.map((r) => (
                    <LayoutPreview
                      key={r}
                      type={r}
                      selected={selectedLayout === r}
                      onClick={() => setSelectedLayout(r)}
                    />
                  ))}
                </div>
              </div>

              <StandardTextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the overall visual theme..."
                minHeight="112px"
                hasBorder={false}
                className="w-full p-0 text-sm font-bold bg-transparent outline-none resize-none placeholder:text-black/10 text-black leading-tight"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleManualConceptGen}
                  disabled={conceptLoading}
                  className="bg-[#C9F830] text-[10px] font-black uppercase text-black px-4 py-1.5 rounded-lg border-[2px] border-black shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-y-0.5 transition-all">
                  {conceptLoading ? "REFRESHING..." : "✨ AUTO-REFINE"}
                </button>
              </div>
            </div>
          </SubToolbox>

          <SubToolbox
            collapsible
            title="Styles"
            icon={<CustomIcon name="!!!COLLECTION" size={20} />}
            paletteIndex={1}>
            <div className="grid grid-cols-3 gap-2">
              {END_SCREEN_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => handleStyleToggle(style)}
                  className={`px-2 py-2 border-[2px] border-black rounded-lg font-black uppercase text-[9px] shadow-[2px_2px_0px_0px_black] active:translate-y-0.5 active:shadow-none transition-all ${selectedStyles.includes(style) ? "bg-[#FFB158]" : "bg-white"}`}>
                  {style}
                </button>
              ))}
            </div>
          </SubToolbox>

          <SubToolbox
            collapsible
            title="Text & Copy"
            icon={<CustomIcon name="!!!TEXT" size={20} />}
            paletteIndex={0}>
            <div className="space-y-4">
              <input
                value={largeText}
                onChange={(e) => setLargeText(e.target.value)}
                placeholder="TITLE (e.g. WATCH NEXT)"
                className="pop-input w-full p-3 border-[3px] text-sm rounded-lg"
              />
              <input
                value={smallText}
                onChange={(e) => setSmallText(e.target.value)}
                placeholder="SUBTITLE (e.g. Subscribe for more)"
                className="pop-input w-full p-3 border-[3px] text-sm rounded-lg"
              />
            </div>
          </SubToolbox>

          <SubToolbox
            collapsible
            title="Palette"
            icon={<CustomIcon name="paint-bucket" size={20} />}
            paletteIndex={4}>
            <div className="flex justify-between items-start gap-3 py-2">
              {palette.map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    style={{ backgroundColor: c || "#f3f4f6" }}
                    onClick={() => document.getElementById(`cp-end-${i}`)?.click()}
                    className="w-full aspect-[2/3] border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_black] relative overflow-hidden flex items-center justify-center cursor-pointer group">
                    <input
                      id={`cp-end-${i}`}
                      type="color"
                      value={c || "#ffffff"}
                      onChange={(e) => {
                        const n = [...palette]
                        n[i] = e.target.value
                        setPalette(n)
                      }}
                      className="absolute inset-0 opacity-0 pointer-events-none"
                    />
                    {!c && <span className="text-black/10 font-black text-lg">+</span>}
                  </div>
                  <input
                    value={c}
                    onChange={(e) => {
                      const n = [...palette]
                      n[i] = e.target.value
                      setPalette(n)
                    }}
                    className="pop-input w-full p-1.5 text-xs font-mono text-center border-[2px] rounded-md uppercase font-black"
                    maxLength={7}
                  />
                </div>
              ))}
            </div>
          </SubToolbox>

          <SubToolbox
            collapsible
            title="Images"
            icon={<CustomIcon name="image" size={20} />}
            paletteIndex={5}>
            <div className="space-y-4">
              <StandardUploadBox
                label="DROP FILES OR CLICK TO UPLOAD\nUpload Reference Images"
                minHeight="112px"
                iconBgColor="#00CCFF"
                onUpload={(files) => {
                  if (files) {
                    const news = Array.from(files).map((f) => ({
                      id: crypto.randomUUID(),
                      file: f,
                      previewUrl: URL.createObjectURL(f),
                      usageType: "background",
                    }))
                    setReferenceImages((prev) => [...prev, ...news])
                  }
                }}
              />
              <div className="grid grid-cols-1 gap-2">
                {referenceImages.map((img) => (
                  <div
                    key={img.id}
                    className="border-[2px] border-black p-2 rounded-lg bg-white flex gap-3 items-center shadow-[3px_3px_0px_0px_black]">
                    <img
                      src={img.previewUrl}
                      className="w-10 h-10 object-cover border-[2px] border-black rounded-md"
                      alt="ref"
                    />
                    <select className="pop-input flex-1 p-1 text-[9px] font-black uppercase border-[2px] rounded-md">
                      <option>Style Reference</option>
                      <option>Background</option>
                    </select>
                    <button
                      onClick={() =>
                        setReferenceImages((prev) => prev.filter((i) => i.id !== img.id))
                      }
                      className="text-xl font-black px-2 hover:text-red-500 transition-colors">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </SubToolbox>
        </div>

        {/* Column 2: Canvas */}
        <div className="flex flex-col h-full gap-6 min-h-0">
          <div className="flex-1 min-h-0 w-full border-[4px] border-black bg-[#f1f5f9] rounded-[48px] shadow-[12px_12px_0px_0px_black] relative flex items-center justify-center p-8 overflow-hidden transition-all duration-700">
            {generatedImage ? (
              <img
                src={generatedImage}
                alt="Gen"
                className="max-w-full max-h-full object-contain border-[4px] border-black rounded-3xl shadow-[8px_8px_0px_0px_black]"
              />
            ) : (
              <div className="text-center p-12 bg-white border-[4px] border-black rounded-[48px] shadow-[8px_8px_0px_0px_black] w-full max-w-sm transform hover:scale-[1.02] transition-transform duration-500">
                <div className="w-20 h-20 bg-[#FFB158] border-[4px] border-black rounded-full mx-auto mb-8 flex items-center justify-center shadow-[6px_6px_0px_0px_black] animate-pulse">
                  <CustomIcon name="!!!POST-VIDEO" size={32} />
                </div>
                <h3 className="text-4xl font-[1000] uppercase tracking-tighter text-black leading-none mb-4 italic">
                  CANVAS STANDBY
                </h3>
                <p className="font-black text-black/20 uppercase tracking-[0.3em] text-[10px]">
                  Generator Sequence Ready
                </p>
              </div>
            )}
          </div>

          {!hasGeminiKey() ? (
            <button
              onClick={() => (window.location.href = "/settings")}
              className="w-full h-14 bg-black border-[4px] border-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.98] shadow-[6px_6px_0px_0px_#FFDD00] hover:shadow-[6px_6px_0px_0px_white] translate-y-0 hover:translate-y-1 hover:translate-x-1">
              <CustomIcon name="zap" size={24} className="text-[#FFDD00]" />
              <span className="text-[20px] sm:text-[24px] font-[1000] uppercase tracking-tighter text-[#FFDD00] leading-none mt-[-2px]">
                MISSING API KEY: SETTINGS
              </span>
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={genLoading || !prompt}
              className="w-full h-14 bg-[#f3f4f6] border-[4px] border-black rounded-2xl overflow-hidden flex items-center group transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-[6px_6px_0px_0px_black] hover:shadow-none translate-y-0 hover:translate-y-1 hover:translate-x-1">
              <div className="bg-gray-200 h-full w-14 flex items-center justify-center border-r-[4px] border-black flex-shrink-0 group-hover:bg-[#FFB158] transition-colors">
                <CustomIcon
                  name="zap"
                  size={32}
                  className="opacity-40 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="flex-1 flex items-center justify-center pr-14">
                <span className="text-[36px] font-[1000] uppercase tracking-tighter text-black/30 group-hover:text-black transition-colors leading-none mt-[-2px]">
                  {genLoading ? "CREATING..." : "GENERATE TEMPLATE"}
                </span>
              </div>
            </button>
          )}

          {generatedImage && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <PostActionReflection toolId="END_SCREEN_TOOL" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
