/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { generatePerfectReply } from "../../services/gemini"
import { fetchAllCommentThreads, fetchVideoSnippetDetails, postCommentReply } from "../../services/youtubeService"
import type { CommentResponderController, CommentResponderTab, CreatorEngagementContext } from "./types"

export const resolveSuggestedVideoId = (
 suggestedVideoId: unknown,
 videos: ReadonlyArray<{ videoId: string }>,
): string | null => {
 const candidate = typeof suggestedVideoId === "string" ? suggestedVideoId.trim() : ""
 return candidate && videos.some((video) => video.videoId === candidate) ? candidate : null
}

export const partitionCommentThreads = (threads: any[], channelId: string) => {
 const complete = threads.filter((thread) => thread.repliesComplete !== false)
 const hasChannelReply = (thread: any) => (thread.replies?.comments || [])
  .some((reply: any) => reply.snippet?.authorChannelId?.value === channelId)
 return {
  unreplied: complete.filter((thread) => !hasChannelReply(thread)),
  replied: complete.filter(hasChannelReply),
 }
}

export const useCommentResponderController = (context: CreatorEngagementContext): CommentResponderController => {
 const [tab, setTabState] = useState<CommentResponderTab>("unreplied")
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const [threads, setThreads] = useState<any[]>([])
 const [replyText, setReplyTextById] = useState<Record<string, string>>({})
 const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set())
 const [currentIndex, setCurrentIndex] = useState(0)
 const [fetchedVideoData, setFetchedVideoData] = useState<Record<string, any>>({})
 const [inboundImageUrl, setInboundImageUrl] = useState<string | null>(null)
 const fetchedRef = useRef<Record<string, any>>({})
 const metadataInFlight = useRef(new Set<string>())
 const requestGeneration = useRef(0)
 const requestAbort = useRef<AbortController | null>(null)

 const syncMetadata = useCallback(async (nextThreads: any[]) => {
  const videoIds = Array.from(new Set<string>(nextThreads.map((thread) => thread.snippet?.videoId).filter(Boolean)))
  const missing = videoIds.filter((id) => {
   const canonical = context.videoAssets.find((video) => video.videoId === id)
   const fetched = fetchedRef.current[id]
   return (!canonical?.title || canonical.title === "Unknown Video") &&
    (!fetched?.title || fetched.title === "Unknown Video") && !metadataInFlight.current.has(id)
  })
  if (!missing.length) return
  missing.forEach((id) => metadataInFlight.current.add(id))
  try {
   const details = await fetchVideoSnippetDetails(missing)
   fetchedRef.current = { ...fetchedRef.current, ...details }
   setFetchedVideoData((current) => ({ ...current, ...details }))
  } catch (cause) {
   console.warn("[CommentResponder] Metadata sync failed", cause)
  } finally { missing.forEach((id) => metadataInFlight.current.delete(id)) }
 }, [context.videoAssets])

 const refresh = useCallback(async () => {
  const generation = ++requestGeneration.current
  requestAbort.current?.abort()
  const abortController = new AbortController()
  requestAbort.current = abortController
  setLoading(true)
  setError(null)
  try {
   const result = await fetchAllCommentThreads(100, context.channelId, {
   initialNewCount: 3,
    signal: abortController.signal,
    onInitialResults: (initial) => {
     if (generation !== requestGeneration.current) return
     setThreads(initial)
     setLoading(false)
     void syncMetadata(initial)
    },
   })
   if (generation !== requestGeneration.current) return
   setThreads(result)
   void syncMetadata(result)
  } catch (cause) {
   if (generation !== requestGeneration.current) return
   if (cause instanceof DOMException && cause.name === "AbortError") return
   console.error("Comment fetch failed", cause)
   setError(cause instanceof Error ? cause.message : "ViewTube could not load comments. Reconnect and try again.")
  } finally {
   if (generation === requestGeneration.current) setLoading(false)
  }
 }, [context.channelId, syncMetadata])

 useEffect(() => {
  if (!context.connected) {
   setThreads([])
   setError("Connect your YouTube channel to load comments.")
   return
  }
  void refresh()
  return () => {
   requestGeneration.current += 1
   requestAbort.current?.abort()
  }
 }, [context.connected, refresh])

 useEffect(() => {
  const apply = (payload: any) => payload?.imageUrl && setInboundImageUrl(String(payload.imageUrl))
  const onBridge = (event: Event) => {
   const detail = (event as CustomEvent<any>).detail
   if (detail?.targetWidget === "comment-replier") apply(detail)
  }
  window.addEventListener("vt_dashboard_generated_image", onBridge as EventListener)
  try {
   const cached = localStorage.getItem("vt_bridge_image_comment-replier")
   if (cached) apply(JSON.parse(cached))
  } catch { /* Ignore malformed bridge cache and keep the tool usable. */ }
  return () => window.removeEventListener("vt_dashboard_generated_image", onBridge as EventListener)
 }, [])

 const partitions = useMemo(() => partitionCommentThreads(threads, context.channelId), [context.channelId, threads])
 const unreplied = partitions.unreplied
 const replied = partitions.replied
 const displayThreads = tab === "unreplied" ? unreplied : replied
 const safeIndex = Math.min(currentIndex, Math.max(0, displayThreads.length - 1))
 const currentThread = displayThreads[safeIndex] || null
 const currentId = currentThread?.id || ""

 const setTab = (next: CommentResponderTab) => { setTabState(next); setCurrentIndex(0) }
 const setGenerating = (id: string, active: boolean) => setGeneratingIds((current) => {
  const next = new Set(current)
  if (active) next.add(id); else next.delete(id)
  return next
 })

 const draftReply = async () => {
  if (!currentThread) return
  setGenerating(currentId, true)
  setError(null)
  try {
   const comment = currentThread.snippet.topLevelComment.snippet
   const result = await generatePerfectReply(
    comment.textOriginal,
    comment.authorDisplayName.replace(/@/g, ""),
    context.channelName || "Content Creation",
    context.videoAssets.map((video) => ({ title: video.title, id: video.videoId })),
    context.brain,
    replyText[currentId]?.trim() || "",
   )
   const suggestedVideoId = resolveSuggestedVideoId(result.suggestedVideoId, context.videoAssets)
   const reply = suggestedVideoId ? `${result.reply}\n\nCheck this out for more details: https://youtu.be/${suggestedVideoId}` : result.reply
   setReplyTextById((current) => ({ ...current, [currentId]: reply }))
  } catch (cause) {
   setError(cause instanceof Error ? cause.message : "ViewTube could not draft a reply. Try again.")
  } finally { setGenerating(currentId, false) }
 }

 const suggestVideo = async () => {
  if (!currentThread) return
  setGenerating(currentId, true)
  setError(null)
  try {
   const comment = currentThread.snippet.topLevelComment.snippet
   const result = await generatePerfectReply(comment.textOriginal, comment.authorDisplayName.replace(/@/g, ""), context.channelName, context.videoAssets.map((video) => ({ title: video.title, id: video.videoId })), context.brain, replyText[currentId]?.trim() || "")
   const suggestedVideoId = resolveSuggestedVideoId(result.suggestedVideoId, context.videoAssets)
   if (suggestedVideoId) setReplyTextById((current) => ({ ...current, [currentId]: `${current[currentId]?.trim() ? `${current[currentId].trim()}\n\n` : ""}You might also enjoy this related video: https://youtu.be/${suggestedVideoId}` }))
  } catch (cause) {
   setError(cause instanceof Error ? cause.message : "ViewTube could not suggest a video. Try again.")
  } finally { setGenerating(currentId, false) }
 }

 const postReply = async () => {
  if (!currentThread || !replyText[currentId]?.trim()) return
  if (!context.canPostComments) { setError("Reconnect Channel to grant comment-reply permission."); await context.reconnect(); return }
  setLoading(true)
  setError(null)
  try {
   const parentId = currentThread.snippet?.topLevelComment?.id || currentId
   const text = replyText[currentId]
   const posted = await postCommentReply(parentId, text)
   setReplyTextById((current) => { const next = { ...current }; delete next[currentId]; return next })
   setThreads((current) => current.map((thread) => thread.id !== currentId ? thread : ({ ...thread, replies: { ...thread.replies, comments: [...(thread.replies?.comments || []), { ...posted, snippet: { ...posted?.snippet, authorChannelId: posted?.snippet?.authorChannelId || { value: context.channelId }, authorDisplayName: posted?.snippet?.authorDisplayName || context.channelName, authorProfileImageUrl: posted?.snippet?.authorProfileImageUrl || context.channelThumbnail, textDisplay: posted?.snippet?.textDisplay || text, publishedAt: posted?.snippet?.publishedAt || new Date().toISOString() } }] } })))
   setTab("history")
  } catch (cause) {
   setError(cause instanceof Error ? cause.message : "ViewTube could not post this reply. Reconnect and try again.")
  } finally { setLoading(false) }
 }

 return {
  tab, setTab, loading, error, threads, displayThreads, currentThread, currentIndex: safeIndex, setCurrentIndex,
  replyText: currentId ? replyText[currentId] || "" : "",
  setReplyText: (value) => currentId && setReplyTextById((current) => ({ ...current, [currentId]: value })),
  generating: generatingIds.has(currentId), fetchedVideoData, inboundImageUrl,
  canPostReply: context.canPostComments, refresh, draftReply, suggestVideo, postReply, reconnect: context.reconnect,
 }
}
