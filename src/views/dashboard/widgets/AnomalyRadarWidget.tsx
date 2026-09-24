import React, { useEffect, useMemo, useState } from "react"
import { Activity, Radar, ScanSearch } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetBadge,
  WidgetHeaderToggle,
  WidgetMetric,
  WidgetScrollArea,
  WidgetSizedButton,
  WidgetStatePanel,
} from "../WidgetPrimitives"
import { InstrumentExplanation, InstrumentSignals, WidgetInstrument } from "../instruments/WidgetInstrument"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import "./AnomalyRadarWidget.css"

type Threshold = "15" | "25" | "40"
type AnomalySignal = {
  id: string
  label: string
  delta: number
  current: number
  baseline: number
  direction: "up" | "down"
  severity: "WATCH" | "SIGNIFICANT"
}

const THRESHOLDS = [
  { id: "15", label: "15%" },
  { id: "25", label: "25%" },
  { id: "40", label: "40%" },
] as const

const METRICS = [
  { id: "views", keys: ["views"], label: "VIEWS" },
  { id: "subscribers", keys: ["subscribersGained", "subscribers"], label: "SUBS" },
  { id: "revenue", keys: ["estimatedRevenue", "revenue"], label: "REVENUE" },
  { id: "watch", keys: ["watchHours", "estimatedMinutesWatched", "watchTime"], label: "WATCH" },
  { id: "avp", keys: ["averageViewPercentage", "avgViewPercentage", "avp"], label: "AVP" },
] as const

const read = (row: any, ...keys: string[]) => {
  for (const key of keys) {
    const raw = row?.[key] ?? row?.metrics?.[key]?.value ?? row?.metrics?.[key]
    const value = Number(raw)
    if (Number.isFinite(value)) return value
  }
  return 0
}

const AnomalyScope: React.FC<{
  signals: AnomalySignal[]
  selectedId: string | null
  threshold: number
  onSelect: (id: string) => void
}> = ({ signals, selectedId, threshold, onSelect }) => {
  const byId = new Map(signals.map((signal) => [signal.id, signal]))

  return (
    <div className="vt-anomaly-scope" aria-label={`Anomaly scope at ${threshold}% threshold`}>
      <div className="vt-anomaly-scope__rings" aria-hidden="true">
        <i /><i /><i />
      </div>
      <div className="vt-anomaly-scope__crosshair" aria-hidden="true" />
      <div className="vt-anomaly-scope__core">
        <ScanSearch aria-hidden="true" />
        <b>{signals.length}</b>
        <small>SIGNALS</small>
      </div>
      {METRICS.map((metric, index) => {
        const signal = byId.get(metric.id)
        const angle = -90 + index * 72
        const radius = signal ? Math.min(44, 25 + Math.abs(signal.delta) * 0.18) : 29
        return (
          <button
            key={metric.id}
            type="button"
            className="vt-anomaly-scope__signal"
            data-state={signal ? signal.direction : "clear"}
            data-selected={selectedId === metric.id ? "true" : "false"}
            style={{
              "--angle": `${angle}deg`,
              "--radius": `${radius}%`,
            } as React.CSSProperties}
            aria-pressed={selectedId === metric.id}
            aria-label={signal ? `${metric.label} ${signal.direction} ${Math.round(signal.delta)} percent` : `${metric.label} clear`}
            onClick={() => signal && onSelect(metric.id)}
            disabled={!signal}
          >
            <span>{metric.label}</span>
            <b>{signal ? `${signal.delta >= 0 ? "+" : ""}${Math.round(signal.delta)}%` : "CLEAR"}</b>
          </button>
        )
      })}
      <div className="vt-anomaly-scope__legend" aria-hidden="true">
        <span>DROP</span><span>CLEAR</span><span>SPIKE</span>
      </div>
    </div>
  )
}

