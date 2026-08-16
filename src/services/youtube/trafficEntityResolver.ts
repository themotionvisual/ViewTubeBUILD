import {
 BASE_URL,
 handleYouTubeApiError,
 proxyFetch,
} from "./youtubeApiClient"
import { parseChannelHandleFromApi } from "./youtubeDataFetcher"

export type TrafficEntitySeed = {
 trafficSourceType?: string
 trafficSourceDetail?: string
 sourceTitle?: string
 sourceVideoId?: string
}

export type TrafficEntityResolution = {
 sourceTitle?: string
 sourceVideoId?: string
 resolvedEntityId?: string | null
 resolvedEntityType?: "channel" | "playlist" | "video" | "url" | "search_term" | null
 resolvedEntityTitle?: string | null
 resolvedEntityHandle?: string | null
 resolvedEntityUrl?: string | null
 resolvedEntitySubtitle?: string | null
}

type ChannelEntity = {
 id: string
 title: string
 handle: string | null
 url: string | null
}

type PlaylistEntity = {
 id: string
 title: string
 channelTitle: string | null
}

type VideoEntity = {
 id: string
 title: string
 channelTitle: string | null
}

const chunk = <T>(values: T[], size: number): T[][] => {
 const out: T[][] = []
 for (let index = 0; index < values.length; index += size) {
  out.push(values.slice(index, index + size))
 }
 return out
}

const text = (value: unknown): string => String(value ?? "").trim()

const unique = (values: Array<string | null | undefined>): string[] =>
 Array.from(new Set(values.map((value) => text(value)).filter(Boolean)))

const normalizeHandle = (value: string | null | undefined): string | null => {
 const raw = text(value)
 if (!raw) return null
 return raw.startsWith("@") ? raw : `@${raw}`
}

const extractUrlHostname = (value: string): string | null => {
 const raw = text(value)
 if (!raw) return null
 try {
  const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`)
  return parsed.hostname.replace(/^www\./i, "") || null
 } catch {
  return null
 }
}

const extractChannelId = (value: string): string | null => {
 const raw = text(value)
 if (!raw) return null
 const bare = raw.match(/^(UC[a-zA-Z0-9_-]{20,})$/)?.[1]
 if (bare) return bare
 const path = raw.match(/\/channel\/(UC[a-zA-Z0-9_-]{20,})/i)?.[1]
 return path || null
}

const extractPlaylistId = (value: string): string | null => {
 const raw = text(value)
 if (!raw) return null
 const listParam = raw.match(/[?&]list=([A-Za-z0-9_-]{10,})/i)?.[1]
 if (listParam) return listParam
 const bare = raw.match(/^((?:PL|UU|LL|FL|RD|OLAK5uy_)[A-Za-z0-9_-]{8,})$/)?.[1]
 return bare || null
}

const extractVideoId = (value: string): string | null => {
 const raw = text(value)
 if (!raw) return null
 const prefixed = raw.match(
  /^(?:YT_RELATED|RELATED_VIDEO|SHORTS_CONTENT_LINKS|RELATED_SHORTS)\.([A-Za-z0-9_-]{11})$/i,
 )?.[1]
 if (prefixed) return prefixed
 const watchParam = raw.match(/[?&]v=([A-Za-z0-9_-]{11})/i)?.[1]
 if (watchParam) return watchParam
 const shortPath = raw.match(/\/(?:shorts|watch|embed)\/([A-Za-z0-9_-]{11})/i)?.[1]
 if (shortPath) return shortPath
 const shortLink = raw.match(/youtu\.be\/([A-Za-z0-9_-]{11})/i)?.[1]
 if (shortLink) return shortLink
 const bare = raw.match(/^([A-Za-z0-9_-]{11})$/)?.[1]
 return bare || null
}

const fetchChannelEntities = async (
 token: string,
 ids: string[],
): Promise<Map<string, ChannelEntity>> => {
 const entities = new Map<string, ChannelEntity>()
 for (const batch of chunk(ids, 50)) {
  const response = await proxyFetch(
   `${BASE_URL}/channels?part=snippet,brandingSettings&id=${batch.join(",")}`,
   {
    headers: { Authorization: `Bearer ${token}` },
   },
  )
  if (!response.ok) {
   await handleYouTubeApiError(response, "Failed to resolve traffic channel entities")
  }
  const payload = await response.json()
  const items = Array.isArray(payload?.items) ? payload.items : []
  items.forEach((item: any) => {
   const id = text(item?.id)
   if (!id) return
   const title = text(item?.snippet?.title) || id
   const handle = normalizeHandle(parseChannelHandleFromApi(item))
   entities.set(id, {
    id,
    title,
    handle,
    url: handle ? `https://www.youtube.com/${handle}` : `https://www.youtube.com/channel/${id}`,
   })
  })
 }
 return entities
}

const fetchPlaylistEntities = async (
 token: string,
 ids: string[],
): Promise<Map<string, PlaylistEntity>> => {
 const entities = new Map<string, PlaylistEntity>()
 for (const batch of chunk(ids, 50)) {
  const response = await proxyFetch(
   `${BASE_URL}/playlists?part=snippet&id=${batch.join(",")}&maxResults=50`,
   {
    headers: { Authorization: `Bearer ${token}` },
   },
  )
  if (!response.ok) {
   await handleYouTubeApiError(response, "Failed to resolve traffic playlist entities")
  }
  const payload = await response.json()
  const items = Array.isArray(payload?.items) ? payload.items : []
  items.forEach((item: any) => {
   const id = text(item?.id)
   if (!id) return
   entities.set(id, {
    id,
    title: text(item?.snippet?.title) || id,
    channelTitle: text(item?.snippet?.channelTitle) || null,
   })
  })
 }
 return entities
}

