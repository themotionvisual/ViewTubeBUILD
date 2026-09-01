import React, { useEffect, useMemo, useState } from "react"
import { Sparkles, Bookmark, Wand2, Trash2 } from "lucide-react"
import { WidgetShell } from "../WidgetShell"

/**
 * IdeaPortfolioWidget — atlas #31 "Idea Portfolio Workbench".
 *
 * Left column: concept input, chips (Core topic / Evergreen / Novel /
 * Series), and a big animated score-ring whose number is the WEIGHTED
 * MEAN of the four dimension sliders (audience fit, novelty, demand,
 * ease). The ring auto-recomputes on every slider change so the score
 * is genuinely explainable — no black-box.
 *
 * Right column: portfolio list of previously committed concepts. Each
 * shows its saved score + chips + a delete button. Committing a new
 * concept prepends it; localStorage persists the list.
 *
 * The "Generate stronger angles" button seeds three angle variants of
 * the current concept into the input as suggestions.
 */

const STORAGE_KEY = "vt_idea_portfolio_v1"

type Chip = "core" | "evergreen" | "novel" | "series"
type SavedIdea = {
  id: string
  concept: string
  chips: Chip[]
  scores: { fit: number; novelty: number; demand: number; ease: number }
  score: number
  createdAt: number
}

const CHIP_LABEL: Record<Chip, string> = {
  core:      "Core topic",
  evergreen: "Evergreen",
  novel:     "Novel",
  series:    "Series",
}

const CHIP_COLOR: Record<Chip, string> = {
  core:      "#3FEE56",
  evergreen: "#528FFA",
  novel:     "#FFDA47",
  series:    "#FA618A",
}

const DIMENSIONS = [
  { key: "fit",     label: "Audience fit", weight: 0.32, color: "#3FEE56", tip: "How well the concept matches your top segments." },
  { key: "novelty", label: "Novelty",      weight: 0.18, color: "#FFDA47", tip: "How fresh the angle is inside your niche." },
  { key: "demand",  label: "Demand",       weight: 0.30, color: "#528FFA", tip: "Search + comment + poll signal." },
  { key: "ease",    label: "Ease",         weight: 0.20, color: "#FFA85C", tip: "Production feasibility this cycle." },
] as const

const loadIdeas = (): SavedIdea[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

const saveIdeas = (list: SavedIdea[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 40))) } catch { /* noop */ }
}

const computeScore = (s: { fit: number; novelty: number; demand: number; ease: number }) =>
  Math.round(DIMENSIONS.reduce((acc, d) => acc + s[d.key] * d.weight, 0))

const generateAngles = (base: string): string[] => {
  const clean = base.trim() || "Your topic"
  return [
    `Why ${clean.toLowerCase()} matters more than viewers realize`,
    `The uncomfortable truth about ${clean.toLowerCase()}`,
    `${clean} — beginner mistakes that ruin everything`,
  ]
}

