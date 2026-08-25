/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react"
import { refineCommunityPost } from "../../services/gemini"
import {
 COMMUNITY_POST_CHANGED_EVENT,
 emptyCommunityPostDraft,
 normalizeCommunityPostDraft,
 readCommunityPostState,
 readCommunityPostVault,
 writeCommunityPostState,
 writeCommunityPostVault,
} from "./communityPostStore"
import type { CommunityPostController, CommunityPostDraftV1, CommunityPostMode, CommunityPostType, CreatorEngagementContext } from "./types"

export const buildChannelCommunityUrl = (context: Pick<CreatorEngagementContext, "channelId" | "channelHandle">): string | null => {
 if (context.channelId) return `https://www.youtube.com/channel/${encodeURIComponent(context.channelId)}/community`
 if (context.channelHandle) return `https://www.youtube.com/@${encodeURIComponent(context.channelHandle.replace(/^@/, ""))}/community`
 return null
}

const mediaContextFor = (draft: CommunityPostDraftV1, videos: CreatorEngagementContext["videoAssets"]) => [
 `Post format: ${draft.type}.`,
 draft.pollOptions.some(Boolean) ? `Poll options: ${draft.pollOptions.filter(Boolean).join(" | ")}.` : "",
 draft.linkedVideoId ? `Linked video: ${videos.find((video) => video.videoId === draft.linkedVideoId)?.title || draft.linkedVideoId}.` : "",
].filter(Boolean).join("\n")

