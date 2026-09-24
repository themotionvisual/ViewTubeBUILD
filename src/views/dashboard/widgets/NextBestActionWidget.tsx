import React, { useEffect, useMemo, useState } from "react"
import { Sparkles } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { WidgetScrollArea, WidgetSizedButton } from "../WidgetPrimitives"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import { useBrain } from "../../../context/useBrain"
import { readAlgorithmIntelligenceForBrain } from "../../../services/brain/AlgorithmIntelligenceAccess"
import type { AlgorithmRecommendation } from "../../../services/brain/AlgorithmStrategyEngine"
import { buildDashboardAlgorithmProjectContext } from "./dashboardAlgorithmContext"
import { buildNextBestActionModel } from "./nextBestActionModel"

export const NextBestActionWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ data, onNavigate, ...common }) => {
  const { brain, authState } = useBrain()
  const channelId = authState.channelId || authState.channelHandle || null
  const projectContext = useMemo(
    () => buildDashboardAlgorithmProjectContext({
      channelId,
      activeProjectId: brain.activeProjectId,
      projects: brain.projects,
    }),
    [channelId, brain.activeProjectId, brain.projects],
  )
  const [recommendations, setRecommendations] = useState<AlgorithmRecommendation[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "fallback">("idle")

  useEffect(() => {
    let cancelled = false
    if (!channelId) {
      setRecommendations([])
      setStatus("fallback")
      return
    }

    setStatus("loading")
    void readAlgorithmIntelligenceForBrain({
      channelId,
      project: projectContext,
      includeAnomalies: true,
    }).then((result) => {
      if (cancelled) return
      if (result.status === "ok" && result.value.recommendations.length) {
        setRecommendations(result.value.recommendations)
        setStatus("ready")
      } else {
        setRecommendations([])
        setStatus("fallback")
      }
    }).catch(() => {
      if (cancelled) return
      setRecommendations([])
      setStatus("fallback")
    })

    return () => {
      cancelled = true
    }
  }, [channelId, projectContext])

  const model = useMemo(
    () => buildNextBestActionModel({
      recommendations,
      canonicalRows: data.canonicalRows,
      todayTasks: data.todayTasks,
      topPerformer: data.topPerformer,
    }),
    [recommendations, data.canonicalRows, data.todayTasks, data.topPerformer],
  )

  const primary = model.actions[0]

  return (
    <WidgetShell {...common} icon={<Sparkles size={22} />}>
      <div className="vt-new-widget vt-next-action">
        <div className="vt-next-action__source">
          <span>{model.source === "algorithm-intelligence" ? "GOVERNED INTELLIGENCE" : "DASHBOARD FALLBACK"}</span>
          <b>{status.toUpperCase()}</b>
        </div>

        <div className="vt-next-action__priority">{primary.priority}</div>
        <div className="vt-next-action__title">{primary.title}</div>
        <p className="vt-next-action__reason">{primary.reason}</p>

        <div className="vt-next-action__evidence">
          <span>SCORE</span><strong>{primary.score}</strong>
          <span>EVIDENCE</span><strong>{primary.evidenceCount}</strong>
          <span>CONFIDENCE</span><strong>{primary.confidence.toUpperCase()}</strong>
        </div>

        {model.actions.length > 1 ? (
          <WidgetScrollArea ariaLabel="Ranked next actions" className="vt-next-action__list">
            {model.actions.map((action, index) => (
              <button
                key={action.id}
                type="button"
                className="vt-next-action__row"
                onClick={() => onNavigate?.(action.route)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{action.command || action.priority}</strong>
                  <small>{action.title}</small>
                </div>
                <b>{action.score}</b>
              </button>
            ))}
          </WidgetScrollArea>
        ) : null}

        <div className="vt-next-action__controls">
          <WidgetSizedButton height={32} tone="primary" textFit="adaptive" onClick={() => onNavigate?.(primary.route)}>
            TAKE ACTION
          </WidgetSizedButton>
          <WidgetSizedButton height={32} tone="default" textFit="adaptive" onClick={() => onNavigate?.("/ai-brain")}>
            EVIDENCE
          </WidgetSizedButton>
        </div>
      </div>
    </WidgetShell>
  )
}
