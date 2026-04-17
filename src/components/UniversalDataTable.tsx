import React, { useMemo, useState, useCallback } from "react"
import { X, Globe, Lock, Search, Trash2, CheckCircle2 } from "lucide-react"

// Column aliases - map canonical names to their aliases
// This prevents duplicate columns from being displayed
const COLUMN_ALIASES: Record<string, string[]> = {
 "Subscribers Gained": ["Subscribers", "subscribersGained"],
 "Watch Time (Hours)": [
  "Watch time (hours)",
  "estimatedMinutesWatched",
  "Estimated minutes watched",
 ],
 "AVD (Sec)": ["Average view duration", "averageViewDuration"],
 "AVP (%)": ["Average percentage viewed (%)", "averageViewPercentage"],
 "CTR (%)": [
  "Impressions click-through rate (%)",
  "impressionClickThroughRate",
 ],
 Revenue: [
  "Estimated revenue",
  "Your estimated revenue (USD)",
  "estimatedRevenue",
 ],
 Impressions: ["impressions"],
 Likes: ["likeCount"],
 Comments: ["commentCount", "Comments added"],
 Shares: ["shareCount"],
 RPM: ["RPM (USD)", "Estimated RPM"],
 CPM: ["CPM (USD)"],
 "Unique viewers": ["Unique Viewers"],
 "New viewers": ["New Viewers"],
 "Returning viewers": ["Returning Viewers"],
 "Members gained": ["Members Gained"],
 "Members lost": ["Members Lost"],
 "Total members": ["Total members"],
 "Traffic Source": ["insightTrafficSourceType", "trafficSourceType"],
 "Age Group": ["ageGroup"],
 "Gender": ["gender"],
 "Viewer %": ["viewerPercentage"],
 "Country": ["country", "countryCode"],
}

// Reverse map: alias -> canonical name
const ALIAS_TO_CANONICAL: Record<string, string> = Object.entries(
 COLUMN_ALIASES,
).reduce(
 (acc, [canonical, aliases]) => {
  aliases.forEach((alias) => {
   acc[alias] = canonical
  })
  return acc
 },
 {} as Record<string, string>,
)

// Priority order for display (canonical names in preferred order)
const COLUMN_DISPLAY_ORDER = [
 "Dimension",
 "Video title",
 "Video",
 "Date",
 "Country",
 "Traffic Source",
 "Age Group",
 "Gender",
 "Content Type",
 "Type",
 "Views",
 "Viewer %",
 "Watch Time (Hours)",
 "AVD (Sec)",
 "AVP (%)",
 "CTR (%)",
 "Impressions",
 "Revenue",
 "RPM",
 "CPM",
 "Likes",
 "Comments",
 "Shares",
 "Engagement",
 "Subscribers Gained",
 "New viewers",
 "Returning viewers",
 "Unique viewers",
 "Hypes",
 "Hype points",
 "Members gained",
 "Members lost",
 "Total members",
 "Product clicks",
 "Orders",
]

export interface DataRecord {
 _id?: string
 _sourceFile?: string
 _userTag?: string
 [key: string]: unknown
}

interface UniversalDataTableProps {
 data: DataRecord[]
 filterScope: "global" | "local"
 setFilterScope: React.Dispatch<React.SetStateAction<"global" | "local">>
 localExcludedIds: Set<string>
 setLocalExcludedIds: React.Dispatch<React.SetStateAction<Set<string>>>
 onClose: () => void
}

// Helper: Get canonical header for a column (resolves aliases to canonical names)
const getCanonicalHeader = (key: string): string => {
 return ALIAS_TO_CANONICAL[key] || key
}

// Helper: Extract unique deduplicated headers from data
const getUniqueHeaders = (data: DataRecord[]): string[] => {
 if (data.length === 0) return []

 // Collect all raw keys (excluding internal _ prefixed)
 const rawKeys = new Set<string>()
 data.forEach((row) => {
  Object.keys(row).forEach((k) => {
   if (!k.startsWith("_")) rawKeys.add(k)
  })
 })

 // Map to canonical names and deduplicate
 const canonicalSet = new Set<string>()
 rawKeys.forEach((k) => {
  canonicalSet.add(getCanonicalHeader(k))
 })

 // Sort by display order, then alphabetically for unknowns
 return Array.from(canonicalSet).sort((a, b) => {
  const idxA = COLUMN_DISPLAY_ORDER.indexOf(a)
  const idxB = COLUMN_DISPLAY_ORDER.indexOf(b)
  if (idxA !== -1 && idxB !== -1) return idxA - idxB
  if (idxA !== -1) return -1
  if (idxB !== -1) return 1
  return a.localeCompare(b)
 })
}

