/**
 * ViewTube Widget Interior Grid — composition primitives.
 *
 * All primitives:
 *   - render `data-rows` / `data-cols` on their DOM element
 *   - refuse render (dev warning) when children spans exceed parent span
 *   - never take gap/padding shorthand — geometry comes from the four
 *     interior-grid tokens (--vt-row, --vt-col, --vt-gap, --vt-stroke).
 *
 * See viewtube-widget-interior-grid skill (Rule 8).
 */

import React from "react"

const IS_DEV = typeof process !== "undefined" && process.env.NODE_ENV !== "production"

export type GridTone = "subtle" | "ink" | "hue" | "ghost"
export type GridStroke = "module" | "heavy" | "none"
export type FluidRows = "fluid"

export interface SpanProps {
  rows: number | FluidRows
  cols: number
}

interface CommonProps {
  className?: string
  style?: React.CSSProperties
  tone?: GridTone
  stroke?: GridStroke
  children?: React.ReactNode
}

/** Sum span rows across children in the same interior grid. Ignores `fluid`. */
function sumChildRows(children: React.ReactNode): number {
  let total = 0
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    const rows = (child.props as { rows?: number | FluidRows })?.rows
    if (typeof rows === "number") total += rows
  })
  return total
}

/** Assert children rows fit within parent rows in dev only. */
function assertSpans(componentName: string, parentRows: number | FluidRows, children: React.ReactNode) {
  if (!IS_DEV) return
  if (parentRows === "fluid") return
  const childRows = sumChildRows(children)
  if (childRows > parentRows) {
    // eslint-disable-next-line no-console
    console.warn(
      `[interior-grid] ${componentName}: children rows (${childRows}) exceed parent rows (${parentRows}).`,
    )
  }
}

/**
 * WidgetInteriorBody — the root grid inside a WidgetShell child slot.
 * Consume this as the direct child of <WidgetShell>. Its own padding uses
 * --vt-inset from tokens; do NOT wrap it in another padded container.
 *
 * `cols` sets --vt-cols; the CSS reads it when the `--fill` modifier is on.
 */
export const WidgetInteriorBody: React.FC<{
  cols?: number
  fill?: boolean
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}> = ({ cols, fill = false, className, style, children }) => {
  const merged = fill && cols
    ? { ...style, ["--vt-cols" as string]: String(cols) }
    : style
  return (
    <div
      className={["vt-widget__body", fill && "vt-widget__body--fill", className].filter(Boolean).join(" ")}
      data-cols={cols}
      style={merged}
    >
      {children}
    </div>
  )
}

/** WidgetSurface — a plain tile with optional tone/stroke chrome. */
export const WidgetSurface: React.FC<SpanProps & CommonProps> = ({
  rows,
  cols,
  tone,
  stroke,
  className,
  style,
  children,
}) => {
  assertSpans("WidgetSurface", rows, children)
  return (
    <div
      className={["vt-tile", className].filter(Boolean).join(" ")}
      data-rows={rows}
      data-cols={cols}
      data-tone={tone}
      data-stroke={stroke}
      style={style}
    >
      {children}
    </div>
  )
}

/** WidgetStack — vertical stack of tiles inside a parent tile. */
export const WidgetStack: React.FC<SpanProps & CommonProps> = ({
  rows,
  cols,
  tone,
  stroke,
  className,
  style,
  children,
}) => {
  assertSpans("WidgetStack", rows, children)
  return (
    <div
      className={["vt-tile vt-tile--nested", className].filter(Boolean).join(" ")}
      data-rows={rows}
      data-cols={cols}
      data-tone={tone}
      data-stroke={stroke}
      style={style}
    >
      {children}
    </div>
  )
}

/**
 * WidgetCluster — a 1D row of tiles. Uses flex inside a tile envelope so
 * children flow horizontally with the interior --vt-gap. Children still
 * declare their own cols in the outer body via data attributes.
 */