export const IdeaPortfolioWidget: React.FC<any> = ({ data, ...props }) => {
  const initialConcept = (data?.recentUploads?.[0]?.title as string) || "Untitled concept"
  const [concept, setConcept] = useState(initialConcept)
  const [chips, setChips] = useState<Chip[]>(["core", "evergreen"])
  const [scores, setScores] = useState({ fit: 82, novelty: 74, demand: 78, ease: 68 })
  const [angles, setAngles] = useState<string[]>([])
  const [saved, setSaved] = useState<SavedIdea[]>(() => loadIdeas())
  const [flash, setFlash] = useState<string | null>(null)

  useEffect(() => { saveIdeas(saved) }, [saved])
  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 1400)
    return () => clearTimeout(t)
  }, [flash])

  const score = useMemo(() => computeScore(scores), [scores])
  const ringDeg = (score / 100) * 360

  const toggleChip = (c: Chip) => {
    setChips((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])
  }

  const commit = () => {
    const idea: SavedIdea = {
      id: `idea-${Date.now()}`,
      concept: concept.trim() || "Untitled",
      chips,
      scores: { ...scores },
      score,
      createdAt: Date.now(),
    }
    setSaved((prev) => [idea, ...prev])
    setFlash("Committed to portfolio")
  }

  const remove = (id: string) => setSaved((prev) => prev.filter((s) => s.id !== id))

  const strongest = saved[0]

  return (
    <WidgetShell {...props} icon={<Sparkles size={22} />}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)",
        gap: 8,
        padding: 8,
        height: "100%",
        minHeight: 0,
      }}>
        {/* ── Left: workbench ─────────────────────────────────── */}
        <section style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 0 }}>
          <input
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Draft a concept…"
            style={{
              width: "100%",
              padding: "8px 10px",
              fontSize: 12,
              fontWeight: 900,
              border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
              borderRadius: 4,
              outline: "none",
              background: "#fff",
            }}
          />

          {/* Score ring + chips */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 10,
            alignItems: "center",
            padding: "6px 4px",
          }}>
            <div style={{
              position: "relative",
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: `conic-gradient(#3FEE56 0deg ${ringDeg}deg, color-mix(in srgb, var(--widget-border, #000) 12%, #fff) ${ringDeg}deg 360deg)`,
              display: "grid",
              placeItems: "center",
              transition: "background 220ms ease",
            }}>
              <div style={{
                position: "absolute",
                inset: 6,
                borderRadius: "50%",
                background: "#fff",
                border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
                display: "grid",
                placeItems: "center",
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1 }}>
                  <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.04em" }}>{score}</span>
                  <span style={{ fontSize: 7, fontWeight: 900, textTransform: "uppercase", opacity: 0.55, marginTop: 2 }}>score</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", opacity: 0.55, letterSpacing: "0.06em" }}>
                Tags
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {(Object.keys(CHIP_LABEL) as Chip[]).map((c) => {
                  const active = chips.includes(c)
                  return (
                    <button key={c} onClick={() => toggleChip(c)} style={{
                      padding: "3px 8px",
                      fontSize: 9,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      background: active ? CHIP_COLOR[c] : "#fff",
                      color: "#050505",
                      border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
                      borderRadius: 3,
                      cursor: "pointer",
                    }}>{CHIP_LABEL[c]}</button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minHeight: 0, overflow: "auto" }}>
            {DIMENSIONS.map((d) => (
              <label key={d.key} title={d.tip} style={{
                display: "grid",
                gridTemplateColumns: "88px 1fr 34px",
                alignItems: "center",
                gap: 6,
              }}>
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                  {d.label}
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scores[d.key]}
                  onChange={(e) => setScores((s) => ({ ...s, [d.key]: Number(e.target.value) }))}
                  style={{
                    accentColor: d.color,
                    width: "100%",
                  }}
                />
                <span style={{
                  fontSize: 11,
                  fontWeight: 900,
                  textAlign: "right",
                  color: d.color === "#FFDA47" ? "#050505" : d.color,
                }}>{scores[d.key]}</span>
              </label>
            ))}
          </div>

          {/* Angles */}
          {angles.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: 6, background: "color-mix(in srgb, #FFDA47 22%, #fff)", border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)", borderRadius: 4 }}>
              <div style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>Stronger angles</div>
              {angles.map((a) => (
                <button key={a} onClick={() => setConcept(a)} style={{
                  textAlign: "left",
                  padding: "3px 4px",
                  fontSize: 10,
                  fontWeight: 800,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  lineHeight: 1.25,
                }}>→ {a}</button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setAngles(generateAngles(concept))}
              className="vt-button"
              style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "6px 10px", fontSize: 11, fontWeight: 900 }}
            ><Wand2 size={12} /> Angles</button>
            <button
              onClick={commit}
              className="vt-button primary"
              style={{ flex: 1.2, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "6px 10px", fontSize: 11, fontWeight: 900 }}
            ><Bookmark size={12} /> Commit</button>
          </div>
          {flash && (
            <div style={{
              alignSelf: "flex-end",
              padding: "2px 6px",
              background: "#050505",
              color: "#fff",
              fontSize: 9,
              fontWeight: 900,
              textTransform: "uppercase",
              borderRadius: 3,
            }}>{flash}</div>
          )}
        </section>

        {/* ── Right: portfolio ─────────────────────────────────── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 2px" }}>
            <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Portfolio · {saved.length}
            </span>
            {strongest && (
              <span style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", opacity: 0.6 }}>
                Best · {strongest.score}
              </span>
            )}
          </div>

          {saved.length === 0 ? (
            <div style={{
              flex: 1,
              display: "grid",
              placeItems: "center",
              border: "var(--widget-module-stroke, 2px) dashed var(--widget-border, #000)",
              borderRadius: 6,
              padding: 12,
              textAlign: "center",
              fontSize: 10,
              fontWeight: 800,
              opacity: 0.6,
            }}>
              Commit a concept to start your portfolio.<br />Winners will float to the top.
            </div>
          ) : (
            <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {saved.map((s) => (
                <div key={s.id} style={{
                  background: "#fff",
                  border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
                  borderRadius: 6,
                  padding: "6px 8px",
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 900, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.concept}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 2 }}>
                      {s.chips.map((c) => (
                        <span key={c} style={{
                          fontSize: 7,
                          fontWeight: 900,
                          textTransform: "uppercase",
                          padding: "1px 4px",
                          background: CHIP_COLOR[c],
                          borderRadius: 2,
                        }}>{CHIP_LABEL[c]}</span>
                      ))}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: s.score >= 80 ? "#3FEE56" : s.score >= 60 ? "#528FFA" : "#FA618A",
                    minWidth: 22,
                    textAlign: "right",
                  }}>{s.score}</span>
                  <button onClick={() => remove(s.id)} className="vt-button" style={{ padding: "3px 6px" }} aria-label="Remove idea">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </WidgetShell>
  )
}
