export interface PublicChannelResolution {
 input: string
 resolvedChannelId: string | null
 resolvedHandle: string | null
 channelTitle: string | null
 reason: string | null
}

export interface PublicChannelSnapshot {
 mode: "public_handle"
 fetchedAt: string
 channelId: string
 handle: string | null
 title: string | null
 subscriberCount: number | null
 videoCount: number | null
 viewCount: number | null
 topVideos: Array<{
  videoId: string
  title: string
  publishedAt: string
  viewCount: number | null
  likeCount: number | null
  commentCount: number | null
 }>
}

const YT_DATA_BASE = "https://www.googleapis.com/youtube/v3"

const extractHandleLike = (input: string): string | null => {
 const trimmed = input.trim()
 if (!trimmed) return null

 if (trimmed.startsWith("@")) return trimmed.slice(1)

 try {
  const url = new URL(trimmed)
  const pathname = url.pathname
  if (pathname.startsWith("/@")) return pathname.slice(2)
  if (pathname.startsWith("/channel/")) return pathname.replace("/channel/", "")
  if (pathname.startsWith("/c/")) return pathname.replace("/c/", "")
  if (pathname.startsWith("/user/")) return pathname.replace("/user/", "")
 } catch {
  // not a URL
 }

 return trimmed
}

const toNum = (value: unknown): number | null => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value === "string") {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
 }
 return null
}

const getApiKey = (): string | null => {
 const fromEnv = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined
 if (fromEnv && fromEnv.trim()) return fromEnv.trim()
 const fromLocal = localStorage.getItem("yt_public_api_key")
 if (fromLocal && fromLocal.trim()) return fromLocal.trim()
 return null
}

export const resolvePublicChannel = async (
 handleInput: string,
): Promise<PublicChannelResolution> => {
 const apiKey = getApiKey()
 const candidate = extractHandleLike(handleInput)

 if (!candidate) {
  return {
   input: handleInput,
   resolvedChannelId: null,
   resolvedHandle: null,
   channelTitle: null,
   reason: "Enter a YouTube handle, channel URL, or channel ID.",
  }
 }

 if (!apiKey) {
  return {
   input: handleInput,
   resolvedChannelId: null,
   resolvedHandle: candidate,
   channelTitle: null,
   reason:
    "Missing VITE_YOUTUBE_API_KEY (or localStorage yt_public_api_key). Public handle mode needs a Data API key.",
  }
 }

 const isLikelyChannelId = /^UC[a-zA-Z0-9_-]{20,}$/.test(candidate)
 const byChannelIdUrl = `${YT_DATA_BASE}/channels?part=snippet&id=${encodeURIComponent(candidate)}&key=${apiKey}`
 const byHandleUrl = `${YT_DATA_BASE}/channels?part=snippet&forHandle=${encodeURIComponent(candidate.replace(/^@/, ""))}&key=${apiKey}`
 const bySearchUrl = `${YT_DATA_BASE}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(candidate)}&key=${apiKey}`

 const tryUrls = isLikelyChannelId
  ? [byChannelIdUrl, byHandleUrl, bySearchUrl]
  : [byHandleUrl, bySearchUrl, byChannelIdUrl]

 for (const url of tryUrls) {
  try {
   const response = await fetch(url)
   if (!response.ok) continue
   const data = (await response.json()) as {
    items?: Array<{
     id?: string | { channelId?: string }
     snippet?: { title?: string; customUrl?: string }
    }>
   }

   const item = data.items?.[0]
   if (!item) continue

   const channelId =
    typeof item.id === "string"
     ? item.id
     : typeof item.id === "object"
       ? item.id.channelId
       : null

   if (!channelId) continue

   return {
    input: handleInput,
    resolvedChannelId: channelId,
    resolvedHandle: item.snippet?.customUrl || candidate.replace(/^@/, ""),
    channelTitle: item.snippet?.title || null,
    reason: null,
   }
  } catch {
   // try next
  }
 }

 return {
  input: handleInput,
  resolvedChannelId: null,
  resolvedHandle: candidate,
  channelTitle: null,
  reason: "Channel could not be resolved from the provided input.",
 }
}

export const fetchPublicChannelSnapshot = async (
 handleInput: string,
): Promise<PublicChannelSnapshot | null> => {
 const resolved = await resolvePublicChannel(handleInput)
 if (!resolved.resolvedChannelId) return null

 const apiKey = getApiKey()
 if (!apiKey) return null

 const channelId = resolved.resolvedChannelId
 const profileUrl = `${YT_DATA_BASE}/channels?part=snippet,statistics&id=${encodeURIComponent(channelId)}&key=${apiKey}`
 const searchUrl = `${YT_DATA_BASE}/search?part=snippet&channelId=${encodeURIComponent(channelId)}&order=date&type=video&maxResults=10&key=${apiKey}`

 const profileResponse = await fetch(profileUrl)
 if (!profileResponse.ok) return null
 const profileData = (await profileResponse.json()) as {
  items?: Array<{
   snippet?: { title?: string; customUrl?: string }
   statistics?: {
    subscriberCount?: string
    videoCount?: string
    viewCount?: string
   }
  }>
 }

 const channel = profileData.items?.[0]
 if (!channel) return null

 const searchResponse = await fetch(searchUrl)
 const searchData = searchResponse.ok
  ? ((await searchResponse.json()) as {
     items?: Array<{
      id?: { videoId?: string }
      snippet?: { title?: string; publishedAt?: string }
     }>
    })
  : { items: [] }

 const videoIds = (searchData.items || [])
  .map((item) => item.id?.videoId)
  .filter((value): value is string => !!value)

 let statsByVideoId = new Map<string, { viewCount: number | null; likeCount: number | null; commentCount: number | null }>()
 if (videoIds.length > 0) {
  const statsUrl = `${YT_DATA_BASE}/videos?part=statistics&id=${videoIds.join(",")}&key=${apiKey}`
  const statsResponse = await fetch(statsUrl)
  if (statsResponse.ok) {
   const statsData = (await statsResponse.json()) as {
    items?: Array<{
     id?: string
     statistics?: { viewCount?: string; likeCount?: string; commentCount?: string }
    }>
   }
   statsByVideoId = new Map(
    (statsData.items || []).map((item) => [
     item.id || "",
     {
      viewCount: toNum(item.statistics?.viewCount),
      likeCount: toNum(item.statistics?.likeCount),
      commentCount: toNum(item.statistics?.commentCount),
     },
    ]),
   )
  }
 }

 return {
  mode: "public_handle",
  fetchedAt: new Date().toISOString(),
  channelId,
  handle: channel.snippet?.customUrl || resolved.resolvedHandle || null,
  title: channel.snippet?.title || resolved.channelTitle || null,
  subscriberCount: toNum(channel.statistics?.subscriberCount),
  videoCount: toNum(channel.statistics?.videoCount),
  viewCount: toNum(channel.statistics?.viewCount),
  topVideos: (searchData.items || []).map((item) => {
   const videoId = item.id?.videoId || ""
   const stats = statsByVideoId.get(videoId)
   return {
    videoId,
    title: item.snippet?.title || videoId,
    publishedAt: item.snippet?.publishedAt || "",
    viewCount: stats?.viewCount ?? null,
    likeCount: stats?.likeCount ?? null,
    commentCount: stats?.commentCount ?? null,
   }
  }),
 }
}
