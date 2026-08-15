import React, { useState, useRef, useEffect } from "react"
import type { CanonicalVideoRow } from "../../../services/analytics/DataStore"
import type { TubeExplorerVisualProps } from "../../TubeExplorerVisualModules"
import { AnalyticsVisualShell } from "../../AnalyticsVisualShell"
import { TrendingUp } from "lucide-react"
import {
  flattenVideosForVt2,
  rollupWeeklyChannelWithSource,
  type Vt2VideoRow,
  type Vt2WeeklyRow,
} from "./dataBridge"
import { useVt2Theme } from "./theme"

import { VT_VISUAL_METRIC_COLORS } from "../../../styles/toolboxPalette"

// ── Metric Definitions ───────────────────────────────────────────────────────
const METRIC_DEFS: Record<string, { label: string; color: string; fmt: (v: number) => string }> = {
  views:        { label: "VIEWS",     color: VT_VISUAL_METRIC_COLORS.views,  fmt: v => v >= 1000 ? (v / 1000).toFixed(0) + "K" : v.toFixed(0) },
  engagedViews: { label: "ENGAGED",   color: VT_VISUAL_METRIC_COLORS.engagedViews,  fmt: v => v >= 1000 ? (v / 1000).toFixed(0) + "K" : v.toFixed(0) },
  watchHrs:     { label: "WATCH TIME", color: VT_VISUAL_METRIC_COLORS.watchTime,  fmt: v => v.toFixed(0) + "h" },
  subs:         { label: "SUBSCRIBERS", color: VT_VISUAL_METRIC_COLORS.subscribers, fmt: v => v >= 1000 ? (v / 1000).toFixed(1) + "K" : v.toFixed(0) },
  revenue:      { label: "REVENUE",   color: VT_VISUAL_METRIC_COLORS.revenue,  fmt: v => "$" + v.toFixed(0) },
  comments:     { label: "COMMENTS",  color: VT_VISUAL_METRIC_COLORS.comments,  fmt: v => v.toFixed(0) },
  avp:          { label: "AVP%",      color: VT_VISUAL_METRIC_COLORS.avp,  fmt: v => v.toFixed(1) + "%" },
  avd:          { label: "AVD",       color: VT_VISUAL_METRIC_COLORS.avd, fmt: v => v.toFixed(0) + "s" },
  likes:        { label: "LIKES",     color: VT_VISUAL_METRIC_COLORS.likes,  fmt: v => v >= 1000 ? (v / 1000).toFixed(0) + "K" : v.toFixed(0) },
  rpm:          { label: "RPM",       color: VT_VISUAL_METRIC_COLORS.rpm, fmt: v => "$" + v.toFixed(2) },
  shares:       { label: "SHARES",    color: VT_VISUAL_METRIC_COLORS.shares,  fmt: v => v.toFixed(0) },
  adRevenue:    { label: "AD REV",    color: VT_VISUAL_METRIC_COLORS.revenue, fmt: v => "$" + v.toFixed(0) },
}
const ALL_KEYS = Object.keys(METRIC_DEFS)

// ── Time Windows ─────────────────────────────────────────────────────────────
const TIME_WINDOW_COUNTS = [4, 5, 6, 7, 8, 10, 12, 16, 20, 24, 36] as const
type Gran = "DAYS" | "WEEKS" | "MONTHS" | "YEARS"
type Source = "CHANNEL" | "VIDEO"
type ViewMode = "OVERLAY" | "GRID" | "COMPARE"
type CmpType = "WINDOW" | "SOURCE" | "VIDEO"
type CmpDisplay = "OVERLAY" | "GRID"

function autoCols(nSel: number) {
  if (nSel <= 1) return 3
  if (nSel <= 4) return 2
  return 3
}

const ARR: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", fontWeight: 900,
  padding: "0 8px", fontSize: 15, lineHeight: 1, userSelect: "none",
  flexShrink: 0, color: "#000",
}
const ROW: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  borderBottom: "4px solid #000", overflow: "visible",
}

function cyc<T>(arr: T[], val: T, dir: 1 | -1): T {
  const i = arr.indexOf(val)
  const base = i === -1 ? 0 : i
  return arr[(base + dir + arr.length) % arr.length]
}

const unitShortLabel = (gran: Gran): string =>
  gran === "DAYS" ? "D" : gran === "WEEKS" ? "W" : gran === "MONTHS" ? "M" : "Y"

const periodLabel = (gran: Gran, index: number): string =>
  `${unitShortLabel(gran)}${index + 1}`

const periodCountLabel = (count: number, gran: Gran): string =>
  `${count} ${gran.toLowerCase()}`

const metricListLabel = (selected: readonly string[]): string =>
  selected.map((key) => METRIC_DEFS[key]?.label || key.toUpperCase()).join(" + ")

const metricDatum = (row: Record<string, unknown>, key: string): number =>
  Number(row[key] ?? 0) || 0

