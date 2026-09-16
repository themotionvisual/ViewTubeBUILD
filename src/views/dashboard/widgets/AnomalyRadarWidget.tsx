import React, { useMemo } from "react"
import { Radar } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { WidgetScrollArea } from "../WidgetPrimitives"
import { InstrumentExplanation, InstrumentSignals, WidgetInstrument } from "../instruments/WidgetInstrument"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"

const read = (row: any, ...keys: string[]) => {
  for (const key of keys) {
    const value = Number(row?.[key] ?? row?.metrics?.[key]?.value ?? row?.metrics?.[key])
    if (Number.isFinite(value)) return value
  }
  return 0
}

export const AnomalyRadarWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ data, onNavigate, ...common }) => {
  const anomalies = useMemo(() => {
    const rows = (data.dailySeries || []).slice(0, 28)
    if (rows.length < 4) return []
    const metrics = [{ key: "views", label: "VIEWS" }, { key: "subscribersGained", label: "SUBSCRIBERS" }, { key: "estimatedRevenue", label: "REVENUE" }]
    return metrics.flatMap(({ key, label }) => {
      const values = rows.map((row: any) => read(row, key, key === "estimatedRevenue" ? "revenue" : key))
      const baseline = values.slice(1).reduce((a, b) => a + b, 0) / Math.max(values.length - 1, 1)
      const current = values[0] || 0
      const delta = baseline > 0 ? ((current - baseline) / baseline) * 100 : 0
      return Math.abs(delta) >= 25 ? [{ label, delta, current }] : []
    }).sort((a: { delta: number }, b: { delta: number }) => Math.abs(b.delta) - Math.abs(a.delta))
  }, [data.dailySeries])
  const radarSignals = [
    ["views", "VIEWS", "Views"],
    ["subscribers", "SUBSCRIBERS", "Subscribers"],
    ["revenue", "REVENUE", "Revenue"],
  ].map(([id, anomalyLabel, label]) => {
    const anomaly = anomalies.find((item) => item.label === anomalyLabel)
    return {
      id,
      label,
      value: anomaly ? `${anomaly.delta > 0 ? "+" : ""}${anomaly.delta.toFixed(0)}%` : "CLEAR",
      direction: anomaly ? (anomaly.delta < 0 ? "down" as const : "up" as const) : "neutral" as const,
      intensity: Math.min(1, Math.abs(anomaly?.delta || 0) / 100),
    }
  })

  return (
    <WidgetShell {...common} icon={<Radar size={22} />} helpContent={
      <WidgetInstrument archetype="radar" label="SIGNAL RADAR" summary="CURRENT DAY AGAINST 27-DAY BASELINE">
        <InstrumentSignals signals={radarSignals} />
        <InstrumentExplanation purpose="Detect meaningful changes before they disappear into averages." process="The latest day is compared with the preceding daily baseline; changes at or above 25% become signals." result="Open Analytics to identify the videos and sources responsible for the change." />
      </WidgetInstrument>
    }>
      <div className="vt-new-widget vt-anomaly-radar">
        <div className="vt-radar-summary"><strong>{anomalies.length}</strong><span>SIGNALS OUTSIDE BASELINE</span></div>
        <WidgetScrollArea ariaLabel="Anomaly signals" className="vt-radar-list">
          {anomalies.length ? anomalies.map((item) => <div className="vt-radar-row" key={item.label}>
            <span className="vt-radar-dot" data-direction={item.delta >= 0 ? "up" : "down"} />
            <div><strong>{item.label}</strong><small>{item.delta >= 0 ? "SPIKE" : "DROP"} VS RECENT BASELINE</small></div>
            <b>{item.delta >= 0 ? "+" : ""}{item.delta.toFixed(0)}%</b>
          </div>) : <div className="vt-new-widget__empty">NO ≥25% ANOMALIES IN THE CURRENT DAILY SERIES.</div>}
        </WidgetScrollArea>
        <button className="vt-new-widget__action" type="button" onClick={() => onNavigate?.("/analytics")}>INVESTIGATE DATA</button>
      </div>
    </WidgetShell>
  )
}
