import React, { useMemo } from "react"

import type { CanonicalMasterHeatmapRow } from "../../services/canonicalSync/presentation"
import { numberFromUnknown, textFromUnknown } from "../performanceHubUtils"

const EMPTY_CELL_LABEL = "N/A"
const VISIBLE_ROW_TARGET = 25
const ROW_HEIGHT_PX = 38
const HEADER_HEIGHT_PX = 144
const TITLE_HEADER_HEIGHT_PX = 118

const COLUMN_WIDTHS: Record<string, number> = {
 "Video ID": 126,
 "Upload date": 98,
 Format: 92,
 "Video category": 156,
 Length: 88,
 "Video title": 336,
 Views: 88,
 "Watch time (hours)": 96,
 "Average view duration": 96,
 "Average percentage viewed (%)": 92,
 "Subscribers gained": 92,
 "Estimated revenue (USD)": 92,
 "RPM (USD)": 88,
 "Engaged views": 96,
 Shares: 84,
 "Comments added": 84,
 "Videos added to playlists": 92,
 "Likes (vs. dislikes) (%)": 92,
 Dislikes: 84,
 "Subscribers net": 92,
 "Subscribers lost": 92,
}

const HEATMAP_ACCENTS: Record<string, [number, number, number]> = {
 Views: [0, 204, 255],
 "Watch time (hours)": [204, 255, 0],
 "Average view duration": [255, 227, 87],
 "Average percentage viewed (%)": [204, 255, 0],
 "Subscribers gained": [181, 232, 28],
 "Estimated revenue (USD)": [255, 177, 88],
 "RPM (USD)": [255, 177, 88],
 "Engaged views": [0, 204, 255],
 Shares: [177, 74, 237],
 "Comments added": [255, 116, 151],
 "Videos added to playlists": [177, 74, 237],
 "Likes (vs. dislikes) (%)": [204, 255, 0],
 Dislikes: [255, 116, 151],
 "Subscribers net": [181, 232, 28],
 "Subscribers lost": [255, 116, 151],
}

const formatDateAsNaturalMmDdYy = (value: unknown): string => {
 const date = new Date(String(value || ""))
 if (Number.isNaN(date.getTime())) return EMPTY_CELL_LABEL
 const month = date.getMonth() + 1
 const day = String(date.getDate()).padStart(2, "0")
 const year = String(date.getFullYear()).slice(-2)
 return `${month}/${day}/${year}`
}

const formatDurationSeconds = (value: unknown): string => {
 const length = numberFromUnknown(value)
 if (length <= 0) return EMPTY_CELL_LABEL
 const h = Math.floor(length / 3600)
 const m = Math.floor((length % 3600) / 60)
 const s = Math.round(length % 60)
 return h > 0
  ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  : `${m}:${String(s).padStart(2, "0")}`
}

const formatMetricCell = (header: string, value: unknown): string => {
 if (value === null || value === undefined || textFromUnknown(value).trim() === "") {
  return EMPTY_CELL_LABEL
 }
 const numeric = numberFromUnknown(value)
 switch (header) {
  case "Upload date":
   return formatDateAsNaturalMmDdYy(value)
  case "Length":
   return formatDurationSeconds(value)
  case "Views":
  case "Subscribers gained":
  case "Engaged views":
  case "Shares":
  case "Comments added":
  case "Videos added to playlists":
  case "Dislikes":
  case "Subscribers net":
  case "Subscribers lost":
   return numeric.toLocaleString()
  case "Watch time (hours)":
   return numeric.toLocaleString(undefined, { maximumFractionDigits: 2 })
  case "RPM (USD)":
  case "Estimated revenue (USD)":
   return `$${numeric.toFixed(2)}`
  case "Average percentage viewed (%)":
  case "Likes (vs. dislikes) (%)":
   return `${numeric.toFixed(2)}%`
  case "Average view duration":
   return formatDurationSeconds(numeric)
  default:
   return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString()
    : textFromUnknown(value) || EMPTY_CELL_LABEL
 }
}

