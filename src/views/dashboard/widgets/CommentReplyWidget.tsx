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
  MoreHorizontal
} from "lucide-react"
import {
  postCommentReply,
  fetchAllCommentThreads,
} from "../../../services/youtube/youtubeDataFetcher"
import { generatePerfectReply } from "../../../services/gemini"
import { useBrain } from "../../../context/GlobalDataContext"
import { canAffordAiTokensFromState } from "../../../services/billingEntitlement"
import { getAiTokenCost } from "../../../services/aiTokenCosts"

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
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const itemsPerPage = 3
  const REPLY_DRAFT_COST = getAiTokenCost("commentMagicDraftPerThread")
  const entitlement = useEntitlement()
  const selectedDraftCost = selectedIds.size * REPLY_DRAFT_COST
  const canAffordSelectedDrafts =
    selectedIds.size === 0 ? true : canAffordAiTokensFromState(entitlement, selectedDraftCost)

  const channelId = data.brain?.channelProfile?.id || data.authState?.channelId || ""
  const videos = useMemo(() => data.canonicalRows || data.brain?.canonicalRows || [], [data])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const threads = await fetchAllCommentThreads(40, channelId)
        setAllThreads(threads)
      } catch (e: any) {
        console.error("Comment fetch failed:", e)
        setError(e.message || "Failed to load comments")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [channelId])

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
  const totalPages = Math.ceil(displayComments.length / itemsPerPage)
  const paginatedComments = displayComments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
    setSelectedIds(new Set())
  }, [tab])

  const handleMagicDraft = async (commentIds: string[]) => {
    if (commentIds.length === 0) return
    const totalCost = commentIds.length * REPLY_DRAFT_COST
    if (!canAffordAiTokensFromState(entitlement, totalCost)) return
    
    commentIds.forEach(id => setIsGenerating(prev => ({...prev, [id]: true, onDecSize, onCycleHeight, onDecHeight})))
    
    try {
      const available = videos.map((r: any) => ({title: r.title, id: r.videoId, onDecSize, onCycleHeight, onDecHeight}))

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
      results.forEach(({id, reply, onDecSize, onCycleHeight, onDecHeight}) => {
        setReplyText(prev => ({...prev, [id]: reply, onDecSize, onCycleHeight, onDecHeight}))
      })
    } catch (e) {
      console.error(e)
    } finally {
      commentIds.forEach(id => setIsGenerating(prev => ({...prev, [id]: false, onDecSize, onCycleHeight, onDecHeight})))
    }
  }

  const handleSuggestVideoBulk = (commentIds: string[]) => {
    if (videos.length === 0 || commentIds.length === 0) return
    
    commentIds.forEach(id => {
      const randomVideo = videos[Math.floor(Math.random() * videos.length)]
      const suggestion = `\n\nI think you'd love this one too: https://youtu.be/${randomVideo.videoId}`
      setReplyText(prev => ({...prev, [id]: (prev[id] || "") + suggestion, onDecSize, onCycleHeight, onDecHeight}))
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
    <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", justifyContent: "center" }}>
      {/* Pagination Arrows */}
      <div style={{ display: "flex", gap: "4px" }}>
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={{ background: "none", border: "none", cursor: currentPage === 1 ? "default" : "pointer", opacity: currentPage === 1 ? 0.3 : 1 }}>
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={{ background: "none", border: "none", cursor: currentPage === totalPages ? "default" : "pointer", opacity: currentPage === totalPages ? 0.3 : 1 }}>
          <ChevronRight size={20} />
        </button>
      </div>

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
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "10px" }}>
        
        {/* Comment List */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {loading && allThreads.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", opacity: 0.4, fontWeight: 900, fontSize: "12px" }}>SYNCING...</div>
          ) : paginatedComments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", opacity: 0.3, fontWeight: 900, fontSize: "11px" }}>NO COMMENTS FOUND.</div>
          ) : (
            paginatedComments.map((thread) => {
              const c = thread.snippet.topLevelComment.snippet
              const authorHandle = c.authorDisplayName.replace(/^@+/, "@")
              const videoId = thread.snippet.videoId
              const video = videos.find((v: any) => v.videoId === videoId)
              const threadId = thread.id
              const currentReply = replyText[threadId] || ""
              const isSelected = selectedIds.has(threadId)

              return (
                <div 
                  key={threadId} 
                  style={{ 
                    border: "3px solid #000", 
                    borderRadius: "12px", 
                    padding: "6px", 
                    background: "#fff", 
                    display: "flex", 
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "3px 3px 0 0 rgba(0,0,0,0.05)"
                  }}
                >
                  {/* Purple Thumb */}
                  <div style={{ width: "50px", flexShrink: 0 }}>
                    <div style={{ width: "100%", aspectRatio: "16/9", background: "#E0B0FF", border: "2px solid #000", borderRadius: "4px", overflow: "hidden" }}>
                      {video && <img src={video.thumbnail} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                  </div>

                  {/* Orange PFP */}
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#FFB570", border: "1.5px solid #000", flexShrink: 0, overflow: "hidden" }}>
                    <img src={c.authorProfileImageUrl} style={{ width: "100%", height: "100%" }} />
                  </div>

                  {/* Pink Handle + Info */}
                  <div style={{ width: "80px", flexShrink: 0 }}>
                    <div style={{ fontSize: "8.5px", fontWeight: 1000, color: "#FF3399", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {authorHandle}
                    </div>
                    <div style={{ fontSize: "7px", fontWeight: 900, color: "#FF1744", textTransform: "uppercase" }}>
                      {new Date(c.publishedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Comment Text */}
                  <div style={{ flex: 1, minWidth: 0, fontSize: "9px", fontWeight: 700, color: "#000", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.1 }}>
                    {c.textDisplay}
                  </div>

                  {/* Blue Reply Input */}
                  {tab === "unreplied" && (
                    <div style={{ width: "120px", flexShrink: 0 }}>
                      <textarea
                        className="vt-textarea"
                        value={currentReply}
                        onChange={(e) => setReplyText(prev => ({...prev, [threadId]: e.target.value, onDecSize, onCycleHeight, onDecHeight}))}
                        placeholder="REPLY..."
                        style={{ width: "100%", height: "120px", padding: 0, border: "2px solid #00D2FF", resize: "none", fontSize: "9px" }}
                      />
                    </div>
                  )}

                  {/* Black Checkbox */}
                  <div 
                    onClick={() => toggleSelection(threadId)}
                    style={{ 
                      width: "18px", 
                      height: "18px", 
                      border: "2.5px solid #000", 
                      borderRadius: "4px", 
                      background: isSelected ? "#000" : "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      flexShrink: 0
                    }}
                  >
                    {isSelected && <Sparkles size={10} />}
                  </div>
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
              : `Need ${selectedDraftCost} tokens for selected drafts.`}
          </div>
        )}
      </div>
    </WidgetShell>
  )
}
