export const YOUTUBE_DATA_QUOTA_COST = Object.freeze({
 "channels.list": 1,
 "videos.list": 1,
 "playlists.list": 1,
 "playlistItems.list": 1,
 "commentThreads.list": 1,
 "comments.list": 1,
 "search.list": 100,
 "comments.insert": 50,
 "comments.setModerationStatus": 50,
 "comments.markAsSpam": 50,
 "videos.update": 50,
 "playlists.insert": 50,
 "playlistItems.insert": 50,
 "playlistItems.update": 50,
 "playlistItems.delete": 50,
 "thumbnails.set": 50,
 "captions.list": 50,
 "captions.insert": 400,
 "captions.update": 450,
 "captions.download": 200,
 "captions.delete": 50,
 "videos.insert": 1600,
} as const)

export type YouTubeQuotaOperation = keyof typeof YOUTUBE_DATA_QUOTA_COST

export const estimateYouTubeQuota = (
 operations: ReadonlyArray<{ operation: YouTubeQuotaOperation; count?: number }>,
) => operations.reduce((sum, entry) => {
 const count = Math.max(0, Math.floor(entry.count ?? 1))
 return sum + YOUTUBE_DATA_QUOTA_COST[entry.operation] * count
}, 0)

export const estimateVideoPublishQuota = (options: {
 thumbnail?: boolean
 captions?: number
 finalMetadataUpdate?: boolean
}) => estimateYouTubeQuota([
 { operation: "videos.insert" },
 ...(options.thumbnail ? [{ operation: "thumbnails.set" as const }] : []),
 ...(options.captions ? [{ operation: "captions.insert" as const, count: options.captions }] : []),
 ...(options.finalMetadataUpdate ? [{ operation: "videos.update" as const }] : []),
])

export const estimateVideoManagerSaveQuota = (options: {
 metadataChanged?: boolean
 thumbnailChanged?: boolean
 playlistsAdded?: number
 playlistsRemoved?: number
}) => estimateYouTubeQuota([
 ...(options.metadataChanged ? [{ operation: "videos.update" as const }] : []),
 ...(options.thumbnailChanged ? [{ operation: "thumbnails.set" as const }] : []),
 ...(options.playlistsAdded ? [{ operation: "playlistItems.insert" as const, count: options.playlistsAdded }] : []),
 ...(options.playlistsRemoved ? [{ operation: "playlistItems.delete" as const, count: options.playlistsRemoved }] : []),
])
