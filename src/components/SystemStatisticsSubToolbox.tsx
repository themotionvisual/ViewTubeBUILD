import { useMemo, useState } from "react"
import { Database, Search } from "lucide-react"
import { SubToolbox } from "./Toolbox"
import {
 buildDataCoverageInventory,
 type DataCoverageRow,
 type DataCoverageScope,
 type DataCoverageStatus,
} from "../services/dataCoverageInventory"

interface SystemStatisticsSubToolboxProps {
 masterTableRows: Array<Record<string, unknown>>
}

const SCOPE_STYLES: Record<DataCoverageScope, string> = {
 channel: "bg-[#111827] text-white",
 video_shared: "bg-[#CCFF00] text-black",
 short_only: "bg-[#FF7497] text-black",
 long_only: "bg-[#00CCFF] text-black",
 geo: "bg-[#FFDD00] text-black",
 demographic: "bg-[#B14AED] text-white",
 traffic: "bg-[#FFB158] text-black",
 device: "bg-[#8BE9FD] text-black",
 retention: "bg-[#C084FC] text-white",
 monetization: "bg-[#F9A8D4] text-black",
 daily: "bg-[#E5E7EB] text-black",
 history: "bg-black text-white",
}

const sourceLabel = (row: DataCoverageRow): string => {
 if (row.source === "history_placeholder") return "history"
 return row.source
}

const scopeLabel = (row: DataCoverageRow): string =>
 row.source === "formula"
  ? `formula + ${row.scope.replace("_", " ")}`
  : row.scope.replace("_", " ")

const STATUS_STYLES: Record<DataCoverageStatus, string> = {
 received: "bg-[#CCFF00] text-black",
 missing: "bg-[#FF7497] text-black",
 not_applicable: "bg-[#E5E7EB] text-black",
 not_connected: "bg-black text-white",
}

function RawExampleTable({ title, dataObj, colorHex }: { title: string, dataObj: Record<string, unknown> | null, colorHex: string }) {
 if (!dataObj) return null
 const entries = Object.entries(dataObj).filter(([k]) => k !== "_originalData" && !k.startsWith("__"))
 return (
  <div className="mt-8 border-[3px] border-black rounded-lg overflow-hidden bg-white">
   <div className={`p-3 border-b-[3px] border-black font-black uppercase text-sm text-black ${colorHex}`}>
    Raw Payload Schema: {title}
   </div>
   <div className="overflow-auto max-h-[300px]">
    <table className="w-full text-left border-collapse whitespace-nowrap">
     <thead className="bg-[#E5E7EB] border-b-[3px] border-black text-[10px] uppercase font-black sticky top-0 z-10">
      <tr>
       <th className="p-2 border-r border-black/20 w-1/3">Key</th>
       <th className="p-2 border-r border-black/20">Raw Value</th>
       <th className="p-2 w-24 text-center">Type</th>
      </tr>
     </thead>
     <tbody>
      {entries.length === 0 ? (
       <tr><td colSpan={3} className="p-4 text-center font-black opacity-50 text-xs">Empty Payload Result</td></tr>
      ) : (
       entries.map(([k, v]) => (
        <tr key={k} className="border-b border-black/10 hover:bg-[#CCFF00]/20 odd:bg-white even:bg-gray-50">
         <td className="p-2 border-r border-black/10 text-[11px] font-bold font-mono text-black/70">{k}</td>
         <td className="p-2 border-r border-black/10 text-xs truncate max-w-2xl">
          {typeof v === 'object' ? JSON.stringify(v) : String(v)}
         </td>
         <td className="p-2 text-[10px] text-center uppercase font-black text-black/40">
          {typeof v}
         </td>
        </tr>
       ))
      )}
     </tbody>
    </table>
   </div>
  </div>
 )
}

