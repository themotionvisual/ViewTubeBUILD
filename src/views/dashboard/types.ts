export type DashboardSizeBucket = "full" | "half" | "third" | "quarter"

export type DashboardWidgetCategory =
  | "core"
  | "analytics"
  | "ai"
  | "system"
  | "community"

export type WidgetDependency =
  | "youtube_data_v3"
  | "youtube_analytics_v2"
  | "google_search_console"
  | "csv"
  | "google_sheets"
  | "none"

export interface WidgetDefinition {
  id: string
  title: string
  subtitle: string
  category: DashboardWidgetCategory
  defaultSize: DashboardSizeBucket
  minSize: DashboardSizeBucket
  maxSize: DashboardSizeBucket
  headerColor: string
  iconRailColor: string
  dependency: WidgetDependency[]
  status: "ready" | "prototype" | "needs-backend"
}

export interface WidgetInstanceState {
  collapsed: boolean
  size: DashboardSizeBucket
  pinned: boolean
  focus: boolean
}

export interface DashboardLayoutState {
  schemaVersion: number
  locked: boolean
  order: string[]
  hidden: string[]
  instances: Record<string, WidgetInstanceState>
}

export interface WidgetRenderCallbacks {
  onToggleCollapse: (widgetId: string) => void
  onCycleSize: (widgetId: string) => void
  onRemoveWidget: (widgetId: string) => void
}
