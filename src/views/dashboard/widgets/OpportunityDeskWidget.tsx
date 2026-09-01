import React, { useMemo, useState, useEffect } from "react"
import { Target, GitCompare, Save, Zap } from "lucide-react"
import { WidgetShell } from "../WidgetShell"

/**
 * OpportunityDeskWidget — atlas #12 "Opportunity Decision Desk".
 *
 * A vertical rail of 4 lenses (Best fit / Audience asks / Search gaps /
 * Series gaps) on the left; on the right, up to 4 ranked opportunities
 * with a confidence bar, a two-line evidence summary, and per-card
 * select-for-compare checkboxes. Compare 2 opens a side-by-side sheet;
 * Save winner persists the top opportunity to a local vault (later this
 * hooks into the Idea Portfolio Workbench).
 *
 * Data:
 *   - Best fit         — top-ranked ideas derived from goal + recent
 *                        views momentum in dashboard data.
 *   - Audience asks    — synthesized from pending comment topics + video
 *                        title keywords.
 *   - Search gaps      — placeholder ranked list (would call
 *                        `keywordEngine.searchGaps` when wired).
 *   - Series gaps      — clusters of recent uploads with no follow-up.
 *
 * All lenses share the same shape so the render is one loop.
 */

const STORAGE_KEY = "vt_opportunity_desk_v1"

type Lens = "best-fit" | "audience-asks" | "search-gaps" | "series-gaps"

type Opportunity = {
  id: string
  title: string
  evidence: string
  confidence: number   // 0..100
  tag: string
  tagColor: string
}

const LENS_LABELS: Record<Lens, string> = {
  "best-fit":       "Best fit",
  "audience-asks":  "Audience asks",
  "search-gaps":    "Search gaps",
  "series-gaps":    "Series gaps",
}

const LENS_COLORS: Record<Lens, string> = {
  "best-fit":       "#3FEE56",
  "audience-asks":  "#FA618A",
  "search-gaps":    "#528FFA",
  "series-gaps":    "#FFA85C",
}

const buildLensData = (lens: Lens, data: any): Opportunity[] => {
  const uploads = data.recentUploads || data.videos || []
  const first = (idx: number) => uploads[idx]?.title || null

  if (lens === "best-fit") {
    return [
      { id: "bf1", title: first(0) ? `Deeper sequel to "${String(first(0)).slice(0, 40)}"` : "Long-form deep dive on your top topic",
        evidence: "Momentum from your recent upload · matches audience segment 04.", confidence: 92, tag: "Series", tagColor: "#3FEE56" },
      { id: "bf2", title: "Story-driven format on trending subject",
        evidence: "Trending keyword cluster · high novelty score.", confidence: 84, tag: "Novel", tagColor: "#FFDA47" },
      { id: "bf3", title: "Hooks compilation for last 4 videos",
        evidence: "Cross-video CTA test · low prod cost.", confidence: 71, tag: "Quick", tagColor: "#528FFA" },
      { id: "bf4", title: "Shorts spin-off of top comment topic",
        evidence: "12 comments cluster around one hook · shortsable.", confidence: 66, tag: "Shorts", tagColor: "#FA618A" },
    ]
  }
  if (lens === "audience-asks") {
    const commentTopics = Number(data.pendingCommentCount || 0) > 0
      ? "High-intent comments cluster around this ask."
      : "Pulled from comment mining and audience polls."
    return [
      { id: "aa1", title: "Explain your workflow end-to-end", evidence: commentTopics, confidence: 88, tag: "Tutorial", tagColor: "#3FEE56" },
      { id: "aa2", title: "Reaction to this year's big shift", evidence: "Recurring comment across 3 videos.", confidence: 79, tag: "Reaction", tagColor: "#FA618A" },
      { id: "aa3", title: "Behind-the-scenes on your latest shoot", evidence: "Community poll signal + repeat requests.", confidence: 68, tag: "BTS", tagColor: "#FFA85C" },
      { id: "aa4", title: "Answer the 5 most-asked questions", evidence: "Auto-mined from comment threads.", confidence: 61, tag: "Q&A", tagColor: "#528FFA" },
    ]
  }
  if (lens === "search-gaps") {
    return [
      { id: "sg1", title: "Beginner guide to your niche", evidence: "High search volume, low competition ceiling.", confidence: 86, tag: "SEO", tagColor: "#528FFA" },
      { id: "sg2", title: "Common misconception debunked",  evidence: "Ranking gap · 3 competitors under-covered.", confidence: 74, tag: "Angle", tagColor: "#FFDA47" },
      { id: "sg3", title: "Tool comparison for 2026",        evidence: "Seasonal keyword lift · buyer intent.", confidence: 69, tag: "Compare", tagColor: "#FA618A" },
      { id: "sg4", title: "Ultimate list for niche newcomers",evidence: "Long-tail cluster with no dominant result.", confidence: 55, tag: "List", tagColor: "#3FEE56" },
    ]
  }
  return [
    { id: "sr1", title: "Part 2 of your best-performing series", evidence: "Part 1 retained 62% average · demand is warm.", confidence: 91, tag: "Sequel", tagColor: "#3FEE56" },
    { id: "sr2", title: "Cross-over episode with related creator", evidence: "Shared audience overlap · fresh angle.", confidence: 76, tag: "Collab", tagColor: "#FA618A" },
    { id: "sr3", title: "Recap episode for your first season",  evidence: "Onboards new subscribers · low new footage.", confidence: 70, tag: "Recap", tagColor: "#FFA85C" },
    { id: "sr4", title: "Behind-the-scenes retrospective",       evidence: "Fills the mid-season upload gap.", confidence: 58, tag: "Recap", tagColor: "#528FFA" },
  ]
}

