import React, { useState } from "react"
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
import { useBrain } from "../context/useBrain"
import { SubToolbox, ToolboxScaffold } from "../components/Toolbox"
import { sheetsService } from "../services/sheetsService"
import { nexusSyncService } from "../services/nexusSyncService"
import { PostActionReflection } from "../components/PostActionReflection"
import { SubToolboxActions, SubToolboxGrid, SubToolboxStack } from "../components/subtoolbox/SubToolboxLayouts"
import {
 SubToolboxButton,
 SubToolboxFileTarget,
 SubToolboxInput,
 SubToolboxOutputCard,
 SubToolboxTextArea,
 ToolboxHeaderToggle,
} from "../components/subtoolbox/SubToolboxPrimitives"

const CopyBox: React.FC<{
 label: string
 content: string
 multiline?: boolean
 icon?: React.ReactNode
}> = ({ label, content, multiline = false, icon }) => {
 const [copied, setCopied] = useState(false)

 const handleCopy = () => {
  void navigator.clipboard.writeText(content)
  setCopied(true)
  window.setTimeout(() => setCopied(false), 2000)
 }

 return (
  <SubToolboxOutputCard
   title={label}
   icon={icon}
   scroll
   action={
    <SubToolboxButton
     size="compact"
     tone="ink"
     icon={copied ? <Check size={16} /> : <Copy size={16} />}
     aria-label={`Copy ${label}`}
     onClick={handleCopy}>
     {copied ? "Copied" : "Copy"}
    </SubToolboxButton>
   }>
   <div className={multiline ? "whitespace-pre-wrap font-mono text-sm leading-relaxed" : "text-xl font-black tracking-tight"}>
    {content}
   </div>
  </SubToolboxOutputCard>
 )
}

