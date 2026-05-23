import React, { useState, useRef } from "react"
import {
 generateThumbnail,
 rateThumbnail,
 generateThumbnailConcept,
 hasGeminiKey,
} from "../services/gemini"
import type { ThumbnailConceptResult } from "../services/gemini"
import {
 AspectRatio,
 ImageSize,
 type SeoResult,
 type ThumbnailHistoryItem,
} from "../types"
import { useBrain } from "../context/useBrain"
import { CustomIcon } from "../components/CustomIcon"
import {
 ToolboxScaffold,
 SubToolbox,
 StandardInput,
 StandardUploadBox,
 StandardTextArea,
 SubToolboxActionButton,
 SubToolboxGridActionButton,
 SubToolboxDropdownControl,
} from "../components/Toolbox"
import { StandardButton } from "../components/StandardButton"
import { PostActionReflection } from "../components/PostActionReflection"

interface ReferenceImage {
 id: string
 file: File
 previewUrl: string
 usageType: string
}

interface ThumbnailStudioProps {
 embedded?: boolean
 collapsible?: boolean
 isOpenInitial?: boolean
 paletteIndex?: number
}

const ThumbnailStudio: React.FC<ThumbnailStudioProps> = ({
 embedded = false,
 collapsible = false,
 isOpenInitial = true,
 paletteIndex,
}) => {
 const { brain } = useBrain()

 // Tab State
 const [activeTab, setActiveTab] = useState<"generate" | "analyze">("generate")
 const [isOpen, setIsOpen] = useState(isOpenInitial)

 // Loading States
 const [genLoading, setGenLoading] = useState(false)
 const [conceptLoading, setConceptLoading] = useState(false)
 const [analyzeLoading, setAnalyzeLoading] = useState(false)

 // Core States
 const [prompt, setPrompt] = useState("")
 const [hookText, setHookText] = useState("")
 const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
  AspectRatio.LANDSCAPE_16_9,
 )
 const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.SIZE_1K)
 const [generatedImage, setGeneratedImage] = useState<string | null>(null)
 const [history, setHistory] = useState<ThumbnailHistoryItem[]>([])
 const [surfaceMode, setSurfaceMode] = useState<"mobile" | "ctv">("mobile")
 const [expression, setExpression] = useState<string>("none")
 const [aiHookText, setAiHookText] = useState("")
 const [aiExpression, setAiExpression] = useState("")
 const [aiColorStrategy, setAiColorStrategy] = useState("")
 const [showSquintTest, setShowSquintTest] = useState(false)

 // Feature Toggles
 const [useReferenceImages, setUseReferenceImages] = useState<boolean>(true)
 const [usePalette, setUsePalette] = useState<boolean>(false)
 const [useStyles, setUseStyles] = useState<boolean>(true)

 // Advanced States
 const [selectedStyles, setSelectedStyles] = useState<string[]>([])
 const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([])
 const [palette, setPalette] = useState<string[]>([
  "#CCFF00",
  "#FF3399",
  "",
  "",
  "",
 ])

 // Analyzer States
 const [analysisFile, setAnalysisFile] = useState<File | null>(null)
 const [analysisPreview, setAnalysisPreview] = useState<string | null>(null)
 const [analysisResult, setAnalysisResult] = useState<string>("")
 const fileInputRef = useRef<HTMLInputElement>(null)

 const THUMBNAIL_STYLES = [
  "Authentic/Candid",
  "Lo-Fi",
  "Uncanny/Liminal",
  "Proof of Human",
  "Cinematic",
  "Documentary",
  "Minimalist",
  "Dark & Moody",
  "High Contrast",
  "Educational",
  "Graphic",
  "Mysterious",
  "Vibrant",
  "Retro/Vintage",
  "Futuristic",
  "3D Rendered",
  "Photorealistic",
  "Surreal",
  "Neon/Cyberpunk",
  "Watercolor",
 ]

 const EXPRESSIONS = [
  { id: "surprise", label: "Surprise", emoji: "😲", stat: "+35% CTR", niche: "Entertainment" },
  { id: "concern", label: "Concern", emoji: "😟", stat: "2.3M avg views", niche: "Documentary" },
  { id: "focus", label: "Focus", emoji: "🧐", stat: "+12% CTR", niche: "Tech/Gaming" },
  { id: "smile", label: "Smile", emoji: "😊", stat: "+23% CTR", niche: "Tutorials" },
 ]

 const currentSeoResult = brain.seoState?.results?.[0] || null

 const handleManualConceptGen = async () => {
  if (!currentSeoResult && !prompt) return
  setConceptLoading(true)
  try {
   const concept: ThumbnailConceptResult = await generateThumbnailConcept(
    currentSeoResult || undefined,
    prompt,
    brain,
    expression !== "none" ? expression : undefined,
    surfaceMode,
   )
   setPrompt(concept.prompt)
   setAspectRatio(concept.aspectRatio)
   setAiHookText(concept.hookText)
   setAiExpression(concept.expression)
   setAiColorStrategy(concept.colorStrategy)
   if (concept.hookText && !hookText) setHookText(concept.hookText)
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

 const handleReferenceImageUpload = (
  e: React.ChangeEvent<HTMLInputElement>,
 ) => {
  if (e.target.files) {
   const newImages = Array.from(e.target.files).map((file) => ({
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    usageType: "background",
   }))
   setReferenceImages((prev) => [...prev, ...newImages])
  }
 }

 const handleDrop = (e: React.DragEvent) => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer.files)
  if (files.length > 0) {
   const newImages = files.map((file) => ({
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    usageType: "background",
   }))
   setReferenceImages((prev) => [...prev, ...newImages])
  }
 }

 const handleDragOver = (e: React.DragEvent) => e.preventDefault()

 const handleGenerate = async () => {
  if (!prompt) return
  setGenLoading(true)
  try {
   const activeColors = palette.filter((c) => c.trim() !== "")
   const paletteWeights = ["60%", "30%", "10%"]
   const paletteContext =
    usePalette && activeColors.length > 0
     ? `\n\nCRITICAL COLOR PALETTE: Strictly follow the 60-30-10 distribution: ${activeColors.map((c, i) => `${c} (${paletteWeights[i] || "accent"})`).join(", ")}.`
     : ""
   const styleContext =
    useStyles && selectedStyles.length > 0
     ? `\n\nCRITICAL STYLE REQUIREMENTS: The thumbnail MUST be generated using a combination of the following styles: ${selectedStyles.join(", ")}.`
     : ""
   const finalPrompt = prompt + styleContext + paletteContext
   const img = await generateThumbnail(
    finalPrompt,
    aspectRatio,
    imageSize,
    hookText || undefined,
    surfaceMode,
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

 const handleAnalyze = async () => {
  if (!analysisFile) return
  setAnalyzeLoading(true)
  try {
   const reader = new FileReader()
   reader.onloadend = async () => {
    const base64String = (reader.result as string).split(",")[1]
    const context = currentSeoResult
     ? {
        concept: currentSeoResult.concept,
        niche: currentSeoResult.niche,
       }
     : undefined
    const result = await rateThumbnail(base64String, analysisFile.type, { concept: brain.coreConcept, niche: brain.targetNiche });

    setAnalysisResult(result)
    setAnalyzeLoading(false)
   }
   reader.readAsDataURL(analysisFile)
  } catch (e) {
   setAnalyzeLoading(false)
   alert("Analysis failed.")
  }
 }

 // Helper for flush buttons in V2.1.2

 const StudioButton = ({
  onClick,
  color,
  icon,
  label,
 }: {
  onClick: () => void
  color: string
  icon: string
  label: string
 }) => (
  <StandardButton
   accentColor={color.replace('bg-[', '').replace(']', '')}
   onClick={onClick}
   className="flex items-center w-full h-12">
   <CustomIcon name={icon} size={16} className="mr-2" />
   {label}
  </StandardButton>
 )

 return (
 <ToolboxScaffold
  title="THUMBNAIL STUDIO"
  subtitle="Generate Thumbnails for all your videos. + Images for Endscreens, Posts, Polls + More"
 icon={<CustomIcon name="image" size={40} className="text-black" />}
 headerColor="bg-[#FFE357]"
 iconBoxColor="bg-[#CCFF00]"
 paletteIndex={paletteIndex}
  collapsible={collapsible}
  isOpen={isOpen}
  onToggle={() => setIsOpen(!isOpen)}
  embedded={embedded}
  helpText="Build strong thumbnail ideas fast. Get overlay text, visual direction, and composition prompts in one place."
  shellClassName="animate-fade-in"
   contentClassName={embedded ? "p-0" : "p-8 min-h-[600px] relative bg-white"}
   headerActions={
    <div className="flex bg-white border-[4px] border-black p-1 rounded-xl shadow-[3px_3px_0px_0px_black] mr-2 h-12 my-auto">
     <button
      onClick={(e) => {
       e.stopPropagation()
       setActiveTab("generate")
      }}
      className={`px-5 text-[11px] font-[1000] uppercase tracking-tighter rounded-lg transition-all flex items-center gap-2 ${activeTab === "generate" ? "bg-black text-white" : "text-black/30 hover:text-black"}`}>
      Studio
     </button>
     <button
      onClick={(e) => {
       e.stopPropagation()
       setActiveTab("analyze")
      }}
      className={`px-5 text-[11px] font-[1000] uppercase tracking-tighter rounded-lg transition-all flex items-center gap-2 ${activeTab === "analyze" ? "bg-black text-white" : "text-black/30 hover:text-black"}`}>
      Analyzer
     </button>
    </div>
   }>
   {/* Generated History Bar */}
   {activeTab === "generate" && history.length > 0 && (
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

   {/* Studio Tab — Animated Transition */}
   <div
    className={`transition-all duration-500 transform ${activeTab === "generate" ? "opacity-100 scale-100 translate-x-0 relative" : "opacity-0 scale-95 -translate-x-10 pointer-events-none absolute inset-8"}`}>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-full">
     {/* Column 1: Narrower Tool Stack */}
     <div className="flex flex-col h-full gap-6">
      <SubToolbox
       collapsible
       title="Concept"
       icon={<CustomIcon name="!!!IDEA" size={20} />}
       paletteIndex={2}
       isOpenInitial={true}>
       <div className="space-y-4">
        <StandardTextArea
         value={prompt}
         onChange={(e) => setPrompt(e.target.value)}
         placeholder="Describe the image concept..."
         minHeight="112px"
         hasBorder={false}
         className="w-full p-0 text-sm font-bold bg-transparent outline-none resize-none placeholder:text-black/10 text-black leading-tight"
        />
        {aiColorStrategy && (
         <div className="bg-gray-50 border-[2px] border-black rounded-lg p-3 space-y-1">
          <p className="text-[9px] font-[1000] uppercase tracking-wider text-black/40">AI INTELLIGENCE</p>
          {aiHookText && <p className="text-xs font-black"><span className="text-black/40">Hook:</span> "{aiHookText}"</p>}
          {aiExpression && aiExpression !== "none" && <p className="text-xs font-black"><span className="text-black/40">Expression:</span> {aiExpression}</p>}
          {aiColorStrategy && <p className="text-xs font-black"><span className="text-black/40">Color:</span> {aiColorStrategy}</p>}
         </div>
        )}
        <div className="flex justify-end">
         <div className="w-full max-w-[240px]">
          <SubToolboxActionButton
           label={conceptLoading ? "Refreshing..." : "Auto-Refine"}
           iconName="sparkles"
           tone="yellow"
           onClick={handleManualConceptGen}
           disabled={conceptLoading}
          />
         </div>
        </div>
       </div>
      </SubToolbox>

      <SubToolbox
       collapsible
       title="Styles"
       icon={<CustomIcon name="!!!COLLECTION" size={20} />}
       paletteIndex={1}
       isOpenInitial={false}>
       <div className="grid grid-cols-3 gap-2">
        {THUMBNAIL_STYLES.map((style) => (
         <button
          key={style}
          onClick={() => handleStyleToggle(style)}
          className={`px-2 py-2 border-[2px] border-black rounded-lg font-black uppercase text-[9px] shadow-[2px_2px_0px_0px_black] active:translate-y-0.5 active:shadow-none transition-all ${selectedStyles.includes(style) ? "bg-[#FFE357]" : "bg-white"}`}>
          {style}
         </button>
        ))}
       </div>
      </SubToolbox>

      <SubToolbox
       collapsible
       title="Expression"
       icon={<span className="text-lg">😲</span>}
       paletteIndex={3}
       isOpenInitial={false}>
       <div className="grid grid-cols-2 gap-2">
        {EXPRESSIONS.map((expr) => (
         <button
          key={expr.id}
          onClick={() => setExpression(expression === expr.id ? "none" : expr.id)}
          className={`p-3 border-[2px] border-black rounded-lg text-left transition-all active:translate-y-0.5 active:shadow-none ${expression === expr.id ? "bg-[#FFE357] shadow-[3px_3px_0px_0px_black]" : "bg-white shadow-[2px_2px_0px_0px_black]"}`}>
          <div className="flex items-center gap-2 mb-1">
           <span className="text-xl">{expr.emoji}</span>
           <span className="font-[1000] uppercase text-[10px] tracking-tight">{expr.label}</span>
          </div>
          <p className="text-[8px] font-black text-black/40 uppercase">{expr.stat} · {expr.niche}</p>
         </button>
        ))}
       </div>
      </SubToolbox>

      <SubToolbox
       collapsible
       title="Hook Text"
       icon={<CustomIcon name="!!!TEXT" size={20} />}
       paletteIndex={0}
       isOpenInitial={false}>
       <div className="space-y-2">
        <StandardInput
         value={hookText}
         onChange={(e) => {
          const words = e.target.value.trim().split(/\s+/).filter(Boolean)
          if (words.length <= 3 || e.target.value.length < hookText.length) {
           setHookText(e.target.value)
          }
         }}
         placeholder="HOOK (MAX 3 WORDS)"
         className="text-base"
        />
        <div className="flex justify-between items-center">
         <p className="text-[9px] font-[1000] uppercase tracking-wider text-black/30">
          {hookText.trim().split(/\s+/).filter(Boolean).length}/3 words
         </p>
         {hookText.trim().split(/\s+/).filter(Boolean).length > 3 && (
          <p className="text-[9px] font-[1000] uppercase text-red-500">TOO MANY WORDS</p>
         )}
        </div>
        <p className="text-[8px] font-bold text-black/20 uppercase">Open a curiosity gap. Never repeat the title.</p>
       </div>
      </SubToolbox>

      <SubToolbox
       collapsible
       title="Images"
       icon={<CustomIcon name="image" size={20} />}
       paletteIndex={5}
       isOpenInitial={false}>
       <div className="space-y-4">
        <StandardUploadBox
          label="DROP FILES OR CLICK TO UPLOAD\nUpload Images"
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
           <select className="vt-input-standard flex-1 p-1 text-[9px] font-black uppercase border-[2px] rounded-md">
            <option>Background</option>
            <option>Subject</option>
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

      <SubToolbox
       collapsible
       title="Palette (60-30-10)"
       icon={<CustomIcon name="paint-bucket" size={20} />}
       paletteIndex={4}
       isOpenInitial={false}>
       <div className="flex justify-between items-start gap-3 py-2">
        {palette.map((c, i) => {
         const weightLabels = ["60%", "30%", "10%", "+", "+"]
         const roleLabels = ["Background", "Subject", "Accent", "Optional", "Optional"]
         return (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
           <p className={`text-[10px] font-[1000] uppercase ${i < 3 ? 'text-black' : 'text-black/20'}`}>{weightLabels[i]}</p>
           <div
            style={{ backgroundColor: c || "#f3f4f6" }}
            onClick={() => document.getElementById(`cp7-${i}`)?.click()}
            className="w-full aspect-[2/3] border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_black] relative overflow-hidden flex items-center justify-center cursor-pointer group">
            <input
             id={`cp7-${i}`}
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
            className="vt-input-standard w-full p-1.5 text-xs font-mono text-center border-[2px] rounded-md uppercase font-black"
            maxLength={7}
           />
           <p className="text-[7px] font-bold text-black/20 uppercase">{roleLabels[i]}</p>
          </div>
         )
        })}
       </div>
      </SubToolbox>
     </div>

     {/* Column 2: Canvas (Matched Width) + Controls */}
     <div className="flex flex-col h-full gap-6 min-h-0">
      <div className="flex-1 min-h-0 w-full border-[4px] border-black bg-[#f1f5f9] rounded-[48px] shadow-[12px_12px_0px_0px_black] relative flex items-center justify-center p-8 overflow-hidden transition-all duration-700">
       {generatedImage ? (
        <>
         <img
          src={generatedImage}
          alt="Gen"
          className="max-w-full max-h-full object-contain border-[4px] border-black rounded-3xl shadow-[8px_8px_0px_0px_black]"
         />
         {showSquintTest && (
          <div className="absolute top-4 right-4 bg-white border-[3px] border-black rounded-xl p-2 shadow-[4px_4px_0px_0px_black] z-10">
           <p className="text-[8px] font-[1000] uppercase text-center mb-1 tracking-wider">SQUINT TEST (130px)</p>
           <img
            src={generatedImage}
            alt="Squint"
            style={{ width: "130px", filter: "blur(0.5px)" }}
            className="border-[2px] border-black rounded-md"
           />
           <p className="text-[7px] font-bold text-black/40 text-center mt-1 uppercase">Can you read it?</p>
          </div>
         )}
        </>
       ) : (
        <div className="text-center p-12 bg-white border-[4px] border-black rounded-[48px] shadow-[8px_8px_0px_0px_black] w-full max-w-sm transform hover:scale-[1.02] transition-transform duration-500">
         <div className="w-20 h-20 bg-[#FF7497] border-[4px] border-black rounded-full mx-auto mb-8 flex items-center justify-center shadow-[6px_6px_0px_0px_black] animate-pulse">
          <CustomIcon name="zap" size={32} />
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

      <div className="grid grid-cols-3 gap-4 items-end">
       <div>
        <SubToolboxDropdownControl
         label="Ratio"
         value={aspectRatio}
         options={Object.values(AspectRatio)}
         onChange={(value) => setAspectRatio(value as AspectRatio)}
         tone="green"
        />
       </div>
       <div>
        <SubToolboxDropdownControl
         label="Size"
         value={imageSize}
         options={Object.values(ImageSize)}
         onChange={(value) => setImageSize(value as ImageSize)}
         tone="green"
        />
       </div>
       <div>
        <p className="text-[9px] font-[1000] uppercase tracking-wider text-black/40 mb-1">Surface</p>
        <div className="flex bg-white border-[3px] border-black rounded-lg overflow-hidden shadow-[3px_3px_0px_0px_black]">
         <button
          onClick={() => setSurfaceMode("mobile")}
          className={`flex-1 py-2.5 text-[9px] font-[1000] uppercase tracking-tight transition-all ${surfaceMode === "mobile" ? "bg-black text-white" : "text-black/30 hover:text-black"}`}>
          📱 Mobile
         </button>
         <button
          onClick={() => setSurfaceMode("ctv")}
          className={`flex-1 py-2.5 text-[9px] font-[1000] uppercase tracking-tight transition-all ${surfaceMode === "ctv" ? "bg-black text-white" : "text-black/30 hover:text-black"}`}>
          📺 CTV
         </button>
        </div>
       </div>
      </div>

      {generatedImage && (
       <button
        onClick={() => setShowSquintTest(!showSquintTest)}
        className={`w-full py-3 border-[3px] border-black rounded-xl font-[1000] text-[11px] uppercase tracking-tight transition-all shadow-[3px_3px_0px_0px_black] active:translate-y-0.5 active:shadow-none ${showSquintTest ? "bg-[#00CCFF] text-black" : "bg-white text-black/50 hover:text-black"}`}>
        📱 {showSquintTest ? "HIDE SQUINT TEST" : "SQUINT TEST (130px)"}
       </button>
      )}

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
       <SubToolboxGridActionButton
        label={genLoading ? "Creating..." : "Generate Art"}
        iconName="zap"
        tone="yellow"
        onClick={handleGenerate}
        disabled={genLoading || !prompt}
       />
      )}

      {generatedImage && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <PostActionReflection toolId="THUMBNAIL_STUDIO" />
        </div>
      )}
     </div>
    </div>
   </div>

   {/* Analyzer Tab — Animated Transition */}
   <div
    className={`transition-all duration-500 transform ${activeTab === "analyze" ? "opacity-100 scale-100 translate-x-0 relative" : "opacity-0 scale-95 translate-x-10 pointer-events-none absolute inset-8"}`}>
    <div className="flex flex-col lg:flex-row gap-10 h-full">
     <div className="w-full lg:w-1/2 flex flex-col gap-6">
      <div
       onClick={() => fileInputRef.current?.click()}
       className="w-full border-[4px] border-black bg-white rounded-2xl shadow-[8px_8px_0px_0px_black] group cursor-pointer overflow-hidden">
       <div className="h-14 bg-[#FF7497] border-b-[4px] border-black flex items-center px-6 gap-4">
        <div className="bg-white p-2 rounded-lg border-[2px] border-black shadow-[2px_2px_0px_0px_black]">
         <CustomIcon name="!!!CLOUD" size={20} />
        </div>
        <span className="text-lg font-[1000] uppercase tracking-tighter text-black">
         Upload Visuals
        </span>
       </div>
       <div className="h-[300px] flex items-center justify-center bg-gray-50 p-6">
        <input
         type="file"
         ref={fileInputRef}
         className="hidden"
         accept="image/*"
         onChange={(e) => {
          if (e.target.files?.[0]) {
           setAnalysisFile(e.target.files[0])
           const r = new FileReader()
           r.onloadend = () => setAnalysisPreview(r.result as string)
           r.readAsDataURL(e.target.files[0])
          }
         }}
        />
        {analysisPreview ? (
         <img
          src={analysisPreview}
          alt="Preview"
          className="h-full object-contain border-[4px] border-black rounded-xl shadow-[6px_6px_0px_0px_black]"
         />
        ) : (
         <div className="text-center opacity-20">
          <CustomIcon name="search" size={64} />
          <p className="font-black mt-4 uppercase">No Media Loaded</p>
         </div>
        )}

       </div>
      </div>
      <button
       onClick={handleAnalyze}
       disabled={!analysisFile || analyzeLoading}
       className="w-full h-20 border-[6px] border-black bg-[#FFDD00] shadow-[8px_8px_0px_0px_black] rounded-2xl text-4xl font-[1000] uppercase tracking-tighter text-black hover:shadow-none hover:translate-y-1 transition-all disabled:opacity-50">
       {analyzeLoading ? "SCANNING..." : "SCAN POTENTIAL"}
      </button>
     </div>
     <div className="flex-1 bg-gray-50 rounded-2xl border-[4px] border-black p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
       <h4 className="text-xl font-black uppercase">Analysis Result</h4>
      </div>
      <div className="prose max-w-none text-sm font-bold">
       {analyzeLoading
        ? "Running Neural Analysis..."
        : analysisResult || "Upload a thumbnail to see scores."}
      </div>
      {analysisResult && (
       <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
        <PostActionReflection toolId="THUMBNAIL_ANALYZER" />
       </div>
      )}
     </div>
    </div>
   </div>
  </ToolboxScaffold>
 )
}

export default ThumbnailStudio
