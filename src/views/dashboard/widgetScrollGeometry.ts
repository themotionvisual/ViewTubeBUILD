export interface WidgetViewportSegmentInput {
  clientHeight: number
  scrollHeight: number
  scrollTop: number
  controllerHeight: number
}

export interface WidgetViewportSegment {
  top: number
  height: number
  visibleRatio: number
  scrollRatio: number
  hasOverflow: boolean
}

export const resolveWidgetViewportSegment = ({
  clientHeight,
  scrollHeight,
  scrollTop,
  controllerHeight,
}: WidgetViewportSegmentInput): WidgetViewportSegment => {
  const safeClientHeight = Math.max(0, clientHeight)
  const safeScrollHeight = Math.max(safeClientHeight, scrollHeight)
  const safeControllerHeight = Math.max(0, controllerHeight)
  const hasOverflow = safeScrollHeight > safeClientHeight + 1
  const visibleRatio = safeScrollHeight > 0
    ? Math.min(1, safeClientHeight / safeScrollHeight)
    : 1
  const scrollRange = Math.max(0, safeScrollHeight - safeClientHeight)
  const scrollRatio = scrollRange > 0
    ? Math.min(1, Math.max(0, scrollTop / scrollRange))
    : 0
  const height = safeControllerHeight * visibleRatio
  const top = Math.max(0, safeControllerHeight - height) * scrollRatio

  return { top, height, visibleRatio, scrollRatio, hasOverflow }
}
