import type {
 AnalyticsWindow,
 CanonicalRawAuditEntry,
 CanonicalVideoRecord,
} from "./contracts"
import {
 applyCreatorContentType,
 buildMetricValue,
 mergeMetricWindows,
} from "./normalizers/video"
import {
 chunkItems,
 fetchCanonicalAnalyticsReport,
 getWindowRange,
 rowsToObjects,
 toMetricNumber,
} from "./query"

const COHORT_WINDOWS: AnalyticsWindow[] = ["7d", "28d", "90d"]
const COHORT_METRICS = [
 "uniqueViewers",
 "averageViewsPerViewer",
 "uniqueReach",
 "newViewers",
 "returningViewers",
 "casualViewers",
 "regularViewers",
]
const CHUNK_SIZE = 100

const buildUnavailableCohortMetrics = (
 reasonCode:
  | "privacy_threshold_not_met"
  | "report_shape_rejected"
  | "not_available_for_auth_mode"
  | "window_not_supported_for_cohort_metric",
) =>
 Object.fromEntries(
  COHORT_METRICS.map((metricKey) => [
   metricKey,
   buildMetricValue(null, "analytics_api", "unavailable", reasonCode),
  ]),
 )

export const syncViewerCohorts = async (
 channelId: string,
 records: CanonicalVideoRecord[],
 syncRunId: string,
 windows: AnalyticsWindow[] = COHORT_WINDOWS,
): Promise<{
 records: CanonicalVideoRecord[]
 audit: CanonicalRawAuditEntry[]
}> => {
 const byVideoId = new Map(records.map((record) => [record.videoId, record]))
 const audit: CanonicalRawAuditEntry[] = []

 for (const window of windows) {
  if (!COHORT_WINDOWS.includes(window)) {
   audit.push({
    id: `${syncRunId}::viewer_cohorts::${window}`,
    channelId,
    syncRunId,
    stage: "viewer_cohorts",
    source: "analytics_api",
    window,
    recordedAt: new Date().toISOString(),
    payload: {
     status: "skipped",
     reasonCode: "window_not_supported_for_cohort_metric",
    },
   })
   continue
  }

  const { startDate, endDate } = getWindowRange(window)
  let rowCount = 0
  let thresholdNullCount = 0
  let rejectedWindowCount = 0

  for (const chunk of chunkItems(records, CHUNK_SIZE)) {
   const ids = chunk.map((record) => record.videoId)
   const missingInPayload = new Set(ids)
   try {
    const payload = await fetchCanonicalAnalyticsReport(
     {
      startDate,
      endDate,
      metrics: COHORT_METRICS,
      dimensions: ["video"],
      filters: [`video==${ids.join(",")}`],
      maxResults: ids.length,
     },
     "Failed to fetch canonical viewer cohort metrics",
    )
    const rows = rowsToObjects(payload)
    rowCount += rows.length
    rows.forEach((row) => {
      const videoId = String(row.video || row.videoId || "")
      const current = byVideoId.get(videoId)
      if (!current) return
      missingInPayload.delete(videoId)
      const metrics = Object.fromEntries(
       COHORT_METRICS.map((metricKey) => {
        const value = toMetricNumber(row[metricKey])
        if (value === null) thresholdNullCount += 1
        return [
         metricKey,
         buildMetricValue(
          value,
          "analytics_api",
          value === null ? "unavailable" : "available",
          value === null ? "privacy_threshold_not_met" : undefined,
         ),
        ]
       }),
      )
      byVideoId.set(videoId, mergeMetricWindows(current, window, metrics))
    })
   } catch (error) {
    rejectedWindowCount += ids.length
    chunk.forEach((record) => {
     const current = byVideoId.get(record.videoId)
     if (!current) return
     byVideoId.set(
      record.videoId,
      mergeMetricWindows(
       current,
       window,
       buildUnavailableCohortMetrics("report_shape_rejected"),
      ),
     )
    })
    continue
   }

   missingInPayload.forEach((videoId) => {
    const current = byVideoId.get(videoId)
    if (!current) return
    byVideoId.set(
     videoId,
     mergeMetricWindows(
      current,
      window,
      buildUnavailableCohortMetrics("privacy_threshold_not_met"),
     ),
    )
    thresholdNullCount += COHORT_METRICS.length
   })
  }

  audit.push({
   id: `${syncRunId}::viewer_cohorts::${window}`,
   channelId,
   syncRunId,
   stage: "viewer_cohorts",
   source: "analytics_api",
   window,
   recordedAt: new Date().toISOString(),
   payload: {
    attemptedReportShape: "video cohort metrics + subscribedStatus splits",
    acceptedWindow: window,
    rowCount,
    thresholdNullCount,
    rejectedWindowCount,
   },
  })
 }

 const creatorContentTypeWindow = windows.includes("90d")
  ? "90d"
  : windows.includes("28d")
   ? "28d"
   : windows[0]
 if (creatorContentTypeWindow) {
  const { startDate, endDate } = getWindowRange(creatorContentTypeWindow)
  for (const chunk of chunkItems(Array.from(byVideoId.values()), CHUNK_SIZE)) {
   const ids = chunk.map((record) => record.videoId)
   try {
    const payload = await fetchCanonicalAnalyticsReport(
     {
      startDate,
      endDate,
      metrics: ["views"],
      dimensions: ["video", "creatorContentType"],
      filters: [`video==${ids.join(",")}`],
      maxResults: ids.length,
     },
     "Failed to fetch creatorContentType for canonical videos",
    )
    rowsToObjects(payload).forEach((row) => {
     const videoId = String(row.video || row.videoId || "")
     const current = byVideoId.get(videoId)
     const creatorContentType = String(row.creatorContentType || "").toUpperCase()
     if (!current || !creatorContentType) return
     byVideoId.set(
      videoId,
      applyCreatorContentType(current, creatorContentType as any),
     )
    })
   } catch {
    // Supplemental classification only.
   }
  }
 }

 return {
  records: Array.from(byVideoId.values()),
  audit,
 }
}