const ConsolidatedCopyBox: React.FC<{
 label: string
 items: string[]
 icon?: React.ReactNode
}> = ({ label, items, icon }) => {
 const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

 const handleCopy = (text: string, index: number) => {
  void navigator.clipboard.writeText(text)
  setCopiedIndex(index)
  window.setTimeout(() => setCopiedIndex(null), 2000)
 }

 if (!items.length) return null

 return (
  <SubToolboxOutputCard title={label} icon={icon} badge={items.length} scroll>
   <SubToolboxStack density="dense">
    {items.map((item, index) => (
     <div key={`${index}-${item}`} className="flex min-w-0 items-start gap-3 border-b-2 border-black/10 pb-2 last:border-0 last:pb-0">
      <span className="mt-2 font-black text-black/25">{index + 1}</span>
      <div className="min-w-0 flex-1 py-2 text-sm font-bold leading-tight">{item}</div>
      <SubToolboxButton
       size="compact"
       tone="ink"
       icon={copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
       aria-label={`Copy ${label} option ${index + 1}`}
       onClick={() => handleCopy(item, index)}>
       {copiedIndex === index ? "Copied" : "Copy"}
      </SubToolboxButton>
     </div>
    ))}
   </SubToolboxStack>
  </SubToolboxOutputCard>
 )
}

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
 const [missingFields, setMissingFields] = useState({ concept: false, niche: false })
 const [formatMode, setFormatMode] = useState<"longform" | "shorts">("longform")
 const [scopeMode, setScopeMode] = useState<"single" | "bulk">("single")
 const [isExporting, setIsExporting] = useState(false)
 const [isSyncing, setIsSyncing] = useState(false)
 const [exportUrl, setExportUrl] = useState<string | null>(null)

 const { setSeoState, authState } = useBrain()

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
   setSeoState({
    winningTitle: data.titleSets[0].title,
    winningKeywords: data.tags
     .split(",")
     .map((keyword) => keyword.trim())
     .slice(0, 5),
    descriptionDraft: data.description,
   })
  } catch (error: any) {
   console.error(error)
   alert(`SEO Protocols failed: ${error.message}`)
  } finally {
   setLoading(false)
  }
 }

 const handleExport = async () => {
  if (!result) return
  setIsExporting(true)
  try {
   const exportResult = await sheetsService.exportSeoResult(concept, result)
   setExportUrl(exportResult.spreadsheetUrl)
  } catch (error) {
   console.error(error)
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
  } catch (error: any) {
   console.error(error)
   alert(`Cloud Sync failed: ${error.message}`)
  } finally {
   setIsSyncing(false)
  }
 }

 const handleDownloadZip = async () => {
  if (!result) return
  const zip = new JSZip()
  zip.file(
   "seo_report.txt",
   `VIEW TUBE SEO REPORT\nConcept: ${concept}\n\nTITLES:\n${result.titleSets.map((title) => title.title).join("\n")}\n\nDESCRIPTION:\n${result.description}`,
  )
  const blob = await zip.generateAsync({ type: "blob" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `viewtube_seo_${Date.now()}.zip`
  anchor.click()
  URL.revokeObjectURL(url)
 }

 return (
  <ToolboxScaffold
   title="SEO GENERATOR"
   subtitle="Create optimized titles, descriptions, tags + assets for new + published videos"
   icon={<Zap size={40} strokeWidth={3} className="text-black" />}
   paletteIndex={paletteIndex}
   collapsible={collapsible}
   isOpen={isOpen}
   onToggle={() => setIsOpen(!isOpen)}
   embedded={embedded}
   helpText="Create a full metadata package for your video. Generate titles, descriptions, tags, and packaging prompts from your concept."
   shellClassName="animate-fade-in"
   contentClassName={embedded ? "p-0" : "p-8"}
   headerActions={
    <div className="flex flex-wrap items-center justify-end gap-2">
     <ToolboxHeaderToggle
      value={formatMode}
      aria-label="Video format"
      options={[
       { value: "longform", label: "Longform" },
       { value: "shorts", label: "Shorts" },
      ]}
      onValueChange={(value) => setFormatMode(value === "shorts" ? "shorts" : "longform")}
     />
     <ToolboxHeaderToggle
      value={scopeMode}
      aria-label="Generation scope"
      options={[
       { value: "single", label: "Single" },
       { value: "bulk", label: "Bulk" },
      ]}
      onValueChange={(value) => setScopeMode(value === "bulk" ? "bulk" : "single")}
     />
    </div>
   }>
   {!result ? (
    <SubToolboxStack density="comfortable">
     <SubToolboxGrid minItemWidth="wide">
      <SubToolbox title="Video Upload" icon={<Upload size={20} strokeWidth={3} />} collapsible isOpenInitial>
       <SubToolboxFileTarget
        label={<>Upload video<br />Supports video/audio (max 15mb)</>}
        icon={<Upload size={28} strokeWidth={3} />}
        accept="video/*,audio/*"
       />
      </SubToolbox>

      <SubToolbox title="Video Script" icon={<FileText size={20} strokeWidth={3} />} collapsible isOpenInitial>
       <SubToolboxTextArea
        aria-label="Video script"
        value={script}
        onChange={(event) => setScript(event.target.value)}
        placeholder="Paste your script here..."
        height="standard"
       />
      </SubToolbox>
     </SubToolboxGrid>

     <SubToolbox title="Video Info" icon={<Sparkles size={20} strokeWidth={3} />} collapsible isOpenInitial>
      <SubToolboxStack>
       <SubToolboxGrid minItemWidth="compact">
        <label className="space-y-2">
         <span className="vt-subtoolbox-label">Video Concept</span>
         <SubToolboxInput
          aria-label="Video concept"
          aria-invalid={missingFields.concept}
          value={concept}
          onChange={(event) => {
           setConcept(event.target.value)
           if (missingFields.concept) setMissingFields((previous) => ({ ...previous, concept: false }))
          }}
          placeholder="What happens in the video?"
         />
        </label>
        <label className="space-y-2">
         <span className="vt-subtoolbox-label">Target Niche</span>
         <SubToolboxInput
          aria-label="Target niche"
          aria-invalid={missingFields.niche}
          value={niche}
          onChange={(event) => {
           setNiche(event.target.value)
           if (missingFields.niche) setMissingFields((previous) => ({ ...previous, niche: false }))
          }}
          placeholder="History Channel"
         />
        </label>
        <label className="space-y-2">
         <span className="vt-subtoolbox-label">Intended Audience</span>
         <SubToolboxInput
          aria-label="Intended audience"
          value={audience}
          onChange={(event) => setAudience(event.target.value)}
          placeholder="History fans, age 18-34"
         />
        </label>
       </SubToolboxGrid>

       <SubToolboxGrid minItemWidth="compact">
        <label className="space-y-2">
         <span className="vt-subtoolbox-label">Video Length</span>
         <SubToolboxInput
          aria-label="Video length"
          value={videoLength}
          onChange={(event) => setVideoLength(event.target.value)}
          placeholder="10:45"
         />
        </label>
        <label className="space-y-2">
         <span className="vt-subtoolbox-label">Channel URL</span>
         <SubToolboxInput
          aria-label="Channel URL"
          value={channelHandle}
          onChange={(event) => setChannelHandle(event.target.value)}
          placeholder="https://youtube.com/@yourchannel"
         />
        </label>
        <label className="space-y-2">
         <span className="vt-subtoolbox-label">Current Stats</span>
         <SubToolboxInput
          aria-label="Current statistics"
          value={durationStats}
          onChange={(event) => setDurationStats(event.target.value)}
          placeholder="50k subs"
         />
        </label>
       </SubToolboxGrid>

       <label className="space-y-2">
        <span className="vt-subtoolbox-label">Description Link</span>
        <SubToolboxInput
         aria-label="Description link"
         value={resourceLinks}
         onChange={(event) => setResourceLinks(event.target.value)}
         placeholder="Paste the link to include at the bottom of your description..."
        />
       </label>
      </SubToolboxStack>
     </SubToolbox>

     <SubToolbox title="Generate Assets" icon={<Zap size={20} strokeWidth={3} />} collapsible isOpenInitial>
      {!hasGeminiKey() ? (
       <SubToolboxButton
        size="action"
        tone="warning"
        icon={<Zap size={20} />}
        onClick={() => { window.location.href = "/settings" }}>
        Missing AI Key: Connect in Settings
       </SubToolboxButton>
      ) : (
       <SubToolboxButton
        size="action"
        tone="accent"
        icon={loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
        disabled={loading}
        onClick={handleGenerate}>
        {loading ? "Generating..." : "Generate All Assets"}
       </SubToolboxButton>
      )}
     </SubToolbox>
    </SubToolboxStack>
   ) : (
    <SubToolboxStack density="comfortable">
     <SubToolboxOutputCard
      title="Optimized Video Package"
      icon={<Check size={20} />}
      action={
       <SubToolboxActions columns={3}>
        {authState.isAuthenticated ? (
         <SubToolboxButton
          size="compact"
          tone="ink"
          icon={<Database size={16} />}
          disabled={isExporting}
          onClick={handleExport}>
          {isExporting ? "Exporting..." : exportUrl ? "Re-Sync Sheets" : "Export to Sheets"}
         </SubToolboxButton>
        ) : null}
        <SubToolboxButton
         size="compact"
         tone="neutral"
         icon={<Cloud size={16} />}
         disabled={isSyncing}
         onClick={handleSyncToDrive}>
         {isSyncing ? "Syncing..." : "Sync to Drive"}
        </SubToolboxButton>
        <SubToolboxButton
         size="compact"
         tone="accent"
         icon={<Download size={16} />}
         onClick={handleDownloadZip}>
         Download All
        </SubToolboxButton>
       </SubToolboxActions>
      }>
      <div className="text-sm font-black uppercase">Global Brain has been updated with viral assets.</div>
     </SubToolboxOutputCard>

     <SubToolboxGrid minItemWidth="wide">
      <ConsolidatedCopyBox
       label="Title Options & Thumbnail Ideas"
       items={result.titleSets.map((title) => title.title)}
       icon={<Type size={18} />}
      />
      <ConsolidatedCopyBox
       label="Thumbnail Overlays"
       items={result.titleSets.map((title) => title.thumbnailText)}
       icon={<BarChart3 size={18} />}
      />
     </SubToolboxGrid>

     <SubToolboxGrid minItemWidth="wide">
      <CopyBox
       label="Optimized Description"
       content={result.description}
       multiline
       icon={<FileText size={18} />}
      />
      <SubToolboxStack density="comfortable">
       <CopyBox
        label="Timestamped Questions (Educational)"
        content={result.educationMoments}
        multiline
        icon={<BookOpen size={18} />}
       />
       <SubToolboxOutputCard title="Strategic Analysis" icon={<Sparkles size={18} />} scroll>
        <div className="prose prose-sm max-w-none font-medium text-black/80">
         <Markdown>{result.analysis}</Markdown>
        </div>
       </SubToolboxOutputCard>
      </SubToolboxStack>
     </SubToolboxGrid>

     <PostActionReflection toolId="VIDEO_PUBLISHER" />
    </SubToolboxStack>
   )}
  </ToolboxScaffold>
 )
}

export default SeoGenerator
