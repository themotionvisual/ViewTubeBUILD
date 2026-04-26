import React, { useMemo } from "react"
import { Globe } from "lucide-react"
import { WidgetShell } from "../WidgetShell"

export const AudienceMatrixWidget: React.FC<any> = ({
  widget,
  instance,
  editMode,
  canEdit,
  onToggleCollapse,
  onCycleSize,
  onCycleHeight,
  onRemove,
  data,
}) => {
  const common = { widget, instance, editMode, canEdit, onToggleCollapse, onCycleSize, onCycleHeight, onRemove }

  // Deterministic derivations for visual consistency
  const matrixData = useMemo(() => {
    let baseViews = 10000

    if (data && data.statBlocks) {
      const viewsBlock = data.statBlocks.find((b: any) => b.label.toLowerCase().includes("views"))
      if (viewsBlock) {
        const valStr = String(viewsBlock.value).replace(/,/g, "")
        if (valStr.includes("K")) baseViews = parseFloat(valStr) * 1000
        else if (valStr.includes("M")) baseViews = parseFloat(valStr) * 1000000
        else baseViews = parseFloat(valStr) || 10000
      }
    }

    return {
      geo: [
        { name: "US", value: baseViews * 0.42, color: "#4FFF5B" },
        { name: "UK", value: baseViews * 0.18, color: "#C9F830" },
        { name: "CA", value: baseViews * 0.12, color: "#24D3FF" },
        { name: "AU", value: baseViews * 0.08, color: "#FF83EA" },
        { name: "Other", value: baseViews * 0.20, color: "#eee" },
      ],
      devices: [
        { name: "Mobile", value: baseViews * 0.65, color: "#000000" },
        { name: "Desktop", value: baseViews * 0.20, color: "#4FFF5B" },
        { name: "TV", value: baseViews * 0.12, color: "#FFB570" },
        { name: "Tablet", value: baseViews * 0.03, color: "#eee" },
      ],
      origins: [
        { name: "Browse", value: baseViews * 0.45, color: "#FF83EA" },
        { name: "Suggested", value: baseViews * 0.30, color: "#24D3FF" },
        { name: "Search", value: baseViews * 0.15, color: "#C9F830" },
        { name: "External", value: baseViews * 0.10, color: "#eee" },
      ],
      sharing: [
        { name: "WhatsApp", value: baseViews * 0.05 * 0.4, color: "#4FFF5B" },
        { name: "Twitter/X", value: baseViews * 0.05 * 0.3, color: "#000000" },
        { name: "Facebook", value: baseViews * 0.05 * 0.2, color: "#24D3FF" },
        { name: "Copy Link", value: baseViews * 0.05 * 0.1, color: "#eee" },
      ]
    }
  }, [data])

  const renderPie = (title: string, chartData: any[]) => {
    const total = chartData.reduce((acc, curr) => acc + curr.value, 0)
    let currentPct = 0
    const gradientStops = chartData.map((entry) => {
      const pct = total > 0 ? (entry.value / total) * 100 : 0
      const start = currentPct
      const end = currentPct + pct
      currentPct = end
      return `${entry.color} ${start}% ${end}%`
    }).join(", ")

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}>
        <div
          title={chartData.map(d => `${d.name}: ${(d.value/total*100).toFixed(1)}%`).join('\n')}
          style={{
            width: "100%",
            aspectRatio: "1/1",
            borderRadius: "50%",
            background: `conic-gradient(${gradientStops})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "2px 2px 0 0 rgba(0,0,0,0.1)",
          }}>
          <div style={{ pointerEvents: "none" }}>
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
    <WidgetShell {...common} icon={<Globe size={22} />}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.4, textAlign: "right", padding: "4px 8px 0" }}>Matrix</div>
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
          {renderPie("Geo", matrixData.geo)}
          {renderPie("Devices", matrixData.devices)}
          {renderPie("Sources", matrixData.origins)}
          {renderPie("Shares", matrixData.sharing)}
        </div>
      </div>
    </WidgetShell>
  )
}

