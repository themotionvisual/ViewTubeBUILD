import React, { useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { DollarSign, BarChart2 } from "lucide-react"

export const RevenueChartWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove, data }: any) => {
 const common = {
  widget,
  instance,
  editMode,
  canEdit: true,
  onToggleCollapse,
  onCycleSize,
  onRemove,
  onDecSize,
  onCycleHeight,
  onDecHeight,
 }
 const weeks = data.revenueByWeek || []
 const [revenueType, setRevenueType] = useState<"ad" | "gross">("ad")
 const [tooltip, setTooltip] = useState<{
  x: number
  y: number
  text: string
 } | null>(null)

 // Fallback data if API hasn't resolved revenue yet
 const displayWeeks =
  weeks.length > 0
   ? weeks
   : [
     { month: "Jan", week: "W1", revenue: 420, grossRevenue: 480 },
     { month: "Jan", week: "W2", revenue: 580, grossRevenue: 640 },
     { month: "Jan", week: "W3", revenue: 1100, grossRevenue: 1250 },
     { month: "Jan", week: "W4", revenue: 890, grossRevenue: 980 },
     { month: "Feb", week: "W1", revenue: 1050, grossRevenue: 1180 },
     { month: "Feb", week: "W2", revenue: 1300, grossRevenue: 1440 },
     { month: "Feb", week: "W3", revenue: 1550, grossRevenue: 1720 },
     { month: "Feb", week: "W4", revenue: 1200, grossRevenue: 1350 },
    ]

 const getRevValue = (w: any) =>
  revenueType === "gross" ? (w.grossRevenue || w.revenue) : w.revenue

 const maxAbsoluteRev = Math.max(
  ...displayWeeks.map((w: any) => getRevValue(w)),
  1,
 )

 const totalRev = displayWeeks.reduce(
  (sum: number, w: any) => sum + getRevValue(w),
  0,
 )

 // Colors for performance tiers
 const getBarColor = (val: number, max: number) => {
  const ratio = val / max
  if (ratio > 0.8) return "#00D2FF"
  if (ratio > 0.5) return "#7B2CBF"
  if (ratio > 0.2) return "#9D4EDD"
  return "#C77DFF"
 }

 // Group by month to render labels below bars
 const months: { name: string; count: number }[] = []
 displayWeeks.forEach((w: any) => {
  if (months.length === 0 || months[months.length - 1].name !== w.month) {
   months.push({name: w.month, count: 1, onDecSize, onCycleHeight, onDecHeight})
  } else {
   months[months.length - 1].count += 1
  }
 })

 return (
  <WidgetShell {...common} icon={<DollarSign size={22} />}>
   <div
    style={{
     display: "flex",
     flexDirection: "column",
     height: "100%",
     gap: "10px",
    }}>
    {/* Header Title */}
    <div
     style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
     }}>
     <div>
      <div
       style={{
        fontSize: "24px",
        fontWeight: 1000,
        letterSpacing: "-0.04em",
        lineHeight: 1,
       }}>
       $
       {totalRev.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
       })}
      </div>
      <div
       style={{
        fontSize: "9px",
        fontWeight: 900,
        textTransform: "uppercase",
        opacity: 0.5,
        letterSpacing: "0.05em",
       }}>
       Estimated {revenueType === "gross" ? "Gross" : "Ad"} Revenue
      </div>
     </div>
     {/* Toggle */}
     <div
      style={{
       display: "flex",
       border: "2px solid #000",
       borderRadius: "8px",
       overflow: "hidden",
      }}>
      <button
       onClick={() => setRevenueType("ad")}
       style={{
        padding: "4px 8px",
        fontSize: "8px",
        fontWeight: 1000,
        border: "none",
        cursor: "pointer",
        background: revenueType === "ad" ? "#000" : "#fff",
        color: revenueType === "ad" ? "#C9F830" : "#000",
        textTransform: "uppercase",
       }}>
       Ad
      </button>
      <button
       onClick={() => setRevenueType("gross")}
       style={{
        padding: "4px 8px",
        fontSize: "8px",
        fontWeight: 1000,
        border: "none",
        borderLeft: "2px solid #000",
        cursor: "pointer",
        background: revenueType === "gross" ? "#000" : "#fff",
        color: revenueType === "gross" ? "#FFE357" : "#000",
        textTransform: "uppercase",
       }}>
       Gross
      </button>
     </div>
    </div>

    {/* Chart Area */}
    <div
     style={{
      flex: 1,
      border: "2px solid #000",
      borderRadius: "12px",
      background: "#f5f5f5",
      display: "flex",
      flexDirection: "column",
      padding: "12px 12px 4px 12px",
      position: "relative",
     }}>
     {/* Tooltip */}
     {tooltip && (
      <div
       style={{
        position: "absolute",
        left: tooltip.x,
        top: tooltip.y - 40,
        background: "#000",
        color: "#fff",
        padding: "4px 8px",
        borderRadius: "6px",
        fontSize: "9px",
        fontWeight: 900,
        whiteSpace: "nowrap",
        zIndex: 50,
        pointerEvents: "none",
        transform: "translateX(-50%)",
       }}>
       {tooltip.text}
      </div>
     )}

     {/* Y-Axis Grid Lines */}
     <div
      style={{
       position: "absolute",
       top: 12,
       left: 12,
       right: 12,
       bottom: 24,
       display: "flex",
       flexDirection: "column",
       justifyContent: "space-between",
       pointerEvents: "none",
       zIndex: 0,
      }}>
      {[1, 0.75, 0.5, 0.25, 0].map((tick, i) => (
       <div
        key={i}
        style={{
         width: "100%",
         borderTop: "1px dashed rgba(0,0,0,0.1)",
         position: "relative",
        }}>
        <span
         style={{
          position: "absolute",
          top: "-6px",
          left: "-2px",
          fontSize: "7px",
          fontWeight: 900,
          opacity: 0.3,
         }}>
         ${Math.round(maxAbsoluteRev * tick).toLocaleString()}
        </span>
       </div>
      ))}
     </div>

     <div
      style={{
       flex: 1,
       display: "flex",
       alignItems: "flex-end",
       gap: "4px",
       zIndex: 1,
       width: "100%",
       paddingLeft: "20px",
       height: "100%",
      }}>
      {displayWeeks.map((week: any, i: number) => {
       const rev = getRevValue(week)
       const heightPct = (rev / maxAbsoluteRev) * 100
       const color = getBarColor(rev, maxAbsoluteRev)
       return (
        <div
         key={i}
         style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: "12px",
          height: "100%",
         }}>
         <div
          onMouseEnter={(e) => {
           const rect = e.currentTarget.getBoundingClientRect()
           const parent = e.currentTarget.closest("[style]")?.getBoundingClientRect()
           setTooltip({x: rect.left - (parent?.left || 0) + rect.width / 2, y: rect.top - (parent?.top || 0), text: `$${rev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, onDecSize, onCycleHeight, onDecHeight})} — ${week.month} ${week.week}`,
           })
          }}
          onMouseLeave={() => setTooltip(null)}
          style={{
           width: "100%",
           height: `${heightPct}%`,
           background: color,
           border: "3px solid #000",
           borderRadius: "4px 4px 0 0",
           transition: "height 0.3s ease-out",
           marginTop: "auto",
           cursor: "pointer",
          }}
         />
        </div>
       )
      })}
     </div>

     {/* X Axis Labels */}
     <div
      style={{
       display: "flex",
       borderTop: "2px solid #000",
       marginTop: "4px",
       paddingTop: "4px",
       paddingLeft: "20px",
      }}>
      {months.map((m, i) => (
       <div
        key={i}
        style={{
         flex: m.count,
         textAlign: "center",
         fontSize: "9px",
         fontWeight: 900,
         textTransform: "uppercase",
        }}>
        {m.name}
       </div>
      ))}
     </div>
    </div>
   </div>
  </WidgetShell>
 )
}
