import React, { useMemo } from "react"
import { Workflow } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"

const STAGES = ["IDEA", "BUILD", "READY", "PUBLISHED"] as const

export const ContentPipelineWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ data, onNavigate, ...common }) => {
  const counts = useMemo(() => {
    const result = [0, 0, 0, 0]
    result[3] = (data.recentUploads || []).length
    result[2] = (data.upcomingDays || []).reduce((sum, day) => sum + (day.tasks?.length || 0), 0)
    result[1] = (data.todayTasks || []).length
    const brainIdeas = (data.brain as any)?.ideas || (data.brain as any)?.ideaBank || []
    result[0] = Array.isArray(brainIdeas) ? brainIdeas.length : 0
    return result
  }, [data.brain, data.recentUploads, data.todayTasks, data.upcomingDays])

  return (
    <WidgetShell {...common} icon={<Workflow size={22} />}>
      <div className="vt-new-widget vt-content-pipeline">
        <div className="vt-pipeline-stages">
          {STAGES.map((stage, index) => <div className="vt-pipeline-stage" key={stage}>
            <div className="vt-pipeline-stage__count">{counts[index]}</div>
            <div className="vt-pipeline-stage__label">{stage}</div>
            {index < STAGES.length - 1 ? <span className="vt-pipeline-stage__arrow">→</span> : null}
          </div>)}
        </div>
        <div className="vt-pipeline-focus"><span>NEXT QUEUE</span><strong>{data.todayTasks[0]?.text || "NO TASK SCHEDULED"}</strong></div>
        <button className="vt-new-widget__action" type="button" onClick={() => onNavigate?.("/project-calendar")}>OPEN PROJECTS</button>
      </div>
    </WidgetShell>
  )
}
