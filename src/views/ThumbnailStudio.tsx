import React, { useState, useRef } from "react"
import {
 generateThumbnail,
 rateThumbnail,
 generateThumbnailConcept,
 hasGeminiKey,
} from "../services/gemini"
import {
 AspectRatio,
 ImageSize,
 type SeoResult,
 type ThumbnailHistoryItem,
} from "../types"
import { useBrain } from "../context/GlobalDataContext"
import { CustomIcon } from "../components/CustomIcon"
import { AccordionContainer } from "../components/Toolbox"
import { ToolboxScaffold } from "../components/Toolbox"

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
 const [largeText, setLargeText] = useState("")
 const [smallText, setSmallText] = useState("")
 const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
  AspectRatio.LANDSCAPE_16_9,
 )
 const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.SIZE_1K)
 const [generatedImage, setGeneratedImage] = useState<string | null>(null)
 const [history, setHistory] = useState<ThumbnailHistoryItem[]>([])

 // Feature Toggles (V2.1.2)
 const [useText, setUseText] = useState<boolean>(false)
 const [useReferenceImages, setUseReferenceImages] = useState<boolean>(true) // Default open in some views
 const [usePalette, setUsePalette] = useState<boolean>(false)
 const [useStyles, setUseStyles] = useState<boolean>(true) // Default open

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
  "Educational",
  "Clickbait",
  "Cinematic",
  "Graphic",
  "Simplified",
  "Mysterious",
  "Minimalist",
  "Vibrant",
  "Dark & Moody",
  "Retro/Vintage",
  "Futuristic",
  "Hand-drawn",
  "3D Rendered",
  "Photorealistic",
  "Surreal",
  "Comic Book",
  "Neon/Cyberpunk",
  "Watercolor",
  "High Contrast",
  "Documentary",
 ]

 const currentSeoResult = brain.seoState?.results?.[0] || null

 const handleManualConceptGen = async () => {
  if (!currentSeoResult && !prompt) return
  setConceptLoading(true)
  try {
   const concept = await generateThumbnailConcept(
    currentSeoResult || undefined,
    prompt,
   )
   setPrompt(concept.prompt)
   setAspectRatio(concept.aspectRatio)
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
   const paletteContext =
    usePalette && activeColors.length > 0
     ? `\n\nCRITICAL COLOR PALETTE: You MUST strictly use this color palette: ${activeColors.join(", ")}.`
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
    useText ? largeText : "",
    useText ? smallText : "",
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
    const result = await rateThumbnail(base64String, analysisFile.type, context)
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
 const AddButton = ({
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
  <button
   onClick={onClick}
   className={`flex items-center w-full h-16 border-[4px] border-black shadow-[8px_8px_0px_0px_black] rounded-[20px] overflow-hidden transition-all active:translate-x-1 active:translate-y-1 active:shadow-none group ${color}`}>
   <div className="bg-white h-full w-16 flex items-center justify-center border-r-[4px] border-black flex-shrink-0 group-hover:bg-gray-50">
    <CustomIcon name={icon} size={28} />
   </div>
   <span className="flex-1 text-center text-lg font-[1000] uppercase tracking-tighter text-black">
    {label}
   </span>
  </button>
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
      <AccordionContainer
       title="Concept"
       icon="!!!IDEA"
       headerColor="bg-[#FFB158]"
       iconBoxColor="bg-[#FFE357]"
       isOpenInitial={true}>
       <div className="space-y-4">
        <textarea
         value={prompt}
         onChange={(e) => setPrompt(e.target.value)}
         placeholder="Describe the image concept..."
         className="w-full h-28 p-0 text-sm font-bold bg-transparent outline-none resize-none border-none placeholder:text-black/10 text-black leading-tight"
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
      </AccordionContainer>

      <AccordionContainer
       title="Styles"
       icon="!!!COLLECTION"
       headerColor="bg-[#FF7497]"
       iconBoxColor="bg-[#FFB158]">
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
      </AccordionContainer>

      <AccordionContainer
       title="Text"
       icon="!!!TEXT"
       headerColor="bg-[#CC99FF]"
       iconBoxColor="bg-[#FF7497]">
       <div className="space-y-4">
        <input
         value={largeText}
         onChange={(e) => setLargeText(e.target.value)}
         placeholder="TITLE"
         className="pop-input w-full p-3 border-[3px] text-sm rounded-lg"
        />
        <input
         value={smallText}
         onChange={(e) => setSmallText(e.target.value)}
         placeholder="SUBTITLE"
         className="pop-input w-full p-3 border-[3px] text-sm rounded-lg"
        />
       </div>
      </AccordionContainer>

      <AccordionContainer
       title="Images"
       icon="image"
       headerColor="bg-[#00CCFF]"
       iconBoxColor="bg-[#CC99FF]">
       <div className="space-y-4">
        <div
         onDrop={handleDrop}
         onDragOver={handleDragOver}
         className="w-full h-28 border-[3px] border-black border-dashed rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-2 group hover:bg-gray-100 transition-colors cursor-pointer"
         onClick={() => document.getElementById("med-up")?.click()}>
         <input
          type="file"
          multiple
          id="med-up"
          className="hidden"
          onChange={(e) => {
           if (e.target.files) {
            const news = Array.from(e.target.files).map((f) => ({
             id: crypto.randomUUID(),
             file: f,
             previewUrl: URL.createObjectURL(f),
             usageType: "background",
            }))
            setReferenceImages((prev) => [...prev, ...news])
           }
          }}
         />
         <div className="bg-white p-2 rounded-full border-[2px] border-black shadow-[2px_2px_0px_0px_black]">
          <CustomIcon name="!!!CLOUD" size={20} />
         </div>
         <span className="font-black uppercase text-[10px] tracking-tight text-black/30 group-hover:text-black transition-colors">
          Drop files or Click to Upload
         </span>
        </div>
        <button
         onClick={() => document.getElementById("med-up")?.click()}
         className="w-full h-10 bg-[#FCAF57] border-[3px] border-black rounded-xl font-[1000] uppercase text-sm tracking-tighter shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-y-0.5 transition-all flex items-center justify-center gap-2">
         <CustomIcon name="!!!CLOUD" size={16} /> Upload Images
        </button>
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
      </AccordionContainer>

      <AccordionContainer
       title="Palette"
       icon="!!!PALETTE"
       headerColor="bg-[#CCFF00]"
       iconBoxColor="bg-[#00CCFF]">
       <div className="flex justify-between items-start gap-3 py-2">
        {palette.map((c, i) => (
         <div key={i} className="flex flex-col items-center gap-2 flex-1">
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
           className="pop-input w-full p-1.5 text-xs font-mono text-center border-[2px] rounded-md uppercase font-black"
           maxLength={7}
          />
         </div>
        ))}
       </div>
      </AccordionContainer>
     </div>

     {/* Column 2: Canvas (Matched Width) + Controls */}
     <div className="flex flex-col h-full gap-6 min-h-[520px]">
      <div className="flex-1 w-full border-[4px] border-black bg-[#f1f5f9] rounded-[48px] shadow-[12px_12px_0px_0px_black] relative flex items-center justify-center p-8 overflow-hidden transition-all duration-700">
       {generatedImage ? (
        <img
         src={generatedImage}
         alt="Gen"
         className="max-w-full max-h-full object-contain border-[4px] border-black rounded-3xl shadow-[8px_8px_0px_0px_black]"
        />
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

      <div className="grid grid-cols-2 gap-6">
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-black/20 tracking-[0.2em] pl-1">
         Vibe Ratio
        </label>
        <select
         value={aspectRatio}
         onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
         className="pop-input w-full h-[64px] px-6 border-[4px] border-black text-xl rounded-2xl font-[1000] appearance-none bg-white cursor-pointer shadow-[4px_4px_0_0_black] hover:shadow-none transition-all">
         {Object.values(AspectRatio).map((r) => (
          <option key={r} value={r}>
           {r}
          </option>
         ))}
        </select>
       </div>
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-black/20 tracking-[0.2em] pl-1">
         Resolution
        </label>
        <select
         value={imageSize}
         onChange={(e) => setImageSize(e.target.value as ImageSize)}
         className="pop-input w-full h-[64px] px-6 border-[4px] border-black text-xl rounded-2xl font-[1000] appearance-none bg-white cursor-pointer shadow-[4px_4px_0_0_black] hover:shadow-none transition-all">
         {Object.values(ImageSize).map((s) => (
          <option key={s} value={s}>
           {s}
          </option>
         ))}
        </select>
       </div>
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
        <div className="bg-gray-200 h-full w-14 flex items-center justify-center border-r-[4px] border-black flex-shrink-0 group-hover:bg-[#FF7497] transition-colors">
         <CustomIcon
          name="zap"
          size={32}
          className="opacity-40 group-hover:opacity-100 transition-opacity"
         />
        </div>
        <div className="flex-1 flex items-center justify-center pr-14">
         <span className="text-[36px] font-[1000] uppercase tracking-tighter text-black/30 group-hover:text-black transition-colors leading-none mt-[-2px]">
          {genLoading ? "CREATING..." : "GENERATE ART"}
         </span>
        </div>
       </button>
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
     </div>
    </div>
   </div>
  </ToolboxScaffold>
 )
}

export default ThumbnailStudio
