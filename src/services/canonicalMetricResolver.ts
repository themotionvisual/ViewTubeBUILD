import { METRIC_REGISTRY, type CanonicalMetricKey, type CanonicalVideoRow } from "./analyticsContract"

export type CoverageRowStatus =
 | "received"
 | "missing"
 | "not_applicable"
 | "not_connected"

export interface ResolvedMetricValue {
 value: number | null
 status: CoverageRowStatus
 reason: "actual" | "derived" | "fallback" | "missing"
}



const numeric = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value === "string") {
  const cleaned = value.replace(/,/g, "").replace(/%/g, "").trim()
  if (!cleaned) return null
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
 }
 return null
}

const derive = (row: CanonicalVideoRow, metricKey: CanonicalMetricKey): number | null => {
 if (metricKey === "watchHours") {
  const avdCell = row.metrics.avdSeconds
  const viewsCell = row.metrics.views
  if (
   avdCell &&
   avdCell.status !== "unavailable" &&
   viewsCell &&
   viewsCell.status !== "unavailable" &&
   avdCell.value !== null &&
   viewsCell.value !== null
  ) {
   return (avdCell.value * viewsCell.value) / 3600
  }
 }
 if (metricKey === "rpm") {
  const revenue = row.metrics.revenue
  const views = row.metrics.views
  if (
   revenue &&
   revenue.status !== "unavailable" &&
   views &&
   views.status !== "unavailable" &&
   revenue.value !== null &&
   views.value !== null &&
   views.value > 0
  ) {
   return (revenue.value / views.value) * 1000
  }
 }
 return null
}

export const resolveMetricNumber = (
 row: CanonicalVideoRow,
 metricKey: CanonicalMetricKey,
): ResolvedMetricValue => {
 const metricCell = row.metrics[metricKey]
 if (metricCell && metricCell.status !== "unavailable" && metricCell.value !== null) {
  return {
   value: metricCell.value,
   status: "received",
   reason: metricCell.status === "derived" ? "derived" : "actual",
  }
 }

 const fallbackFromRow = (METRIC_REGISTRY[metricKey]?.aliases || [])
  .map((key) => numeric((row as unknown as Record<string, unknown>)[key]))
  .find((value): value is number => value !== null)
 if (fallbackFromRow !== undefined) {
  if (metricKey === "watchHours") {
   const looksLikeMinutes = fallbackFromRow > 24 * 365
   return {
    value: looksLikeMinutes ? fallbackFromRow / 60 : fallbackFromRow,
    status: "received",
    reason: "fallback",
   }
  }
  return { value: fallbackFromRow, status: "received", reason: "fallback" }
 }

 const derived = derive(row, metricKey)
 if (derived !== null && Number.isFinite(derived)) {
  return { value: derived, status: "received", reason: "derived" }
 }

 return { value: null, status: "missing", reason: "missing" }
}
