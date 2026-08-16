import type {
 AnalyticsWindow,
 CanonicalRawAuditEntry,
 CanonicalVideoRecord,
} from "./contracts"
import { buildMetricValue, mergeMetricWindows } from "./normalizers/video"
import {
 fetchCanonicalAnalyticsReport,
 getWindowRange,
 rowsToObjects,
 toMetricNumber,
} from "./query"
import {
 getCanonicalOwnerId,
 getCanonicalOwnerModeEnabled,
} from "./storage"

const OWNER_WINDOWS: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d"]
const OWNER_METRICS = [
 "videoThumbnailImpressions",
 "videoThumbnailImpressionsClickRate",
]

const buildUnsupportedReachMetrics = (reasonCode: string) =>
 Object.fromEntries(
  OWNER_METRICS.map((metricKey) => [
   metricKey,
   buildMetricValue(null, "owner_api", "unsupported", reasonCode),
  ]),
 )

export const syncOwnerModeReach = async (
 channelId: string,
 records: CanonicalVideoRecord[],
 syncRunId: string,
 windows: AnalyticsWindow[] = OWNER_WINDOWS,
): Promise<{
 records: CanonicalVideoRecord[]
 audit: CanonicalRawAuditEntry[]
}> => {
 const ownerModeEnabled = getCanonicalOwnerModeEnabled()
 const ownerId = getCanonicalOwnerId()
 const byVideoId = new Map(records.map((record) => [record.videoId, record]))
 const audit: CanonicalRawAuditEntry[] = []

 if (!ownerModeEnabled || !ownerId) {
  windows.forEach((window) => {
   audit.push({
    id: `${syncRunId}::owner_mode::${window}`,
    channelId,
    syncRunId,
    stage: "owner_mode",
    source: "owner_api",
    window,
    recordedAt: new Date().toISOString(),
    payload: {
     status: "unsupported",
     reasonCode: "not_available_for_auth_mode",
     fallbackPriority: ["content_owner", "csv", "channel_mine_unsupported"],
    },
   })
  })
  return { records, audit }
 }

 for (const window of windows) {
  const { startDate, endDate } = getWindowRange(window)
  try {
   const payload = await fetchCanonicalAnalyticsReport(
    {
     ids: `contentOwner==${ownerId}`,
     startDate,
     endDate,
     metrics: OWNER_METRICS,
     dimensions: ["video"],
     maxResults: 200,
     sort: "-videoThumbnailImpressions",
    },
    "Failed to fetch owner-mode thumbnail reach metrics",
   )
   const rows = rowsToObjects(payload)
   rows.forEach((row) => {
    const videoId = String(row.video || row.videoId || "")
    const current = byVideoId.get(videoId)
    if (!current) return
    byVideoId.set(
     videoId,
     mergeMetricWindows(current, window, {
      videoThumbnailImpressions: buildMetricValue(
       toMetricNumber(row.videoThumbnailImpressions),
       "owner_api",
      ),
      videoThumbnailImpressionsClickRate: buildMetricValue(
       toMetricNumber(row.videoThumbnailImpressionsClickRate),
       "owner_api",
      ),
     }),
    )
   })
   audit.push({
    id: `${syncRunId}::owner_mode::${window}`,
    channelId,
    syncRunId,
    stage: "owner_mode",
    source: "owner_api",
    window,
    recordedAt: new Date().toISOString(),
    payload: {
      status: "available",
      ownerId,
      rowCount: rows.length,
      fallbackPriority: ["content_owner", "csv", "channel_mine_unsupported"],
     },
   })
  } catch (error) {
   byVideoId.forEach((record, videoId) => {
    byVideoId.set(
     videoId,
     mergeMetricWindows(
      record,
      window,
      buildUnsupportedReachMetrics("report_shape_rejected"),
     ),
    )
   })
   audit.push({
    id: `${syncRunId}::owner_mode::${window}`,
    channelId,
    syncRunId,
    stage: "owner_mode",
    source: "owner_api",
    window,
    recordedAt: new Date().toISOString(),
    payload: {
     status: "failed",
     ownerId,
     reason: error instanceof Error ? error.message : String(error),
     fallbackPriority: ["content_owner", "csv", "channel_mine_unsupported"],
    },
   })
  }
 }

 return { records: Array.from(byVideoId.values()), audit }
}
