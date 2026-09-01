import React, { useCallback, useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessagesSquare,
  FileText,
  Image as ImageIcon,
  CheckSquare,
  MessageSquare,
  Video,
  Wand2,
  Calendar,
  Send,
  Trash2,
  Sparkles,
} from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetFooter,
  WidgetHeaderToggle,
  WidgetSection,
  WidgetWorkflowMain,
} from "../WidgetPrimitives"
import {
  listCommunityPosts,
  saveCommunityPost,
  deleteCommunityPost,
  newDraft,
  type CommunityPostDraft,
  type CommunityPostType,
} from "../../../features/community-posts/postStore"
import {
  computeBestPostWindows,
  distributeAcrossWindows,
  formatWindow,
} from "../../../features/community-posts/bestTimeEngine"
import { generateCommunityPostsWithGemini } from "../../../features/community-posts/generateFromGemini"
import { pushSignal } from "../../../features/brain-control/signalBuffer"

/**
 * CommunityPostStudioWidget — atlas #16 (rewrite).
 *
 * Now mirrors the shipping `CommunityPostWidget`'s structural pattern:
 *  – WidgetShell + WidgetHeaderToggle (Write / Studio) in the header
 *  – WidgetWorkflowMain body + WidgetFooter action bar
 *  – widget-split-button post-type strip (same 5 options)
 *  – vt-textarea / vt-input for all inputs
 *  – vt-button / vt-button primary / vt-button secondary — never
 *    inline-styled buttons
 *  – all color from --widget-color / --widget-border via CSS classes,
 *    never hard-coded hex
 *
 * "Studio" mode adds the schedule rail + AI variant deck without
 * abandoning the shared vocabulary.
 */

const TYPE_OPTIONS = [
  { id: "text",             label: "Text",     icon: FileText },
  { id: "image",            label: "Image",    icon: ImageIcon },
  { id: "image_collection", label: "Album",    icon: ImageIcon },
  { id: "poll",             label: "Poll",     icon: CheckSquare },
  { id: "video",            label: "Video",    icon: Video },
] as const

const COUNT_OPTIONS = [1, 3, 5, 10] as const

// P2 stub kept for the fallback path — see generateFromGemini for the
// real batch generator.
const generateStubBatch = (
  type: CommunityPostType,
  count: number,
  channelName: string,
  recent: Array<{ id: string; title: string }>,
): CommunityPostDraft[] => {
  const seed = (i: number) => {
    switch (type) {
      case "poll": return { text: `Quick pulse: which of these do you want next from ${channelName || "us"}?`, pollOptions: ["Deep dive", "Behind-the-scenes", "Q&A", "Live stream"] }
      case "image":
      case "image_collection": return { text: `Frame ${i + 1}: one moment from the last cycle. Which hit hardest?` }
      case "video": return { text: "Rewatching this — what did you take away from it?", attachedVideoId: recent[i % Math.max(1, recent.length)]?.id }
      default: return { text: `Draft ${i + 1}: one honest sentence about what we're building this week.` }
    }
  }
  return Array.from({ length: count }, (_, i) => {
    const d = newDraft(type)
    const s = seed(i)
    return { ...d, text: s.text, pollOptions: (s as any).pollOptions, attachedVideoId: (s as any).attachedVideoId, aiMeta: { generation: "stub", scoreForecast: 60 + ((i * 7) % 30), reason: "Fallback" } }
  })
}

const publishByClipboard = async (post: CommunityPostDraft, channelId?: string): Promise<string> => {
  const url = channelId ? `https://studio.youtube.com/channel/${channelId}/community` : "https://studio.youtube.com/"
  try { await navigator.clipboard.writeText(post.text || "") } catch { /* noop */ }
  window.open(url, "_blank", "noopener,noreferrer")
  return "Copied · YouTube Studio open in new tab"
}

