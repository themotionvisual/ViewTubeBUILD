import React, { useCallback, useMemo, useState } from "react"
import {
 Copy,
 ExternalLink,
 MessageSquarePlus,
 Search,
 Sparkles,
 Video,
} from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import type { DashboardData } from "../useDashboardData"
import type {
 CommonWidgetProps,
 WidgetDefinition,
 WidgetInstanceState,
} from "../types"
import { postVideoTopLevelComment } from "../../../services/youtubeService"
import { getActiveModel, getAiClient, hasGeminiKey } from "../../../services/gemini"

type OwnedVideoOption = {
 videoId: string
 title: string
 publishedAt: string
 thumbnail: string
}

type VideoIdCollectionState = {
 status: "idle" | "running" | "success" | "error"
 ids: string[]
 message: string
 copied: boolean
 pageCount: number
 collectedAt: string | null
}

type VideoCommentOperatorWidgetProps = CommonWidgetProps & {
 data: DashboardData
 widget: WidgetDefinition
 instance: WidgetInstanceState
}

const initialCollectionState: VideoIdCollectionState = {
 status: "idle",
 ids: [],
 message: "",
 copied: false,
 pageCount: 0,
 collectedAt: null,
}

export const VideoCommentOperatorWidget = ({
 widget,
 instance,
 editMode,
 onToggleCollapse,
 onCycleSize,
 onDecSize,
 onCycleHeight,
 onDecHeight,
 onRemove,
 data,
}: VideoCommentOperatorWidgetProps) => {
 const common = {
  widget,
  instance,
  editMode,
  canEdit: true,
  onToggleCollapse,
  onCycleSize,
  onDecSize,
  onCycleHeight,
  onDecHeight,
  onRemove,
 }

 const [videoQuery, setVideoQuery] = useState("")
 const [videoStatus, setVideoStatus] = useState("")
 const [videoLoading, setVideoLoading] = useState(false)
 const [videoResults, setVideoResults] = useState<OwnedVideoOption[]>([])
 const [selectedVideoId, setSelectedVideoId] = useState("")
 const [commentDraft, setCommentDraft] = useState("")
 const [commentStatus, setCommentStatus] = useState("")
 const [commentLoading, setCommentLoading] = useState(false)
 const [postingComment, setPostingComment] = useState(false)
 const [idCollection, setIdCollection] =
  useState<VideoIdCollectionState>(initialCollectionState)
 const catalogVideos = data.videoAssets || []

 const selectedVideo = useMemo(
  () => videoResults.find((video) => video.videoId === selectedVideoId) || null,
  [selectedVideoId, videoResults],
 )

 const handleSearchVideos = useCallback(async () => {
  if (!catalogVideos.length && data.videoAssetCatalogStatus === "error") {
   setVideoStatus("Connect the channel first to search owned videos.")
   return
  }

  setVideoLoading(true)
  setVideoStatus("Searching connected channel videos...")
  try {
   const query = videoQuery.trim().toLowerCase()
   const results = catalogVideos
    .filter((video) => !query || video.title.toLowerCase().includes(query) || video.videoId.toLowerCase().includes(query))
    .slice(0, 50)
    .map((video) => ({
     videoId: video.videoId,
     title: video.title,
     publishedAt: video.publishedAt || "",
     thumbnail: video.thumbnailUrl,
    }))
   setVideoResults(results)
   setSelectedVideoId((previous: string) => {
    if (previous && results.some((video) => video.videoId === previous)) {
     return previous
    }
    return results[0]?.videoId || ""
   })
   setVideoStatus(
    results.length
     ? `Loaded ${results.length.toLocaleString()} matching owned video${results.length === 1 ? "" : "s"}.`
     : "No owned videos matched that search.",
   )
  } catch (error) {
   setVideoStatus(error instanceof Error ? error.message : "Video search failed.")
  } finally {
   setVideoLoading(false)
  }
 }, [catalogVideos, data.videoAssetCatalogStatus, videoQuery])

 const handleCollectVideoIds = useCallback(async () => {
  if (!catalogVideos.length && data.videoAssetCatalogStatus === "error") {
   setIdCollection({
    ...initialCollectionState,
    status: "error",
    message: "Connect the channel first to collect upload video IDs.",
   })
   return
  }

  setIdCollection({
   ...initialCollectionState,
   status: "running",
   message: "Collecting upload video IDs from the connected channel...",
  })

  try {
   const ids = Array.from(new Set(catalogVideos.map((video) => video.videoId).filter(Boolean)))
   const pageCount = Math.ceil(ids.length / 50)

   setIdCollection({
    status: "success",
    ids,
    copied: false,
    pageCount,
    collectedAt: new Date().toISOString(),
    message: ids.length
     ? `Collected ${ids.length.toLocaleString()} unique video IDs from the connected channel.`
     : "No uploaded video IDs were found for the connected channel.",
   })
  } catch (error) {
   setIdCollection({
    ...initialCollectionState,
    status: "error",
    pageCount: 0,
    message:
     error instanceof Error ? error.message : "Failed to collect channel video IDs.",
   })
  }
 }, [catalogVideos, data.videoAssetCatalogStatus])

 const handleCopyCollectedIds = useCallback(async () => {
  if (!idCollection.ids.length) return
  try {
   await navigator.clipboard.writeText(idCollection.ids.join("\n"))
   setIdCollection((previous) => ({
    ...previous,
    copied: true,
    message: `Copied ${previous.ids.length.toLocaleString()} video IDs to the clipboard.`,
   }))
  } catch (error) {
   setIdCollection((previous) => ({
    ...previous,
    copied: false,
    message:
     error instanceof Error
      ? error.message
      : "Clipboard copy failed. Use manual export from the browser if needed.",
   }))
  }
 }, [idCollection.ids])

 const handleGenerateComment = useCallback(async () => {
  if (!selectedVideo) {
   setCommentStatus("Choose a video first.")
   return
  }
  if (!hasGeminiKey()) {
   setCommentStatus("Gemini API key is missing in Settings.")
   return
  }

  setCommentLoading(true)
  setCommentStatus("Generating pinned comment recommendation...")
  try {
   const response = await getAiClient().models.generateContent({
    model: getActiveModel("text"),
    contents: [
     `Write one YouTube pinned comment draft for the creator's own video.`,
     `Channel: ${data.channelIdentity?.name || data.authState?.channelName || "Connected Channel"}`,
     `Video title: ${selectedVideo.title}`,
     `Video ID: ${selectedVideo.videoId}`,
     `Published at: ${selectedVideo.publishedAt || "unknown"}`,
     `Requirements:`,
     `- Return exactly one pinned comment draft.`,
     `- Keep it under 280 characters.`,
     `- Sound creator-authentic.`,
     `- Drive comments, discussion, or a next step.`,
     `- Avoid hashtags, numbering, quotation marks, and explanation.`,
    ].join("\n"),
   })
   const draft = String(response.text || "").trim()
   setCommentDraft(draft)
   setCommentStatus(
    draft
     ? "Draft ready. Review it, edit if needed, then post it below."
     : "Generator returned an empty response.",
   )
  } catch (error) {
   setCommentStatus(
    error instanceof Error ? error.message : "Pinned comment generation failed.",
   )
  } finally {
   setCommentLoading(false)
  }
 }, [
  data.authState?.channelName,
  data.channelIdentity?.name,
  selectedVideo,
 ])

 const handleCopyVideoId = useCallback(async () => {
  if (!selectedVideo) return
  try {
   await navigator.clipboard.writeText(selectedVideo.videoId)
   setVideoStatus(`Copied video ID ${selectedVideo.videoId} to the clipboard.`)
  } catch (error) {
   setVideoStatus(
    error instanceof Error
     ? error.message
     : "Clipboard copy failed for the selected video ID.",
   )
  }
 }, [selectedVideo])

 const handleCopyComment = useCallback(async () => {
  if (!commentDraft) return
  try {
   await navigator.clipboard.writeText(commentDraft)
   setCommentStatus("Pinned comment draft copied to the clipboard.")
  } catch (error) {
   setCommentStatus(
    error instanceof Error
     ? error.message
     : "Clipboard copy failed for the comment draft.",
   )
  }
 }, [commentDraft])

 const handlePostComment = useCallback(async () => {
  const text = commentDraft.trim()
  if (!selectedVideo) {
   setCommentStatus("Choose a video before posting a comment.")
   return
  }
  if (!text) {
   setCommentStatus("Write or generate a comment before posting.")
   return
  }

  setPostingComment(true)
  setCommentStatus("Posting top-level comment to YouTube...")
  try {
   await postVideoTopLevelComment(selectedVideo.videoId, text)
   setCommentStatus(
    "Comment posted. Open the video on YouTube and pin it manually.",
   )
  } catch (error) {
   setCommentStatus(
    error instanceof Error ? error.message : "Failed to post top-level comment.",
   )
  } finally {
   setPostingComment(false)
  }
 }, [commentDraft, selectedVideo])

 const handleOpenVideo = useCallback(() => {
  if (!selectedVideo) return
  window.open(
   `https://www.youtube.com/watch?v=${selectedVideo.videoId}`,
   "_blank",
   "noopener,noreferrer",
  )
 }, [selectedVideo])

 const idPreview = useMemo(() => idCollection.ids.slice(0, 8), [idCollection.ids])

 return (
  <WidgetShell {...common} icon={<MessageSquarePlus size={22} />}>
   <div className="flex h-full flex-col gap-3">
    <div className="rounded-xl border-[3px] border-black bg-[#F8F7F2] p-3">
     <div className="flex items-start justify-between gap-3">
      <div>
       <p className="text-[9px] font-black uppercase tracking-widest text-black/45">
        Action 01
       </p>
       <p className="mt-1 text-[14px] font-[1000] uppercase leading-none">
        Collect Channel Video IDs
       </p>
      </div>
      <button
       type="button"
       onClick={() => {
        void handleCollectVideoIds()
       }}
       disabled={idCollection.status === "running"}
       className="vt-button data"
       style={{ "--widget-color": "#24D3FF" } as React.CSSProperties}
      >
       {idCollection.status === "running" ? "Collecting..." : "Collect IDs"}
      </button>
     </div>
     <div className="mt-3 grid grid-cols-3 gap-2 text-[9px] font-black uppercase tracking-wider">
      <div className="rounded-lg border-[2px] border-black bg-white px-2 py-2">
       {idCollection.status}
      </div>
      <div className="rounded-lg border-[2px] border-black bg-white px-2 py-2">
       {idCollection.ids.length.toLocaleString()} ids
      </div>
      <div className="rounded-lg border-[2px] border-black bg-white px-2 py-2">
       {idCollection.pageCount.toLocaleString()} pages
      </div>
     </div>
     <div className="mt-3 rounded-lg border-[2px] border-black bg-white px-3 py-3 text-[10px] font-black uppercase tracking-wider text-black/60">
      {idCollection.message || "Collect the connected channel upload IDs here."}
     </div>
     <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
       type="button"
       onClick={() => {
        void handleCopyCollectedIds()
       }}
       disabled={!idCollection.ids.length}
       className="vt-button data"
       style={{ "--widget-color": "#CCFF00" } as React.CSSProperties}
      >
       {idCollection.copied ? "Copied" : "Copy IDs"}
      </button>
      <div className="text-[9px] font-black uppercase tracking-wider text-black/45">
       {idCollection.collectedAt
        ? `Collected ${new Date(idCollection.collectedAt).toLocaleTimeString()}`
        : "No collection run yet"}
      </div>
     </div>
     {idPreview.length ? (
      <div className="mt-3 grid grid-cols-1 gap-2">
       {idPreview.map((videoId) => (
        <code
         key={videoId}
         className="block overflow-hidden text-ellipsis rounded-md border-[2px] border-black bg-white px-2 py-1 text-[10px] font-black"
        >
         {videoId}
        </code>
       ))}
      </div>
     ) : null}
    </div>

    <div className="rounded-xl border-[3px] border-black bg-white p-3">
     <div className="flex items-start justify-between gap-3">
      <div>
       <p className="text-[9px] font-black uppercase tracking-widest text-black/45">
        Video Search
       </p>
       <p className="mt-1 text-[14px] font-[1000] uppercase leading-none">
        Search And Select An Owned Video
       </p>
      </div>
      <button
       type="button"
       onClick={() => {
        void handleSearchVideos()
       }}
       disabled={videoLoading}
       className="vt-button icon"
      >
       <Search size={14} />
       {videoLoading ? "Searching..." : "Search"}
      </button>
     </div>

     <div className="mt-3 flex flex-col gap-3">
      <input
       value={videoQuery}
       onChange={(event) => setVideoQuery(event.target.value)}
       placeholder="Search your videos by title..."
       className="vt-input-standard"
      />
      <select
       value={selectedVideoId}
       onChange={(event) => setSelectedVideoId(event.target.value)}
       className="vt-input-standard"
      >
       <option value="">Choose a video...</option>
       {videoResults.map((video) => (
        <option key={video.videoId} value={video.videoId}>
         {video.title}
        </option>
       ))}
      </select>
      <div className="rounded-lg border-[2px] border-black bg-[#F8F8F8] px-3 py-3 text-[10px] font-black uppercase tracking-wider text-black/60">
       {videoStatus || "Search recent or matching owned videos to populate the dropdown."}
      </div>
     </div>

     {selectedVideo ? (
      <div className="mt-3 rounded-xl border-[2px] border-black bg-[#F8F7F2] p-3">
       <div className="flex gap-3">
        {selectedVideo.thumbnail ? (
         <img
          src={selectedVideo.thumbnail}
          alt=""
          className="h-16 w-28 rounded-lg border-[2px] border-black bg-[#EDEDED] object-cover"
         />
        ) : null}
        <div className="min-w-0 flex-1">
         <p className="text-[9px] font-black uppercase tracking-widest text-black/45">
          Selected Video
         </p>
         <p className="mt-1 break-words text-[12px] font-[1000] uppercase leading-tight">
          {selectedVideo.title}
         </p>
         <p className="mt-2 text-[9px] font-black uppercase tracking-wider text-black/55">
          {selectedVideo.videoId}
         </p>
        </div>
       </div>
       <div className="mt-3 grid grid-cols-3 gap-2">
        <button
         type="button"
         onClick={handleOpenVideo}
         className="vt-button icon"
        >
         <ExternalLink size={14} />
         Open
        </button>
        <button
         type="button"
         onClick={() => {
          void handleCopyVideoId()
         }}
         className="vt-button icon"
        >
         <Copy size={14} />
         Copy ID
        </button>
        <button
         type="button"
         onClick={() => {
          void handleGenerateComment()
         }}
         disabled={commentLoading}
         className="vt-button data"
         style={{ "--widget-color": "#CCFF00" } as React.CSSProperties}
        >
         <Sparkles size={14} />
         {commentLoading ? "Generating..." : "Draft"}
        </button>
       </div>
      </div>
     ) : null}
    </div>

    <div className="flex min-h-0 flex-1 flex-col rounded-xl border-[3px] border-black bg-white p-3">
     <div className="flex items-start justify-between gap-3">
      <div>
       <p className="text-[9px] font-black uppercase tracking-widest text-black/45">
        Pinned Comment
       </p>
       <p className="mt-1 text-[14px] font-[1000] uppercase leading-none">
        Generate, Edit, Post, Then Pin Manually
       </p>
      </div>
      <div className="inline-flex items-center rounded-full border-[2px] border-black bg-[#FFF7AF] px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-black/60">
       Manual pin only
      </div>
     </div>

     <textarea
      value={commentDraft}
      onChange={(event) => setCommentDraft(event.target.value)}
      placeholder="Generate a recommended pinned comment, then edit it here before posting."
      className="vt-textarea-standard mt-3 flex-1 text-sm leading-6"
     />

     <div className="mt-3 rounded-lg border-[2px] border-black bg-[#F8F8F8] px-3 py-3 text-[10px] font-black uppercase tracking-wider text-black/60">
      {commentStatus ||
       "The YouTube Data API supports posting a top-level comment here. Pinning still has to be done manually on YouTube after posting."}
     </div>

     <div className="mt-3 grid grid-cols-3 gap-2">
      <button
       type="button"
       onClick={() => {
        void handleCopyComment()
       }}
       disabled={!commentDraft}
       className="vt-button icon"
      >
       <Copy size={14} />
       Copy
      </button>
      <button
       type="button"
       onClick={() => {
        void handlePostComment()
       }}
       disabled={!selectedVideo || !commentDraft.trim() || postingComment}
       className="vt-button data"
       style={{ "--widget-color": "#24D3FF" } as React.CSSProperties}
      >
       <MessageSquarePlus size={14} />
       {postingComment ? "Posting..." : "Post Comment"}
      </button>
      <button
       type="button"
       onClick={handleOpenVideo}
       disabled={!selectedVideo}
       className="vt-button icon"
      >
       <Video size={14} />
       Open To Pin
      </button>
     </div>
    </div>
   </div>
  </WidgetShell>
 )
}