const sumTimelineRows = (rows: Array<Record<string, unknown>>, gran: Gran, index: number) => {
  const out: Record<string, unknown> = { label: periodLabel(gran, index), week: index + 1 }
  ALL_KEYS.forEach((key) => {
    if (key === "avd" || key === "avp" || key === "rpm") {
      const weighted = rows.reduce((sum, row) => sum + metricDatum(row, key) * Math.max(metricDatum(row, "views"), 1), 0)
      const weight = rows.reduce((sum, row) => sum + Math.max(metricDatum(row, "views"), 1), 0)
      out[key] = weight > 0 ? weighted / weight : 0
      return
    }
    out[key] = rows.reduce((sum, row) => sum + metricDatum(row, key), 0)
  })
  return out
}

const groupTimelineRows = (rows: Array<Record<string, unknown>>, gran: Gran, count: number, groupSize: number) => {
  const recent = rows.slice(Math.max(0, rows.length - count * groupSize))
  return Array.from({ length: count }).map((_, index) =>
    sumTimelineRows(recent.slice(index * groupSize, (index + 1) * groupSize), gran, index),
  )
}

// ── Overlay line chart ────────────────────────────────────────────────────────
function OverlayChart({ data, selected, dark, compact }: {
  data: any[]; selected: Set<string>; dark: boolean; compact?: boolean;
}) {
  const [hov, setHov] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const W = 1200, H = compact ? 200 : 260
  const padL = 0, padR = 0, padT = 16, padB = 24
  const plotW = W - padL - padR, plotH = H - padT - padB
  const selArr = Array.from(selected)

  const ranges: Record<string, { min: number; max: number }> = {}
  selArr.forEach(k => {
    const vals = data.map(d => d[k] ?? 0)
    ranges[k] = { min: Math.min(...vals), max: Math.max(...vals, 1) }
  })

  const toX = (i: number) => padL + (i / Math.max(data.length - 1, 1)) * plotW
  const toY = (k: string, v: number) => {
    const { min, max } = ranges[k]
    const range = max - min || 1
    return padT + plotH - ((v - min) / range) * plotH
  }

  const gridColor = dark ? "#1e1e1e" : "#f0f0f0"
  const textColor = dark ? "#555" : "#bbb"
  const bgColor = dark ? "#050505" : "#fff"
  const step = Math.max(1, Math.ceil(data.length / 10))

  return (
    <div style={{ position: "absolute", inset: 0 }}
      onMouseMove={e => {
        if (!svgRef.current) return
        const r = svgRef.current.getBoundingClientRect()
        const x = (e.clientX - r.left) * (W / r.width)
        const idx = Math.round((x - padL) / plotW * (data.length - 1))
        setHov(Math.max(0, Math.min(idx, data.length - 1)))
      }}
      onMouseLeave={() => setHov(null)}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", background: bgColor, display: "block" }}>
        <defs>
          {selArr.map(k => (
            <linearGradient key={k} id={`tl41_${k}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={METRIC_DEFS[k]?.color ?? "#FFE500"} stopOpacity="0.28" />
              <stop offset="100%" stopColor={METRIC_DEFS[k]?.color ?? "#FFE500"} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1={padL} y1={padT + plotH * (1 - f)} x2={padL + plotW} y2={padT + plotH * (1 - f)} stroke={gridColor} strokeWidth="1" />
        ))}
        {data.map((d, i) => i % step === 0 && (
          <text key={i} x={toX(i)} y={padT + plotH + 14} textAnchor="middle" fontSize="8" fill={textColor} fontFamily="monospace">{d.label || d.date || `W${d.week}`}</text>
        ))}
        {selArr.map(k => {
          if (!METRIC_DEFS[k]) return null
          const pts = data.map((d, i) => `${toX(i).toFixed(1)},${toY(k, d[k] ?? 0).toFixed(1)}`).join(" ")
          const areaD = `M ${toX(0)} ${toY(k, data[0]?.[k] ?? 0)} ` +
            data.map((d, i) => `L ${toX(i).toFixed(1)} ${toY(k, d[k] ?? 0).toFixed(1)}`).join(" ") +
            ` L ${toX(data.length - 1)} ${padT + plotH} L ${toX(0)} ${padT + plotH} Z`
          return (
            <g key={k}>
              <path d={areaD} fill={`url(#tl41_${k})`} />
              <polyline points={pts} fill="none" stroke={METRIC_DEFS[k].color} strokeWidth="2" strokeLinejoin="round" />
              <circle cx={toX(data.length - 1)} cy={toY(k, data[data.length - 1]?.[k] ?? 0)} r={3} fill={METRIC_DEFS[k].color} />
            </g>
          )
        })}
        {hov !== null && (
          <line x1={toX(hov)} y1={padT} x2={toX(hov)} y2={padT + plotH} stroke={dark ? "#444" : "#ddd"} strokeWidth="1" strokeDasharray="3,2" />
        )}
        {hov !== null && selArr.map(k => (
          METRIC_DEFS[k] ? <circle key={k} cx={toX(hov!)} cy={toY(k, data[hov!]?.[k] ?? 0)} r={4} fill={METRIC_DEFS[k].color} stroke="#000" strokeWidth="1.5" /> : null
        ))}
      </svg>
      {hov !== null && data[hov] && (
        <div style={{
          position: "absolute", top: 8,
          left: Math.min((toX(hov!) / W) * 100 + 1, 55) + "%",
          background: dark ? "#111" : "#fff", border: "2px solid #000",
          padding: "5px 8px", pointerEvents: "none", zIndex: 10,
        }}>
          <div style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 900, color: dark ? "#FFE500" : "#666", marginBottom: 3 }}>{data[hov].label || data[hov].date}</div>
          {selArr.map(k => (
            METRIC_DEFS[k] ? (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: METRIC_DEFS[k].color, flexShrink: 0 }} />
                <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 900, color: dark ? "#fff" : "#000" }}>
                  {METRIC_DEFS[k].label}: {METRIC_DEFS[k].fmt(data[hov!]?.[k] ?? 0)}
                </span>
              </div>
            ) : null
          ))}
        </div>
      )}
    </div>
  )
}

