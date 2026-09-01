import React, { useMemo } from "react"
import { CalendarDays, Circle, CheckCircle2 } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import { WidgetSection, WidgetBadge, WidgetScrollArea } from "../WidgetPrimitives"

/**
 * MiniCalendarWidget (BETA rebuild)
 *
 * Two-week grid of daily cells + a checklist of today's tasks below.
 * Cells derive their palette from --widget-color / --widget-border via
 * data attributes → no hardcoded hex, no toolbox-2 tokens.
 *
 * Data sources (all optional):
 *   • data.upcomingDays: Array<{ date: Date, dateStr: string, isToday: bool,
 *     tasks: Array<{text: string, completed: bool}> }>
 *   • data.todayTasks: same task shape
 */

type UpcomingDay = {
  date: Date
  dateStr: string
  isToday?: boolean
  tasks?: Array<{ text: string; completed?: boolean }>
}

export const MiniCalendarWidget: React.FC<any> = ({ data, ...props }) => {
  const common = { ...props, canEdit: true }
  const days: UpcomingDay[] = data?.upcomingDays || []
  const todayTasks: Array<{ text: string; completed?: boolean }> = data?.todayTasks || []
  const weeks = useMemo(() => {
    const rows: UpcomingDay[][] = []
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7))
    return rows
  }, [days])

  return (
    <WidgetShell
      {...common}
      icon={<CalendarDays size={22} />}
      headerContent={<WidgetBadge slot={7}>BETA</WidgetBadge>}
    >
      <div className="widget-workspace mini-calendar-workspace">
        <WidgetSection surface="subtle" className="mini-calendar-grid-panel">
          {weeks.length === 0 ? (
            <div className="mini-calendar-empty">Awaiting upcoming days.</div>
          ) : weeks.map((row, wi) => (
            <div key={"wk-" + wi} className="mini-calendar-row">
              {row.map((d) => {
                const state = d.isToday ? "today" : (d.tasks?.length ? "tasks" : "idle")
                return (
                  <div key={d.dateStr} className="mini-calendar-cell" data-state={state}>
                    <span className="mini-calendar-cell-num">{d.date.getDate()}</span>
                    {d.tasks && d.tasks.length > 0 && (
                      <span className="mini-calendar-cell-dot" aria-hidden="true" />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </WidgetSection>

        <div className="mini-calendar-checklist-head">Today · {todayTasks.length}</div>
        <WidgetScrollArea ariaLabel="Today's tasks" contentClassName="mini-calendar-checklist">
          {(todayTasks.length > 0 ? todayTasks : [{ text: "No tasks for today", completed: false }]).slice(0, 6).map((task, i) => (
            <div key={i} className={`mini-calendar-task ${task.completed ? "is-done" : ""}`}>
              {task.completed ? <CheckCircle2 size={12} /> : <Circle size={12} />}
              <span>{task.text}</span>
            </div>
          ))}
        </WidgetScrollArea>
      </div>
    </WidgetShell>
  )
}
