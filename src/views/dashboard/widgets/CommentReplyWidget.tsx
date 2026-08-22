import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { WidgetShell } from "../WidgetShell"
import { WidgetFooter, WidgetHeaderStepper, WidgetHeaderToggle, WidgetScrollArea, WidgetSplitButton, WidgetTooltip } from "../WidgetPrimitives"
import {
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  ThumbsUp,
  MessagesSquare,
  ExternalLink,
  Link2,
} from "lucide-react"
import {
  postCommentReply,
  fetchAllCommentThreads,
  fetchVideoSnippetDetails
} from "../../../services/youtubeService"
import { generatePerfectReply } from "../../../services/gemini"
import { useBrain } from "../../../context/useBrain"
import { useUnifiedAccount } from "../../../context/UnifiedAccountContext"
import { resolveCommentAccessState } from "../../../services/youtube/commentAccess"
import {
  findLargestFittingFontSize,
  fitThumbnailTitle,
  THUMBNAIL_TITLE_MIN_SIZE,
  formatCommentTimestamp,
  THUMBNAIL_TITLE_LETTER_SPACING_EM,
  type ThumbnailTitleLayout,
} from "./commentResponderUtils"

const htmlDecode = (input: string) => {
  const doc = new DOMParser().parseFromString(input, "text/html")
  return doc.documentElement.textContent || input
}

const CommentAvatar = ({ src, label, initial }: { src?: string; label: string; initial: string }) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = Boolean(src && failedSrc !== src)

  return (
    <div className="comment-responder-avatar" aria-label={`${label} profile picture`}>
      {showImage && (
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src || null)}
        />
      )}
      {!showImage && <span aria-hidden="true">{initial || "?"}</span>}
    </div>
  )
}

