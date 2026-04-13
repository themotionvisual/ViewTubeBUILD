import React, { useMemo, useState } from "react"
import { Database, Download, Info, ShieldCheck } from "lucide-react"
import { SubToolbox } from "../components/Toolbox"
import { buildMasterTableBundle } from "../services/masterTables"
import {
 getStoredIngestMode,
 setStoredIngestMode,
 type IngestMode,
 MASTER_TABLE_LABELS,
} from "../services/productArchitecture"
import { FORMULA_REGISTRY } from "../services/formulaRegistry"
import { SUBSCRIPTION_PLANS } from "../services/subscriptionPlans"
import {
 downloadExportBundle,
 type ExportManifest,
} from "../services/dataExport"
import { DEFAULT_NAMING_TABLE } from "../services/namingGovernance"

const ingestModes: IngestMode[] = ["connected", "import", "hybrid", "public_handle"]

const DataTransparencyCenter: React.FC = () => {
 const [ingestMode, setIngestModeState] = useState<IngestMode>(getStoredIngestMode())
 const [exportStatus, setExportStatus] = useState<string>("")

 const bundle = useMemo(() => buildMasterTableBundle("lifetime", ingestMode), [ingestMode])

 const tableSummary = useMemo(() => {
  return (Object.keys(bundle.tables) as Array<keyof typeof bundle.tables>).map((table) => ({
   table,
   label: MASTER_TABLE_LABELS[table],
   count: bundle.tables[table].length,
  }))
 }, [bundle])

 const totalRows = tableSummary.reduce((sum, entry) => sum + entry.count, 0)

 const handleModeChange = (mode: IngestMode) => {
  setStoredIngestMode(mode)
  setIngestModeState(mode)
 }

 const handleExport = async () => {
  setExportStatus("Building export bundle...")
  try {
   const manifest: ExportManifest = await downloadExportBundle(ingestMode, "lifetime")
   setExportStatus(
    `Export complete (${manifest.tables.length} tables, ${manifest.generatedAt}).`,
   )
  } catch (error) {
   const message = error instanceof Error ? error.message : String(error)
   setExportStatus(`Export failed: ${message}`)
  }
 }

 return (
  <div className="max-w-6xl mx-auto pb-24 px-4 space-y-8 animate-fade-in">
   <div className="flex flex-wrap items-end justify-between gap-4 border-b-[4px] border-black pb-4">
    <div>
     <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
      Data Transparency Center
     </h1>
     <p className="font-bold text-gray-700 mt-2">
      Source lineage, master tables, formula registry, and export controls.
     </p>
    </div>
    <div className="bg-[#CCFF00] border-[3px] border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_black]">
     <ShieldCheck size={28} />
    </div>
   </div>

   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <SubToolbox
     title="Coverage"
     icon={<Database size={18} strokeWidth={3} />}
     paletteIndex={0}
     contentClassName="p-4">
     <p className="font-black text-3xl">{totalRows}</p>
     <p className="font-bold text-sm text-gray-600">total canonical rows loaded</p>
    </SubToolbox>

    <SubToolbox
     title="Formula Registry"
     icon={<Info size={18} strokeWidth={3} />}
     paletteIndex={1}
     contentClassName="p-4">
     <p className="font-black text-3xl">{FORMULA_REGISTRY.length}</p>
     <p className="font-bold text-sm text-gray-600">deterministic formulas registered</p>
    </SubToolbox>

    <SubToolbox
     title="Plan Tiers"
     icon={<ShieldCheck size={18} strokeWidth={3} />}
     paletteIndex={2}
     contentClassName="p-4">
     <p className="font-black text-3xl">{SUBSCRIPTION_PLANS.length}</p>
     <p className="font-bold text-sm text-gray-600">subscription capability levels</p>
    </SubToolbox>
   </div>

   <SubToolbox
    title="Ingest Mode"
    icon={<Info size={18} strokeWidth={3} />}
    paletteIndex={3}
    contentClassName="p-6 space-y-4">
    <p className="font-bold text-gray-700">
     Choose which pipeline mode the architecture reads from.
    </p>
    <div className="flex flex-wrap gap-3">
     {ingestModes.map((mode) => (
      <button
       key={mode}
       onClick={() => handleModeChange(mode)}
       className={`px-4 py-2 border-[3px] border-black rounded-xl font-black uppercase text-xs tracking-wide ${
        ingestMode === mode
         ? "bg-[#FFFF61] shadow-[4px_4px_0px_0px_black]"
         : "bg-white"
       }`}>
       {mode}
      </button>
     ))}
    </div>
   </SubToolbox>

   <SubToolbox
    title="Master Tables"
    icon={<Database size={18} strokeWidth={3} />}
    paletteIndex={4}
    contentClassName="p-0 overflow-hidden">
    <div className="overflow-x-auto">
     <table className="w-full text-sm">
      <thead className="bg-[#CCFF00]">
       <tr>
        <th className="text-left p-3 font-black uppercase tracking-wide">Table</th>
        <th className="text-left p-3 font-black uppercase tracking-wide">Rows</th>
       </tr>
      </thead>
      <tbody>
       {tableSummary.map((entry) => (
        <tr key={entry.table} className="border-t border-black/20">
         <td className="p-3 font-bold">{entry.label}</td>
         <td className="p-3">{entry.count}</td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </SubToolbox>

   <SubToolbox
    title="Naming Governance"
    icon={<Info size={18} strokeWidth={3} />}
    paletteIndex={5}
    contentClassName="p-0 overflow-hidden">
    <div className="overflow-x-auto">
     <table className="w-full text-xs">
      <thead className="bg-[#40C6E9]">
       <tr>
        <th className="p-2 text-left font-black uppercase">Canonical</th>
        <th className="p-2 text-left font-black uppercase">Nickname</th>
        <th className="p-2 text-left font-black uppercase">Common</th>
        <th className="p-2 text-left font-black uppercase">Short</th>
       </tr>
      </thead>
      <tbody>
       {DEFAULT_NAMING_TABLE.map((entry) => (
        <tr key={entry.canonicalKey} className="border-t border-black/20">
         <td className="p-2 font-mono">{entry.canonicalKey}</td>
         <td className="p-2">{entry.nickname}</td>
         <td className="p-2">{entry.commonName}</td>
         <td className="p-2">{entry.shortName}</td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </SubToolbox>

   <SubToolbox
    title="Full Export"
    icon={<Download size={18} strokeWidth={3} />}
    paletteIndex={6}
    contentClassName="p-6 space-y-4">
    <p className="font-bold text-gray-700">
     Download raw cache snapshots, canonical master tables (CSV + JSON), manifest,
     and trust report in one zip.
    </p>
    <button
      onClick={handleExport}
      className="pop-button bg-[#FFB570] text-black px-6 py-3 text-sm flex items-center gap-2">
      <Download size={16} />
      Export Data Bundle
    </button>
    {exportStatus ? <p className="text-sm font-bold text-gray-700">{exportStatus}</p> : null}
   </SubToolbox>
  </div>
 )
}

export default DataTransparencyCenter
