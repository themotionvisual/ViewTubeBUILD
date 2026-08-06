/**
 * Revenue Mosaic — Data Visuals 2 port of 35-RevenueMosaic.tsx.
 * Videos become tiles; area = selected metric, tile color = CPM heat.
 * Layout, packing math, hover behavior, and stats are preserved 1:1.
 */

import { useEffect, useMemo, useRef, useState } from "react"
import { Coins } from "lucide-react"
import type { TubeExplorerVisualProps } from "../../TubeExplorerVisualModules"
import { ChartModule, SlabControl, type Stat } from "../ChartModule"
import { useVt2Theme } from "./theme"
import { flattenVideosForVt2, type Vt2VideoRow } from "./dataBridge"

const COUNTS = [5, 8, 10, 15, 20]
const METRICS = ["REVENUE", "VIEWS", "WATCH HRS", "SUBS"] as const
const TYPES = ["ALL", "SHORTS", "LONGFORM"] as const

type MetricLabel = (typeof METRICS)[number]
type FormatLabel = (typeof TYPES)[number]

const metricVal = (v: Vt2VideoRow, m: MetricLabel): number => {
  if (m === "REVENUE") return v.revenue
  if (m === "VIEWS") return v.views
  if (m === "WATCH HRS") return v.watchHrs
  return v.subsGained
}
const metricFmt = (v: Vt2VideoRow, m: MetricLabel): string => {
  if (m === "REVENUE") return `$${v.revenue.toFixed(0)}`
  if (m === "VIEWS") return `${(v.views / 1000).toFixed(0)}K`
  if (m === "WATCH HRS") return `${v.watchHrs.toFixed(0)}h`
  return v.subsGained.toString()
}

// CPM → Neo-Brutalist heat color palette (cool=cyan, mid=yellow/green, warm=pink/red)
const cpmHeat = (cpm: number): string => {
  const t = Math.min(Math.max((cpm - 0.5) / 0.65, 0), 1)
  if (t < 0.25) return "#36E0F6" // Cyan
  if (t < 0.50) return "#3FEE56" // Green
  if (t < 0.75) return "#FFDA47" // Yellow
  if (t < 0.90) return "#FF7497" // Pink
  return "#FF2D78" // Crimson
}

type Rect = { v: Vt2VideoRow; x: number; y: number; w: number; h: number; pct: number }

const buildMosaic = (items: { v: Vt2VideoRow; val: number }[], W: number, H: number): Rect[] => {
  if (W <= 0 || H <= 0) return []
  const total = items.reduce((s, i) => s + i.val, 0)
  const rects: Rect[] = []
  let remaining = [...items]
  let yOff = 0

  while (remaining.length > 0) {
    const rowH = Math.min(H - yOff, remaining.length === 1 ? H - yOff : (H - yOff) * 0.45)
    const rowTotal = remaining.reduce((s, i) => s + i.val, 0)
    let rowItems: typeof remaining = []
    let rowSum = 0
    let i = 0
    while (i < remaining.length) {
      const tW = ((rowSum + remaining[i].val) / rowTotal) * W
      if (rowItems.length > 0 && tW > W * 0.85 && remaining.length - i > 1) break
      rowItems.push(remaining[i])
      rowSum += remaining[i].val
      i++
      if (tW >= W * 0.55 && remaining.length - i > 0) break
    }
    remaining = remaining.slice(rowItems.length)
    const actualRowTotal = rowItems.reduce((s, i) => s + i.val, 0)
    const actualRowFrac = actualRowTotal / rowTotal
    const actualRowH = remaining.length === 0 ? H - yOff : rowH * (actualRowFrac / 0.6)
    const clampedH = Math.min(actualRowH, H - yOff)
    let xOff = 0
    rowItems.forEach((item) => {
      const frac = item.val / actualRowTotal
      const w = frac * W
      rects.push({ v: item.v, x: xOff, y: yOff, w, h: clampedH, pct: (item.val / total) * 100 })
      xOff += w
    })
    yOff += clampedH
    if (remaining.length === 0) break
  }
  return rects
}

