import React, { useMemo, useState } from "react"
import { TrendingUp } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { WidgetSelect } from "../WidgetPrimitives"
import { formatHumanNumber } from "../widgetFormatters"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"

export const RevenueMomentumWidget: React.FC<
  CommonWidgetProps & { data: DashboardData }
> = ({ data, ...common }) => {
  const [metric, setMetric] = useState<"revenue" | "views" | "subscribers">("revenue")
  const [renderedAt] = useState(() => Date.now())
  
  const weeklyData = useMemo(() => {
    // Basic 4-week simulation based on canonicalRows if direct week-buckets aren't available
    const weeks = [0, 0, 0, 0]
    data.canonicalRows.forEach(row => {
      const d = new Date(row.uploadDate)
      const diff = (renderedAt - d.getTime()) / (1000 * 3600 * 24 * 7)
      const weekIdx = Math.floor(diff)
      if (weekIdx < 4) {
        let val = 0
        if (metric === "revenue") val = row.metrics.revenue?.value || 0
        else if (metric === "views") val = row.metrics.views?.value || 0
        else if (metric === "subscribers") val = row.metrics.subscribersGained?.value || 0
        weeks[3 - weekIdx] += val
      }
    })
    return weeks
  }, [data.canonicalRows, metric, renderedAt])

  const maxVal = Math.max(...weeklyData, 1)

  return (
    <WidgetShell {...common} icon={<TrendingUp size={22} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "9px", fontWeight: 800, opacity: 0.4, textTransform: "uppercase" }}>Momentum Pulse</span>
          <WidgetSelect
            value={metric} 
            onChange={(value) => setMetric(value as typeof metric)}
            label="Momentum metric"
            style={{ height: "24px", fontSize: "9px", padding: "0 4px", width: "auto" }}
            options={[
              { value: "revenue", label: "Revenue" },
              { value: "views", label: "Views" },
              { value: "subscribers", label: "Subs" },
            ]}
          />
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, justifyContent: "center" }}>
          {weeklyData.map((val, i) => {
            const pct = (val / maxVal) * 100
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "20px", fontSize: "9px", fontWeight: 800 }}>W{i+1}</span>
                <div style={{ flex: 1, height: "18px", border: "2px solid #000", borderRadius: "6px", background: "#f2f2f2", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "#C9F830", borderRight: "2px solid #000" }} />
                </div>
                <span style={{ width: "35px", textAlign: "right", fontSize: "9px", fontWeight: 800 }}>
                  {metric === "revenue" ? `$${val.toFixed(0)}` : formatHumanNumber(val)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </WidgetShell>
  )
}
