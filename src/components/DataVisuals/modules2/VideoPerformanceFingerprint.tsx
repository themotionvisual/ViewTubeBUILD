/**
 * Video Performance Fingerprint — Data Visuals 2 port of
 * 17-VideoPerformanceFingerprint.tsx. Each video becomes an 8-axis radial
 * glyph; layout, resize behavior, and the selected-video detail panel are
 * preserved. Metric axes and maxima carry over from the source but the max
 * for each is auto-scaled from the active dataset so tiny channels still
 * produce readable glyphs (the source used hand-tuned maxima).
 */

import { useEffect, useMemo, useRef, useState } from "react"
import { Fingerprint } from "lucide-react"
import type { TubeExplorerVisualProps } from "../../TubeExplorerVisualModules"
import { ChartModule, SlabControl, type Stat } from "../ChartModule"
import { useVt2Theme } from "./theme"
import { flattenVideosForVt2, type Vt2VideoRow } from "./dataBridge"
import { VT_SPECTRUM_PALETTE_06 } from "../../../styles/toolboxPalette"

type MetricKey = "ctr" | "avp" | "views" | "rpm" | "watchHrs" | "likes" | "revenue" | "subs"

type MetricDef = { key: MetricKey; label: string; color: string; get: (v: Vt2VideoRow) => number }

const optimalCols = (n: number, W: number, H: number, gap = 6, pad = 20): number => {
  if (n <= 0) return 1
  let bestCols = 1
  let bestCell = 0
  for (let c = 1; c <= n; c++) {
    const r = Math.ceil(n / c)
    const cellW = (W - pad - gap * (c - 1)) / c
    const cellH = (H - pad - gap * (r - 1)) / r
    const cell = Math.min(cellW, cellH)
    if (cell > bestCell) { bestCell = cell; bestCols = c }
  }
  return bestCols
}

function FingerprintGlyph({
  video, defs, maxes, size = 80, hover = false, canvasBg,
}: {
  video: Vt2VideoRow
  defs: MetricDef[]
  maxes: Record<MetricKey, number>
  size?: number
  hover?: boolean
  canvasBg: string
}) {
  const cx = size / 2, cy = size / 2
  const maxR = size * 0.42
  const n = defs.length
  const points = defs.map((m, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2
    const val = m.get(video)
    const norm = maxes[m.key] > 0 ? val / maxes[m.key] : 0
    const r = Math.min(norm, 1) * maxR
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, ax: cx + Math.cos(angle) * maxR, ay: cy + Math.sin(angle) * maxR, color: m.color, r }
  })
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"
  const avgR = points.reduce((s, p) => s + p.r, 0) / n
  const hue = (avgR / maxR) * 180
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {points.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.ax} y2={p.ay} stroke={canvasBg} strokeWidth="0.5" />
      ))}
      {[0.33, 0.67, 1.0].map((f) => (
        <polygon
          key={f}
          points={defs.map((_, i) => {
            const angle = (i / n) * Math.PI * 2 - Math.PI / 2
            return `${cx + Math.cos(angle) * maxR * f},${cy + Math.sin(angle) * maxR * f}`
          }).join(" ")}
          fill="none" stroke={canvasBg} strokeWidth="0.5"
        />
      ))}
      <path d={path} fill={`hsl(${hue + 120}, 80%, 55%)`} opacity="0.15" />
      <path d={path} fill={`hsl(${hue + 120}, 90%, 60%)`} opacity="0.12" stroke={`hsl(${hue + 120}, 90%, 70%)`} strokeWidth="1.5" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={hover ? 2.5 : 1.8} fill={p.color} />
      ))}
      <circle cx={cx} cy={cy} r={3} fill={`hsl(${hue + 120}, 90%, 60%)`} opacity={0.8} />
    </svg>
  )
}

