import React, { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Film, Wand2, Play, RefreshCcw, Send, ArrowLeft, ArrowRight, Trash2, Sparkles, Lightbulb, PenSquare } from "lucide-react"
import { WidgetShell } from "../WidgetShell"
import {
  WidgetFooter,
  WidgetHeaderToggle,
  WidgetSection,
  WidgetWorkflowMain,
} from "../WidgetPrimitives"
import { buildShortsPlanPrompt, planShortsStub, type ShortShot } from "../../../features/shorts-generator/planBuilder"
import { openEditorWithClips, type ShortsClipHandoff } from "../../../features/shorts-generator/editorBridge"
import { generateShortClip } from "../../../features/shorts-generator/veoClient"
import { pushSignal } from "../../../features/brain-control/signalBuffer"

/**
 * ShortsGeneratorWidget — matches the shipping community-post/community
 * pattern: WidgetShell + WidgetHeaderToggle in the header,
 * WidgetWorkflowMain + WidgetFooter for the body/actions, and every
 * button/input goes through vt-button / vt-input classes so all colors
 * derive from --widget-color / --widget-border.
 */

const SOURCES = [
  { id: "idea",   label: "Idea Portfolio", icon: Lightbulb },
  { id: "script", label: "Script Studio",  icon: PenSquare },
  { id: "manual", label: "Manual",         icon: Sparkles },
] as const
type SourceId = (typeof SOURCES)[number]["id"]

type GenClip = {
  key: string
  shot: ShortShot
  status: "empty" | "generating" | "ready" | "error"
  thumbnailDataUri?: string
  videoUrl?: string
  order: number
  trimStart: number
  trimEnd: number
}

const readPortfolioConcept = (): string => {
  try {
    const raw = localStorage.getItem("vt_idea_portfolio_v1")
    if (!raw) return ""
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed[0]?.concept ? String(parsed[0].concept) : ""
  } catch { return "" }
}

