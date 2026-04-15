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
 row.source === "formula" ? `formula + ${row.scope.replace("_", " ")}` : row.scope.replace("_", " ")

const STATUS_STYLES: Record<DataCoverageStatus, string> = {
 received: "bg-[#CCFF00] text-black",
 missing: "bg-[#FF7497] text-black",
 not_applicable: "bg-[#E5E7EB] text-black",
 not_connected: "bg-black text-white",
}

export function SystemStatisticsSubToolbox({ masterTableRows }: SystemStatisticsSubToolboxProps) {
 const [searchTerm, setSearchTerm] = useState("")
 const [showFullCatalog, setShowFullCatalog] = useState(true)
 const [showReceivedOnly, setShowReceivedOnly] = useState(false)
 const [showFormulaOnly, setShowFormulaOnly] = useState(false)

 const inventory = useMemo(() => buildDataCoverageInventory(masterTableRows), [masterTableRows])
 const canonicalCount = inventory.rows.length
 const fullCatalogCount = inventory.expandedRows.length
 const baseRows = showFullCatalog ? inventory.expandedRows : inventory.rows

 const filteredRows = useMemo(() => {
  const rowsForMode = showReceivedOnly
   ? baseRows.filter((row) => row.status === "received")
   : baseRows
  const rowsForFormula = showFormulaOnly
   ? rowsForMode.filter((row) => row.formulaCapable)
   : rowsForMode
  if (!searchTerm.trim()) return rowsForFormula
  const lower = searchTerm.toLowerCase()
  return rowsForFormula.filter(
   (row) =>
    row.categoryName.toLowerCase().includes(lower) ||
    row.canonicalKey.toLowerCase().includes(lower) ||
    row.scope.toLowerCase().includes(lower) ||
    sourceLabel(row).toLowerCase().includes(lower) ||
    row.reason.toLowerCase().includes(lower),
  )
 }, [baseRows, searchTerm, showReceivedOnly, showFormulaOnly])

 const statusCounts = useMemo(() => {
  return filteredRows.reduce(
   (acc, row) => {
    acc[row.status] += 1
    return acc
   },
   {
    received: 0,
    missing: 0,
    not_applicable: 0,
    not_connected: 0,
   } as Record<DataCoverageStatus, number>,
  )
 }, [filteredRows])

 return (
  <SubToolbox
   title="Data Coverage Reference"
   icon={<Database size={24} />}
   collapsible
   isOpenInitial>
   <div className="bg-[#EDEDED] border-[4px] border-black p-4 space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
     <div className="bg-white border-[3px] border-black rounded-lg p-3">
      <div className="text-[10px] font-black uppercase text-black/50">Total Categories</div>
      <div className="text-xl font-black">{baseRows.length}</div>
      <div className="text-[9px] font-black uppercase text-black/45 mt-1">
       Canonical {canonicalCount} · Full {fullCatalogCount}
      </div>
     </div>
     <div className="bg-white border-[3px] border-black rounded-lg p-3">
      <div className="text-[10px] font-black uppercase text-black/50">History Placeholders</div>
      <div className="text-xl font-black">
       {baseRows.filter((row) => row.scope === "history").length}
      </div>
     </div>
     <div className="bg-white border-[3px] border-black rounded-lg p-3">
      <div className="text-[10px] font-black uppercase text-black/50">Showing</div>
      <div className="text-xl font-black">{filteredRows.length}</div>
     </div>
    </div>

    <div className="flex flex-wrap gap-2">
     {(Object.keys(statusCounts) as DataCoverageStatus[]).map((status) => (
      <span
       key={status}
       className={`px-2 py-1 rounded-md border border-black text-[10px] font-black uppercase ${STATUS_STYLES[status]}`}>
       {status.replace(/_/g, " ")}: {statusCounts[status]}
      </span>
     ))}
    </div>

    <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
     <div className="flex items-center gap-2 flex-wrap">
      <button
       type="button"
       onClick={() => setShowFullCatalog((value) => !value)}
       className={`px-3 py-2 rounded-md border border-black text-[10px] font-black uppercase ${
        showFullCatalog ? "bg-black text-white" : "bg-white text-black"
       }`}>
       {showFullCatalog ? "Mode: Full Catalog" : "Mode: Canonical"}
      </button>
      <button
       type="button"
       onClick={() => setShowReceivedOnly((value) => !value)}
       className={`px-3 py-2 rounded-md border border-black text-[10px] font-black uppercase ${
        showReceivedOnly ? "bg-[#CCFF00] text-black" : "bg-white text-black"
       }`}>
       {showReceivedOnly ? "Received Only: On" : "Received Only: Off"}
      </button>
      <button
       type="button"
       onClick={() => setShowFormulaOnly((value) => !value)}
       className={`px-3 py-2 rounded-md border border-black text-[10px] font-black uppercase ${
        showFormulaOnly ? "bg-[#B14AED] text-white" : "bg-white text-black"
       }`}>
       {showFormulaOnly ? "Formula-capable: On" : "Formula-capable: Off"}
      </button>
     </div>

     <div className="relative w-full md:w-[440px]">
      <input
       type="text"
       value={searchTerm}
       onChange={(e) => setSearchTerm(e.target.value)}
       placeholder="Search category, canonical key, scope, or source..."
       className="w-full h-12 pl-12 pr-4 border-[3px] border-black rounded-lg text-sm font-black tracking-wide outline-none focus:bg-[#CCFF00] transition-colors"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" size={20} />
     </div>

     <div className="flex flex-wrap gap-2 justify-end">
      {(Object.keys(inventory.summary.perScope) as DataCoverageScope[]).map((scope) => (
       <span
        key={scope}
        className={`px-2 py-1 rounded-md border border-black text-[10px] font-black uppercase ${SCOPE_STYLES[scope]}`}>
        {scope.replace("_", " ")}: {inventory.summary.perScope[scope]}
       </span>
      ))}
     </div>
    </div>

    <div className="bg-white border-[3px] border-black rounded-lg overflow-auto max-h-[560px]">
     <table className="w-full border-collapse whitespace-nowrap">
      <thead className="sticky top-0 bg-[#CCFF00] border-b-[3px] border-black z-10">
       <tr>
        <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black/20 text-left">Category</th>
        <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black/20 text-left">Canonical Key</th>
        <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black/20 text-left">Source</th>
        <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black/20 text-left">Scope</th>
        <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black/20 text-left">Status</th>
        <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black/20 text-left">Example</th>
        <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black/20 text-left bg-[#FFDD00]/20">Example Channel</th>
        <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black/20 text-left bg-[#00CCFF]/20">Reason</th>
       </tr>
      </thead>
      <tbody>
       {filteredRows.length === 0 ? (
        <tr>
         <td colSpan={8} className="p-8 text-center text-xs font-black uppercase tracking-widest text-black/40">
          No categories found matching "{searchTerm}"
         </td>
        </tr>
       ) : (
        filteredRows.map((row, idx) => (
         <tr
          key={`${row.source}-${row.scope}-${row.canonicalKey}-${idx}`}
          className="odd:bg-white even:bg-gray-50 border-b border-black/10 hover:bg-[#CCFF00]/10 transition-colors">
          <td className="p-3 border-r border-black/10 text-xs font-black">{row.categoryName}</td>
          <td className="p-3 border-r border-black/10 text-xs font-bold font-mono text-black/60">
           {row.canonicalKey}
          </td>
          <td className="p-3 border-r border-black/10 text-[10px] font-black uppercase text-black/70">
           {sourceLabel(row)}
          </td>
          <td className="p-3 border-r border-black/10">
           <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-black uppercase border border-black ${SCOPE_STYLES[row.scope]}`}>
            {scopeLabel(row)}
           </span>
          </td>
          <td className="p-3 border-r border-black/10">
           <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-black uppercase border border-black ${STATUS_STYLES[row.status]}`}>
            {row.status.replace(/_/g, " ")}
           </span>
          </td>
          <td className="p-3 border-r border-black/10 text-xs font-black">
           {row.example}
          </td>
          <td className="p-3 border-r border-black/10 text-xs font-black">
           {row.exampleChannel}
          </td>
          <td className="p-3 border-r border-black/10 text-xs font-black text-black/70">
           {row.reason}
          </td>
         </tr>
        ))
       )}
      </tbody>
     </table>
    </div>
   </div>
  </SubToolbox>
 )
}
