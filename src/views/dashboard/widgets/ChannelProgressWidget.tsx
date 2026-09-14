import React, { useMemo } from "react"
import { Target } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"

const number = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0
const fmt = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : value >= 1_000 ? `${(value / 1_000).toFixed(1)}K` : Math.round(value).toLocaleString()

export const ChannelProgressWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ data, onNavigate, ...common }) => {
  const metrics = useMemo(() => {
    const raw = data.rawMetrics || ({} as DashboardData["rawMetrics"])
    return [
      { label: "SUBSCRIBERS", value: number(raw.subsTotal), period: number(raw.subscribers28d), target: Math.max(number(raw.subsTotal) + Math.max(number(raw.subscribers28d) * 3, 100), 1000) },
      { label: "VIEWS", value: number(raw.viewsTotal), period: number(raw.views28d), target: Math.max(number(raw.viewsTotal) + Math.max(number(raw.views28d) * 3, 1000), 10000) },
      { label: "REVENUE 28D", value: number(raw.revenue28d), period: number(raw.revenue28d), target: Math.max(number(raw.revenue28d) * 1.25, 100) },
    ]
  }, [data.rawMetrics])

  return (
    <WidgetShell {...common} icon={<Target size={22} />}>
      <div className="vt-new-widget vt-channel-progress">
        <div className="vt-new-widget__eyebrow">CURRENT TRAJECTORY</div>
        <div className="vt-progress-grid">
          {metrics.map((metric) => {
            const pct = Math.max(0, Math.min(100, (metric.value / Math.max(metric.target, 1)) * 100))
            return <div className="vt-progress-card" key={metric.label}>
              <div className="vt-progress-card__top"><span>{metric.label}</span><strong>{fmt(metric.value)}</strong></div>
              <div className="vt-progress-track" aria-label={`${metric.label} ${Math.round(pct)} percent of target`}><span style={{ width: `${pct}%` }} /></div>
              <div className="vt-progress-card__foot"><span>+{fmt(metric.period)} / 28D</span><span>{Math.round(pct)}% TARGET</span></div>
            </div>
          })}
        </div>
        <button className="vt-new-widget__action" type="button" onClick={() => onNavigate?.("/analytics")}>OPEN ANALYTICS</button>
      </div>
    </WidgetShell>
  )
}
