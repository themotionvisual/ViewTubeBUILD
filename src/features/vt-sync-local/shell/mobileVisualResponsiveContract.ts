import type { VtSyncVisualResponsiveSpec } from "./VtSyncVisualFrame"

/** Canonical presets for registry entries. Prefer these over per-module viewport CSS. */
export const VT_VISUAL_RESPONSIVE = {
 spatial: {
  portrait: { span: 1, aspect: "16:9", controls: "menu", legend: "compact", explanation: "collapsed", density: "compact" },
  landscape: { span: 1, aspect: "16:9", controls: "inline", legend: "compact", explanation: "collapsed", density: "normal" },
  desktop: { span: 1, aspect: "16:9", controls: "inline", legend: "full", explanation: "full", density: "normal" },
 },
 radial: {
  portrait: { span: 1, aspect: "1:1", controls: "menu", legend: "compact", explanation: "collapsed", density: "compact" },
  landscape: { span: 1, aspect: "1:1", controls: "inline", legend: "compact", explanation: "collapsed", density: "normal" },
  desktop: { span: 1, aspect: "1:1", controls: "inline", legend: "full", explanation: "full", density: "normal" },
 },
 natural: {
  portrait: { span: 1, aspect: "natural", controls: "menu", legend: "compact", explanation: "collapsed", density: "compact" },
  landscape: { span: 1, aspect: "natural", controls: "inline", legend: "compact", explanation: "collapsed", density: "normal" },
  desktop: { span: 1, aspect: "natural", controls: "inline", legend: "full", explanation: "full", density: "normal" },
 },
} as const satisfies Record<string, VtSyncVisualResponsiveSpec>

export type VtSyncVisualResponsivePreset = keyof typeof VT_VISUAL_RESPONSIVE