export const CommunityPostStudioWidget: React.FC<any> = ({ data, widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove }) => {
  const common = { widget, instance, editMode, canEdit: true, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove }

  const [posts, setPosts] = useState<CommunityPostDraft[]>([])
  const [mode, setMode] = useState<"write" | "studio">("write")
  const [postType, setPostType] = useState<CommunityPostType>("text")
  const [count, setCount] = useState<(typeof COUNT_OPTIONS)[number]>(3)
  const [draft, setDraft] = useState<CommunityPostDraft>(() => newDraft("text"))
  const [variants, setVariants] = useState<CommunityPostDraft[]>([])
  const [generating, setGenerating] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const [batchNotes, setBatchNotes] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const channelName = data?.channelTitle || ""
  const channelHandle = String(data?.channelCustomUrl || "").replace(/^@/, "")
  const channelId = data?.authState?.channelId
  const recentVideos = useMemo(() => (data?.recentUploads || data?.videos || []).slice(0, 20).map((v: any) => ({
    id: v.videoId || v.id, title: v.title,
  })), [data])
  const windows = useMemo(() => computeBestPostWindows(recentVideos, data?.dailySeries || [], 6), [recentVideos, data?.dailySeries])

  useEffect(() => { listCommunityPosts().then(setPosts) }, [])
  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 2200)
    return () => clearTimeout(t)
  }, [flash])

  const persistDraft = useCallback(async (d: CommunityPostDraft) => {
    await saveCommunityPost({ ...d, updatedAt: Date.now() })
    setPosts(await listCommunityPosts())
  }, [])

  const generate = async () => {
    setGenerating(true); setBatchNotes(null)
    pushSignal({ tool: "community-post-studio", event: "generate.request", payload: { type: postType, count } })
    try {
      const res = await generateCommunityPostsWithGemini(
        { channelName, channelHandle, recentVideos, bestWindows: windows.best, worstWindows: windows.worst },
        { postType, count },
      )
      if (res.posts.length > 0) {
        setVariants(res.posts)
        setBatchNotes(res.batchNotes || null)
        setFlash(`Generated ${res.posts.length}`)
      } else {
        setVariants(generateStubBatch(postType, count, channelName, recentVideos))
        setFlash("AI empty — showing fallback")
      }
    } catch (err: any) {
      setVariants(generateStubBatch(postType, count, channelName, recentVideos))
      setFlash(err?.message || "AI failed — fallback shown")
    } finally { setGenerating(false) }
  }

  const generateSchedule = (span: "week" | "month") => {
    const total = span === "week" ? 7 : 20
    const dist = distributeAcrossWindows(total, windows.best)
    const batch = dist.map((slot, i) => {
      const cycleType: CommunityPostType = (["text", "image", "poll", "video", "text", "image_collection", "poll"] as const)[i % 7]
      const stub = generateStubBatch(cycleType, 1, channelName, recentVideos)[0]
      return { ...stub, scheduledAt: slot.ts, aiMeta: { ...(stub.aiMeta || {}), reason: `${formatWindow(slot.window)} · ${slot.window.score}` } }
    })
    Promise.all(batch.map(saveCommunityPost)).then(listCommunityPosts).then(setPosts)
    setFlash(`Queued ${total} across ${span === "week" ? "7 days" : "30 days"}`)
  }

  const loadVariant = (v: CommunityPostDraft) => {
    setDraft({ ...v, id: `cp-${Date.now()}`, createdAt: Date.now(), updatedAt: Date.now() })
    setPostType(v.type)
    setMode("write")
  }
  const remove = async (id: string) => { await deleteCommunityPost(id); setPosts(await listCommunityPosts()) }
  const publish = async (post: CommunityPostDraft) => {
    const msg = await publishByClipboard(post, channelId)
    setFlash(msg)
    await saveCommunityPost({ ...post, publishedAt: Date.now() })
    setPosts(await listCommunityPosts())
  }

  const headerContent = (
    <WidgetHeaderToggle
      label="Community post mode"
      value={mode}
      onChange={(v) => setMode(v as "write" | "studio")}
      items={[{ id: "write", label: "Write" }, { id: "studio", label: "Studio" }]}
    />
  )

  const PostTypeStrip = () => (
    <div className="community-post-type-grid" aria-label="Post type">
      {TYPE_OPTIONS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => { setPostType(t.id); setDraft(newDraft(t.id)) }}
          className={`widget-split-button is-small is-full ${postType === t.id ? "is-primary" : "is-soft"}`}
          aria-pressed={postType === t.id}
        >
          <span className="widget-split-button-icon"><t.icon size={14} /></span>
          <span className="widget-split-button-label">{t.label}</span>
        </button>
      ))}
    </div>
  )

  const scheduledPreview = posts.filter((p) => p.scheduledAt && !p.publishedAt).sort((a, b) => (a.scheduledAt || 0) - (b.scheduledAt || 0))
  const savedPreview = posts.filter((p) => !p.scheduledAt && !p.publishedAt).sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <WidgetShell {...common} icon={<MessagesSquare size={22} />} headerContent={headerContent}>
      <motion.div layout className="widget-workspace community-post-workspace">
        <WidgetWorkflowMain className="community-post-main">
          <AnimatePresence mode="wait">
            {mode === "write" ? (
              <motion.div
                key="write"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex-1 flex flex-col gap-2 min-h-0"
              >
                <PostTypeStrip />

                <textarea
                  className={`vt-textarea community-post-copy-input${postType === "poll" ? " is-compact" : ""}`}
                  value={draft.text}
                  onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                  placeholder={postType === "poll" ? "Poll question…" : `What's on your mind? Draft your ${postType.replace("_", " ")} post…`}
                />

                {postType === "poll" && (
                  <div className="community-poll-grid">
                    {(draft.pollOptions || ["", ""]).map((opt, i) => (
                      <div key={i} className="community-poll-option">
                        <input
                          className="vt-input"
                          value={opt}
                          maxLength={25}
                          placeholder={`Option ${i + 1}`}
                          onChange={(e) => {
                            const next = [...(draft.pollOptions || [])]
                            next[i] = e.target.value
                            setDraft({ ...draft, pollOptions: next })
                          }}
                        />
                        <button
                          type="button"
                          className="vt-button is-icon-only"
                          aria-label={`Remove option ${i + 1}`}
                          onClick={() => setDraft({ ...draft, pollOptions: (draft.pollOptions || []).filter((_, j) => j !== i) })}
                        ><Trash2 size={12} /></button>
                      </div>
                    ))}
                    {(draft.pollOptions || []).length < 4 && (
                      <button
                        type="button"
                        className="vt-button"
                        onClick={() => setDraft({ ...draft, pollOptions: [...(draft.pollOptions || []), ""] })}
                      >+ Option</button>
                    )}
                  </div>
                )}

                {(postType === "image" || postType === "image_collection") && (
                  <WidgetSection surface="subtle">
                    <div className="community-image-assets" role="list" aria-label="Image assets">
                      {(draft.imageAssetIds || []).map((id, i) => (
                        <div
                          role="listitem"
                          key={id + i}
                          draggable
                          onDragStart={() => setDragIndex(i)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (dragIndex === null || dragIndex === i) return
                            const next = [...draft.imageAssetIds]
                            const [moved] = next.splice(dragIndex, 1)
                            next.splice(i, 0, moved)
                            setDraft({ ...draft, imageAssetIds: next })
                            setDragIndex(null)
                          }}
                          className="community-image-thumb"
                          aria-label={`Image asset ${i + 1}`}
                        >
                          <span className="community-image-thumb-label">#{i + 1}</span>
                          <button
                            type="button"
                            className="vt-button is-icon-only community-image-thumb-clear"
                            aria-label={`Remove asset ${i + 1}`}
                            onClick={() => setDraft({ ...draft, imageAssetIds: draft.imageAssetIds.filter((_, j) => j !== i) })}
                          ><Trash2 size={11} /></button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="vt-button community-image-thumb-add"
                        onClick={() => setDraft({ ...draft, imageAssetIds: [...(draft.imageAssetIds || []), `img-${Date.now()}`] })}
                      >+ Slot</button>
                    </div>
                  </WidgetSection>
                )}

                {postType === "video" && (
                  <select
                    className="vt-input"
                    value={draft.attachedVideoId || ""}
                    onChange={(e) => setDraft({ ...draft, attachedVideoId: e.target.value })}
                  >
                    <option value="">Attach a video…</option>
                    {recentVideos.map((v: any) => <option key={v.id} value={v.id}>{v.title}</option>)}
                  </select>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="studio"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 flex flex-col gap-2 min-h-0"
              >
                <PostTypeStrip />

                <WidgetSection surface="subtle">
                  <div className="community-studio-row">
                    <select
                      className="vt-input community-studio-count"
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value) as (typeof COUNT_OPTIONS)[number])}
                    >
                      {COUNT_OPTIONS.map((n) => <option key={n} value={n}>{n} variant{n > 1 ? "s" : ""}</option>)}
                    </select>
                    <button
                      type="button"
                      className="vt-button primary flex-1"
                      onClick={generate}
                      disabled={generating}
                    ><Wand2 size={14} />{generating ? "Generating…" : "Generate"}</button>
                    <button type="button" className="vt-button secondary" onClick={() => generateSchedule("week")}>
                      <Calendar size={14} />1 wk
                    </button>
                    <button type="button" className="vt-button secondary" onClick={() => generateSchedule("month")}>
                      <Calendar size={14} />1 mo
                    </button>
                  </div>
                  <div className="community-studio-windows" aria-label="Best posting windows">
                    {windows.best.slice(0, 4).map((w, i) => (
                      <span key={i} className="community-studio-window-chip">{formatWindow(w)}</span>
                    ))}
                  </div>
                </WidgetSection>

                {batchNotes && (
                  <WidgetSection surface="subtle" className="community-studio-notes">{batchNotes}</WidgetSection>
                )}

                <div className="community-studio-variants" role="list" aria-label="Generated variants">
                  {variants.length === 0 ? (
                    <div className="community-studio-empty">
                      AI variants will land here. Hit Generate to fill the deck.
                    </div>
                  ) : variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className="community-studio-variant"
                      role="listitem"
                      onClick={() => loadVariant(v)}
                    >
                      <div className="community-studio-variant-head">
                        <span className={`widget-split-button is-primary is-compact is-auto`}>
                          <span className="widget-split-button-label">{v.type}</span>
                        </span>
                        <span className="community-studio-variant-score">{v.aiMeta?.scoreForecast ?? "?"}</span>
                      </div>
                      <div className="community-studio-variant-body">{v.text}</div>
                      {v.pollOptions && (
                        <div className="community-studio-variant-poll">
                          {v.pollOptions.map((o, i) => <span key={i}>{o}</span>)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {(scheduledPreview.length > 0 || savedPreview.length > 0) && (
                  <WidgetSection surface="subtle" className="community-studio-queue">
                    <div className="community-studio-queue-head">
                      Queue · scheduled {scheduledPreview.length} · drafts {savedPreview.length}
                    </div>
                    <div className="community-studio-queue-list">
                      {[...scheduledPreview, ...savedPreview].slice(0, 12).map((p) => (
                        <div key={p.id} className="community-studio-queue-item">
                          <div className="community-studio-queue-meta">
                            <span>{p.type}</span>
                            {p.scheduledAt ? <span>{new Date(p.scheduledAt).toLocaleString(undefined, { weekday: "short", hour: "numeric" })}</span> : null}
                          </div>
                          <div className="community-studio-queue-text">{p.text || "(empty draft)"}</div>
                          <div className="community-studio-queue-actions">
                            <button type="button" className="vt-button is-icon-only" onClick={() => loadVariant(p)} aria-label="Load"><FileText size={12} /></button>
                            <button type="button" className="vt-button is-icon-only" onClick={() => remove(p.id)} aria-label="Delete"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </WidgetSection>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </WidgetWorkflowMain>

        <WidgetFooter divider={false} className="community-post-footer">
          <button type="button" className="vt-button" onClick={() => persistDraft(draft)}>
            <Sparkles size={14} />Save draft
          </button>
          <button type="button" className="vt-button primary flex-1" onClick={() => publish(draft)} disabled={!draft.text.trim()}>
            <Send size={14} />Publish
          </button>
          {flash ? <span className="community-post-footer-flash">{flash}</span> : null}
        </WidgetFooter>
      </motion.div>
    </WidgetShell>
  )
}
