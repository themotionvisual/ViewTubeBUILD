/**
 * Channel Big Bang Timeline — Data Visuals 2 port of 22-ChannelBigBangTimeline.tsx.
 *
 * Preserves the source's playhead animation, scrubber, particle-burst on peak
 * weeks, and the 9-metric switcher. Data is rolled from canonical video rows
 * into weekly buckets via `rollupWeeklyBigBang` (`comments` / `shares` / etc.
 * come along for the ride so all 9 series stay populated).
 */

import { useEffect, useMemo, useRef, useState } from "react"
import { Flame, Sparkles } from "lucide-react"
import type { TubeExplorerVisualProps } from "../../TubeExplorerVisualModules"
import { ChartModule, RaisedControl, type Stat } from "../ChartModule"
import { useVt2Theme } from "./theme"
import { rollupWeeklyBigBang, type Vt2BigBangWeek } from "./dataBridge"

import { VT_SPECTRUM_PALETTE_06 } from "../../../styles/toolboxPalette"

type BigBangMetricKey = "views" | "watchMins" | "subs" | "revenue" | "comments" | "shares" | "saves" | "avp" | "avd"
type BigBangMetric = { key: BigBangMetricKey; label: string; color: string; get: (w: Vt2BigBangWeek) => number }

const buildMetrics = (): BigBangMetric[] => [
  { key: "views",     label: "VIEWS",     color: VT_SPECTRUM_PALETTE_06[0],  get: (w) => w.views },
  { key: "watchMins", label: "WATCH MIN", color: VT_SPECTRUM_PALETTE_06[1],  get: (w) => w.watchMins },
  { key: "subs",      label: "SUBS",      color: VT_SPECTRUM_PALETTE_06[2],  get: (w) => w.subs },
  { key: "revenue",   label: "REVENUE",   color: VT_SPECTRUM_PALETTE_06[4],  get: (w) => w.revenue },
  { key: "comments",  label: "COMMENTS",  color: VT_SPECTRUM_PALETTE_06[5],  get: (w) => w.comments },
  { key: "shares",    label: "SHARES",    color: VT_SPECTRUM_PALETTE_06[6],  get: (w) => w.shares },
  { key: "saves",     label: "SAVES",     color: VT_SPECTRUM_PALETTE_06[8],  get: (w) => w.saves },
  { key: "avp",       label: "AVP%",      color: VT_SPECTRUM_PALETTE_06[9],  get: (w) => w.avp },
  { key: "avd",       label: "AVD SEC",   color: VT_SPECTRUM_PALETTE_06[10], get: (w) => w.avd },
]

