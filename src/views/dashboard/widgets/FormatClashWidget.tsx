import React, { useMemo } from "react"
import { WidgetShell } from "../WidgetShell"
import { PieChart } from "lucide-react"
import { metricCellValue } from "../../../services/analyticsSelectors"

export const FormatClashWidget = ({
 widget,
 instance,
 editMode,
 onToggleCollapse,
 onCycleSize,
 onCycleHeight,
 onRemove,
 data,
}: any) => {
 const common = {
  widget,
  instance,
  editMode,
  canEdit: true,
  onToggleCollapse,
  onCycleSize,
  onCycleHeight,
  onRemove,
 }

 const stats = useMemo(() => {
  const rows = data.canonicalRows || []
  const s = {
   shorts: { views: 0, watch: 0, subs: 0, rev: 0 },
   longs: { views: 0, watch: 0, subs: 0, rev: 0 },
  }

  rows.forEach((row: any) => {
   const isShort = row.format === "shorts"
   const target = isShort ? s.shorts : s.longs

   const v = row.metrics || {}
   target.views += metricCellValue(v.views) || 0
   target.watch += metricCellValue(v.watchHours) || 0
   target.subs += metricCellValue(v.subscribersGained) || 0
   target.rev += metricCellValue(v.revenue) || 0
  })

  return s
 }, [data.canonicalRows])

  const renderPie = (title: string, shortsVal: number, longsVal: number) => {
  const total = shortsVal + longsVal
  const pct = total > 0 ? (shortsVal / total) * 100 : 0

  return (
   <div
    style={{
     display: "flex",
     alignItems: "center",
     justifyContent: "center",
     position: "relative",
    }}>
    <div
     style={{
      width: "100%",
      aspectRatio: "1/1",
      borderRadius: "50%",
      background: `conic-gradient(#FF00FF 0% ${pct}%, #00D2FF ${pct}% 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "2px 2px 0 0 rgba(0,0,0,0.1)",
     }}>
     <div
      style={{
       pointerEvents: "none",
      }}>
      <span
       style={{
        color: "white",
        fontSize: "11px",
        fontWeight: "1000",
        textTransform: "uppercase",
        textAlign: "center",
        lineHeight: "1",
        textShadow: "1.5px 1.5px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
       }}>
       {title}
      </span>
     </div>
    </div>
   </div>
  )
 }

 return (
  <WidgetShell {...common} icon={<PieChart size={22} />}>
   <div
    style={{
     display: "flex",
     flexDirection: "column",
     height: "100%",
    }}>
    <div style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.4, textAlign: "right", padding: "4px 8px 0" }}>All Time</div>
    <div
     style={{
      flex: 1,
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gridTemplateRows: "repeat(2, 1fr)",
      gap: "12px",
      padding: "10px",
      width: "100%",
      height: "100%",
      margin: "0",
     }}>
     {renderPie("Views", stats.shorts.views, stats.longs.views)}
     {renderPie("Hours", stats.shorts.watch, stats.longs.watch)}
     {renderPie("Subs", stats.shorts.subs, stats.longs.subs)}
     {renderPie("Revenue", stats.shorts.rev, stats.longs.rev)}
    </div>

    <div
     style={{
      display: "flex",
      justifyContent: "center",
      gap: "12px",
      borderTop: "3px solid #000",
      padding: "6px 0",
      background: "#fff",
     }}>
     <span style={{ fontSize: "9px", fontWeight: 1000, color: "#FF00FF" }}>
      ■ SHORTS
     </span>
     <span style={{ fontSize: "9px", fontWeight: 1000, color: "#00D2FF" }}>
      ■ LONGS
     </span>
    </div>
   </div>
  </WidgetShell>
 )
}
