/**
 * Formatting helpers shared by widget modules.
 *
 * Extracted from WidgetRenderer.tsx during Phase 2 of the dashboard
 * optimization plan so widgets lifted out of the resolver keep using one
 * implementation instead of copying it.
 */

/** 1234 -> "1.2K", 1234567 -> "1.2M". Non-numeric input formats as "0". */
export const formatHumanNumber = (value: unknown): string => {
  const v = Number(value)
  if (isNaN(v)) return "0"
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
  return v.toString()
}

/** A locale date string, or "Unknown date" when the value will not parse. */
export const formatUploadDate = (value: unknown): string => {
  const dt = new Date(String(value || ""))
  return Number.isNaN(dt.getTime()) ? "Unknown date" : dt.toLocaleDateString()
}
