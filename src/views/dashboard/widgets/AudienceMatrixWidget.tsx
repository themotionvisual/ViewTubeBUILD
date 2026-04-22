import React, { useMemo } from "react"
import { Globe, MonitorSmartphone, Share2, Youtube } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"

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
        { name: "United States", value: baseViews * 0.42, color: "#4FFF5B" },
        { name: "United Kingdom", value: baseViews * 0.18, color: "#C9F830" },
        { name: "Canada", value: baseViews * 0.12, color: "#24D3FF" },
        { name: "Australia", value: baseViews * 0.08, color: "#FF83EA" },
        { name: "Other", value: baseViews * 0.20, color: "#eee" },
      ],
      devices: [
        { name: "Mobile", value: baseViews * 0.65, color: "#000000" },
        { name: "Desktop", value: baseViews * 0.20, color: "#4FFF5B" },
        { name: "TV", value: baseViews * 0.12, color: "#FFB570" },
        { name: "Tablet", value: baseViews * 0.03, color: "#eee" },
      ],
      origins: [
        { name: "Browse Features", value: baseViews * 0.45, color: "#FF83EA" },
        { name: "Suggested Videos", value: baseViews * 0.30, color: "#24D3FF" },
        { name: "YouTube Search", value: baseViews * 0.15, color: "#C9F830" },
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

  const renderMiniChart = (title: string, icon: React.ReactNode, chartData: any[]) => (
    <div style={{ flex: 1, minWidth: "120px", display: "flex", flexDirection: "column", borderRight: "2px solid #eee", paddingRight: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
        {icon}
        <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase" }}>{title}</span>
      </div>
      <div style={{ flex: 1, minHeight: "80px", position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              stroke="#000"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={{
                      background: "#fff",
                      border: "2px solid #000",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      boxShadow: "2px 2px 0 0 rgba(0,0,0,0.5)",
                      fontSize: "9px",
                      fontWeight: 800
                    }}>
                      {payload[0].name}: {(payload[0].value / chartData.reduce((a,b)=>a+b.value,0) * 100).toFixed(1)}%
                    </div>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  return (
    <WidgetShell {...common} icon={<Globe size={20} />}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "4px" }}>
        
        <div style={{ marginBottom: "8px" }}>
          <h3 style={{ fontSize: "12px", fontWeight: 900, textTransform: "uppercase" }}>Audience Matrix</h3>
          <p style={{ fontSize: "9px", fontWeight: 700, opacity: 0.5, textTransform: "uppercase" }}>Demographics & Distribution</p>
        </div>

        <div style={{ display: "flex", flex: 1, gap: "12px", overflowX: "auto", overflowY: "hidden", paddingBottom: "4px" }}>
          {renderMiniChart("Geography", <Globe size={12} color="#4FFF5B" />, matrixData.geo)}
          {renderMiniChart("Devices", <MonitorSmartphone size={12} color="#000" />, matrixData.devices)}
          {renderMiniChart("Traffic Sources", <Youtube size={12} color="#FF83EA" />, matrixData.origins)}
          <div style={{ flex: 1, minWidth: "120px", display: "flex", flexDirection: "column", paddingRight: "8px" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
              <Share2 size={12} color="#24D3FF" />
              <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase" }}>Shares</span>
            </div>
            <div style={{ flex: 1, minHeight: "80px", position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={matrixData.sharing}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="80%"
                    paddingAngle={2}
                    dataKey="value"
                    stroke="#000"
                    strokeWidth={2}
                  >
                    {matrixData.sharing.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{
                            background: "#fff",
                            border: "2px solid #000",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            boxShadow: "2px 2px 0 0 rgba(0,0,0,0.5)",
                            fontSize: "9px",
                            fontWeight: 800
                          }}>
                            {payload[0].name}: {(payload[0].value / matrixData.sharing.reduce((a,b)=>a+b.value,0) * 100).toFixed(1)}%
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </WidgetShell>
  )
}
