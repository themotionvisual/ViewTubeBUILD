/**
 * Canonical geometry, typography, spacing, color and motion contract for every
 * ViewTube subtoolbox. Consumer components should select a primitive/recipe;
 * they should not recreate these values with local utility classes.
 */
export const SUBTOOLBOX_TOKENS = {
  shell: {
    headerHeight: 56,
    stroke: 4,
    radius: 12,
    shadowOffset: 6,
    titleSize: 20,
    iconSize: 40,
  },
  compactShell: {
    headerHeight: 44,
    stroke: 3,
    radius: 10,
    shadowOffset: 4,
    iconSize: 24,
  },
  interior: {
    stroke: 3,
    radius: 8,
    shadowOffset: 4,
  },
  spacing: {
    dense: 8,
    standard: 12,
    section: 16,
    large: 24,
  },
  controlHeight: {
    compact: 32,
    standard: 48,
    // Level-1/module actions align exactly with a collapsed standard
    // SubToolbox. They must never be taller than the module they belong to.
    action: 56,
  },
  typography: {
    label: 10,
    control: 14,
    action: 20,
    title: 20,
    toolboxTitle: 26,
    weight: 900,
  },
  motion: {
    controlMs: 180,
    collapseMs: 300,
    easing: "ease-out",
  },
} as const

/** Compatibility geometry for existing Toolbox controls while consumers move
 * to the typed primitives. It is derived from the single token authority. */
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
  "duration-300 ease-out motion-reduce:transition-none"

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
