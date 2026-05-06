import React, { useState, useEffect } from "react"
import {
 Sparkles,
 Copy,
 Check,
 Download,
 Type,
 FileText,
 Zap,
 BarChart3,
 BookOpen,
 Cloud,
 Database,
 Loader2,
 Upload,
} from "lucide-react"
import { generateSeoData, hasGeminiKey } from "../services/gemini"
import type { SeoResult } from "../types"
import Markdown from "react-markdown"
import JSZip from "jszip"
import { useBrain } from "../context/GlobalDataContext"
import { ToolboxScaffold } from "../components/Toolbox"
import { sheetsService } from "../services/sheetsService"
import { nexusSyncService } from "../services/nexusSyncService"
import { SubToolbox, StandardUploadBox, StandardTextArea } from "../components/Toolbox"
import { PostActionReflection } from "../components/PostActionReflection"

// --- Sub-components (The "Pop" Style) ---
const CopyBox: React.FC<{
 label: string
 content: string
 multiline?: boolean
 headerColor?: string
 icon?: React.ReactNode
}> = ({
 label,
 content,
 multiline = false,
 headerColor = "bg-[#ccff00]",
 icon,
}) => {
 const [copied, setCopied] = useState(false)

 const handleCopy = () => {
  navigator.clipboard.writeText(content)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
 }

 return (
  <div className="bg-white border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] overflow-hidden flex flex-col h-full transform hover:-translate-y-1 transition-transform">
   <div
    className={`p-4 border-b-[4px] border-black flex items-center justify-between ${headerColor}`}>
    <div className="flex items-center gap-3">
     {icon}
     <span className="font-black uppercase tracking-tighter text-lg">
      {label}
     </span>
    </div>
    <button
     onClick={handleCopy}
     className="bg-black text-white p-2 rounded-lg hover:scale-110 active:scale-95 transition-all">
     {copied ? <Check size={18} /> : <Copy size={18} />}
    </button>
   </div>
   <div className="p-6 overflow-auto max-h-[400px]">
    {multiline ? (
     <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
      {content}
     </div>
    ) : (
     <div className="font-black text-2xl tracking-tight">{content}</div>
    )}
   </div>
  </div>
 )
}

