import React, { useState, useRef, useEffect } from "react"
import { useBrain } from "../context/GlobalDataContext"
import { analyzeMediaContent, transcribeMediaContent } from "../services/gemini"
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
import { ToolboxScaffold, SubToolbox } from "../components/Toolbox"

interface MediaAnalyzerProps {
 embedded?: boolean
 collapsible?: boolean
 isOpenInitial?: boolean
 paletteIndex?: number
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
  useState<MediaAnalysisResult | null>(null)
const [transcriptResult, setTranscriptResult] = useState("")
 const [script, setScript] = useState("")
 const [videoConcept, setVideoConcept] = useState("")
 const [targetNiche, setTargetNiche] = useState("")
 const [intendedAudience, setIntendedAudience] = useState("")
 const [isAnalyzing, setIsAnalyzing] = useState(false)
 const [isTranscribing, setIsTranscribing] = useState(false)
 const [progress, setProgress] = useState(0)
 const fileInputRef = useRef<HTMLInputElement>(null)
 const [isOpen, setIsOpen] = useState(isOpenInitial)

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
  file: File,
 ): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
   const reader = new FileReader()
   reader.onloadend = () => {
    const base64String = (reader.result as string).split(",")[1]
    resolve({
     data: base64String,
     mimeType: file.type,
    })
   }
   reader.onerror = reject
   reader.readAsDataURL(file)
  })
 }

 const handleAnalyze = async () => {
  if (!file) return

  setIsAnalyzing(true)
  setIsTranscribing(true)
  setAnalysisResult(null)
  setTranscriptResult("")

  let mediaData
  try {
   mediaData = await fileToGenerativePart(file)
  } catch (e) {
   console.error("Error reading file", e)
   setIsAnalyzing(false)
   setIsTranscribing(false)
   return
  }

  const fullPrompt = [prompt, script ? `SCRIPT:\n${script}` : ""].filter(Boolean).join("\n\n")
  analyzeMediaContent(mediaData.data, mediaData.mimeType, fullPrompt, brain)
   .then((res) => setAnalysisResult(res))
   .catch((e) => console.error(e))
   .finally(() => setIsAnalyzing(false))

  transcribeMediaContent(mediaData.data, mediaData.mimeType)
   .then((res) => setTranscriptResult(res))
   .catch((e) => {
    console.error(e)
    setTranscriptResult("Error during transcription.")
   })
   .finally(() => setIsTranscribing(false))
 }

 const isLoading = isAnalyzing || isTranscribing

 const subPalette = (offset: number) =>
  paletteIndex === undefined || paletteIndex === null ? undefined : (paletteIndex + 1 + offset) % 8

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

   <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 items-stretch">
    <div className="w-full lg:w-1/2 flex flex-col gap-6 flex-1">
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SubToolbox
       title="VIDEO UPLOAD"
       icon={<Upload size={20} strokeWidth={3} className="text-black" />}
       paletteIndex={subPalette(0)}
       contentClassName="p-5 flex flex-col gap-4">
       <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="video/*,audio/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
       />
       <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-gray-50 border-[4px] border-dashed border-black/20 rounded-xl p-4 font-black uppercase text-black/50 hover:bg-gray-100 hover:border-black transition-all flex flex-col items-center justify-center gap-2 truncate">
        <Upload size={24} className="mb-1" />
        <span className="truncate w-full text-center px-2">
         {file ? file.name : "UPLOAD VIDEO / AUDIO"}
        </span>
       </button>
      </SubToolbox>

      <SubToolbox
       title="VIDEO SCRIPT"
       icon={<AlignLeft size={20} strokeWidth={3} className="text-black" />}
       paletteIndex={subPalette(1)}
       contentClassName="p-5 flex flex-col gap-3">
       <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="PASTE YOUR SCRIPT HERE..."
        className="w-full h-32 p-4 border-[4px] border-black rounded-xl font-bold text-sm uppercase resize-none outline-none focus:bg-[#FFB570]/10 transition-colors"
       />
      </SubToolbox>
     </div>

     <SubToolbox
      title="VIDEO INFO"
      icon={<Target size={20} strokeWidth={3} className="text-black" />}
      paletteIndex={subPalette(2)}
      contentClassName="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
       <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
        Concept
       </label>
       <input
        value={videoConcept}
        onChange={(e) => setVideoConcept(e.target.value)}
        placeholder="What happens in the video?"
        className="w-full p-3 border-[4px] border-black rounded-xl font-bold text-sm uppercase outline-none focus:bg-[#FFB570]/10 transition-colors"
       />
      </div>
      <div className="space-y-2">
       <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
        Target Niche
       </label>
       <input
        value={targetNiche}
        onChange={(e) => setTargetNiche(e.target.value)}
        placeholder="History Channel"
        className="w-full p-3 border-[4px] border-black rounded-xl font-bold text-sm uppercase outline-none focus:bg-[#FFB570]/10 transition-colors"
       />
      </div>
      <div className="space-y-2">
       <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
        Intended Audience
       </label>
       <input
        value={intendedAudience}
        onChange={(e) => setIntendedAudience(e.target.value)}
        placeholder="History fans, age 18-34"
        className="w-full p-3 border-[4px] border-black rounded-xl font-bold text-sm uppercase outline-none focus:bg-[#FFB570]/10 transition-colors"
       />
      </div>
     </SubToolbox>

     <SubToolbox
      title="ANALYSIS DIRECTIVE"
      icon={<FileText size={20} strokeWidth={3} className="text-black" />}
      paletteIndex={subPalette(3)}
      contentClassName="p-5 flex-1 flex flex-col gap-4">
      <label className="font-black text-sm uppercase tracking-widest text-black/40 mb-1 block pl-1">
       What should the AI look for?
      </label>
      <textarea
       value={prompt}
       onChange={(e) => setPrompt(e.target.value)}
       className="w-full flex-1 min-h-[140px] p-4 border-[4px] border-black rounded-xl text-sm font-bold uppercase resize-none outline-none focus:bg-[#CCFF00]/10 transition-colors"
       placeholder="PACING, RETENTION DROPS, CLARITY, STRUCTURE..."
      />
      <button
       onClick={handleAnalyze}
       disabled={isLoading || !file}
       className="w-full bg-[#00CCFF] border-[4px] border-black p-4 font-black uppercase text-xl rounded-xl shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-y-2 transition-all disabled:cursor-not-allowed">
       {isLoading ? "PROCESSING..." : file ? "RUN ANALYSIS" : "UPLOAD A FILE"}
      </button>
     </SubToolbox>
    </div>

    <div className="w-full lg:w-1/2 flex flex-col flex-1">
     <SubToolbox
      title="AI INSIGHTS"
      icon={<Search size={20} strokeWidth={3} className="text-black" />}
      paletteIndex={subPalette(4)}
      contentClassName="p-6 flex-1 flex flex-col overflow-hidden">
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
      <div className="overflow-y-auto flex-1 pr-2">
       {analysisResult ? (
        <div className="space-y-8">
         <p className="whitespace-pre-wrap text-black leading-relaxed font-bold text-lg">
          {analysisResult.analysis}
         </p>
         {analysisResult.strategicAnalysis && (
          <div className="bg-gray-50 border-[4px] border-black rounded-xl p-6">
           <h4 className="font-black uppercase mb-4 text-[#FF7497] tracking-widest">
            Strategic Analysis
           </h4>
           <p className="whitespace-pre-wrap text-black leading-relaxed font-bold">
            {analysisResult.strategicAnalysis}
           </p>
          </div>
         )}
         {analysisResult.retentionCurve &&
          analysisResult.retentionCurve.length > 0 && (
           <div className="h-64 w-full bg-white border-[4px] border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_black]">
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
          )}
        </div>
       ) : (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
         <Search size={80} className="mb-4" />
         <p className="text-xl font-black uppercase tracking-widest">
          Waiting for data telemetry...
         </p>
        </div>
       )}
      </div>
     </SubToolbox>
    </div>
   </div>
  </ToolboxScaffold>
 )
}

export default MediaAnalyzer
