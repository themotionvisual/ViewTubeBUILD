import React, { useMemo, useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { Activity, Plus } from "lucide-react"

export const RealtimePerformanceWidget = ({
  widget,
  instance,
  editMode,
  onToggleCollapse,
  onCycleSize,
  onDecSize,
  onCycleHeight,
  onDecHeight,
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
  onRemove,
  onDecSize,
  onCycleHeight,
  onDecHeight,
 }
  const [viewMode, setViewMode] = useState<"48h" | "60m">("48h")
  const [hoveredBar, setHoveredBar] = useState<any>(null)

  // Create segmented data: 12 bars total
  const hoursData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const base = Math.floor(Math.random() * 80) + 20
      const peak = i === 4 || i === 9 ? Math.floor(Math.random() * 120) : 0
        const now = new Date()
        const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())
        const segmentEnd = new Date(currentHour.getTime() - ((11 - i) * 4) * 3600000)
        const segmentStart = new Date(segmentEnd.getTime() - 4 * 3600000)
        const dayStr = segmentStart.toLocaleDateString([], { weekday: 'short' }).toUpperCase()
        const fmtH = (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
        return {
          val: base + peak,
          label: `${fmtH(segmentStart)} - ${fmtH(segmentEnd)} ${dayStr}`,
        }
    })
  }, [])

  const minsData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const base = Math.floor(Math.random() * 5)
        const now = new Date()
        const segmentEnd = new Date(now.getTime() - ((11 - i) * 5) * 60000)
        const segmentStart = new Date(segmentEnd.getTime() - 5 * 60000)
        const fmtM = (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
        return {
          val: base,
          label: `${fmtM(segmentStart)}-${fmtM(segmentEnd)}`,
        }
    })
  }, [])

  const total48 = hoursData.reduce((a, b) => a + b.val, 0)
  const total60 = minsData.reduce((a, b) => a + b.val, 0)

  const maxHour = Math.max(...hoursData.map((d) => d.val), 1)
  const maxMin = Math.max(...minsData.map((d) => d.val), 1)

  const headerContent = (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
      <button 
        onClick={() => {}} // Placeholder for Create action
        className="vt-header-action-btn"
        title="Create New Content"
      >
        <Plus size={14} strokeWidth={3} />
      </button>

      <div className="vt-tab-group" style={{ width: "100px", padding: "2px" }}>
        <button
          onClick={() => setViewMode("48h")}
          className={`vt-tab-btn ${viewMode === "48h" ? 'active' : ''}`}
          style={{ padding: "4px", fontSize: "8px" }}
        >
          48H
        </button>
        <button
          onClick={() => setViewMode("60m")}
          className={`vt-tab-btn ${viewMode === "60m" ? 'active' : ''}`}
          style={{ padding: "4px", fontSize: "8px" }}
        >
          60M
        </button>
      </div>
    </div>
  )

  return (
    <WidgetShell {...common} icon={<Activity size={22} />} headerContent={headerContent}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: "8px",
        }}
      >
        {/* Status Dot */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "10px",
            fontWeight: 700,
            color: "var(--widget-color, #40C6E9)",
            padding: "10px 12px 0 12px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--widget-color, #40C6E9)",
              animation: "pulse 2s infinite",
            }}
          />
          <span>Updating live</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {(() => {
            const activeData = viewMode === "48h" ? hoursData : minsData
            const activeMax = viewMode === "48h" ? maxHour : maxMin
            const activeTotal = viewMode === "48h" ? total48 : total60
            const activeLabel =
              viewMode === "48h" ? "Views • Last 48 hours" : "Views • Last 60 minutes"

            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "0 12px",
                    marginTop: "-2px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", maxWidth: "65%" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 900,
                        color: hoveredBar ? "#000" : "rgba(0,0,0,0.6)",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {hoveredBar ? hoveredBar.label : activeLabel}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1 }}>
                    <span style={{ fontSize: "12px", fontWeight: 1000, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.75 }}>
                      Views
                    </span>
                    <span style={{ fontSize: "19px", fontWeight: 1000 }}>
                      {(hoveredBar ? hoveredBar.val : activeTotal).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "6px",
                    margin: "6px 0 -10px 0",
                    height: "100%",
                    minHeight: "110px",
                  }}
                >
                  {activeData.map((d: any, i: number) => (
                    <div
                      key={i}
                      onMouseEnter={() => setHoveredBar(d)}
                      onMouseLeave={() => setHoveredBar(null)}
                      style={{
                        flex: 1,
                        height: `${(d.val / activeMax) * 100}%`,
                        background: i % 3 === 0 ? "var(--widget-color, #40C6E9)" : "color-mix(in srgb, var(--widget-color, #40C6E9) 55%, white)",
                        opacity: 0.5 + (d.val / activeMax) * 0.5,
                        minWidth: "0",
                        transition: "height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        cursor: "crosshair",
                        borderRadius: "4px 4px 0 0",
                        border: "2px solid #000",
                        borderBottom: "none",
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </WidgetShell>
  )
}
