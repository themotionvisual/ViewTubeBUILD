import {
 handleYouTubeApiError,
 proxyFetch,
 refreshTokenIfExpired,
} from "../youtube/youtubeApiClient"
import type {
 AnalyticsWindow,
 CanonicalPlaylistRecord,
 CanonicalPlaylistWindowSummary,
 CanonicalRawAuditEntry,
} from "./contracts"
import { buildMetricValue } from "./normalizers/video"
import {
 fetchCanonicalAnalyticsReport,
 getWindowRange,
 rowsToObjects,
 toMetricNumber,
} from "./query"

const PLAYLIST_WINDOWS: AnalyticsWindow[] = ["lifetime", "365d", "90d", "28d"]
const PLAYLIST_METRICS = [
 "playlistViews",
 "playlistEstimatedMinutesWatched",
 "playlistAverageViewDuration",
 "playlistSaves",
 "playlistStarts",
 "viewsPerPlaylistStart",
 "averageTimeInPlaylist",
 "engagedViews",
 "views",
 "estimatedMinutesWatched",
 "averageViewDuration",
]

const fetchCanonicalPlaylists = async (): Promise<CanonicalPlaylistRecord[]> => {
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(
  "https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50",
  {
   headers: token ? { Authorization: `Bearer ${token}` } : {},
  },
 )
 if (!response.ok) {
  await handleYouTubeApiError(response, "Failed to fetch canonical playlists")
 }
 const data = await response.json()
 return Array.isArray(data?.items)
  ? data.items.map((item: any) => ({
     channelId: String(item?.snippet?.channelId || ""),
     playlistId: String(item?.id || ""),
     title: String(item?.snippet?.title || ""),
     description: String(item?.snippet?.description || ""),
     thumbnail: String(
      item?.snippet?.thumbnails?.high?.url ||
       item?.snippet?.thumbnails?.medium?.url ||
       item?.snippet?.thumbnails?.default?.url ||
       "",
     ),
     itemCount: Number(item?.contentDetails?.itemCount || 0) || 0,
     publishedAt: String(item?.snippet?.publishedAt || ""),
     syncedAt: new Date().toISOString(),
    }))
  : []
}

export const syncPlaylists = async (
 channelId: string,
 syncRunId: string,
 windows: AnalyticsWindow[] = PLAYLIST_WINDOWS,
): Promise<{
 playlists: CanonicalPlaylistRecord[]
 summaries: CanonicalPlaylistWindowSummary[]
 audit: CanonicalRawAuditEntry[]
}> => {
 const playlists = await fetchCanonicalPlaylists()
 const summaries: CanonicalPlaylistWindowSummary[] = []
 const audit: CanonicalRawAuditEntry[] = []

 for (const window of windows) {
  const { startDate, endDate } = getWindowRange(window)
  for (const playlist of playlists) {
   try {
    const payload = await fetchCanonicalAnalyticsReport(
     {
      startDate,
      endDate,
      metrics: PLAYLIST_METRICS,
      filters: [`playlist==${playlist.playlistId}`],
     },
     "Failed to fetch canonical playlist analytics",
    )
    const row = rowsToObjects(payload)[0] || {}
    const metrics = Object.fromEntries(
     PLAYLIST_METRICS.map((metricKey) => [
      metricKey,
      buildMetricValue(toMetricNumber(row[metricKey]), "analytics_api"),
     ]),
    )
    summaries.push({
     channelId,
     playlistId: playlist.playlistId,
     window,
     startDate,
     endDate,
     metrics,
     syncedAt: new Date().toISOString(),
    })
    audit.push({
     id: `${syncRunId}::playlist_sync::${window}::${playlist.playlistId}`,
     channelId,
     syncRunId,
     stage: "playlist_sync",
     source: "analytics_api",
     window,
     recordedAt: new Date().toISOString(),
     payload: {
      playlistId: playlist.playlistId,
      rowCount: Array.isArray(payload?.rows) ? payload.rows.length : 0,
      columnHeaders: payload?.columnHeaders || [],
     },
    })
   } catch (error) {
    summaries.push({
     channelId,
     playlistId: playlist.playlistId,
     window,
     startDate,
     endDate,
     metrics: Object.fromEntries(
      PLAYLIST_METRICS.map((metricKey) => [
       metricKey,
       buildMetricValue(null, "analytics_api", "unsupported", "report_shape_rejected"),
      ]),
     ),
     syncedAt: new Date().toISOString(),
    })
    audit.push({
     id: `${syncRunId}::playlist_sync::${window}::${playlist.playlistId}`,
     channelId,
     syncRunId,
     stage: "playlist_sync",
     source: "analytics_api",
     window,
     recordedAt: new Date().toISOString(),
     payload: {
      playlistId: playlist.playlistId,
      status: "failed",
      reason: error instanceof Error ? error.message : String(error),
     },
    })
   }
  }
 }

 return { playlists, summaries, audit }
}
