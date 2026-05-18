import React, { useState, useRef, useEffect } from "react"
import { useBrain } from "../context/useBrain"
import { analyzeMediaContent, transcribeMediaContent } from "../services/gemini"
import { compressMediaForAnalysis } from "../services/analysisCompression"
import type { MediaAnalysisResult } from "../types"
import {
 LineChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
} from "recharts"
import { Search, Upload, AlignLeft, Target, FileText } from "lucide-react"
import { ToolboxScaffold, SubToolbox, StandardInput, StandardUploadBox, StandardTextArea } from "../components/Toolbox"
import { PostActionReflection } from "../components/PostActionReflection"

interface MediaAnalyzerProps {
 embedded?: boolean
 collapsible?: boolean
 isOpenInitial?: boolean
 paletteIndex?: number
}

const MEDIA_ANALYZER_LAST_RESULT_KEY = "vt_media_analyzer_last_result"
const ANALYSIS_HIGH_COST_CONFIRM_BYTES = 8 * 1024 * 1024

type StrategicSuggestionCard = {
 number: string
 title?: string
 text: string
}

const STRATEGIC_SECTION_LABELS = [
 "Gap",
 "Search Intent",
 "Verbal SEO",
 "Retention Spike Suggestions",
 "Retention Suggestions",
 "Retention",
]

const parseStrategicSuggestionCards = (
 strategicText: string,
): { intro: string; cards: StrategicSuggestionCard[] } => {
 const trimmed = strategicText.trim()
 if (!trimmed) return { intro: "", cards: [] }

 const firstSuggestionIndex = trimmed.search(/\b1\.\s/)
 if (firstSuggestionIndex > -1) {
  const intro =
   firstSuggestionIndex > 0 ? trimmed.slice(0, firstSuggestionIndex).trim() : ""
  const suggestionBody = trimmed.slice(firstSuggestionIndex)
  const cards = Array.from(
   suggestionBody.matchAll(/(\d+)\.\s*([\s\S]*?)(?=(?:\s+\d+\.\s)|$)/g),
  )
   .map((match) => ({
    number: match[1],
    text: match[2].trim(),
   }))
   .filter((card) => card.text.length > 0)
  return { intro, cards }
 }

 const labelPattern = STRATEGIC_SECTION_LABELS.map((label) =>
  label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
 ).join("|")
 const labelRegex = new RegExp(
  `(?:^|\\n|\\s)(${labelPattern})\\s*:\\s*([\\s\\S]*?)(?=(?:\\n|\\s)(?:${labelPattern})\\s*:|$)`,
  "gi",
 )
 const cards: StrategicSuggestionCard[] = []
 let match: RegExpExecArray | null
 while ((match = labelRegex.exec(trimmed)) !== null) {
  const title = match[1]?.trim()
  const text = match[2]?.trim()
  if (!title || !text) continue
  cards.push({
   number: String(cards.length + 1),
   title,
   text,
  })
 }
 if (cards.length > 0) {
  const firstLabelMatch = trimmed.search(new RegExp(`(${labelPattern})\\s*:`, "i"))
  const intro = firstLabelMatch > 0 ? trimmed.slice(0, firstLabelMatch).trim() : ""
  return { intro, cards }
 }

 return { intro: trimmed, cards: [] }
}

const normalizeSuggestionCards = (
 cards: StrategicSuggestionCard[],
 suggestions?: string[],
): StrategicSuggestionCard[] => {
 const fromSuggestions = Array.isArray(suggestions)
  ? suggestions
     .map((text, index) => ({
      number: String(index + 1),
      title: `Suggestion ${index + 1}`,
      text: String(text || "").trim(),
     }))
     .filter((entry) => entry.text.length > 0)
  : []
 if (cards.length > 0 && fromSuggestions.length === 0) return cards
 if (cards.length === 0 && fromSuggestions.length > 0) return fromSuggestions
 return [...cards, ...fromSuggestions]
}

const loadLastMediaAnalysisResult = (): MediaAnalysisResult | null => {
 try {
  const raw = localStorage.getItem(MEDIA_ANALYZER_LAST_RESULT_KEY)
  if (!raw) return null
  const parsed = JSON.parse(raw) as MediaAnalysisResult
  if (!parsed || typeof parsed !== "object") return null
  if (!parsed.analysis && !parsed.strategicAnalysis && !parsed.retentionCurve?.length) return null
  return parsed
 } catch {
  return null
 }
}

