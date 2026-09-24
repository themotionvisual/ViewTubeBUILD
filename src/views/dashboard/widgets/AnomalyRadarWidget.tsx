import React, { useEffect, useMemo, useState } from "react"
import { Radar } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { WidgetScrollArea, WidgetSizedButton } from "../WidgetPrimitives"
import { InstrumentExplanation, InstrumentSignals, WidgetInstrument } from "../instruments/WidgetInstrument"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import { useBrain } from "../../../context/useBrain"
import { readAlgorithmIntelligenceForBrain } from "../../../services/brain/AlgorithmIntelligenceAccess"
import type { AlgorithmSignal } from "../../../services/brain/AlgorithmStrategyEngine"
import { describeAlgorithmAnomaly } from "./anomalyRadarSignals"

const read = (row: any, ...keys: string[]) => {
  for (const key of keys) {
    const value = Number(row?.[key] ?? row?.metrics?.[key]?.value ?? row?.metrics?.[key])
    if (Number.isFinite(value)) return value
  }
  return 0
}

export const AnomalyRadarWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ data, onNavigate, ...common }) => {
  const { authState } = useBrain()
  const channelId = authState.channelId || authState.channelHandle || null
  const [canonicalSignals, setCanonicalSignals] = useState<AlgorithmSignal[]>([])
  const [canonicalStatus, setCanonicalStatus] = useState<"idle" | "loading" | "ready" | "unavailable">("idle")

  useEffect(() => {
    let cancelled = false
    if (!channelId) {
      setCanonicalSignals([])
      setCanonicalStatus("unavailable")
      return
    }

    setCanonicalStatus("loading")
    void readAlgorithmIntelligenceForBrain({
      channelId,
      includeAnomalies: true,
    }).then((result) => {
      if (cancelled) return
      if (result.status === "ok") {
        setCanonicalSignals(result.value.anomalySignals || [])
        setCanonicalStatus("ready")
      } else {
        setCanonicalSignals([])
        setCanonicalStatus("unavailable")
      }
    }).catch(() => {
      if (cancelled) return
      setCanonicalSignals([])
      setCanonicalStatus("unavailable")
    })

    return () => {
      cancelled = true
    }
  }, [channelId])

  const fallbackAnomalies = useMemo(() => {
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

  const anomalies = useMemo(() => {
    if (canonicalSignals.length) {
      return canonicalSignals
        .map(describeAlgorithmAnomaly)
        .sort((left, right) => right.impact - left.impact || right.confidence - left.confidence)
    }

    return fallbackAnomalies.map((item, index) => ({
      id: `fallback-${index}-${item.label}`,
      label: item.label,
      direction: item.delta < 0 ? "down" as const : "up" as const,
      delta: item.delta,
      current: item.current,
      baseline: null,
      severity: Math.abs(item.delta) >= 50 ? "SIGNIFICANT" : "WATCH",
      impact: Math.min(100, Math.round(Math.abs(item.delta))),
      confidence: 0,
      evidenceCount: 0,
      kind: "fallback",
    }))
  }, [canonicalSignals, fallbackAnomalies])

  const radarSignals = [
    ["views", "VIEWS", "Views"],
    ["ctr", "CTR", "CTR"],
    ["avp", "AVP", "AVP"],
    ["browse", "BROWSE", "Browse"],
    ["subscribers", "SUBSCRIBERS", "Subscribers"],
  ].map(([id, anomalyLabel, label]) => {
    const anomaly = anomalies.find((item) => item.label === anomalyLabel)
    return {
      id,
      label,
      value: anomaly ? `${anomaly.delta > 0 ? "+" : ""}${anomaly.delta.toFixed(0)}%` : "CLEAR",
      direction: anomaly?.direction || "neutral" as const,
      intensity: Math.min(1, (anomaly?.impact || 0) / 100),
    }
  })

  return (
    <WidgetShell {...common} icon={<Radar size={22} />} helpContent={
      <WidgetInstrument archetype="radar" label="SIGNAL RADAR" summary="CANONICAL ANOMALY INTELLIGENCE + LOCAL FALLBACK">
        <InstrumentSignals signals={radarSignals} />
        <InstrumentExplanation purpose="Detect meaningful changes before they disappear into averages." process="When Brain anomaly intelligence is available, this widget reads its channel-scoped VT-SYNC anomaly portfolio and thresholds. The local latest-day baseline remains a fallback only." result="Open signals for governed intelligence context or compare the underlying analytics evidence." />
      </WidgetInstrument>
    }>
      <div className="vt-new-widget vt-anomaly-radar">
        <div className="vt-radar-summary">
          <strong>{anomalies.length}</strong>
          <span>{canonicalSignals.length ? "CANONICAL SIGNALS" : "LOCAL FALLBACK SIGNALS"} · {canonicalStatus.toUpperCase()}</span>
        </div>
        <WidgetScrollArea ariaLabel="Anomaly signals" className="vt-radar-list">
          {anomalies.length ? anomalies.map((item) => <div className="vt-radar-row" key={item.id}>
            <span className="vt-radar-dot" data-direction={item.direction} />
            <div>
              <strong>{item.label}</strong>
              <small>{item.severity} · IMPACT {item.impact}{item.confidence ? ` · CONF ${item.confidence}` : ""}{item.evidenceCount ? ` · ${item.evidenceCount} EVIDENCE` : ""}</small>
            </div>
            <b>{item.delta >= 0 ? "+" : ""}{item.delta.toFixed(0)}%</b>
          </div>) : <div className="vt-new-widget__empty">{canonicalStatus === "loading" ? "LOADING CHANNEL-SCOPED ANOMALY INTELLIGENCE…" : "NO MATERIAL ANOMALIES ARE AVAILABLE FOR THE CURRENT CHANNEL EVIDENCE."}</div>}
        </WidgetScrollArea>
        <div className="vt-radar-actions">
          <WidgetSizedButton height={32} tone="primary" textFit="adaptive" onClick={() => onNavigate?.("/ai-brain")}>OPEN SIGNALS</WidgetSizedButton>
          <WidgetSizedButton height={32} tone="default" textFit="adaptive" onClick={() => onNavigate?.("/analytics")}>COMPARE</WidgetSizedButton>
        </div>
      </div>
    </WidgetShell>
  )
}
