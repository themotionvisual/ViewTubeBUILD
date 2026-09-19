export const WIDGET_PRIMITIVE_SIZES = [18, 24, 32, 38] as const
export type WidgetPrimitiveSize = (typeof WIDGET_PRIMITIVE_SIZES)[number]

export const WIDGET_PRIMITIVE_TONES = ["default", "primary", "secondary"] as const
export type WidgetPrimitiveTone = (typeof WIDGET_PRIMITIVE_TONES)[number]

export const WIDGET_PRIMITIVE_STATES = ["default", "selected", "active", "loading", "disabled", "success", "warning", "danger", "info"] as const
export type WidgetPrimitiveState = (typeof WIDGET_PRIMITIVE_STATES)[number]

export type WidgetPrimitiveShape = "control" | "square" | "round" | "pill"
export type WidgetPrimitiveWidth = "auto" | "full"

export interface WidgetPrimitiveOptions {
  size?: WidgetPrimitiveSize
  tone?: WidgetPrimitiveTone
  state?: WidgetPrimitiveState
  shape?: WidgetPrimitiveShape
  width?: WidgetPrimitiveWidth
  interactive?: boolean
}

export const WIDGET_PRIMITIVE_SIZE_TOKENS = {
  18: { height: 18, font: 8, radius: 2, stroke: 0, shadow: 0, paddingX: 4, gap: 2, icon: 12, iconStroke: 2 },
  24: { height: 24, font: 16, radius: 3, stroke: 2, shadow: 2, paddingX: 6, gap: 4, icon: 18, iconStroke: 2.25 },
  32: { height: 32, font: 21, radius: 4, stroke: 2, shadow: 3, paddingX: 8, gap: 4, icon: 24, iconStroke: 2.5 },
  38: { height: 38, font: 26, radius: 6, stroke: 2, shadow: 4, paddingX: 12, gap: 6, icon: 29, iconStroke: 2.75 },
} as const

export function widgetPrimitiveClasses({ size=32, tone="default", state="default", shape="control", width="auto", interactive=false }: WidgetPrimitiveOptions = {}) {
  return ["vt-primitive", `vt-size-${size}`, `vt-tone-${tone}`, `vt-shape-${shape}`, width === "full" && "vt-width-full", state !== "default" && `vt-state-${state}`, interactive && "vt-interactive"].filter(Boolean).join(" ")
}

export function widgetSizedControlClasses(\n  size: WidgetPrimitiveSize = 32,\n  tone: WidgetPrimitiveTone = "default",\n  textFit: WidgetPrimitiveTextFit = "fixed",\n) {\n  return `${widgetPrimitiveClasses({ size, tone })} vt-sized-control is-height-${size} is-tone-${tone}${textFit === "adaptive" ? " vt-text-fit-adaptive" : ""}`\n}
