import {
 DASHBOARD_WIDGET_REGISTRY,
 WIDGET_DESCRIPTIONS,
} from "../../views/dashboard/WidgetRegistry"

export interface GuideWidgetDefinition {
 id: string
 title: string
 subtitle: string
 category: string
 status: string
 releaseTier: string
 dependency: readonly string[]
 defaultVisible: boolean
 shortDescription: string
 detailedDescription: string
}

export const GUIDE_WIDGETS: readonly GuideWidgetDefinition[] = Object.freeze(
 DASHBOARD_WIDGET_REGISTRY.map((widget) => {
  const descriptions = WIDGET_DESCRIPTIONS[widget.id]
  return {
   id: widget.id,
   title: widget.title,
   subtitle: widget.subtitle,
   category: widget.category,
   status: widget.status,
   releaseTier: widget.releaseTier,
   dependency: widget.dependency,
   defaultVisible: widget.defaultVisible,
   shortDescription: descriptions?.short || widget.subtitle,
   detailedDescription: descriptions?.detailed || widget.subtitle,
  }
 }),
)

export const guideWidgetById = (id: string) =>
 GUIDE_WIDGETS.find((widget) => widget.id === id) ?? null
