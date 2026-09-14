import type { VisualCanvasAspect, VisualCanvasFamily } from "./VisualCanvasViewport"

export type DataVisualModuleDensity = "normal" | "compact" | "dense"
export type DataVisualModuleOverflow = "clip" | "scroll" | "natural"

/**
 * Viewport buckets a Data Visual composes for. These are compositions, not
 * scaled copies of one another: each bucket may show a different number of
 * simultaneous marks, a different chrome arrangement and a different legend
 * treatment while rendering the same visualization over the same data.
 */
export type DataVisualViewportBucket = "desktop" | "landscape" | "portrait"

/**
 * Maximum number of simultaneous primary marks (columns, pillars, series
 * points, ticks) a module should draw in each bucket.
 *
 * Dense visuals reduce *simultaneous information density* on small screens
 * rather than shrinking desktop density into unreadable pixels; the remaining
 * data stays reachable through the module's declared overflow behaviour
 * (horizontal data navigation, pagination or range selection).
 */
export interface DataVisualDensityProfile {
 desktop: number
 landscape: number
 portrait: number
}

export interface DataVisualModuleCanvasContract {
 id: string
 family: VisualCanvasFamily
 /** Geometry of the outer evidence canvas. */
 canvasAspect: VisualCanvasAspect
 /**
  * Geometry of the internal plot, which is a separate concept from the outer
  * canvas. A radial module keeps a square plot centred inside a 16:9 evidence
  * canvas without the module itself ever becoming square.
  */
 plotAspect?: VisualCanvasAspect
 density?: DataVisualModuleDensity
 overflow?: DataVisualModuleOverflow
 densityProfile?: DataVisualDensityProfile
}

export const DATA_VISUAL_MODULE_CONTRACTS = {
 "shorts-retention": {
  id: "shorts-retention",
  family: "temporal",
  canvasAspect: "16:9",
  density: "normal",
  overflow: "clip",
  densityProfile: { desktop: 10, landscape: 8, portrait: 5 },
 },
 /**
  * Production renderer is a 24-hour x 7-day publish grid, not a radial dial,
  * so the internal plot is left natural: forcing a 1:1 plot onto a 24x7 grid
  * would squash it. `clock-radial-burst` is the radial reference that carries
  * the wide-canvas / square-plot pattern.
  */
 "publish-optimal-clock": {
  id: "publish-optimal-clock",
  family: "spatial",
  canvasAspect: "16:9",
  plotAspect: "natural",
  density: "dense",
  overflow: "clip",
  densityProfile: { desktop: 24, landscape: 24, portrait: 12 },
 },
 "clock-radial-burst": {
  id: "clock-radial-burst",
  family: "radial",
  canvasAspect: "16:9",
  plotAspect: "1:1",
  density: "compact",
  overflow: "clip",
  densityProfile: { desktop: 12, landscape: 10, portrait: 7 },
 },
 "heat-matrix": {
  id: "heat-matrix",
  family: "spatial",
  canvasAspect: "16:9",
  density: "dense",
  overflow: "clip",
  densityProfile: { desktop: 18, landscape: 14, portrait: 8 },
 },
 "traffic-source-evolution": {
  id: "traffic-source-evolution",
  family: "temporal",
  canvasAspect: "16:9",
  density: "normal",
  overflow: "clip",
  densityProfile: { desktop: 8, landscape: 6, portrait: 4 },
 },
 "engagement-pulse": {
  id: "engagement-pulse",
  family: "temporal",
  canvasAspect: "16:9",
  density: "normal",
  overflow: "clip",
  densityProfile: { desktop: 12, landscape: 9, portrait: 6 },
 },
 "content-treemap": {
  id: "content-treemap",
  family: "spatial",
  canvasAspect: "16:9",
  density: "dense",
  overflow: "clip",
  densityProfile: { desktop: 12, landscape: 9, portrait: 6 },
 },
} as const satisfies Record<string, DataVisualModuleCanvasContract>

export type RegisteredDataVisualModuleId = keyof typeof DATA_VISUAL_MODULE_CONTRACTS

export const dataVisualModuleContract = (id: RegisteredDataVisualModuleId): DataVisualModuleCanvasContract => DATA_VISUAL_MODULE_CONTRACTS[id]

export const isRegisteredDataVisualModuleId = (id: string): id is RegisteredDataVisualModuleId => id in DATA_VISUAL_MODULE_CONTRACTS

/**
 * Simultaneous-mark budget for a module in one viewport bucket. Modules that
 * register no profile keep whatever density their renderer already chose.
 */
export const dataVisualDensityBudget = (
 id: RegisteredDataVisualModuleId,
 bucket: DataVisualViewportBucket,
): number | undefined => dataVisualModuleContract(id).densityProfile?.[bucket]