export const AnomalyRadarWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ data, onNavigate, ...common }) => {
  const [threshold, setThreshold] = useState<Threshold>("25")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const signals = useMemo<AnomalySignal[]>(() => {
    const rows = (data.dailySeries || []).slice(0, 28)
    if (rows.length < 4) return []
    const activeThreshold = Number(threshold)

    return METRICS.flatMap((metric) => {
      const values = rows.map((row: any) => read(row, ...metric.keys))
      const baseline = values.slice(1).reduce((sum: number, value: number) => sum + value, 0) / Math.max(values.length - 1, 1)
      const current = values[0] || 0
      const delta = baseline > 0 ? ((current - baseline) / baseline) * 100 : 0
      if (Math.abs(delta) < activeThreshold) return []
      return [{
        id: metric.id,
        label: metric.label,
        delta,
        current,
        baseline,
        direction: delta < 0 ? "down" as const : "up" as const,
        severity: Math.abs(delta) >= Math.max(40, activeThreshold * 1.6) ? "SIGNIFICANT" as const : "WATCH" as const,
      }]
    }).sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))
  }, [data.dailySeries, threshold])

  useEffect(() => {
    setSelectedId((current) => current && signals.some((signal) => signal.id === current) ? current : signals[0]?.id || null)
  }, [signals])

  const selected = signals.find((signal) => signal.id === selectedId) || signals[0] || null
  const instrumentSignals = METRICS.slice(0, 3).map((metric) => {
    const anomaly = signals.find((signal) => signal.id === metric.id)
    return {
      id: metric.id,
      label: metric.label,
      value: anomaly ? `${anomaly.delta > 0 ? "+" : ""}${anomaly.delta.toFixed(0)}%` : "CLEAR",
      direction: anomaly?.direction || "neutral" as const,
      intensity: Math.min(1, Math.abs(anomaly?.delta || 0) / 100),
    }
  })

  return (
    <WidgetShell
      {...common}
      icon={<Radar size={22} />}
      helpContent={
        <WidgetInstrument archetype="radar" label="ANOMALY SCOPE" summary="LATEST DAY AGAINST RECENT BASELINE">
          <InstrumentSignals signals={instrumentSignals} />
          <InstrumentExplanation
            purpose="Detect material performance movement before it disappears inside averages."
            process="Choose a sensitivity threshold. Each available metric is compared with the preceding daily baseline and plotted as a radial signal when it crosses that threshold."
            result="Select a signal in the scope to inspect its current value, baseline, direction and severity before opening Analytics."
          />
        </WidgetInstrument>
      }
    >
      <div className="vt-anomaly-radar">
        <div className="vt-anomaly-radar__toolbar">
          <WidgetHeaderToggle label="Anomaly threshold" value={threshold} items={THRESHOLDS} onChange={setThreshold} />
          <WidgetBadge height={24} status={signals.length ? "warning" : "positive"}>
            {signals.length ? `${signals.length} ACTIVE` : "CLEAR"}
          </WidgetBadge>
        </div>

        {(data.dailySeries || []).length < 4 ? (
          <WidgetStatePanel state={{
            status: "empty",
            data: null,
            message: "At least four daily observations are required to establish an anomaly baseline.",
          }} />
        ) : (
          <>
            <AnomalyScope signals={signals} selectedId={selectedId} threshold={Number(threshold)} onSelect={setSelectedId} />

            <section className="vt-anomaly-radar__inspector" aria-label="Selected anomaly">
              {selected ? (
                <>
                  <div className="vt-anomaly-radar__inspector-head">
                    <div>
                      <span>SELECTED SIGNAL</span>
                      <strong>{selected.label}</strong>
                    </div>
                    <WidgetBadge height={24} status={selected.severity === "SIGNIFICANT" ? "danger" : "warning"}>
                      {selected.severity}
                    </WidgetBadge>
                  </div>
                  <div className="vt-anomaly-radar__metrics">
                    <WidgetMetric label="DELTA" value={`${selected.delta >= 0 ? "+" : ""}${selected.delta.toFixed(0)}%`} detail={selected.direction.toUpperCase()} />
                    <WidgetMetric label="CURRENT" value={selected.current.toLocaleString(undefined, { maximumFractionDigits: 1 })} />
                    <WidgetMetric label="BASELINE" value={selected.baseline.toLocaleString(undefined, { maximumFractionDigits: 1 })} />
                  </div>
                  <div className="vt-anomaly-radar__direction" data-direction={selected.direction}>
                    <Activity aria-hidden="true" />
                    <span>{selected.direction === "up" ? "SPIKE ABOVE RECENT BASELINE" : "DROP BELOW RECENT BASELINE"}</span>
                  </div>
                </>
              ) : (
                <div className="vt-anomaly-radar__clear">
                  <Radar aria-hidden="true" />
                  <strong>NO SIGNAL CROSSES {threshold}%</strong>
                  <small>LOWER THE THRESHOLD TO INSPECT SMALLER MOVES.</small>
                </div>
              )}
            </section>

            <WidgetScrollArea ariaLabel="Anomaly signal ranking" className="vt-anomaly-radar__ranking">
              {signals.map((signal, index) => (
                <button
                  key={signal.id}
                  type="button"
                  className="vt-anomaly-radar__rank-row"
                  data-selected={signal.id === selectedId ? "true" : "false"}
                  onClick={() => setSelectedId(signal.id)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{signal.label}</strong>
                  <small>{signal.severity}</small>
                  <b>{signal.delta >= 0 ? "+" : ""}{signal.delta.toFixed(0)}%</b>
                </button>
              ))}
            </WidgetScrollArea>

            <WidgetSizedButton height={32} tone="primary" textFit="adaptive" onClick={() => onNavigate?.("/analytics")}>
              <ScanSearch aria-hidden="true" /> INVESTIGATE SELECTED SIGNAL
            </WidgetSizedButton>
          </>
        )}
      </div>
    </WidgetShell>
  )
}