export const RevenueMosaicModule: React.FC<TubeExplorerVisualProps> = ({ data }) => {
  const { palette } = useVt2Theme()
  const [count, setCount] = useState<number>(12)
  const [metric, setMetric] = useState<MetricLabel>("REVENUE")
  const [type, setType] = useState<FormatLabel>("ALL")
  const [hov, setHov] = useState<Vt2VideoRow | null>(null)
  const [containerSize, setContainerSize] = useState({ w: 800, h: 320 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        setContainerSize({ w: width, h: height })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const videos = useMemo(() => flattenVideosForVt2(data), [data])
  const filtered = useMemo(() => {
    const base = videos.filter((v) =>
      type === "ALL" ? true : type === "SHORTS" ? v.duration < 60 : v.duration >= 60,
    )
    return base
      .filter((v) => metricVal(v, metric) > 0)
      .sort((a, b) => metricVal(b, metric) - metricVal(a, metric))
      .slice(0, count)
  }, [videos, type, count, metric])

  const total = filtered.reduce((s, v) => s + metricVal(v, metric), 0)

  const PAD = 10
  const W = Math.max(300, containerSize.w - PAD * 2)
  const H = Math.max(240, containerSize.h - PAD * 2)
  const rects = useMemo(
    () => buildMosaic(filtered.map((v) => ({ v, val: metricVal(v, metric) })), W, H),
    [filtered, metric, W, H],
  )

  const stats: Stat[] = [
    { value: hov ? `$${hov.revenue.toFixed(2)}` : "—", label: "REVENUE", bg: palette.hue[2], color: "#000" },
    { value: hov ? `$${hov.cpm.toFixed(2)}` : "—", label: "CPM", bg: palette.hue[0] },
    { value: hov ? `${(hov.views / 1000).toFixed(0)}K` : "—", label: "VIEWS", bg: palette.accent },
    { value: hov ? `${hov.avp.toFixed(0)}%` : "—", label: "AVP", bg: palette.hue[1] },
  ]

  const empty = filtered.length === 0
  return (
    <ChartModule
      icon={<Coins size={44} strokeWidth={2.5} />}
      iconBg={palette.accent}
      titleBg={palette.titleBg}
      bodyBg={palette.bodyBg}
      title="Revenue Mosaic"
      subtitle="TILE AREA = SELECTED METRIC · TILE COLOR = CPM VALUE (COOL=LOW · WARM=HIGH)"
      controlBlock={
        <SlabControl
          cfg={{
            accent: palette.hue[2],
            count, countOptions: COUNTS, onCount: setCount,
            metric, metricOptions: [...METRICS], onMetric: (m) => setMetric(m as MetricLabel),
            type, typeOptions: [...TYPES], onType: (t) => setType(t as FormatLabel),
          }}
        />
      }
      hovTitle={hov?.title}
      stats={stats}
      legendLeft={
        <>
          <span style={{
            display: "inline-block", width: 80, height: 12,
            background: "linear-gradient(to right, #36E0F6, #3FEE56, #FFDA47, #FF7497, #FF2D78)",
            marginRight: 6, verticalAlign: "middle", border: "1px solid #000",
          }} />
          <b style={{ fontFamily: "monospace", fontSize: 10 }}>CPM: LOW → MED → HIGH</b>
        </>
      }
      legendCenter={
        <>TOTAL {metric}: {metric === "REVENUE" ? `$${total.toFixed(0)}` : metric === "VIEWS" ? `${(total / 1000).toFixed(0)}K` : total.toFixed(0)} ACROSS {filtered.length} VIDEOS</>
      }
      chartInsight="Tiles size by the selected metric — the biggest tiles dominate the channel's revenue mix."
      personalInsight={empty ? "No videos matched the current filters — try switching format or metric." : `Top ${Math.min(3, filtered.length)} videos hold ${((filtered.slice(0, 3).reduce((s, v) => s + metricVal(v, metric), 0) / (total || 1)) * 100).toFixed(0)}% of the current mosaic.`}
    >
      {empty ? (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "monospace", fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: "0.14em",
        }}>
          No videos to plot
        </div>
      ) : (
        <div ref={containerRef} style={{ position: "absolute", inset: 0, padding: PAD, overflow: "hidden" }}>
          <div style={{ position: "relative", width: W, height: H }}>
            {rects.map(({ v, x, y, w, h, pct }) => {
              const isHov = hov?.id === v.id
              const col = cpmHeat(v.cpm)
              return (
                <div
                  key={v.id}
                  onMouseEnter={() => setHov(v)}
                  onMouseLeave={() => setHov(null)}
                  style={{
                    position: "absolute", left: x, top: y, width: Math.max(1, w - 3), height: Math.max(1, h - 3),
                    background: col,
                    border: isHov ? "3px solid #0a0a0a" : "2px solid #000",
                    boxSizing: "border-box", cursor: "pointer", overflow: "hidden",
                    boxShadow: isHov ? "inset 0 0 0 2px rgba(255,255,255,0.7)" : "none",
                    transition: "border 0.1s, transform 0.1s",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    padding: "4px 6px",
                  }}
                >
                  {w > 45 && h > 20 && (
                    <div style={{
                      fontFamily: "monospace", fontWeight: 1000,
                      fontSize: Math.max(11, Math.min(22, w / 4, h / 2.5)),
                      color: "#000", textShadow: "0 1px 0 rgba(255,255,255,0.4)",
                      lineHeight: 1.0,
                    }}>
                      {metricFmt(v, metric)}
                    </div>
                  )}
                  {w > 50 && h > 35 && (
                    <div style={{
                      fontFamily: "monospace", fontWeight: 900,
                      fontSize: Math.max(10, Math.min(15, w / 6)),
                      color: "rgba(0,0,0,0.85)", lineHeight: 1.1,
                    }}>
                      {pct.toFixed(1)}%
                    </div>
                  )}
                  {w > 70 && h > 50 && (
                    <div style={{
                      fontFamily: "monospace", fontWeight: 900,
                      fontSize: Math.max(9, Math.min(13, w / 8)),
                      color: "#000", lineHeight: 1.1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                    }}>
                      {v.title}
                    </div>
                  )}
                  {isHov && w > 60 && (
                    <div style={{
                      position: "absolute", bottom: 4, right: 4, background: "#0a0a0a",
                      color: "#FFDA47", fontFamily: "monospace", fontWeight: 900, fontSize: 10, padding: "2px 6px",
                      border: "1px solid #000",
                    }}>
                      CPM ${v.cpm.toFixed(2)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </ChartModule>
  )
}

export default RevenueMosaicModule
