import React, { useMemo } from "react"
import { Radar } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { WidgetScrollArea, WidgetSizedButton } from "../WidgetPrimitives"
import { InstrumentExplanation, InstrumentSignals, WidgetInstrument } from "../instruments/WidgetInstrument"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"

type OpportunityCandidate = {
  id: string
  title: string
  views: number
  ageDays: number
  performance: number
  recency: number
  completeness: number
  score: number
}

const finiteMetric = (row: any, ...keys: string[]) => {
  for (const key of keys) {
    const value = Number(row?.metrics?.[key]?.value ?? row?.metrics?.[key] ?? row?.[key])
    if (Number.isFinite(value)) return value
  }
  return 0
}

const safeAgeDays = (value: unknown) => {
  const timestamp = new Date(String(value || "")).getTime()
  if (!Number.isFinite(timestamp)) return 3650
  return Math.max(0, (Date.now() - timestamp) / 86_400_000)
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

export const OpportunityRadarWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ data, onNavigate, ...common }) => {
  const candidates = useMemo<OpportunityCandidate[]>(() => {
    const rows = (data.canonicalRows || []).filter((row: any) => row?.title)
    if (!rows.length) return []

    const maxViews = Math.max(...rows.map((row: any) => finiteMetric(row, "views")), 1)

    return rows.map((row: any, index: number) => {
      const views = finiteMetric(row, "views")
      const ageDays = safeAgeDays(row.uploadDate)
      const performance = clamp01(views / maxViews)
      const recency = clamp01(1 - Math.min(ageDays, 365) / 365)
      const metricChecks = [
        views > 0,
        finiteMetric(row, "watchTime", "estimatedMinutesWatched", "watchHours") > 0,
        finiteMetric(row, "averageViewPercentage", "avgViewPercentage", "avp") > 0,
        finiteMetric(row, "subscribersGained", "subscribers") > 0,
      ]
      const completeness = metricChecks.filter(Boolean).length / metricChecks.length
      const score = performance * 0.6 + recency * 0.25 + completeness * 0.15

      return {
        id: String(row.videoId || row.id || index),
        title: String(row.title),
        views,
        ageDays,
        performance,
        recency,
        completeness,
        score,
      }
    }).sort((left, right) => right.score - left.score).slice(0, 8)
  }, [data.canonicalRows])

  const top = candidates[0]
  const radarSignals = [
    { id: "performance", label: "Performance", value: top ? `${Math.round(top.performance * 100)}` : "---", direction: "up" as const, intensity: top?.performance || 0 },
    { id: "recency", label: "Recency", value: top ? `${Math.round(top.recency * 100)}` : "---", direction: "neutral" as const, intensity: top?.recency || 0 },
    { id: "evidence", label: "Evidence", value: top ? `${Math.round(top.completeness * 100)}` : "---", direction: "neutral" as const, intensity: top?.completeness || 0 },
  ]

  return (
    <WidgetShell
      {...common}
      icon={<Radar size={22} />}
      helpContent={
        <WidgetInstrument archetype="radar" label="OPPORTUNITY FIELD" summary="CATALOG PERFORMANCE × RECENCY × EVIDENCE">
          <InstrumentSignals signals={radarSignals} />
          <InstrumentExplanation
            purpose="Surface existing videos that provide the strongest evidence for a follow-up, sequel, refresh, or adjacent idea."
            process="Candidates are ranked from connected catalog evidence only: relative views, recency, and available metric coverage. No external demand signal is inferred."
            result="Investigate the leading candidates, then hand the chosen direction into Projects or a deeper opportunity workflow."
          />
        </WidgetInstrument>
      }
    >
      <div className="vt-new-widget vt-opportunity-radar">
        {candidates.length ? (
          <>
            <div className="vt-opportunity-field" role="img" aria-label="Opportunity candidates plotted by recency and relative performance">
              <span className="vt-opportunity-axis vt-opportunity-axis--x">PERFORMANCE →</span>
              <span className="vt-opportunity-axis vt-opportunity-axis--y">RECENCY →</span>
              {candidates.slice(0, 6).map((candidate, index) => (
                <button
                  key={candidate.id}
                  type="button"
                  className="vt-opportunity-dot"
                  style={{
                    "--vt-opportunity-x": `${10 + candidate.performance * 78}%`,
                    "--vt-opportunity-y": `${82 - candidate.recency * 70}%`,
                    "--vt-opportunity-size": `${26 + candidate.score * 22}px`,
                  } as React.CSSProperties}
                  aria-label={`${candidate.title}, opportunity score ${Math.round(candidate.score * 100)}`}
                  onClick={() => onNavigate?.("/projects")}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <WidgetScrollArea ariaLabel="Opportunity candidates" className="vt-opportunity-list">
              {candidates.map((candidate, index) => (
                <div className="vt-opportunity-row" key={candidate.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{candidate.title}</strong>
                    <small>{Math.round(candidate.ageDays)}D OLD · {candidate.views.toLocaleString()} VIEWS</small>
                  </div>
                  <b>{Math.round(candidate.score * 100)}</b>
                </div>
              ))}
            </WidgetScrollArea>
            <WidgetSizedButton height={32} tone="primary" textFit="auto" onClick={() => onNavigate?.("/projects")}>
              INVESTIGATE TOP OPPORTUNITY
            </WidgetSizedButton>
          </>
        ) : (
          <div className="vt-new-widget__empty">
            CONNECT OR IMPORT VIDEO PERFORMANCE DATA TO BUILD AN EVIDENCE-BACKED OPPORTUNITY FIELD.
          </div>
        )}
      </div>
    </WidgetShell>
  )
}
