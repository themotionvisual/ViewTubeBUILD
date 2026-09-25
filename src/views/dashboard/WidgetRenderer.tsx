import React from "react"
import type { DashboardData } from "./useDashboardData"
import type { WidgetDefinition, WidgetInstanceState, WidgetRenderCallbacks } from "./types"
import { WidgetRenderer as BaseWidgetRenderer, DASHBOARD_WIDGET_RENDERER_KEYS as BASE_RENDERER_KEYS } from "./WidgetRendererBase"
import { NEW_WIDGET_RENDERERS, NEW_WIDGET_IDS } from "./widgets/newWidgetSet"

export const DASHBOARD_WIDGET_RENDERER_KEYS = new Set<string>([...BASE_RENDERER_KEYS, ...NEW_WIDGET_IDS])

interface WidgetRendererProps extends WidgetRenderCallbacks {
 widget: WidgetDefinition
 instance: WidgetInstanceState
 editMode: boolean
 canEdit: boolean
 data: DashboardData
 onNavigate: (to: string) => void
 dashboardControls?: unknown
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = (props) => {
 const NewRenderer = NEW_WIDGET_RENDERERS[props.widget.rendererKey]
 if (!NewRenderer) return <BaseWidgetRenderer {...props} />

 const common = {
  widget: props.widget,
  instance: props.instance,
  editMode: props.editMode,
  canEdit: props.canEdit,
  onToggleCollapse: () => props.onToggleCollapse(props.widget.id),
  onCycleSize: () => props.onCycleSize(props.widget.id),
  onDecSize: () => props.onDecSize(props.widget.id),
  onCycleHeight: () => props.onCycleHeight(props.widget.id),
  onDecHeight: () => props.onDecHeight(props.widget.id),
  onRemove: () => props.onRemoveWidget(props.widget.id),
  onMoveUp: () => props.onMoveWidgetUp(props.widget.id),
  onMoveDown: () => props.onMoveWidgetDown(props.widget.id),
 }

 return <NewRenderer {...common} data={props.data} onNavigate={props.onNavigate} />
}
