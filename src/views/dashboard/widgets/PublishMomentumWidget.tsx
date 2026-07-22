import React, { useMemo, useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { Grid } from "lucide-react"
import { metricCellValue } from "../../../services/analytics/Selectors"
import { useInitialChannelBootstrap } from "../../../context/InitialChannelBootstrapContext"
import { getVtSyncSnapshot } from "../../../features/vt-sync-local"

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

 const { snapshot: initialBootstrap } = useInitialChannelBootstrap()

 // Create 7x8 matrix
 const debugInfo = useMemo(() => {
  let validDates = 0
  let totalViews = 0
  const grid = Array(7).fill(0).map(() => Array(8).fill(0).map(() => ({ views: 0, count: 0 })))

  let sampleFields = ""
  let sampleStatus = ""

  const snapshot = getVtSyncSnapshot()
  const syncRows = snapshot?.videos || []

  // Use VT Sync rows if they have views, else try authoritative bootstrap, else canonical fallback
  const hasViewsInSync = syncRows.length > 0 && typeof syncRows[0]?.metrics?.views === "number"
  const rows = hasViewsInSync ? syncRows : (initialBootstrap?.videos || data.canonicalRows || data.brain?.canonicalRows || [])

  if (rows.length > 0) {
    const first = rows[0]
    sampleFields = Object.keys(first.originalData || first._originalData || {}).slice(0, 8).join(",")
    sampleStatus = typeof first.metrics?.views === "number" ? "vt-sync" : (first.metricsByWindow ? "bootstrap" : (first.metrics?.views?.status || "none"))
  }

  rows.forEach((row: any) => {
   const originalData = row.originalData || row._originalData || {}
   const rawDate = originalData["Video publish time"] || originalData["Upload time"] || row.uploadDate || row.publishedAt || row.Date || row["Video publish time"] || row["Upload date"]
   if (!rawDate) return

   const ts = new Date(rawDate).getTime()
   if (Number.isNaN(ts)) return
   validDates++

   const dt = new Date(ts)
   const day = dt.getDay()
   const hour = dt.getHours()
   const block = Math.floor(hour / 3)

   let views = 0
   if (row.metricsByWindow?.lifetime?.views !== undefined && row.metricsByWindow.lifetime.views !== null) {
    views = row.metricsByWindow.lifetime.views
   } else if (typeof row.metrics?.views === "number") {
    views = row.metrics.views
   } else if (typeof row.__metricCells?.views === "number") {
    views = row.__metricCells.views
   } else {
    views = metricCellValue(row.metrics?.views) || metricCellValue(row.__metricCells?.views) || Number(row.Views) || Number(row.views) || Number(originalData.Views) || Number(originalData.views) || 0
   }

   totalViews += views
   grid[day][block].views += views
   grid[day][block].count += 1
  })

  return {
   rows: rows.length,
   validDates,
   totalViews,
   sampleFields,
   sampleStatus,
   matrix: grid.map(dayRow => dayRow.map(cell => cell.count > 0 ? Math.round(cell.views / cell.count) : 0))
  }
 }, [data.canonicalRows, data.brain?.canonicalRows, initialBootstrap])

 const matrix = debugInfo.matrix
 let maxAvg = 0
 matrix.forEach((r) => r.forEach((v) => { if (v > maxAvg) maxAvg = v }))
 if (maxAvg === 0) maxAvg = 1

 const getColor = (val: number) => {
  if (val === 0) return "#f5f5f5"
  const ratio = val / maxAvg
  const lightness = 95 - ratio * 75
  return `hsl(200, 95%, ${lightness}%)`
 }

 return (
  <WidgetShell {...common} icon={<Grid size={22} />}>
   <div style={{ padding: "0 16px 16px 16px", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
     <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
      Best Times to Upload
     </div>
     <div style={{ fontSize: "9px", color: "red", fontWeight: "bold" }}>
      DEBUG: {debugInfo.totalViews}v | Stat: {debugInfo.sampleStatus} | Keys: {debugInfo.sampleFields}
     </div>
     <div style={{ fontSize: "9px", color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
      White = Worst - Blue = Best
     </div>
    </div>

    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", position: "relative" }}>
     {TIME_BLOCKS.map((tb, hIdx) => (
      <div key={tb} style={{ display: "flex", flex: 1, gap: "2px", alignItems: "center" }}>
       <div style={{ width: "32px", fontSize: "10px", color: "#888", fontWeight: "600", textAlign: "right", paddingRight: "8px" }}>
        {tb}h
       </div>
       <div style={{ display: "flex", flex: 1, gap: "2px", height: "100%" }}>
        {DAYS.map((day, dIdx) => {
         const avg = matrix[dIdx][hIdx]
         return (
          <div
           key={day}
           onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            if (avg > 0) {
             setTooltip({ x: rect.left + rect.width / 2, y: rect.top - 8, day, time: tb, views: avg })
            }
           }}
           onMouseLeave={() => setTooltip(null)}
           style={{
            flex: 1,
            backgroundColor: getColor(avg),
            borderRadius: "4px",
            border: avg > 0 ? "1px solid rgba(0,0,0,0.1)" : "1px dashed rgba(0,0,0,0.1)",
            cursor: avg > 0 ? "help" : "default",
            transition: "all 0.2s ease",
           }}
          />
         )
        })}
       </div>
      </div>
     ))}

     <div style={{ display: "flex", marginLeft: "40px", marginTop: "4px" }}>
      {DAYS.map((day) => (
       <div key={day} style={{ flex: 1, textAlign: "center", fontSize: "10px", color: "#888", fontWeight: "600" }}>
        {day}
       </div>
      ))}
     </div>

     {tooltip && (
      <div
       style={{
        position: "fixed",
        top: tooltip.y,
        left: tooltip.x,
        transform: "translate(-50%, -100%)",
        backgroundColor: "#222",
        color: "#fff",
        padding: "6px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "600",
        pointerEvents: "none",
        zIndex: 100,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        whiteSpace: "nowrap",
       }}
      >
       {tooltip.day} {tooltip.time}h:{" "}
       <span style={{ color: "#4fc3f7" }}>{tooltip.views.toLocaleString()}</span> avg views
      </div>
     )}
    </div>
   </div>
  </WidgetShell>
 )
}