// ── Grid sparkline ─────────────────────────────────────────────────────────────
function GridSparkline({ vals, color, label, lastLabel, dark }: {
  vals: number[]; color: string; label: string; lastLabel: string; dark: boolean;
}) {
  const W = 200, H = 72
  const p = { l: 3, r: 3, t: 6, b: 6 }
  const pw = W - p.l - p.r, ph = H - p.t - p.b
  const vmin = Math.min(...vals, 0), vmax = Math.max(...vals, 1)
  const toX = (i: number) => p.l + (i / Math.max(vals.length - 1, 1)) * pw
  const toY = (v: number) => p.t + ph - ((v - vmin) / (vmax - vmin || 1)) * ph
  const pts = vals.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ")
  const areaD = `M ${toX(0)} ${toY(vals[0] ?? 0)} ` + vals.map((v, i) => `L ${toX(i)} ${toY(v)}`).join(" ") +
    ` L ${toX(vals.length - 1)} ${p.t + ph} L ${toX(0)} ${p.t + ph} Z`
  const bg = dark ? "#111" : "#fafafa"
  const border = dark ? "#222" : "#e8e8e8"
  const cid = color.replace("#", "")
  return (
    <div style={{ border: `1px solid ${border}`, padding: "5px 7px", background: bg, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 900, color, letterSpacing: "0.04em" }}>{label}</span>
        <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 900, color: dark ? "#fff" : "#000" }}>{lastLabel}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 60 }}>
        <defs>
          <linearGradient id={`gs41_${cid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#gs41_${cid})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
        <circle cx={toX(vals.length - 1)} cy={toY(vals[vals.length - 1] ?? 0)} r={3} fill={color} />
      </svg>
    </div>
  )
}

// ── Grid view panel ────────────────────────────────────────────────────────────
function GridPanel({ data, selected, dark, gran, count }: {
  data: any[]; selected: Set<string>; dark: boolean; gran: Gran; count: number;
}) {
  const selArr = Array.from(selected)
  const nSel = selArr.length
  const cols = autoCols(nSel)
  const bg = dark ? "#050505" : "#fff"

  if (nSel === 1) {
    const k = selArr[0]
    const def = METRIC_DEFS[k] ?? METRIC_DEFS.views
    const opts = TIME_WINDOW_COUNTS.slice(0, 6)
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, height: "100%", background: bg }}>
        {opts.map(w => {
          const take = Math.min(w, data.length)
          const sl = data.slice(data.length - take)
          const vals = sl.map(d => d[k] ?? 0)
          return (
            <GridSparkline key={w} vals={vals} color={def.color}
              label={`${gran.slice(0, 1)}1–${gran.slice(0, 1)}${sl.length}`}
              lastLabel={def.fmt(vals[vals.length - 1] ?? 0)} dark={dark} />
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, background: bg, height: "100%" }}>
      {selArr.map(k => {
        const def = METRIC_DEFS[k] ?? METRIC_DEFS.views
        const vals = data.map(d => d[k] ?? 0)
        return (
          <GridSparkline key={k} vals={vals} color={def.color}
            label={def.label}
            lastLabel={def.fmt(vals[vals.length - 1] ?? 0)} dark={dark} />
        )
      })}
    </div>
  )
}

// ── Video compare bar chart ───────────────────────────────────────────────────
function VideoComparePanel({ vidA, vidB, selected, dark }: {
  vidA: any; vidB: any; selected: Set<string>; dark: boolean;
}) {
  const selArr = Array.from(selected).filter(k => k !== "rpm" && k !== "adRevenue")
  const bg = dark ? "#050505" : "#fff"
  const border = dark ? "#222" : "#eee"
  return (
    <div style={{ position: "absolute", inset: 0, background: bg, overflowY: "auto", padding: "8px 0" }}>
      {selArr.map(k => {
        const def = METRIC_DEFS[k]
        if (!def) return null
        const a = vidA?.[k] ?? 0
        const b = vidB?.[k] ?? 0
        const total = a + b || 1
        const pctA = (a / total) * 100
        const pctB = (b / total) * 100
        return (
          <div key={k} style={{ padding: "4px 12px", borderBottom: `1px solid ${border}` }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 900, color: def.color, marginBottom: 3, letterSpacing: "0.05em" }}>{def.label}</div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span style={{ fontFamily: "monospace", fontSize: 9, color: "#00E5FF", fontWeight: 900, width: 40, textAlign: "right" }}>{def.fmt(a)}</span>
              <div style={{ flex: 1, display: "flex", height: 12, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${pctA}%`, background: "#00E5FF", transition: "width 0.3s" }} />
                <div style={{ width: `${pctB}%`, background: "#FF2D78", transition: "width 0.3s" }} />
              </div>
              <span style={{ fontFamily: "monospace", fontSize: 9, color: "#FF2D78", fontWeight: 900, width: 40 }}>{def.fmt(b)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Controller ────────────────────────────────────────────────────────────────
interface CtrlProps {
  gran: Gran; setGran: (g: Gran) => void;
  count: number; setCount: (n: number) => void;
  source: Source; setSource: (s: Source) => void;
  selected: Set<string>; toggleMetric: (k: string) => void;
  view: ViewMode; setView: (v: ViewMode) => void;
  cmpType: CmpType; setCmpType: (t: CmpType) => void;
  cmpDisplay: CmpDisplay; setCmpDisplay: (d: CmpDisplay) => void;
  countB: number; setCountB: (n: number) => void;
  videoIdxA: number; setVideoIdxA: (i: number) => void;
  videoIdxB: number; setVideoIdxB: (i: number) => void;
  videoCount: number;
  videoList: any[];
}

function Controller(p: CtrlProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const granOpts: Gran[] = ["DAYS", "WEEKS", "MONTHS", "YEARS"]
  const srcOpts: Source[] = ["CHANNEL", "VIDEO"]
  const viewOpts: ViewMode[] = ["OVERLAY", "GRID", "COMPARE"]
  const cmpOpts: CmpType[] = ["WINDOW", "SOURCE", "VIDEO"]
  const dispOpts: CmpDisplay[] = ["OVERLAY", "GRID"]
  const wins = [...TIME_WINDOW_COUNTS]
  const selArr = Array.from(p.selected)
  const nSel = selArr.length
  const isCompare = p.view === "COMPARE"
  const nVids = Math.max(1, p.videoCount)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const countDisplay = (n: number) => String(n)
  const cntFontSize = (n: number) => {
    const s = countDisplay(n)
    return s.length > 2 ? 20 : 28
  }

  const metricBar = () => {
    if (nSel === 0) return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 9, fontWeight: 900, color: "#999", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>SELECT ▼</span>
      </div>
    )
    if (nSel <= 3) return (
      <>
        {selArr.map((k, i) => (
          <div key={k} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: METRIC_DEFS[k]?.color ?? "#FFE500", borderLeft: i > 0 ? "3px solid #000" : "none" }}>
            <span style={{ fontSize: nSel === 1 ? 10 : 9, fontWeight: 900, color: "#000", textTransform: "uppercase" as const, letterSpacing: "0.04em", whiteSpace: "nowrap" as const }}>
              {nSel === 1 ? METRIC_DEFS[k]?.label : METRIC_DEFS[k]?.label.slice(0, 6)}
            </span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", padding: "0 5px" }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: "#000" }}>▼</span>
        </div>
      </>
    )
    return (
      <>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 3, padding: "0 4px" }}>
          {selArr.map(k => (
            <div key={k} style={{ width: 11, height: 11, borderRadius: "50%", background: METRIC_DEFS[k]?.color ?? "#FFE500", border: "2px solid #000", flexShrink: 0 }} />
          ))}
        </div>
        <span style={{ fontSize: 10, fontWeight: 900, color: "#000", paddingRight: 5 }}>▼</span>
      </>
    )
  }

  return (
    <div ref={ref} style={{ borderLeft: "4px solid #000", flexShrink: 0, width: 172, display: "flex", flexDirection: "column", position: "relative", userSelect: "none" }}>

      {/* COUNT A / main count */}
      {isCompare && p.cmpType === "VIDEO" ? null : (
        <div style={{ ...ROW, background: "#FFE500", padding: "2px 0" }}>
          <button style={ARR} onClick={() => p.setCount(cyc(wins, p.count, -1))}>◀</button>
          <span style={{ fontSize: cntFontSize(p.count), fontWeight: 1000, color: "#000", textAlign: "center", flex: 1, lineHeight: 1, letterSpacing: "-0.02em" }}>
            {countDisplay(p.count)}
          </span>
          <button style={ARR} onClick={() => p.setCount(cyc(wins, p.count, 1))}>▶</button>
        </div>
      )}

      {/* COMPARE extra rows */}
      {isCompare && p.cmpType === "WINDOW" && (
        <div style={{ ...ROW, background: "#FF9F1C", padding: "1px 0", minHeight: 20 }}>
          <button style={{ ...ARR, fontSize: 13 }} onClick={() => p.setCountB(cyc(wins, p.countB, -1))}>◀</button>
          <span style={{ fontSize: cntFontSize(p.countB) - 4, fontWeight: 900, color: "#000", flex: 1, textAlign: "center", lineHeight: 1 }}>
            {countDisplay(p.countB)}
          </span>
          <button style={{ ...ARR, fontSize: 13 }} onClick={() => p.setCountB(cyc(wins, p.countB, 1))}>▶</button>
        </div>
      )}

      {isCompare && p.cmpType === "VIDEO" && (
        <>
          <div style={{ ...ROW, background: "#00E5FF", padding: "1px 0", minHeight: 18 }}>
            <button style={{ ...ARR, fontSize: 11 }} onClick={() => p.setVideoIdxA((p.videoIdxA - 1 + nVids) % nVids)}>◀</button>
            <span style={{ fontSize: 8, fontWeight: 900, color: "#000", flex: 1, textAlign: "center", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", padding: "0 2px" }}>
              {(p.videoList[p.videoIdxA]?.title || "VIDEO A").slice(0, 14)}
            </span>
            <button style={{ ...ARR, fontSize: 11 }} onClick={() => p.setVideoIdxA((p.videoIdxA + 1) % nVids)}>▶</button>
          </div>
          <div style={{ ...ROW, background: "#FF2D78", padding: "1px 0", minHeight: 18 }}>
            <button style={{ ...ARR, fontSize: 11, color: "#fff" }} onClick={() => p.setVideoIdxB((p.videoIdxB - 1 + nVids) % nVids)}>◀</button>
            <span style={{ fontSize: 8, fontWeight: 900, color: "#fff", flex: 1, textAlign: "center", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", padding: "0 2px" }}>
              {(p.videoList[p.videoIdxB]?.title || "VIDEO B").slice(0, 14)}
            </span>
            <button style={{ ...ARR, fontSize: 11, color: "#fff" }} onClick={() => p.setVideoIdxB((p.videoIdxB + 1) % nVids)}>▶</button>
          </div>
        </>
      )}

      {/* GRAN */}
      <div style={{ ...ROW, background: "#FF2D78", padding: 0, minHeight: 20 }}>
        <button style={{ ...ARR, color: "#000", fontSize: 13 }} onClick={() => p.setGran(cyc(granOpts, p.gran, -1))}>◀</button>
        <span style={{ fontSize: 11, fontWeight: 900, color: "#000", textTransform: "uppercase" as const, letterSpacing: "0.06em", flex: 1, textAlign: "center", lineHeight: 1 }}>{p.gran}</span>
        <button style={{ ...ARR, color: "#000", fontSize: 13 }} onClick={() => p.setGran(cyc(granOpts, p.gran, 1))}>▶</button>
      </div>

      {/* SOURCE */}
      {(!isCompare || p.cmpType === "WINDOW") && (
        <>
          <div style={{ ...ROW, background: "#000", padding: 0, minHeight: 20 }}>
            <button style={{ ...ARR, color: "#FFE500", fontSize: 13 }} onClick={() => p.setSource(cyc(srcOpts, p.source, -1))}>◀</button>
            <span style={{ fontSize: 9.5, fontWeight: 900, color: "#FFE500", textTransform: "uppercase" as const, letterSpacing: "0.07em", flex: 1, textAlign: "center", lineHeight: 1 }}>{p.source}</span>
            <button style={{ ...ARR, color: "#FFE500", fontSize: 13 }} onClick={() => p.setSource(cyc(srcOpts, p.source, 1))}>▶</button>
          </div>
          {p.source === "VIDEO" && p.videoList.length > 0 && (
            <div style={{ ...ROW, background: "#00E5FF", padding: "1px 0", minHeight: 20 }}>
              <button style={{ ...ARR, fontSize: 11 }} onClick={() => p.setVideoIdxA((p.videoIdxA - 1 + nVids) % nVids)}>◀</button>
              <span style={{ fontSize: 8, fontWeight: 900, color: "#000", flex: 1, textAlign: "center", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", padding: "0 2px" }}
                title={p.videoList[p.videoIdxA]?.title}>
                {(p.videoList[p.videoIdxA]?.title || "SELECT VIDEO").slice(0, 16)}
              </span>
              <button style={{ ...ARR, fontSize: 11 }} onClick={() => p.setVideoIdxA((p.videoIdxA + 1) % nVids)}>▶</button>
            </div>
          )}
        </>
      )}

      {/* VIEW */}
      <div style={{ ...ROW, background: "#00E5FF", padding: 0, minHeight: 20 }}>
        <button style={ARR} onClick={() => p.setView(cyc(viewOpts, p.view, -1))}>◀</button>
        <span style={{ fontSize: 9, fontWeight: 900, color: "#000", textTransform: "uppercase" as const, letterSpacing: "0.05em", flex: 1, textAlign: "center", lineHeight: 1 }}>{p.view}</span>
        <button style={ARR} onClick={() => p.setView(cyc(viewOpts, p.view, 1))}>▶</button>
      </div>

      {/* COMPARE sub-rows */}
      {isCompare && (
        <>
          <div style={{ ...ROW, background: "#FF6B00", padding: 0, minHeight: 18 }}>
            <button style={{ ...ARR, fontSize: 11 }} onClick={() => p.setCmpType(cyc(cmpOpts, p.cmpType, -1))}>◀</button>
            <span style={{ fontSize: 8.5, fontWeight: 900, color: "#000", textTransform: "uppercase" as const, letterSpacing: "0.05em", flex: 1, textAlign: "center", lineHeight: 1 }}>{p.cmpType}</span>
            <button style={{ ...ARR, fontSize: 11 }} onClick={() => p.setCmpType(cyc(cmpOpts, p.cmpType, 1))}>▶</button>
          </div>
          {p.cmpType !== "VIDEO" && (
            <div style={{ ...ROW, background: "#b2f5ff", padding: 0, minHeight: 18 }}>
              <button style={ARR} onClick={() => p.setCmpDisplay(cyc(dispOpts, p.cmpDisplay, -1))}>◀</button>
              <span style={{ fontSize: 8.5, fontWeight: 900, color: "#000", textTransform: "uppercase" as const, letterSpacing: "0.05em", flex: 1, textAlign: "center", lineHeight: 1 }}>DISPLAY: {p.cmpDisplay}</span>
              <button style={ARR} onClick={() => p.setCmpDisplay(cyc(dispOpts, p.cmpDisplay, 1))}>▶</button>
            </div>
          )}
        </>
      )}

      {/* METRIC BAR (dropdown trigger) */}
      <div style={{ display: "flex", alignItems: "stretch", minHeight: 22, cursor: "pointer", position: "relative", flexShrink: 0 }}
        onClick={() => setOpen(o => !o)}>
        {metricBar()}

        {open && (
          <div style={{ position: "absolute", top: "100%", left: -4, right: -4, background: "#fff", border: "3px solid #000", borderRadius: "0 0 10px 10px", zIndex: 500, overflow: "hidden", maxHeight: 320, overflowY: "auto" }}>
            {ALL_KEYS.map(k => {
              const def = METRIC_DEFS[k]
              const isOn = p.selected.has(k)
              return (
                <button key={k} onClick={e => { e.stopPropagation(); p.toggleMetric(k) }}
                  style={{ display: "flex", alignItems: "center", width: "100%", padding: "5px 10px", margin: 0, background: isOn ? def.color : "#fff", border: "none", borderTop: "2px solid rgba(0,0,0,0.08)", cursor: "pointer", gap: 7 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: isOn ? "#000" : def.color, border: "2px solid #000", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: isOn ? "#000" : "#333", flex: 1, textAlign: "left" as const }}>{def.label}</span>
                  {isOn && <span style={{ fontSize: 9, color: "#000", fontWeight: 900 }}>ON</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Compare panel wrapper ─────────────────────────────────────────────────────
function CompareSide({ label, labelColor, data, selected, dark, cmpDisplay, gran, count }: {
  label: string; labelColor: string; data: any[]; selected: Set<string>;
  dark: boolean; cmpDisplay: CmpDisplay; gran: Gran; count: number;
}) {
  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 5, background: labelColor, padding: "2px 8px", display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 9, color: "#000", letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 9, color: "#000", opacity: 0.7 }}>{data.length} PTS</span>
      </div>
      <div style={{ position: "absolute", inset: 0, paddingTop: 20 }}>
        <div style={{ position: "relative", height: "100%" }}>
          {cmpDisplay === "OVERLAY"
            ? <OverlayChart data={data} selected={selected} dark={dark} compact />
            : <GridPanel data={data} selected={selected} dark={dark} gran={gran} count={count} />}
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export interface MultiMetricTimelineProps {
  data?: CanonicalVideoRow[]
  dailyMetrics?: ReadonlyArray<Record<string, unknown>>
}

export function MultiMetricTimeline({
  data = [],
  dailyMetrics = [],
}: MultiMetricTimelineProps) {
  const vt2ThemeMode = useVt2Theme()
  const [darkState, setDarkState] = useState(true)
  const dark = vt2ThemeMode === "adapted" ? darkState : darkState
  const toggleDark = () => setDarkState(prev => !prev)

  const [gran, setGran] = useState<Gran>("WEEKS")
  const [count, setCount] = useState(12)
  const [countB, setCountB] = useState(4)
  const [source, setSource] = useState<Source>("CHANNEL")
  const [selected, setSelected] = useState<Set<string>>(new Set(["views", "subs"]))
  const [view, setView] = useState<ViewMode>("OVERLAY")
  const [cmpType, setCmpType] = useState<CmpType>("WINDOW")
  const [cmpDisplay, setCmpDisplay] = useState<CmpDisplay>("OVERLAY")
  const [videoIdxA, setVideoIdxA] = useState(0)
  const [videoIdxB, setVideoIdxB] = useState(1)

  const flatVideos: Vt2VideoRow[] = flattenVideosForVt2(data)

  const toggleMetric = (k: string) => setSelected(prev => {
    const next = new Set(prev)
    if (next.has(k)) next.delete(k); else next.add(k)
    return next
  })

  // Derive slice based on gran, count, and source
  const getSliceData = (g: Gran, c: number, src: Source) => {
    if (src === "VIDEO") {
      const vid = flatVideos[videoIdxA] || flatVideos[0]
      if (!vid) return []
      // Single video metrics evolving over the selected period since publish.
      return Array.from({ length: c }).map((_, i) => {
        const fraction = Math.min(1, Math.pow((i + 1) / c, 0.45))
        return {
          label: periodLabel(g, i),
          views: Math.round(vid.views * fraction),
          engagedViews: Math.round(vid.views * 0.85 * fraction),
          watchHrs: Math.round(vid.watchHrs * fraction),
          subs: Math.round(vid.subsGained * fraction),
          likes: Math.round(vid.likes * fraction),
          shares: Math.round(vid.shares * fraction),
          comments: Math.round(vid.comments * fraction),
          revenue: Number((vid.revenue * fraction).toFixed(2)),
          avd: Math.round(vid.duration * (vid.avp / 100)),
          avp: vid.avp,
          rpm: vid.rpm,
          adRevenue: Number((vid.revenue * 0.85 * fraction).toFixed(2)),
        }
      })
    }

    const weeksNeeded =
      g === "DAYS" ? Math.max(1, Math.ceil(c / 7))
      : g === "WEEKS" ? c
      : g === "MONTHS" ? c * 4
      : c * 52
    const rollup = rollupWeeklyChannelWithSource(dailyMetrics, weeksNeeded)
    const weeklyRows = rollup.weeks.map((w, index) => ({
      label: periodLabel("WEEKS", index),
      views: w.views,
      engagedViews: Math.round(w.views * 0.85),
      watchHrs: Math.round(w.watchMins_hrs),
      subs: w.subs,
      likes: w.likes,
      shares: Math.round(w.views * 0.015),
      comments: Math.round(w.views * 0.005),
      revenue: w.revenue,
      avd: 45,
      avp: 55,
      rpm: w.views > 0 ? (w.revenue / w.views) * 1000 : 0,
      adRevenue: Math.round(w.revenue * 0.85),
    }))
    if (g === "WEEKS") return weeklyRows.slice(Math.max(0, weeklyRows.length - c)).map((row, index) => ({ ...row, label: periodLabel(g, index) }))
    if (g === "DAYS") {
      const rawDaily = dailyMetrics.slice(Math.max(0, dailyMetrics.length - c))
      if (rawDaily.length) {
        return rawDaily.map((row, index) => {
          const views = Number(row.views ?? 0) || 0
          const watchHrs = Number(row.watchTime ?? row.estimatedMinutesWatched ?? 0) || 0
          const revenue = Number(row.revenue ?? row.estimatedRevenue ?? 0) || 0
          return {
            label: String(row.date ?? row.day ?? periodLabel(g, index)),
            views,
            engagedViews: Number(row.engagedViews ?? Math.round(views * 0.85)) || 0,
            watchHrs,
            subs: Number(row.subscribersGained ?? 0) - Number(row.subscribersLost ?? 0),
            likes: Math.round(views * 0.045),
            shares: Math.round(views * 0.015),
            comments: Math.round(views * 0.005),
            revenue,
            avd: Number(row.avgViewDuration ?? row.averageViewDuration ?? 45) || 45,
            avp: Number(row.averagePercentageViewed ?? row.averageViewPercentage ?? 55) || 55,
            rpm: views > 0 ? (revenue / views) * 1000 : 0,
            adRevenue: Math.round(revenue * 0.85),
          }
        })
      }
      return groupTimelineRows(weeklyRows, g, c, 1)
    }
    return groupTimelineRows(weeklyRows, g, c, g === "MONTHS" ? 4 : 52)
  }

  const dataMain = getSliceData(gran, count, source)
  const bodyBg = dark ? "#050505" : "#fff"
  const selArr = Array.from(selected)
  const nSel = selArr.length

  const dataA = cmpType === "WINDOW" ? getSliceData(gran, count, source)
    : cmpType === "SOURCE" ? getSliceData(gran, count, "CHANNEL")
    : []
  const dataB = cmpType === "WINDOW" ? getSliceData(gran, countB, source)
    : cmpType === "SOURCE" ? getSliceData(gran, count, "VIDEO")
    : []
  const vidA = flatVideos[videoIdxA]
  const vidB = flatVideos[videoIdxB]

  const activeMetricLabel = metricListLabel(selArr)
  const modeLabel = view === "COMPARE"
    ? `COMPARE · ${cmpType === "WINDOW" ? `${count} vs ${countB} ${gran}` : cmpType === "SOURCE" ? "CHANNEL vs VIDEO" : "VIDEO vs VIDEO"} · ${activeMetricLabel}`
    : `${activeMetricLabel || "NO METRICS"} · ${periodCountLabel(count, gran)} · ${source} · ${view}`
  const controllerExplanation = view === "COMPARE"
    ? `Compare ${cmpType.toLowerCase()} ${periodCountLabel(count, gran)} data for ${activeMetricLabel || "selected metrics"}`
    : `${activeMetricLabel || "selected metrics"} over ${periodCountLabel(count, gran)} for ${source.toLowerCase()} data`

  return (
    <AnalyticsVisualShell
      shellMode="vt2-preserved"
      icon={<TrendingUp size={44} strokeWidth={2.5} />}
      headerColorPair={{ icon: "#FFE500", title: "#FFE500" }}
      title="MULTI-METRIC TIMELINE — CHANNEL & VIDEO DATA"
      subtitle={controllerExplanation}
      bodyFitMode="fillWidth"
      vt2={{
        controlBlock: (
          <Controller
            gran={gran} setGran={setGran}
            count={count} setCount={setCount}
            countB={countB} setCountB={setCountB}
            source={source} setSource={setSource}
            selected={selected} toggleMetric={toggleMetric}
            view={view} setView={setView}
            cmpType={cmpType} setCmpType={setCmpType}
            cmpDisplay={cmpDisplay} setCmpDisplay={setCmpDisplay}
            videoIdxA={videoIdxA} setVideoIdxA={setVideoIdxA}
            videoIdxB={videoIdxB} setVideoIdxB={setVideoIdxB}
            videoCount={flatVideos.length}
            videoList={flatVideos}
          />
        ),
        hovTitle: modeLabel,
        stats: nSel > 0 && dataMain.length > 0 ? selArr.map(k => ({
          value: METRIC_DEFS[k]?.fmt(dataMain[dataMain.length - 1]?.[k] ?? 0) ?? "0",
          label: METRIC_DEFS[k]?.label ?? k,
          bg: METRIC_DEFS[k]?.color ?? "#FFE500",
          color: "#000",
        })) : [],
        legendLeft: <>
          {selArr.map(k => (
            METRIC_DEFS[k] ? (
              <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: METRIC_DEFS[k].color, display: "inline-block", border: "1.5px solid #000" }} />
                <span style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 900, textTransform: "uppercase" }}>{METRIC_DEFS[k].label}</span>
              </span>
            ) : null
          ))}
        </>,
        legendRight: (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700 }}>{view === "COMPARE" ? `COMPARE: ${cmpType}` : `${dataMain.length} ${gran.slice(0, -1)} PERIODS`} · {source}</span>
            <button
              type="button"
              onClick={toggleDark}
              style={{
                border: "2px solid #000",
                borderRadius: 4,
                background: dark ? "#000" : "#fff",
                color: dark ? "#FFE500" : "#000",
                fontFamily: "monospace",
                fontSize: 9,
                fontWeight: 1000,
                lineHeight: 1,
                padding: "5px 8px",
                textTransform: "uppercase",
                cursor: "pointer",
              }}>
              {dark ? "Light Mode" : "Dark Mode"}
            </button>
          </span>
        ),
        bodyBg,
        minHeight: 380,
        chartInsight: nSel === 0 ? "SELECT ONE OR MORE METRICS FROM THE DROPDOWN TO BEGIN." : view === "OVERLAY" ? `NORMALIZED OVERLAY — ${activeMetricLabel} SCALED 0–100% ACROSS ${dataMain.length} ${gran}.` : view === "GRID" ? nSel === 1 ? `SINGLE METRIC — ${activeMetricLabel} ACROSS ${periodCountLabel(count, gran)}.` : `GRID OF ${nSel} METRIC SPARKLINES — ${periodCountLabel(count, gran)}.` : `COMPARE MODE: ${cmpType === "WINDOW" ? `WINDOW ${count} vs ${countB} ${gran}` : cmpType === "SOURCE" ? "CHANNEL STATS vs VIDEO STATS" : `"${(vidA?.title || "").slice(0, 20)}" vs "${(vidB?.title || "").slice(0, 20)}"`}.`,
        personalInsight: "COMPARE MULTIPLE METRICS SIMULTANEOUSLY ACROSS CUSTOM TIME WINDOWS TO UNCOVER LEADING INDICATORS.",
      }}
    >
      {nSel === 0 ? (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: bodyBg }}>
          <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 14, color: dark ? "#333" : "#ccc", textTransform: "uppercase", letterSpacing: "0.1em" }}>SELECT METRICS →</span>
        </div>
      ) : view === "OVERLAY" ? (
        <OverlayChart data={dataMain} selected={selected} dark={dark} />
      ) : view === "GRID" ? (
        <div style={{ position: "absolute", inset: 0 }}>
          <GridPanel data={dataMain} selected={selected} dark={dark} gran={gran} count={count} />
        </div>
      ) : (
        /* COMPARE MODE */
        cmpType === "VIDEO" ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", borderBottom: "3px solid #000", flexShrink: 0 }}>
              <div style={{ flex: 1, background: "#00E5FF", padding: "3px 8px", borderRight: "3px solid #000" }}>
                <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 9, color: "#000" }}>
                  ▲ {(vidA?.title || "VIDEO A").slice(0, 30)}
                </span>
              </div>
              <div style={{ flex: 1, background: "#FF2D78", padding: "3px 8px" }}>
                <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 9, color: "#fff" }}>
                  ▼ {(vidB?.title || "VIDEO B").slice(0, 30)}
                </span>
              </div>
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <VideoComparePanel vidA={vidA} vidB={vidB} selected={selected} dark={dark} />
            </div>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", borderTop: "none" }}>
            <CompareSide
              label={cmpType === "WINDOW" ? `WINDOW A: ${count === 0 ? "ALL" : count} ${gran}` : "CHANNEL"}
              labelColor="#FFE500"
              data={dataA} selected={selected} dark={dark}
              cmpDisplay={cmpDisplay} gran={gran} count={count}
            />
            <div style={{ width: 3, background: "#000", flexShrink: 0 }} />
            <CompareSide
              label={cmpType === "WINDOW" ? `WINDOW B: ${countB === 0 ? "ALL" : countB} ${gran}` : "VIDEOS"}
              labelColor="#FF2D78"
              data={dataB} selected={selected} dark={dark}
              cmpDisplay={cmpDisplay} gran={gran} count={countB}
            />
          </div>
        )
      )}
    </AnalyticsVisualShell>
  )
}

export const MultiMetricTimelineModule: React.FC<TubeExplorerVisualProps> = ({
  data = [],
  dailyMetrics = [],
}) => {
  return (
    <MultiMetricTimeline
      data={data}
      dailyMetrics={dailyMetrics}
    />
  )
}

export default MultiMetricTimeline
