import React from "react"
import { AnalyticsVisualStyleProvider } from "../../../components/AnalyticsVisualStyleContext"
import type { ControllerRow } from "../../../components/VisualModuleController"
import type { TubeExplorerVisualProps } from "../../../components/TubeExplorerVisualModules"
import { VtSyncVisualDataSourceProvider } from "./VtSyncVisualDataSourceContext"
import type { VtSyncAnalyticsWindow } from "../adapters/contracts"
import {
 ANALYTICS_WINDOWS,
 WINDOW_LABELS,
 WINDOW_SHORT_LABELS,
} from "../../../services/analytics/windows"

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
 /**
  * Windows this visual can answer. Omit for "all". A window-invariant module
  * (channel identity, lifetime-only subjects) should list only "lifetime" so the
  * frame hides the control rather than offering a dead choice.
  */
 supportedWindows?: readonly VtSyncAnalyticsWindow[]
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
 /** Current window, when the surface offers the control. */
 window?: VtSyncAnalyticsWindow
 onWindowChange?: (window: VtSyncAnalyticsWindow) => void
 /** Set when this visual has no rows for the selected window. */
 windowUnavailable?: boolean
}> = ({ spec, visualProps, window, onWindowChange, windowUnavailable = false }) => {
 // The window control is declared per module in spec.controls and rendered
 // here, once, rather than each of the 49 modules building its own picker.
 const declaresWindowControl = spec.controls.some(
  (control) => control.id === "window" && control.kind === "select",
 )
 const offered = (spec.supportedWindows || ANALYTICS_WINDOWS).filter(
  (candidate) => ANALYTICS_WINDOWS.includes(candidate),
 )
 const showWindowControl =
  declaresWindowControl && !!onWindowChange && offered.length > 1
 const responsive = {
  portrait: { ...DEFAULT_RESPONSIVE.portrait, ...spec.responsive?.portrait },
  landscape: { ...DEFAULT_RESPONSIVE.landscape, ...spec.responsive?.landscape },
  desktop: { ...DEFAULT_RESPONSIVE.desktop, ...spec.responsive?.desktop },
 }

 return (
  <div
   data-vt-visual-frame={spec.id}
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
   {showWindowControl ? (
    <div className="vt-visual-window-control" role="group" aria-label="Time window">
     {offered.map((candidate) => (
      <button
       key={candidate}
       type="button"
       data-visual-window={candidate}
       aria-pressed={window === candidate}
       className={`vt-visual-window-chip ${window === candidate ? "is-active" : ""}`}
       onClick={() => onWindowChange?.(candidate)}>
       {WINDOW_SHORT_LABELS[candidate]}
      </button>
     ))}
     {windowUnavailable && window && window !== "lifetime" ? (
      <span className="vt-visual-window-note" role="status">
       No {WINDOW_LABELS[window]} data — sync this window to populate it
      </span>
     ) : null}
    </div>
   ) : null}
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
