import React, { useState } from "react"
import { WidgetShell } from "../WidgetShell"
import { Activity } from "lucide-react"
import { WidgetHeaderToggle } from "../WidgetPrimitives"

type RealtimeBar = { val: number; label: string }
type RealtimePerformanceWidgetProps = Pick<
  React.ComponentProps<typeof WidgetShell>,
  | "widget"
  | "instance"
  | "editMode"
  | "onToggleCollapse"
  | "onCycleSize"
  | "onDecSize"
  | "onCycleHeight"
  | "onDecHeight"
  | "onRemove"
> & { data?: unknown }

const HOURS_DATA: RealtimeBar[] = [44, 58, 35, 72, 118, 64, 81, 53, 76, 132, 91, 67].map((val, index) => ({
  val,
  label: `${48 - index * 4}–${44 - index * 4} hours ago`,
}))

const MINUTES_DATA: RealtimeBar[] = [1, 3, 2, 4, 1, 0, 2, 3, 1, 4, 2, 3].map((val, index) => ({
  val,
  label: `${60 - index * 5}–${55 - index * 5} minutes ago`,
}))

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
}: RealtimePerformanceWidgetProps) => {
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
  const [hoveredBar, setHoveredBar] = useState<RealtimeBar | null>(null)

  const hoursData = HOURS_DATA
  const minsData = MINUTES_DATA

  const total48 = hoursData.reduce((a, b) => a + b.val, 0)
  const total60 = minsData.reduce((a, b) => a + b.val, 0)

  const maxHour = Math.max(...hoursData.map((d) => d.val), 1)
  const maxMin = Math.max(...minsData.map((d) => d.val), 1)

  const headerContent = (
    <WidgetHeaderToggle
      label="Realtime view range"
      value={viewMode}
      onChange={setViewMode}
      items={[{ id: "48h", label: "48 hr" }, { id: "60m", label: "60 mn" }]}
    />
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
                        color: "var(--widget-border, #000)",
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
                    <span style={{ color: "var(--widget-border, #000)", fontSize: "12px", fontWeight: 1000, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.75 }}>
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
                  {activeData.map((d, i) => (
                    <div
                      key={i}
                      className="realtime-bar"
                      onMouseEnter={() => setHoveredBar(d)}
                      onMouseLeave={() => setHoveredBar(null)}
                      style={{
                        flex: 1,
                        height: `${(d.val / activeMax) * 100}%`,
                        minWidth: "0",
                        transition: "height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        cursor: "crosshair",
                        borderRadius: "4px 4px 0 0",
                        border: "2px solid var(--widget-border, #000)",
                        borderBottom: "none",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        className="realtime-bar-fill"
                        aria-hidden="true"
                        style={{
                          width: "100%",
                          height: "100%",
                          background: i % 3 === 0 ? "var(--widget-color, #40C6E9)" : "color-mix(in srgb, var(--widget-color, #40C6E9) 55%, white)",
                          opacity: 0.5 + (d.val / activeMax) * 0.5,
                        }}
                      />
                    </div>
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
