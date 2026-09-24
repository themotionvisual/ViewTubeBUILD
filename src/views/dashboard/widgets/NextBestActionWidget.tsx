import React, { useEffect, useMemo, useState } from "react"
import { ArrowRight, GitBranch, Sparkles } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetBadge,
  WidgetMetric,
  WidgetSizedButton,
  WidgetStatePanel,
} from "../WidgetPrimitives"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import "./NextBestActionWidget.css"

type DecisionAction = {
  id: string
  priority: string
  title: string
  reason: string
  route: string
  score: number
  evidence: number
  tone: "high" | "medium" | "opportunity"
}

const numericViews = (row: any) => Number(row?.metrics?.views?.value ?? row?.metrics?.views ?? row?.views ?? 0) || 0

const DecisionJunction: React.FC<{
  actions: DecisionAction[]
  selectedId: string | null
  onSelect: (id: string) => void
}> = ({ actions, selectedId, onSelect }) => (
  <div className="vt-decision-junction" aria-label="Ranked next-action decision junction">
    <div className="vt-decision-junction__spine" aria-hidden="true" />
    <div className="vt-decision-junction__origin">
      <GitBranch aria-hidden="true" />
      <span>NOW</span>
    </div>
    {actions.slice(0, 3).map((action, index) => (
      <button
        key={action.id}
        type="button"
        className="vt-decision-junction__branch"
        data-rank={index + 1}
        data-tone={action.tone}
        data-selected={action.id === selectedId ? "true" : "false"}
        aria-pressed={action.id === selectedId}
        onClick={() => onSelect(action.id)}
      >
        <span className="vt-decision-junction__rank">0{index + 1}</span>
        <span className="vt-decision-junction__copy">
          <small>{action.priority}</small>
          <strong>{action.title}</strong>
        </span>
        <span className="vt-decision-junction__score">{action.score}</span>
      </button>
    ))}
    <div className="vt-decision-junction__outcome" aria-hidden="true">
      <span>ACT</span>
      <ArrowRight />
    </div>
  </div>
)

export const NextBestActionWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ data, onNavigate, ...common }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const actions = useMemo<DecisionAction[]>(() => {
    const rows = data.canonicalRows || []
    if (!rows.length) {
      return [{
        id: "connect",
        priority: "CONNECT DATA",
        title: "Sync or import channel data",
        reason: "ViewTube needs a canonical dataset before it can rank evidence-backed creator actions.",
        route: "/analytics",
        score: 0,
        evidence: 0,
        tone: "high",
      }]
    }

    const sorted = rows.slice().sort((a, b) => new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime())
    const latest = sorted[0]
    const views = numericViews(latest)
    const avg = rows.reduce((sum, row) => sum + numericViews(row), 0) / Math.max(rows.length, 1)
    const relative = avg > 0 ? views / avg : 1
    const taskCount = (data.todayTasks || []).length

    const candidates: DecisionAction[] = []

    if (relative < 0.9) {
      const severity = Math.max(0, Math.min(1, (1 - relative) / 0.7))
      candidates.push({
        id: "repackage",
        priority: relative < 0.7 ? "HIGH PRIORITY" : "PACKAGING",
        title: "Repackage your latest upload",
        reason: `${latest?.title || "Latest upload"} is below the catalog view baseline. Review its title and thumbnail promise before changing the content strategy.`,
        route: "/studio",
        score: Math.round(70 + severity * 25),
        evidence: rows.length,
        tone: "high",
      })
    }

    if (taskCount) {
      candidates.push({
        id: "execute",
        priority: "TODAY",
        title: "Clear the next production task",
        reason: `${taskCount} scheduled task${taskCount === 1 ? " is" : "s are"} ready. Move the current production pipeline before opening a new branch.`,
        route: "/projects",
        score: Math.min(92, 60 + taskCount * 4),
        evidence: taskCount,
        tone: "medium",
      })
    }

    candidates.push({
      id: "followup",
      priority: "OPPORTUNITY",
      title: "Build a follow-up to the current winner",
      reason: `Use ${data.topPerformer?.title || "your top performer"} as evidence for the next topic, hook and packaging direction.`,
      route: "/projects",
      score: data.topPerformer ? 72 : 52,
      evidence: rows.length,
      tone: "opportunity",
    })

    candidates.push({
      id: "analyze",
      priority: "EVIDENCE",
      title: "Inspect the channel before committing",
      reason: "Open the evidence layer when the top choices are close or when you want to validate the recommendation before acting.",
      route: "/analytics",
      score: Math.max(48, 64 - candidates.length * 3),
      evidence: rows.length,
      tone: "medium",
    })

    return candidates.sort((left, right) => right.score - left.score).slice(0, 3)
  }, [data.canonicalRows, data.todayTasks, data.topPerformer])

  useEffect(() => {
    setSelectedId((current) => current && actions.some((action) => action.id === current) ? current : actions[0]?.id || null)
  }, [actions])

  const selected = actions.find((action) => action.id === selectedId) || actions[0] || null

  return (
    <WidgetShell {...common} icon={<Sparkles size={22} />}>
      <div className="vt-next-best-action">
        {!selected ? (
          <WidgetStatePanel state={{ status: "empty", data: null, message: "No actionable channel evidence is available yet." }} />
        ) : (
          <>
            <DecisionJunction actions={actions} selectedId={selectedId} onSelect={setSelectedId} />

            <section className="vt-next-best-action__inspector" aria-label="Selected next action">
              <div className="vt-next-best-action__head">
                <div>
                  <span>SELECTED DECISION</span>
                  <strong>{selected.title}</strong>
                </div>
                <WidgetBadge height={24}>{selected.priority}</WidgetBadge>
              </div>

              <p>{selected.reason}</p>

              <div className="vt-next-best-action__metrics">
                <WidgetMetric label="DECISION SCORE" value={selected.score} detail="0–100" />
                <WidgetMetric label="EVIDENCE" value={selected.evidence} detail="records" />
                <WidgetMetric label="ALTERNATIVES" value={Math.max(0, actions.length - 1)} detail="ranked" />
              </div>

              <div className="vt-next-best-action__controls">
                <WidgetSizedButton height={32} tone="primary" textFit="adaptive" onClick={() => onNavigate?.(selected.route)}>
                  TAKE ACTION <ArrowRight aria-hidden="true" />
                </WidgetSizedButton>
                <WidgetSizedButton height={32} tone="default" textFit="adaptive" onClick={() => onNavigate?.("/analytics")}>
                  CHECK EVIDENCE
                </WidgetSizedButton>
              </div>
            </section>
          </>
        )}
      </div>
    </WidgetShell>
  )
}