function InspectorTable({
 title,
 dataObj,
 colorHex,
 icon,
}: {
 title: string
 dataObj: Record<string, unknown> | null
 colorHex: string
 icon?: React.ReactNode
}) {
 if (!dataObj) {
  return (
   <div className="bg-white border-[3px] border-black rounded-lg p-6 text-center opacity-30 italic font-black uppercase text-xs">
    No literal {title} data detected in current sink.
   </div>
  )
 }

 const entries = Object.entries(dataObj).filter(
  ([k]) => k !== "_originalData" && !k.startsWith("__"),
 )

 return (
  <div className="border-[3px] border-black rounded-lg overflow-hidden bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
   <div
    className={`p-4 border-b-[3px] border-black flex items-center gap-3 font-black uppercase text-base ${colorHex}`}>
    {icon}
    <span>{title} Payload Reference</span>
   </div>
   <div className="overflow-auto max-h-[400px]">
    <table className="w-full text-left border-collapse whitespace-nowrap">
     <thead className="bg-[#CCFF00] border-b-[3px] border-black text-[11px] uppercase font-black sticky top-0 z-10">
      <tr>
       <th className="p-3 border-r border-black/20 w-1/3">Statistic / Key</th>
       <th className="p-3 border-r border-black/20">Literal Value</th>
       <th className="p-3 w-32 text-center">Type</th>
      </tr>
     </thead>
     <tbody>
      {entries.map(([k, v]) => (
       <tr
        key={k}
        className="border-b border-black/10 hover:bg-[#CCFF00]/10 odd:bg-white even:bg-gray-50 flex-1">
        <td className="p-3 border-r border-black/10 text-xs font-black text-black">
         {k}
        </td>
        <td className="p-3 border-r border-black/10 text-xs font-bold font-mono text-black/70 truncate max-w-xl">
         {typeof v === "object" ? JSON.stringify(v) : String(v)}
        </td>
        <td className="p-3 text-[10px] text-center uppercase font-black text-black/30 bg-black/5">
         {typeof v}
        </td>
       </tr>
      ))}
     </tbody>
    </table>
   </div>
  </div>
 )
}

