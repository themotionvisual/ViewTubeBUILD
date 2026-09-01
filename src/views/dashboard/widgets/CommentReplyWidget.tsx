import React, { useState, useEffect, useLayoutEffect, useRef } from "react"
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
  COMMENT_BUBBLE_MAX_SIZE,
  COMMENT_BUBBLE_MIN_SIZE,
  findLargestFittingFontSize,
  fitThumbnailTitle,
  THUMBNAIL_TITLE_MIN_SIZE,
  formatCommentTimestamp,
  THUMBNAIL_TITLE_LETTER_SPACING_EM,
  type ThumbnailTitleLayout,
} from "./commentResponderUtils"
import { useCommentResponderController, useCreatorEngagementContext } from "../../../features/creator-engagement"

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
  const topTitleCopyRef = useRef<HTMLSpanElement | null>(null)
  const bottomTitleCopyRef = useRef<HTMLSpanElement | null>(null)
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
    const titleBands = [
      { band: topTitleRef.current, copy: topTitleCopyRef.current },
      { band: bottomTitleRef.current, copy: bottomTitleCopyRef.current },
    ].filter((entry): entry is { band: HTMLDivElement; copy: HTMLSpanElement } => Boolean(entry.band && entry.copy))
    if (!titleBands.length) return

    const availableWidth = (band: HTMLDivElement) => {
      const styles = window.getComputedStyle(band)
      return Math.max(1, band.clientWidth - (parseFloat(styles.paddingLeft) || 0) - (parseFloat(styles.paddingRight) || 0))
    }

    const fitRenderedBands = () => {
      titleBands.forEach(({ copy }) => copy.style.setProperty("--comment-title-scale", "1"))
      const fittedSize = findLargestFittingFontSize((fontSize) => {
        titleBands.forEach(({ band }) => { band.style.fontSize = `${fontSize}px` })
        return titleBands.every(({ band, copy }) => copy.scrollWidth <= availableWidth(band) + 0.5)
      }, { min: THUMBNAIL_TITLE_MIN_SIZE, max: layout.fontSize })

      if (fittedSize !== layout.fontSize) {
        setLayout((current) => ({ ...current, fontSize: fittedSize }))
        return
      }

      titleBands.forEach(({ band, copy }) => {
        const naturalWidth = copy.scrollWidth
        const scale = naturalWidth > 0 ? Math.min(1, availableWidth(band) / naturalWidth) : 1
        copy.style.setProperty("--comment-title-scale", String(scale))
      })
    }

    fitRenderedBands()
    const observer = new ResizeObserver(fitRenderedBands)
    titleBands.forEach(({ band }) => observer.observe(band))
    return () => observer.disconnect()
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
      <div ref={topTitleRef} className="kpi-header" style={{ fontSize: `${layout.fontSize}px` }}>
        <span ref={topTitleCopyRef} className="comment-video-title-copy">{layout.lines[0]}</span>
      </div>
      <div className="kpi-body">
        {videoId ? (
          <img width={320} height={180} src={thumbnailUrl} onError={handleThumbnailError} alt={`Video thumbnail for ${title}`} />
        ) : (
          <div className="comment-video-card-placeholder"><Loader2 size={16} className="animate-spin text-black/20" /></div>
        )}
      </div>
      <div ref={bottomTitleRef} className="kpi-header kpi-header-bottom" style={{ fontSize: `${layout.fontSize}px` }}>
        <span ref={bottomTitleCopyRef} className="comment-video-title-copy">{layout.lines[1]}</span>
      </div>
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
        const readPixels = (value: string) => parseFloat(value) || 0
        const verticalInsets = (
          readPixels(bubbleStyles.paddingTop) +
          readPixels(bubbleStyles.paddingBottom) +
          readPixels(bubbleStyles.borderTopWidth) +
          readPixels(bubbleStyles.borderBottomWidth)
        )
        const availableTextHeight = Math.max(1, bubbleHeight - verticalInsets)

        // Start at the larger system size and shrink only when the full comment
        // cannot fit inside the standard bubble beside the video card.
        copy.style.height = `${cardHeight}px`
        bubble.style.height = `${bubbleHeight}px`
        textNode.style.height = "auto"
        const fittedSize = findLargestFittingFontSize((fontSize) => {
          textNode.style.fontSize = `${fontSize}px`
          return textNode.scrollHeight <= availableTextHeight + 0.5
            && textNode.scrollWidth <= textNode.clientWidth + 0.5
        }, { min: COMMENT_BUBBLE_MIN_SIZE, max: COMMENT_BUBBLE_MAX_SIZE, step: 0.5 })
        bubble.style.setProperty("--comment-bubble-font-size", `${fittedSize}px`)
        textNode.style.fontSize = ""
        const naturalHeight = textNode.scrollHeight + verticalInsets
        bubble.style.height = `${Math.min(bubbleHeight, Math.max(42, naturalHeight))}px`
        textNode.style.height = "100%"
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
  const engagement = useCreatorEngagementContext()
  const sharedController = useCommentResponderController(engagement)
  const canPostReply = sharedController.canPostReply
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
  const channelId = engagement.channelId
  const canonicalVideos = engagement.videoAssets

  useEffect(() => {
    setAllThreads(sharedController.threads)
    setLoading(sharedController.loading)
    setError(sharedController.error)
    setFetchedVideoData(sharedController.fetchedVideoData)
    setInboundImageUrl(sharedController.inboundImageUrl)
    const activeId = sharedController.currentThread?.id
    if (activeId) {
      setReplyText((current) => ({ ...current, [activeId]: sharedController.replyText }))
      setIsGenerating((current) => ({ ...current, [activeId]: sharedController.generating }))
    }
  }, [sharedController.error, sharedController.fetchedVideoData, sharedController.generating, sharedController.inboundImageUrl, sharedController.loading, sharedController.replyText, sharedController.threads, sharedController.currentThread?.id])

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
    await sharedController.draftReply()
  }

  const handleSuggestVideo = async (commentId: string) => {
    await sharedController.suggestVideo()
  }

  const handleSend = async (commentId: string) => {
    await sharedController.postReply()
  }

  const displayComments = tab === "unreplied" ? unreplied : replied
  const safeIndex = Math.min(currentIndex, Math.max(0, displayComments.length - 1))
  const currentThread = displayComments[safeIndex] || null
  const activeReplyText = currentThread ? replyText[currentThread.id] || "" : ""

  const autosizeReplyInput = (input: HTMLTextAreaElement | null) => {
    if (!input) return
    input.style.height = "0px"
    const maxHeight = parseFloat(window.getComputedStyle(input).maxHeight) || input.scrollHeight
    input.style.height = `${Math.min(maxHeight, Math.max(64, input.scrollHeight))}px`
  }

  useEffect(() => {
    autosizeReplyInput(replyTextareaRef.current)
  }, [currentThread?.id, activeReplyText])

  const headerContent = (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", justifyContent: "center" }}>
      <WidgetHeaderToggle
        label="Comment responder view"
        value={tab}
        onChange={(next) => { setTab(next); sharedController.setTab(next) }}
        items={[{ id: "unreplied", label: "New" }, { id: "history", label: "Old" }]}
      />
      {displayComments.length > 0 && (
        <WidgetHeaderStepper
          label="Comment pagination"
          value={`${safeIndex + 1} / ${displayComments.length}`}
          canPrevious={safeIndex > 0}
          canNext={safeIndex < displayComments.length - 1}
          onPrevious={() => { const next = Math.max(0, safeIndex - 1); setCurrentIndex(next); sharedController.setCurrentIndex(next) }}
          onNext={() => { const next = Math.min(displayComments.length - 1, safeIndex + 1); setCurrentIndex(next); sharedController.setCurrentIndex(next) }}
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
        onChange={(event) => { setReplyText((previous) => ({ ...previous, [currentThread.id]: event.target.value })); sharedController.setReplyText(event.target.value) }}
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
          <div role="alert" style={{ border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)", margin: "10px 10px 0", padding: "7px 9px", background: "#FFB158", color: "#000", fontSize: "10px", fontWeight: 900, lineHeight: 1.3 }}>
            {error}
          </div>
        )}

        <WidgetScrollArea ariaLabel="Comment responder conversation" edge="inset" className="comment-responder-scroll-area" enabled={tab === "history"}>
          {loading && allThreads.length === 0 ? (
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
                              <a className="widget-split-button is-compact is-auto comment-responder-reaction-badge comment-responder-open-action is-icon-only" aria-label="Go to comment on YouTube" href={`https://www.youtube.com/watch?v=${videoId}&lc=${thread.snippet.topLevelComment.id}`} target="_blank" rel="noreferrer">
                                <span className="widget-split-button-icon"><ExternalLink size={14} /></span>
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
                          <div className={`${isChannelReply ? "previous-reply-bubble" : "viewer-reply-bubble"} comment-responder-reply-bubble`}>
                            <span>{htmlDecode(reply.snippet.textDisplay || "")}</span>
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