// Helper: Get cell value, checking both canonical name and aliases
const getCellValue = (row: DataRecord, canonicalKey: string): unknown => {
 // Try canonical key first
 if (row[canonicalKey] !== undefined) return row[canonicalKey]
 // Try aliases
 const aliases = COLUMN_ALIASES[canonicalKey]
 if (aliases) {
  for (const alias of aliases) {
   if (row[alias] !== undefined) return row[alias]
  }
 }
 return undefined
}

export const UniversalDataTable: React.FC<UniversalDataTableProps> = ({
 data,
 filterScope,
 setFilterScope,
 localExcludedIds,
 setLocalExcludedIds,
 onClose,
}) => {
 const [searchTerm, setSearchTerm] = useState("")

 // Debug: Log data structure to understand what's being passed
 React.useEffect(() => {
  if (data.length > 0) {
   console.log("UniversalDataTable data sample:", {
    rowCount: data.length,
    headers: Object.keys(data[0]).filter((k) => !k.startsWith("_")),
    sampleRow: data[0],
    sharesValue: data[0].Shares,
    impressionsValue: data[0].Impressions,
    sharesKeys: Object.keys(data[0]).filter((k) =>
     k.toLowerCase().includes("share"),
    ),
    impressionsKeys: Object.keys(data[0]).filter((k) =>
     k.toLowerCase().includes("impression"),
    ),
    allKeys: Object.keys(data[0]),
    sharesType: typeof data[0].Shares,
    impressionsType: typeof data[0].Impressions,
    sharesRaw: data[0].Shares,
    impressionsRaw: data[0].Impressions,
   })
  }
 }, [data])

 // Get global excluded from localStorage - refresh on data change
 const globalExcluded = useMemo(() => {
  try {
   return new Set<string>(
    JSON.parse(localStorage.getItem("vt_global_excluded") || "[]"),
   )
  } catch {
   return new Set<string>()
  }
 }, [data.length]) // Refresh when data length changes

 const activeExcluded =
  filterScope === "global" ? globalExcluded : localExcludedIds

 const toggleExclude = useCallback(
  (id: string) => {
   if (filterScope === "global") {
    try {
     const current = new Set<string>(
      JSON.parse(localStorage.getItem("vt_global_excluded") || "[]"),
     )
     if (current.has(id)) {
      current.delete(id)
     } else {
      current.add(id)
     }
     localStorage.setItem(
      "vt_global_excluded",
      JSON.stringify(Array.from(current)),
     )
     window.dispatchEvent(new Event("globalDataFilterChanged"))
    } catch {
     // localStorage unavailable
    }
   } else {
    setLocalExcludedIds((prev) => {
     const next = new Set(prev)
     if (next.has(id)) {
      next.delete(id)
     } else {
      next.add(id)
     }
     return next
    })
   }
  },
  [filterScope, setLocalExcludedIds],
 )

 // Compute unique headers (deduplicated)
 const headers = useMemo(() => getUniqueHeaders(data), [data])

 // Memoize filtered data for performance
 const filteredData = useMemo(() => {
  if (!searchTerm) return data
  const term = searchTerm.toLowerCase()
  return data.filter((row) =>
   Object.entries(row)
    .filter(([k]) => !k.startsWith("_"))
    .some(([, val]) => String(val).toLowerCase().includes(term)),
  )
 }, [data, searchTerm])

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
          {headers.map((h) => {
           const cellValue = getCellValue(row, h)
           const displayValue =
            cellValue !== undefined
             ? typeof cellValue === "number"
               ? cellValue.toLocaleString()
               : String(cellValue)
             : "-"
           return (
            <td
             key={h}
             className="bg-white border-y-[4px] border-black first:border-l-[4px] last:border-r-[4px] first:rounded-l-xl last:rounded-r-xl p-4 font-black uppercase text-sm">
             <div className="truncate max-w-[200px]" title={displayValue}>
              {displayValue}
             </div>
            </td>
           )
          })}
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
