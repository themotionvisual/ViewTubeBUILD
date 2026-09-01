/**
 * ViewTube Widget Interior Grid — pure geometry helpers.
 *
 * Implements the alignment identity (Rule 2). Used by the Vitest identity
 * tests and by any tooling that needs to compute a composition's outer
 * width/height without rendering.
 *
 * Formula (border included, box-sizing: border-box):
 *
 *   height(N rows) = N * row + (N - 1) * gap
 *   width (M cols) = M * col + (M - 1) * gap
 *
 * The identity guarantees any composition summing to the same N × M has the
 * same outer geometry regardless of internal partitioning.
 */

export interface GridTokens {
  row: number
  col: number
  gap: number
  stroke: number
}

export const DEFAULT_TOKENS: GridTokens = {
  row: 40,
  col: 88,
  gap: 8,
  stroke: 2,
}

export interface GridSpan {
  rows: number
  cols: number
}

export interface GridChildren extends Partial<GridSpan> {
  children?: GridChildren[]
}

/** Outer height in px for a tile spanning N rows. */
export function heightForRows(rows: number, tokens: GridTokens = DEFAULT_TOKENS): number {
  if (rows <= 0) return 0
  return rows * tokens.row + (rows - 1) * tokens.gap
}

/** Outer width in px for a tile spanning M cols. */
export function widthForCols(cols: number, tokens: GridTokens = DEFAULT_TOKENS): number {
  if (cols <= 0) return 0
  return cols * tokens.col + (cols - 1) * tokens.gap
}

/**
 * Compute the outer geometry for a composition. A composition either:
 *   - declares its own rows/cols directly, OR
 *   - carries a `children` array whose stack (implied vertical) must sum to
 *     the parent's rows and match the parent's cols.
 *
 * The identity: a single tile at { rows: N, cols: M } equals any composition
 * of children whose rows sum to N with each child's cols equal to M.
 */
export function widgetGeometry(
  node: GridChildren,
  tokens: GridTokens = DEFAULT_TOKENS,
): { rows: number; cols: number; width: number; height: number } {
  const rows = node.rows ?? (node.children?.reduce((sum, c) => sum + (c.rows ?? 0), 0) ?? 0)
  const cols = node.cols ?? (node.children?.[0]?.cols ?? 0)
  return {
    rows,
    cols,
    width: widthForCols(cols, tokens),
    height: heightForRows(rows, tokens),
  }
}

/**
 * Verify the identity for a parent and a stack of children.
 * Returns true iff every child's cols === parent.cols and the sum of child
 * rows === parent.rows.
 */
export function verifyIdentity(parent: GridSpan, children: GridSpan[]): boolean {
  if (children.length === 0) return false
  const colsMatch = children.every((c) => c.cols === parent.cols)
  const sumRows = children.reduce((sum, c) => sum + c.rows, 0)
  return colsMatch && sumRows === parent.rows
}
