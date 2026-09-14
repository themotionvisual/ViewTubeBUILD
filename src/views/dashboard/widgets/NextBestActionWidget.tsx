import React, { useMemo } from "react"
import { Sparkles } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import type { DashboardData } from "../useDashboardData"
import type { CommonWidgetProps } from "../types"

export const NextBestActionWidget: React.FC<CommonWidgetProps & { data: DashboardData; onNavigate?: (to: string) => void }> = ({ data, onNavigate, ...common }) => {
  const action = useMemo(() => {
    const rows = data.canonicalRows || []
    if (!rows.length) return { priority: "CONNECT DATA", title: "Sync or import channel data", reason: "ViewTube needs a canonical dataset before it can rank a creator action.", route: "/analytics" }
    const latest = rows.slice().sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0]
    const views = Number(latest?.metrics?.views?.value ?? latest?.views ?? 0)
    const avg = rows.reduce((sum, row) => sum + Number(row?.metrics?.views?.value ?? row?.views ?? 0), 0) / Math.max(rows.length, 1)
    if (views < avg * 0.7) return { priority: "HIGH PRIORITY", title: "Repackage your latest upload", reason: `${latest?.title || "Latest upload"} is tracking below the catalog view baseline. Review its title and thumbnail promise first.`, route: "/studio" }
    if ((data.todayTasks || []).length) return { priority: "TODAY", title: "Clear the next production task", reason: `${data.todayTasks.length} scheduled task${data.todayTasks.length === 1 ? " is" : "s are"} ready. Keep the publishing pipeline moving before adding another idea.`, route: "/projects" }
    return { priority: "OPPORTUNITY", title: "Build a follow-up to the current winner", reason: `Use ${data.topPerformer?.title || "your top performer"} as the evidence base for the next topic, hook, and packaging direction.`, route: "/projects" }
  }, [data.canonicalRows, data.todayTasks, data.topPerformer])

  return (
    <WidgetShell {...common} icon={<Sparkles size={22} />}>
      <div className="vt-new-widget vt-next-action">
        <div className="vt-next-action__priority">{action.priority}</div>
        <div className="vt-next-action__title">{action.title}</div>
        <p className="vt-next-action__reason">{action.reason}</p>
        <div className="vt-next-action__evidence"><span>CANONICAL ROWS</span><strong>{data.canonicalRows.length}</strong><span>ACTIVE TASKS</span><strong>{data.todayTasks.length}</strong></div>
        <button className="vt-new-widget__action" type="button" onClick={() => onNavigate?.(action.route)}>TAKE ACTION</button>
      </div>
    </WidgetShell>
  )
}
