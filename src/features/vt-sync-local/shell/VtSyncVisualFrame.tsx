import React from "react"
import { AnalyticsVisualStyleProvider } from "../../../components/AnalyticsVisualStyleContext"
import type { ControllerRow } from "../../../components/VisualModuleController"
import type { TubeExplorerVisualProps } from "../../../components/TubeExplorerVisualModules"
import { VtSyncVisualDataSourceProvider } from "./VtSyncVisualDataSourceContext"

export type VtSyncVisualControlSpec = {
 id: string
 label: string
 kind: "count" | "select" | "toggle" | "metricMultiSelect"
}

export type VtSyncVisualCanvasFitMode = "balanced" | "fillWidth" | "preserveRatio"

export type VtSyncVisualShellMode = "standard" | "vt2-preserved" | "compact-row"

export type VtSyncVisualHeightPolicy = "fixedBody" | "fillWidth" | "preserveRatio" | "compact"

export type VtSyncVisualHeaderColorPair = {
 icon: string
 title: string
}

export type VtSyncVisualControllerColors = {
 previous: string
 middle: string
 next: string
}

export type VtSyncLegendSpec = {
 label: string
 color: string
}

export type VtSyncVisualProps = TubeExplorerVisualProps

export type VtSyncVisualModuleSpec = {
 id: string
 sourceTableIds: readonly string[]
 iconKey?: string
 headerColorPair?: VtSyncVisualHeaderColorPair
 controllerColors?: VtSyncVisualControllerColors
 activeMetricKeys?: readonly string[]
 dimensionKeys?: readonly string[]
 controllerExplanation?: string
 controllerSpec: {
  rows: readonly ControllerRow[]
  width?: number
  density?: "normal" | "compact"
  denseLegacy?: boolean
 }
 canvasFitMode?: VtSyncVisualCanvasFitMode
 heightPolicy?: VtSyncVisualHeightPolicy
 bodyMinHeight?: string
 bodyPreferredHeight?: string
 shellMode: VtSyncVisualShellMode
 controls: readonly VtSyncVisualControlSpec[]
 footer: {
  insight: string
  legend: readonly VtSyncLegendSpec[]
  axisLabel?: string
 }
 renderer: React.ComponentType<VtSyncVisualProps>
}

/**
 * Registry boundary for VT-SYNC visuals. The registered renderer keeps its
 * subject-specific SVG/canvas and existing Neo-Brutalist chart shell; this
 * boundary guarantees that the toolbox renders the registry entry rather than
 * a parallel hard-coded component list.
 */
export const VtSyncVisualFrame: React.FC<{
 spec: VtSyncVisualModuleSpec
 visualProps: VtSyncVisualProps
}> = ({ spec, visualProps }) => (
 <VtSyncVisualDataSourceProvider sourceTableIds={spec.sourceTableIds}>
  <AnalyticsVisualStyleProvider
   value={{
    iconKey: spec.iconKey,
    headerColorPair: spec.headerColorPair,
    controllerColors: spec.controllerColors,
   }}
  >
   {React.createElement(spec.renderer, {
    ...visualProps,
    visualStyle: {
     iconKey: spec.iconKey,
     headerColorPair: spec.headerColorPair,
     controllerColors: spec.controllerColors,
    },
   })}
  </AnalyticsVisualStyleProvider>
 </VtSyncVisualDataSourceProvider>
)
