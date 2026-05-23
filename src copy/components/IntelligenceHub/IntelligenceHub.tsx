import React, { useEffect, useRef, useState } from "react"
import {
 Brain,
 Zap,
 FileText,
 TrendingUp,
 Eye,
 Target,
 Loader2,
} from "lucide-react"
import type {
 OracleReport,
 AlgorithmDiagnosis,
 KeywordAnalysis,
 UltimateChannelReport,
 ReportSectionPayload,
 ReportPreflightResult,
 ReportSectionState,
 SectionGenerationEvent,
} from "./types"
import { IntelligenceChart } from "./IntelligenceChart"
import { emitSignal } from "../../services/brain"
import { generateUltimateChannelReport } from "./ultimateReport"

const ULTIMATE_REPORT_STORAGE_KEY = "vt_ultimate_channel_report_v1"
const ULTIMATE_REPORT_CONTEXT_KEY = "vt_ultimate_tool_context_pack_v1"
const ULTIMATE_REPORT_EVENT = "vt_generate_ultimate_report"

type IntelligenceHubProps = {
 autoContext?: string
 dataSources?: string[]
 mode?: "full" | "ultimate"
 embedded?: boolean
}

const IntelligenceHub: React.FC<IntelligenceHubProps> = ({
 autoContext = "",
 dataSources = [],
 mode = "full",
 embedded = false,
}) => {
 const triggerRef = useRef<() => Promise<void>>(async () => {})
 const [loading, setLoading] = useState(false)
 const [diagnosis, setDiagnosis] = useState<AlgorithmDiagnosis | null>(null)
 const [report, setReport] = useState<OracleReport | null>(null)
 const [keywordData, setKeywordData] = useState<KeywordAnalysis | null>(null)
 const [ultimateReport, setUltimateReport] =
  useState<UltimateChannelReport | null>(() => {
   try {
    const raw = localStorage.getItem(ULTIMATE_REPORT_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UltimateChannelReport) : null
   } catch {
    return null
   }
  })
const [nexusContext, setNexusContext] = useState("")
const [activeSectionIdx, setActiveSectionIdx] = useState(0)
 const [generationStatus, setGenerationStatus] = useState<string | null>(null)
 const [sectionStates, setSectionStates] = useState<ReportSectionState[]>([])
 const [generationEvents, setGenerationEvents] = useState<SectionGenerationEvent[]>([])
 const [preflight, setPreflight] = useState<ReportPreflightResult | null>(null)
 const [sessionMeta, setSessionMeta] = useState<{
  generationId: string
  startedAt: string
  finishedAt?: string
  overallStatus: "running" | "complete" | "degraded" | "failed"
  completedCount: number
  failedCount: number
  degradedCount: number
  totalCount: number
 } | null>(null)
 const showFullSurface = mode === "full"

 const runOmniBrain = async () => {
  setLoading(true)
  setGenerationStatus("Generating report...")
  setGenerationEvents([])
  setSectionStates([])
  setSessionMeta(null)
  setPreflight(null)
  emitSignal("omni-brain", "SYNC_DNA_RUN", {
   context: nexusContext || autoContext || "AUTO_CONTEXT",
  }).catch(console.error)
  try {
   const {
    report: unifiedReport,
    diagnosis: diagRes,
    oracle: oracleRes,
    keyword: kwRes,
   } = await generateUltimateChannelReport({
    manualIntent: nexusContext,
    autoContext,
    dataSources,
    onSessionUpdate: (meta) => setSessionMeta(meta),
    onSectionUpdate: (section, event) => {
      setSectionStates((prev) => {
       const next = [...prev]
       const idx = next.findIndex((entry) => entry.id === section.id)
       if (idx >= 0) next[idx] = section
       else next.push(section)
       next.sort((a, b) => a.order - b.order)
       return next
      })
      setGenerationEvents((prev) => [event, ...prev].slice(0, 100))
    },
   })
   setDiagnosis(diagRes)
   setReport(oracleRes)
   setKeywordData(kwRes)
   setUltimateReport(unifiedReport)
   setGenerationStatus(
    unifiedReport.meta.overallStatus === "degraded" || unifiedReport.meta.overallStatus === "failed"
     ? "Report generated in partial/degraded mode. Review failed sections in timeline."
     : "Report generated successfully."
   )
   setSectionStates(unifiedReport.sectionStates || [])
   setGenerationEvents(unifiedReport.generationEvents || [])
   setPreflight(unifiedReport.meta.diagnostics.preflight || null)
   localStorage.setItem(
    ULTIMATE_REPORT_STORAGE_KEY,
    JSON.stringify(unifiedReport),
   )
   if (unifiedReport.toolContextPack) {
    localStorage.setItem(
     ULTIMATE_REPORT_CONTEXT_KEY,
     JSON.stringify(unifiedReport.toolContextPack),
    )
   }
   emitSignal("ORACLE_REPORT", "ULTIMATE_REPORT_GENERATED", {
    generationId: unifiedReport.meta.generationId,
    analysisMode: unifiedReport.meta.analysisMode,
    promptPackVersion: unifiedReport.meta.promptPackVersion,
    contextMode: unifiedReport.meta.contextMode,
    actionPlan: unifiedReport.actionPlan.slice(0, 5),
    riskFlags: unifiedReport.riskFlags.slice(0, 5),
   }).catch(console.error)
   setActiveSectionIdx(0)
  } catch (e) {
   console.error(e)
   const msg = e instanceof Error ? e.message : "Ultimate report generation failed."
   if (msg.startsWith("REPORT_PREFLIGHT_BLOCKED::")) {
    try {
     const parsed = JSON.parse(msg.replace("REPORT_PREFLIGHT_BLOCKED::", "")) as {
      message?: string
      preflight?: ReportPreflightResult
     }
     setGenerationStatus(parsed.message || "Generation blocked by required source gate.")
     setPreflight(parsed.preflight || null)
    } catch {
     setGenerationStatus("Generation blocked by preflight gate.")
    }
   } else {
    setGenerationStatus(msg)
   }
  } finally {
   setLoading(false)
  }
 }
 triggerRef.current = runOmniBrain

 useEffect(() => {
  const handleGenerateEvent = () => {
   triggerRef.current().catch((error) => {
    console.error("Ultimate report event trigger failed", error)
   })
  }
  window.addEventListener(ULTIMATE_REPORT_EVENT, handleGenerateEvent)
  return () =>
   window.removeEventListener(ULTIMATE_REPORT_EVENT, handleGenerateEvent)
 }, [])

 const isGenerated = diagnosis && report && keywordData
 const renderPayload = (payload?: ReportSectionPayload) => {
  if (!payload) return null
  return (
   <div className="space-y-3">
    {payload.metrics && payload.metrics.length > 0 && (
     <div className="border-2 border-black rounded-xl overflow-hidden">
      <table className="w-full border-collapse text-xs">
       <thead className="bg-black text-white">
        <tr>
         <th className="text-left p-2 font-black uppercase tracking-wide">
          Metric
         </th>
         <th className="text-left p-2 font-black uppercase tracking-wide">
          Value
         </th>
         <th className="text-left p-2 font-black uppercase tracking-wide">
          Evidence
         </th>
        </tr>
       </thead>
       <tbody>
        {payload.metrics.map((metric, idx) => (
         <tr
          key={`metric-${idx}`}
          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
          <td className="p-2 border-t border-black/10 font-bold">
           {metric.label}
          </td>
          <td className="p-2 border-t border-black/10 font-bold">
           {String(metric.value)}
          </td>
          <td className="p-2 border-t border-black/10 font-bold">
           {metric.evidence || "-"}
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    )}
    {payload.bullets && payload.bullets.length > 0 && (
     <ul className="space-y-1">
      {payload.bullets.map((item, idx) => (
       <li key={`bullet-${idx}`} className="text-sm font-bold">
        {idx + 1}. {item}
       </li>
      ))}
     </ul>
    )}
    {payload.notes && payload.notes.length > 0 && (
     <div className="space-y-1">
      {payload.notes.map((note, idx) => (
       <p
        key={`note-${idx}`}
        className="text-xs font-black uppercase tracking-wide text-black/60">
        {note}
       </p>
      ))}
     </div>
    )}
   </div>
  )
 }

 const numberLike = (value: unknown): number => {
  const numeric = Number(String(value ?? "").replace(/[^0-9.-]/g, ""))
  return Number.isFinite(numeric) ? numeric : 0
 }

 const deriveChartData = (
  blockTitle: string,
  tableSpec?: { headers: string[]; rows: Array<Array<string | number>> },
  chartSpec?: { xAxisKey: string; dataKeys: string[] },
 ): Array<Record<string, unknown>> => {
  const upperTitle = String(blockTitle || "").toUpperCase()

  const keywordMatrixRows = ultimateReport?.keywordComparisonTable?.rows || []
  const keywordMatrixHeaders = ultimateReport?.keywordComparisonTable?.headers || []
  const keywordMatrixData = keywordMatrixRows.map((row) => {
   const record: Record<string, unknown> = {}
   keywordMatrixHeaders.forEach((h, i) => {
    record[String(h)] = row[i]
   })
   const keyword = String(row[0] || "")
   record.keyword = keyword
   record.avgViews = numberLike(row[1])
   record.avgRetention = numberLike(row[2])
   record.avgSubs = numberLike(row[3])
   record.efficiencyScore = numberLike(row[4])
   return record
  })

  if (upperTitle.includes("ENGAGEMENT MATRIX") && keywordMatrixData.length > 0) {
   return keywordMatrixData.map((row) => ({
    keyword: row.keyword,
    avgRetention: numberLike(row.avgRetention),
    avgSubs: numberLike(row.avgSubs),
    efficiencyScore: numberLike(row.efficiencyScore),
   }))
  }

  if (upperTitle.includes("KEYWORD") && keywordMatrixData.length > 0) {
   return keywordMatrixData.map((row) => ({
    keyword: row.keyword,
    avgViews: numberLike(row.avgViews),
    avgRetention: numberLike(row.avgRetention),
    avgSubs: numberLike(row.avgSubs),
    efficiencyScore: numberLike(row.efficiencyScore),
   }))
  }

  if (upperTitle.includes("COMPARATIVE") && tableSpec?.headers?.length && tableSpec?.rows?.length) {
   return tableSpec.rows.map((row) => ({
    dimension: String(row[0] || ""),
    value: numberLike(row[1]),
   }))
  }

  if (tableSpec?.headers?.length && tableSpec?.rows?.length && chartSpec) {
   const headers = tableSpec.headers.map((h) => String(h || "").trim())
   return tableSpec.rows.map((row) => {
    const obj: Record<string, unknown> = {}
    headers.forEach((header, idx) => {
      obj[header] = row[idx]
    })
    if (!(chartSpec.xAxisKey in obj) && headers[0]) obj[chartSpec.xAxisKey] = row[0]
    chartSpec.dataKeys.forEach((key, idx) => {
      if (!(key in obj) && headers[idx + 1]) obj[key] = row[idx + 1]
    })
    return obj
   })
  }
  return keywordData?.keywordMetrics || []
 }

 return (
  <div
   className={`animate-fade-in max-w-[1500px] mx-auto ${
    embedded ? "pb-0" : "pb-24"
   }`}>
   {showFullSurface ?
    <div className="border-4 border-black bg-white rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_black] mb-12">
     <div className="bg-[#00CCFF] border-b-4 border-black px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
       <Brain size={28} className="text-black" />
       <span className="text-3xl font-[1000] uppercase tracking-tight text-black">
        NEURAL NEXUS v2.0
       </span>
      </div>
      <span className="text-[10px] font-black opacity-50 tracking-widest uppercase">
       Strategy DNA Broadcast
      </span>
     </div>
     <div className="p-6 bg-[#F4F7F8] flex flex-col md:flex-row gap-4">
      <input
       type="text"
       value={nexusContext}
       onChange={(e) => setNexusContext(e.target.value)}
       placeholder="INPUT STRATEGIC INTENT OR PASTE CHANNEL METRICS..."
       className="flex-1 bg-white border-2 border-black/25 text-black p-4 font-black text-sm uppercase tracking-widest outline-none placeholder:text-black/35 rounded-xl"
       disabled={loading}
      />
      <button
       onClick={runOmniBrain}
       disabled={loading}
       className="bg-[#00CCFF] text-black font-[1000] text-xl uppercase px-12 py-4 rounded-xl border-2 border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
       {loading ?
        <>
         <Loader2 className="animate-spin" size={24} /> CALIBRATING...
        </>
       : "SYNC DNA"}
      </button>
     </div>
    </div>
   : <div
     className={
      embedded ?
       "border-0 bg-transparent rounded-none overflow-visible shadow-none mb-0"
      : "border-4 border-black bg-white rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_black] mb-12"
     }>
     {!embedded && (
      <div className="bg-[#CCFF00] border-b-4 border-black px-6 py-4 flex items-center justify-between">
       <div className="flex items-center gap-3">
        <FileText size={24} className="text-black" />
        <span className="text-2xl font-[1000] uppercase tracking-tight text-black">
         Intelligence Report Generator
        </span>
       </div>
       <span className="text-[10px] font-black opacity-60 tracking-widest uppercase">
        Optional Context
       </span>
      </div>
     )}
     <div className={`bg-[#F4F7F8] flex flex-col md:flex-row gap-4 ${embedded ? "p-0" : "p-6"}`}>
      <input
       type="text"
       value={nexusContext}
       onChange={(e) => setNexusContext(e.target.value)}
       placeholder="OPTIONAL: ADD EXTRA STRATEGIC CONTEXT"
       className="flex-1 bg-white border-2 border-black/25 text-black p-4 font-black text-sm uppercase tracking-widest outline-none placeholder:text-black/35 rounded-xl"
       disabled={loading}
      />
      <button
       onClick={runOmniBrain}
       disabled={loading}
       className="bg-[#CCFF00] text-black font-[1000] text-xl uppercase px-12 py-4 rounded-xl border-2 border-[#CCFF00] hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
       {loading ?
        <>
         <Loader2 className="animate-spin" size={24} /> GENERATING...
        </>
       : "CONNECT TO CREATE"}
      </button>
     </div>
    </div>
   }

   {ultimateReport && (
    <div className="border-4 border-black bg-white rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_black] mb-12">
     <div className="bg-[#CCFF00] border-b-4 border-black px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
       <TrendingUp size={24} className="text-black" />
       <span className="text-2xl font-[1000] uppercase tracking-tight text-black">
        Ultimate Channel Report · /performance
       </span>
      </div>
      <span className="text-[10px] font-black opacity-60 tracking-widest uppercase">
       {new Date(ultimateReport.meta.generatedAt).toLocaleString()}
      </span>
     </div>
     <div className="p-6 md:p-8 bg-[#f5f5f5] space-y-6">
      {generationStatus && (
       <div className="border-3 border-black rounded-2xl bg-[#FFF2A8] px-4 py-3">
        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-black">{generationStatus}</p>
       </div>
      )}
      {preflight && !preflight.ok && (
       <div className="border-3 border-black rounded-2xl bg-[#FFE3E8] px-4 py-3 space-y-2">
        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-black">Generation Blocked · Required Sources Missing</p>
        <ul className="text-xs font-bold list-disc ml-5">
         {preflight.blockers.map((blocker) => (
          <li key={blocker}>{blocker}</li>
         ))}
        </ul>
       </div>
      )}
      <div className="border-3 border-black bg-white rounded-2xl p-4 md:p-6">
       <h3 className="text-xl font-[1000] uppercase mb-2">
        Executive Command Snapshot
       </h3>
       <p className="text-[10px] font-black uppercase tracking-[0.12em] text-black/45 mb-2">
        Mode: {ultimateReport.meta.analysisMode} · Prompt Pack:{" "}
        {ultimateReport.meta.promptPackVersion}
       </p>
       <p className="text-sm font-bold whitespace-pre-wrap">
        {ultimateReport.executiveSummary}
       </p>
       {(ultimateReport.meta.overallStatus || sessionMeta?.overallStatus) && (
        <div className="mt-4 border-2 border-black rounded-xl bg-[#f8f8f8] p-3">
         <p className="text-[10px] font-black uppercase tracking-[0.12em]">
          Run Health · {(ultimateReport.meta.overallStatus || sessionMeta?.overallStatus || "running").toUpperCase()}
         </p>
         <p className="text-[10px] font-bold mt-1">
          Completed: {ultimateReport.meta.completedCount || 0} · Degraded: {ultimateReport.meta.degradedCount || 0} · Failed: {ultimateReport.meta.failedCount || 0}
         </p>
        </div>
       )}
      </div>
      {sectionStates.length > 0 && (
       <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <aside className="xl:col-span-3 border-3 border-black rounded-2xl bg-white p-4">
         <h4 className="font-[1000] uppercase text-sm mb-3">Section Timeline</h4>
         <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
          {sectionStates.map((section) => (
           <div key={`timeline-${section.id}`} className="border-2 border-black rounded-lg p-2 bg-[#f8f8f8]">
            <div className="flex items-center justify-between gap-2">
             <span className="text-[10px] font-black uppercase">{section.order}. {section.title}</span>
             <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border border-black">{section.status}</span>
            </div>
           </div>
          ))}
         </div>
        </aside>
        <aside className="xl:col-span-9 border-3 border-black rounded-2xl bg-white p-4">
         <h4 className="font-[1000] uppercase text-sm mb-3">Generation Stream</h4>
         <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
          {generationEvents.length === 0 ? (
           <p className="text-xs font-bold text-black/50">No section events yet.</p>
          ) : (
           generationEvents.map((event, idx) => (
            <div key={`event-${idx}`} className="border-2 border-black rounded-lg p-2 bg-[#f8f8f8]">
             <p className="text-[9px] font-black uppercase">{event.sectionId} · {event.status}</p>
             <p className="text-[10px] font-bold">{event.note}</p>
            </div>
           ))
          )}
         </div>
        </aside>
       </div>
      )}
      <div className="grid grid-cols-1 gap-5">
       {ultimateReport.blocks.map((block) => (
        <section
         key={block.id}
         className="border-3 border-black rounded-2xl bg-white overflow-hidden">
         <header className="px-4 py-3 border-b-3 border-black bg-[#efefef] flex items-center justify-between">
          <div>
           <h4 className="font-[1000] uppercase tracking-tight text-sm md:text-base">
            {block.id}. {block.title}
           </h4>
           {block.subtitle ?
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-black/50 mt-1">
             {block.subtitle}
            </p>
           : null}
          </div>
          <span className="text-[10px] font-black opacity-50 uppercase">
           Auto Generated
          </span>
         </header>
         <div className="p-4 md:p-5 space-y-4">
          <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">
           {block.summary || "Section generated without summary. Review diagnostics in timeline."}
          </p>
          {renderPayload(block.payload)}
          {block.chartSuggestion && (
           <div className="border-2 border-black rounded-xl bg-gray-50 p-4 overflow-x-auto">
            {(() => {
             const sectionChartData = deriveChartData(block.title, block.tableSpec, block.chartSuggestion)
             if (!sectionChartData.length) {
              return (
               <p className="text-xs font-bold">
                Chart data unavailable for this section in current run.
               </p>
              )
             }
             return (
              <IntelligenceChart
               config={block.chartSuggestion}
               data={sectionChartData}
              />
             )
            })()}
           </div>
          )}
          {block.tableSpec && (
           <div className="border-2 border-black rounded-xl overflow-auto max-h-[260px]">
            <table className="w-full border-collapse text-xs">
             <thead className="bg-black text-white sticky top-0">
              <tr>
               {block.tableSpec.headers.map((header) => (
                <th
                 key={header}
                 className="text-left p-2 font-black uppercase tracking-wide border-r border-white/20">
                 {header}
                </th>
               ))}
              </tr>
             </thead>
             <tbody>
              {block.tableSpec.rows.map((row, rowIdx) => (
               <tr
                key={`${block.id}-row-${rowIdx}`}
                className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {row.map((cell, cellIdx) => (
                 <td
                  key={`${block.id}-${rowIdx}-${cellIdx}`}
                  className="p-2 border-t border-black/10 border-r border-black/10 font-bold whitespace-nowrap">
                  {String(cell)}
                 </td>
                ))}
               </tr>
              ))}
             </tbody>
            </table>
           </div>
          )}
          {block.recommendations.length > 0 && (
           <ul className="space-y-1">
            {block.recommendations.map((item, idx) => (
             <li key={`${block.id}-rec-${idx}`} className="text-sm font-bold">
              {idx + 1}. {item}
             </li>
            ))}
           </ul>
          )}
         </div>
        </section>
       ))}
      </div>
     </div>
    </div>
   )}

   {/* MASTER DOSSIER (Hidden until generated) */}
   {showFullSurface && isGenerated && !loading && (
    <div className="space-y-12 animate-fade-in">
     {/* HEADER: COMMAND BRIEF & GOVERNOR */}
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white flex flex-col">
       <div className="bg-black text-white px-6 py-3 font-black uppercase text-sm flex items-center gap-2">
        <Zap size={16} className="text-[#FFDD00]" /> DAILY COMMAND BRIEF
       </div>
       <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <div className="md:col-span-2 space-y-4">
         <h3 className="text-4xl font-[1000] uppercase tracking-tight leading-none">
          {diagnosis?.dailyBrief?.priority || "STRATEGY CALIBRATED"}
         </h3>
         <div className="space-y-3 mt-4">
          {diagnosis?.dailyBrief?.steps?.map((step, i) => (
           <div
            key={i}
            className="flex gap-4 items-start p-3 bg-gray-50 border-2 border-black rounded-xl">
            <span className="bg-black text-[#FFDD00] w-6 h-6 flex items-center justify-center rounded-full font-black text-xs flex-shrink-0">
             {i + 1}
            </span>
            <span className="font-bold text-sm">{step}</span>
           </div>
          ))}
         </div>
        </div>
        <div className="bg-[#FFDD00] p-6 border-4 border-black rounded-3xl flex flex-col justify-center items-center text-center shadow-[4px_4px_0px_0px_black]">
         <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
          Impact Potential
         </span>
         <span className="text-5xl font-[1000]">
          {diagnosis?.dailyBrief?.impact || "0%"}
         </span>
        </div>
       </div>
      </div>

      <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white flex flex-col">
       <div className="bg-[#FF3399] text-white px-6 py-3 font-black uppercase text-sm">
        THE GOVERNOR
       </div>
       <div className="p-6 space-y-4 flex-1">
        {[
         {
          label: "CTR Pivot Protocol",
          desc: "Auto-swap thumbnails at 24h threshold",
          on: true,
         },
         {
          label: "Retention Rescue",
          desc: "Pin comments at major drop-off markers",
          on: false,
         },
         {
          label: "Audience Seeding",
          desc: "Cross-pollinate shorts viewers to long-form",
          on: true,
         },
        ].map((g, i) => (
         <div
          key={i}
          className="p-3 border-2 border-black rounded-xl bg-gray-50 flex justify-between items-center">
          <div>
           <p className="font-black text-xs uppercase">{g.label}</p>
           <p className="text-[10px] font-bold opacity-50">{g.desc}</p>
          </div>
          <div
           className={`w-10 h-5 ${g.on ? "bg-[#FF3399]" : "bg-gray-300"} border-2 border-black rounded-full relative transition-colors`}>
           <div
            className={`absolute ${g.on ? "right-[2px]" : "left-[2px]"} top-[2px] w-3 h-3 bg-black rounded-full transition-all`}></div>
          </div>
         </div>
        ))}
       </div>
      </div>
     </div>

     {/* ROW 1: ALGORITHMIC FINGERPRINTING */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-[#00CCFF]">
       <div className="px-6 py-3 font-black uppercase text-sm border-b-4 border-black bg-white">
        CLUSTER CENTER
       </div>
       <div className="p-6 flex items-center justify-center h-full">
        <span className="text-4xl font-[1000] uppercase text-center text-black leading-none">
         {diagnosis?.clusterCenter || "UNKNOWN"}
        </span>
       </div>
      </div>
      <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white">
       <div className="px-6 py-3 font-black uppercase text-sm border-b-4 border-black bg-gray-100">
        NICHE AUTHORITY
       </div>
       <div className="p-6 flex items-center justify-center h-full">
        <span className="text-6xl font-[1000] text-[#00CCFF]">
         {diagnosis?.nicheAuthority || 0}%
        </span>
       </div>
      </div>
      <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-black">
       <div className="px-6 py-3 font-black uppercase text-sm border-b-4 border-black bg-white">
        TOPIC RESONANCE
       </div>
       <div className="p-6 flex items-end justify-between h-full gap-2">
        {[40, 70, 45, 90, 65, 80].map((h, i) => (
         <div
          key={i}
          className="flex-1 bg-[#CCFF00] border-2 border-black rounded-t-md"
          style={{ height: `${h}%` }}></div>
        ))}
       </div>
      </div>
     </div>

     {/* ROW 2: ORACLE 9-SECTION STRATEGY */}
     {report?.sections && report.sections.length > 0 && (
      <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_black] bg-white">
       <div className="bg-[#9D4EDD] text-white px-6 py-4 flex items-center gap-3 border-b-4 border-black">
        <Eye size={24} />
        <span className="text-2xl font-[1000] uppercase tracking-tight">
         ORACLE STRATEGY DOSSIER
        </span>
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Navigation */}
        <div className="lg:col-span-3 border-b-4 lg:border-b-0 lg:border-r-4 border-black bg-gray-50 flex flex-col">
         {report.sections.map((s, i) => (
          <button
           key={i}
           onClick={() => setActiveSectionIdx(i)}
           className={`text-left p-4 border-b-2 border-black font-black text-xs uppercase transition-colors flex items-center ${activeSectionIdx === i ? "bg-[#9D4EDD] text-white" : "hover:bg-gray-200 text-black"}`}>
           <span className="opacity-50 mr-3 text-[10px] w-4">
            {String(i + 1).padStart(2, "0")}
           </span>
           {s.title}
          </button>
         ))}
        </div>
        {/* Content */}
        <div className="lg:col-span-9 p-8 flex flex-col bg-white">
         <div className="flex justify-between items-center mb-6">
          <h4 className="text-3xl font-[1000] uppercase tracking-tight">
           {report.sections[activeSectionIdx]?.title}
          </h4>
          <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">
           Section {activeSectionIdx + 1} of {report.sections.length}
          </span>
         </div>
         <div className="prose max-w-none text-sm font-bold whitespace-pre-wrap leading-relaxed mb-8">
          {report.sections[activeSectionIdx]?.content}
         </div>
         {report.sections[activeSectionIdx]?.chartSuggestion && (
          <div className="mt-auto border-4 border-dashed border-black rounded-3xl p-6 bg-gray-50">
           <IntelligenceChart
            config={report.sections[activeSectionIdx].chartSuggestion!}
            data={[]}
           />
          </div>
         )}
        </div>
       </div>
      </div>
     )}

     {/* ROW 3: MARKET INTELLIGENCE (Keyword Lab) */}
     {keywordData && (
      <div className="space-y-8">
       <div className="flex items-center gap-4">
        <div className="h-1 flex-1 bg-black"></div>
        <h2 className="text-3xl font-[1000] uppercase tracking-widest">
         MARKET INTELLIGENCE
        </h2>
        <div className="h-1 flex-1 bg-black"></div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {keywordData.keywordMetrics?.length > 0 && (
         <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white">
          <div className="bg-[#FFB158] px-6 py-3 font-black uppercase text-sm border-b-4 border-black">
           OPPORTUNITY MATRIX
          </div>
          <div className="p-6">
           <IntelligenceChart
            config={{
             type: "scatter",
             title: "Difficulty vs Volume",
             xAxisKey: "volume",
             dataKeys: ["difficulty"],
            }}
            data={keywordData.keywordMetrics}
           />
          </div>
         </div>
        )}

        {keywordData.contentFormats?.length > 0 && (
         <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white">
          <div className="bg-[#CCFF00] px-6 py-3 font-black uppercase text-sm border-b-4 border-black">
           WINNING FORMATS
          </div>
          <div className="p-6">
           <IntelligenceChart
            config={{
             type: "pie",
             title: "Format Distribution",
             xAxisKey: "name",
             dataKeys: ["percentage"],
            }}
            data={keywordData.contentFormats}
           />
          </div>
         </div>
        )}

        {keywordData.searchIntent?.length > 0 && (
         <div className="lg:col-span-2 border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_black] bg-white">
          <div className="bg-black text-white px-6 py-3 font-black uppercase text-sm border-b-4 border-black flex items-center gap-2">
           <Target size={16} /> SEARCH INTENT DECODER
          </div>
          <div className="overflow-x-auto">
           <table className="w-full border-collapse">
            <thead>
             <tr className="bg-gray-100 border-b-4 border-black">
              <th className="text-left p-4 font-black text-xs uppercase">
               Query
              </th>
              <th className="text-left p-4 font-black text-xs uppercase">
               Intent
              </th>
              <th className="text-left p-4 font-black text-xs uppercase">
               Content Angle
              </th>
             </tr>
            </thead>
            <tbody>
             {keywordData.searchIntent.map((si, i) => (
              <tr
               key={i}
               className="border-b-2 border-gray-200 hover:bg-gray-50">
               <td className="p-4 font-bold text-sm border-r-2 border-gray-200">
                {si.query}
               </td>
               <td className="p-4 border-r-2 border-gray-200">
                <span className="bg-black text-[#00CCFF] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                 {si.intent}
                </span>
               </td>
               <td className="p-4 text-sm font-bold opacity-80">
                {si.contentAngle}
               </td>
              </tr>
             ))}
            </tbody>
           </table>
          </div>
         </div>
        )}
       </div>
      </div>
     )}
    </div>
   )}
  </div>
 )
}

export default IntelligenceHub
