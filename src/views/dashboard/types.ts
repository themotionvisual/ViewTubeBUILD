export type DashboardSizeBucket = "full" | "three-quarters" | "two-thirds" | "half" | "between" | "third" | "companion" | "quarter"
export type DashboardHeightBucket = "short" | "medium" | "tall" | "xtall" | "massive"

export type DashboardWidgetCategory =
  | "core"
  | "analytics"
  | "ai"
  | "system"
  | "community"
  | "creation"

export type DashboardWidgetReleaseTier = "supported" | "preview" | "hidden"
export type DashboardWidgetResponsiveMode = "container" | "legacy"
export type DashboardWidgetDataStatus = "loading" | "ready" | "empty" | "blocked" | "stale" | "error"

export type WidgetDependency =
  | "youtube_data_v3"
  | "youtube_analytics_v2"
  | "google_search_console"
  | "csv"
  | "google_sheets"
  | "gemini_api"
  | "none"

export interface WidgetDefinitionBase {
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

export interface WidgetDefinition extends WidgetDefinitionBase {
  rendererKey: string
  releaseTier: DashboardWidgetReleaseTier
  defaultVisible: boolean
  defaultOrder: number
  supportedSizes: readonly DashboardSizeBucket[]
  supportedHeights: readonly DashboardHeightBucket[]
  supportedDimensions: readonly Readonly<{
    size: DashboardSizeBucket
    height: DashboardHeightBucket
  }>[]
  responsiveMode: DashboardWidgetResponsiveMode
}

export interface WidgetInstanceState {
  collapsed: boolean
  size: DashboardSizeBucket
  height: DashboardHeightBucket
}

export interface WidgetDataState<T> {
  status: DashboardWidgetDataStatus
  data: T | null
  provenance?: string
  updatedAt?: string | null
  message?: string
  recoveryAction?: string
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
  onDecSize: (widgetId: string) => void
  onCycleHeight: (widgetId: string) => void
  onDecHeight: (widgetId: string) => void
  onRemoveWidget: (widgetId: string) => void
}

export interface CommonWidgetProps {
  widget: WidgetDefinition
  instance: WidgetInstanceState
  editMode: boolean
  canEdit: boolean
  onToggleCollapse: () => void
  onCycleSize: () => void
  onDecSize: () => void
  onCycleHeight: () => void
  onDecHeight: () => void
  onRemove: () => void
}
