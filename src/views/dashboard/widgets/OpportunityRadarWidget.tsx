import React, { useEffect, useMemo, useState } from "react"
import { Radar, RefreshCw, Sparkles } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetBadge,
  WidgetProgressBar,
  WidgetScrollArea,
  WidgetSizedButton,
  WidgetStatePanel,
} from "../WidgetPrimitives"
import { InstrumentExplanation, InstrumentSignals, WidgetInstrument } from "../instruments/WidgetInstrument"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import "./OpportunityRadarWidget.css"

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
    const raw = row?.metrics?.[key]?.value ?? row?.metrics?.[key] ?? row?.[key]
    const value = Number(raw)
    if (Number.isFinite(value)) return value
  }
  return 0
}

const hasFiniteMetric = (row: any, ...keys: string[]) => {
  for (const key of keys) {
    const raw = row?.metrics?.[key]?.value ?? row?.metrics?.[key] ?? row?.[key]
    if (raw !== null && raw !== undefined && raw !== "" && Number.isFinite(Number(raw))) return true
  }
  return false
}

const safeAgeDays = (value: unknown) => {
  const timestamp = new Date(String(value || "")).getTime()
  if (!Number.isFinite(timestamp)) return 3650
  return Math.max(0, (Date.now() - timestamp) / 86_400_000)
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

const quadrantFor = (candidate: OpportunityCandidate) => {
  if (candidate.performance >= 0.58 && candidate.recency >= 0.52) return "MOMENTUM"
  if (candidate.performance >= 0.58) return "EVERGREEN"
  if (candidate.recency >= 0.52) return "TEST"
  return "REFRESH"
}

const OpportunityCompass: React.FC<{
  candidates: OpportunityCandidate[]
  selectedId: string | null
  onSelect: (id: string) => void
}> = ({ candidates, selectedId, onSelect }) => (
  <div className="vt-opportunity-compass" aria-label="Opportunity compass: performance by recency">
    <div className="vt-opportunity-compass__quadrants" aria-hidden="true">
      <span className="is-momentum">MOMENTUM</span>
      <span className="is-evergreen">EVERGREEN</span>
      <span className="is-test">TEST</span>
      <span className="is-refresh">REFRESH</span>
    </div>
    <span className="vt-opportunity-compass__axis is-x" aria-hidden="true">PERFORMANCE →</span>
    <span className="vt-opportunity-compass__axis is-y" aria-hidden="true">RECENCY →</span>
    <div className="vt-opportunity-compass__hub" aria-hidden="true">
      <Radar />
      <b>{candidates.length}</b>
      <small>CANDIDATES</small>
    </div>
    {candidates.slice(0, 8).map((candidate, index) => (
      <button
        key={candidate.id}
        type="button"
        className="vt-opportunity-compass__node"
        data-selected={candidate.id === selectedId ? "true" : "false"}
        style={{
          "--x": `${12 + candidate.performance * 76}%`,
          "--y": `${84 - candidate.recency * 72}%`,
          "--size": `${32 + candidate.score * 20}px`,
        } as React.CSSProperties}
        aria-pressed={candidate.id === selectedId}
        aria-label={`${candidate.title}, ${quadrantFor(candidate)}, score ${Math.round(candidate.score * 100)}`}
        onClick={() => onSelect(candidate.id)}
      >
        <span>{index + 1}</span>
      </button>
    ))}
  </div>
)

export const OpportunityRadarWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ data, onNavigate, ...common }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const candidates = useMemo<OpportunityCandidate[]>(() => {
    const rows = (data.canonicalRows || []).filter((row: any) => row?.title)
    if (!rows.length) return []

    const maxViews = Math.max(...rows.map((row: any) => finiteMetric(row, "views")), 1)

    return rows.map((row: any, index: number) => {
      const views = finiteMetric(row, "views")
      const ageDays = safeAgeDays(row.uploadDate)
      const performance = clamp01(views / maxViews)
      const recency = clamp01(1 - Math.min(ageDays, 365) / 365)
      const checks = [
        hasFiniteMetric(row, "views"),
        hasFiniteMetric(row, "watchTime", "estimatedMinutesWatched", "watchHours"),
        hasFiniteMetric(row, "averageViewPercentage", "avgViewPercentage", "avp"),
        hasFiniteMetric(row, "subscribersGained", "subscribers"),
      ]
      const completeness = checks.filter(Boolean).length / checks.length
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

  useEffect(() => {
    if (!candidates.length) {
      setSelectedId(null)
      return
    }
    setSelectedId((current) => current && candidates.some((candidate) => candidate.id === current) ? current : candidates[0].id)
  }, [candidates])

  const selected = candidates.find((candidate) => candidate.id === selectedId) || candidates[0] || null
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
        <WidgetInstrument archetype="radar" label="OPPORTUNITY COMPASS" summary="CATALOG PERFORMANCE × RECENCY × EVIDENCE">
          <InstrumentSignals signals={radarSignals} />
          <InstrumentExplanation
            purpose="Surface existing videos that provide the strongest evidence for a follow-up, sequel, refresh, or adjacent idea."
            process="Candidates are ranked from connected catalog evidence only: relative views, recency, and available metric coverage. No unsupported external demand signal is invented."
            result="Select a candidate directly in the compass, inspect why it ranks, then hand it into Projects."
          />
        </WidgetInstrument>
      }
    >
      <div className="vt-opportunity-radar">
        {!candidates.length ? (
          <WidgetStatePanel state={{
            status: "empty",
            data: null,
            message: "Connect or import video performance data to build the opportunity compass.",
          }} />
        ) : (
          <>
            <OpportunityCompass candidates={candidates} selectedId={selectedId} onSelect={setSelectedId} />

            {selected ? (
              <section className="vt-opportunity-radar__inspector" aria-label="Selected opportunity">
                <div className="vt-opportunity-radar__inspector-head">
                  <div>
                    <span>SELECTED OPPORTUNITY</span>
                    <strong>{selected.title}</strong>
                  </div>
                  <WidgetBadge height={24}>{quadrantFor(selected)}</WidgetBadge>
                </div>

                <div className="vt-opportunity-radar__meters">
                  <WidgetProgressBar value={Math.round(selected.performance * 100)} max={100} label="PERFORMANCE" displayValue={Math.round(selected.performance * 100) + "%"} height={24} />
                  <WidgetProgressBar value={Math.round(selected.recency * 100)} max={100} label="RECENCY" displayValue={Math.round(selected.recency * 100) + "%"} height={24} tone="secondary" />
                  <WidgetProgressBar value={Math.round(selected.completeness * 100)} max={100} label="EVIDENCE" displayValue={Math.round(selected.completeness * 100) + "%"} height={24} />
                </div>

                <div className="vt-opportunity-radar__score">
                  <span>OPPORTUNITY SCORE</span>
                  <b>{Math.round(selected.score * 100)}</b>
                  <small>{Math.round(selected.ageDays)}D OLD · {selected.views.toLocaleString()} VIEWS</small>
                </div>
              </section>
            ) : null}

            <WidgetScrollArea ariaLabel="Opportunity candidate ranking" className="vt-opportunity-radar__ranking">
              {candidates.map((candidate, index) => (
                <button
                  key={candidate.id}
                  type="button"
                  className="vt-opportunity-radar__rank-row"
                  data-selected={candidate.id === selectedId ? "true" : "false"}
                  onClick={() => setSelectedId(candidate.id)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{candidate.title}</strong>
                    <small>{quadrantFor(candidate)} · {Math.round(candidate.ageDays)}D · {candidate.views.toLocaleString()} VIEWS</small>
                  </div>
                  <b>{Math.round(candidate.score * 100)}</b>
                </button>
              ))}
            </WidgetScrollArea>

            <div className="vt-opportunity-radar__actions">
              <WidgetSizedButton height={32} tone="primary" textFit="adaptive" onClick={() => onNavigate?.("/projects")}>
                <Sparkles aria-hidden="true" /> BUILD FROM THIS
              </WidgetSizedButton>
              <WidgetSizedButton height={32} tone="default" textFit="adaptive" onClick={() => setSelectedId(candidates[0]?.id || null)}>
                <RefreshCw aria-hidden="true" /> TOP CANDIDATE
              </WidgetSizedButton>
            </div>
          </>
        )}
      </div>
    </WidgetShell>
  )
}
