import { DASHBOARD_WIDGET_BY_ID } from "./WidgetRegistry"
import type { DashboardLayoutState, DashboardSizeBucket, WidgetInstanceState } from "./types"

export const DASHBOARD_MINI_GRID_COLUMNS = 24

const DASHBOARD_SIZE_COLUMN_SPANS: Record<DashboardSizeBucket, number> = {
  eighth: 3,
  sixth: 4,
  quarter: 6,
  companion: 7,
  third: 8,
  between: 10,
  half: 12,
  "two-thirds": 16,
  "three-quarters": 18,
  full: 24,
}

export type DashboardMoveDirection = "up" | "right" | "left" | "down"
export type DashboardResizeDirection = "wider" | "thinner" | "taller" | "shorter"
export type DashboardVisibilityChanges = Readonly<Record<string, boolean>>

export interface DashboardMiniPlacement {
  widgetId: string
  row: number
  columnStart: number
  columnSpan: number
  center: number
}

export interface DashboardMiniLayoutGeometry {
  rows: DashboardMiniPlacement[][]
  placements: DashboardMiniPlacement[]
  byWidgetId: Record<string, DashboardMiniPlacement>
}

export const dashboardSizeColumnSpan = (size: DashboardSizeBucket): number =>
  DASHBOARD_SIZE_COLUMN_SPANS[size]

export const applyDashboardVisibilityChanges = (
  layout: DashboardLayoutState,
  changes: DashboardVisibilityChanges,
): DashboardLayoutState => {
  const currentHidden = new Set(layout.hidden)
  const nextHidden = layout.order.filter((widgetId) =>
    changes[widgetId] ?? currentHidden.has(widgetId))
  const unchanged = nextHidden.length === layout.hidden.length
    && nextHidden.every((widgetId, index) => widgetId === layout.hidden[index])

  return unchanged ? layout : { ...layout, hidden: nextHidden }
}

export const buildDashboardMiniLayout = (
  layout: DashboardLayoutState,
): DashboardMiniLayoutGeometry => {
  const hidden = new Set(layout.hidden)
  const rows: DashboardMiniPlacement[][] = []
  const placements: DashboardMiniPlacement[] = []
  const byWidgetId: Record<string, DashboardMiniPlacement> = {}
  let row = 0
  let columnStart = 0

  for (const widgetId of layout.order) {
    const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
    if (!widget || hidden.has(widgetId)) continue

    const size = layout.instances[widgetId]?.size || widget.defaultSize
    const columnSpan = dashboardSizeColumnSpan(size)
    if (columnStart > 0 && columnStart + columnSpan > DASHBOARD_MINI_GRID_COLUMNS) {
      row += 1
      columnStart = 0
    }

    const placement: DashboardMiniPlacement = {
      widgetId,
      row,
      columnStart,
      columnSpan,
      center: columnStart + columnSpan / 2,
    }
    rows[row] ||= []
    rows[row].push(placement)
    placements.push(placement)
    byWidgetId[widgetId] = placement

    columnStart += columnSpan
    if (columnStart === DASHBOARD_MINI_GRID_COLUMNS) {
      row += 1
      columnStart = 0
    }
  }

  return { rows, placements, byWidgetId }
}

export const getDashboardMoveTarget = (
  layout: DashboardLayoutState,
  widgetId: string,
  direction: DashboardMoveDirection,
): string | null => {
  if (layout.locked) return null
  const geometry = buildDashboardMiniLayout(layout)
  const source = geometry.byWidgetId[widgetId]
  if (!source) return null
  const sourceRow = geometry.rows[source.row] || []
  const sourceIndex = sourceRow.findIndex((placement) => placement.widgetId === widgetId)

  if (direction === "left") return sourceRow[sourceIndex - 1]?.widgetId || null
  if (direction === "right") return sourceRow[sourceIndex + 1]?.widgetId || null

  const targetRowIndex = direction === "up" ? source.row - 1 : source.row + 1
  const targetRow = geometry.rows[targetRowIndex]
  if (!targetRow?.length) return null

  return targetRow.reduce((nearest, candidate) => {
    const nearestDistance = Math.abs(nearest.center - source.center)
    const candidateDistance = Math.abs(candidate.center - source.center)
    return candidateDistance < nearestDistance ? candidate : nearest
  }).widgetId
}

export const moveDashboardWidgetOrder = (
  layout: DashboardLayoutState,
  widgetId: string,
  direction: DashboardMoveDirection,
): string[] => {
  const targetId = getDashboardMoveTarget(layout, widgetId, direction)
  if (!targetId) return layout.order

  const hidden = new Set(layout.hidden)
  const visibleOrder = layout.order.filter((id) => !hidden.has(id))
  const hiddenOrder = layout.order.filter((id) => hidden.has(id))
  const sourceIndex = visibleOrder.indexOf(widgetId)
  const targetIndex = visibleOrder.indexOf(targetId)
  if (sourceIndex < 0 || targetIndex < 0) return layout.order

  const nextVisibleOrder = [...visibleOrder]
  ;[nextVisibleOrder[sourceIndex], nextVisibleOrder[targetIndex]] = [
    nextVisibleOrder[targetIndex],
    nextVisibleOrder[sourceIndex],
  ]
  return [...nextVisibleOrder, ...hiddenOrder]
}

export const getDashboardResizedInstance = (
  widgetId: string,
  instance: WidgetInstanceState,
  direction: DashboardResizeDirection,
): WidgetInstanceState => {
  const widget = DASHBOARD_WIDGET_BY_ID[widgetId]
  if (!widget) return instance

  if (direction === "wider" || direction === "thinner") {
    const currentIndex = widget.supportedSizes.indexOf(instance.size)
    const nextIndex = currentIndex + (direction === "wider" ? 1 : -1)
    const size = widget.supportedSizes[nextIndex]
    return size ? { ...instance, size } : instance
  }

  const currentIndex = widget.supportedHeights.indexOf(instance.height)
  const nextIndex = currentIndex + (direction === "taller" ? 1 : -1)
  const height = widget.supportedHeights[nextIndex]
  return height ? { ...instance, height } : instance
}

export const canResizeDashboardWidget = (
  widgetId: string,
  instance: WidgetInstanceState,
  direction: DashboardResizeDirection,
): boolean => getDashboardResizedInstance(widgetId, instance, direction) !== instance
