import type { ControllerRow } from "./VisualModuleController"

/**
 * How wide a controller row has to be so that changing a setting never resizes
 * it.
 *
 * The controller column sits beside the evidence canvas, so a row that grows to
 * fit the value currently selected drags the canvas sideways when the reader
 * picks a longer one. Every row is therefore measured against the widest value
 * it can ever show and holds that width for every setting.
 *
 * Rows that carry their own candidates — `dropdown`, `toggle`, `rankedBy`,
 * `metricMultiSelect` — need nothing from the caller. Rows whose value the
 * module cycles rather than picks from a list (`number`, `text`, `label`,
 * `split`) cannot know their range, so they take `widthValues`; without one
 * they fall back to the current value and can still move.
 *
 * Lives outside `VisualModuleController.tsx` so the component file exports
 * components, and so the rule can be unit-tested without rendering anything.
 */

const controllerMinWidth = 195
/** Digits a counter reserves before its width can start tracking its value. */
const CONTROLLER_NUMBER_DIGIT_RESERVE = 4
/** Characters a metric chip reserves before it starts truncating. */
const CONTROLLER_CHIP_CHARACTER_BUDGET = 8
const measureTextWidth = (value: string, fontSize = 16): number => {
  const length = Math.max(0, value.trim().length)
  return Math.ceil(length * fontSize * 0.72)
}

/**
 * Width of the widest value a row can ever show, not the one it shows now.
 *
 * A controller column that resizes when the reader changes a setting drags the
 * whole canvas with it: pick "LIFETIME" instead of "ONE YEAR" and the evidence
 * area reflows sideways. So every row is measured against its full candidate
 * set and holds that width for every setting.
 *
 * Rows that carry their candidates already — `dropdown`, `toggle`, `rankedBy`,
 * `metricMultiSelect` — need nothing from the caller. Rows whose value is
 * cycled by the module rather than chosen from a list (`number`, `text`,
 * `label`, `split`) cannot know their own range, so they take `widthValues`.
 * Without it the row falls back to its current value and will still move; the
 * `controllerWidthStability` test names the rows that need one.
 */
const widestOf = (candidates: readonly string[], fontSize?: number): number =>
  candidates.length === 0 ? 0 : Math.max(...candidates.map((value) => measureTextWidth(value, fontSize)))

const estimateRowMinWidth = (row: ControllerRow): number => {
  if (row.type === "number") {
    const fontSize = row.isBig === false ? 18 : 38
    // A counter that has not declared its range still reserves four digits, so
    // stepping 9 → 99 → 999 cannot move the column. Past that it grows, and a
    // caller that knows its ceiling passes `widthValues`.
    const candidates = row.widthValues?.length
      ? row.widthValues
      : [String(row.value).padStart(CONTROLLER_NUMBER_DIGIT_RESERVE, "8")]
    const unitWidth = row.unitLabel ? measureTextWidth(row.unitLabel, 13) + 8 : 0
    return Math.max(controllerMinWidth, widestOf(candidates, fontSize) + unitWidth + 64)
  }

  if (row.type === "text") {
    // No `labelPrefix` term: unlike `dropdown`, the text row never draws one —
    // it renders arrow, value, arrow — so reserving space for it would widen
    // the column for something that is not on screen.
    const candidates = row.widthValues?.length ? row.widthValues : [row.value]
    return Math.max(controllerMinWidth, widestOf(candidates) + 56)
  }

  if (row.type === "label") {
    const candidates = row.widthValues?.length ? row.widthValues : [row.value]
    return Math.max(controllerMinWidth, widestOf(candidates) + 28)
  }

  if (row.type === "dropdown") {
    const labelPrefixWidth = row.labelPrefix ? measureTextWidth(row.labelPrefix, 13) + 10 : 0
    // The option LABELS are what the row draws. Falling back to `row.value` is
    // only for a value with no matching option — including it unconditionally
    // would size the column against a raw key like "most-recent" that is never
    // on screen.
    const labels = row.options.map((option) => option.label)
    const widestOptionWidth = widestOf(labels.length > 0 ? labels : [row.value])
    return Math.max(controllerMinWidth, labelPrefixWidth + widestOptionWidth + 40)
  }

  if (row.type === "split") {
    const leftCandidates = row.leftWidthValues?.length ? row.leftWidthValues : [row.leftValue]
    const rightCandidates = row.rightWidthValues?.length ? row.rightWidthValues : [row.rightValue]
    return Math.max(controllerMinWidth, widestOf(leftCandidates) + widestOf(rightCandidates) + 96)
  }

  if (row.type === "rankedBy") {
    const labelWidth = measureTextWidth(row.label, 15) + 28
    const labels = row.options.map((option) => option.label)
    const widestOptionWidth = widestOf(labels.length > 0 ? labels : [row.value]) + 36
    return Math.max(controllerMinWidth, labelWidth + widestOptionWidth)
  }

  if (row.type === "metricMultiSelect") {
    // Sized for a full house — the most chips the row will ever print at once —
    // so toggling metrics never moves the column. The chips truncate by design
    // (`min-w-0 … truncate` inside a `flex-1` grid), so each one reserves a
    // readable width rather than its whole label; reserving the full label of
    // twelve metrics would make the column wider than the plot beside it.
    const maxLabels = row.maxLabels ?? 3
    const shown = Math.min(maxLabels, row.options.length)
    const widestLabel = widestOf(row.options.map((option) => option.label), 10)
    const chipWidth = Math.min(widestLabel, CONTROLLER_CHIP_CHARACTER_BUDGET * 10 * 0.72)
    const asLabels = shown * (chipWidth + 16) + 26
    // Past `maxLabels` the row collapses to count badges; take the larger of
    // the two so neither presentation moves the column.
    const asBadges = row.options.length * 17 + 34
    return Math.max(controllerMinWidth, asLabels, asBadges)
  }

  if (row.type === "toggle") {
    return Math.max(controllerMinWidth, widestOf([row.value, ...row.options]) + 56)
  }

  if (row.type === "statement") {
    return Math.max(controllerMinWidth, Math.min(260, measureTextWidth(row.value, 11) + 24))
  }

  return controllerMinWidth
}

export const estimateControllerRowWidth = estimateRowMinWidth
