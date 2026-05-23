import React, { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import type { CsvMajorFamily } from "../../types"
import {
 CHANNEL_DATA_DOWNLOAD_STEPS,
 CHANNEL_DATA_GUIDE_FAMILIES,
 CHANNEL_DATA_MISSING_REASON_NOTES,
 CHANNEL_DATA_SOURCE_GUIDE,
 type ChannelDataGuideAvailability,
 getChannelDataFamilyStyle,
} from "../../services/analytics/MetricRegistry"

export type ChannelDataNextAction = {
 id: string
 title: string
 body: string
 majorFamily: CsvMajorFamily
}

export type ChannelDataFamilyCoverage = {
 majorFamily: CsvMajorFamily
 label: string
 status: "ready" | "partial" | "missing"
 count: number
 detail: string
}

type ChannelDataGuidePanelProps = {
 nextActions: ChannelDataNextAction[]
 familyCoverage: ChannelDataFamilyCoverage[]
 showCsvNeedHint: boolean
 detectedCategoriesLabel: string
 selectedWindowLabel: string
}

type GuideSectionId =
 | "next_actions"
 | "coverage"
 | "missing_metrics"
 | "source_map"
 | "download_guide"
 | "breakdown_reference"

const availabilityBadgeClass = (availability: ChannelDataGuideAvailability): string => {
 switch (availability) {
  case "api":
   return "bg-[#4FFF5B] text-black"
  case "public":
   return "bg-[#24D3FF] text-black"
  case "reporting":
   return "bg-[#B14AED] text-white"
  case "csv_only":
   return "bg-[#FFE357] text-black"
  }
}

const statusBadgeClass = (status: "ready" | "partial" | "missing"): string => {
 switch (status) {
  case "ready":
   return "bg-[#4FFF5B] text-black"
  case "partial":
   return "bg-[#FFE357] text-black"
  case "missing":
   return "bg-white text-black"
  }
}

const tableCellHeaderClass =
 "border-b-[3px] border-black bg-black px-3 py-2 text-left text-[10px] font-[1000] uppercase tracking-[0.18em] text-white"

const tableCellBodyClass = "border-b-[2px] border-black/12 px-3 py-3 align-top"

const expandButtonClass =
 "inline-flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-black bg-[#D9FF00] text-[12px] font-[1000]"

const sectionFrameClass = "overflow-hidden rounded-[24px] border-[4px] border-black bg-white"

const tableSectionTone: Record<GuideSectionId, string> = {
 next_actions: "bg-[#D9FF00]",
 coverage: "bg-[#FFE357]",
 missing_metrics: "bg-[#FF83EA]",
 source_map: "bg-[#24D3FF]",
 download_guide: "bg-[#FFB570]",
 breakdown_reference: "bg-[#579AFF]",
}

export const ChannelDataGuidePanel: React.FC<ChannelDataGuidePanelProps> = ({
 nextActions,
 familyCoverage,
 showCsvNeedHint,
 detectedCategoriesLabel,
 selectedWindowLabel,
}) => {
 const [openSections, setOpenSections] = useState<Set<string>>(
  () => new Set(["next_actions", "source_map", "breakdown_reference"]),
 )
 const [openFamilies, setOpenFamilies] = useState<Set<string>>(
  () => new Set([CHANNEL_DATA_GUIDE_FAMILIES[0]?.id || "content"]),
 )

 const actionRows = nextActions.length
  ? nextActions
  : [
     {
      id: "channel-data-ready",
      title: "Core data is ready",
      body: "Use the reference rows below to decide which exports or deeper sync passes you still want to add next.",
      majorFamily: "video_data" as const,
     },
    ]

 const coverageByFamily = useMemo(
  () => new Map(familyCoverage.map((item) => [item.majorFamily, item] as const)),
  [familyCoverage],
 )

 const sourceRows = CHANNEL_DATA_SOURCE_GUIDE.map((row) => ({
  title: row.title,
  status: row.speed,
  summary: row.bestFor,
  source: row.needsLogin === "Yes" ? "Login required" : row.needsLogin === "Optional" ? "Optional login" : "Public or package-based",
  window: row.whenToUse,
 }))

 const sectionRows = [
  {
   id: "next_actions" as const,
   title: "What You Can Do Next",
   status: `${actionRows.length} next step${actionRows.length === 1 ? "" : "s"}`,
   summary: "Short, actionable next moves based on your current sync state and detected uploads.",
   source: detectedCategoriesLabel || "No uploads detected yet",
   window: selectedWindowLabel,
  },
  {
   id: "coverage" as const,
   title: "Coverage Checklist",
   status: `${familyCoverage.filter((item) => item.status === "ready").length} ready`,
   summary: "Which major hard-data families are ready, partial, or still missing.",
   source: `${familyCoverage.length} families tracked`,
   window: selectedWindowLabel,
  },
  {
   id: "missing_metrics" as const,
   title: "Why Some Metrics Are Missing",
   status: showCsvNeedHint ? "CSV may be needed" : "Known limitations",
   summary: "Plain-language reasons some breakdowns or metrics do not appear through the main sync path.",
   source: "API + CSV + reporting limits",
   window: selectedWindowLabel,
  },
  {
   id: "source_map" as const,
   title: "How To Get Stats Into ViewTube",
   status: `${sourceRows.length} source paths`,
   summary: "What each source adds, whether login is required, and when to use it.",
   source: "API, public data, reporting, CSV",
   window: selectedWindowLabel,
  },
  {
   id: "download_guide" as const,
   title: "How To Download YouTube CSV Exports",
   status: `${CHANNEL_DATA_DOWNLOAD_STEPS.length} steps`,
   summary: "How to use YouTube Studio Advanced mode to choose the correct date window, breakdown, and metrics.",
   source: "YouTube Studio Advanced mode",
   window: selectedWindowLabel,
  },
  {
   id: "breakdown_reference" as const,
   title: "Breakdowns, Metrics, and Dimensions",
   status: `${CHANNEL_DATA_GUIDE_FAMILIES.length} data families`,
   summary: "Expandable reference for export types, date windows, key metrics, source availability, and upload recommendations.",
   source: "Registry-driven reference",
   window: selectedWindowLabel,
  },
 ]

 const toggleSection = (sectionId: GuideSectionId) => {
  setOpenSections((previous) => {
   const next = new Set(previous)
   if (next.has(sectionId)) next.delete(sectionId)
   else next.add(sectionId)
   return next
  })
 }

 const toggleFamily = (familyId: string) => {
  setOpenFamilies((previous) => {
   const next = new Set(previous)
   if (next.has(familyId)) next.delete(familyId)
   else next.add(familyId)
   return next
  })
 }

 return (
  <div className="space-y-4">
   <div className={sectionFrameClass}>
    <div className="flex items-center justify-between gap-4 border-b-[4px] border-black bg-black px-4 py-3 text-white">
     <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center border-r-[4px] border-white/15 bg-[#D9FF00] text-[20px] font-[1000] text-black">
       ≡
      </div>
      <div>
       <h3 className="text-[22px] font-[1000] uppercase leading-none">Channel Data Guide</h3>
       <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
        Sync help, upload guidance, and breakdown reference in one expandable table
       </p>
      </div>
     </div>
     <div className="hidden md:block text-right">
      <p className="text-[10px] font-[1000] uppercase tracking-[0.18em] text-white/65">Detected Uploads</p>
      <p className="mt-1 text-[11px] font-bold uppercase text-white">{detectedCategoriesLabel || "None"}</p>
     </div>
    </div>

    <div className="overflow-x-auto">
     <table className="w-full min-w-[980px] border-collapse bg-white">
      <thead>
       <tr>
        <th className={`${tableCellHeaderClass} w-[58px]`}></th>
        <th className={tableCellHeaderClass}>Section</th>
        <th className={tableCellHeaderClass}>Status</th>
        <th className={tableCellHeaderClass}>What It Covers</th>
        <th className={tableCellHeaderClass}>Best Source</th>
        <th className={tableCellHeaderClass}>Window</th>
       </tr>
      </thead>
      <tbody>
       {sectionRows.map((section) => {
        const isOpen = openSections.has(section.id)
        return (
         <React.Fragment key={section.id}>
          <tr className="bg-white align-top">
           <td className={`${tableCellBodyClass} text-center`}>
            <button
             type="button"
             onClick={() => toggleSection(section.id)}
             className={expandButtonClass}
             aria-label={isOpen ? `Collapse ${section.title}` : `Expand ${section.title}`}>
             <ChevronDown size={14} strokeWidth={3} className={isOpen ? "rotate-180" : ""} />
            </button>
           </td>
           <td className={tableCellBodyClass}>
            <div className="flex items-center gap-3">
             <span className={`inline-flex rounded-full border-[2px] border-black px-2 py-1 text-[8px] font-[1000] uppercase tracking-[0.18em] ${tableSectionTone[section.id]}`}>
              {section.title}
             </span>
            </div>
           </td>
           <td className={tableCellBodyClass}>
            <span className="text-[12px] font-[1000] uppercase leading-tight">{section.status}</span>
           </td>
           <td className={tableCellBodyClass}>
            <p className="text-[11px] font-bold leading-5 text-black/75">{section.summary}</p>
           </td>
           <td className={tableCellBodyClass}>
            <p className="text-[11px] font-[1000] leading-5 text-black/80">{section.source}</p>
           </td>
           <td className={tableCellBodyClass}>
            <p className="text-[11px] font-[1000] uppercase leading-5 text-black/65">{section.window}</p>
           </td>
          </tr>

          {isOpen ? (
           <tr>
            <td colSpan={6} className="border-b-[3px] border-black bg-[#F8F8F8] p-0">
             {section.id === "next_actions" ? (
              <div className="overflow-x-auto">
               <table className="w-full min-w-[920px] border-collapse">
                <thead>
                 <tr>
                  <th className="border-b-[2px] border-black bg-[#D9FF00] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Family</th>
                  <th className="border-b-[2px] border-black bg-[#D9FF00] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Next Step</th>
                  <th className="border-b-[2px] border-black bg-[#D9FF00] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Why It Matters</th>
                 </tr>
                </thead>
                <tbody>
                 {actionRows.map((action) => {
                  const style = getChannelDataFamilyStyle(action.majorFamily)
                  return (
                   <tr key={action.id}>
                    <td className="border-b border-black/10 px-3 py-3">
                     <span className={`inline-flex rounded-full border-[2px] border-black px-2 py-1 text-[8px] font-[1000] uppercase tracking-[0.18em] ${style.pillClass}`}>
                      {style.label}
                     </span>
                    </td>
                    <td className="border-b border-black/10 px-3 py-3 text-[12px] font-[1000] uppercase">{action.title}</td>
                    <td className="border-b border-black/10 px-3 py-3 text-[11px] font-bold leading-5 text-black/75">{action.body}</td>
                   </tr>
                  )
                 })}
                </tbody>
               </table>
              </div>
             ) : null}

             {section.id === "coverage" ? (
              <div className="overflow-x-auto">
               <table className="w-full min-w-[920px] border-collapse">
                <thead>
                 <tr>
                  <th className="border-b-[2px] border-black bg-[#FFE357] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Family</th>
                  <th className="border-b-[2px] border-black bg-[#FFE357] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Status</th>
                  <th className="border-b-[2px] border-black bg-[#FFE357] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Count</th>
                  <th className="border-b-[2px] border-black bg-[#FFE357] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Helpful Note</th>
                 </tr>
                </thead>
                <tbody>
                 {familyCoverage.map((item) => {
                  const style = getChannelDataFamilyStyle(item.majorFamily)
                  return (
                   <tr key={item.majorFamily}>
                    <td className="border-b border-black/10 px-3 py-3">
                     <span className={`inline-flex rounded-full border-[2px] border-black px-2 py-1 text-[8px] font-[1000] uppercase tracking-[0.18em] ${style.pillClass}`}>
                      {item.label}
                     </span>
                    </td>
                    <td className="border-b border-black/10 px-3 py-3">
                     <span className={`inline-flex rounded-full border-[2px] border-black px-2 py-1 text-[8px] font-[1000] uppercase tracking-[0.18em] ${statusBadgeClass(item.status)}`}>
                      {item.status}
                     </span>
                    </td>
                    <td className="border-b border-black/10 px-3 py-3 text-[12px] font-[1000] uppercase">{item.count}</td>
                    <td className="border-b border-black/10 px-3 py-3 text-[11px] font-bold leading-5 text-black/75">{item.detail}</td>
                   </tr>
                  )
                 })}
                </tbody>
               </table>
              </div>
             ) : null}

             {section.id === "missing_metrics" ? (
              <div className="space-y-0">
               <table className="w-full border-collapse">
                <thead>
                 <tr>
                  <th className="border-b-[2px] border-black bg-[#FF83EA] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Reason</th>
                 </tr>
                </thead>
                <tbody>
                 {CHANNEL_DATA_MISSING_REASON_NOTES.map((note) => (
                  <tr key={note}>
                   <td className="border-b border-black/10 px-3 py-3 text-[11px] font-bold leading-5 text-black/75">{note}</td>
                  </tr>
                 ))}
                 {showCsvNeedHint ? (
                  <tr>
                   <td className="px-3 py-3 text-[10px] font-[1000] uppercase tracking-[0.18em] text-[#B10063]">
                    Upload a YouTube Studio analytics export to add impressions, click-through rate, and stayed-to-watch coverage.
                   </td>
                  </tr>
                 ) : null}
                </tbody>
               </table>
              </div>
             ) : null}

             {section.id === "source_map" ? (
              <div className="overflow-x-auto">
               <table className="w-full min-w-[1040px] border-collapse">
                <thead>
                 <tr>
                  <th className="border-b-[2px] border-black bg-[#24D3FF] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Source</th>
                  <th className="border-b-[2px] border-black bg-[#24D3FF] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Best For</th>
                  <th className="border-b-[2px] border-black bg-[#24D3FF] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Needs Login</th>
                  <th className="border-b-[2px] border-black bg-[#24D3FF] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Speed</th>
                  <th className="border-b-[2px] border-black bg-[#24D3FF] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">What It Adds</th>
                  <th className="border-b-[2px] border-black bg-[#24D3FF] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">When You Need It</th>
                 </tr>
                </thead>
                <tbody>
                 {CHANNEL_DATA_SOURCE_GUIDE.map((row) => (
                  <tr key={row.id}>
                   <td className="border-b border-black/10 px-3 py-3 text-[12px] font-[1000] uppercase">{row.title}</td>
                   <td className="border-b border-black/10 px-3 py-3 text-[11px] font-bold leading-5 text-black/75">{row.bestFor}</td>
                   <td className="border-b border-black/10 px-3 py-3 text-[11px] font-[1000] uppercase">{row.needsLogin}</td>
                   <td className="border-b border-black/10 px-3 py-3 text-[11px] font-[1000] uppercase">{row.speed}</td>
                   <td className="border-b border-black/10 px-3 py-3 text-[11px] font-bold leading-5 text-black/75">{row.adds}</td>
                   <td className="border-b border-black/10 px-3 py-3 text-[11px] font-bold leading-5 text-black/75">{row.whenToUse}</td>
                  </tr>
                 ))}
                </tbody>
               </table>
              </div>
             ) : null}

             {section.id === "download_guide" ? (
              <div className="overflow-x-auto">
               <table className="w-full min-w-[920px] border-collapse">
                <thead>
                 <tr>
                  <th className="border-b-[2px] border-black bg-[#FFB570] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Step</th>
                  <th className="border-b-[2px] border-black bg-[#FFB570] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Action</th>
                  <th className="border-b-[2px] border-black bg-[#FFB570] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Why It Matters</th>
                 </tr>
                </thead>
                <tbody>
                 {CHANNEL_DATA_DOWNLOAD_STEPS.map((step, index) => (
                  <tr key={step}>
                   <td className="border-b border-black/10 px-3 py-3 text-[12px] font-[1000] uppercase">{index + 1}</td>
                   <td className="border-b border-black/10 px-3 py-3 text-[12px] font-[1000] leading-5">{step}</td>
                   <td className="border-b border-black/10 px-3 py-3 text-[11px] font-bold leading-5 text-black/75">
                    {index === 3
                     ? "The date range changes the export window and can affect which metrics YouTube shows."
                     : index === 4
                      ? "The breakdown name becomes the export family or table type once it is uploaded into ViewTube."
                      : index === 5
                       ? "The visible columns are the metrics included in the exported file."
                       : index === 7
                        ? "ZIP or full-folder uploads preserve package naming and improve auto-detect confidence."
                        : "This step keeps the export aligned with the dataset you want to merge into ViewTube."}
                   </td>
                  </tr>
                 ))}
                 <tr>
                  <td colSpan={3} className="px-3 py-3 text-[10px] font-[1000] uppercase tracking-[0.18em] text-black">
                   Important: impressions, CTR, and stayed-to-watch percentages may require CSV imports because they are not always available through the main sync path.
                  </td>
                 </tr>
                </tbody>
               </table>
              </div>
             ) : null}

             {section.id === "breakdown_reference" ? (
              <div className="overflow-x-auto">
               <table className="w-full min-w-[1120px] border-collapse">
                <thead>
                 <tr>
                  <th className="border-b-[2px] border-black bg-[#579AFF] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black"></th>
                  <th className="border-b-[2px] border-black bg-[#579AFF] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Family</th>
                  <th className="border-b-[2px] border-black bg-[#579AFF] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Coverage</th>
                  <th className="border-b-[2px] border-black bg-[#579AFF] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Breakdowns</th>
                  <th className="border-b-[2px] border-black bg-[#579AFF] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Upload Recommendation</th>
                  <th className="border-b-[2px] border-black bg-[#579AFF] px-3 py-2 text-left text-[9px] font-[1000] uppercase tracking-[0.18em] text-black">Window Notes</th>
                 </tr>
                </thead>
                <tbody>
                 {CHANNEL_DATA_GUIDE_FAMILIES.map((family) => {
                  const isOpen = openFamilies.has(family.id)
                  const style = getChannelDataFamilyStyle(family.majorFamily)
                  const status = coverageByFamily.get(family.majorFamily)
                  return (
                   <React.Fragment key={family.id}>
                    <tr>
                     <td className="border-b border-black/10 px-3 py-3 text-center">
                      <button
                       type="button"
                       onClick={() => toggleFamily(family.id)}
                       className={expandButtonClass}
                       aria-label={isOpen ? `Collapse ${family.title}` : `Expand ${family.title}`}>
                       <ChevronDown size={14} strokeWidth={3} className={isOpen ? "rotate-180" : ""} />
                      </button>
                     </td>
                     <td className="border-b border-black/10 px-3 py-3">
                      <span className={`inline-flex rounded-full border-[2px] border-black px-2 py-1 text-[8px] font-[1000] uppercase tracking-[0.18em] ${style.pillClass}`}>
                       {family.title}
                      </span>
                     </td>
                     <td className="border-b border-black/10 px-3 py-3">
                      {status ? (
                       <span className={`inline-flex rounded-full border-[2px] border-black px-2 py-1 text-[8px] font-[1000] uppercase tracking-[0.18em] ${statusBadgeClass(status.status)}`}>
                        {status.status} · {status.count}
                       </span>
                      ) : (
                       <span className="text-[11px] font-[1000] uppercase text-black/55">Not tracked yet</span>
                      )}
                     </td>
                     <td className="border-b border-black/10 px-3 py-3 text-[12px] font-[1000] uppercase">{family.rows.length}</td>
                     <td className="border-b border-black/10 px-3 py-3 text-[11px] font-bold leading-5 text-black/75">
                      {family.rows[0]?.uploadRecommendation || "Upload ZIP"}
                     </td>
                     <td className="border-b border-black/10 px-3 py-3 text-[11px] font-bold leading-5 text-black/75">
                      {family.rows[0]?.recommendedDateWindows.slice(0, 3).join(" · ") || selectedWindowLabel}
                     </td>
                    </tr>
                    {isOpen
                     ? family.rows.map((row) => (
                        <tr key={row.id} className="bg-[#F8F8F8]">
                         <td className="border-b border-black/10 px-3 py-3"></td>
                         <td className="border-b border-black/10 px-3 py-3 text-[12px] font-[1000] uppercase">
                          {row.title}
                          <p className="mt-2 text-[9px] font-black uppercase tracking-[0.16em] text-black/45">
                           Breakdown: {row.breakdownLabel}
                          </p>
                         </td>
                         <td className="border-b border-black/10 px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                           {row.availability.map((availability) => (
                            <span
                             key={`${row.id}-${availability}`}
                             className={`inline-flex rounded-full border-[2px] border-black px-2 py-1 text-[8px] font-[1000] uppercase tracking-[0.16em] ${availabilityBadgeClass(availability)}`}>
                             {availability === "api"
                              ? "API"
                              : availability === "public"
                               ? "Public"
                               : availability === "reporting"
                                ? "Reporting"
                                : "CSV only"}
                            </span>
                           ))}
                          </div>
                         </td>
                         <td className="border-b border-black/10 px-3 py-3 text-[11px] font-bold leading-5 text-black/75">
                          {row.metrics.join(", ")}
                         </td>
                         <td className="border-b border-black/10 px-3 py-3 text-[11px] font-[1000] uppercase leading-5">
                          {row.uploadRecommendation}
                         </td>
                         <td className="border-b border-black/10 px-3 py-3 text-[11px] font-bold leading-5 text-black/75">
                          {row.recommendedDateWindows.join(" · ")}
                          <div className="mt-2 rounded-xl border-[2px] border-black bg-white px-3 py-2 text-[10px] font-bold leading-5 text-black/70">
                           {row.notes}
                          </div>
                         </td>
                        </tr>
                       ))
                     : null}
                   </React.Fragment>
                  )
                 })}
                </tbody>
               </table>
              </div>
             ) : null}
            </td>
           </tr>
          ) : null}
         </React.Fragment>
        )
       })}
      </tbody>
     </table>
    </div>
   </div>
  </div>
 )
}

export default ChannelDataGuidePanel
