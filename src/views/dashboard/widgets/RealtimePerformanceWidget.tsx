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

  // Create segmented data: 12 bars total
  const hoursData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const base = Math.floor(Math.random() * 80) + 20
      const peak = i === 4 || i === 9 ? Math.floor(Math.random() * 120) : 0
      return {
        val: base + peak,
        label: `${(11 - i) * 4}h - ${(11 - i + 1) * 4}h ago`,
      }
    })
  }, [])

  const minsData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const base = Math.floor(Math.random() * 5)
      return {
        val: base,
        label: `${(11 - i) * 5}m - ${(11 - i + 1) * 5}m ago`,
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
                    gap: "1.5px",
                    margin: "12px -12px -12px",
                    height: "80px",
                  }}
                >
                  {activeData.map((d: any, i: number) => (
                    <div
                      key={i}
                      title={`${d.label}: ${d.val} views`}
                      style={{
                        flex: 1,
                        height: `${(d.val / activeMax) * 100}%`,
                        background: i % 2 === 0 ? "#40C6E9" : "#24D3FF",
                        minWidth: "0",
                        transition: "height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        cursor: "help",
                        borderTop: "2px solid #000",
                        borderRight: i < activeData.length - 1 ? "1.5px solid rgba(0,0,0,0.15)" : "none",
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
