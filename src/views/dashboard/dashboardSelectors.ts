/**
 * Pure selectors for dashboard analytics rows.
 *
 * Phase 3 of docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_OPTIMIZATION_PLAN.md:
 * "move sorting, aggregation, and normalization into cached selectors outside
 * render paths". These were inline in useDashboardData, where the sort and the
 * reduces re-ran on every render of the hook — and the hook feeds every widget.
 *
 * Everything here is pure and takes its inputs explicitly, so it can be tested
 * without mounting a component and memoized by the caller.
 */

/** A daily analytics row. Shapes vary by source, hence the loose index. */
export type DailyRow = Record<string, unknown>

/**
 * Sources disagree on the date key — VT-SYNC uses `date`, the analytics ledger
 * `day`, and some legacy payloads capitalise them.
 */
const DATE_KEYS = ["date", "day", "Date", "Day"] as const

export const readRowDate = (row: DailyRow): number => {
  for (const key of DATE_KEYS) {
    const value = row?.[key]
    if (value !== undefined && value !== null && value !== "") {
      const ts = new Date(String(value)).getTime()
      if (!Number.isNaN(ts)) return ts
    }
  }
  return 0
}

/** Newest first. Returns a new array; never mutates the input. */
export const sortDailyDescending = (rows: readonly DailyRow[]): DailyRow[] =>
  [...rows].sort((left, right) => readRowDate(right) - readRowDate(left))

/**
 * First key that carries a usable number. Sources name the same measure
 * differently (`watchTime` vs `estimatedMinutesWatched`), so callers pass
 * every alias they accept.
 */
export const readRowMetric = (row: DailyRow, ...keys: string[]): number => {
  for (const key of keys) {
    if (!key) continue
    const value = row?.[key]
    if (value !== undefined && value !== null && value !== "") {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  return 0
}

/** Sum one measure across rows, accepting any of its aliases per row. */
export const sumRowMetric = (
  rows: readonly DailyRow[],
  ...keys: string[]
): number => rows.reduce((total, row) => total + readRowMetric(row, ...keys), 0)
