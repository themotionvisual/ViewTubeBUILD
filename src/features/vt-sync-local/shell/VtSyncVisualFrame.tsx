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
export type VtSyncVisualAspect = "16:9" | "1:1" | "natural"
export type VtSyncVisualChromeMode = "inline" | "compact" | "menu"

export type VtSyncVisualResponsiveState = {
 span?: 1 | 2
 aspect?: VtSyncVisualAspect
 controls?: VtSyncVisualChromeMode
 legend?: "full" | "compact" | "hidden"
 explanation?: "full" | "collapsed" | "hidden"
 density?: "normal" | "compact"
}

export type VtSyncVisualResponsiveSpec = {
 portrait?: VtSyncVisualResponsiveState
 landscape?: VtSyncVisualResponsiveState
 desktop?: VtSyncVisualResponsiveState
}

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
 responsive?: VtSyncVisualResponsiveSpec
 shellMode: VtSyncVisualShellMode
 controls: readonly VtSyncVisualControlSpec[]
 footer: {
  insight: string
  legend: readonly VtSyncLegendSpec[]
  axisLabel?: string
 }
 renderer: React.ComponentType<VtSyncVisualProps>
}

const DEFAULT_RESPONSIVE: Required<VtSyncVisualResponsiveSpec> = {
 portrait: {
  span: 1,
  aspect: "16:9",
  controls: "menu",
  legend: "compact",
  explanation: "collapsed",
  density: "compact",
 },
 landscape: {
  span: 1,
  aspect: "16:9",
  controls: "inline",
  legend: "compact",
  explanation: "collapsed",
  density: "normal",
 },
 desktop: {
  span: 1,
  aspect: "16:9",
  controls: "inline",
  legend: "full",
  explanation: "full",
  density: "normal",
 },
}

const responsiveValue = (state: VtSyncVisualResponsiveState | undefined, key: keyof VtSyncVisualResponsiveState, fallback: string | number) =>
 state?.[key] ?? fallback

/**
 * Canonical responsive boundary for VT-SYNC visuals.
 *
 * The registered renderer continues to own its subject-specific marks, while
 * this frame owns responsive intent. CSS/container-query layers can consume
 * the data attributes without inspecting titles or relying on viewport-global
 * renderer logic. This lets portrait, phone landscape and desktop become
 * sibling compositions while legacy renderers migrate incrementally.
 */
export const VtSyncVisualFrame: React.FC<{
 spec: VtSyncVisualModuleSpec
 visualProps: VtSyncVisualProps
}> = ({ spec, visualProps }) => {
 const responsive = {
  portrait: { ...DEFAULT_RESPONSIVE.portrait, ...spec.responsive?.portrait },
  landscape: { ...DEFAULT_RESPONSIVE.landscape, ...spec.responsive?.landscape },
  desktop: { ...DEFAULT_RESPONSIVE.desktop, ...spec.responsive?.desktop },
 }

 return (
  <div
   data-vt-visual-frame={spec.id}
   data-vt-data-visual-module-root={spec.id}
   data-vt-visual-density="adaptive"
   data-vt-canvas-fit={spec.canvasFitMode ?? "balanced"}
   data-vt-height-policy={spec.heightPolicy ?? "preserveRatio"}
   data-vt-portrait-aspect={responsiveValue(responsive.portrait, "aspect", "16:9")}
   data-vt-landscape-aspect={responsiveValue(responsive.landscape, "aspect", "16:9")}
   data-vt-desktop-aspect={responsiveValue(responsive.desktop, "aspect", "16:9")}
   data-vt-portrait-controls={responsiveValue(responsive.portrait, "controls", "menu")}
   data-vt-landscape-controls={responsiveValue(responsive.landscape, "controls", "inline")}
   data-vt-portrait-legend={responsiveValue(responsive.portrait, "legend", "compact")}
   data-vt-landscape-legend={responsiveValue(responsive.landscape, "legend", "compact")}
   data-vt-portrait-explanation={responsiveValue(responsive.portrait, "explanation", "collapsed")}
   data-vt-landscape-explanation={responsiveValue(responsive.landscape, "explanation", "collapsed")}
   style={{ minWidth: 0, maxWidth: "100%" }}
  >
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
  </div>
 )
}
