export const TOOLBOX_TOKENS = {
  shell: {
    headerHeight: 80,
    stroke: 5,
    radius: 16,
    shadowOffset: 10,
    titleSize: 26,
    iconSize: 40,
    titleWeight: 1000,
  },
  spacing: {
    grid: 4,
    contentX: 10,
    contentY: 32,
  },
} as const

/**
 * Main-toolbox geometry authority.
 * Subtoolbox geometry remains owned by ../subtoolbox/tokens.ts.
 * Widget geometry must not import or override these values.
 */
export type ToolboxTokens = typeof TOOLBOX_TOKENS
