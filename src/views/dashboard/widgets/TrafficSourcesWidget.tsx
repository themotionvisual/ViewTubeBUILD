import React, { useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { Filter } from "lucide-react"

export const TrafficSourcesWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onCycleHeight, onDecSize, onDecHeight, onRemove }: any) => {
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
  label: string
  pct: number
 } | null>(null)

 const sources = [
  { label: "Browse features", pct: 45, color: "#C9F830" },
  { label: "YouTube search", pct: 25, color: "#40C6E9" },
  { label: "Suggested videos", pct: 15, color: "#FF83EA" },
  { label: "External", pct: 10, color: "#9D4EDD" },
  { label: "Other", pct: 5, color: "#FF1744" },
 ]

 const renderPieSlices = () => {
  let accumulatedPct = 0
  return sources.map((src) => {
   const startPct = accumulatedPct
   accumulatedPct += src.pct
   const x1 = Math.cos(2 * Math.PI * (startPct / 100))
   const y1 = Math.sin(2 * Math.PI * (startPct / 100))
   const x2 = Math.cos(2 * Math.PI * (accumulatedPct / 100))
   const y2 = Math.sin(2 * Math.PI * (accumulatedPct / 100))
   const largeArcFlag = src.pct > 50 ? 1 : 0

   return (
    <path
     key={src.label}
     d={`M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
     fill={src.color}
     stroke="none"
     style={{ cursor: "pointer", transition: "opacity 0.2s" }}
     onMouseEnter={(e) => {
      const rect = (e.target as SVGElement).closest("svg")?.getBoundingClientRect()
      if (rect) {
       setTooltip({x: e.clientX - rect.left, y: e.clientY - rect.top, label: src.label, pct: src.pct, onDecSize, onCycleHeight, onDecHeight})
      }
     }}
     onMouseMove={(e) => {
      const rect = (e.target as SVGElement).closest("svg")?.getBoundingClientRect()
      if (rect) {
       setTooltip({x: e.clientX - rect.left, y: e.clientY - rect.top, label: src.label, pct: src.pct, onDecSize, onCycleHeight, onDecHeight})
      }
     }}
     onMouseLeave={() => setTooltip(null)}
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
     {/* Custom Tooltip */}
     {tooltip && (
      <div
       style={{
        position: "absolute",
        left: tooltip.x,
        top: tooltip.y - 36,
        background: "#000",
        color: "#fff",
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "10px",
        fontWeight: 900,
        whiteSpace: "nowrap",
        zIndex: 50,
        pointerEvents: "none",
        transform: "translateX(-50%)",
       }}>
       {tooltip.label}: {tooltip.pct}%
      </div>
     )}
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
     {sources.map((src) => (
      <div
       key={src.label}
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