export const computeCanonicalHeatmapRatio = (
 value: unknown,
 highest: number,
): number | null => {
 const numeric = numberFromUnknown(value)
 if (!Number.isFinite(numeric) || numeric <= 0 || !Number.isFinite(highest) || highest <= 0) {
  return null
 }
 return Math.max(0, Math.min(numeric / highest, 1))
}

export const buildCanonicalHeatmapTooltip = (
 displayValue: string,
 ratio: number | null,
 metricInsight?: string,
): string => {
 const lines = [displayValue]
 if (ratio !== null) {
  lines.push(`${(ratio * 100).toFixed(1)}% of highest`)
 }
 if (metricInsight) {
  lines.push("")
  lines.push(metricInsight)
 }
 return lines.join("\n")
}

type CanonicalMasterHeatmapTableProps = {
 rows: CanonicalMasterHeatmapRow[]
 headers: string[]
 kicker?: string
 title?: string
 subtitle?: string
 getMetricInsightTooltip?: (
  row: Record<string, unknown> | null,
  header: string,
 ) => string | undefined
}

const cellBorder = "1px solid rgba(0, 0, 0, 0.16)"

export const CanonicalMasterHeatmapTable: React.FC<
 CanonicalMasterHeatmapTableProps
> = ({
 rows,
 headers,
 kicker = "STANDALONE HEATMAP GRID",
 title = "Heatmap Intensity Grid",
 subtitle = "Full-cell intensity · vertical headers",
 getMetricInsightTooltip,
}) => {
 const titleIndex = headers.indexOf("Video title")
 const neutralHeaders = useMemo(
  () =>
   new Set(
    headers.filter((header, index) => index <= titleIndex || header === "Video title"),
   ),
  [headers, titleIndex],
 )

 const gridTemplateColumns = useMemo(
  () => headers.map((header) => `${COLUMN_WIDTHS[header] || 92}px`).join(" "),
  [headers],
 )

 const tableMinWidth = useMemo(
  () =>
   headers.reduce((total, header) => total + (COLUMN_WIDTHS[header] || 92), 0),
  [headers],
 )

 const maximaByHeader = useMemo(() => {
  const next: Record<string, number> = {}
  headers.forEach((header) => {
   if (neutralHeaders.has(header)) return
   next[header] = rows.reduce((highest, row) => {
    const value = numberFromUnknown(row[header])
    return Number.isFinite(value) && value > highest ? value : highest
   }, 0)
  })
  return next
 }, [headers, neutralHeaders, rows])

 const bodyHeight = `${VISIBLE_ROW_TARGET * ROW_HEIGHT_PX + HEADER_HEIGHT_PX}px`

 return (
  <div className="border-[4px] border-black bg-[#F4F2E9] overflow-hidden shadow-[8px_8px_0_#B14AED]">
   <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-3 border-b-[3px] border-black bg-[#F4F2E9]">
    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-black/25">
     Table E · 45° diagonal · full cell heatmap coloring
    </span>
    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-black/25">
     Each cell colored by value intensity · no separate chart needed
    </span>
   </div>

   <div className="px-3 pt-3 pb-4 bg-[#F4F2E9]">
    <div className="grid grid-cols-[56px_1fr] items-stretch border-[4px] border-black bg-[#0A0A0A]">
     <div className="border-r-[4px] border-black bg-[#FFE357] flex items-start justify-center pt-4">
      <div className="h-6 w-6 rounded-full border-[3px] border-black bg-[#FFE357] shadow-[inset_0_0_0_3px_#0A0A0A]" />
     </div>

     <div>
      <div className="bg-[#B14AED] px-4 py-4 border-b-[4px] border-black flex items-center justify-between gap-3">
       <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/72">
         {kicker}
        </p>
        <p className="text-[2rem] leading-none font-[1000] tracking-tight text-white">
         {title}
        </p>
       </div>
       <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/72 text-right">
        {subtitle}
       </p>
      </div>

      <div className="border-b-[4px] border-black bg-black px-4 py-2 flex items-center justify-between gap-3">
       <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FFE357]">
        Canonical rows sorted by views
       </span>
       <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
        {rows.length.toLocaleString()} videos · scroll body shows about 25
       </span>
      </div>

      <div className="bg-black px-3 pt-1 pb-2">
       <div className="overflow-auto rounded-b-sm" style={{ maxHeight: bodyHeight }}>
        <div style={{ minWidth: `${tableMinWidth}px` }}>
         <div
          className="sticky top-0 z-20 bg-black border-b-[4px] border-black"
          style={{ display: "grid", gridTemplateColumns }}>
          {headers.map((header) => {
           const isNeutral = neutralHeaders.has(header)
           return (
            <div
             key={header}
             title={getMetricInsightTooltip?.(null, header) || header}
             className="flex"
             style={{
              minHeight: isNeutral ? `${TITLE_HEADER_HEIGHT_PX}px` : `${HEADER_HEIGHT_PX}px`,
              borderRight: cellBorder,
              alignItems: "flex-end",
              justifyContent: isNeutral ? "flex-start" : "center",
              padding: isNeutral ? "0 12px 10px 12px" : "0 0 10px 0",
              background: "#000000",
             }}>
             {isNeutral ? (
              <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-[#FFE357] whitespace-nowrap">
               {header}
              </span>
             ) : (
              <span
               className="block text-[15px] font-[1000] uppercase tracking-[0.14em] text-white"
               style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(180deg)",
                lineHeight: 0.92,
               }}>
               {header}
              </span>
             )}
            </div>
           )
          })}
         </div>

         {rows.length === 0 ? (
          <div
           className="flex items-center justify-center text-center px-8"
           style={{
            minHeight: `${VISIBLE_ROW_TARGET * ROW_HEIGHT_PX}px`,
            background: "#F6F6EF",
            borderTop: cellBorder,
           }}>
           <div>
            <p className="text-sm font-[1000] uppercase tracking-[0.16em] text-black">
             No canonical video rows loaded yet
            </p>
            <p className="mt-2 text-[11px] font-black uppercase tracking-[0.16em] text-black/55">
             Run canonical sync or reconnect the baseline sync so this grid has rows to render.
            </p>
           </div>
          </div>
         ) : (
          rows.map((row) => (
           <div
            key={String(row._id || row["Video ID"] || row["Video title"])}
            style={{ display: "grid", gridTemplateColumns }}>
            {headers.map((header) => {
             const isNeutral = neutralHeaders.has(header)
             const displayValue = formatMetricCell(header, row[header])
             const ratio = isNeutral
              ? null
              : computeCanonicalHeatmapRatio(row[header], maximaByHeader[header] || 0)
             const accent = HEATMAP_ACCENTS[header] || [224, 224, 216]
             const background =
              ratio === null
               ? "#FFFFFF"
               : `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${0.10 + ratio * 0.78})`
             const insight = getMetricInsightTooltip?.(row, header)
             return (
              <div
               key={`${String(row._id)}-${header}`}
               title={buildCanonicalHeatmapTooltip(displayValue, ratio, insight)}
               className={`flex min-h-[38px] items-center text-[11px] font-black ${
                isNeutral ? "justify-start px-3 text-left" : "justify-center px-1 text-center font-mono cursor-help"
               }`}
               style={{
                background: isNeutral ? "#FFFFFF" : background,
                borderRight: cellBorder,
                borderBottom: cellBorder,
               }}>
               <span className={header === "Video title" ? "block truncate w-full" : "block"}>
                {displayValue}
               </span>
              </div>
             )
            })}
           </div>
          ))
         )}
        </div>
       </div>
      </div>

      <div className="border-t-[4px] border-black bg-[#B14AED] px-4 py-2 flex items-center justify-between gap-3">
       <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white">
        Hover any metric cell for full label
       </span>
       <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
        Color intensity = relative performance <span className="text-[#00CCFF]">per column</span>
       </span>
      </div>
     </div>
    </div>
   </div>
  </div>
 )
}

export default CanonicalMasterHeatmapTable