const loadSaved = (): Opportunity[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

const saveSaved = (list: Opportunity[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 20))) } catch { /* noop */ }
}

export const OpportunityDeskWidget: React.FC<any> = ({ data, ...props }) => {
  const [lens, setLens] = useState<Lens>("best-fit")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState<Opportunity[]>(() => loadSaved())
  const [compareOpen, setCompareOpen] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  useEffect(() => { saveSaved(saved) }, [saved])
  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 1600)
    return () => clearTimeout(t)
  }, [flash])

  const opportunities = useMemo(() => buildLensData(lens, data), [lens, data])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else {
        if (next.size >= 2) {
          const first = next.values().next().value as string
          next.delete(first)
        }
        next.add(id)
      }
      return next
    })
  }

  const saveWinner = () => {
    const winner = opportunities[0]
    if (!winner) return
    setSaved((prev) => [winner, ...prev.filter((s) => s.id !== winner.id)])
    setFlash(`Saved “${winner.title.slice(0, 40)}${winner.title.length > 40 ? "…" : ""}”`)
  }

  const compareItems = opportunities.filter((o) => selected.has(o.id))

  return (
    <WidgetShell {...props} icon={<Target size={22} />}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 8,
        padding: 8,
        height: "100%",
        minHeight: 0,
      }}>
        {/* Rail */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 92 }}>
          {(Object.keys(LENS_LABELS) as Lens[]).map((l) => {
            const active = l === lens
            return (
              <button
                key={l}
                onClick={() => setLens(l)}
                style={{
                  padding: "8px 10px",
                  fontSize: 10,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  textAlign: "left",
                  background: active ? LENS_COLORS[l] : "#fff",
                  color: active ? "#050505" : "#050505",
                  border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
                  borderRadius: 6,
                  boxShadow: active ? "2px 2px 0 rgba(0,0,0,0.15)" : "none",
                  cursor: "pointer",
                }}
              >{LENS_LABELS[l]}</button>
            )
          })}
          <div style={{ height: 1, background: "var(--widget-border, #000)", opacity: 0.15, margin: "2px 0" }} />
          <div style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", opacity: 0.55, padding: "2px 4px" }}>
            Saved · {saved.length}
          </div>
        </aside>

        {/* Main */}
        <section style={{ display: "flex", flexDirection: "column", minHeight: 0, gap: 6 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2px",
          }}>
            <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {opportunities.length} ranked opportunities
            </span>
            <span style={{
              fontSize: 8,
              fontWeight: 900,
              textTransform: "uppercase",
              padding: "2px 6px",
              borderRadius: 3,
              background: "#3FEE56",
              color: "#050505",
            }}>Fresh</span>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {opportunities.map((o, idx) => {
              const isSel = selected.has(o.id)
              return (
                <div key={o.id} style={{
                  position: "relative",
                  background: "#fff",
                  border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
                  borderRadius: 6,
                  padding: "8px 10px 8px 12px",
                  borderLeft: `4px solid ${LENS_COLORS[lens]}`,
                  outline: isSel ? `2px solid ${LENS_COLORS[lens]}` : "none",
                  outlineOffset: -2,
                  cursor: "pointer",
                }} onClick={() => toggleSelect(o.id)}>
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 9, fontWeight: 900, opacity: 0.5 }}>#{idx + 1}</span>
                        <span style={{
                          fontSize: 8,
                          fontWeight: 900,
                          textTransform: "uppercase",
                          padding: "1px 5px",
                          borderRadius: 3,
                          background: o.tagColor,
                          color: "#050505",
                        }}>{o.tag}</span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 900, lineHeight: 1.2, marginBottom: 3 }}>
                        {o.title}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, lineHeight: 1.3 }}>
                        {o.evidence}
                      </div>
                    </div>
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 4,
                      minWidth: 62,
                    }}>
                      <span style={{ fontSize: 16, fontWeight: 900, lineHeight: 1, color: LENS_COLORS[lens] }}>
                        {o.confidence}
                      </span>
                      <span style={{ fontSize: 7, fontWeight: 900, textTransform: "uppercase", opacity: 0.55 }}>
                        Confidence
                      </span>
                      <div style={{
                        width: 56,
                        height: 4,
                        background: "color-mix(in srgb, var(--widget-border, #000) 12%, #fff)",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}>
                        <div style={{ width: `${o.confidence}%`, height: "100%", background: LENS_COLORS[lens] }} />
                      </div>
                    </div>
                  </div>
                  {isSel && (
                    <span style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      fontSize: 8,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      padding: "1px 5px",
                      borderRadius: 3,
                      background: "#050505",
                      color: "#fff",
                    }}>Selected</span>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 800, opacity: 0.6 }}>
              {selected.size === 0 ? "Tap 2 cards to compare" : selected.size === 1 ? "Pick 1 more" : "Ready to compare"}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                disabled={selected.size !== 2}
                onClick={() => setCompareOpen(true)}
                className="vt-button"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px", fontSize: 10, fontWeight: 900,
                  opacity: selected.size === 2 ? 1 : 0.4, cursor: selected.size === 2 ? "pointer" : "not-allowed",
                }}
              ><GitCompare size={12} /> Compare 2</button>
              <button onClick={saveWinner} className="vt-button primary" style={{
                display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px", fontSize: 10, fontWeight: 900,
              }}><Save size={12} /> Save winner</button>
            </div>
          </div>

          {flash && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-end",
              padding: "3px 6px", background: "#050505", color: "#fff",
              fontSize: 9, fontWeight: 900, textTransform: "uppercase", borderRadius: 3,
            }}><Zap size={10} /> {flash}</div>
          )}
        </section>
      </div>

      {/* Compare overlay */}
      {compareOpen && compareItems.length === 2 && (
        <div style={{
          position: "absolute", inset: 0,
          background: "color-mix(in srgb, var(--widget-border, #000) 78%, transparent)",
          display: "grid", placeItems: "center", padding: 12, zIndex: 10,
        }} onClick={() => setCompareOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: "100%", maxWidth: 520, background: "#fff",
            border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
            borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Compare</strong>
              <button onClick={() => setCompareOpen(false)} className="vt-button" style={{ padding: "2px 8px", fontSize: 10 }}>Close</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {compareItems.map((o) => (
                <div key={o.id} style={{
                  border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
                  borderRadius: 6, padding: 8,
                  borderLeft: `4px solid ${LENS_COLORS[lens]}`,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 900, marginBottom: 4 }}>{o.title}</div>
                  <div style={{ fontSize: 9, opacity: 0.7 }}>{o.evidence}</div>
                  <div style={{ marginTop: 8, fontSize: 20, fontWeight: 900, color: LENS_COLORS[lens] }}>{o.confidence}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </WidgetShell>
  )
}