const ConsolidatedCopyBox: React.FC<{
 label: string
 items: string[]
 headerColor?: string
 icon?: React.ReactNode
}> = ({ label, items, headerColor = "bg-[#00d2ff]", icon }) => {
 const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

 const handleCopy = (text: string, index: number) => {
  navigator.clipboard.writeText(text)
  setCopiedIndex(index)
  setTimeout(() => setCopiedIndex(null), 2000)
 }

 if (!items || items.length === 0) return null

 return (
  <div className="bg-white border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black] overflow-hidden flex flex-col h-full transform hover:-translate-y-1 transition-transform">
   <div
    className={`p-4 border-b-[4px] border-black flex items-center justify-between ${headerColor}`}>
    <div className="flex items-center gap-3">
     {icon}
     <span className="font-black uppercase tracking-tighter text-lg">
      {label}
     </span>
    </div>
    <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-full">
     {items.length}
    </span>
   </div>
   <div className="divide-y-2 divide-black/5 overflow-auto max-h-[400px]">
    {items.map((item, idx) => (
     <div
      key={idx}
      className="p-4 flex items-start gap-4 hover:bg-gray-50 group transition-colors">
      <span className="font-black text-black/20 group-hover:text-black mt-1">
       {idx + 1}
      </span>
      <div className="flex-1 font-bold text-sm leading-tight">{item}</div>
      <button
       onClick={() => handleCopy(item, idx)}
       className="opacity-0 group-hover:opacity-100 p-2 bg-black text-white rounded-lg transition-all">
       {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
      </button>
     </div>
    ))}
   </div>
  </div>
 )
}

// --- Main Page Component ---
const SeoGenerator: React.FC<{
 paletteIndex?: number
 collapsible?: boolean
 isOpenInitial?: boolean
 embedded?: boolean
}> = ({
 paletteIndex = 3,
 collapsible = false,
 isOpenInitial = true,
 embedded = false,
}) => {
 const [isOpen, setIsOpen] = useState(isOpenInitial)
 const [loading, setLoading] = useState(false)
 const [concept, setConcept] = useState("")
 const [niche, setNiche] = useState("")
 const [audience, setAudience] = useState("")
 const [videoLength, setVideoLength] = useState("")
 const [channelHandle, setChannelHandle] = useState("")
 const [durationStats, setDurationStats] = useState("")
 const [resourceLinks, setResourceLinks] = useState("")
 const [script, setScript] = useState("")
 const [result, setResult] = useState<SeoResult | null>(null)
 const [missingFields, setMissingFields] = useState({
  concept: false,
  niche: false,
 })
 const [formatMode, setFormatMode] = useState<"longform" | "shorts">("longform")
 const [scopeMode, setScopeMode] = useState<"single" | "bulk">("single")
 const [isExporting, setIsExporting] = useState(false)
 const [isSyncing, setIsSyncing] = useState(false)
 const [exportUrl, setExportUrl] = useState<string | null>(null)

 const { setSeoState, authState } = useBrain()

 const basePalette = paletteIndex

 const handleGenerate = async () => {
  if (!concept.trim() || !niche.trim()) {
   setMissingFields({
    concept: !concept.trim(),
    niche: !niche.trim(),
   })
   return
  }

  setLoading(true)
  try {
   const data = await generateSeoData(
    concept,
    niche,
    script,
    durationStats,
    videoLength,
    channelHandle,
    resourceLinks,
    formatMode === "shorts" ? "Shorts" : "Longform"
   )
   setResult(data)

   // EXTREMELY CRITICAL: Push "Winning" state to Global Brain
   setSeoState({
    winningTitle: data.titleSets[0].title,
    winningKeywords: data.tags
     .split(",")
     .map((k) => k.trim())
     .slice(0, 5),
    descriptionDraft: data.description,
   })
  } catch (e: any) {
   console.error(e)
   alert(`SEO Protocols failed: ${e.message}`)
  } finally {
   setLoading(false)
  }
 }

 const handleExport = async () => {
  if (!result) return
  setIsExporting(true)
  try {
   const exportRes = await sheetsService.exportSeoResult(concept, result)
   setExportUrl(exportRes.spreadsheetUrl)
  } catch (e) {
   console.error(e)
   alert("Sheets Export failed. Check connection.")
  } finally {
   setIsExporting(false)
  }
 }

 const handleSyncToDrive = async () => {
  if (!result) return
  setIsSyncing(true)
  try {
   await nexusSyncService.syncSeoToDrive(concept, result)
   alert("SEO Assets synced to Cloud Vault!")
  } catch (e: any) {
   console.error(e)
   alert(`Cloud Sync failed: ${e.message}`)
  } finally {
   setIsSyncing(false)
  }
 }

 const handleDownloadZip = async () => {
  if (!result) return
  const zip = new JSZip()
  zip.file(
   "seo_report.txt",
   `VIEW TUBE SEO REPORT\nConcept: ${concept}\n\nTITLES:\n${result.titleSets.map((t) => t.title).join("\n")}\n\nDESCRIPTION:\n${result.description}`,
  )
  const content = await zip.generateAsync({ type: "blob" })
  const url = URL.createObjectURL(content)
  const a = document.createElement("a")
  a.href = url
  a.download = `viewtube_seo_${Date.now()}.zip`
  a.click()
 }

 return (
  <ToolboxScaffold
   title="SEO GENERATOR"
   subtitle="Create SEO optimized titles, descriptions, tags + more for all your new + published content"
   icon={<Zap size={40} strokeWidth={3} className="text-black" />}
   headerColor="bg-[#CCFF00]"
   iconBoxColor="bg-[#00FF99]"
   paletteIndex={paletteIndex}
   collapsible={collapsible}
   isOpen={isOpen}
   onToggle={() => setIsOpen(!isOpen)}
   embedded={embedded}
   helpText="Create a full metadata package for your video. Generate titles, descriptions, tags, and packaging prompts from your concept."
   shellClassName="animate-fade-in"
   contentClassName={embedded ? "p-0" : "p-8"}
   headerActions={
    <div className="flex gap-3 mr-2 my-auto">
     <div className="flex bg-white border-[4px] border-black p-1 rounded-xl shadow-[3px_3px_0px_0px_black] h-12">
      <button
       onClick={(e) => {
        e.stopPropagation()
        setFormatMode("longform")
       }}
       className={`px-4 text-[11px] font-[1000] uppercase tracking-tighter rounded-lg transition-all flex items-center gap-2 ${formatMode === "longform" ? "bg-black text-white" : "text-black/40 hover:text-black"}`}>
       Longform
      </button>
      <button
       onClick={(e) => {
        e.stopPropagation()
        setFormatMode("shorts")
       }}
       className={`px-4 text-[11px] font-[1000] uppercase tracking-tighter rounded-lg transition-all flex items-center gap-2 ${formatMode === "shorts" ? "bg-black text-white" : "text-black/40 hover:text-black"}`}>
       Shorts
      </button>
     </div>
     <div className="flex bg-white border-[4px] border-black p-1 rounded-xl shadow-[3px_3px_0px_0px_black] h-12">
      <button
       onClick={(e) => {
        e.stopPropagation()
        setScopeMode("single")
       }}
       className={`px-4 text-[11px] font-[1000] uppercase tracking-tighter rounded-lg transition-all flex items-center gap-2 ${scopeMode === "single" ? "bg-black text-white" : "text-black/40 hover:text-black"}`}>
       Single
      </button>
      <button
       onClick={(e) => {
        e.stopPropagation()
        setScopeMode("bulk")
       }}
       className={`px-4 text-[11px] font-[1000] uppercase tracking-tighter rounded-lg transition-all flex items-center gap-2 ${scopeMode === "bulk" ? "bg-black text-white" : "text-black/40 hover:text-black"}`}>
       Bulk
      </button>
     </div>
    </div>
   }>
   {/* Main UI Layout */}
   {!result ? (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
     <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <SubToolbox
       title="Video Upload"
       icon={<Upload size={20} strokeWidth={3} />}
       paletteIndex={basePalette + 1}
       collapsible
       isOpenInitial={true}>
       <StandardUploadBox 
        label="UPLOAD VIDEO\\nSupports video/audio (max 15mb)" 
        minHeight="220px" 
        iconBgColor="#FF3399" 
       />
      </SubToolbox>

      <SubToolbox
       title="Video Script"
       icon={<FileText size={20} strokeWidth={3} />}
       paletteIndex={basePalette + 2}
       collapsible
       isOpenInitial={true}>
       <StandardTextArea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="Paste your script here..."
        minHeight="220px"
       />
      </SubToolbox>
     </div>

     <SubToolbox
      title="Video Info"
      icon={<Sparkles size={20} strokeWidth={3} />}
      paletteIndex={basePalette + 3}
      collapsible
      isOpenInitial={true}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
         Video Concept
        </label>
        <input
         type="text"
         value={concept}
         onChange={(e) => {
          setConcept(e.target.value)
          if (missingFields.concept)
           setMissingFields((prev) => ({ ...prev, concept: false }))
         }}
         placeholder="What happens in the video?"
         className={`w-full h-12 p-3 border-[3px] border-black rounded-xl font-bold text-sm outline-none bg-[#F5F5F5] ${missingFields.concept ? "ring-4 ring-[#FF8AAF]/60" : ""}`}
        />
       </div>
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
         Target Niche
        </label>
        <input
         type="text"
         value={niche}
         onChange={(e) => {
          setNiche(e.target.value)
          if (missingFields.niche)
           setMissingFields((prev) => ({ ...prev, niche: false }))
         }}
         placeholder="History Channel"
         className={`w-full h-12 p-3 border-[3px] border-black rounded-xl font-bold text-sm outline-none bg-[#F5F5F5] ${missingFields.niche ? "ring-4 ring-[#FF8AAF]/60" : ""}`}
        />
       </div>
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
         Intended Audience
        </label>
        <input
         type="text"
         value={audience}
         onChange={(e) => setAudience(e.target.value)}
         placeholder="History fans, age 18-34"
         className="w-full h-12 p-3 border-[3px] border-black rounded-xl font-bold text-sm outline-none bg-[#F5F5F5]"
        />
       </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
         Video Length
        </label>
        <input
         type="text"
         value={videoLength}
         onChange={(e) => setVideoLength(e.target.value)}
         placeholder="10:45"
         className="w-full h-12 p-3 border-[3px] border-black rounded-xl font-bold text-sm text-center outline-none bg-[#F5F5F5]"
        />
       </div>
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
         Channel URL
        </label>
        <input
         type="text"
         value={channelHandle}
         onChange={(e) => setChannelHandle(e.target.value)}
         placeholder="https://youtube.com/@yourchannel"
         className="w-full h-12 p-3 border-[3px] border-black rounded-xl font-bold text-sm outline-none bg-[#F5F5F5]"
        />
       </div>
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
         Current Stats
        </label>
        <input
         type="text"
         value={durationStats}
         onChange={(e) => setDurationStats(e.target.value)}
         placeholder="50k subs"
         className="w-full h-12 p-3 border-[3px] border-black rounded-xl font-bold text-sm outline-none bg-[#F5F5F5]"
        />
       </div>
      </div>

      <div className="space-y-2 mt-4">
       <label className="text-[10px] font-black uppercase tracking-widest text-black/50 ml-1">
        Description Link
       </label>
       <input
        type="text"
        value={resourceLinks}
        onChange={(e) => setResourceLinks(e.target.value)}
        placeholder="Paste the link to include at the bottom of your description..."
        className="w-full h-12 p-3 border-[3px] border-black rounded-xl font-bold text-sm outline-none bg-[#F5F5F5]"
       />
      </div>
     </SubToolbox>

     {!hasGeminiKey() ? (
      <button
       onClick={() => (window.location.href = "/settings")}
       className="w-full bg-black text-[#FFFF61] border-[4px] border-black h-14 rounded-xl flex items-center justify-center gap-3 font-[1000] uppercase text-lg tracking-tight shadow-[5px_5px_0px_0px_transparent] hover:shadow-[5px_5px_0px_0px_#FFFF61] hover:-translate-y-1 transition-all">
       <Zap size={24} /> Missing AI Key: Connect in Settings
      </button>
     ) : (
      <button
       onClick={handleGenerate}
       className="w-full bg-[#FF8AAF] text-black border-[4px] border-black h-14 rounded-xl shadow-[5px_5px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3 font-[1000] uppercase text-lg tracking-tight">
       {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
       {loading ? "Generating..." : "Generate All Assets"}
      </button>
     )}
    </div>
   ) : (
    /* Results View */
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
     <div className="flex items-center justify-between p-6 bg-white border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_black]">
      <div className="flex items-center gap-4">
       <div className="w-12 h-12 bg-[#FFDD00] border-[3px] border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_black]">
        <Check className="text-black" size={24} strokeWidth={3} />
       </div>
       <div>
        <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
         Your Optimized Video Package
        </h2>
        <p className="text-xs font-bold text-black/50 uppercase mt-1">
         Global Brain has been updated with viral assets.
        </p>
       </div>
      </div>
      <div className="flex gap-4">
       {authState.isAuthenticated && (
        <button
         onClick={handleExport}
         disabled={isExporting}
         className="bg-black text-[#FFDD00] px-6 py-2 font-black uppercase text-sm rounded-xl shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2">
         {isExporting ? (
          <div className="w-4 h-4 border-2 border-[#FFDD00] border-t-transparent rounded-full animate-spin" />
         ) : (
          <Database size={18} />
         )}
         {exportUrl ? "Re-Sync Sheets" : "Export to Sheets"}
        </button>
       )}
       <button
        onClick={handleSyncToDrive}
        disabled={isSyncing}
        className="bg-black text-[#FF3399] px-6 py-2 font-black uppercase text-sm rounded-xl shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2">
        {isSyncing ? (
         <div className="w-4 h-4 border-2 border-[#FF3399] border-t-transparent rounded-full animate-spin" />
        ) : (
         <Cloud size={18} />
        )}
        Sync to Drive
       </button>
       <button
        onClick={handleDownloadZip}
        className="bg-[#FFDD00] border-[3px] border-black px-6 py-2 font-black uppercase text-sm rounded-xl shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2">
        <Download size={18} /> Download All
       </button>
      </div>
     </div>

     <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <ConsolidatedCopyBox
       label="Title Options & Thumbnail Ideas"
       items={result.titleSets.map((t) => t.title)}
       headerColor="bg-[#ff3399]"
       icon={<Type size={20} className="text-white" />}
      />
      <ConsolidatedCopyBox
       label="Thumbnail Overlays"
       items={result.titleSets.map((t) => t.thumbnailText)}
       headerColor="bg-[#ccff00]"
       icon={<BarChart3 size={20} />}
      />
     </div>

     <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <CopyBox
       label="Optimized Description"
       content={result.description}
       multiline
       headerColor="bg-[#FFDD00]"
       icon={<FileText size={20} />}
      />
      <div className="space-y-8">
       <CopyBox
        label="Timestamped Questions (Educational)"
        content={result.educationMoments}
        multiline
        headerColor="bg-[#FF3399]"
        icon={<BookOpen size={20} className="text-white" />}
       />
       <div className="bg-black text-white p-6 rounded-2xl border-[4px] border-black shadow-[6px_6px_0px_0px_black]">
        <h3 className="font-black uppercase text-xl mb-4 text-[#FFDD00]">
         Strategic Analysis
        </h3>
        <div className="prose prose-invert prose-sm max-w-none font-medium text-white/80">
         <Markdown>{result.analysis}</Markdown>
        </div>
       </div>
      </div>
     </div>

     {/* Brain Reflection UI */}
     <PostActionReflection toolId="SEO_GENERATOR" />
    </div>
   )}
  </ToolboxScaffold>
 )
}

export default SeoGenerator