const MediaAnalyzer: React.FC<MediaAnalyzerProps> = ({
 embedded = false,
 collapsible = false,
 isOpenInitial = true,
 paletteIndex,
}) => {
 const { brain } = useBrain()
 const [file, setFile] = useState<File | null>(null)
 const [prompt, setPrompt] = useState("")
 const [analysisResult, setAnalysisResult] =
  useState<MediaAnalysisResult | null>(() => loadLastMediaAnalysisResult())
 const [transcriptResult, setTranscriptResult] = useState("")
 const [script, setScript] = useState("")
 const [videoConcept, setVideoConcept] = useState("")
 const [targetNiche, setTargetNiche] = useState("")
 const [intendedAudience, setIntendedAudience] = useState("")
 const [isAnalyzing, setIsAnalyzing] = useState(false)
 const [isTranscribing, setIsTranscribing] = useState(false)
 const [progress, setProgress] = useState(0)
 const [compressionError, setCompressionError] = useState("")
 const [compressionStats, setCompressionStats] = useState<{
  originalBytes: number
  compressedBytes: number
  reductionRatio: number
 } | null>(null)
 const [costGuardToken, setCostGuardToken] = useState("")
 const fileInputRef = useRef<HTMLInputElement>(null)
 const scriptUploadRef = useRef<HTMLInputElement>(null)
 const scriptAudioUploadRef = useRef<HTMLInputElement>(null)
 const [isOpen, setIsOpen] = useState(isOpenInitial)

 useEffect(() => {
  if (!analysisResult) return
  try {
   localStorage.setItem(MEDIA_ANALYZER_LAST_RESULT_KEY, JSON.stringify(analysisResult))
  } catch {
   // no-op
  }
 }, [analysisResult])

 useEffect(() => {
  let interval: number
  if (isAnalyzing || isTranscribing) {
   setProgress(10)
   interval = window.setInterval(() => {
    setProgress((prev) => {
     if (prev >= 90) return prev
     return prev + Math.random() * 10
    })
   }, 500)
  } else {
   setProgress(100)
   setTimeout(() => setProgress(0), 1000)
  }
  return () => clearInterval(interval)
 }, [isAnalyzing, isTranscribing])

 const fileToGenerativePart = async (
  file: Blob,
  mimeTypeOverride?: string,
 ): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
   const reader = new FileReader()
   reader.onloadend = () => {
    const base64String = (reader.result as string).split(",")[1]
    resolve({
     data: base64String,
     mimeType: mimeTypeOverride || file.type || "video/mp4",
    })
   }
   reader.onerror = reject
   reader.readAsDataURL(file)
  })
 }

 const handleAnalyze = async () => {
  if (!file) return

  setCompressionError("")
  setIsAnalyzing(true)
  setIsTranscribing(true)
  setTranscriptResult("")
  setCompressionStats(null)

  let mediaData: { data: string; mimeType: string }
  try {
   const compressed = await compressMediaForAnalysis(file)
   const nextGuardToken = `${file.name}:${file.size}:${compressed.compressedBytes}`
   if (
    compressed.compressedBytes > ANALYSIS_HIGH_COST_CONFIRM_BYTES &&
    costGuardToken !== nextGuardToken
   ) {
    setCostGuardToken(nextGuardToken)
    const compressedMb = Math.round(compressed.compressedBytes / 1024 / 1024)
    setCompressionError(
     `High-cost guard: compressed analysis file is ${compressedMb}MB. Click Run Analysis again to confirm AI processing.`,
    )
    setIsAnalyzing(false)
    setIsTranscribing(false)
    return
   }
   setCompressionStats({
    originalBytes: compressed.originalBytes,
    compressedBytes: compressed.compressedBytes,
    reductionRatio: compressed.reductionRatio,
   })
   mediaData = await fileToGenerativePart(compressed.file, compressed.mimeType)
  } catch (e) {
   const message =
    e instanceof Error
     ? e.message
     : "Failed to compress media for analysis. Try a shorter or lower-resolution file."
   setCompressionError(message)
   setCostGuardToken("")
   setTranscriptResult("Compression failed. Analysis/transcription blocked.")
   console.error("Compression/encoding error", e)
   setIsAnalyzing(false)
   setIsTranscribing(false)
   return
  }

  const fullPrompt = [prompt, script ? `SCRIPT:\n${script}` : ""].filter(Boolean).join("\n\n")
  analyzeMediaContent(mediaData.data, mediaData.mimeType, fullPrompt, brain, {
   compressedForAnalysis: true,
   compressionProfile: "ultra_small_v1",
  })
   .then((res) => {
    setAnalysisResult(res)
   })
   .catch((e) => console.error(e))
   .finally(() => setIsAnalyzing(false))

  transcribeMediaContent(mediaData.data, mediaData.mimeType, brain, {
   compressedForAnalysis: true,
   compressionProfile: "ultra_small_v1",
  })
   .then((res) => setTranscriptResult(res))
   .catch((e) => {
    console.error(e)
    setTranscriptResult("Error during transcription.")
   })
   .finally(() => setIsTranscribing(false))
 }

 const handleSendInsightsToPublisher = () => {
  if (!analysisResult) return
  const payload = {
   createdAt: new Date().toISOString(),
   concept: videoConcept,
   niche: targetNiche,
   audience: intendedAudience,
   script,
   directive: prompt,
   analysis: analysisResult.analysis,
   strategicAnalysis: analysisResult.strategicAnalysis || "",
  }
  localStorage.setItem("vt_video_publisher_prefill", JSON.stringify(payload))
  window.dispatchEvent(new CustomEvent("vt_media_analysis_insights_ready", { detail: payload }))
 }

 const isLoading = isAnalyzing || isTranscribing

 const subPalette = (offset: number) =>
  paletteIndex === undefined || paletteIndex === null ? undefined : (paletteIndex + 1 + offset) % 8

 const strategicText = analysisResult?.strategicAnalysis || ""
 const strategicParse = parseStrategicSuggestionCards(strategicText)
 const strategicIntro = strategicParse.intro
 const strategicSuggestionCards = normalizeSuggestionCards(
  strategicParse.cards,
  analysisResult?.suggestions,
 )
 const suggestionHeaderTones = [
  "bg-[#FF7497]",
  "bg-[#40C6E9]",
  "bg-[#B9FF58]",
  "bg-[#FFE357]",
  "bg-[#FFB570]",
  "bg-[#D684FF]",
 ]

 return (
 <ToolboxScaffold
  title="CONTENT ANALYSIS"
  subtitle="Analyze scripts + videos to spot pacing issues, retention drops + quality fixes"
  icon={<Search size={40} strokeWidth={3} className="text-black" />}
 headerColor="bg-[#FFB158]"
 iconBoxColor="bg-[#FFDD00]"
 paletteIndex={paletteIndex}
 collapsible={collapsible}
  isOpen={isOpen}
  onToggle={() => setIsOpen(!isOpen)}
  embedded={embedded}
  helpText="Analyze a script or video file to find pacing issues and improvement opportunities. Use it to tighten retention and clarity."
  shellClassName="animate-fade-in"
   contentClassName={embedded ? "p-0" : "p-8"}>
   {isLoading && (
    <div className="w-full bg-gray-200 rounded-2xl h-6 overflow-hidden border-[4px] border-black mb-8 shadow-[4px_4px_0px_0px_black]">
     <div
      className="bg-[#CCFF00] h-full transition-all duration-300 ease-out border-r-[4px] border-black"
      style={{ width: `${progress}%` }}></div>
    </div>
   )}

   <div className="flex-1 flex flex-col gap-8 min-h-0 items-stretch">
    <div className="w-full bg-[#E8FFD1] border-[3px] border-black rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.06em]">
     Analysis-only compression is on. Uploaded media is reduced before AI analysis/transcription to lower cost.
    </div>
    {compressionError && (
     <div className="w-full bg-[#FFD9D9] border-[3px] border-black rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.06em]">
      {compressionError}
     </div>
    )}
    {compressionStats && (
     <div className="w-full bg-[#DFFFF1] border-[3px] border-black rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.06em]">
      Compression: {Math.round(compressionStats.originalBytes / 1024 / 1024)}MB →{" "}
      {Math.max(1, Math.round(compressionStats.compressedBytes / 1024 / 1024))}MB (
      {Math.round(compressionStats.reductionRatio * 100)}% smaller)
     </div>
    )}
    {compressionStats &&
     compressionStats.compressedBytes > ANALYSIS_HIGH_COST_CONFIRM_BYTES && (
      <div className="w-full bg-[#FFF4C9] border-[3px] border-black rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.06em]">
       Cost guard: compressed analysis file exceeds {Math.round(ANALYSIS_HIGH_COST_CONFIRM_BYTES / 1024 / 1024)}MB.
       This may increase AI cost.
      </div>
     )}
    <div className="w-full">
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch md:[grid-auto-rows:1fr]">
      <SubToolbox
       title="VIDEO"
       icon={<Upload size={20} strokeWidth={3} className="text-black" />}
       paletteIndex={subPalette(0)}
       shellClassName="h-full"
       contentClassName="p-5 h-full flex flex-col">
       <div className="flex flex-col gap-3">
       <StandardUploadBox 
        label={file ? file.name : "UPLOAD VIDEO / AUDIO"} 
        minHeight="128px" 
        iconBgColor="#FF3399" 
        onUpload={(files) => setFile(files?.[0] || null)}
       />
       <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-[#FFDD00] border-[3px] border-black p-2 font-black uppercase text-[10px] rounded-xl shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
       >
        Upload Video / Audio
       </button>
       </div>
      </SubToolbox>

      <SubToolbox
       title="SCRIPT"
       icon={<AlignLeft size={20} strokeWidth={3} className="text-black" />}
       paletteIndex={subPalette(1)}
       shellClassName="h-full"
       contentClassName="p-5 h-full flex flex-col">
       <div className="flex flex-col gap-3 h-full min-h-0">
        <StandardTextArea
         value={script}
         onChange={(e) => setScript(e.target.value)}
         placeholder="PASTE YOUR SCRIPT HERE..."
         sizeMode="fill"
         className="text-base"
        />
        <div className="grid grid-cols-2 gap-2 mt-auto">
         <button
          onClick={() => scriptUploadRef.current?.click()}
          className="w-full bg-[#FFB570] border-[3px] border-black p-2 font-black uppercase text-[10px] rounded-xl shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
         >
          Upload Script File
         </button>
         <button
          onClick={() => scriptAudioUploadRef.current?.click()}
          className="w-full bg-[#00CCFF] border-[3px] border-black p-2 font-black uppercase text-[10px] rounded-xl shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
         >
          Upload MP3
         </button>
        </div>
        <input
         ref={scriptUploadRef}
         type="file"
         accept=".txt,.md,.doc,.docx,.rtf,.pdf"
         className="hidden"
         onChange={async (event) => {
          const selected = event.target.files?.[0]
          if (!selected) return
          const text = await selected.text()
          setScript(text)
         }}
        />
        <input
         ref={scriptAudioUploadRef}
         type="file"
         accept=".mp3,audio/*"
         className="hidden"
         onChange={(event) => {
          const selected = event.target.files?.[0]
          if (!selected) return
          setFile(selected)
         }}
        />
       </div>
      </SubToolbox>
      <SubToolbox
       title="VIDEO INFO"
       icon={<Target size={20} strokeWidth={3} className="text-black" />}
       paletteIndex={subPalette(2)}
       shellClassName="h-full"
       contentClassName="p-5 h-full grid grid-cols-1 gap-4">
       <div className="space-y-1">
       <StandardInput
        value={videoConcept}
        onChange={(e) => setVideoConcept(e.target.value)}
        placeholder="Concept"
        className="text-base"
       />
       <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/45 px-1">
        What this video is mainly about
       </p>
       </div>
       <div className="space-y-1">
       <StandardInput
        value={targetNiche}
        onChange={(e) => setTargetNiche(e.target.value)}
        placeholder="Target niche"
        className="text-base"
       />
       <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/45 px-1">
        The audience segment or niche category
       </p>
       </div>
       <div className="space-y-1">
       <StandardInput
        value={intendedAudience}
        onChange={(e) => setIntendedAudience(e.target.value)}
        placeholder="Intended audience"
        className="text-base"
       />
       <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/45 px-1">
        Who this content is intended for
       </p>
       </div>
      </SubToolbox>

      <SubToolbox
       title="ANALYSIS DIRECTIVE"
       icon={<FileText size={20} strokeWidth={3} className="text-black" />}
       paletteIndex={subPalette(3)}
       shellClassName="h-full"
       contentClassName="p-5 h-full flex flex-col">
       <div className="flex flex-col h-full min-h-0">
       <StandardTextArea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        sizeMode="fill"
        className="text-base"
        placeholder="PACING, RETENTION DROPS, CLARITY, STRUCTURE..."
       />
       <div className="h-4" />
       <div className="mt-auto">
        <button
         onClick={handleAnalyze}
         disabled={isLoading || !file}
         className="w-full bg-[#00CCFF] border-[3px] border-black py-4 px-3 font-black uppercase text-sm rounded-xl shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:cursor-not-allowed"
        >
         {isLoading ? "Processing..." : "Run Analysis"}
        </button>
       </div>
       </div>
       <input
        ref={fileInputRef}
        type="file"
        accept="video/*,audio/*"
        className="hidden"
        onChange={(event) => {
         const selected = event.target.files?.[0]
         if (selected) setFile(selected)
        }}
       />
      </SubToolbox>
     </div>
    </div>

    {analysisResult && (
     <div className="w-full space-y-6">
      <SubToolbox
       title="CONTENT OVERVIEW"
       icon={<Search size={20} strokeWidth={3} className="text-black" />}
       paletteIndex={subPalette(4)}
       contentClassName="p-6"
      >
       <div className="flex items-center justify-between mb-4">
        <span className="font-black uppercase tracking-widest text-xs text-black/50">
         Results
        </span>
        {isAnalyzing && (
         <span className="text-xs animate-pulse font-black uppercase">
          Thinking...
         </span>
        )}
       </div>
       <p className="whitespace-pre-wrap text-black leading-relaxed font-bold text-lg">
        {analysisResult.analysis}
       </p>
      </SubToolbox>

      {analysisResult.strategicAnalysis &&
       (strategicIntro || strategicSuggestionCards.length === 0) && (
       <SubToolbox
        title="STRATEGIC ANALYSIS"
        icon={<FileText size={20} strokeWidth={3} className="text-black" />}
        paletteIndex={subPalette(5)}
        contentClassName="p-6"
       >
        {strategicIntro && (
         <p className="whitespace-pre-wrap text-black leading-relaxed font-bold">
          {strategicIntro}
         </p>
        )}
        {!strategicIntro && strategicSuggestionCards.length === 0 && (
         <p className="whitespace-pre-wrap text-black leading-relaxed font-bold">
          {analysisResult.strategicAnalysis}
         </p>
        )}
       </SubToolbox>
      )}

      {strategicSuggestionCards.length > 0 && (
       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-2">
        {strategicSuggestionCards.map((item, index) => (
         <div
          key={`${item.number}-${item.title || "suggestion"}`}
          className="rounded-xl border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_black] overflow-hidden"
         >
          <div
           className={`${suggestionHeaderTones[index % suggestionHeaderTones.length]} border-b-[3px] border-black px-3 py-2`}
          >
           <span className="text-[11px] font-black uppercase tracking-[0.14em] text-black">
            {item.title ? `${item.title}` : `Suggestion ${item.number}`}
           </span>
          </div>
          <div className="p-4">
           <p className="text-black leading-relaxed font-bold text-sm whitespace-pre-wrap">
            {item.text}
           </p>
          </div>
         </div>
        ))}
       </div>
      )}

      {analysisResult.retentionCurve &&
       analysisResult.retentionCurve.length > 0 && (
        <div className="w-full bg-white border-[4px] border-black rounded-xl shadow-[4px_4px_0px_0px_black] overflow-hidden">
         <div className="bg-[#FF7497] border-b-[4px] border-black px-4 py-3">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-black">
           Retention Curve Visualization
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/70 mt-1">
           Plots viewer retention over time to highlight drop-off points and peak engagement moments.
          </p>
         </div>
         <div className="h-64 w-full p-4">
          <ResponsiveContainer
           width="100%"
           height="100%"
           minWidth={1}
           minHeight={1}>
           <LineChart data={analysisResult.retentionCurve}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
             dataKey="timePoint"
             stroke="#000"
             tick={{ fontSize: 12, fontWeight: "900" }}
            />
            <YAxis
             stroke="#000"
             tick={{ fontSize: 12, fontWeight: "900" }}
             domain={[0, 100]}
            />
            <Tooltip
             contentStyle={{
              backgroundColor: "#fff",
              border: "4px solid #000",
              borderRadius: "12px",
              fontWeight: "900",
              color: "#000",
             }}
            />
            <Line
             type="monotone"
             dataKey="retention"
             stroke="#FF7497"
             strokeWidth={5}
             dot={{ stroke: "#000", strokeWidth: 3, r: 6, fill: "#FF7497" }}
            />
           </LineChart>
          </ResponsiveContainer>
         </div>
        </div>
       )}

      <div className="mt-4">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
         onClick={handleSendInsightsToPublisher}
         className="w-full bg-[#CCFF00] border-[4px] border-black p-3 font-black uppercase text-sm rounded-xl shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
         Send Insights to Video Publisher
        </button>
        <button
         onClick={() => {
          setAnalysisResult(null)
          try {
           localStorage.removeItem(MEDIA_ANALYZER_LAST_RESULT_KEY)
          } catch {
           // no-op
          }
         }}
         className="w-full bg-white border-[4px] border-black p-3 font-black uppercase text-sm rounded-xl shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
         Remove Latest Analysis
        </button>
       </div>
      </div>
      <div className="mt-6 animate-in slide-in-from-bottom-4 duration-700">
       <PostActionReflection toolId="MEDIA_ANALYZER" />
      </div>
     </div>
    )}
   </div>
  </ToolboxScaffold>
 )
}

export default MediaAnalyzer