export const WidgetCluster: React.FC<SpanProps & CommonProps & {
  wrap?: boolean
  justify?: "start" | "center" | "end" | "between"
}> = ({
  rows,
  cols,
  tone,
  stroke,
  wrap = false,
  justify = "start",
  className,
  style,
  children,
}) => (
  <div
    className={["vt-tile vt-tile--nested vt-cluster", className].filter(Boolean).join(" ")}
    data-rows={rows}
    data-cols={cols}
    data-tone={tone}
    data-stroke={stroke}
    style={{
      display: "flex",
      flexDirection: "row",
      flexWrap: wrap ? "wrap" : "nowrap",
      justifyContent:
        justify === "between" ? "space-between" :
        justify === "center"  ? "center"        :
        justify === "end"     ? "flex-end"      : "flex-start",
      alignItems: "center",
      gap: "var(--vt-gap)",
      ...style,
    }}
  >
    {children}
  </div>
)

/**
 * WidgetGrid — a 2D grid of equally-sized tile slots inside a parent tile.
 * tileRows/tileCols set the child slot size; children fill left-to-right,
 * top-to-bottom.
 */
export const WidgetGrid: React.FC<SpanProps & CommonProps & {
  tileRows: number
  tileCols: number
}> = ({
  rows,
  cols,
  tileRows,
  tileCols,
  tone,
  stroke,
  className,
  style,
  children,
}) => {
  const colCount = Math.max(1, Math.floor(cols / tileCols))
  const rowCount = Math.max(1, Math.floor(rows / tileRows))
  return (
    <div
      className={["vt-tile vt-tile--nested vt-grid", className].filter(Boolean).join(" ")}
      data-rows={rows}
      data-cols={cols}
      data-tone={tone}
      data-stroke={stroke}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
        gridTemplateRows:    `repeat(${rowCount}, minmax(0, 1fr))`,
        gap: "var(--vt-gap)",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/**
 * WidgetSplit — a two-region split. Primary/secondary widths are cols units.
 * primaryCols + secondaryCols must equal cols.
 */
export const WidgetSplit: React.FC<SpanProps & CommonProps & {
  primaryCols: number
  secondaryCols: number
}> = ({
  rows,
  cols,
  primaryCols,
  secondaryCols,
  tone,
  stroke,
  className,
  style,
  children,
}) => {
  if (IS_DEV && primaryCols + secondaryCols !== cols) {
    // eslint-disable-next-line no-console
    console.warn(
      `[interior-grid] WidgetSplit: primaryCols (${primaryCols}) + secondaryCols (${secondaryCols}) must equal cols (${cols}).`,
    )
  }
  return (
    <div
      className={["vt-tile vt-tile--nested vt-split", className].filter(Boolean).join(" ")}
      data-rows={rows}
      data-cols={cols}
      data-tone={tone}
      data-stroke={stroke}
      style={{
        display: "grid",
        gridTemplateColumns: `${primaryCols}fr ${secondaryCols}fr`,
        gap: "var(--vt-gap)",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/**
 * WidgetVisualFrame — a tile that owns a fixed aspect ratio (chart, image,
 * canvas). Snap rows so height ≈ width / ratio; the primitive does not do
 * the math for you — pick rows and cols so the ratio lands on the grid.
 */
export const WidgetVisualFrame: React.FC<SpanProps & CommonProps & {
  ratio?: "1/1" | "4/3" | "16/9" | "3/4" | "2/1"
}> = ({
  rows,
  cols,
  ratio = "1/1",
  tone,
  stroke,
  className,
  style,
  children,
}) => (
  <div
    className={["vt-tile", className].filter(Boolean).join(" ")}
    data-rows={rows}
    data-cols={cols}
    data-tone={tone}
    data-stroke={stroke}
    data-media="frame"
    data-ratio={ratio}
    style={style}
  >
    {children}
  </div>
)