export const ChannelBigBangTimelineModule: React.FC<TubeExplorerVisualProps> = ({ data }) => {
  const { palette } = useVt2Theme()
  const metrics = useMemo(() => buildMetrics(), [])

  const [weekCount, setWeekCount] = useState<number>(24)
  const weekly = useMemo<Vt2BigBangWeek[]>(() => rollupWeeklyBigBang(data, weekCount), [data, weekCount])
  const n = weekly.length

  const [scrubWeek, setScrubWeek] = useState<number>(0)
  const [metricKey, setMetricKey] = useState<BigBangMetricKey>("views")
  const [playing, setPlaying] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const rafRef = useRef<number | null>(null)
  const [particles, setParticles] = useState<{ x: number; y: number; vx: number; vy: number; life: number; color: string }[]>([])

  const m = useMemo(() => {
    const keyStr = String(metricKey).toLowerCase().replace(/\s+/g, "")
    const matched = metrics.find(
      (x) =>
        x.key.toLowerCase() === keyStr ||
        x.label.toLowerCase().replace(/\s+/g, "") === keyStr,
    )
    return matched ?? metrics[0]
  }, [metrics, metricKey])

  // Reset scrub position when the number of weeks changes so we're never
  // pointing past the end of the array.
  useEffect(() => {
    setScrubWeek((prev) => (n === 0 ? 0 : Math.min(prev, n - 1)))
  }, [n])

  const W = 800, H = 300
  const padL = 52, padR = 20, padT = 20, padB = 44
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  useEffect(() => {
    if (playing && n > 0) {
      intervalRef.current = setInterval(() => {
        setScrubWeek((w) => {
          if (w >= n - 1) { setPlaying(false); return n - 1 }
          return w + 1
        })
      }, 280)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, n])

  // Auto-scaled maximum for the current metric so the timeline uses the full
  // vertical range regardless of channel size.
  const metricMax = useMemo(() => {
    if (n === 0) return 1
    const values = weekly.map((w) => m.get(w))
    const max = Math.max(...values)
    return max > 0 ? max : 1
  }, [weekly, m, n])

  useEffect(() => {
    if (n === 0) return
    const val = m.get(weekly[scrubWeek])
    const norm = val / metricMax
    if (norm > 0.7) {
      const x = padL + (scrubWeek / Math.max(n - 1, 1)) * plotW
      const y = padT + plotH - norm * plotH
      const newP = Array.from({ length: Math.floor(norm * 12) }, () => ({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 1,
        life: 1,
        color: m.color,
      }))
      setParticles((prev) => [...prev.slice(-40), ...newP])
    }
  }, [scrubWeek, metricKey, weekly, n, m, metricMax, padL, padT, plotW, plotH])

  useEffect(() => {
    const animate = () => {
      setParticles((prev) => prev
        .map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.08, life: p.life - 0.03 }))
        .filter((p) => p.life > 0))
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  if (n === 0) {
    return (
      <ChartModule
        icon={<Sparkles size={44} strokeWidth={2.5} />}
        iconBg={palette.iconBg}
        titleBg={palette.titleBg}
        title="CHANNEL GROWTH BIG BANG TIMELINE"
        subtitle="ROLLED FROM CANONICAL VIDEO ROWS · SCRUB TO EXPLORE PEAKS"
        chartInsight="No weekly data available yet — sync or import Annalytics tables to populate this timeline."
        bodyBg="#04050a"
        minHeight={360}
      >
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "monospace", fontSize: 12, color: "#3a3a6a", textTransform: "uppercase", letterSpacing: "0.14em",
        }}>
          No weekly rollup available
        </div>
      </ChartModule>
    )
  }

  const toX = (i: number) => padL + (i / Math.max(n - 1, 1)) * plotW
  const toY = (v: number) => padT + plotH - Math.min(v / metricMax, 1) * plotH

  const areaPath = weekly.slice(0, scrubWeek + 1).map((w, i) => {
    const val = m.get(w)
    return `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(val)}`
  }).join(" ") + ` L ${toX(scrubWeek)} ${padT + plotH} L ${padL} ${padT + plotH} Z`

  const linePath = weekly.slice(0, scrubWeek + 1).map((w, i) => {
    const val = m.get(w)
    return `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(val)}`
  }).join(" ")

  const curVal = m.get(weekly[scrubWeek])
  const maxVal = Math.max(...weekly.map((w) => m.get(w)))
  const isBigBang = maxVal > 0 && curVal >= maxVal * 0.9

  const fmtVal = (v: number): string =>
    m.key === "revenue" ? `$${v.toFixed(0)}` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(Math.round(v))

  const stats: Stat[] = [
    { value: fmtVal(curVal), label: m.label, bg: m.color },
    { value: `WK${weekly[scrubWeek].week}`, label: "CURRENT", bg: palette.hue[0] },
    { value: isBigBang ? "PEAK" : "STABLE", label: "STATUS", bg: isBigBang ? palette.hue[2] : "#333" },
  ]

  return (
    <ChartModule
      icon={isBigBang ? <Flame size={44} strokeWidth={2.5} /> : <Sparkles size={44} strokeWidth={2.5} />}
      iconBg={m.color}
      titleBg={m.color}
      title={isBigBang ? "CHANNEL BIG BANG — PEAK DETECTED!" : "CHANNEL GROWTH BIG BANG TIMELINE"}
      subtitle="WEEKLY ROLLUP FROM CANONICAL VIDEO ROWS · SCRUB TO EXPLORE PEAKS"
      controlBlock={
        <RaisedControl
          cfg={{
            r1: palette.accent, r2: palette.hue[0], r3: palette.positive, r4: palette.hue[2],
            accent: m.color,
            count: weekCount,
            countOptions: [8, 12, 16, 20, 24, 32],
            onCount: setWeekCount,
            type: m.label,
            typeOptions: metrics.map((mm) => mm.label),
            onType: (lbl) => {
              const matched = metrics.find((mm) => mm.label === lbl || mm.key === lbl)
              if (matched) setMetricKey(matched.key)
            },
            metric: playing ? "■ STOP" : "▶ PLAY",
            metricOptions: ["▶ PLAY", "■ STOP"],
            onMetric: (t) => {
              if (t === "▶ PLAY") { setScrubWeek(0); setPlaying(true) }
              else setPlaying(false)
            },
            extra: `WK ${weekly[scrubWeek].week} / ${n}`,
          }}
        />
      }
      hovTitle={`WEEK ${weekly[scrubWeek].week} (${weekly[scrubWeek].date}): ${m.label} = ${fmtVal(curVal)}`}
      stats={stats}
      legendLeft={
        <>
          {metrics.map((mm) => (
            <span key={mm.key} style={{ color: mm.color, marginRight: 5 }}>■ {mm.label}</span>
          ))}
        </>
      }
      chartInsight="Scrub the playhead — the big-bang moment is the week where the selected metric surged above 70% of its ceiling."
      personalInsight={`Peak ${m.label} across the last ${n} weeks: ${fmtVal(maxVal)} on the strongest week.`}
      bodyBg="#04050a"
      minHeight={360}
    >
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="bbGradVt2" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={m.color} stopOpacity="0.5" />
                <stop offset="100%" stopColor={m.color} stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map((f) => {
              const y = padT + plotH * (1 - f)
              return <line key={f} x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="#0e1020" strokeWidth="1" />
            })}
            {scrubWeek > 0 && <path d={areaPath} fill="url(#bbGradVt2)" />}
            {scrubWeek > 0 && (
              <path d={linePath} fill="none" stroke={m.color} strokeWidth="3" strokeLinecap="round" filter={`drop-shadow(0 0 8px ${m.color})`} />
            )}
            {weekly.map((w, i) => {
              if (i > scrubWeek) return null
              const val = m.get(w)
              const x = toX(i)
              const y = toY(val)
              const isPeak = val === maxVal && maxVal > 0
              return (
                <g key={i}>
                  {isPeak && <circle cx={x} cy={y} r={18} fill={m.color} opacity={0.12} />}
                  <circle
                    cx={x} cy={y}
                    r={i === scrubWeek ? 7 : isPeak ? 6 : 4}
                    fill={i === scrubWeek ? m.color : isPeak ? m.color : "#1a1a2a"}
                    stroke={m.color}
                    strokeWidth={i === scrubWeek ? 2.5 : 1.5}
                  />
                  <text x={x} y={padT + plotH + 16} textAnchor="middle" fontSize="7" fill="#2a2a4a" fontFamily="monospace">W{w.week}</text>
                </g>
              )
            })}
            <rect x={toX(scrubWeek) - 50} y={toY(curVal) - 36} width={100} height={28} fill="#0a0a14" stroke={m.color} strokeWidth="2" rx={0} />
            <text x={toX(scrubWeek)} y={toY(curVal) - 16} textAnchor="middle" fontSize="13" fontWeight="900" fill={m.color} fontFamily="monospace">
              {fmtVal(curVal)}
            </text>
            <text x={toX(scrubWeek)} y={toY(curVal) - 4} textAnchor="middle" fontSize="7" fill="#3a3a6a" fontFamily="monospace">{weekly[scrubWeek].date}</text>
            {particles.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={3 * p.life} fill={p.color} opacity={p.life * 0.9} />
            ))}
            {[0, 0.5, 1].map((f) => (
              <text key={f} x={padL - 6} y={padT + plotH * (1 - f) + 4} textAnchor="end" fontSize="8" fill="#2a2a4a" fontFamily="monospace">
                {m.key === "revenue"
                  ? `$${(f * metricMax).toFixed(0)}`
                  : f * metricMax >= 1000
                    ? `${((f * metricMax) / 1000).toFixed(0)}K`
                    : Math.round(f * metricMax)}
              </text>
            ))}
          </svg>
        </div>
        <div style={{
          padding: "6px 12px", background: "rgba(4,5,10,0.9)",
          borderTop: "1px solid #0e1020", display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          <button
            onClick={() => { setScrubWeek(0); setPlaying((p) => !p) }}
            style={{
              background: playing ? palette.hue[2] : m.color,
              color: "#0a0a0a", border: "2px solid #0a0a0a", borderRadius: 0,
              padding: "4px 12px", fontFamily: "monospace", fontWeight: 900, fontSize: 10,
              cursor: "pointer", flexShrink: 0,
            }}
          >
            {playing ? "■ STOP" : "▶ PLAY"}
          </button>
          <input
            type="range" min={0} max={Math.max(n - 1, 0)} value={scrubWeek}
            onChange={(e) => { setPlaying(false); setScrubWeek(Number(e.target.value)) }}
            style={{ flex: 1, accentColor: m.color, cursor: "pointer" }}
          />
          <span style={{ fontFamily: "monospace", fontSize: 9, color: m.color, flexShrink: 0 }}>
            WK {weekly[scrubWeek].week} / {n}
          </span>
        </div>
      </div>
    </ChartModule>
  )
}

export default ChannelBigBangTimelineModule
