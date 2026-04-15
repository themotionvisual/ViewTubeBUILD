export type MetricConfidence = "raw_direct" | "derived_exact" | "unavailable"

const toNumber = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string") return null
 const cleaned = value.replace(/,/g, "").replace(/%/g, "").trim()
 if (!cleaned) return null
 const parsed = Number(cleaned)
 return Number.isFinite(parsed) ? parsed : null
}

const firstNumber = (row: Record<string, unknown>, keys: string[]): number | null => {
 for (const key of keys) {
  const value = toNumber(row[key])
  if (value !== null) return value
 }
 return null
}

export const METRIC_ALIASES = {
 views: ["Views", "View count", "viewCount", "views", "Engaged views", "engagedViews"],
 impressions: ["Impressions", "impressions", "videoThumbnailImpressions"],
 ctrPercent: [
  "CTR (%)",
  "CTR",
  "ctr",
  "Impressions click-through rate (%)",
  "impressionClickThroughRate",
  "impressionsClickThroughRate",
  "videoThumbnailImpressionsClickRate",
  "clickThroughRate",
 ],
 avpPercent: ["AVP (%)", "Average percentage viewed (%)", "averageViewPercentage", "adjustedAVP"],
} as const

export const getViewsRaw = (row: Record<string, unknown>): number | null =>
 firstNumber(row, METRIC_ALIASES.views)

export const getImpressionsRaw = (row: Record<string, unknown>): number | null =>
 firstNumber(row, METRIC_ALIASES.impressions)

export const getCtrRawPercent = (row: Record<string, unknown>): number | null => {
 const raw = firstNumber(row, METRIC_ALIASES.ctrPercent)
 if (raw === null) return null
 return raw > 0 && raw <= 1 ? raw * 100 : raw
}

export const getAvpRawPercent = (row: Record<string, unknown>): number | null => {
 const raw = firstNumber(row, METRIC_ALIASES.avpPercent)
 if (raw === null) return null
 return raw > 0 && raw <= 1 ? raw * 100 : raw
}

export const resolveCtrPercent = (
 row: Record<string, unknown>,
): { value: number | null; confidence: MetricConfidence } => {
 const rawCtr = getCtrRawPercent(row)
 if (rawCtr !== null && rawCtr > 0) {
  return { value: rawCtr, confidence: "raw_direct" }
 }

 const views = getViewsRaw(row)
 const impressions = getImpressionsRaw(row)
 if (views !== null && views > 0 && impressions !== null && impressions > 0) {
  return { value: (views / impressions) * 100, confidence: "derived_exact" }
 }

 return { value: null, confidence: "unavailable" }
}

export const resolveImpressions = (
 row: Record<string, unknown>,
): { value: number | null; confidence: MetricConfidence } => {
 const raw = getImpressionsRaw(row)
 if (raw !== null && raw > 0) {
  return { value: raw, confidence: "raw_direct" }
 }

 const views = getViewsRaw(row)
 const ctr = getCtrRawPercent(row)
 if (views !== null && views > 0 && ctr !== null && ctr > 0) {
  return { value: views / (ctr / 100), confidence: "derived_exact" }
 }

 return { value: null, confidence: "unavailable" }
}
