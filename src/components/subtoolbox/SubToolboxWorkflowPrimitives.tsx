import React from "react"
import type { ToolboxControlLevel } from "./tokens"
import { getComponentLevelCssVars } from "./tokens"
import "../../styles/subtoolbox-workflow-primitives.css"

const classes = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ")
const levelStyle = (level: ToolboxControlLevel, style?: React.CSSProperties) =>
  ({ ...getComponentLevelCssVars(level), ...style } as React.CSSProperties)

export type SubToolboxSectionBandTone = "primary" | "secondary" | "tertiary"
export interface SubToolboxSectionBandProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  tone?: SubToolboxSectionBandTone
  label: React.ReactNode
}
export const SubToolboxSectionBand: React.FC<SubToolboxSectionBandProps> = ({
  level = "l1", tone = "primary", label, className, style, ...props
}) => (
  <div
    className={classes("vt-workflow-section-band", `is-${tone}`, className)}
    data-vt-control-level={level}
    style={levelStyle(level, style)}
    {...props}
  >
    <strong>{label}</strong>
  </div>
)

export interface SubToolboxTextBadgeGridColumn<T extends Record<string, React.ReactNode>> {
  key: keyof T
  label: React.ReactNode
  minWidth?: number
}
export interface SubToolboxTextBadgeGridProps<T extends Record<string, React.ReactNode>> extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  columns: SubToolboxTextBadgeGridColumn<T>[]
  rows: T[]
  getRowKey?: (row: T, index: number) => React.Key
}
export const SubToolboxTextBadgeGrid = <T extends Record<string, React.ReactNode>,>({
  level = "l1", columns, rows, getRowKey, className, style, ...props
}: SubToolboxTextBadgeGridProps<T>) => (
  <div className={classes("vt-workflow-data-grid-wrap", className)} data-vt-control-level={level} style={levelStyle(level, style)} {...props}>
    <table className="vt-workflow-data-grid">
      <thead><tr>{columns.map((column) => <th key={String(column.key)} style={column.minWidth ? { minWidth: column.minWidth } : undefined}>{column.label}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => (
        <tr key={getRowKey?.(row, index) ?? index}>
          {columns.map((column) => <td key={String(column.key)}>{row[column.key]}</td>)}
        </tr>
      ))}</tbody>
    </table>
  </div>
)

export type WorkflowBadgeTone = "danger" | "warning" | "info" | "success" | "accent"
export interface SubToolboxChecklistItem {
  id: string
  title: React.ReactNode
  detail?: React.ReactNode
  badge?: React.ReactNode
  badgeTone?: WorkflowBadgeTone
  checked?: boolean
}
export interface SubToolboxInteractiveChecklistProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  level?: ToolboxControlLevel
  items: SubToolboxChecklistItem[]
  checkedIds?: string[]
  onCheckedIdsChange?: (ids: string[]) => void
  progressLabel?: React.ReactNode
}
export const SubToolboxInteractiveChecklistProgress: React.FC<SubToolboxInteractiveChecklistProgressProps> = ({
  level = "l1", items, checkedIds, onCheckedIdsChange, progressLabel = "COMPLETION", className, style, ...props
}) => {
  const initial = React.useMemo(() => items.filter((item) => item.checked).map((item) => item.id), [items])
  const [internal, setInternal] = React.useState(initial)
  const active = checkedIds ?? internal
  const activeSet = new Set(active)
  const pct = items.length ? Math.round(activeSet.size / items.length * 100) : 0
  const toggle = (id: string) => {
    const next = activeSet.has(id) ? active.filter((value) => value !== id) : [...active, id]
    if (checkedIds === undefined) setInternal(next)
    onCheckedIdsChange?.(next)
  }
  return (
    <div className={classes("vt-workflow-checklist", className)} data-vt-control-level={level} style={levelStyle(level, style)} {...props}>
      <div className="vt-workflow-checklist-rows">
        {items.map((item) => {
          const checked = activeSet.has(item.id)
          return (
            <div className={classes("vt-workflow-checklist-row", checked && "is-checked")} key={item.id}>
              <button type="button" className="vt-workflow-check" aria-pressed={checked} aria-label={`${checked ? "Uncheck" : "Check"} task`} onClick={() => toggle(item.id)}><span aria-hidden="true" /></button>
              <div className="vt-workflow-check-copy"><strong>{item.title}</strong>{item.detail ? <small>{item.detail}</small> : null}</div>
              {item.badge ? <span className={classes("vt-workflow-badge", `is-${item.badgeTone ?? "accent"}`)}>{item.badge}</span> : null}
            </div>
          )
        })}
      </div>
      <div className="vt-workflow-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <span className="vt-workflow-progress-fill" style={{ width: `${pct}%` }} />
        <strong>{progressLabel}</strong><output>{pct}%</output>
      </div>
    </div>
  )
}

export interface SubToolboxProductionPlannerItem {
  id: string
  label: React.ReactNode
  tone?: WorkflowBadgeTone
}
export interface SubToolboxProductionPlannerDay {
  id: string
  label: React.ReactNode
  items?: SubToolboxProductionPlannerItem[]
}
export interface SubToolboxProductionPlannerGridProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: ToolboxControlLevel
  days: SubToolboxProductionPlannerDay[]
}
export const SubToolboxProductionPlannerGrid: React.FC<SubToolboxProductionPlannerGridProps> = ({
  level = "l1", days, className, style, ...props
}) => (
  <div className={classes("vt-workflow-calendar", className)} data-vt-control-level={level} style={levelStyle(level, style)} {...props}>
    {days.map((day) => (
      <section className="vt-workflow-calendar-day" key={day.id}>
        <header>{day.label}</header>
        <div className="vt-workflow-calendar-items">
          {(day.items ?? []).map((item) => <span key={item.id} className={classes("vt-workflow-calendar-chip", `is-${item.tone ?? "accent"}`)}>{item.label}</span>)}
        </div>
      </section>
    ))}
  </div>
)
