export interface DashboardInteractionState {
  editMode: boolean
  locked: boolean
}

export interface DashboardInteractionPermissions {
  canEdit: boolean
  canReorder: boolean
  /** Per-widget resize is unlocked whenever the layout itself is unlocked —
   *  independent of the global edit mode. Rearrange mode is still gated on
   *  editMode because it changes multi-widget ordering. */
  canResize: boolean
}

export const getDashboardInteractionPermissions = ({
  editMode,
  locked,
}: DashboardInteractionState): DashboardInteractionPermissions => ({
  canEdit: editMode && !locked,
  canReorder: !locked,
  canResize: !locked,
})

export interface DashboardEdgeScrollState {
  pointerY: number
  viewportHeight: number
  scrollTop: number
  scrollHeight: number
  edgeSize?: number
  maxStep?: number
}

export const DASHBOARD_DRAG_EDGE_SIZE = 96
export const DASHBOARD_DRAG_MAX_SCROLL_STEP = 22

export const getDashboardEdgeScrollDelta = ({
  pointerY,
  viewportHeight,
  scrollTop,
  scrollHeight,
  edgeSize = DASHBOARD_DRAG_EDGE_SIZE,
  maxStep = DASHBOARD_DRAG_MAX_SCROLL_STEP,
}: DashboardEdgeScrollState): number => {
  const safeViewportHeight = Math.max(0, viewportHeight)
  const safeEdgeSize = Math.min(Math.max(1, edgeSize), safeViewportHeight / 2 || 1)
  const maxScrollTop = Math.max(0, scrollHeight - safeViewportHeight)

  if (pointerY < safeEdgeSize && scrollTop > 0) {
    const intensity = Math.min(1, Math.max(0, (safeEdgeSize - pointerY) / safeEdgeSize))
    return -Math.min(scrollTop, Math.max(1, Math.ceil(maxStep * intensity)))
  }

  if (pointerY > safeViewportHeight - safeEdgeSize && scrollTop < maxScrollTop) {
    const intensity = Math.min(1, Math.max(0, (pointerY - (safeViewportHeight - safeEdgeSize)) / safeEdgeSize))
    return Math.min(maxScrollTop - scrollTop, Math.max(1, Math.ceil(maxStep * intensity)))
  }

  return 0
}
