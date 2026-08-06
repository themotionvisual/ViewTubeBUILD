/**
 * Neo-brutalist ChartModule shell, ported verbatim from the source viz app so
 * every Data-Visuals-2 module can share the same header / controls / context
 * bar / legend / footer marquee. Preserving the source's layout, colors, and
 * animation timings is intentional — this is the "1:1 preserved" theme; the
 * adapted-to-viewtubeX variants live alongside each module and reuse the same
 * shell with brand tokens swapped in.
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import "./chartModule.css"

// ── Row colors ──────────────────────────────────────────────────────────────
// Slab: r1=count row, r2=toggle row, r3=dropdown row
// Deep: r1=count row, r2=label/qualifier row (black), r3=type toggle, r4=dropdown

function cyc<T>(arr: T[], val: T, dir: 1 | -1): T {
  const i = arr.indexOf(val)
  const base = i === -1 ? 0 : i          // guard stale / missing value
  return arr[(base + dir + arr.length) % arr.length]
}

const BTN: CSSProperties = {
  background: "none", border: "none", cursor: "pointer",
  fontSize: 14, fontWeight: 900, padding: "4px 8px", color: "#000",
  transition: "transform 0.1s", lineHeight: 1, userSelect: "none",
}

// ── SlabControl (3-row) ──────────────────────────────────────────────────────
export interface SlabCfg {
  r1?: string   // count row bg
  r2?: string   // toggle row bg
  r3?: string   // dropdown row bg
  accent: string // fallback + text on dark rows
  count: number; countOptions: number[]; onCount: (n: number) => void
  type: string;  typeOptions: string[];  onType:  (t: string) => void
  metric: string; metricOptions: string[]; onMetric: (m: string) => void
}

export function SlabControl({ cfg }: { cfg: SlabCfg }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const r1 = cfg.r1 ?? cfg.accent
  const r2 = cfg.r2 ?? cfg.accent
  const r3 = cfg.r3 ?? "#00CCFF"

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} style={{
      borderLeft: "4px solid #000", flexShrink: 0, width: 155,
      display: "flex", flexDirection: "column", position: "relative",
      userSelect: "none", overflow: "visible",
    }}>
      {/* Row 1 — Count */}
      <div style={{ background: r1, display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 0", borderBottom: "4px solid #000" }}>
        <button style={BTN} onClick={() => cfg.onCount(cyc(cfg.countOptions, cfg.count, -1))}>◀</button>
        <span style={{ fontSize: 32, fontWeight: 1000, color: "#000", textAlign: "center", minWidth: 44, lineHeight: 1 }}>{cfg.count}</span>
        <button style={BTN} onClick={() => cfg.onCount(cyc(cfg.countOptions, cfg.count, 1))}>▶</button>
      </div>
      {/* Row 2 — Toggle */}
      <div style={{ background: r2, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", margin: 0, borderBottom: "4px solid #000", minHeight: 22 }}>
        <button style={{ ...BTN, padding: "0 8px" }} onClick={() => cfg.onType(cyc(cfg.typeOptions, cfg.type, -1))}>◀</button>
        <span style={{ fontSize: 13, fontWeight: 900, color: "#000", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center", whiteSpace: "nowrap", flex: 1, margin: 0, padding: 0, lineHeight: 1 }}>{cfg.type}</span>
        <button style={{ ...BTN, padding: "0 8px" }} onClick={() => cfg.onType(cyc(cfg.typeOptions, cfg.type, 1))}>▶</button>
      </div>
      {/* Row 3 — Dropdown */}
      <div style={{ background: r3, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px", margin: 0, cursor: "pointer", flex: 1, position: "relative" }}
        onClick={() => setOpen(o => !o)}>
        <span style={{ fontSize: 13.75, fontWeight: 900, color: "#000", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0, padding: 0, lineHeight: 1 }}>{cfg.metric}</span>
        <span style={{ fontSize: 10, fontWeight: 900, color: "#000", marginLeft: 6 }}>▼</span>
        {open && (
          <div style={{ position: "absolute", top: "100%", left: -4, right: -4, background: "#fff", border: "3px solid #000", borderRadius: "0 0 10px 10px", zIndex: 400, overflow: "hidden" }}>
            {cfg.metricOptions.map(m => (
              <button key={m} onClick={e => { e.stopPropagation(); cfg.onMetric(m); setOpen(false) }}
                style={{ display: "block", width: "100%", padding: "6px 10px", margin: 0, fontSize: 11, fontWeight: m === cfg.metric ? 1000 : 900, textTransform: "uppercase" as const, letterSpacing: "0.06em", background: m === cfg.metric ? r1 : "#fff", border: "none", cursor: "pointer", textAlign: "center" as const, borderTop: "2px solid rgba(0,0,0,0.1)", lineHeight: 1 }}>
                {m}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── RaisedControl (4-row "Deep") ─────────────────────────────────────────────
export interface RaisedCfg {
  r1?: string   // count row bg
  r2?: string   // qualifier row bg (default #000)
  r3?: string   // type row bg
  r4?: string   // dropdown row bg
  accent: string
  count: number; countOptions: number[]; onCount: (n: number) => void
  /** Optional: some source modules use RaisedControl without a qualifier row.
   *  When omitted the qualifier row uses `count` as its label. */
  qualifier?: string; qualifierOptions?: string[]; onQualifier?: (q: string) => void
  type: string;  typeOptions: string[];  onType:  (t: string) => void
  metric: string; metricOptions: string[]; onMetric: (m: string) => void
  /** Free-form text shown in the qualifier row when no qualifier callback is
   *  provided (e.g. "WK 5 / 12" in the ChannelBigBangTimeline). */
  extra?: string
}

export function RaisedControl({ cfg }: { cfg: RaisedCfg }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const r1 = cfg.r1 ?? cfg.accent
  const r2 = cfg.r2 ?? "#000"
  const r3 = cfg.r3 ?? cfg.accent
  const r4 = cfg.r4 ?? "#00CCFF"
  const textOnDark = cfg.accent

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} style={{
      borderLeft: "4px solid #000", flexShrink: 0, width: 128,
      display: "flex", flexDirection: "column", position: "relative",
      userSelect: "none", overflow: "visible",
    }}>
      {/* Row 1 — Count */}
      <div style={{ background: r1, display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 0", borderBottom: "4px solid #000" }}>
        <button style={{ ...BTN, color: "#000" }} onClick={() => cfg.onCount(cyc(cfg.countOptions, cfg.count, -1))}>◀</button>
        <span style={{ fontSize: 28, fontWeight: 1000, color: "#000", textAlign: "center", minWidth: 38, lineHeight: 1 }}>{cfg.count}</span>
        <button style={{ ...BTN, color: "#000" }} onClick={() => cfg.onCount(cyc(cfg.countOptions, cfg.count, 1))}>▶</button>
      </div>
      {/* Row 2 — Qualifier (dark bg). If no qualifier callback is provided,
          render the free-form `extra` text without prev/next chevrons. */}
      <div style={{ background: r2, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", margin: 0, borderBottom: "4px solid #000", minHeight: 20 }}>
        {cfg.qualifierOptions && cfg.onQualifier ? (
          <>
            <button style={{ ...BTN, color: textOnDark, fontSize: 12, padding: "0 6px" }} onClick={() => cfg.onQualifier!(cyc(cfg.qualifierOptions!, cfg.qualifier ?? "", -1))}>◀</button>
            <span style={{ fontSize: 11, fontWeight: 900, color: textOnDark, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0, padding: 0, lineHeight: 1 }}>{cfg.qualifier}</span>
            <button style={{ ...BTN, color: textOnDark, fontSize: 12, padding: "0 6px" }} onClick={() => cfg.onQualifier!(cyc(cfg.qualifierOptions!, cfg.qualifier ?? "", 1))}>▶</button>
          </>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 900, color: textOnDark, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0, padding: 0, lineHeight: 1 }}>{cfg.extra ?? ""}</span>
        )}
      </div>
      {/* Row 3 — Type toggle */}
      <div style={{ background: r3, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", margin: 0, borderBottom: "4px solid #000", minHeight: 20 }}>
        <button style={{ ...BTN, padding: "0 6px" }} onClick={() => cfg.onType(cyc(cfg.typeOptions, cfg.type, -1))}>◀</button>
        <span style={{ fontSize: 11, fontWeight: 900, color: "#000", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center", flex: 1, whiteSpace: "nowrap", overflow: "hidden", margin: 0, padding: 0, lineHeight: 1 }}>{cfg.type}</span>
        <button style={{ ...BTN, padding: "0 6px" }} onClick={() => cfg.onType(cyc(cfg.typeOptions, cfg.type, 1))}>▶</button>
      </div>
      {/* Row 4 — Dropdown */}
      <div style={{ background: r4, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px", margin: 0, cursor: "pointer", flex: 1, position: "relative" }}
        onClick={() => setOpen(o => !o)}>
        <span style={{ fontSize: 13, fontWeight: 900, color: "#000", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0, padding: 0, lineHeight: 1 }}>{cfg.metric}</span>
        <span style={{ fontSize: 10, fontWeight: 900, color: "#000", marginLeft: 6 }}>▼</span>
        {open && (
          <div style={{ position: "absolute", top: "100%", left: -4, right: -4, background: "#fff", border: "3px solid #000", borderRadius: "0 0 10px 10px", zIndex: 400, overflow: "hidden" }}>
            {cfg.metricOptions.map(m => (
              <button key={m} onClick={e => { e.stopPropagation(); cfg.onMetric(m); setOpen(false) }}
                style={{ display: "block", width: "100%", padding: "6px 10px", margin: 0, fontSize: 11, fontWeight: m === cfg.metric ? 1000 : 900, textTransform: "uppercase" as const, letterSpacing: "0.06em", background: m === cfg.metric ? r1 : "#fff", border: "none", cursor: "pointer", textAlign: "center" as const, borderTop: "2px solid rgba(0,0,0,0.1)", lineHeight: 1 }}>
                {m}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Stat type ────────────────────────────────────────────────────────────────
export interface Stat { value: string; label: string; bg: string; color?: string }

// ── ChartModule ──────────────────────────────────────────────────────────────
interface ChartModuleProps {
  icon: ReactNode
  iconBg?: string
  titleBg?: string
  title: string
  /** Optional small line under the title. Not in the original v1 but referenced
   *  by several source modules; rendered when present. */
  subtitle?: string
  controlBlock?: ReactNode
  // Context bar
  hovTitle?: string
  stats?: Stat[]
  // Legend
  legendLeft?: ReactNode
  legendCenter?: ReactNode
  legendRight?: ReactNode
  // Footer
  chartInsight?: string
  personalInsight?: string
  footerBadge?: string
  footerBadgeBg?: string
  // Chart body
  bodyBg?: string
  minHeight?: number
  children: ReactNode
}

export function ChartModule({
  icon, iconBg = "#FF7497", titleBg = "#FFB158",
  title, subtitle, controlBlock,
  hovTitle, stats = [],
  legendLeft, legendCenter, legendRight,
  chartInsight, personalInsight,
  footerBadge, footerBadgeBg,
  bodyBg, minHeight = 320,
  children,
}: ChartModuleProps) {

  // Auto-generate subtitle from hov state or default
  const contextTitle = hovTitle || "HOVER OVER A DATA POINT"

  return (
    <div style={{
      border: "4px solid #000",
      borderRadius: 16,
      overflow: "hidden",
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      boxShadow: "8px 8px 0px 0px #000",
    }}>
      {/* ── HEADER ── */}
      <div style={{ borderBottom: "4px solid #000", display: "flex", alignItems: "stretch", minHeight: 74, flexShrink: 0 }}>
        {/* Icon block */}
        <div style={{ width: 76, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", borderRight: "4px solid #000", flexShrink: 0, fontSize: 26, color: "#000" }}>
          {icon}
        </div>
        {/* Title block */}
        <div style={{ flex: 1, minWidth: 0, background: titleBg, padding: "6px 10px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "clamp(22px, 3vw, 38px)", fontWeight: 1000, lineHeight: 0.88, textTransform: "uppercase", letterSpacing: "-0.02em", color: "#000" }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ marginTop: 4, fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#000", opacity: 0.85 }}>
              {subtitle}
            </div>
          )}
        </div>
        {/* Control block */}
        {controlBlock}
      </div>

      {/* ── CONTEXT BAR ── */}
      <div style={{ borderBottom: "4px solid #000", height: 40, display: "flex", alignItems: "stretch", background: "#fff", flexShrink: 0, overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 10px", fontSize: "clamp(11px, 1.5vw, 18px)", fontWeight: 1000, borderRight: "4px solid #000", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", minWidth: 0, color: "#000" }}>
          {contextTitle}
        </div>
        {stats.map((s, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "stretch", minWidth: 72, borderLeft: "4px solid #000" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 1000, letterSpacing: "-0.02em", padding: "0 6px", color: "#000" }}>
              {s.value}
            </div>
            <div style={{ height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: s.bg, color: s.color ?? "#000", width: "100%" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── CHART BODY ── */}
      <div style={{ position: "relative", minHeight, overflow: "hidden", background: bodyBg }}>
        {children}
      </div>

      {/* ── LEGEND ── */}
      {(legendLeft || legendCenter || legendRight) && (
        <div style={{ borderTop: "4px solid #000", padding: "6px 14px", background: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", flexWrap: "wrap", gap: 6, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{legendLeft}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{legendCenter}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{legendRight}</div>
        </div>
      )}

      {/* ── FOOTER MARQUEE ── */}
      {(chartInsight || personalInsight) && (
        <div style={{ borderTop: "4px solid #000", background: "#000", overflow: "hidden", height: 32, display: "flex", alignItems: "center", flexShrink: 0 }}>
          <div className="vt-marquee-inner">
            {footerBadge && (
              <span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 4, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", marginRight: 10, background: footerBadgeBg ?? "#33FF99", color: "#000", whiteSpace: "nowrap" }}>
                {footerBadge}
              </span>
            )}
            {chartInsight && <>
              <span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 4, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", marginRight: 10, background: "#00CCFF", color: "#000", whiteSpace: "nowrap" }}>CHART INSIGHT</span>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, fontWeight: 700, marginRight: 40, whiteSpace: "nowrap" }}>{chartInsight}</span>
            </>}
            {personalInsight && <>
              <span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 4, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", marginRight: 10, background: "#CCFF00", color: "#000", whiteSpace: "nowrap" }}>PERSONAL INSIGHT</span>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, fontWeight: 700, marginRight: 40, whiteSpace: "nowrap" }}>{personalInsight}</span>
            </>}
            {/* duplicate for seamless loop */}
            {chartInsight && <>
              <span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 4, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", marginRight: 10, background: "#00CCFF", color: "#000", whiteSpace: "nowrap" }}>CHART INSIGHT</span>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, fontWeight: 700, marginRight: 40, whiteSpace: "nowrap" }}>{chartInsight}</span>
            </>}
            {personalInsight && <>
              <span style={{ display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 4, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", marginRight: 10, background: "#CCFF00", color: "#000", whiteSpace: "nowrap" }}>PERSONAL INSIGHT</span>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, fontWeight: 700, marginRight: 40, whiteSpace: "nowrap" }}>{personalInsight}</span>
            </>}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Legend Primitives ────────────────────────────────────────────────────────
// Bar legend item: colored rectangle + label
export function LegBar({ color, label, gradient }: { color?: string; label: string; gradient?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 1000, fontSize: 12, letterSpacing: "0.05em" }}>
      <span style={{ display: "inline-block", width: 115, height: 20, background: gradient ?? color ?? "#00E5FF", border: "2px solid #000", borderRadius: 2, flexShrink: 0 }} />
      {label}
    </span>
  )
}

// Line-with-dots legend item: pink track + circles + label
export function LegLine({ color = "#FF7497", label }: { color?: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 1000, fontSize: 12, letterSpacing: "0.05em" }}>
      <span style={{ position: "relative", display: "inline-flex", alignItems: "center", height: 20, width: 90 }}>
        <span style={{ position: "absolute", left: 2, right: 2, top: "50%", transform: "translateY(-50%)", height: 7, background: color }} />
        {[0, 1, 2].map(i => (
          <span key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: color, border: "3px solid #000", flexShrink: 0, position: "absolute", left: `${i * 50}%`, transform: "translateX(-50%)" }} />
        ))}
      </span>
      {label}
    </span>
  )
}

// Bubble-size legend: growing circles + label
export function LegBubbles({ label, colors }: { label: string; colors?: string[] }) {
  const cols = colors ?? ["#24BCFF", "#2FC8EF", "#3AD4DF", "#45DDB0", "#66FF8A"]
  const sizes = [6, 9, 12, 16, 20]
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 1000, fontSize: 12, letterSpacing: "0.05em" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
        {sizes.map((s, i) => (
          <span key={i} style={{ width: s, height: s, borderRadius: "50%", background: cols[i] ?? "#00E5FF", display: "inline-block", opacity: 0.75, flexShrink: 0 }} />
        ))}
      </span>
      {label}
    </span>
  )
}
