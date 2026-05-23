import React, { useMemo } from "react"
import { Globe } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { formatTrafficSourceNickname } from "../../../services/dataUtils"

export const AudienceMatrixWidget: React.FC<any> = ({widget, instance, editMode, canEdit, onToggleCollapse, onCycleSize, onCycleHeight, onRemove, data, onDecSize, onDecHeight}) => {
  const common = {
  widget,
  instance,
  editMode,
  canEdit,
  onToggleCollapse,
  onCycleSize,
  onCycleHeight,
  onRemove,
  onDecSize,
  onDecHeight,
 }

  // Deterministic derivations for visual consistency
  const matrixData = useMemo(() => {
    let baseViews = 10000

    if (data && data.statBlocks28d) {
      const viewsBlock = data.statBlocks28d.find((b: any) => b.label.toLowerCase().includes("views"))
      if (viewsBlock) {
        const valStr = String(viewsBlock.value).replace(/,/g, "")
        if (valStr.includes("K")) baseViews = parseFloat(valStr) * 1000
        else if (valStr.includes("M")) baseViews = parseFloat(valStr) * 1000000
        else baseViews = parseFloat(valStr) || 10000
      }
    }

    const trafficSources = data?.trafficSources || []
    const origins = trafficSources.length > 0
      ? trafficSources.slice(0, 4).map((s: any, idx: number) => ({
          name: formatTrafficSourceNickname(s.label),
          value: s.pct,
          color: ["#FF83EA", "#24D3FF", "#C9F830", "#eee"][idx] || "#eee"
        }))
      : [
          { name: "Browse", value: baseViews * 0.45, color: "#FF83EA" },
          { name: "Suggested", value: baseViews * 0.30, color: "#24D3FF" },
          { name: "Search", value: baseViews * 0.15, color: "#C9F830" },
          { name: "External", value: baseViews * 0.10, color: "#eee" },
        ]

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
      origins,
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
          width: "100%",
          height: "100%",
        }}>
        <div
          title={chartData.map(d => `${d.name}: ${(d.value/total*100).toFixed(1)}%`).join('\n')}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `conic-gradient(${gradientStops})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            boxShadow: "none",
          }}>
          <div style={{ pointerEvents: "none" }}>
            <span
              style={{
                color: "white",
                fontSize: "27px",
                fontWeight: "1000",
                textTransform: "uppercase",
                textAlign: "center",
                lineHeight: "1",
                WebkitTextStroke: "2px #000",
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
        {/* Chart Grid */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: "5px",
            padding: "5px",
            aspectRatio: "1/1",
            margin: "0 auto",
          }}>
          {renderPie("Geo", matrixData.geo)}
          {renderPie("Device", matrixData.devices)}
          {renderPie("Source", matrixData.origins)}
          {renderPie("Share", matrixData.sharing)}
        </div>
      </div>
    </WidgetShell>
  )
}

