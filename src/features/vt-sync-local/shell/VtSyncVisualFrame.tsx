import React from "react"
import type { TubeExplorerVisualProps } from "../../../components/TubeExplorerVisualModules"

export type VtSyncVisualControlSpec = {
 id: string
 label: string
 kind: "count" | "select" | "toggle"
}

export type VtSyncLegendSpec = {
 label: string
 color: string
}

export type VtSyncVisualProps = TubeExplorerVisualProps

export type VtSyncVisualModuleSpec = {
 id: string
 sourceTableIds: readonly string[]
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
}> = ({ spec, visualProps }) => React.createElement(spec.renderer, visualProps)
