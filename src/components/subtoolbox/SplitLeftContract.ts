import { SUBTOOLBOX_TOKENS } from './tokens'

/**
 * Geometry contract shared by split-left buttons, dropdown triggers and
 * subtoolbox-grid actions. The icon rail is always square: width === height.
 */
export const SUBTOOLBOX_SPLIT_LEFT = {
  standard: {
    height: SUBTOOLBOX_TOKENS.shell.headerHeight,
    railWidth: SUBTOOLBOX_TOKENS.shell.headerHeight,
    stroke: SUBTOOLBOX_TOKENS.shell.stroke,
    radius: SUBTOOLBOX_TOKENS.shell.radius,
    shadowOffset: SUBTOOLBOX_TOKENS.shell.shadowOffset,
    fontSize: SUBTOOLBOX_TOKENS.typography.title,
    fontWeight: SUBTOOLBOX_TOKENS.typography.weight,
  },
  compact: {
    height: SUBTOOLBOX_TOKENS.compactShell.headerHeight,
    railWidth: SUBTOOLBOX_TOKENS.compactShell.headerHeight,
    stroke: SUBTOOLBOX_TOKENS.compactShell.stroke,
    radius: SUBTOOLBOX_TOKENS.compactShell.radius,
    shadowOffset: SUBTOOLBOX_TOKENS.compactShell.shadowOffset,
    fontSize: SUBTOOLBOX_TOKENS.typography.title,
    fontWeight: SUBTOOLBOX_TOKENS.typography.weight,
  },
} as const

export type SubToolboxSplitLeftSize = keyof typeof SUBTOOLBOX_SPLIT_LEFT