export const ShortsGeneratorWidget: React.FC<any> = ({ data, widget, instance, editMode, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove }) => {
  const common = { widget, instance, editMode, canEdit: true, onToggleCollapse, onCycleSize, onDecSize, onCycleHeight, onDecHeight, onRemove }

  const [source, setSource] = useState<SourceId>("idea")
  const [concept, setConcept] = useState<string>(() => readPortfolioConcept() || "")
  const [plan, setPlan] = useState<ShortShot[]>([])
  const [clips, setClips] = useState<GenClip[]>([])
  const [flash, setFlash] = useState<string | null>(null)
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [mode, setMode] = useState<"plan" | "arrange">("plan")

  const channelName = data?.channelTitle || ""
  const brain = data?.brain
  const niche = brain?.channelProfile?.niche || ""
  const styleTokens = brain?.channelProfile?.visualStyleTokens || "high-contrast, cinematic, 9:16"
  const voice = brain?.channelProfile?.voice || ""
  const topReferences = useMemo(() => (data?.recentUploads || data?.videos || []).slice(0, 3).map((v: any) => v.title).filter(Boolean), [data])

  const totalSeconds = clips.reduce((sum, c) => sum + Math.max(0, c.trimEnd - c.trimStart), 0)

  const buildPlan = () => {
    const prompt = buildShortsPlanPrompt({ channelName, niche, styleTokens, voice, conceptText: concept, topReferences })
    // eslint-disable-next-line no-console
    console.debug("[shorts-generator] plan prompt →", prompt.length, "chars")
    const shots = planShortsStub({ channelName, niche, styleTokens, voice, conceptText: concept, topReferences })
    setPlan(shots)
    setClips(shots.map((shot, i) => ({
      key: `clip-${shot.shot}-${Date.now()}-${i}`,
      shot, status: "empty", order: i,
      trimStart: 0, trimEnd: shot.duration_sec,
    })))
    setMode("plan")
    setFlash(`Planned ${shots.length} shots`)
    pushSignal({ tool: "shorts-generator", event: "plan.built", payload: { shots: shots.length } })
  }

  const generateClip = async (key: string) => {
    const clip = clips.find((c) => c.key === key)
    if (!clip) return
    setClips((prev) => prev.map((c) => c.key === key ? { ...c, status: "generating" } : c))
    try {
      const result = await generateShortClip({ prompt: clip.shot.veo_prompt, durationSec: clip.shot.duration_sec, aspect: "9:16" })
      setClips((prev) => prev.map((c) => c.key === key ? { ...c, status: "ready", thumbnailDataUri: result.posterUrl, videoUrl: result.videoUrl } : c))
      pushSignal({ tool: "shorts-generator", event: "clip.generated", payload: { key } })
    } catch (err: any) {
      setClips((prev) => prev.map((c) => c.key === key ? { ...c, status: "error" } : c))
    }
  }
  const generateAll = () => clips.filter((c) => c.status !== "ready").forEach((c) => generateClip(c.key))

  const move = (key: string, dir: -1 | 1) => {
    setClips((prev) => {
      const idx = prev.findIndex((c) => c.key === key)
      const swap = idx + dir
      if (idx < 0 || swap < 0 || swap >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next.map((c, i) => ({ ...c, order: i }))
    })
  }
  const remove = (key: string) => setClips((prev) => prev.filter((c) => c.key !== key).map((c, i) => ({ ...c, order: i })))

  const sendToEditor = () => {
    const handoff: ShortsClipHandoff[] = clips.filter((c) => c.status === "ready").map((c, i) => ({
      id: c.key,
      posterUrl: c.thumbnailDataUri,
      videoUrl: c.videoUrl,
      title: `Shot ${c.shot.shot} · ${c.shot.purpose}`,
      startSec: c.trimStart,
      endSec: c.trimEnd,
      order: i,
      aspect: "9:16",
      meta: { veoPrompt: c.shot.veo_prompt, onScreenText: c.shot.on_screen_text },
    }))
    if (handoff.length === 0) { setFlash("Generate at least one clip"); return }
    openEditorWithClips(handoff)
    setFlash(`Sent ${handoff.length} to editor`)
  }

  const headerContent = (
    <WidgetHeaderToggle
      label="Shorts mode"
      value={mode}
      onChange={(v) => setMode(v as "plan" | "arrange")}
      items={[{ id: "plan", label: "Plan" }, { id: "arrange", label: "Arrange" }]}
    />
  )

  return (
    <WidgetShell {...common} icon={<Film size={22} />} headerContent={headerContent}>
      <motion.div layout className="widget-workspace shorts-workspace">
        <WidgetWorkflowMain className="shorts-main">

          <div className="shorts-source-grid" aria-label="Concept source">
            {SOURCES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setSource(s.id); if (s.id === "idea") setConcept(readPortfolioConcept()) }}
                className={`widget-split-button is-small is-full ${source === s.id ? "is-primary" : "is-soft"}`}
                aria-pressed={source === s.id}
              >
                <span className="widget-split-button-icon"><s.icon size={14} /></span>
                <span className="widget-split-button-label">{s.label}</span>
              </button>
            ))}
          </div>

          <textarea
            className="vt-textarea shorts-concept"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Draft the concept for this Short…"
          />

          <AnimatePresence mode="wait">
            {mode === "plan" ? (
              <motion.div
                key="plan"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex-1 flex flex-col gap-2 min-h-0"
              >
                {plan.length === 0 ? (
                  <div className="shorts-empty">Hit <b>Plan</b> to generate a shot list.</div>
                ) : (
                  <div className="shorts-plan-list">
                    {plan.map((shot) => (
                      <div key={"plan-" + shot.shot} className="shorts-plan-row">
                        <span className="widget-split-button is-primary is-compact is-auto">
                          <span className="widget-split-button-label">{shot.purpose}</span>
                        </span>
                        <span className="shorts-plan-text">{shot.veo_prompt}</span>
                        <span className="shorts-plan-dur">{shot.duration_sec}s</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="arrange"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 flex flex-col gap-2 min-h-0"
              >
                {clips.length === 0 ? (
                  <div className="shorts-empty">No clips yet. Plan a Short first.</div>
                ) : (
                  <>
                    <WidgetSection surface="subtle" className="shorts-arrange-head">
                      <span>{clips.filter((c) => c.status === "ready").length}/{clips.length} ready · {totalSeconds.toFixed(1)}s</span>
                      <button type="button" className="vt-button" onClick={generateAll}>
                        <RefreshCcw size={12} />Gen all
                      </button>
                    </WidgetSection>
                    <div className="shorts-filmstrip">
                      {clips.map((c) => {
                        const trimmedDur = Math.max(0, c.trimEnd - c.trimStart)
                        const startPct = (c.trimStart / c.shot.duration_sec) * 100
                        const endPct = (c.trimEnd / c.shot.duration_sec) * 100
                        return (
                          <div
                            key={c.key}
                            draggable
                            onDragStart={() => setDragKey(c.key)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              if (!dragKey || dragKey === c.key) return
                              setClips((prev) => {
                                const src = prev.findIndex((x) => x.key === dragKey)
                                const tgt = prev.findIndex((x) => x.key === c.key)
                                if (src < 0 || tgt < 0) return prev
                                const next = [...prev]
                                const [moved] = next.splice(src, 1)
                                next.splice(tgt, 0, moved)
                                return next.map((x, i) => ({ ...x, order: i }))
                              })
                              setDragKey(null)
                            }}
                            className={`shorts-clip ${dragKey === c.key ? "is-dragging" : ""}`}
                          >
                            <div className="shorts-clip-frame">
                              {c.status === "ready" && c.thumbnailDataUri ? (
                                <img src={c.thumbnailDataUri} alt="" />
                              ) : (
                                <span className="shorts-clip-empty">
                                  {c.status === "generating" ? "…" : c.status === "error" ? "err" : "empty"}
                                </span>
                              )}
                              {c.status === "ready" && (
                                <>
                                  <div className="shorts-clip-mask" style={{
                                    background: `linear-gradient(to bottom, color-mix(in srgb, var(--widget-border) 45%, transparent) ${startPct}%, transparent ${startPct}% ${endPct}%, color-mix(in srgb, var(--widget-border) 45%, transparent) ${endPct}%)`,
                                  }} />
                                  <span className="shorts-clip-badge">{trimmedDur.toFixed(1)}s</span>
                                </>
                              )}
                            </div>
                            <span className="shorts-clip-label">#{c.shot.shot} · {c.shot.duration_sec}s</span>
                            <div className="shorts-clip-trims">
                              <input
                                type="range" min={0} max={c.shot.duration_sec} step={0.1} value={c.trimStart}
                                onChange={(e) => {
                                  const v = Math.min(Number(e.target.value), c.trimEnd - 0.1)
                                  setClips((prev) => prev.map((x) => x.key === c.key ? { ...x, trimStart: v } : x))
                                }}
                                aria-label="Trim start"
                              />
                              <input
                                type="range" min={0} max={c.shot.duration_sec} step={0.1} value={c.trimEnd}
                                onChange={(e) => {
                                  const v = Math.max(Number(e.target.value), c.trimStart + 0.1)
                                  setClips((prev) => prev.map((x) => x.key === c.key ? { ...x, trimEnd: v } : x))
                                }}
                                aria-label="Trim end"
                              />
                            </div>
                            <div className="shorts-clip-actions">
                              <button type="button" className="vt-button is-icon-only" onClick={() => move(c.key, -1)} aria-label="Move left"><ArrowLeft size={11} /></button>
                              <button type="button" className="vt-button is-icon-only" onClick={() => generateClip(c.key)} aria-label="Regenerate">
                                {c.status === "ready" ? <RefreshCcw size={11} /> : <Play size={11} />}
                              </button>
                              <button type="button" className="vt-button is-icon-only" onClick={() => move(c.key, 1)} aria-label="Move right"><ArrowRight size={11} /></button>
                              <button type="button" className="vt-button is-icon-only" onClick={() => remove(c.key)} aria-label="Remove"><Trash2 size={11} /></button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </WidgetWorkflowMain>

        <WidgetFooter divider={false} className="shorts-footer">
          <button type="button" className="vt-button secondary flex-1" onClick={buildPlan} disabled={!concept.trim()}>
            <Wand2 size={14} />Plan
          </button>
          <button type="button" className="vt-button primary flex-1" onClick={sendToEditor} disabled={clips.filter((c) => c.status === "ready").length === 0}>
            <Send size={14} />Send to editor
          </button>
          {flash ? <span className="community-post-footer-flash">{flash}</span> : null}
        </WidgetFooter>
      </motion.div>
    </WidgetShell>
  )
}
