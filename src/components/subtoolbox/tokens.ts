/**
 * Canonical ViewTube toolbox/subtoolbox primitive contract.
 *
 * Architecture: TOKENS -> PRIMITIVE -> COMPONENT -> COMPOSITION -> TOOL.
 * Consumers select semantic recipes and must not recreate geometry locally.
 * All layout geometry follows the 4px grid; 2/3/4px strokes are deliberate
 * optical exceptions. Color is intentionally independent from geometry.
 */

export const SUBTOOLBOX_GRID = 4 as const

export const SUBTOOLBOX_SIZE_RECIPES = {
  xs: {
    height: 18,
    fontSize: 8,
    iconSize: 10,
    radius: 4,
    stroke: 2,
    shadowOffset: 2,
    paddingX: 4,
    gap: 4,
  },
  sm: {
    height: 24,
    fontSize: 10,
    iconSize: 12,
    radius: 4,
    stroke: 2,
    shadowOffset: 2,
    paddingX: 8,
    gap: 4,
  },
  md: {
    height: 32,
    fontSize: 12,
    iconSize: 16,
    radius: 8,
    stroke: 3,
    shadowOffset: 4,
    paddingX: 8,
    gap: 8,
  },
  lg: {
    height: 48,
    fontSize: 14,
    iconSize: 20,
    radius: 8,
    stroke: 4,
    shadowOffset: 4,
    paddingX: 12,
    gap: 8,
  },
} as const

export type SubToolboxPrimitiveSize = keyof typeof SUBTOOLBOX_SIZE_RECIPES
export type SubToolboxStyle = "primary" | "secondary" | "tertiary"

export const SUBTOOLBOX_STYLE_RECIPES = {
  primary: {
    surface: "accent",
    foreground: "black",
    emptySurface: "white",
    shadowStrength: 0.5,
  },
  secondary: {
    surface: "white",
    foreground: "black",
    emptySurface: "white",
    shadowStrength: 0.5,
  },
  tertiary: {
    surface: "soft-accent",
    foreground: "black",
    emptySurface: "white",
    shadowStrength: 0.35,
  },
} as const

export const SUBTOOLBOX_TOKENS = {
  grid: SUBTOOLBOX_GRID,
  sizes: SUBTOOLBOX_SIZE_RECIPES,
  styles: SUBTOOLBOX_STYLE_RECIPES,
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
    radius: 8,
    shadowOffset: 4,
    iconSize: 24,
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
  /** Compatibility aliases. New primitives should use `sizes`. */
  controlHeight: {
    compact: SUBTOOLBOX_SIZE_RECIPES.md.height,
    standard: SUBTOOLBOX_SIZE_RECIPES.lg.height,
    action: 60,
  },
  typography: {
    micro: SUBTOOLBOX_SIZE_RECIPES.xs.fontSize,
    label: SUBTOOLBOX_SIZE_RECIPES.sm.fontSize,
    control: SUBTOOLBOX_SIZE_RECIPES.lg.fontSize,
    action: 20,
    title: 20,
    toolboxTitle: 26,
    weight: 900,
  },
  motion: {
    instantMs: 0,
    interactionMs: 180,
    componentMs: 300,
    collapseMs: 600,
    expressiveMs: 1000,
    easing: "cubic-bezier(0.4,0,0.2,1)",
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
  transition: "duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
} as const

/** One canonical layout transition for every toolbox/subtoolbox collapse. */
export const SUBTOOLBOX_COLLAPSE_TRANSITION =
  "duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"

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

/** Legacy names remain during migration; semantic sizes are preferred. */
export type SubToolboxControlSize = "compact" | "standard" | "action"
export type SubToolboxLayoutDensity = "dense" | "standard" | "comfortable"
export type SubToolboxState = "loading" | "ready" | "empty" | "blocked" | "stale" | "error"
