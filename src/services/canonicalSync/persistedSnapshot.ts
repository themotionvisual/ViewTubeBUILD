import {
 hasYouTubeAnalyticsCache,
 readYouTubeAnalyticsCache,
} from "../analytics/DataStore"
import {
 listCanonicalChannelDailyRows,
 listCanonicalGeographyRows,
 listCanonicalTrafficRows,
} from "./storage"
import { getCanonicalSyncOverview } from "./repository"

export type PersistedAnalyticsSnapshot = {
 hasCanonicalRows: boolean
 hasLegacyCache: boolean
 hasDaily: boolean
 hasTraffic: boolean
 hasGeography: boolean
 hasAnyLocalData: boolean
 lastCanonicalSyncAt: string | null
}

export const getPersistedAnalyticsSnapshot =
 async (): Promise<PersistedAnalyticsSnapshot> => {
  const [overview, dailyRows, trafficRows, geographyRows] = await Promise.all([
   getCanonicalSyncOverview(),
   listCanonicalChannelDailyRows(),
   listCanonicalTrafficRows(),
   listCanonicalGeographyRows(),
  ])
  const cache = readYouTubeAnalyticsCache()
  const hasLegacyCache = hasYouTubeAnalyticsCache(cache)
  const hasDaily = dailyRows.length > 0
  const hasTraffic = trafficRows.length > 0
  const hasGeography = geographyRows.length > 0
  const hasCanonicalRows =
   hasDaily ||
   hasTraffic ||
   hasGeography ||
   Number(overview.videoCount || 0) > 0 ||
   Number(overview.channelCount || 0) > 0

  return {
   hasCanonicalRows,
   hasLegacyCache,
   hasDaily,
   hasTraffic,
   hasGeography,
   hasAnyLocalData: hasCanonicalRows || hasLegacyCache,
   lastCanonicalSyncAt:
    overview.lastRun?.completedAt ||
    overview.lastRun?.startedAt ||
    (typeof cache.lastSynced === "number" && Number.isFinite(cache.lastSynced)
     ? new Date(cache.lastSynced).toISOString()
     : null),
  }
 }
