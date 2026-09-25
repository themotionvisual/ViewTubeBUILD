export type DashboardPresetId = "focus" | "creation" | "analytics" | "all"

export interface DashboardPresetWidget {
  id: string
  category: string
}

const FOCUS_WIDGET_IDS = new Set([
  "kpi-cluster",
  "daily-oracle",
  "channel-progress",
  "content-pipeline",
  "system-micro-stack",
  "quick-actions",
  "realtime-performance",
  "consistency-heatmap",
])

export const resolveDashboardPresetVisibleIds = (
  widgets: readonly DashboardPresetWidget[],
  preset: DashboardPresetId,
): string[] => {
  if (preset === "all") return widgets.map((widget) => widget.id)

  if (preset === "focus") {
    return widgets
      .filter((widget) => FOCUS_WIDGET_IDS.has(widget.id))
      .map((widget) => widget.id)
  }

  return widgets
    .filter((widget) => widget.category === preset || widget.id === "system-micro-stack")
    .map((widget) => widget.id)
}
