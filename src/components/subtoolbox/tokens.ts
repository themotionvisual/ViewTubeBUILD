/**
 * Canonical geometry, typography, spacing, color and motion contract for every
 * ViewTube Toolbox/Subtoolbox structural level. Feature code should select a
 * structural level and primitive/recipe; it should not recreate these values
 * with local utility classes.
 */
export const TOOLBOX_LEVEL_TOKENS = {
  toolbox: {
    height: 80,
    stroke: 5,
    radius: 16,
    shadowOffset: 10,
    titleSize: 26,
    titleWeight: 1000,
  },
  l0: {
    height: 56,
    stroke: 4,
    radius: 12,
    shadowOffset: 6,
    titleSize: 20,
    titleWeight: 1000,
  },
  compact: {
    height: 44,
    stroke: 3,
    radius: 10,
    shadowOffset: 4,
    titleSize: 20,
    titleWeight: 900,
  },
  l1: {
    height: 48,
    stroke: 3,
    radius: 8,
    shadowOffset: 4,
    titleSize: 14,
    titleWeight: 900,
  },
  l2: {
    height: 32,
    stroke: 2,
    radius: 6,
    shadowOffset: 2,
    titleSize: 10,
    titleWeight: 900,
  },
} as const

export type ToolboxStructuralLevel = keyof typeof TOOLBOX_LEVEL_TOKENS
export const getToolboxLevelTokens = (level: ToolboxStructuralLevel) => TOOLBOX_LEVEL_TOKENS[level]

export const SUBTOOLBOX_TOKENS = {
  shell: {
    headerHeight: TOOLBOX_LEVEL_TOKENS.l0.height,
    stroke: TOOLBOX_LEVEL_TOKENS.l0.stroke,
    radius: TOOLBOX_LEVEL_TOKENS.l0.radius,
    shadowOffset: TOOLBOX_LEVEL_TOKENS.l0.shadowOffset,
    titleSize: TOOLBOX_LEVEL_TOKENS.l0.titleSize,
    iconSize: 40,
  },
  compactShell: {
    headerHeight: TOOLBOX_LEVEL_TOKENS.compact.height,
    stroke: TOOLBOX_LEVEL_TOKENS.compact.stroke,
    radius: TOOLBOX_LEVEL_TOKENS.compact.radius,
    shadowOffset: TOOLBOX_LEVEL_TOKENS.compact.shadowOffset,
    iconSize: 24,
  },
  interior: {
    stroke: TOOLBOX_LEVEL_TOKENS.l1.stroke,
    radius: TOOLBOX_LEVEL_TOKENS.l1.radius,
    shadowOffset: TOOLBOX_LEVEL_TOKENS.l1.shadowOffset,
  },
  spacing: {
    micro: 4,
    dense: 8,
    standard: 12,
    section: 16,
    large: 24,
  },
  controlHeight: {
    // Two micro controls plus one 4px gap equal one collapsed standard
    // SubToolbox header: 26 + 4 + 26 = 56.
    micro: 26,
    compact: TOOLBOX_LEVEL_TOKENS.l2.height,
    standard: TOOLBOX_LEVEL_TOKENS.l1.height,
    // Level-0 peer actions align exactly with a collapsed standard SubToolbox.
    action: TOOLBOX_LEVEL_TOKENS.l0.height,
  },
  typography: {
    micro: 9,
    label: TOOLBOX_LEVEL_TOKENS.l2.titleSize,
    control: TOOLBOX_LEVEL_TOKENS.l1.titleSize,
    action: TOOLBOX_LEVEL_TOKENS.l0.titleSize,
    title: TOOLBOX_LEVEL_TOKENS.l0.titleSize,
    toolboxTitle: TOOLBOX_LEVEL_TOKENS.toolbox.titleSize,
    weight: 900,
  },
  motion: {
    controlMs: 180,
    // Current production authority. Change only through a documented motion
    // contract migration so Toolbox, SubToolbox and reference examples stay aligned.
    collapseMs: 300,
    easing: "ease-out",
  },
} as const

/** Compatibility geometry for existing Toolbox controls while consumers move
 * to the typed primitives. It is derived from the single level authority. */
export const CONTROL_SHELL = {
  headerHeight: SUBTOOLBOX_TOKENS.shell.headerHeight,
  height: SUBTOOLBOX_TOKENS.controlHeight.action,
  stroke: SUBTOOLBOX_TOKENS.shell.stroke,
  radius: SUBTOOLBOX_TOKENS.interior.radius,
  railSize: SUBTOOLBOX_TOKENS.shell.headerHeight,
  contentOffset: SUBTOOLBOX_TOKENS.shell.headerHeight,
  shadowOffset: SUBTOOLBOX_TOKENS.shell.shadowOffset,
  transition: "duration-[180ms] ease-out motion-reduce:transition-none",
} as const

export const SUBTOOLBOX_COLLAPSE_TRANSITION =
  `duration-[${SUBTOOLBOX_TOKENS.motion.collapseMs}ms] ease-out motion-reduce:transition-none`

export const resolveSubtoolboxMinHeight = (
  openUnits: number,
  heightMode: "standard" | "compact",
) => {
  const gap = SUBTOOLBOX_TOKENS.spacing.large
  const overhead = SUBTOOLBOX_TOKENS.controlHeight.action
  const computed = openUnits * SUBTOOLBOX_TOKENS.controlHeight.action + (openUnits - 1) * gap - overhead

  if (heightMode === "compact") return Math.max(0, Math.min(computed, 144))
  return Math.max(0, computed)
}

export type SubToolboxControlSize = keyof typeof SUBTOOLBOX_TOKENS.controlHeight
export type SubToolboxLayoutDensity = "dense" | "standard" | "comfortable"
export type SubToolboxState = "loading" | "ready" | "empty" | "blocked" | "stale" | "error"
