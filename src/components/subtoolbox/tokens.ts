/**
 * ViewTube Toolbox UI V35 token authority.
 *
 * Structural level owns geometry. Component families own anatomy/behavior.
 * Feature consumers must not recreate these values locally.
 * Compact is retired as a structural/component level: canonical controls use
 * L0 / L1 / L2. Toolbox remains a separate top-level shell.
 */

export const VT_SPECTRUM_PALETTE = [
  "#FA618A",
  "#FF7F6B",
  "#FFA85C",
  "#FFDA47",
  "#C0F240",
  "#3FEE56",
  "#4EE4BE",
  "#36E0F6",
  "#528FFA",
  "#A467F4",
  "#F55EFC",
  "#FF7AC8",
] as const

export type ToolboxUiLevel = "toolbox" | "l0" | "l1" | "l2"
export type ToolboxControlLevel = Exclude<ToolboxUiLevel, "toolbox">

export const TOOLBOX_LEVEL_DNA = {
  toolbox: {
    height: 56,
    stroke: 5,
    radius: 16,
    shadowOffset: 10,
    titleSize: 28,
  },
  l0: {
    height: 44,
    stroke: 4,
    radius: 12,
    shadowOffset: 6,
    titleSize: 22,
  },
  l1: {
    height: 48,
    stroke: 3,
    radius: 8,
    shadowOffset: 4,
    titleSize: 18,
  },
  l2: {
    height: 32,
    stroke: 2,
    radius: 6,
    shadowOffset: 2,
    titleSize: 12,
  },
} as const

/**
 * Fixed-height responsive header contract. Titles may consume at most two
 * tight lines; action rails never shrink. Toolbox and SubToolbox header icons
 * share one visual box/stroke contract even when the glyph source differs.
 */
export const TOOLBOX_HEADER_DNA = {
  toolbox: {
    height: TOOLBOX_LEVEL_DNA.toolbox.height,
    titleSize: TOOLBOX_LEVEL_DNA.toolbox.titleSize,
    titleLineHeight: 0.82,
    titleMaxLines: 2,
    titleInlinePadding: 4,
    actionGap: 4,
    actionEndPadding: 4,
    iconSize: 28,
    iconStroke: 2,
  },
  subtoolbox: {
    height: TOOLBOX_LEVEL_DNA.l0.height,
    titleSize: TOOLBOX_LEVEL_DNA.l0.titleSize,
    titleLineHeight: 0.82,
    titleMaxLines: 2,
    titleInlinePadding: 4,
    actionGap: 2,
    actionEndPadding: 2,
    iconSize: 28,
    iconStroke: 2,
    contentEdgeInset: 2,
  },
} as const

/**
 * Explicit opposite-palette pairing. These are real palette colors, not
 * opacity-derived variants. Index i pairs with the index returned here.
 */
export const TOOLBOX_OPPOSITE_PAIR_INDEX = [
  6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5,
] as const

export const getToolboxColorPair = (index: number) => {
  const normalized = ((index % VT_SPECTRUM_PALETTE.length) + VT_SPECTRUM_PALETTE.length) % VT_SPECTRUM_PALETTE.length
  return {
    rail: VT_SPECTRUM_PALETTE[normalized],
    body: VT_SPECTRUM_PALETTE[TOOLBOX_OPPOSITE_PAIR_INDEX[normalized]],
  }
}

export const SUBTOOLBOX_TOKENS = {
  shell: {
    headerHeight: TOOLBOX_LEVEL_DNA.l0.height,
    stroke: TOOLBOX_LEVEL_DNA.l0.stroke,
    radius: TOOLBOX_LEVEL_DNA.l0.radius,
    shadowOffset: TOOLBOX_LEVEL_DNA.l0.shadowOffset,
    titleSize: TOOLBOX_LEVEL_DNA.l0.titleSize,
    iconSize: TOOLBOX_HEADER_DNA.subtoolbox.iconSize,
    iconStroke: TOOLBOX_HEADER_DNA.subtoolbox.iconStroke,
    titleLineHeight: TOOLBOX_HEADER_DNA.subtoolbox.titleLineHeight,
    titleMaxLines: TOOLBOX_HEADER_DNA.subtoolbox.titleMaxLines,
    contentEdgeInset: TOOLBOX_HEADER_DNA.subtoolbox.contentEdgeInset,
  },
  interior: {
    stroke: TOOLBOX_LEVEL_DNA.l1.stroke,
    radius: TOOLBOX_LEVEL_DNA.l1.radius,
    shadowOffset: TOOLBOX_LEVEL_DNA.l1.shadowOffset,
  },
  spacing: {
    micro: 4,
    dense: 8,
    standard: 12,
    section: 16,
    large: 24,
  },
  controlHeight: {
    l2: TOOLBOX_LEVEL_DNA.l2.height,
    l1: TOOLBOX_LEVEL_DNA.l1.height,
    l0: TOOLBOX_LEVEL_DNA.l0.height,
  },
  typography: {
    l2: TOOLBOX_LEVEL_DNA.l2.titleSize,
    l1: TOOLBOX_LEVEL_DNA.l1.titleSize,
    l0: TOOLBOX_LEVEL_DNA.l0.titleSize,
    toolbox: TOOLBOX_LEVEL_DNA.toolbox.titleSize,
    weight: 1000,
    letterSpacingEm: -0.055,
    uppercaseChrome: true,
  },
  elevation: {
    shadowOpacity: 0.42,
    flatFamilies: ["slider", "range", "toggle", "switch", "checkbox", "radio", "progress", "divider"] as const,
  },
  focus: {
    inward: true,
    focusedFieldFill: "#FFFFFF",
    caretUsesAccent: true,
  },
  motion: {
    controlMs: 180,
    collapseMs: 300,
    easing: "ease-out",
  },
} as const

/** Compatibility geometry while existing consumers migrate to level props. */
export const CONTROL_SHELL = {
  headerHeight: SUBTOOLBOX_TOKENS.shell.headerHeight,
  height: TOOLBOX_LEVEL_DNA.l0.height,
  stroke: TOOLBOX_LEVEL_DNA.l0.stroke,
  radius: TOOLBOX_LEVEL_DNA.l0.radius,
  railSize: TOOLBOX_LEVEL_DNA.l0.height,
  contentOffset: TOOLBOX_LEVEL_DNA.l0.height,
  shadowOffset: TOOLBOX_LEVEL_DNA.l0.shadowOffset,
  transition: "duration-[180ms] ease-out motion-reduce:transition-none",
} as const

export const SUBTOOLBOX_COLLAPSE_TRANSITION =
  "duration-300 ease-out motion-reduce:transition-none"

export const resolveSubtoolboxMinHeight = (
  openUnits: number,
  _heightMode?: "standard" | "compact",
) => {
  const gap = SUBTOOLBOX_TOKENS.spacing.large
  const overhead = TOOLBOX_LEVEL_DNA.l0.height
  return Math.max(0, openUnits * TOOLBOX_LEVEL_DNA.l0.height + (openUnits - 1) * gap - overhead)
}

export type SubToolboxControlSize = ToolboxControlLevel
export type SubToolboxLayoutDensity = "dense" | "standard" | "comfortable"
export type SubToolboxState =
  | "loading"
  | "ready"
  | "empty"
  | "filtered-empty"
  | "disconnected"
  | "blocked"
  | "stale"
  | "permission"
  | "error"