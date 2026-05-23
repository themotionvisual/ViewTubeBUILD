import React, { useMemo, useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { Grid } from "lucide-react"
import { metricCellValue } from "../../../services/analyticsSelectors"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const TIME_BLOCKS = [
 "0-3",
 "3-6",
 "6-9",
 "9-12",
 "12-15",
 "15-18",
 "18-21",
 "21-24",
]

export const PublishMomentumWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onCycleHeight, onDecSize, onDecHeight, onRemove, data }: any) => {
 const common = {
  widget,
  instance,
  editMode,
  canEdit: true,
  onToggleCollapse,
  onCycleSize,
  onCycleHeight,
  onRemove,
  onDecSize,
  onCycleHeight,
  onDecHeight,
 }

 const [tooltip, setTooltip] = useState<{
  x: number
  y: number
  day: string
  time: string
  views: number
 } | null>(null)

 // Create 7x8 matrix
 const matrix = useMemo(() => {
  const grid = Array(7)
   .fill(0)
   .map(() =>
    Array(8)
     .fill(0)
     .map(() => ({views: 0, count: 0, onDecSize, onCycleHeight, onDecHeight})),
   )

  const rows = data.canonicalRows || data.brain?.canonicalRows || []
  rows.forEach((row: any) => {
   const rawDate =
    row.uploadDate || row.publishedAt || row.Date || row["Video publish time"]
   const ts = new Date(rawDate).getTime()
   if (Number.isNaN(ts)) return

   const dt = new Date(ts)
   const day = dt.getDay()
   const hour = dt.getHours()
   const block = Math.floor(hour / 3)

   const views =
    metricCellValue(row.metrics?.views) ||
    Number(row.Views) ||
    Number(row.views) ||
    0

   grid[day][block].views += views
   grid[day][block].count += 1
  })

  return grid.map((dayRow) =>
   dayRow.map((cell) =>
    cell.count > 0 ? Math.round(cell.views / cell.count) : 0,
   ),
  )
 }, [data.brain?.canonicalRows])

 let maxAvg = 0
 matrix.forEach((r) =>
  r.forEach((v) => {
   if (v > maxAvg) maxAvg = v
  }),
 )
 if (maxAvg === 0) maxAvg = 1

 const getColor = (val: number) => {
  if (val === 0) return "#f5f5f5"
  const ratio = val / maxAvg
  // White-ish blue to Deep Blue
  const lightness = 95 - ratio * 75
  return `hsl(200, 95%, ${lightness}%)`
 }

 return (
  <WidgetShell {...common} icon={<Grid size={22} />}>
   <div
    style={{
     display: "flex",
     flexDirection: "column",
     height: "100%",
     gap: "8px",
     position: "relative",
    }}>
    <div
     style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
     }}>
     <span
      style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>
      Best Times to Upload
     </span>
     <span
      style={{
       fontSize: "8px",
       fontWeight: 900,
       textTransform: "uppercase",
       opacity: 0.4,
       lineHeight: "1.2",
       textAlign: "right",
      }}>
      White = Worst · Blue = Best
     </span>
    </div>

    {/* Custom Tooltip */}
    {tooltip && (
     <div
      style={{
       position: "absolute",
       left: Math.min(tooltip.x, 180),
       top: tooltip.y - 32,
       background: "#000",
       color: "#fff",
       padding: "4px 8px",
       borderRadius: "6px",
       fontSize: "9px",
       fontWeight: 900,
       whiteSpace: "nowrap",
       zIndex: 50,
       pointerEvents: "none",
      }}>
      {tooltip.day} {tooltip.time}h — {tooltip.views > 0 ? `${tooltip.views.toLocaleString()} avg views` : "No data"}
     </div>
    )}

    <div
     style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
     {TIME_BLOCKS.map((tb, hIdx) => (
      <div
       key={tb}
       style={{ display: "flex", flex: 1, gap: "4px", alignItems: "center" }}>
       <span
        style={{
         width: "32px",
         fontSize: "8px",
         fontWeight: 900,
         opacity: 0.4,
        }}>
        {tb}h
       </span>
       <div style={{ display: "flex", flex: 1, gap: "2px", height: "100%" }}>
        {DAYS.map((day, dIdx) => {
         const avg = matrix[dIdx][hIdx]
         return (
          <div
           key={day}
           style={{
            flex: 1,
            backgroundColor: getColor(avg),
            border:
             avg > 0
              ? "1px solid rgba(0,0,0,0.1)"
              : "1px dashed rgba(0,0,0,0.1)",
            borderRadius: "4px",
            cursor: "crosshair",
            transition: "transform 0.1s",
           }}
           onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)"
            const rect = e.currentTarget.getBoundingClientRect()
            const parent = e.currentTarget.closest("[style]")?.getBoundingClientRect()
            if (parent) {
             setTooltip({x: rect.left - parent.left + rect.width / 2, y: rect.top - parent.top, day, time: TIME_BLOCKS[hIdx], views: avg, onDecSize, onCycleHeight, onDecHeight})
            }
           }}
           onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)"
            setTooltip(null)
           }}
          />
         )
        })}
       </div>
      </div>
     ))}
     <div
      style={{
       display: "flex",
       paddingLeft: "36px",
       gap: "2px",
       marginTop: "2px",
      }}>
      {DAYS.map((day) => (
       <div
        key={day}
        style={{
         flex: 1,
         textAlign: "center",
         fontSize: "8px",
         fontWeight: 900,
         opacity: 0.4,
        }}>
        {day}
       </div>
      ))}
     </div>
    </div>
   </div>
  </WidgetShell>
 )
}
