import React, { useState, useEffect, useMemo } from "react"
import { WidgetShell } from "../WidgetShell"
import { useEntitlement } from "../../../app/AppShell"
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
  Loader2,
  Wand2,
  Video,
  Zap,
  ThumbsUp,
  RefreshCw,
  Target
} from "lucide-react"
import {
  postCommentReply,
  fetchAllCommentThreads,
  fetchVideoSnippetDetails
} from "../../../services/youtubeService"
import { 
  generatePerfectReply,
  generateEnhancedReply,
  refineUserReply,
  recommendVideoForComment,
  type EnhancedReplyResult,
  type RefinedReplyResult,
  type VideoRecommendation
} from "../../../services/gemini"
import { useBrain } from "../../../context/useBrain"
import { canAffordAiTokensFromState } from "../../../services/billingEntitlement"
import { getAiTokenCost } from "../../../services/aiTokenCosts"

const htmlDecode = (input: string) => {
  const doc = new DOMParser().parseFromString(input, "text/html")
  return doc.documentElement.textContent || input
}

const THUMBNAIL_WARNINGS = new Set<string>()

type AIMode = "generate" | "refine" | "recommend"

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
  
  // NEW: AI Mode states
  const [aiMode, setAiMode] = useState<AIMode>("generate")
  const [videoRecommendations, setVideoRecommendations] = useState<Record<string, VideoRecommendation>>({})
  const [refinementResults, setRefinementResults] = useState<Record<string, RefinedReplyResult>>({})
  const [toneConfidence, setToneConfidence] = useState<Record<string, number>>({})
  const [showAdvanced, setShowAdvanced] = useState<Record<string, boolean>>({})
  
  const REPLY_DRAFT_COST = getAiTokenCost("commentMagicDraftPerThread")
  const entitlement = useEntitlement()
  const selectedDraftCost = selectedIds.size * REPLY_DRAFT_COST
  const canAffordSelectedDrafts =
    selectedIds.size === 0 ? true : canAffordAiTokensFromState(entitlement, selectedDraftCost)

  const channelId = data.brain?.channelProfile?.id || data.authState?.channelId || ""
  const channelName = data.brain?.channelProfile?.name || data.authState?.channelName || "Content Creator"
  const channelDescription = data.brain?.channelProfile?.description || ""
  const canonicalVideos = useMemo(() => data.canonicalRows || data.brain?.canonicalRows || [], [data])

  // Collect previous replies for tone matching
  const previousReplies = useMemo(() => {
    const replies: string[] = []
    allThreads.forEach((thread: any) => {
      const threadReplies = thread.replies?.comments || []
      threadReplies.forEach((reply: any) => {
        if (reply.snippet.authorChannelId?.value === channelId) {
          replies.push(htmlDecode(reply.snippet.textDisplay || ""))
        }
      })
    })
    return replies.slice(0, 10)
  }, [allThreads, channelId])

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

  // ENHANCED: AI Magic Draft with tone matching
  const handleMagicDraft = async (commentIds: string[]) => {
    if (commentIds.length === 0) return
    const totalCost = commentIds.length * REPLY_DRAFT_COST
    if (!canAffordAiTokensFromState(entitlement, totalCost)) return
    
    commentIds.forEach(id => setIsGenerating(prev => ({...prev, [id]: true})))
    
    try {
      const available = canonicalVideos.map((r: any) => ({
        title: r.title, 
        id: r.videoId,
        description: r.description || ""
      }))

      const channelContext = {
        channelName,
        channelDescription,
        previousReplies,
        communityPosts: [], // Could be fetched from community post history
      }

      const promises = commentIds.map(async (id) => {
        const thread = allThreads.find(t => t.id === id)
        const comment = thread.snippet.topLevelComment
        
        // Use enhanced reply generation
        const result = await generateEnhancedReply(
          comment.snippet.textOriginal,
          comment.snippet.authorDisplayName.replace(/@/g, ""),
          channelContext,
          available,
          brain
        )

        let finalReply = result.reply
        if (result.suggestedVideoId) {
          finalReply += `\n\nCheck this out: https://youtu.be/${result.suggestedVideoId}`
          setVideoRecommendations(prev => ({
            ...prev,
            [id]: {
              recommendedVideoId: result.suggestedVideoId!,
              matchStrength: result.toneConfidence || 0.7,
              reason: result.videoRecommendationReason || "",
              bridgePhrase: ""
            }
          }))
        }
        
        if (result.toneConfidence) {
          setToneConfidence(prev => ({...prev, [id]: result.toneConfidence!}))
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

  // NEW: Refine user-typed reply
  const handleRefineReply = async (threadId: string) => {
    const currentReply = replyText[threadId]
    if (!currentReply?.trim()) return
    
    const thread = allThreads.find(t => t.id === threadId)
    if (!thread) return
    
    setIsGenerating(prev => ({...prev, [threadId]: true}))
    
    try {
      const originalComment = thread.snippet.topLevelComment.snippet.textOriginal
      const result = await refineUserReply(
        currentReply,
        originalComment,
        { channelName, previousReplies },
        brain
      )
      
      setReplyText(prev => ({...prev, [threadId]: result.refinedReply}))
      setRefinementResults(prev => ({...prev, [threadId]: result}))
    } catch (e) {
      console.error("Refinement failed:", e)
    } finally {
      setIsGenerating(prev => ({...prev, [threadId]: false}))
    }
  }

  // NEW: Get video recommendation for a specific comment
  const handleGetVideoRecommendation = async (threadId: string) => {
    const thread = allThreads.find(t => t.id === threadId)
    if (!thread) return
    
    setIsGenerating(prev => ({...prev, [threadId]: true}))
    
    try {
      const commentText = thread.snippet.topLevelComment.snippet.textOriginal
      const available = canonicalVideos.map((r: any) => ({
        title: r.title,
        id: r.videoId,
        description: r.description || "",
        tags: r.tags || []
      }))
      
      const recommendation = await recommendVideoForComment(commentText, available, brain)
      
      if (recommendation.recommendedVideoId) {
        setVideoRecommendations(prev => ({...prev, [threadId]: recommendation}))
        
        // Add to reply text if there's existing content
        const current = replyText[threadId] || ""
        const videoLink = `\n\n${recommendation.bridgePhrase || "You might enjoy this"}: https://youtu.be/${recommendation.recommendedVideoId}`
        if (!current.includes(recommendation.recommendedVideoId)) {
          setReplyText(prev => ({...prev, [threadId]: current + videoLink}))
        }
      }
    } catch (e) {
      console.error("Video recommendation failed:", e)
    } finally {
      setIsGenerating(prev => ({...prev, [threadId]: false}))
    }
  }

  const handleSuggestVideoBulk = (commentIds: string[]) => {
    if (canonicalVideos.length === 0 || commentIds.length === 0) return
    
    commentIds.forEach(id => {
      const randomVideo = canonicalVideos[Math.floor(Math.random() * canonicalVideos.length)]
      const suggestion = `\n\nI think you'd love this one too: https://youtu.be/${randomVideo.videoId}`
      setReplyText(prev => ({...prev, [id]: (prev[id] || "") + suggestion}))
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
      {/* Tabs / Toggles */}
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
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "10px" }}>
        {inboundImageUrl && (
          <div style={{ border: "2px solid #000", borderRadius: "8px", padding: "6px 8px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
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
        
        {/* Comment List - Now fully scrollable */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}>
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
              const videoCandidate = canonicalVideos.find((v: any) => v.videoId === videoId)
              const fetched = fetchedVideoData[videoId]
              const video = (fetched && fetched.title && fetched.title !== "Unknown Video") ? fetched : videoCandidate
              const threadId = thread.id
              const currentReply = replyText[threadId] || ""
              const isSelected = selectedIds.has(threadId)
              const existingChannelReplies = (thread.replies?.comments || []).filter(
                (reply: any) => reply.snippet.authorChannelId?.value === channelId
              )
              const recommendation = videoRecommendations[threadId]
              const refinement = refinementResults[threadId]
              const confidence = toneConfidence[threadId]
              const isAdvancedOpen = showAdvanced[threadId]

              return (
                <div 
                  key={threadId} 
                  style={{ 
                    border: "3px solid #000", 
                    borderRadius: "12px", 
                    padding: "10px", 
                    background: "#fff", 
                    display: "flex", 
                    flexDirection: "column",
                    gap: "8px",
                    boxShadow: "3px 3px 0 0 rgba(0,0,0,0.05)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    {/* Thumbnail */}
                    <div style={{ width: "80px", flexShrink: 0 }}>
                      <div style={{ 
                        width: "100%", 
                        aspectRatio: "16/9", 
                        background: "#000", 
                        border: "3px solid #000", 
                        borderRadius: "8px", 
                        overflow: "hidden",
                        boxShadow: "2px 2px 0 0 rgba(0,0,0,0.5)"
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
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#FFB570", border: "1.5px solid #000", flexShrink: 0, overflow: "hidden" }}>
                          <img src={c.authorProfileImageUrl} style={{ width: "100%", height: "100%" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "10px", fontWeight: 1000, color: "#FF3399", textTransform: "uppercase", lineHeight: 1 }}>
                            {authorHandle}
                          </span>
                          <span style={{ fontSize: "8px", fontWeight: 900, color: "#FF1744", textTransform: "uppercase" }}>
                            {new Date(c.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Video Title */}
                      <div style={{ fontSize: "9px", fontWeight: 900, color: "#00D2FF", textTransform: "uppercase", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {video?.title && video.title !== "Unknown Video" ? htmlDecode(video.title) : `[${videoId}]`}
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div 
                      onClick={() => toggleSelection(threadId)}
                      style={{ 
                        width: "22px", 
                        height: "22px", 
                        border: "3px solid #000", 
                        borderRadius: "6px", 
                        background: isSelected ? "#000" : "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        flexShrink: 0
                      }}
                    >
                      {isSelected && <Sparkles size={12} />}
                    </div>
                  </div>

                  {/* Comment Text */}
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#000", lineHeight: 1.2, padding: "4px 0" }}>
                    {htmlDecode(c.textDisplay)}
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
                            border: "2px solid #000",
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

                  {/* Reply Input */}
                  <div style={{ width: "100%" }}>
                    <textarea
                      className="vt-textarea"
                      value={currentReply}
                      onChange={(e) => setReplyText(prev => ({...prev, [threadId]: e.target.value}))}
                      placeholder={tab === "history" ? "ADD FOLLOW-UP REPLY..." : "REPLY..."}
                      style={{ 
                        width: "100%", 
                        height: "50px", 
                        padding: "6px", 
                        border: "2px solid #00D2FF", 
                        resize: "none", 
                        fontSize: "10px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  {/* AI Confidence & Recommendation indicators */}
                  {(confidence || recommendation) && (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {confidence && (
                        <div style={{ 
                          fontSize: "8px", 
                          fontWeight: 900, 
                          textTransform: "uppercase",
                          padding: "2px 6px",
                          background: confidence > 0.7 ? "#C9F830" : confidence > 0.4 ? "#FFE357" : "#FF8AAF",
                          border: "2px solid #000",
                          borderRadius: "4px"
                        }}>
                          Tone Match: {Math.round(confidence * 100)}%
                        </div>
                      )}
                      {recommendation && (
                        <div style={{ 
                          fontSize: "8px", 
                          fontWeight: 900, 
                          textTransform: "uppercase",
                          padding: "2px 6px",
                          background: "#00D2FF",
                          border: "2px solid #000",
                          borderRadius: "4px",
                          color: "#000"
                        }}>
                          <Video size={10} style={{ display: "inline", marginRight: "4px" }} />
                          Video Suggested
                        </div>
                      )}
                    </div>
                  )}

                  {/* Per-comment AI actions */}
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleMagicDraft([threadId])}
                      disabled={isGenerating[threadId]}
                      className="vt-button secondary"
                      style={{ height: "26px", fontSize: "8px", padding: "0 8px", flex: "1 1 auto" }}
                    >
                      {isGenerating[threadId] ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                      <span style={{ marginLeft: "4px" }}>GENERATE</span>
                    </button>
                    <button
                      onClick={() => handleRefineReply(threadId)}
                      disabled={isGenerating[threadId] || !currentReply.trim()}
                      className="vt-button"
                      style={{ height: "26px", fontSize: "8px", padding: "0 8px", flex: "1 1 auto" }}
                    >
                      <Wand2 size={10} />
                      <span style={{ marginLeft: "4px" }}>REFINE</span>
                    </button>
                    <button
                      onClick={() => handleGetVideoRecommendation(threadId)}
                      disabled={isGenerating[threadId]}
                      className="vt-button"
                      style={{ height: "26px", fontSize: "8px", padding: "0 8px", flex: "1 1 auto" }}
                    >
                      <Target size={10} />
                      <span style={{ marginLeft: "4px" }}>RECOMMEND</span>
                    </button>
                  </div>

                  {/* Refinement feedback */}
                  {refinement && (
                    <div style={{ 
                      fontSize: "8px", 
                      background: "#F0F0F0", 
                      padding: "6px", 
                      borderRadius: "6px",
                      border: "1px solid #000"
                    }}>
                      <div style={{ fontWeight: 900, marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <ThumbsUp size={10} />
                        ENGAGEMENT SCORE: {refinement.engagementScore}/100
                      </div>
                      {refinement.changes.length > 0 && (
                        <div style={{ opacity: 0.7 }}>
                          Changes: {refinement.changes.join(", ")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: "flex", gap: "8px", padding: "4px 0" }}>
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
