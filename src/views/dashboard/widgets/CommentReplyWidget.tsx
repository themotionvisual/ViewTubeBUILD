import React, { useState, useEffect, useMemo } from "react"
import { WidgetShell } from "../WidgetShell"
import { WidgetHeaderStepper, WidgetHeaderToggle } from "../WidgetPrimitives"
import {
  MessageSquare,
  Sparkles,
  Send,
  Loader2
} from "lucide-react"
import {
  postCommentReply,
  fetchAllCommentThreads,
  fetchVideoSnippetDetails
} from "../../../services/youtubeService"
import { generatePerfectReply } from "../../../services/gemini"
import { useBrain } from "../../../context/useBrain"

const htmlDecode = (input: string) => {
  const doc = new DOMParser().parseFromString(input, "text/html")
  return doc.documentElement.textContent || input
}

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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fetchedVideoData, setFetchedVideoData] = useState<Record<string, any>>({})
  const [isSyncingMetadata, setIsSyncingMetadata] = useState(false)
  const [inboundImageUrl, setInboundImageUrl] = useState<string | null>(null)

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
        setFetchedVideoData(prev => ({ ...prev, ...details }))
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

  useEffect(() => {
    setCurrentIndex(0)
  }, [tab])

  const handleMagicDraft = async (commentId: string) => {
    setIsGenerating(prev => ({ ...prev, [commentId]: true }))
    try {
      const available = canonicalVideos.map((r: any) => ({ title: r.title, id: r.videoId }))
      const thread = allThreads.find(t => t.id === commentId)
      const comment = thread.snippet.topLevelComment
      const draft = await generatePerfectReply(
        comment.snippet.textOriginal,
        comment.snippet.authorDisplayName.replace(/@/g, ""),
        data.brain?.channelProfile?.name || "Content Creation",
        available,
        brain
      )
      let finalReply = draft.reply
      if (draft.suggestedVideoId) finalReply += `\n\nCheck this out for more details: https://youtu.be/${draft.suggestedVideoId}`
      setReplyText(prev => ({ ...prev, [commentId]: finalReply }))
    } catch (e) {
      console.error(e)
    } finally {
      setIsGenerating(prev => ({ ...prev, [commentId]: false }))
    }
  }

  const handleSend = async (commentId: string) => {
    if (!replyText[commentId]?.trim()) return
    setLoading(true)
    try {
      await postCommentReply(commentId, replyText[commentId])
      setReplyText(prev => { const next = { ...prev }; delete next[commentId]; return next })
      setAllThreads(prev => prev.map(t => {
        if (t.id !== commentId) return t
        return {
          ...t,
          replies: {
            ...t.replies,
            comments: [...(t.replies?.comments || []), {
              snippet: { authorChannelId: { value: channelId }, textDisplay: replyText[commentId], publishedAt: new Date().toISOString() },
            }],
          },
        }
      }))
      setCurrentIndex(i => Math.max(0, i - 1))
    } catch {
      alert("Failed to post reply. Check YouTube permissions.")
    } finally {
      setLoading(false)
    }
  }

  const displayComments = tab === "unreplied" ? unreplied : replied
  const safeIndex = Math.min(currentIndex, Math.max(0, displayComments.length - 1))
  const currentThread = displayComments[safeIndex] || null

  const headerContent = (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", justifyContent: "center" }}>
      <WidgetHeaderToggle
        label="Comment responder view"
        value={tab}
        onChange={setTab}
        items={[{ id: "unreplied", label: "New" }, { id: "history", label: "Old" }]}
      />
      {displayComments.length > 0 && (
        <WidgetHeaderStepper
          label="Comment pagination"
          value={`${safeIndex + 1} / ${displayComments.length}`}
          canPrevious={safeIndex > 0}
          canNext={safeIndex < displayComments.length - 1}
          onPrevious={() => setCurrentIndex(i => Math.max(0, i - 1))}
          onNext={() => setCurrentIndex(i => Math.min(displayComments.length - 1, i + 1))}
        />
      )}
    </div>
  )

  return (
    <WidgetShell {...common} contentLayout="flush" headerContent={headerContent} icon={<MessageSquare size={22} />}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0, minHeight: 0 }}>
        {inboundImageUrl && (
          <div style={{ border: "2px solid color-mix(in srgb, var(--widget-color, #000) 60%, black)", borderRadius: "8px", padding: "6px 8px", margin: "10px 10px 0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.7 }}>Image received from generator</span>
            <button className="vt-button" style={{ height: "24px", fontSize: "8px", padding: "0 8px" }} onClick={() => navigator.clipboard?.writeText(inboundImageUrl)}>COPY URL</button>
          </div>
        )}

        <div className="vt-widget-fill-body" style={{ gap: 0, padding: 0, justifyContent: "flex-start" }}>
          {loading && allThreads.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", opacity: 0.4, fontWeight: 900, fontSize: "12px" }}>
              <Loader2 size={24} className="animate-spin mx-auto mb-2" />
              SYNCING COMMENTS…
            </div>
          ) : !currentThread ? (
            <div style={{ textAlign: "center", padding: "40px", opacity: 0.3, fontWeight: 900, fontSize: "11px" }}>NO COMMENTS FOUND.</div>
          ) : (() => {
            const thread = currentThread
            const c = thread.snippet.topLevelComment.snippet
            const authorHandle = htmlDecode(c.authorDisplayName.replace(/^@+/, "@"))
            const videoId = thread.snippet.videoId
            const videoCandidate = canonicalVideos.find((v: any) => v.videoId === videoId)
            const fetched = fetchedVideoData[videoId]
            const video = (fetched && fetched.title && fetched.title !== "Unknown Video") ? fetched : videoCandidate
            const threadId = thread.id
            const currentReply = replyText[threadId] || ""
            const existingChannelReplies = (thread.replies?.comments || []).filter(
              (reply: any) => reply.snippet.authorChannelId?.value === channelId
            )

            return (
              <div style={{ borderBottom: "2px solid var(--widget-border, #000)", padding: "10px", background: "#fff", display: "flex", flexDirection: "column", gap: "8px" }}>

                {/* Changed to flex-start so thumbnail stays at the top */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>

                  {/* Left Column: Thumbnail + Video Title */}
                  <div className="kpi-video-card" style={{ width: "190px", flexShrink: 0 }}>
                    
                    {/* TOP SECTION: Blue title header */}
                    <div className="kpi-header">
                      {video?.title && video.title !== "Unknown Video" 
                        ? htmlDecode(video.title) 
                        : `[${videoId}]`}
                    </div>

                    {/* BOTTOM SECTION: The white area with the thumbnail */}
                    <div className="kpi-body">
                      <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", overflow: "hidden" }}>
                        {videoId ? (
                          <img
                            width={320}
                            height={180}
                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                            onError={(e) => {
                              const t = e.target as HTMLImageElement
                              if (t.src.includes("hqdefault.jpg")) t.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                              else t.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23111' font-family='Arial' font-size='16'%3EThumbnail unavailable%3C/text%3E%3C/svg%3E"
                            }}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            alt={`Video thumbnail for ${video?.title || videoId}`}
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "#E0B0FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Loader2 size={16} className="animate-spin text-black/20" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column Wrapper: Takes the remaining space */}
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                    
                    {/* Author Info & Comment text */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      
                      {/* Profile Circle */}
                      <div style={{ 
                        width: "56px", 
                        height: "56px", 
                        borderRadius: "50%", 
                        background: "#FFB570", 
                        border: "2px solid var(--widget-border, #000)", 
                        flexShrink: 0, 
                        overflow: "hidden" 
                      }}>
                        <img 
                          src={c.authorProfileImageUrl} 
                          width={36} 
                          height={36} 
                          alt={`${authorHandle} profile`} 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                      </div>

                      {/* Info Column */}
                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                        
                        {/* Author Name and Date */}
                        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "12px", fontWeight: 1000, color: "#FF3399", textTransform: "uppercase" }}>
                            {authorHandle}
                          </span>
                        </div>

                        {/* THE COMMENT TEXT: All-Caps, Bold, Stacks below Name */}
                        <span style={{ 
                          fontSize: "10px", 
                          fontWeight: 900, 
                          color: "#000", 
                          lineHeight: "1.2", 
                          wordWrap: "break-word",
                          textTransform: "uppercase",
                          display: "block"
                        }}>
                          {htmlDecode(c.textDisplay)}
                        </span>
                      </div>
                    </div>

                    {/* Previous Replies (Now enclosed in the Right Column) */}
                    {tab === "history" && existingChannelReplies.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.65 }}>Previous Replies</div>
                        {existingChannelReplies.map((reply: any, idx: number) => (
                          <div key={idx} style={{ border: "1.5px solid var(--widget-border, #000)", borderRadius: "8px", background: "#F4F4F4", padding: "6px 8px", fontSize: "10px", fontWeight: 700, lineHeight: 1.3 }}>
                            {htmlDecode(reply.snippet.textDisplay || "")}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Text Area (Now enclosed in the Right Column) */}
                    <textarea
                      className="vt-textarea"
                      style={{ minHeight: "52px" }}
                      value={currentReply}
                      onChange={(e) => setReplyText(prev => ({ ...prev, [threadId]: e.target.value }))}
                      placeholder={tab === "history" ? "ADD FOLLOW-UP REPLY..." : "REPLY..."}
                    />

                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {currentThread && (
          <div className="border-t-[3px] border-[var(--widget-border,#000)] p-2.5 flex gap-2 bg-[#fff]">
            <button
              onClick={() => handleMagicDraft(currentThread.id)}
              disabled={loading || isGenerating[currentThread.id]}
              className="vt-button secondary"
              style={{ flex: 1, height: "32px", fontSize: "10px", padding: "0 8px" }}>
              {isGenerating[currentThread.id] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={13} />}
              {isGenerating[currentThread.id] ? "DRAFTING..." : "DRAFT"}
            </button>
            <button
              onClick={() => handleSend(currentThread.id)}
              disabled={loading || !replyText[currentThread.id]?.trim()}
              className="vt-button primary"
              style={{ flex: 1, height: "32px", fontSize: "10px", padding: "0 8px" }}>
              <Send size={13} /> POST
            </button>
          </div>
        )}
      </div>
    </WidgetShell>
  )
}
