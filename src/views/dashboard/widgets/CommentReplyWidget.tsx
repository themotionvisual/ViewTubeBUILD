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
  Loader2
} from "lucide-react"
import {
  postCommentReply,
  fetchAllCommentThreads,
  fetchVideoSnippetDetails
} from "../../../services/youtube/youtubeDataFetcher"
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
  
  const REPLY_DRAFT_COST = getAiTokenCost("commentMagicDraftPerThread")
  const entitlement = useEntitlement()
  const selectedDraftCost = selectedIds.size * REPLY_DRAFT_COST
  const canAffordSelectedDrafts =
    selectedIds.size === 0 ? true : canAffordAiTokensFromState(entitlement, selectedDraftCost)

  const channelId = data.brain?.channelProfile?.id || data.authState?.channelId || ""
  const canonicalVideos = useMemo(() => data.canonicalRows || data.brain?.canonicalRows || [], [data])

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

      <button 
        onClick={() => syncMetadata(allThreads)}
        disabled={isSyncingMetadata || loading}
        title="Sync missing video titles/thumbnails"
        className="vt-header-action-btn"
        style={{ 
          position: "absolute", 
          right: "-10px", 
          top: "50%", 
          transform: "translateY(-50%)",
          background: isSyncingMetadata ? "#4FFF5B" : "transparent",
          borderRadius: "50%",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2.5px solid #000",
          cursor: "pointer"
        }}
      >
        <Sparkles size={14} className={isSyncingMetadata ? "animate-spin" : ""} />
      </button>
    </div>
  )

  return (
    <WidgetShell {...common} headerContent={headerContent} icon={<MessageSquare size={22} />}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "10px" }}>
        
        {/* Comment List - Now fully scrollable, no pagination */}
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
              // Check canonical first, then fetchedVideoData
              const videoCandidate = canonicalVideos.find((v: any) => v.videoId === videoId)
              const fetched = fetchedVideoData[videoId]
              const video = (fetched && fetched.title && fetched.title !== "Unknown Video") ? fetched : videoCandidate
              const threadId = thread.id
              const currentReply = replyText[threadId] || ""
              const isSelected = selectedIds.has(threadId)

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
                    {/* Thumbnail container inspired by VideoManager */}
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
                              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                              onError={(e) => { 
                                const target = e.target as HTMLImageElement;
                                if (target.src.includes('maxresdefault.jpg')) {
                                  target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                } else if (target.src.includes('hqdefault.jpg')) {
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
                      
                      {/* Video Title - Now decoded and shows title from fetched data */}
                      <div style={{ fontSize: "9px", fontWeight: 900, color: "#00D2FF", textTransform: "uppercase", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {video?.title && video.title !== "Unknown Video" ? htmlDecode(video.title) : `[${videoId}]`}
                      </div>
                    </div>

                    {/* Black Checkbox */}
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

                  {/* Comment Text - Full, no truncation, decoded HTML entities */}
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#000", lineHeight: 1.2, padding: "4px 0" }}>
                    {htmlDecode(c.textDisplay)}
                  </div>

                  {/* Blue Reply Input - Beneath, thinner */}
                  {tab === "unreplied" && (
                    <div style={{ width: "100%" }}>
                      <textarea
                        className="vt-textarea"
                        value={currentReply}
                        onChange={(e) => setReplyText(prev => ({...prev, [threadId]: e.target.value}))}
                        placeholder="REPLY..."
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
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Global Action Buttons */}
        {tab === "unreplied" && (
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
        )}
        {tab === "unreplied" && selectedIds.size > 0 && !canAffordSelectedDrafts && (
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
