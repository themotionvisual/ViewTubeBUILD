import type { VisualCanvasAspect, VisualCanvasFamily } from "./VisualCanvasViewport"

export type DataVisualModuleDensity = "normal" | "compact" | "dense"
export type DataVisualModuleOverflow = "clip" | "scroll" | "natural"

export interface DataVisualModuleCanvasContract {
 id: string
 family: VisualCanvasFamily
 canvasAspect: VisualCanvasAspect
 plotAspect?: VisualCanvasAspect
 density?: DataVisualModuleDensity
 overflow?: DataVisualModuleOverflow
}

/**
 * Source-native canvas contracts for individual Data Visual modules.
 * This registry intentionally owns only the evidence/canvas region; it does
 * not redefine Toolbox/SubToolbox geometry or global Analytics chrome.
 */
export const DATA_VISUAL_MODULE_CONTRACTS = {
 "shorts-retention": {
  id: "shorts-retention",
  family: "temporal",
  canvasAspect: "16:9",
  density: "normal",
  overflow: "clip",
 },
 "publish-optimal-clock": {
  id: "publish-optimal-clock",
  family: "radial",
  canvasAspect: "16:9",
  plotAspect: "1:1",
  density: "compact",
  overflow: "clip",
 },
 "heat-matrix": {
  id: "heat-matrix",
  family: "spatial",
  canvasAspect: "16:9",
  density: "dense",
  overflow: "clip",
 },
 "traffic-source-evolution": {
  id: "traffic-source-evolution",
  family: "temporal",
  canvasAspect: "16:9",
  density: "normal",
  overflow: "clip",
 },
 "engagement-pulse": {
  id: "engagement-pulse",
  family: "temporal",
  canvasAspect: "16:9",
  density: "normal",
  overflow: "clip",
 },
 "content-treemap": {
  id: "content-treemap",
  family: "spatial",
  canvasAspect: "16:9",
  density: "dense",
  overflow: "clip",
 },
} as const satisfies Record<string, DataVisualModuleCanvasContract>

export type RegisteredDataVisualModuleId = keyof typeof DATA_VISUAL_MODULE_CONTRACTS

export const dataVisualModuleContract = (id: RegisteredDataVisualModuleId): DataVisualModuleCanvasContract =>
 DATA_VISUAL_MODULE_CONTRACTS[id]