const fetchVideoEntities = async (
 token: string,
 ids: string[],
): Promise<Map<string, VideoEntity>> => {
 const entities = new Map<string, VideoEntity>()
 for (const batch of chunk(ids, 50)) {
  const response = await proxyFetch(
   `${BASE_URL}/videos?part=snippet&id=${batch.join(",")}`,
   {
    headers: { Authorization: `Bearer ${token}` },
   },
  )
  if (!response.ok) {
   await handleYouTubeApiError(response, "Failed to resolve traffic video entities")
  }
  const payload = await response.json()
  const items = Array.isArray(payload?.items) ? payload.items : []
  items.forEach((item: any) => {
   const id = text(item?.id)
   if (!id) return
   entities.set(id, {
    id,
    title: text(item?.snippet?.title) || id,
    channelTitle: text(item?.snippet?.channelTitle) || null,
   })
  })
 }
 return entities
}

export const enrichTrafficEntityRows = async <T extends TrafficEntitySeed>(
 token: string,
 rows: T[],
): Promise<Array<T & TrafficEntityResolution>> => {
 const channelIds = unique(
  rows
   .filter((row) => text(row.trafficSourceType).toUpperCase() === "YT_CHANNEL")
   .map((row) => extractChannelId(text(row.trafficSourceDetail))),
 )
 const playlistIds = unique(
  rows
   .filter((row) => text(row.trafficSourceType).toUpperCase() === "PLAYLIST")
   .map((row) => extractPlaylistId(text(row.trafficSourceDetail))),
 )
 const videoIds = unique(
  rows
   .filter((row) =>
    ["RELATED_VIDEO", "YT_RELATED", "SHORTS_CONTENT_LINKS", "RELATED_SHORTS"].includes(
     text(row.trafficSourceType).toUpperCase(),
    ),
   )
   .map((row) => extractVideoId(text(row.trafficSourceDetail) || text(row.sourceVideoId))),
 )

 const [channelEntities, playlistEntities, videoEntities] = await Promise.all([
  channelIds.length > 0 ? fetchChannelEntities(token, channelIds) : Promise.resolve(new Map()),
  playlistIds.length > 0 ? fetchPlaylistEntities(token, playlistIds) : Promise.resolve(new Map()),
  videoIds.length > 0 ? fetchVideoEntities(token, videoIds) : Promise.resolve(new Map()),
 ])

 return rows.map((row) => {
  const sourceType = text(row.trafficSourceType).toUpperCase()
  const detail = text(row.trafficSourceDetail)
  if (sourceType === "YT_SEARCH") {
   return {
    ...row,
    sourceTitle: detail || row.sourceTitle,
    resolvedEntityId: detail || null,
    resolvedEntityType: "search_term" as const,
    resolvedEntityTitle: detail || null,
    resolvedEntitySubtitle: null,
    resolvedEntityHandle: null,
    resolvedEntityUrl: null,
   }
  }

  if (sourceType === "EXT_URL") {
   const hostname = extractUrlHostname(detail)
   return {
    ...row,
    sourceTitle: detail || row.sourceTitle,
    resolvedEntityId: detail || null,
    resolvedEntityType: detail ? ("url" as const) : null,
    resolvedEntityTitle: detail || null,
    resolvedEntitySubtitle: hostname && hostname !== detail ? hostname : null,
    resolvedEntityHandle: null,
    resolvedEntityUrl: detail || null,
   }
  }

  if (sourceType === "YT_CHANNEL") {
   const channelId = extractChannelId(detail)
   const entity = channelId ? channelEntities.get(channelId) : null
   return {
    ...row,
    sourceTitle: entity?.title || detail || row.sourceTitle,
    resolvedEntityId: entity?.id || channelId || null,
    resolvedEntityType: channelId ? ("channel" as const) : null,
    resolvedEntityTitle: entity?.title || null,
    resolvedEntityHandle: entity?.handle || null,
    resolvedEntityUrl: entity?.url || (channelId ? `https://www.youtube.com/channel/${channelId}` : null),
    resolvedEntitySubtitle: entity?.handle || channelId || null,
   }
  }

  if (sourceType === "PLAYLIST") {
   const playlistId = extractPlaylistId(detail)
   const entity = playlistId ? playlistEntities.get(playlistId) : null
   return {
    ...row,
    sourceTitle: entity?.title || detail || row.sourceTitle,
    resolvedEntityId: entity?.id || playlistId || null,
    resolvedEntityType: playlistId ? ("playlist" as const) : null,
    resolvedEntityTitle: entity?.title || null,
    resolvedEntityHandle: null,
    resolvedEntityUrl: playlistId
     ? `https://www.youtube.com/playlist?list=${playlistId}`
     : null,
    resolvedEntitySubtitle: entity?.channelTitle || playlistId || null,
   }
  }

  if (
   ["RELATED_VIDEO", "YT_RELATED", "SHORTS_CONTENT_LINKS", "RELATED_SHORTS"].includes(
    sourceType,
   )
  ) {
   const videoId = extractVideoId(detail || text(row.sourceVideoId))
   const entity = videoId ? videoEntities.get(videoId) : null
   return {
    ...row,
    sourceTitle: entity?.title || detail || row.sourceTitle,
    sourceVideoId: videoId || row.sourceVideoId,
    resolvedEntityId: entity?.id || videoId || null,
    resolvedEntityType: videoId ? ("video" as const) : null,
    resolvedEntityTitle: entity?.title || null,
    resolvedEntityHandle: null,
    resolvedEntityUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
    resolvedEntitySubtitle: entity?.channelTitle || videoId || null,
   }
  }

  return {
   ...row,
   sourceTitle: detail || row.sourceTitle,
  }
 })
}
