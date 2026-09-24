import React, { useMemo } from "react"
import { Workflow } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { WidgetSizedButton } from "../WidgetPrimitives"
import { listContentBuildSnapshots } from "../../../services/assetEngine"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"
import { buildContentLifecycleSummary, describeContentBuildReadiness } from "./contentBuildWidgetModel"

const FALLBACK_STAGES = ["IDEA", "BUILD", "PACKAGE", "LIVE", "LEARN"] as const

export const ContentPipelineWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ data, onNavigate, ...common }) => {
  const builds = useMemo(
    () => listContentBuildSnapshots(),
    [data.brain, data.todayTasks, data.recentUploads, data.upcomingDays],
  )

  const canonicalSummary = useMemo(
    () => buildContentLifecycleSummary(builds),
    [builds],
  )

  const fallbackCounts = useMemo(() => {
    const brainIdeas = (data.brain as any)?.ideas || (data.brain as any)?.ideaBank || []
    return [
      Array.isArray(brainIdeas) ? brainIdeas.length : 0,
      (data.todayTasks || []).length,
      (data.upcomingDays || []).reduce((sum, day) => sum + (day.tasks?.length || 0), 0),
      (data.recentUploads || []).length,
      0,
    ]
  }, [data.brain, data.recentUploads, data.todayTasks, data.upcomingDays])

  const stages = builds.length
    ? canonicalSummary
    : FALLBACK_STAGES.map((id, index) => ({ id, count: fallbackCounts[index] || 0 }))

  const activeBuild = builds[0] || null
  const readiness = describeContentBuildReadiness(activeBuild)

  return (
    <WidgetShell {...common} icon={<Workflow size={22} />}>
      <div className="vt-new-widget vt-content-pipeline">
        <div className="vt-pipeline-source">
          <span>{builds.length ? "CONTENTBUILD LIFECYCLE" : "DASHBOARD FALLBACK"}</span>
          <b>{builds.length ? `${builds.length} BUILDS` : "NO BUILDS"}</b>
        </div>

        <div className="vt-pipeline-stages">
          {stages.map((stage, index) => <div className="vt-pipeline-stage" key={stage.id}>
            <div className="vt-pipeline-stage__count">{stage.count}</div>
            <div className="vt-pipeline-stage__label">{stage.id}</div>
            {index < stages.length - 1 ? <span className="vt-pipeline-stage__arrow">→</span> : null}
          </div>)}
        </div>

        {activeBuild ? (
          <div className="vt-pipeline-build">
            <div>
              <span>ACTIVE CONTENT BUILD</span>
              <strong>{activeBuild.legacyProjectName || activeBuild.profile.workingConcept || activeBuild.id}</strong>
              <small>{activeBuild.stage.toUpperCase()} · REV {activeBuild.revision}</small>
            </div>
            <div className="vt-pipeline-build__stats">
              <span><b>{readiness.assetCount}</b> ASSETS</span>
              <span><b>{readiness.selectedCount}</b> SELECTED</span>
              <span><b>{readiness.finalCount}</b> FINAL</span>
              <span><b>{readiness.blockerCount}</b> BLOCKERS</span>
            </div>
          </div>
        ) : (
          <div className="vt-pipeline-focus">
            <span>NEXT QUEUE</span>
            <strong>{data.todayTasks[0]?.text || "NO TASK SCHEDULED"}</strong>
          </div>
        )}

        <div className="vt-pipeline-actions">
          <WidgetSizedButton height={32} tone="primary" textFit="adaptive" onClick={() => onNavigate?.("/projects")}>
            OPEN PROJECTS
          </WidgetSizedButton>
          <WidgetSizedButton height={32} tone="default" textFit="adaptive" onClick={() => onNavigate?.("/studio")}>
            OPEN ASSET ENGINE
          </WidgetSizedButton>
        </div>
      </div>
    </WidgetShell>
  )
}
