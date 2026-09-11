import type { CanonicalAnomalyDatasetRows, ViewTubeAnomaly } from "./contracts"

const numeric = (value: unknown): number | undefined => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value !== "string" || !value.trim()) return undefined
 const parsed = Number(value.replace(/[$,% ,]/g, ""))
 return Number.isFinite(parsed) ? parsed : undefined
}

const median = (values: number[]): number => {
 const sorted = [...values].sort((a, b) => a - b)
 if (!sorted.length) return 0
 const middle = Math.floor(sorted.length / 2)
 return sorted.length % 2
  ? sorted[middle]
  : (sorted[middle - 1] + sorted[middle]) / 2
}

const mad = (values: number[], center: number): number =>
 median(values.map((value) => Math.abs(value - center)))

const clamp = (value: number, minimum = 0, maximum = 100): number =>
 Math.max(minimum, Math.min(maximum, value))

export const detectRobustMagnitudeAnomaly = (input: {
 channelId: string | null
 datasetId: string
 family: string
 metric: string
 entity?: string
 observations: Array<{ date: string; value: number }>
 evidence: CanonicalAnomalyDatasetRows
}): ViewTubeAnomaly | null => {
 if (input.observations.length < 5) return null
 const ordered = [...input.observations].sort((a, b) => a.date.localeCompare(b.date))
 const latest = ordered[ordered.length - 1]
 const baselineValues = ordered.slice(0, -1).map((point) => point.value)
 const baseline = median(baselineValues)
 const dispersion = mad(baselineValues, baseline)
 const robustZ = dispersion === 0
  ? latest.value === baseline ? 0 : 10
  : 0.6745 * (latest.value - baseline) / dispersion
 const relativeDelta = baseline === 0
  ? latest.value > 0 ? 10 : 0
  : (latest.value - baseline) / Math.abs(baseline)

 if (Math.abs(robustZ) < 3.5 && Math.abs(relativeDelta) < 0.5) return null

 const surpriseScore = clamp(Math.max(Math.abs(robustZ) * 10, Math.abs(relativeDelta) * 45))
 const volumeWeight = Math.log10(Math.max(10, Math.abs(latest.value))) * 12
 const impactScore = clamp(surpriseScore * 0.62 + volumeWeight)

 return {
  id: [input.datasetId, input.entity || "all", input.metric, latest.date].join(":"),
  channelId: input.channelId,
  detectedAt: latest.date,
  datasetId: input.datasetId,
  family: input.family,
  kind: latest.value >= baseline ? "spike" : "drop",
  entity: input.entity,
  metric: input.metric,
  currentValue: latest.value,
  baselineValue: baseline,
  relativeDelta,
  surpriseScore: Math.round(surpriseScore),
  impactScore: Math.round(impactScore),
  confidence: Math.round(clamp(65 + Math.min(25, input.observations.length))),
  evidence: [{
   id: [input.evidence.snapshotId, input.datasetId, input.entity || "all", input.metric].join(":"),
   datasetId: input.datasetId,
   source: input.evidence.sources.join(",") || "unknown",
   snapshotId: input.evidence.snapshotId,
   updatedAt: input.evidence.updatedAt,
  }],
 }
}

export const groupRowsIntoDailySeries = (input: {
 dataset: CanonicalAnomalyDatasetRows
 dateKey: string
 metricKey: string
 entityKey?: string
}): Array<{ entity?: string; observations: Array<{ date: string; value: number }> }> => {
 const grouped = new Map<string, Array<{ date: string; value: number }>>()
 input.dataset.rows.forEach((row) => {
  const date = String(row[input.dateKey] || "")
  const value = numeric(row[input.metricKey])
  if (!date || value === undefined) return
  const entity = input.entityKey ? String(row[input.entityKey] || "Unknown") : ""
  const list = grouped.get(entity) || []
  list.push({ date, value })
  grouped.set(entity, list)
 })
 return [...grouped.entries()].map(([entity, observations]) => ({
  entity: entity || undefined,
  observations,
 }))
}
