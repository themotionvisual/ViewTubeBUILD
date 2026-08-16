import React, { useState, useMemo } from "react"
import { WidgetShell } from "../WidgetShell"
import { Filter } from "lucide-react"
import { formatTrafficSourceNickname } from "../../../services/dataUtils"
import { getVtSyncSnapshot } from "../../../features/vt-sync-local"

type TrafficSourceSlice = { label: string; pct: number; color: string }

export const TrafficSourcesWidget = ({ widget, instance, editMode, data, onToggleCollapse, onCycleSize, onCycleHeight, onDecSize, onDecHeight, onRemove }: any) => {
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
  onDecHeight,
 }

 
  const COLORS = ["#C9F830", "#40C6E9", "#FF83EA", "#9D4EDD", "#FF1744"]

 const sources = useMemo<TrafficSourceSlice[]>(() => {
  const snapshot = getVtSyncSnapshot()
  const rawSources = snapshot.trafficSources?.length ? snapshot.trafficSources : data?.trafficSources || []
  if (rawSources.length === 0) {
   return [
    { label: "Browse features", pct: 45, color: "#C9F830" },
    { label: "YouTube search", pct: 25, color: "#40C6E9" },
    { label: "Suggested videos", pct: 15, color: "#FF83EA" },
    { label: "External", pct: 10, color: "#9D4EDD" },
    { label: "Other", pct: 5, color: "#FF1744" },
   ]
  }
  return rawSources.map((s: any, idx: number) => ({
   label: formatTrafficSourceNickname(s.label || s.trafficSource),
   pct: s.viewsPct ?? s.pct ?? Number(s.views) ?? 0,
   color: COLORS[idx % COLORS.length]
  }))
 }, [data?.trafficSources])

 const renderPieSlices = () => {
  let accumulatedPct = 0
  return sources.map((src, index) => {
   const startPct = accumulatedPct
   accumulatedPct += src.pct
   const x1 = Math.cos(2 * Math.PI * (startPct / 100))
   const y1 = Math.sin(2 * Math.PI * (startPct / 100))
   const x2 = Math.cos(2 * Math.PI * (accumulatedPct / 100))
   const y2 = Math.sin(2 * Math.PI * (accumulatedPct / 100))
   const largeArcFlag = src.pct > 50 ? 1 : 0

   return (
    <path
     key={`${src.label}-${index}`}
     d={`M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
     fill={src.color}
     stroke="none"
    />
   )
  })
 }

 return (
  <WidgetShell {...common} icon={<Filter size={22} />}>
   <div
    style={{
     display: "flex",
     flexDirection: "column",
     height: "100%",
     gap: "4px",
    }}>
    {/* Subtitle */}
    <div
     style={{
      fontSize: "9px",
      fontWeight: 900,
      textTransform: "uppercase",
      opacity: 0.4,
      textAlign: "right",
     }}>
     Last 28 Days
    </div>

    {/* Chart */}
    <div
     className="tip"
     style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
     }}>
     <svg
      viewBox="-1.1 -1.1 2.2 2.2"
      style={{ width: "95%", height: "95%", transform: "rotate(-90deg)" }}>
      {renderPieSlices()}
     </svg>
     <div className="bub" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px", zIndex: 110 }}>
       {sources.map((src, index) => (
         <div key={`${src.label}-${index}`} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
           <div style={{ width: "8px", height: "8px", background: src.color, border: "1px solid #000" }} />
           <span>{src.label}: {src.pct}%</span>
         </div>
       ))}
     </div>
    </div>

    {/* Legend */}
    <div
     style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
      justifyContent: "center",
      borderTop: "2px solid #000",
      paddingTop: "6px",
     }}>
     {sources.map((src, index) => (
      <div
       key={`${src.label}-${index}`}
       style={{
        display: "flex",
        alignItems: "center",
        gap: "3px",
       }}>
       <div
        style={{
         width: "8px",
         height: "8px",
         borderRadius: "2px",
         background: src.color,
         border: "1px solid #000",
         flexShrink: 0,
        }}
       />
       <span style={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase" }}>
        {src.label} {src.pct}%
       </span>
      </div>
     ))}
    </div>
   </div>
  </WidgetShell>
 )
}
