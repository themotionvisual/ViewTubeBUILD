/**
 * Canonical geometry, typography, spacing, color and motion contract for every
 * ViewTube subtoolbox. Consumer components should select a primitive/recipe;
 * they should not recreate these values with local utility classes.
 *
 * There is one SubToolbox shell style. The former separate compactShell
 * geometry is intentionally removed: compact content may change layout density,
 * but it must not create a second SubToolbox header/stroke/radius system.
 */
export const SUBTOOLBOX_TOKENS = {
  shell: {
    headerHeight: 44,
    stroke: 4,
    radius: 12,
    shadowOffset: 6,
    titleSize: 22,
    iconSize: 32,
  },
  interior: {
    stroke: 3,
    radius: 8,
    shadowOffset: 4,
  },
  spacing: {
    micro: 4,
    dense: 8,
    standard: 12,
    section: 16,
    large: 24,
  },
  controlHeight: {
    // Two paired controls plus one 4px gap equal one collapsed SubToolbox:
    // 20 + 4 + 20 = 44.
    micro: 20,
    compact: 32,
    standard: 48,
    // Level-1/module actions align exactly with the single SubToolbox shell.
    action: 44,
  },
  typography: {
    micro: 9,
    label: 10,
    control: 14,
    action: 22,
    title: 22,
    toolboxTitle: 28,
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
  _heightMode: "standard" | "compact",
) => {
  const gap = SUBTOOLBOX_TOKENS.spacing.large
  const overhead = SUBTOOLBOX_TOKENS.controlHeight.action
  return Math.max(0, openUnits * SUBTOOLBOX_TOKENS.controlHeight.action + (openUnits - 1) * gap - overhead)
}

export type SubToolboxControlSize = keyof typeof SUBTOOLBOX_TOKENS.controlHeight
export type SubToolboxLayoutDensity = "dense" | "standard" | "comfortable"
export type SubToolboxState = "loading" | "ready" | "empty" | "blocked" | "stale" | "error"
