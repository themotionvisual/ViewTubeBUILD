export type WidgetInstrumentArchetype =
  | "radar"
  | "ooda"
  | "launch"
  | "lens"
  | "conversation"
  | "flow"
  | "console"
  | "timeline"
  | "comparison"
  | "forge"

export interface WidgetInstrumentStage {
  id: string
  label: string
  detail?: string
  state?: "idle" | "active" | "complete" | "warning" | "blocked"
}

export interface WidgetInstrumentSignal {
  id: string
  label: string
  value: string
  direction?: "up" | "down" | "neutral"
  intensity?: number
}

export interface WidgetInstrumentDefinition {
  widgetId: string
  archetype: WidgetInstrumentArchetype
  metaphor: string
  primaryObject: string
  primaryAction: string
  purpose: string
  inputs: readonly string[]
  process: string
  result: string
}