export const VideoPerformanceFingerprintModule: React.FC<TubeExplorerVisualProps> = ({ data }) => {
  const { palette } = useVt2Theme()
  const [selected, setSelected] = useState<number | null>(null)
  const [count, setCount] = useState<number>(8)
  const [vizType, setVizType] = useState<string>("ALL VIDEOS")
  const [metric, setMetric] = useState<string>("ALL METRICS")
  const gridRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ w: 800, h: 400 })

  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setContainerSize({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const defs: MetricDef[] = useMemo(() => [
    { key: "views",    label: "VIEWS", color: VT_SPECTRUM_PALETTE_06[0],  get: (v) => v.views },
    { key: "watchHrs", label: "W.HRS", color: VT_SPECTRUM_PALETTE_06[1],  get: (v) => v.watchHrs },
    { key: "subs",     label: "SUBS",  color: VT_SPECTRUM_PALETTE_06[2],  get: (v) => v.subsGained },
    { key: "revenue",  label: "REV",   color: VT_SPECTRUM_PALETTE_06[4],  get: (v) => v.revenue },
    { key: "likes",    label: "LIKES", color: VT_SPECTRUM_PALETTE_06[7],  get: (v) => v.likes },
    { key: "avp",      label: "AVP%",  color: VT_SPECTRUM_PALETTE_06[9],  get: (v) => v.avp },
    { key: "ctr",      label: "CTR",   color: VT_SPECTRUM_PALETTE_06[10], get: (v) => v.ctr },
    { key: "rpm",      label: "RPM",   color: VT_SPECTRUM_PALETTE_06[11], get: (v) => v.rpm },
  ], [])

  const videos = useMemo(() => flattenVideosForVt2(data), [data])
  const sorted = useMemo(() => {
    const arr = [...videos]
    if (vizType === "TOP VIDEOS") arr.sort((a, b) => b.views - a.views)
    return arr
  }, [videos, vizType])
  const dataSlice = sorted.slice(0, count)

  // Auto-scale each metric max from what's actually in the dataset so glyphs
  // aren't collapsed to a dot on smaller channels.
  const maxes = useMemo<Record<MetricKey, number>>(() => {
    const acc: Record<MetricKey, number> = { ctr: 1, avp: 1, views: 1, rpm: 1, watchHrs: 1, likes: 1, revenue: 1, subs: 1 }
    for (const v of dataSlice) {
      acc.ctr = Math.max(acc.ctr, v.ctr)
      acc.avp = Math.max(acc.avp, v.avp)
      acc.views = Math.max(acc.views, v.views)
      acc.rpm = Math.max(acc.rpm, v.rpm)
      acc.watchHrs = Math.max(acc.watchHrs, v.watchHrs)
      acc.likes = Math.max(acc.likes, v.likes)
      acc.revenue = Math.max(acc.revenue, v.revenue)
      acc.subs = Math.max(acc.subs, v.subsGained)
    }
    return acc
  }, [dataSlice])

  const selV = selected !== null ? dataSlice[selected] : null

  const fmtVal = (v: Vt2VideoRow, key: MetricKey): string => {
    const val = defs.find((d) => d.key === key)!.get(v)
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
    if (val < 1 && val > 0) return `$${val.toFixed(2)}`
    return String(Math.round(val * 10) / 10)
  }

  const stats: Stat[] = selV ? defs.slice(0, 3).map((m) => ({
    value: fmtVal(selV, m.key), label: m.label, bg: m.color,
  })) : []

  const emptyState = dataSlice.length === 0
  const canvasBg = "#07100a"

  return (
    <ChartModule
      icon={<Fingerprint size={44} strokeWidth={2.5} />}
      iconBg={palette.hue[1]}
      titleBg={palette.hue[1]}
      title="VIDEO PERFORMANCE FINGERPRINT"
      controlBlock={
        <SlabControl
          cfg={{
            r1: palette.hue[1], r2: palette.secondary, r3: palette.accent,
            accent: palette.hue[1],
            count, countOptions: [8, 12, 15], onCount: setCount,
            type: vizType, typeOptions: ["ALL VIDEOS", "TOP VIDEOS"], onType: setVizType,
            metric, metricOptions: ["ALL METRICS", "VIEWS", "REVENUE", "ENGAGEMENT"], onMetric: setMetric,
          }}
        />
      }
      hovTitle={selV ? `SELECTED: ${selV.title.slice(0, 45)}` : "EACH VIDEO GENERATES A UNIQUE 8-AXIS RADIAL SIGNATURE · CLICK TO EXPAND"}
      stats={stats}
      legendLeft={
        <>
          {defs.map((m) => (
            <span key={m.key} style={{ display: "inline-flex", alignItems: "center", gap: 3, marginRight: 6 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: m.color }} />
              {m.label}
            </span>
          ))}
        </>
      }
      chartInsight="Video fingerprints reveal each video's unique metric signature — asymmetric shapes indicate specialization."
      personalInsight={emptyState ? "No videos in the snapshot yet." : "Balanced glyphs (high on CTR, AVP, and RPM together) are your strongest videos overall."}
      bodyBg={canvasBg}
      minHeight={340}
    >
      {emptyState ? (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "monospace", fontSize: 12, color: "#284a2a", textTransform: "uppercase", letterSpacing: "0.14em",
        }}>
          No videos to fingerprint
        </div>
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", overflow: "hidden" }}>
          <div ref={gridRef} style={{ flex: 1, minWidth: 0, position: "relative" }}>
            {(() => {
              const GAP = 6, PAD = 20, LABEL_H = 18
              const panelW = selV ? 216 : 0
              const availW = containerSize.w - panelW
              const availH = containerSize.h
              const cols = 4
              const rows = Math.max(2, Math.ceil(dataSlice.length / cols))
              const cellW = (availW - PAD - GAP * (cols - 1)) / cols
              const cellH = (availH - PAD - GAP * (rows - 1)) / rows
              const glyphSize = Math.max(32, Math.floor(Math.min(cellW, cellH - LABEL_H) - 8))
              return (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gridTemplateRows: `repeat(${rows}, 1fr)`,
                  padding: PAD / 2,
                  gap: GAP,
                  overflow: "hidden",
                }}>
                  {dataSlice.map((v, i) => (
                    <div
                      key={v.id + i}
                      onClick={() => setSelected(selected === i ? null : i)}
                      style={{
                        cursor: "pointer",
                        border: selected === i ? `2px solid ${palette.hue[1]}` : "1px solid #0a2a14",
                        borderRadius: 10, padding: 2,
                        background: selected === i ? `${palette.hue[1]}12` : "transparent",
                        transition: "all 0.15s",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <FingerprintGlyph video={v} defs={defs} maxes={maxes} size={glyphSize} hover={selected === i} canvasBg="#1a2a1a" />
                      <div style={{
                        fontFamily: "monospace",
                        fontSize: Math.max(6, glyphSize * 0.09),
                        color: "#1a3a20", marginTop: 2, textAlign: "center",
                        maxWidth: glyphSize, lineHeight: 1.2,
                        overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                      }}>
                        {v.title.split(" ").slice(0, 3).join(" ")}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
          {selV && (
            <div style={{ width: 200, flexShrink: 0, borderLeft: "1px solid #0a2a14", padding: "12px 14px", background: "rgba(0,10,4,0.8)" }}>
              <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 10, color: palette.hue[1], marginBottom: 8, lineHeight: 1.3 }}>{selV.title}</div>
              <FingerprintGlyph video={selV} defs={defs} maxes={maxes} size={140} hover canvasBg="#1a2a1a" />
              <div style={{ marginTop: 8 }}>
                {defs.map((m) => {
                  const val = m.get(selV)
                  const max = maxes[m.key] || 1
                  const pct = Math.min(val / max, 1) * 100
                  return (
                    <div key={m.key} style={{ marginBottom: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 8, color: m.color }}>{m.label}</span>
                        <span style={{ fontFamily: "monospace", fontSize: 8, color: "#fff", fontWeight: 900 }}>{fmtVal(selV, m.key)}</span>
                      </div>
                      <div style={{ height: 3, background: "#0a2a14", borderRadius: 2 }}>
                        <div style={{ height: 3, width: `${pct}%`, background: m.color, borderRadius: 2 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </ChartModule>
  )
}

export default VideoPerformanceFingerprintModule
