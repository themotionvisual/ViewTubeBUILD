export type DashboardSizeBucket = "full" | "half" | "third" | "quarter"
export type DashboardHeightBucket = "short" | "medium" | "tall" | "xtall"

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
  defaultHeight: DashboardHeightBucket
  minHeight: DashboardHeightBucket
  maxHeight: DashboardHeightBucket
  headerColor: string
  iconRailColor: string
  dependency: WidgetDependency[]
  status: "ready" | "prototype" | "needs-backend"
}

export interface WidgetInstanceState {
  collapsed: boolean
  size: DashboardSizeBucket
  height: DashboardHeightBucket
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
  onCycleHeight: (widgetId: string) => void
  onRemoveWidget: (widgetId: string) => void
}
