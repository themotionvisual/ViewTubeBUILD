import { SUBTOOLBOX_TOKENS } from "../components/subtoolbox/tokens"

/**
 * Single public token authority for Studio Hub presentation.
 *
 * Existing subtoolbox tokens remain the geometry source during migration so we
 * do not create two competing systems. New Studio Hub code should import this
 * facade rather than reaching into feature CSS or recreating numeric values.
 */
export const STUDIO_TOKENS = {
  toolbox: {
    headerHeight: 80,
    stroke: 5,
    radius: 16,
    shadowOffset: 10,
    titleSize: 26,
  },
  subtoolbox: {
    headerHeight: SUBTOOLBOX_TOKENS.shell.headerHeight,
    stroke: SUBTOOLBOX_TOKENS.shell.stroke,
    radius: SUBTOOLBOX_TOKENS.shell.radius,
    shadowOffset: SUBTOOLBOX_TOKENS.shell.shadowOffset,
    titleSize: SUBTOOLBOX_TOKENS.shell.titleSize,
  },
  compactSubtoolbox: {
    headerHeight: SUBTOOLBOX_TOKENS.compactShell.headerHeight,
    stroke: SUBTOOLBOX_TOKENS.compactShell.stroke,
    radius: SUBTOOLBOX_TOKENS.compactShell.radius,
    shadowOffset: SUBTOOLBOX_TOKENS.compactShell.shadowOffset,
    titleSize: SUBTOOLBOX_TOKENS.typography.title,
  },
  component: {
    height: {
      compact: SUBTOOLBOX_TOKENS.controlHeight.compact,
      standard: SUBTOOLBOX_TOKENS.controlHeight.standard,
      action: SUBTOOLBOX_TOKENS.controlHeight.action,
    },
    stroke: SUBTOOLBOX_TOKENS.interior.stroke,
    radius: SUBTOOLBOX_TOKENS.interior.radius,
    shadowOffset: SUBTOOLBOX_TOKENS.interior.shadowOffset,
  },
  typography: {
    label: SUBTOOLBOX_TOKENS.typography.label,
    control: SUBTOOLBOX_TOKENS.typography.control,
    action: SUBTOOLBOX_TOKENS.typography.action,
    subtoolboxTitle: SUBTOOLBOX_TOKENS.typography.title,
    toolboxTitle: SUBTOOLBOX_TOKENS.typography.toolboxTitle,
    weight: SUBTOOLBOX_TOKENS.typography.weight,
  },
  spacing: {
    dense: SUBTOOLBOX_TOKENS.spacing.dense,
    standard: SUBTOOLBOX_TOKENS.spacing.standard,
    section: SUBTOOLBOX_TOKENS.spacing.section,
    large: SUBTOOLBOX_TOKENS.spacing.large,
  },
  radius: {
    toolbox: 16,
    subtoolbox: SUBTOOLBOX_TOKENS.shell.radius,
    compactSubtoolbox: SUBTOOLBOX_TOKENS.compactShell.radius,
    component: SUBTOOLBOX_TOKENS.interior.radius,
    tag: 4,
  },
  stroke: {
    toolbox: 5,
    subtoolbox: SUBTOOLBOX_TOKENS.shell.stroke,
    compactSubtoolbox: SUBTOOLBOX_TOKENS.compactShell.stroke,
    component: SUBTOOLBOX_TOKENS.interior.stroke,
    tag: 2,
  },
  shadow: {
    toolbox: 10,
    subtoolbox: SUBTOOLBOX_TOKENS.shell.shadowOffset,
    compactSubtoolbox: SUBTOOLBOX_TOKENS.compactShell.shadowOffset,
    component: SUBTOOLBOX_TOKENS.interior.shadowOffset,
  },
  motion: {
    controlMs: SUBTOOLBOX_TOKENS.motion.controlMs,
    collapseMs: SUBTOOLBOX_TOKENS.motion.collapseMs,
    easing: SUBTOOLBOX_TOKENS.motion.easing,
  },
  breakpoints: {
    phoneMax: 767,
    compactShellMax: 900,
  },
} as const

export type StudioControlSize = keyof typeof STUDIO_TOKENS.component.height
export type StudioHierarchyLevel = "toolbox" | "subtoolbox" | "compactSubtoolbox" | "component"