export function SystemStatisticsSubToolbox({
 masterTableRows,
}: SystemStatisticsSubToolboxProps) {
 const [searchTerm, setSearchTerm] = useState("")
 const [showFullCatalog, setShowFullCatalog] = useState(true)
 const [sortColumn, setSortColumn] = useState<keyof DataCoverageRow>("categoryName")
 const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

 const inventory = useMemo(
  () => buildDataCoverageInventory(masterTableRows),
  [masterTableRows],
 )
 const canonicalCount = inventory.rows.length
 const fullCatalogCount = inventory.expandedRows.length
 const baseRows = showFullCatalog ? inventory.expandedRows : inventory.rows

 const filteredRows = useMemo(() => {
  let result = baseRows

  if (searchTerm.trim()) {
   const lower = searchTerm.toLowerCase()
   result = result.filter(
    (row) =>
     row.categoryName.toLowerCase().includes(lower) ||
     row.canonicalKey.toLowerCase().includes(lower) ||
     row.scope.toLowerCase().includes(lower) ||
     sourceLabel(row).toLowerCase().includes(lower) ||
     row.reason.toLowerCase().includes(lower),
   )
  }

  return [...result].sort((a, b) => {
   let valA = String(a[sortColumn] || "")
   let valB = String(b[sortColumn] || "")

   if (sortColumn === "source") {
    valA = sourceLabel(a)
    valB = sourceLabel(b)
   } else if (sortColumn === "scope") {
    valA = scopeLabel(a)
    valB = scopeLabel(b)
   }

   // Optional: basic numeric sorting for example columns
   if (sortColumn === "example" || sortColumn === "exampleChannel") {
    const numA = Number(valA.replace(/[^0-9.-]/g, ""))
    const numB = Number(valB.replace(/[^0-9.-]/g, ""))
    if (!isNaN(numA) && !isNaN(numB) && valA !== "-" && valB !== "-") {
     return sortDirection === "asc" ? numA - numB : numB - numA
    }
   }

   const compare = valA.localeCompare(valB, undefined, { sensitivity: "base" })
   return sortDirection === "asc" ? compare : -compare
  })
 }, [baseRows, searchTerm, sortColumn, sortDirection])

 const handleSort = (column: keyof DataCoverageRow) => {
  if (sortColumn === column) {
   setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  } else {
   setSortColumn(column)
   setSortDirection("asc")
  }
 }

 const renderSortIcon = (column: keyof DataCoverageRow) => {
  if (sortColumn !== column) return null
  return sortDirection === "asc" ? " ↑" : " ↓"
 }


 const shortVideoRaw = useMemo(() => {
  return (
   masterTableRows.find((r) =>
    String(
     r.Format || r.format || r.type || r.contentType || "",
    ).toLowerCase().includes("short"),
   ) || null
  )
 }, [masterTableRows])

 const longVideoRaw = useMemo(() => {
  return (
   masterTableRows.find((r) => {
    const f = String(
     r.Format || r.format || r.type || r.contentType || "",
    ).toLowerCase()
    return f.includes("long") || f === "video" || f === "video_on_demand"
   }) || null
  )
 }, [masterTableRows])

 const channelRaw = useMemo(() => {
  return (
   masterTableRows.find(
    (r) =>
     (r.subscribersGained !== undefined &&
      r.views !== undefined &&
      !r.video &&
      !r.Format) ||
     r["snippet.title"],
   ) || null
  )
 }, [masterTableRows])

 const geoRaw = useMemo(() => {
  return (
   masterTableRows.find(
    (r) => r.country || r.city || r.continent || r.province,
   ) || null
  )
 }, [masterTableRows])

 const audienceRaw = useMemo(() => {
  return (
   masterTableRows.find(
    (r) => r.ageGroup || r.gender || r.audienceType || r.subscribedStatus,
   ) || null
  )
 }, [masterTableRows])

 const trafficRaw = useMemo(() => {
  return (
   masterTableRows.find(
    (r) => r.trafficSourceType || r.insightTrafficSourceType || r.sharingService,
   ) || null
  )
 }, [masterTableRows])

 return (
  <SubToolbox
   title="Data Coverage Reference"
   icon={<Database size={24} />}
   collapsible
   isOpen
  >
   <div className="pt-2">
     <div className="flex items-center gap-4 mb-8">
      <div className="h-[4px] flex-1 bg-black border-y border-black" />
      <h2 className="text-2xl font-black uppercase tracking-tighter">
       Live Payload Tables
      </h2>
      <div className="h-[4px] flex-1 bg-black border-y border-black" />
     </div>

     <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      <InspectorTable
       title="Channel Overview"
       dataObj={channelRaw}
       colorHex="bg-[#111827] !text-white"
       icon={<Database size={20} />}
      />

      <InspectorTable
       title="Long-Format Video"
       dataObj={longVideoRaw}
       colorHex="bg-[#00CCFF]"
       icon={<Database size={20} />}
      />

      <InspectorTable
       title="Shorts Video"
       dataObj={shortVideoRaw}
       colorHex="bg-[#FF7497]"
       icon={<Database size={20} />}
      />

      <InspectorTable
       title="Traffic & Discovery"
       dataObj={trafficRaw}
       colorHex="bg-[#FFB158]"
       icon={<Database size={20} />}
      />

      <InspectorTable
       title="Audience & Demographics"
       dataObj={audienceRaw}
       colorHex="bg-[#B14AED] !text-white"
       icon={<Database size={20} />}
      />

      <InspectorTable
       title="Geography & Reach"
       dataObj={geoRaw}
       colorHex="bg-[#FFDD00]"
       icon={<Database size={20} />}
      />
     </div>
    
    <div className="mt-8 border-t-[4px] border-black border-dashed pt-6">
     <h3 className="text-xl font-black uppercase mb-1">Literal Payload Inspectors</h3>
     <p className="text-xs font-bold text-black/50 mb-6">
      Raw individual API entries taken straight from the sink right now to prove standard object shapes.
     </p>

     <RawExampleTable 
      title="Shorts Video Example" 
      colorHex="bg-[#FF7497]" 
      dataObj={masterTableRows.find(r => String(r.Format || r.format || r.type || r.contentType || "").toLowerCase().includes("short")) || null} 
     />

     <RawExampleTable 
      title="Long Format Video Example" 
      colorHex="bg-[#00CCFF]" 
      dataObj={masterTableRows.find(r => {
       const f = String(r.Format || r.format || r.type || r.contentType || "").toLowerCase()
       return f.includes("long") || f === "video" || f === "video_on_demand"
      }) || null} 
     />

     <RawExampleTable 
      title="Channel Overview Example" 
      colorHex="bg-[#111827] !text-white" 
      dataObj={masterTableRows.find(r => (r.subscribersGained !== undefined && r.views !== undefined && !r.video && !r.Format) || (r["snippet.title"])) || null} 
     />

     <RawExampleTable 
      title="Traffic Source Example" 
      colorHex="bg-[#FFB158]" 
      dataObj={masterTableRows.find(r => r.trafficSourceType || r.insightTrafficSourceType || r.sharingService) || null} 
     />

     <RawExampleTable 
      title="Audience & Demographics Example" 
      colorHex="bg-[#B14AED] !text-white" 
      dataObj={masterTableRows.find(r => r.ageGroup || r.gender || r.audienceType || r.subscribedStatus) || null} 
     />

     <RawExampleTable 
      title="Geography Example" 
      colorHex="bg-[#FFDD00]" 
      dataObj={masterTableRows.find(r => r.country || r.city || r.continent || r.province) || null} 
     />
    </div>
   </div>
  </SubToolbox>
 )
}
