import {
 handleYouTubeApiError,
 proxyFetch,
 refreshTokenIfExpired,
} from "../youtube/youtubeApiClient"
import type { CanonicalChannelRecord, CanonicalRawAuditEntry } from "./contracts"
import { normalizeChannelRecord } from "./normalizers/channel"

export const syncChannelBootstrap = async (
 syncRunId: string,
): Promise<{
 channel: CanonicalChannelRecord
 audit: CanonicalRawAuditEntry
}> => {
 const token = await refreshTokenIfExpired()
 const response = await proxyFetch(
  "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,brandingSettings,topicDetails,status,localizations&mine=true",
  {
   headers: token ? { Authorization: `Bearer ${token}` } : {},
  },
 )
 if (!response.ok) {
  await handleYouTubeApiError(response, "Failed to fetch canonical channel bootstrap")
 }
 const data = await response.json()
 const channel = normalizeChannelRecord(data?.items?.[0] || {})
 return {
  channel,
  audit: {
   id: `${syncRunId}::channel_bootstrap`,
   channelId: channel.channelId,
   syncRunId,
   stage: "channel_bootstrap",
   source: "data_api",
   recordedAt: new Date().toISOString(),
   payload: data,
  },
 }
}
