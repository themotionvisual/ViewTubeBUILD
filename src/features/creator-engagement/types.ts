/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VideoAsset } from "../../services/videoAssets"

export type CommunityPostType = "text" | "image" | "poll" | "image-poll" | "video"
export type CommunityPostMode = "write" | "create"

export interface CreatorEngagementContext {
 channelId: string
 channelName: string
 channelHandle: string
 channelThumbnail: string
 connected: boolean
 connectionState: "ready" | "connecting" | "needs_reconnect" | "anonymous"
 canReadYouTube: boolean
 canPostComments: boolean
 reconnect: () => Promise<void>
 videoAssets: VideoAsset[]
 brain: any
}

export interface CommunityPostDraftV1 {
 version: 1
 id: string
 type: CommunityPostType
 content: string
 prompt: string
 pollOptions: string[]
 imageUrl: string
 imagePollUrls: string[]
 linkedVideoId: string
 style: string
 createdAt: string
 updatedAt: string
}

export interface CommunityPostController {
 mode: CommunityPostMode
 setMode: (mode: CommunityPostMode) => void
 postType: CommunityPostType
 setPostType: (type: CommunityPostType) => void
 content: string
 setContent: (value: string) => void
 prompt: string
 setPrompt: (value: string) => void
 pollOptions: string[]
 setPollOption: (index: number, value: string) => void
 imageUrl: string
 setImageUrl: (value: string) => void
 imagePollUrls: string[]
 setImagePollUrl: (index: number, value: string) => void
 selectedVideoId: string
 setSelectedVideoId: (value: string) => void
 videoSearch: string
 setVideoSearch: (value: string) => void
 style: string
 setStyle: (value: string) => void
 isGenerating: boolean
 error: string | null
 clipboardStatus: "idle" | "copied" | "error"
 vault: CommunityPostDraftV1[]
 filteredVideos: VideoAsset[]
 channelCommunityUrl: string | null
 refine: () => Promise<void>
 generate: () => Promise<void>
 saveToVault: () => void
 loadFromVault: (id: string) => void
 removeFromVault: (id: string) => void
 copyPost: () => Promise<void>
 applyImageFile: (file?: File, optionIndex?: number) => void
}

export type CommentResponderTab = "unreplied" | "history"

export interface CommentResponderController {
 tab: CommentResponderTab
 setTab: (tab: CommentResponderTab) => void
 loading: boolean
 error: string | null
 threads: any[]
 displayThreads: any[]
 currentThread: any | null
 currentIndex: number
 setCurrentIndex: (index: number) => void
 replyText: string
 setReplyText: (value: string) => void
 generating: boolean
 fetchedVideoData: Record<string, any>
 inboundImageUrl: string | null
 canPostReply: boolean
 editingReplyId: string | null
 editingReplyText: string
 refresh: () => Promise<void>
 draftReply: () => Promise<void>
 suggestVideo: () => Promise<void>
 postReply: () => Promise<void>
 startEditingReply: (reply: any) => void
 setEditingReplyText: (value: string) => void
 cancelEditingReply: () => void
 saveEditedReply: () => Promise<void>
 reconnect: () => Promise<void>
}
