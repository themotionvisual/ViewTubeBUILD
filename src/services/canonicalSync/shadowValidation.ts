import { getMasterRows } from "../analytics/Selectors"
import type {
 CanonicalVideoRecord,
 ShadowDiffRecord,
 ShadowMismatch,
} from "./contracts"

const sumMetric = (
 records: CanonicalVideoRecord[],
 window: "lifetime" | "365d" | "90d" | "28d",
 metricKey: string,
): number =>
 records.reduce((sum, record) => {
  const value = record.metricsByWindow?.[window]?.[metricKey]
  return sum + (typeof value === "number" && Number.isFinite(value) ? value : 0)
 }, 0)

export const buildShadowDiff = (
 channelId: string,
 records: CanonicalVideoRecord[],
): ShadowDiffRecord => {
 const legacyRows = getMasterRows("lifetime", "api")
 const canonicalIds = new Set(records.map((record) => record.videoId))
 const legacyIds = new Set(legacyRows.map((row) => String(row.videoId || "")))

 const missingInCanonical = Array.from(legacyIds).filter(
  (videoId) => !canonicalIds.has(videoId),
 )
 const missingInLegacy = Array.from(canonicalIds).filter(
  (videoId) => !legacyIds.has(videoId),
 )

 const fieldPairs: Array<[string, number | null, number | null]> = [
  [
   "views",
   legacyRows.reduce((sum, row) => sum + Number(row.metrics?.views?.value || 0), 0),
   sumMetric(records, "lifetime", "views"),
  ],
  [
   "likes",
   legacyRows.reduce((sum, row) => sum + Number(row.metrics?.likes?.value || 0), 0),
   sumMetric(records, "lifetime", "likes"),
  ],
  [
   "comments",
   legacyRows.reduce((sum, row) => sum + Number(row.metrics?.comments?.value || 0), 0),
   sumMetric(records, "lifetime", "comments"),
  ],
  [
   "revenue",
   legacyRows.reduce((sum, row) => sum + Number(row.metrics?.revenue?.value || 0), 0),
   sumMetric(records, "lifetime", "estimatedRevenue"),
  ],
 ]
 const mismatchedFields: ShadowMismatch[] = fieldPairs
  .filter(([, legacyValue, canonicalValue]) => legacyValue !== canonicalValue)
  .map(([key, legacyValue, canonicalValue]) => ({
   key,
   legacyValue,
   canonicalValue,
  }))

 return {
  id: `${channelId}::${new Date().toISOString()}`,
  channelId,
  createdAt: new Date().toISOString(),
  legacyVideoCount: legacyRows.length,
  canonicalVideoCount: records.length,
  missingInCanonical,
  missingInLegacy,
  mismatchedFields,
 }
}