export const useCommunityPostController = (context: CreatorEngagementContext): CommunityPostController => {
 const [draft, setDraft] = useState<CommunityPostDraftV1>(() => readCommunityPostState())
 const [mode, setMode] = useState<CommunityPostMode>("write")
 const [videoSearch, setVideoSearch] = useState("")
 const [vault, setVault] = useState<CommunityPostDraftV1[]>(() => readCommunityPostVault())
 const [isGenerating, setIsGenerating] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const [clipboardStatus, setClipboardStatus] = useState<"idle" | "copied" | "error">("idle")

 const update = (patch: Partial<CommunityPostDraftV1>) => setDraft((current) => ({
  ...current,
  ...patch,
  updatedAt: new Date().toISOString(),
 }))

 useEffect(() => {
  const timer = window.setTimeout(() => writeCommunityPostState(draft), 120)
  return () => window.clearTimeout(timer)
 }, [draft])

 useEffect(() => {
  const sync = () => {
   setVault(readCommunityPostVault())
  }
  const storage = (event: StorageEvent) => {
   if (event.key?.includes("community_post") || event.key === "viewtube_post_vault") sync()
  }
  window.addEventListener(COMMUNITY_POST_CHANGED_EVENT, sync)
  window.addEventListener("storage", storage)
  return () => {
   window.removeEventListener(COMMUNITY_POST_CHANGED_EVENT, sync)
   window.removeEventListener("storage", storage)
  }
 }, [])

 useEffect(() => {
  const applyImage = (payload: any) => {
   if (!payload?.imageUrl) return
   setMode("write")
   setDraft((current) => ({
    ...current,
    type: "image",
    imageUrl: String(payload.imageUrl),
    content: current.content.trim()
     ? current.content
     : payload.prompt
      ? `Generated concept: ${payload.prompt}`
      : current.content,
    updatedAt: new Date().toISOString(),
   }))
  }
  const onBridge = (event: Event) => {
   const detail = (event as CustomEvent<any>).detail
   if (detail?.targetWidget === "community-post") applyImage(detail)
  }
  window.addEventListener("vt_dashboard_generated_image", onBridge as EventListener)
  try {
   const cached = localStorage.getItem("vt_bridge_image_community-post")
   if (cached) applyImage(JSON.parse(cached))
  } catch { /* Ignore malformed bridge cache and keep the current draft. */ }
  return () => window.removeEventListener("vt_dashboard_generated_image", onBridge as EventListener)
 // The bridge is an inbound event subscription; current draft changes must not re-register it.
 }, [])

 const recentTitles = context.videoAssets.slice(0, 5).map((video) => video.title)
 const refine = async () => {
  if (!draft.content.trim()) return
  setIsGenerating(true)
  setError(null)
  try {
   const media = [draft.imageUrl, ...draft.imagePollUrls].filter(Boolean)
   const refined = await refineCommunityPost(
    `${draft.content}\n\n${mediaContextFor(draft, context.videoAssets)}`,
    context.channelName || "Content Creation",
    recentTitles,
    context.brain,
    media,
   )
   update({ content: refined })
   setMode("write")
  } catch (cause) {
   console.error("Community post refinement failed", cause)
   setError(cause instanceof Error ? cause.message : "ViewTube could not refine this post. Try again.")
  } finally { setIsGenerating(false) }
 }

 const generate = async () => {
  if (!draft.prompt.trim()) return
  setIsGenerating(true)
  setError(null)
  try {
   const generated = await refineCommunityPost(
    `${draft.prompt}\n\nStyle: ${draft.style}.\n${mediaContextFor(draft, context.videoAssets)}`,
    context.channelName || "Content Creation",
    recentTitles,
    context.brain,
   )
   update({ content: generated, prompt: "" })
   setMode("write")
  } catch (cause) {
   console.error("Community post generation failed", cause)
   setError(cause instanceof Error ? cause.message : "ViewTube could not generate this post. Try again.")
  } finally { setIsGenerating(false) }
 }

 const saveToVault = () => {
  if (!draft.content.trim()) return
  const saved = normalizeCommunityPostDraft({ ...draft, id: emptyCommunityPostDraft().id, createdAt: new Date().toISOString() })
  const next = [saved, ...vault]
  setVault(next)
  writeCommunityPostVault(next)
 }

 const loadFromVault = (id: string) => {
  const saved = vault.find((item) => item.id === id)
  if (saved) setDraft(normalizeCommunityPostDraft({ ...saved, id: draft.id }))
 }

 const removeFromVault = (id: string) => {
  const next = vault.filter((item) => item.id !== id)
  setVault(next)
  writeCommunityPostVault(next)
 }

 const copyPost = async () => {
  if (!draft.content.trim()) return
  try {
   await navigator.clipboard.writeText(draft.content)
   setClipboardStatus("copied")
   window.setTimeout(() => setClipboardStatus("idle"), 2000)
  } catch (cause) {
   console.error("Community post copy failed", cause)
   setClipboardStatus("error")
   setError("ViewTube could not copy the post. Select the text and copy it manually.")
  }
 }

 const applyImageFile = (file?: File, optionIndex?: number) => {
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
   const url = String(event.target?.result || "")
   if (typeof optionIndex === "number") {
    update({ imagePollUrls: draft.imagePollUrls.map((item, index) => index === optionIndex ? url : item) })
   } else update({ imageUrl: url })
  }
  reader.readAsDataURL(file)
 }

 const filteredVideos = useMemo(() => context.videoAssets
  .filter((video) => !videoSearch || video.title.toLowerCase().includes(videoSearch.toLowerCase()) || video.videoId.toLowerCase().includes(videoSearch.toLowerCase()))
  .slice(0, 50), [context.videoAssets, videoSearch])

 return {
  mode, setMode,
  postType: draft.type,
  setPostType: (type: CommunityPostType) => update({ type }),
  content: draft.content, setContent: (content) => update({ content }),
  prompt: draft.prompt, setPrompt: (prompt) => update({ prompt }),
  pollOptions: draft.pollOptions,
  setPollOption: (index, value) => update({ pollOptions: draft.pollOptions.map((item, itemIndex) => itemIndex === index ? value : item) }),
  imageUrl: draft.imageUrl, setImageUrl: (imageUrl) => update({ imageUrl }),
  imagePollUrls: draft.imagePollUrls,
  setImagePollUrl: (index, value) => update({ imagePollUrls: draft.imagePollUrls.map((item, itemIndex) => itemIndex === index ? value : item) }),
  selectedVideoId: draft.linkedVideoId, setSelectedVideoId: (linkedVideoId) => update({ linkedVideoId }),
  videoSearch, setVideoSearch,
  style: draft.style, setStyle: (style) => update({ style }),
  isGenerating, error, clipboardStatus, vault, filteredVideos,
  channelCommunityUrl: buildChannelCommunityUrl(context),
  refine, generate, saveToVault, loadFromVault, removeFromVault, copyPost, applyImageFile,
 }
}
