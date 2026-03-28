import React, { useMemo } from "react"
import {
 X,
 Globe,
 Lock,
 Search,
 Filter,
 Trash2,
 CheckCircle2,
} from "lucide-react"

interface UniversalDataTableProps {
 data: any[]
 filterScope: "global" | "local"
 setFilterScope: React.Dispatch<React.SetStateAction<"global" | "local">>
 localExcludedIds: Set<string>
 setLocalExcludedIds: React.Dispatch<React.SetStateAction<Set<string>>>
 onClose: () => void
}

export const UniversalDataTable: React.FC<UniversalDataTableProps> = ({
 data,
 filterScope,
 setFilterScope,
 localExcludedIds,
 setLocalExcludedIds,
 onClose,
}) => {
 const [searchTerm, setSearchTerm] = React.useState("")

 // Get global excluded from localStorage directly for sync
 const globalExcluded = useMemo(
  () =>
   new Set<string>(
    JSON.parse(localStorage.getItem("vt_global_excluded") || "[]"),
   ),
  [filterScope],
 )

 const activeExcluded =
  filterScope === "global" ? globalExcluded : localExcludedIds

 const toggleExclude = (id: string) => {
  if (filterScope === "global") {
   const current = new Set<string>(
    JSON.parse(localStorage.getItem("vt_global_excluded") || "[]"),
   )
   if (current.has(id)) current.delete(id)
   else current.add(id)
   localStorage.setItem(
    "vt_global_excluded",
    JSON.stringify(Array.from(current)),
   )
   window.dispatchEvent(new Event("globalDataFilterChanged"))
  } else {
   setLocalExcludedIds((prev) => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
   })
  }
 }

 const headers =
  data.length > 0 ? Object.keys(data[0]).filter((k) => !k.startsWith("_")) : []

 const filteredData = data.filter((row) => {
  if (!searchTerm) return true
  return Object.values(row).some((val) =>
   String(val).toLowerCase().includes(searchTerm.toLowerCase()),
  )
 })

 return (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
   <div className="bg-white border-[6px] border-black rounded-[48px] shadow-[24px_24px_0px_0px_black] w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
    {/* Header */}
    <div className="bg-[#ccff00] border-b-[6px] border-black p-8 flex justify-between items-center -m-1 mb-0 z-10">
     <div className="flex items-center gap-6">
      <div className="p-4 bg-white border-[4px] border-black rounded-3xl shadow-[6px_6px_0px_0px_black]">
       <Search size={32} className="text-black" />
      </div>
      <div>
       <h1 className="font-[1000] uppercase italic text-4xl tracking-tighter text-black">
        Matrix Overlay
       </h1>
       <p className="font-black uppercase text-xs opacity-50 tracking-widest">
        {data.length} Total Records Found
       </p>
      </div>
     </div>
     <button
      onClick={onClose}
      className="p-4 bg-white border-[4px] border-black rounded-2xl hover:bg-black hover:text-[#ccff00] transition-all active:scale-95 shadow-[8px_8px_0px_0px_black]">
      <X size={32} strokeWidth={4} />
     </button>
    </div>

    {/* Controls */}
    <div className="p-8 bg-gray-50 border-b-[4px] border-black flex flex-wrap gap-6 items-center">
     <div className="flex-1 min-w-[300px] relative">
      <Search
       className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
       size={20}
      />
      <input
       type="text"
       placeholder="FILTER MATRIX..."
       value={searchTerm}
       onChange={(e) => setSearchTerm(e.target.value)}
       className="w-full bg-white border-[4px] border-black p-4 pl-12 font-black uppercase text-lg rounded-2xl outline-none focus:bg-[#00ccff]/10 transition-colors"
      />
     </div>

     <div className="flex items-center bg-black p-1 rounded-2xl border-[4px] border-black shadow-[4px_4px_0px_0px_black]">
      <button
       onClick={() => setFilterScope("global")}
       className={`px-6 py-3 rounded-xl font-[1000] uppercase text-sm flex items-center gap-2 transition-all ${filterScope === "global" ? "bg-[#CCFF00] text-black" : "bg-transparent text-white hover:bg-white/10"}`}>
       <Globe size={18} /> Global
      </button>
      <button
       onClick={() => setFilterScope("local")}
       className={`px-6 py-3 rounded-xl font-[1000] uppercase text-sm flex items-center gap-2 transition-all ${filterScope === "local" ? "bg-[#00CCFF] text-black" : "bg-transparent text-white hover:bg-white/10"}`}>
       <Lock size={18} /> Local
      </button>
     </div>
    </div>

    {/* Table Body */}
    <div className="flex-1 overflow-auto custom-scrollbar p-8">
     <table className="w-full border-separate border-spacing-y-3">
      <thead className="sticky top-0 bg-white z-10">
       <tr>
        <th className="p-4 text-left font-[1000] uppercase text-xs tracking-widest opacity-40">
         Status
        </th>
        {headers.map((h) => (
         <th
          key={h}
          className="p-4 text-left font-[1000] uppercase text-xs tracking-widest opacity-40">
          {h}
         </th>
        ))}
       </tr>
      </thead>
      <tbody>
       {filteredData.map((row) => {
        const id = row._id || String(row[headers[0]] || "")
        const isExcluded = activeExcluded.has(id)
        return (
         <tr
          key={id}
          className={`group transition-all ${isExcluded ? "opacity-30" : "hover:translate-x-2"}`}>
          <td className="p-0 pr-4">
           <button
            onClick={() => toggleExclude(id)}
            className={`w-full h-12 border-[4px] border-black rounded-xl flex items-center justify-center transition-all ${isExcluded ? "bg-gray-200" : "bg-[#CCFF00] shadow-[4px_4px_0px_0px_black]"}`}>
            {isExcluded ? <Trash2 size={20} /> : <CheckCircle2 size={20} />}
           </button>
          </td>
          {headers.map((h) => (
           <td
            key={h}
            className="bg-white border-y-[4px] border-black first:border-l-[4px] last:border-r-[4px] first:rounded-l-xl last:rounded-r-xl p-4 font-black uppercase text-sm">
            <div className="truncate max-w-[200px]">
             {String(row[h] || "-")}
            </div>
           </td>
          ))}
         </tr>
        )
       })}
      </tbody>
     </table>
    </div>
   </div>
  </div>
 )
}
