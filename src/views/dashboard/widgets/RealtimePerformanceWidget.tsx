import React, { useMemo, useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { Activity } from "lucide-react"

export const RealtimePerformanceWidget = ({
  widget,
  instance,
  editMode,
  onToggleCollapse,
  onCycleSize,
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

  return (
    <WidgetShell {...common} icon={<Activity size={22} />}>
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
            color: "#40C6E9",
            padding: "10px 12px 0 12px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#40C6E9",
              animation: "pulse 2s infinite",
            }}
          />
          <span>Updating live</span>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              background: "#eee",
              borderRadius: "8px",
              border: "2px solid #000",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setViewMode("48h")}
              style={{
                padding: "2px 8px",
                fontSize: "8px",
                fontWeight: 1000,
                background: viewMode === "48h" ? "#000" : "transparent",
                color: viewMode === "48h" ? "#fff" : "#000",
                border: "none",
                cursor: "pointer",
              }}
            >
              48H
            </button>
            <button
              onClick={() => setViewMode("60m")}
              style={{
                padding: "2px 8px",
                fontSize: "8px",
                fontWeight: 1000,
                background: viewMode === "60m" ? "#000" : "transparent",
                color: viewMode === "60m" ? "#fff" : "#000",
                border: "none",
                cursor: "pointer",
              }}
            >
              60M
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
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
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "rgba(0,0,0,0.6)",
                    }}
                  >
                    {activeLabel}
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: 900 }}>
                    {activeTotal.toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "6px",
                    margin: "12px 0 -12px 0",
                    height: "80px",
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
                        background: "#40C6E9",
                        opacity: 0.3 + (d.val / activeMax) * 0.7,
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

                {hoveredBar && (
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      background: "white",
                      border: "3px solid black",
                      padding: "10px",
                      boxShadow: "4px 4px 0px 0px black",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      zIndex: 50,
                      pointerEvents: "none",
                      minWidth: "130px",
                      textAlign: "left"
                    }}
                  >
                    <p style={{ marginBottom: "4px", fontSize: "12px", fontWeight: 900, borderBottom: "1px solid black", paddingBottom: "4px", textTransform: "uppercase" }}>{hoveredBar.label}</p>
                    <p style={{ fontSize: "11px", color: "black", margin: 0 }}>
                      <span style={{ textTransform: "uppercase" }}>VIEWS:</span> {hoveredBar.val.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      </div>
    </WidgetShell>
  )
}