const CommentVideoThumbnail = ({ title, videoId, thumbnailUrl }: { title: string; videoId: string; thumbnailUrl: string }) => {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const topTitleRef = useRef<HTMLDivElement | null>(null)
  const bottomTitleRef = useRef<HTMLDivElement | null>(null)
  const [layout, setLayout] = useState<ThumbnailTitleLayout>(() => fitThumbnailTitle(title, 188))

  useLayoutEffect(() => {
    const card = cardRef.current
    if (!card) return
    const update = () => {
      const titleBand = topTitleRef.current
      if (!titleBand) return
      const styles = window.getComputedStyle(titleBand)
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      const width = Math.max(80, titleBand.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight))
      const measure = (value: string, fontSize: number) => {
        if (!context) return value.length * fontSize * 0.58
        context.font = `900 ${fontSize}px ${styles.fontFamily}`
        const spacing = Math.max(0, value.length - 1) * fontSize * THUMBNAIL_TITLE_LETTER_SPACING_EM
        return context.measureText(value).width + spacing
      }
      setLayout(fitThumbnailTitle(title, width, measure))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(card)
    return () => observer.disconnect()
  }, [title])

  useLayoutEffect(() => {
    const titleBands = [topTitleRef.current, bottomTitleRef.current].filter((band): band is HTMLDivElement => Boolean(band))
    if (!titleBands.length) return

    const fittedSize = findLargestFittingFontSize((fontSize) => {
      titleBands.forEach((band) => { band.style.fontSize = `${fontSize}px` })
      return titleBands.every((band) => band.scrollWidth <= band.clientWidth + 0.5)
    }, { min: THUMBNAIL_TITLE_MIN_SIZE, max: layout.fontSize })

    if (fittedSize !== layout.fontSize) {
      setLayout((current) => ({ ...current, fontSize: fittedSize }))
    }
  }, [layout.fontSize, layout.lines])

  const handleThumbnailError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget
    if (image.src.includes("maxresdefault.jpg")) image.src = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`
    else if (image.src.includes("sddefault.jpg")) image.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    else if (image.src.includes("hqdefault.jpg")) image.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    else image.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23111' font-family='Arial' font-size='16'%3EThumbnail unavailable%3C/text%3E%3C/svg%3E"
  }

  return (
    <div ref={cardRef} className="kpi-video-card comment-video-card">
      <div ref={topTitleRef} className="kpi-header" style={{ fontSize: `${layout.fontSize}px` }}>{layout.lines[0]}</div>
      <div className="kpi-body">
        {videoId ? (
          <img width={320} height={180} src={thumbnailUrl} onError={handleThumbnailError} alt={`Video thumbnail for ${title}`} />
        ) : (
          <div className="comment-video-card-placeholder"><Loader2 size={16} className="animate-spin text-black/20" /></div>
        )}
      </div>
      <div ref={bottomTitleRef} className="kpi-header kpi-header-bottom" style={{ fontSize: `${layout.fontSize}px` }}>{layout.lines[1]}</div>
    </div>
  )
}

const AutoFitCommentBubble = ({ text }: { text: string }) => {
  const bubbleRef = useRef<HTMLDivElement | null>(null)
  const textRef = useRef<HTMLSpanElement | null>(null)

  useLayoutEffect(() => {
    const bubble = bubbleRef.current
    const textNode = textRef.current
    const copy = bubble?.closest<HTMLElement>(".comment-responder-current-copy")
    const row = bubble?.closest<HTMLElement>(".comment-responder-current-comment")
    const card = row?.querySelector<HTMLElement>(".comment-video-card")
    const meta = copy?.querySelector<HTMLElement>(".comment-responder-comment-meta")
    if (!bubble || !textNode || !copy || !card || !meta) return

    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const copyStyles = window.getComputedStyle(copy)
        const gap = parseFloat(copyStyles.rowGap || copyStyles.gap) || 0
        const cardHeight = card.getBoundingClientRect().height
        const bubbleHeight = Math.max(42, cardHeight - meta.getBoundingClientRect().height - gap)
        const bubbleStyles = window.getComputedStyle(bubble)
        const verticalInsets = parseFloat(bubbleStyles.paddingTop) + parseFloat(bubbleStyles.paddingBottom)

        // Keep readable copy at the system size. Short comments collapse to
        // their content; only long comments use the available bubble height
        // and the internal scroll rail.
        copy.style.height = `${cardHeight}px`
        bubble.style.height = "auto"
        const naturalHeight = textNode.scrollHeight + verticalInsets
        bubble.style.height = `${Math.min(bubbleHeight, Math.max(42, naturalHeight))}px`
      })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(card)
    window.addEventListener("resize", update)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [text])

  return (
    <div ref={bubbleRef} className="comment-responder-bubble">
      <svg className="comment-responder-bubble-tail" viewBox="0 0 30 20" aria-hidden="true">
        <path className="comment-responder-bubble-tail-stroke" d="M4 18L15 4L26 18" />
      </svg>
      <span ref={textRef} className="comment-responder-bubble-copy">{text}</span>
    </div>
  )
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
  const account = useUnifiedAccount()
  const commentAccessState = resolveCommentAccessState(account.snapshot)
  const hasCommentsAccess = commentAccessState === "ready"
  const canPostReply = hasCommentsAccess
    && (!account.serverEnabled || account.snapshot.grantedCapabilities.includes("youtube_comments"))
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
  const [inboundImageUrl, setInboundImageUrl] = useState<string | null>(null)
  const replyTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const fetchedVideoDataRef = useRef<Record<string, any>>({})
  const metadataInFlightRef = useRef(new Set<string>())

  const channelId = data.brain?.channelProfile?.id
    || account.snapshot.google.channelId
    || data.authState?.channelId
    || ""
  const canonicalVideos = useMemo(() => data.videoAssets || [], [data.videoAssets])

  const syncMetadata = async (threads: any[], signal?: AbortSignal) => {
    const requestedIds: string[] = []
    try {
      const videoIds = Array.from(new Set<string>(
        threads
          .map((thread: any) => thread.snippet.videoId)
          .filter((videoId: unknown): videoId is string => typeof videoId === "string" && videoId.length > 0),
      ))
      const missingIds = videoIds.filter(id => {
        const inCanonical = canonicalVideos.find((v: any) => v.videoId === id)
        const inFetched = fetchedVideoDataRef.current[id]
        return (!inCanonical || !inCanonical.title || inCanonical.title === "Unknown Video") &&
               (!inFetched || !inFetched.title || inFetched.title === "Unknown Video") &&
               !metadataInFlightRef.current.has(id)
      })

      if (missingIds.length > 0) {
        requestedIds.push(...missingIds)
        missingIds.forEach((id) => metadataInFlightRef.current.add(id))
        console.info(`[CommentResponder] Fetching metadata for ${missingIds.length} missing videos...`)
        const details = await fetchVideoSnippetDetails(missingIds as string[], { signal })
        if (signal?.aborted) return
        fetchedVideoDataRef.current = { ...fetchedVideoDataRef.current, ...details }
        setFetchedVideoData(prev => ({ ...prev, ...details }))
      }
    } catch (e) {
      console.warn("[CommentResponder] Metadata sync failed", e)
    } finally {
      requestedIds.forEach((id) => metadataInFlightRef.current.delete(id))
    }
  }

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    if (!hasCommentsAccess || !channelId) {
      setLoading(false)
      setError(null)
      setAllThreads([])
      return () => controller.abort()
    }
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const threads = await fetchAllCommentThreads(100, channelId, {
          initialNewCount: 3,
          signal: controller.signal,
          onInitialResults: (initialThreads) => {
            if (cancelled) return
            setAllThreads(initialThreads)
            setLoading(false)
            void syncMetadata(initialThreads, controller.signal)
          },
        })
        if (cancelled) return
        setAllThreads(threads)
        setLoading(false)
        void syncMetadata(threads, controller.signal)
      } catch (e: any) {
        if (cancelled) return
        console.error("Comment fetch failed:", e)
        setError(e.message || "Failed to load comments")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true; controller.abort() }
  }, [channelId, canonicalVideos.length, hasCommentsAccess])

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
    if (thread.repliesComplete === false) return false
    const replies = thread.replies?.comments || []
    return !replies.some(
      (reply: any) => reply.snippet.authorChannelId?.value === channelId,
    )
  })

  const replied = allThreads.filter((thread: any) => {
    if (thread.repliesComplete === false) return false
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
      const existingReply = replyText[commentId]?.trim() || ""
      const draft = await generatePerfectReply(
        comment.snippet.textOriginal,
        comment.snippet.authorDisplayName.replace(/@/g, ""),
        data.brain?.channelProfile?.name || "Content Creation",
        available,
        brain,
        existingReply,
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

  const handleSuggestVideo = async (commentId: string) => {
    setIsGenerating(prev => ({ ...prev, [commentId]: true }))
    try {
      const thread = allThreads.find(t => t.id === commentId)
      const comment = thread?.snippet?.topLevelComment
      if (!comment) return
      const available = canonicalVideos.map((video: any) => ({ title: video.title, id: video.videoId }))
      const recommendation = await generatePerfectReply(
        comment.snippet.textOriginal,
        comment.snippet.authorDisplayName.replace(/@/g, ""),
        data.brain?.channelProfile?.name || "Content Creation",
        available,
        brain,
        replyText[commentId]?.trim() || "",
      )
      if (!recommendation.suggestedVideoId) return
      const url = `https://youtu.be/${recommendation.suggestedVideoId}`
      setReplyText(previous => ({ ...previous, [commentId]: `${previous[commentId]?.trim() ? `${previous[commentId].trim()}\n\n` : ""}You might also enjoy this related video: ${url}` }))
    } catch (error) {
      console.error(error)
    } finally {
      setIsGenerating(prev => ({ ...prev, [commentId]: false }))
    }
  }

  const handleSend = async (commentId: string) => {
    if (!replyText[commentId]?.trim()) return
    if (!canPostReply) {
      const intent = commentAccessState === "requires_connection" ? "connect_channel" : "reconnect_channel"
      setError(`${intent === "connect_channel" ? "Connect" : "Reconnect"} Channel to grant comment-reply permission.`)
      void account.start(intent, window.location.pathname)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const thread = allThreads.find(t => t.id === commentId)
      const parentCommentId = thread?.snippet?.topLevelComment?.id || commentId
      const text = replyText[commentId]
      const postedReply = await postCommentReply(parentCommentId, text)
      setReplyText(prev => { const next = { ...prev }; delete next[commentId]; return next })
      setAllThreads(prev => prev.map(t => {
        if (t.id !== commentId) return t
        return {
          ...t,
          replies: {
            ...t.replies,
            comments: [...(t.replies?.comments || []), {
              id: postedReply?.id,
              snippet: {
                ...postedReply?.snippet,
                authorChannelId: postedReply?.snippet?.authorChannelId || { value: channelId },
                authorDisplayName: postedReply?.snippet?.authorDisplayName || data.brain?.channelProfile?.name || "You",
                authorProfileImageUrl: postedReply?.snippet?.authorProfileImageUrl || data.brain?.channelProfile?.thumbnail,
                textDisplay: postedReply?.snippet?.textDisplay || text,
                publishedAt: postedReply?.snippet?.publishedAt || new Date().toISOString(),
              },
            }],
          },
        }
      }))
      setTab("history")
      setCurrentIndex(0)
    } catch (sendError: any) {
      const message = sendError?.message || "Failed to post reply. Reconnect the channel and try again."
      console.error("Comment reply failed:", sendError)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const displayComments = tab === "unreplied" ? unreplied : replied
  const safeIndex = Math.min(currentIndex, Math.max(0, displayComments.length - 1))
  const currentThread = displayComments[safeIndex] || null
  const activeReplyText = currentThread ? replyText[currentThread.id] || "" : ""

  const autosizeReplyInput = (input: HTMLTextAreaElement | null) => {
    if (!input) return
    input.style.height = ""
  }

  useEffect(() => {
    autosizeReplyInput(replyTextareaRef.current)
  }, [currentThread?.id, activeReplyText])

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

  const composer = currentThread ? (
    <WidgetFooter divider={tab === "history"} className="comment-responder-footer">
      <textarea
        ref={replyTextareaRef}
        className="vt-textarea"
        value={activeReplyText}
        onChange={(event) => setReplyText((previous) => ({ ...previous, [currentThread.id]: event.target.value }))}
        onInput={(event) => autosizeReplyInput(event.currentTarget)}
        placeholder={tab === "history" ? "ADD FOLLOW-UP REPLY..." : "REPLY..."}
      />
      <div className="comment-responder-footer-actions">
        <WidgetSplitButton
          onClick={() => handleMagicDraft(currentThread.id)}
          disabled={loading || isGenerating[currentThread.id]}
          icon={isGenerating[currentThread.id] ? <Loader2 className="animate-spin" /> : <Sparkles />}
          tone="soft"
          width="full">
          {isGenerating[currentThread.id] ? "WORKING..." : activeReplyText.trim() ? "REFINE" : "DRAFT"}
        </WidgetSplitButton>
        <WidgetSplitButton
          onClick={() => handleSuggestVideo(currentThread.id)}
          disabled={loading || isGenerating[currentThread.id]}
          icon={<Link2 />}
          tone="neutral"
          width="full">
          Suggest video
        </WidgetSplitButton>
        <WidgetSplitButton
          onClick={() => handleSend(currentThread.id)}
          disabled={loading || (canPostReply && !activeReplyText.trim())}
          icon={<Send />}
          tone="primary"
          width="full">
          {canPostReply ? "POST" : "RECONNECT CHANNEL"}
        </WidgetSplitButton>
      </div>
    </WidgetFooter>
  ) : null

  return (
    <WidgetShell {...common} contentLayout="flush" headerContent={headerContent} icon={<MessageSquare size={22} />}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0, minHeight: 0 }}>
        {inboundImageUrl && (
          <div style={{ border: "2px solid color-mix(in srgb, var(--widget-color, #000) 60%, black)", borderRadius: "8px", padding: "6px 8px", margin: "10px 10px 0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.7 }}>Image received from generator</span>
            <button className="vt-button" style={{ height: "24px", fontSize: "8px", padding: "0 8px" }} onClick={() => navigator.clipboard?.writeText(inboundImageUrl)}>COPY URL</button>
          </div>
        )}

        {error && (
          <div role="alert" style={{ border: "2px solid #000", margin: "10px 10px 0", padding: "7px 9px", background: "#FFB158", color: "#000", fontSize: "10px", fontWeight: 900, lineHeight: 1.3 }}>
            {error}
          </div>
        )}

        <WidgetScrollArea ariaLabel="Comment responder conversation" edge="inset" className="comment-responder-scroll-area" enabled={tab === "history"}>
          {!hasCommentsAccess ? (
            <div style={{ display: "grid", placeItems: "center", alignContent: "center", gap: "12px", minHeight: "190px", padding: "24px", textAlign: "center" }}>
              {commentAccessState === "pending" ? <Loader2 size={24} className="animate-spin" /> : <MessageSquare size={28} />}
              <div style={{ maxWidth: "280px", fontSize: "11px", fontWeight: 900, lineHeight: 1.45 }}>
                {commentAccessState === "pending"
                  ? "CONNECTING YOUR CHANNEL…"
                  : commentAccessState === "requires_reconnect"
                    ? "RECONNECT YOUR YOUTUBE CHANNEL TO LOAD AND REPLY TO COMMENTS."
                    : "CONNECT YOUR YOUTUBE CHANNEL TO LOAD AND REPLY TO COMMENTS."}
              </div>
              {commentAccessState !== "pending" && (
                <button
                  className="vt-button primary"
                  type="button"
                  onClick={() => void account.start(
                    commentAccessState === "requires_reconnect" ? "reconnect_channel" : "connect_channel",
                    window.location.pathname,
                  )}>
                  {commentAccessState === "requires_reconnect" ? "RECONNECT CHANNEL" : "CONNECT CHANNEL"}
                </button>
              )}
            </div>
          ) : loading && allThreads.length === 0 ? (
            <div className="comment-responder-sync-state" aria-live="polite">
              <div className="comment-responder-sync-thread">
                <div className="comment-responder-sync-thumbnail" />
                <div className="comment-responder-sync-copy">
                  <div className="comment-responder-sync-meta"><span className="comment-responder-sync-avatar" /><span /><span /></div>
                  <div className="comment-responder-sync-bubble" />
                </div>
              </div>
              <div className="comment-responder-sync-footer"><Loader2 size={15} className="animate-spin" /> Syncing your first three comments…</div>
            </div>
          ) : !currentThread ? (
            <div style={{ textAlign: "center", padding: "40px", opacity: 0.3, fontWeight: 900, fontSize: "11px" }}>NO COMMENTS FOUND.</div>
          ) : (() => {
            const thread = currentThread
            const c = thread.snippet.topLevelComment.snippet
            const authorHandle = htmlDecode(c.authorDisplayName.replace(/^@+/, "@"))
            const avatarInitial = authorHandle.replace(/^@+/, "").charAt(0).toUpperCase() || "?"
            const handleFontSize = Math.max(5, Math.min(15, Math.floor(270 / Math.max(authorHandle.length, 1))))
            const commentText = htmlDecode(c.textDisplay)
            const timestamp = formatCommentTimestamp(c.publishedAt || c.updatedAt)
            const likeCountNumber = Number(c.likeCount || 0)
            const likeCount = likeCountNumber.toLocaleString()
            const videoId = thread.snippet.videoId
            const videoCandidate = canonicalVideos.find((v: any) => v.videoId === videoId)
            const fetched = fetchedVideoData[videoId]
            const video = (fetched && fetched.title && fetched.title !== "Unknown Video") ? fetched : videoCandidate
            const thumbnailUrl = video?.thumbnails?.maxres?.url || video?.snippet?.thumbnails?.maxres?.url || video?.thumbnailUrl || video?.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            const existingChannelReplies = thread.replies?.comments || []
            const replyCountNumber = Number(thread.snippet.totalReplyCount ?? existingChannelReplies.length ?? 0)
            const replyCount = replyCountNumber.toLocaleString()

            return (
              <div className={`comment-responder-thread-panel is-${tab} ${tab === "history" && existingChannelReplies.length === 1 ? "is-single-reply" : ""}`.trim()}>

                <div className="comment-responder-current-comment">

                  <CommentVideoThumbnail
                    title={video?.title && video.title !== "Unknown Video" ? htmlDecode(video.title) : `[${videoId}]`}
                    videoId={videoId}
                    thumbnailUrl={thumbnailUrl}
                  />

                  {/* Right Column Wrapper: Takes the remaining space */}
                  <div className="comment-responder-current-copy">
                    
                    {/* Author Info & Comment text */}
                    <div className="comment-responder-comment-meta">
                      
                      <CommentAvatar src={c.authorProfileImageUrl} label={authorHandle} initial={avatarInitial} />

                      {/* Info Column */}
                      <div className="comment-responder-meta-copy">
                        
                        {/* Author Name and Date */}
                        <div style={{ minWidth: 0 }}>
                          <span className="comment-responder-handle" title={authorHandle} style={{ fontSize: `${handleFontSize}px` }}>
                            {authorHandle}
                          </span>
                          <div className="comment-responder-date-row">
                            <span style={{ color: "#3157ff", fontSize: "10px", fontWeight: 800, letterSpacing: "0.02em", lineHeight: 1.2 }}>
                              {timestamp.dateLabel}<span style={{ fontSize: "7px", verticalAlign: "text-bottom", marginLeft: "1px" }}>{timestamp.meridiem}</span>
                            </span>
                            <span style={{ color: "#000", fontSize: "8px", fontWeight: 700, letterSpacing: "0.04em", lineHeight: 1 }}>
                              {timestamp.relative}
                            </span>
                          </div>
                          <div className="comment-responder-reaction-row">
                            <WidgetSplitButton
                              className="comment-responder-reaction-badge comment-responder-like-action"
                              icon={<ThumbsUp fill={likeCountNumber === 0 ? "#fff" : "#FFE357"} />}
                              size="compact"
                              width="auto">
                              {likeCount}
                            </WidgetSplitButton>
                            <WidgetSplitButton
                              className="comment-responder-reaction-badge comment-responder-reply-action"
                              icon={<MessagesSquare />}
                              size="compact"
                              width="auto">
                              {replyCount}
                            </WidgetSplitButton>
                            <WidgetTooltip className="comment-responder-open-tooltip" content="Go to this comment on YouTube">
                              <a className="widget-split-button is-compact is-auto comment-responder-reaction-badge comment-responder-open-action" aria-label="Go to comment on YouTube" href={`https://www.youtube.com/watch?v=${videoId}&lc=${thread.snippet.topLevelComment.id}`} target="_blank" rel="noreferrer">
                                <span className="widget-split-button-icon"><ExternalLink size={14} /></span>
                                <span className="widget-split-button-label">Go to comment</span>
                              </a>
                            </WidgetTooltip>
                          </div>
                        </div>
                      </div>
                    </div>

                    <AutoFitCommentBubble text={commentText} />

                  </div>
                </div>
                {existingChannelReplies.length > 0 && (
                  <div className="comment-responder-replies">
                    {existingChannelReplies.map((reply: any, idx: number) => {
                      const replyInitial = htmlDecode(reply.snippet?.authorDisplayName || "You").replace(/^@+/, "").charAt(0).toUpperCase()
                      const isChannelReply = reply.snippet?.authorChannelId?.value === channelId
                      const replyAuthor = htmlDecode(reply.snippet?.authorDisplayName || "Reply author")
                      const replyAvatar = <CommentAvatar src={reply.snippet?.authorProfileImageUrl} label={replyAuthor} initial={replyInitial} />
                      return (
                        <div key={reply.id || idx} className="comment-responder-reply-row">
                          {!isChannelReply && replyAvatar}
                          <div className={isChannelReply ? "previous-reply-bubble" : "viewer-reply-bubble"} style={{ flex: 1, minWidth: 0, padding: "7px 9px", fontSize: "11px", fontWeight: 900, lineHeight: 1.25, textTransform: "uppercase", display: "flex", flexWrap: "wrap", gap: "6px 8px", alignItems: "flex-start" }}>
                            <span style={{ flex: "1 1 120px", minWidth: 0, overflowWrap: "anywhere" }}>{htmlDecode(reply.snippet.textDisplay || "")}</span>
                          </div>
                          {isChannelReply && replyAvatar}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })()}
        </WidgetScrollArea>
        {composer}
      </div>
    </WidgetShell>
  )
}
