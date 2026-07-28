import React, { useState, useEffect, useMemo } from "react"
import { WidgetShell } from "../WidgetShell"
import { useEntitlement } from "../../../context/entitlementContext"
import {
  MessageSquare,
  Sparkles,
  Send,
  History,
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Loader2
} from "lucide-react"
import {
  postCommentReply,
  fetchAllCommentThreads,
  fetchVideoSnippetDetails
} from "../../../services/youtubeService"
import { generatePerfectReply } from "../../../services/gemini"
import { useBrain } from "../../../context/useBrain"
import { canAffordAiTokensFromState } from "../../../services/billingEntitlement"
import { getAiTokenCost } from "../../../services/aiTokenCosts"

const htmlDecode = (input: string) => {
  const doc = new DOMParser().parseFromString(input, "text/html")
  return doc.documentElement.textContent || input
}

const THUMBNAIL_WARNINGS = new Set<string>()

export const CommentReplyWidget = ({
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
}: any) => {
  const { brain } = useBrain()
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

  const [tab, setTab] = useState<"unreplied" | "history">("unreplied")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allThreads, setAllThreads] = useState<any[]>([])
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({})
  const [successId, setSuccessId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [fetchedVideoData, setFetchedVideoData] = useState<Record<string, any>>({})
  const [isSyncingMetadata, setIsSyncingMetadata] = useState(false)
  const [inboundImageUrl, setInboundImageUrl] = useState<string | null>(null)
  
  const REPLY_DRAFT_COST = getAiTokenCost("commentMagicDraftPerThread")
  const entitlement = useEntitlement()
  const selectedDraftCost = selectedIds.size * REPLY_DRAFT_COST
  const canAffordSelectedDrafts =
    selectedIds.size === 0 ? true : canAffordAiTokensFromState(entitlement, selectedDraftCost)

  const channelId = data.brain?.channelProfile?.id || data.authState?.channelId || ""
  const canonicalVideos = useMemo(() => data.videoAssets || [], [data.videoAssets])

  const syncMetadata = async (threads: any[]) => {
    if (isSyncingMetadata) return
    setIsSyncingMetadata(true)
    try {
      const videoIds = Array.from(new Set(threads.map((t: any) => t.snippet.videoId).filter(Boolean)))
      const missingIds = videoIds.filter(id => {
        const inCanonical = canonicalVideos.find((v: any) => v.videoId === id)
        const inFetched = fetchedVideoData[id]
        return (!inCanonical || !inCanonical.title || inCanonical.title === "Unknown Video") && 
               (!inFetched || !inFetched.title || inFetched.title === "Unknown Video")
      })
      
      if (missingIds.length > 0) {
        console.info(`[CommentResponder] Fetching metadata for ${missingIds.length} missing videos...`)
        const details = await fetchVideoSnippetDetails(missingIds as string[])
        setFetchedVideoData(prev => ({...prev, ...details}))
      }
    } catch (e) {
      console.warn("[CommentResponder] Metadata sync failed", e)
    } finally {
      setIsSyncingMetadata(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const threads = await fetchAllCommentThreads(100, channelId)
        setAllThreads(threads)
        await syncMetadata(threads)
      } catch (e: any) {
        console.error("Comment fetch failed:", e)
        setError(e.message || "Failed to load comments")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [channelId, canonicalVideos.length])

  useEffect(() => {
    const applyImage = (payload: any) => {
      if (!payload?.imageUrl) return
      setInboundImageUrl(payload.imageUrl)
    }
    const onBridge = (event: Event) => {
      const detail = (event as CustomEvent<any>).detail
      if (!detail || detail.targetWidget !== "comment-replier") return
      applyImage(detail)
    }
    window.addEventListener("vt_dashboard_generated_image", onBridge as EventListener)
    try {
      const cached = localStorage.getItem("vt_bridge_image_comment-replier")
      if (cached) applyImage(JSON.parse(cached))
    } catch {}
    return () => window.removeEventListener("vt_dashboard_generated_image", onBridge as EventListener)
  }, [])

  const unreplied = allThreads.filter((thread: any) => {
    const replies = thread.replies?.comments || []
    return !replies.some(
      (reply: any) => reply.snippet.authorChannelId?.value === channelId,
    )
  })

  const replied = allThreads.filter((thread: any) => {
    const replies = thread.replies?.comments || []
    return replies.some(
      (reply: any) => reply.snippet.authorChannelId?.value === channelId,
    )
  })

  const displayComments = tab === "unreplied" ? unreplied : replied

  useEffect(() => {
    setSelectedIds(new Set())
  }, [tab])

  const handleMagicDraft = async (commentIds: string[]) => {
    if (commentIds.length === 0) return
    const totalCost = commentIds.length * REPLY_DRAFT_COST
    if (!canAffordAiTokensFromState(entitlement, totalCost)) return
    
    commentIds.forEach(id => setIsGenerating(prev => ({...prev, [id]: true})))
    
    try {
      const available = canonicalVideos.map((r: any) => ({title: r.title, id: r.videoId}))

      const promises = commentIds.map(async (id) => {
        const thread = allThreads.find(t => t.id === id)
        const comment = thread.snippet.topLevelComment
        const draft = await generatePerfectReply(
          comment.snippet.textOriginal,
          comment.snippet.authorDisplayName.replace(/@/g, ""),
          data.brain?.channelProfile?.name || "Content Creation",
          available,
          brain
        )

        let finalReply = draft.reply
        if (draft.suggestedVideoId) {
          finalReply += `\n\nCheck this out for more details: https://youtu.be/${draft.suggestedVideoId}`
        }
        return { id, reply: finalReply }
      })

      const results = await Promise.all(promises)
      results.forEach(({id, reply}) => {
        setReplyText(prev => ({...prev, [id]: reply}))
      })
    } catch (e) {
      console.error(e)
    } finally {
      commentIds.forEach(id => setIsGenerating(prev => ({...prev, [id]: false})))
    }
  }

  const handleSuggestVideoBulk = (commentIds: string[]) => {
    if (canonicalVideos.length === 0 || commentIds.length === 0) return
    
    // Filter to long format videos only
    const longVideos = canonicalVideos.filter((v: any) => 
      v.format === "VIDEO_ON_DEMAND" || v.format === "long" || (v.durationSeconds && v.durationSeconds > 65)
    )
    const pool = longVideos.length > 0 ? longVideos : canonicalVideos

    commentIds.forEach(id => {
      const thread = allThreads.find(t => t.id === id)
      const threadVideoId = thread?.snippet?.videoId
      
      let relatedVideo = null
      if (threadVideoId) {
        // Try to find the original video to get its title
        const originalVideo = canonicalVideos.find((v: any) => v.videoId === threadVideoId)
        if (originalVideo && originalVideo.title) {
          const originalWords = originalVideo.title.toLowerCase().split(/[\W_]+/).filter((w: string) => w.length > 3)
          
          let bestScore = -1
          for (const v of pool) {
            if (v.videoId === threadVideoId) continue
            if (!v.title) continue
            const vWords = v.title.toLowerCase().split(/[\W_]+/)
            let score = 0
            for (const w of originalWords) {
              if (vWords.includes(w)) score++
            }
            if (score > bestScore) {
              bestScore = score
              relatedVideo = v
            }
          }
        }
      }
      
      if (!relatedVideo) {
        relatedVideo = pool[Math.floor(Math.random() * pool.length)]
      }
      
      if (relatedVideo) {
        const suggestion = `\n\nI think you'd love this one too: https://youtu.be/${relatedVideo.videoId}`
        setReplyText(prev => ({...prev, [id]: (prev[id] || "") + suggestion}))
      }
    })
  }

  const handleSendBulk = async (commentIds: string[]) => {
    const validIds = commentIds.filter(id => replyText[id]?.trim())
    if (validIds.length === 0) return

    setLoading(true)
    try {
      await Promise.all(validIds.map(id => postCommentReply(id, replyText[id])))
      
      validIds.forEach(id => {
        setReplyText(prev => {
          const next = { ...prev }
          delete next[id]
          return next
        })
      })
      
      // Sync local state
      setAllThreads(prev => 
        prev.map(t => {
          if (!validIds.includes(t.id)) return t
          const text = replyText[t.id]
          return {
            ...t,
            replies: {
              ...t.replies,
              comments: [
                ...(t.replies?.comments || []),
                {
                  snippet: {
                    authorChannelId: { value: channelId },
                    textDisplay: text,
                    publishedAt: new Date().toISOString(),
                  },
                },
              ],
            },
          }
        })
      )
      
      setSelectedIds(new Set())
      alert("All selected replies transmitted!")
    } catch (e) {
      alert("Failed to post some replies. Check YouTube permissions.")
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const headerContent = (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", justifyContent: "center", position: "relative" }}>
      {/* Tabs / Toggles — Standardized vt-tab-group */}
      <div className="vt-tab-group" style={{ width: "90px", padding: "2px" }}>
        <button
          onClick={() => setTab("unreplied")}
          className={`vt-tab-btn ${tab === "unreplied" ? 'active' : ''}`}
          style={{ padding: "4px", fontSize: "9px" }}
        >
          NEW
        </button>
        <button
          onClick={() => setTab("history")}
          className={`vt-tab-btn ${tab === "history" ? 'active' : ''}`}
          style={{ padding: "4px", fontSize: "9px" }}
        >
          OLD
        </button>
      </div>

    </div>
  )

  return (
    <WidgetShell {...common} headerContent={headerContent} icon={<MessageSquare size={22} />}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "10px", minHeight: 0 }}>
        {inboundImageUrl && (
          <div style={{ border: "2px solid color-mix(in srgb, var(--widget-color, #000) 60%, black)", borderRadius: "8px", padding: "6px 8px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.7 }}>Image received from generator</span>
            <button
              className="vt-button"
              style={{ height: "24px", fontSize: "8px", padding: "0 8px" }}
              onClick={() => navigator.clipboard?.writeText(inboundImageUrl)}
            >
              COPY URL
            </button>
          </div>
        )}
        
        {/* Comment List - Now fully scrollable, no pagination */}
        <div className="vt-widget-fill-body" style={{ gap: "10px", padding: "6px 0" }}>
          {loading && allThreads.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", opacity: 0.4, fontWeight: 900, fontSize: "12px" }}>
              <Loader2 size={24} className="animate-spin mx-auto mb-2" />
              SYNCING COMMENTS...
            </div>
          ) : displayComments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", opacity: 0.3, fontWeight: 900, fontSize: "11px" }}>NO COMMENTS FOUND.</div>
          ) : (
            displayComments.map((thread) => {
              const c = thread.snippet.topLevelComment.snippet
              const authorHandle = htmlDecode(c.authorDisplayName.replace(/^@+/, "@"))
              const videoId = thread.snippet.videoId
              // Check canonical first, then fetchedVideoData
              const videoCandidate = canonicalVideos.find((v: any) => v.videoId === videoId)
              const fetched = fetchedVideoData[videoId]
              const video = (fetched && fetched.title && fetched.title !== "Unknown Video") ? fetched : videoCandidate
              const threadId = thread.id
              const currentReply = replyText[threadId] || ""
              const isSelected = selectedIds.has(threadId)
              const existingChannelReplies = (thread.replies?.comments || []).filter(
                (reply: any) => reply.snippet.authorChannelId?.value === channelId
              )

              return (
                <div 
                  key={threadId} 
                  style={{ 
                    border: "2px solid var(--widget-border, #000)", 
                    borderRadius: "8px", 
                    padding: "8px 10px", 
                    background: "#fff", 
                    display: "flex", 
                    flexDirection: "column",
                    gap: "8px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {/* Alignment row: thumbnail bottom-aligned with the pp */}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
                      {/* Thumbnail */}
                      <div style={{
                        width: "120px",
                        flexShrink: 0,
                        aspectRatio: "16/9",
                        background: "#000",
                        border: "2px solid var(--widget-border, #000)",
                        borderRadius: "6px",
                        overflow: "hidden",
                      }}>
                        {videoId ? (
                            <img
                              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src.includes('hqdefault.jpg')) {
                                  target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                                } else if (target.src.includes('mqdefault.jpg')) {
                                  if (!THUMBNAIL_WARNINGS.has(videoId)) {
                                    THUMBNAIL_WARNINGS.add(videoId)
                                    console.warn(`[CommentReplyWidget] Thumbnail missing for video ${videoId}; using placeholder.`)
                                  }
                                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23111' font-family='Arial' font-size='16'%3EThumbnail unavailable%3C/text%3E%3C/svg%3E";
                                }
                              }}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              alt="thumbnail"
                            />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "#E0B0FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Loader2 size={16} className="animate-spin text-black/20" />
                          </div>
                        )}
                      </div>

                      {/* Right column: title on top (no gap below), then pp bottom-aligned with the thumbnail */}
                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "0" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                          {/* Video Title - top row of the right column, clamped to 3 lines */}
                          <div style={{
                            flex: 1,
                            minWidth: 0,
                            fontSize: "9px",
                            fontWeight: 900,
                            color: "#00D2FF",
                            textTransform: "uppercase",
                            lineHeight: 1.25,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}>
                            {video?.title && video.title !== "Unknown Video" ? htmlDecode(video.title) : `[${videoId}]`}
                          </div>

                          {/* Checkbox */}
                          <div
                            onClick={() => toggleSelection(threadId)}
                            style={{
                              width: "22px",
                              height: "22px",
                              border: "2px solid var(--widget-border, #000)",
                              borderRadius: "6px",
                              background: isSelected ? "var(--widget-border, #000)" : "#fff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}
                          >
                            {isSelected && (
                              <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "var(--widget-color, #000)" }} />
                            )}
                          </div>
                        </div>

                        {/* Profile picture, bottom-aligned with the thumbnail; handle/date/comment to its right */}
                        <div style={{ display: "flex", gap: "8px" }}>
                          <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#FFB570", border: "2px solid var(--widget-border, #000)", flexShrink: 0, overflow: "hidden" }}>
                            <img src={c.authorProfileImageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "10px", fontWeight: 1000, color: "#FF3399", textTransform: "uppercase", lineHeight: 1 }}>
                                {authorHandle}
                              </span>
                              <span style={{ fontSize: "8px", fontWeight: 900, color: "#FF1744", textTransform: "uppercase" }}>
                                {new Date(c.publishedAt).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Comment Text - Full, no truncation, decoded HTML entities */}
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#000", lineHeight: 1.25 }}>
                              {htmlDecode(c.textDisplay)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Existing Channel Replies (History mode) */}
                  {tab === "history" && existingChannelReplies.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.65 }}>
                        Previous Replies
                      </div>
                      {existingChannelReplies.map((reply: any, idx: number) => (
                        <div
                          key={`${threadId}-reply-${idx}`}
                          style={{
                            border: "1.5px solid var(--widget-border, #000)",
                            borderRadius: "8px",
                            background: "#F4F4F4",
                            padding: "6px 8px",
                            fontSize: "10px",
                            fontWeight: 700,
                            lineHeight: 1.3,
                            color: "#000",
                          }}
                        >
                          {htmlDecode(reply.snippet.textDisplay || "")}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input - available for NEW and OLD */}
                  {(
                    <div style={{ width: "100%" }}>
                      <textarea
                        className="vt-textarea"
                        style={{ minHeight: "39px" }}
                        value={currentReply}
                        onChange={(e) => setReplyText(prev => ({...prev, [threadId]: e.target.value}))}
                        placeholder={tab === "history" ? "ADD FOLLOW-UP REPLY..." : "REPLY..."}
                      />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Global Action Buttons */}
        {(
          <div className="vt-full-bleed-bottom border-t-[3px] border-[var(--widget-border,#000)] pt-2.5 pb-2 px-2.5 flex gap-2 bg-[#fff]">
            <button
              onClick={() => handleMagicDraft(Array.from(selectedIds))}
              disabled={selectedIds.size === 0 || loading || !canAffordSelectedDrafts}
              className="vt-button secondary"
              style={{ flex: 1, height: "32px", fontSize: "10px", padding: "0 8px", boxSizing: "border-box" }}
            >
              <Sparkles size={13} /> DRAFT {selectedIds.size > 0 && `(${selectedIds.size})`}
            </button>
            <button
              onClick={() => handleSendBulk(Array.from(selectedIds))}
              disabled={selectedIds.size === 0 || loading}
              className="vt-button primary"
              style={{ flex: 1, height: "32px", fontSize: "10px", padding: "0 8px", boxSizing: "border-box" }}
            >
              <Send size={13} /> POST {selectedIds.size > 0 && `(${selectedIds.size})`}
            </button>
            <button
              onClick={() => handleSuggestVideoBulk(Array.from(selectedIds))}
              disabled={selectedIds.size === 0 || loading}
              className="vt-button"
              style={{ flex: 1, height: "32px", fontSize: "10px", padding: "0 8px", boxSizing: "border-box" }}
            >
              + VIDEOS
            </button>
          </div>
        )}
        {selectedIds.size > 0 && !canAffordSelectedDrafts && (
          <div style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.6 }}>
            {entitlement.tier === "free"
              ? "Upgrade for AI reply drafts."
              : `Need ${selectedDraftCost} credits for selected drafts.`}
          </div>
        )}
      </div>
    </WidgetShell>
  )
}
