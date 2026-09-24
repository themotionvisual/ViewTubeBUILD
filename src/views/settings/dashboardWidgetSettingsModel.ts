import type {
  DashboardWidgetCategory,
  WidgetDefinition,
} from "../dashboard/types"

export type DashboardWidgetSettingsCategory = "all" | DashboardWidgetCategory

export type DashboardWidgetSettingsEntry = Pick<
  WidgetDefinition,
  | "id"
  | "title"
  | "subtitle"
  | "category"
  | "releaseTier"
  | "status"
  | "defaultOrder"
  | "headerColor"
>

const DASHBOARD_WIDGET_SIGNATURE_LABELS: Readonly<Record<string, string>> = {
  "daily-oracle": "Creator Command Focus Console",
  "next-best-action": "Decision Junction",
  "opportunity-radar": "Opportunity Compass",
  "anomaly-radar": "Anomaly Scope",
  "content-pipeline": "Content Lifecycle Rail",
  "audience-requests": "Audience Request Cluster Map",
  "flight-check": "Publishing Command Launch Gantry",
  "video-asset-engine": "Package Composer",
  "brain-hub": "Brain Intelligence Nexus",
}

export const getDashboardWidgetSignatureLabel = (widgetId: string): string | null =>
  DASHBOARD_WIDGET_SIGNATURE_LABELS[widgetId] ?? null

export const DASHBOARD_WIDGET_SETTINGS_CATEGORIES: ReadonlyArray<{
  id: DashboardWidgetSettingsCategory
  label: string
}> = [
  { id: "all", label: "All" },
  { id: "core", label: "Core" },
  { id: "analytics", label: "Analytics" },
  { id: "ai", label: "AI" },
  { id: "creation", label: "Creation" },
  { id: "community", label: "Community" },
  { id: "system", label: "System" },
]

export const getManageableDashboardWidgets = (
  widgets: readonly DashboardWidgetSettingsEntry[],
): DashboardWidgetSettingsEntry[] =>
  [...widgets]
    .filter((widget) => widget.releaseTier !== "hidden")
    .sort((left, right) => left.defaultOrder - right.defaultOrder)

export const filterDashboardWidgetSettings = (
  widgets: readonly DashboardWidgetSettingsEntry[],
  category: DashboardWidgetSettingsCategory,
  query: string,
): DashboardWidgetSettingsEntry[] => {
  const needle = query.trim().toLowerCase()
  return widgets
    .filter((widget) => category === "all" || widget.category === category)
    .filter(
      (widget) =>
        !needle ||
        `${widget.title} ${widget.subtitle} ${widget.category}`.toLowerCase().includes(needle),
    )
}

export const summarizeDashboardWidgetVisibility = (
  widgets: readonly DashboardWidgetSettingsEntry[],
  hidden: readonly string[],
) => {
  const hiddenSet = new Set(hidden)
  return {
    total: widgets.length,
    visible: widgets.filter((widget) => !hiddenSet.has(widget.id)).length,
    preview: widgets.filter((widget) => widget.status !== "ready").length,
  }
}
