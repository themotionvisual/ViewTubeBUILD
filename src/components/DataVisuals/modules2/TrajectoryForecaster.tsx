/**
 * Channel Trajectory Forecaster — Data Visuals 2 port of
 * 42-TrajectoryForecaster.tsx.
 *
 * The forecast math (linear-regression slopes across 4/8/all windows,
 * optimistic/realistic/cautious envelope construction), the tab layout,
 * the goal-planner steppers, and the canvas rendering path are all preserved
 * from the source. The one substantive change is data intake: historical
 * `views/revenue/watchHrs/subs` come from a real weekly/monthly rollup of
 * `TubeExplorerVisualProps.data` rather than the source's `CSV_*_EXTENDED`
 * fixtures.
 */

import { useEffect, useMemo, useRef, useState } from "react"
import { TrendingUp } from "lucide-react"
import type { TubeExplorerVisualProps } from "../../TubeExplorerVisualModules"
import { ChartModule, SlabControl } from "../ChartModule"
import { useVt2Theme } from "./theme"
import {
  labelWeek,
  rollupMonthlyFromVideos,
  rollupWeeklyFromVideos,
  type Vt2MonthlyRow,
  type Vt2WeeklyRow,
} from "./dataBridge"

// ─── Types ─────────────────────────────────────────────────────────────────
type MetricKey = "views" | "revenue" | "watchHrs" | "subs"
type Gran = "WEEKLY" | "MONTHLY"
type Tab = "TRAJECTORY" | "GOALS"

type MetricDef = {
  label: string
  unit: string
  color: string
  fmt: (v: number) => string
  step: number
  smartMult: number
}

type MetricRow = Vt2WeeklyRow | Vt2MonthlyRow

const buildMetrics = (
  hues: string[], accent: string, positive: string, warm: string,
): Record<MetricKey, MetricDef> => ({
  views:    { label: "VIEWS",     unit: "views", color: accent,   fmt: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toFixed(0), step: 1000, smartMult: 1.25 },
  revenue:  { label: "REVENUE",   unit: "$",     color: warm,     fmt: (v) => `$${v.toFixed(0)}`,                                     step: 10,   smartMult: 1.30 },
  watchHrs: { label: "WATCH HRS", unit: "hrs",   color: positive, fmt: (v) => `${v.toFixed(0)}h`,                                     step: 50,   smartMult: 1.25 },
  subs:     { label: "SUBS",      unit: "subs",  color: hues[2],  fmt: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toFixed(0), step: 25,   smartMult: 1.20 },
})

const COLOR_OPT = "#4A9EFF"
const COLOR_CAU = "#FF4D8F"

// ─── Forecast math (preserved from the source) ─────────────────────────────
function linReg(vals: number[]): number {
  const n = vals.length
  if (n < 2) return 0
  const sumX = (n * (n - 1)) / 2
  const sumY = vals.reduce((a, b) => a + b, 0)
  const sumXY = vals.reduce((acc, v, i) => acc + i * v, 0)
  const sumXX = vals.reduce((acc, _, i) => acc + i * i, 0)
  const denom = n * sumXX - sumX * sumX
  return denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom
}

function makeForecast(vals: number[], periods: number): { opt: number[]; real: number[]; cau: number[] } {
  const n = vals.length
  if (n < 2) {
    const v = vals[0] ?? 0
    return { opt: Array(periods).fill(v), real: Array(periods).fill(v), cau: Array(periods).fill(v) }
  }
  const s4 = linReg(vals.slice(-Math.min(4, n)))
  const s8 = linReg(vals.slice(-Math.min(8, n)))
  const sAll = linReg(vals)
  const lastVal = vals[n - 1] ?? 0
  const sorted = [...vals.slice(-6).filter((v) => v > 0)].sort((a, b) => a - b)
  const baseline = sorted[Math.floor(sorted.length / 2)] ?? lastVal

  const slopeReal = s4 * 0.25 + s8 * 0.35 + sAll * 0.40
  const slopeOpt = s4 >= 0
    ? s4 * 1.6 + Math.max(0, sAll) * 0.5
    : Math.max(0, sAll) * 1.4 + Math.max(0, s8) * 0.4

  const opt: number[] = [], real: number[] = [], cau: number[] = []
  for (let t = 1; t <= periods; t++) {
    const rv = Math.max(baseline * 0.20, lastVal + slopeReal * t)
    const ov = Math.max(rv * 1.12, lastVal + slopeOpt * t)
    const cauSlope = sAll * 0.25 + s8 * 0.05
    const cv = Math.min(rv * 0.80, Math.max(0, lastVal + cauSlope * t))
    opt.push(ov)
    real.push(rv)
    cau.push(cv)
  }
  return { opt, real, cau }
}

// ─── Forecast Chart (canvas) ───────────────────────────────────────────────
interface ForecastChartProps {
  historical: number[]
  opt: number[]; real: number[]; cau: number[]
  accentColor: string
  fmt: (v: number) => string
  labels: string[]
  goalValue?: number
  showHist: boolean; showOpt: boolean; showReal: boolean; showCau: boolean
  compact?: boolean
}

function ForecastChart({
  historical, opt, real, cau, accentColor, fmt, labels, goalValue,
  showHist, showOpt, showReal, showCau, compact,
}: ForecastChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hover, setHover] = useState<{ period: number; future: boolean } | null>(null)
  const realColor = `${accentColor}cc`
  const periods = opt.length

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = canvas.width, H = canvas.height
    const pL = compact ? 8 : 58, pR = compact ? 6 : 20, pT = compact ? 8 : 24, pB = compact ? 8 : 38
    const cW = W - pL - pR, cH = H - pT - pB
    const total = historical.length + periods

    const allVals = [
      ...(showHist ? historical : []),
      ...(showOpt ? opt : []),
      ...(showReal ? real : []),
      ...(showCau ? cau : []),
      ...(goalValue !== undefined ? [goalValue] : []),
    ]
    const maxV = allVals.length ? Math.max(...allVals) * 1.12 : 1
    const xOf = (i: number) => pL + (i / Math.max(total - 1, 1)) * cW
    const yOf = (v: number) => pT + cH - (Math.max(0, v) / maxV) * cH

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = "#0a0a0f"
    ctx.fillRect(0, 0, W, H)

    if (!compact) {
      ctx.strokeStyle = "rgba(255,255,255,0.06)"
      ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const y = pT + (cH / 4) * i
        ctx.beginPath(); ctx.moveTo(pL, y); ctx.lineTo(pL + cW, y); ctx.stroke()
        ctx.fillStyle = "rgba(255,255,255,0.35)"
        ctx.font = "700 9px monospace"
        ctx.textAlign = "right"
        ctx.fillText(fmt(maxV - (maxV / 4) * i), pL - 5, y + 3)
      }
    }

    const divX = xOf(historical.length - 1)
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = "rgba(255,255,255,0.15)"
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(divX, pT); ctx.lineTo(divX, pT + cH); ctx.stroke()
    ctx.setLineDash([])

    if (goalValue && goalValue > 0 && !compact) {
      const gy = yOf(goalValue)
      ctx.setLineDash([6, 4])
      ctx.strokeStyle = "#00E5FF"
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(pL, gy); ctx.lineTo(pL + cW, gy); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = "#00E5FF"
      ctx.font = "800 9px monospace"
      ctx.textAlign = "left"
      ctx.fillText(`GOAL ${fmt(goalValue)}`, pL + 4, gy - 5)
    }

    if (showOpt && showCau) {
      ctx.beginPath()
      ctx.moveTo(xOf(historical.length), yOf(opt[0] ?? 0))
      for (let i = 0; i < periods; i++) ctx.lineTo(xOf(historical.length + i), yOf(opt[i] ?? 0))
      for (let i = periods - 1; i >= 0; i--) ctx.lineTo(xOf(historical.length + i), yOf(cau[i] ?? 0))
      ctx.closePath()
      ctx.fillStyle = `${accentColor}10`
      ctx.fill()
    }

    const drawLine = (pts: number[], startIdx: number, color: string, lw: number, dash: number[] = []) => {
      if (!pts.length) return
      ctx.strokeStyle = color
      ctx.lineWidth = lw
      ctx.lineJoin = "round"
      ctx.lineCap = "round"
      ctx.setLineDash(dash)
      ctx.beginPath()
      pts.forEach((v, i) => {
        const x = xOf(startIdx + i), y = yOf(v)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.setLineDash([])
    }

    if (showCau) drawLine(cau, historical.length, COLOR_CAU, compact ? 2 : 3.5, [6, 4])
    if (showReal) drawLine(real, historical.length, realColor, compact ? 2 : 3.5)
    if (showOpt) drawLine(opt, historical.length, COLOR_OPT, compact ? 2 : 3.5)

    if (showHist) {
      drawLine(historical, 0, accentColor, compact ? 1.5 : 3)
      const lx = xOf(historical.length - 1)
      const ly = yOf(historical[historical.length - 1] ?? 0)
      ctx.beginPath(); ctx.arc(lx, ly, compact ? 3 : 5, 0, Math.PI * 2)
      ctx.fillStyle = accentColor; ctx.fill()
    }

    if (!compact) {
      ctx.fillStyle = "rgba(255,255,255,0.30)"
      ctx.font = "700 8px monospace"
      ctx.textAlign = "center"
      const step = Math.max(1, Math.ceil(total / 10))
      for (let i = 0; i < historical.length; i += step) {
        if (labels[i]) ctx.fillText(labels[i], xOf(i), pT + cH + 14)
      }
      for (let i = 0; i < periods; i += step) {
        ctx.fillStyle = `${accentColor}88`
        ctx.fillText(`+${i + 1}`, xOf(historical.length + i), pT + cH + 14)
        ctx.fillStyle = "rgba(255,255,255,0.30)"
      }
    }

    if (hover && !compact) {
      const { period, future } = hover
      const x = future ? xOf(historical.length + period) : xOf(period)
      const yv = future ? yOf(real[period] ?? 0) : yOf(historical[period] ?? 0)

      ctx.strokeStyle = "rgba(255,255,255,0.2)"
      ctx.lineWidth = 1; ctx.setLineDash([2, 2])
      ctx.beginPath(); ctx.moveTo(x, pT); ctx.lineTo(x, pT + cH); ctx.stroke()
      ctx.setLineDash([])

      if (future) {
        const ttW = 160, ttH = 84
        const ttX = Math.min(x + 10, W - ttW - 4)
        const ttY = Math.max(pT, yv - ttH / 2)
        ctx.fillStyle = "#111118"; ctx.strokeStyle = accentColor; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.roundRect(ttX, ttY, ttW, ttH, 5); ctx.fill(); ctx.stroke()
        ctx.font = "800 9px monospace"; ctx.textAlign = "left"
        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillText(`FORECAST +${period + 1}`, ttX + 8, ttY + 14)
        if (showOpt) { ctx.fillStyle = COLOR_OPT; ctx.fillText(`OPTIMISTIC: ${fmt(opt[period] ?? 0)}`, ttX + 8, ttY + 30) }
        if (showReal) { ctx.fillStyle = realColor; ctx.fillText(`REALISTIC:  ${fmt(real[period] ?? 0)}`, ttX + 8, ttY + 46) }
        if (showCau) { ctx.fillStyle = COLOR_CAU; ctx.fillText(`CAUTIOUS:   ${fmt(cau[period] ?? 0)}`, ttX + 8, ttY + 62) }
      } else if (historical[period] !== undefined) {
        const ttW = 130, ttH = 42
        const ttX = Math.min(x + 10, W - ttW - 4)
        const ttY = Math.max(pT, yv - ttH / 2)
        ctx.fillStyle = "#111118"; ctx.strokeStyle = accentColor; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.roundRect(ttX, ttY, ttW, ttH, 5); ctx.fill(); ctx.stroke()
        ctx.font = "800 9px monospace"; ctx.textAlign = "left"
        ctx.fillStyle = accentColor
        ctx.fillText(`${labels[period] ?? ""}: ${fmt(historical[period] ?? 0)}`, ttX + 8, ttY + 14)
        ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = "600 8px monospace"
        ctx.fillText("HISTORICAL", ttX + 8, ttY + 30)
      }
    }
  }, [historical, opt, real, cau, accentColor, fmt, labels, goalValue,
      showHist, showOpt, showReal, showCau, compact, hover, realColor, periods])

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (compact) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width)
    const pL = 58, pR = 20
    const chartW = canvas.width - pL - pR
    const total = historical.length + periods
    const idx = Math.round(((mx - pL) / chartW) * (total - 1))
    if (idx < 0 || idx >= total) { setHover(null); return }
    setHover(idx < historical.length
      ? { period: idx, future: false }
      : { period: idx - historical.length, future: true })
  }

  const h = compact ? 80 : 280
  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={h}
      style={{ width: "100%", height: h, display: "block", cursor: compact ? "default" : "crosshair" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
    />
  )
}

// ─── Main module ──────────────────────────────────────────────────────────
export const TrajectoryForecasterModule: React.FC<TubeExplorerVisualProps> = ({ data }) => {
  const { palette } = useVt2Theme()
  const [metric, setMetric] = useState<MetricKey>("views")
  const [gran, setGran] = useState<Gran>("MONTHLY")
  const [tab, setTab] = useState<Tab>("TRAJECTORY")
  const [forecastPeriods, setForecastPeriods] = useState<number>(12)

  const [showHist, setShowHist] = useState(true)
  const [showOpt, setShowOpt] = useState(true)
  const [showReal, setShowReal] = useState(true)
  const [showCau, setShowCau] = useState(true)

  const [goalOverride, setGoalOverride] = useState<number | null>(null)
  const [deadline, setDeadline] = useState<number>(12)

  const metricMap = useMemo(
    () => buildMetrics(palette.hue, palette.accent, palette.positive, palette.warm),
    [palette],
  )
  const m = metricMap[metric]
  const accent = m.color

  // Roll canonical rows into the granularity we're on. Weekly rollup uses a
  // generous 52-week window so we always have enough history to fit slopes.
  const rows: MetricRow[] = useMemo(
    () => gran === "WEEKLY" ? rollupWeeklyFromVideos(data, 52) : rollupMonthlyFromVideos(data),
    [gran, data],
  )

  const historical = useMemo(
    () => rows.map((row) => {
      if (metric === "views") return row.views
      if (metric === "revenue") return row.revenue
      if (metric === "watchHrs") return "watchMins_hrs" in row ? row.watchMins_hrs : row.watchHrs
      return row.subs
    }),
    [rows, metric],
  )
  const labels = useMemo(
    () => rows.map((row) => "label" in row ? row.label : labelWeek(row as Vt2WeeklyRow)),
    [rows],
  )

  const { opt, real, cau } = useMemo(
    () => makeForecast(historical, forecastPeriods),
    [historical, forecastPeriods],
  )

  const periodLabel = gran === "WEEKLY" ? "week" : "month"
  const recentAvg = historical.length > 0
    ? historical.slice(-6).reduce((a, b) => a + b, 0) / Math.min(6, historical.length)
    : 0
  const realFutureAvg = real.length > 0 ? real.reduce((a, b) => a + b, 0) / real.length : 0
  const optFutureAvg = opt.length > 0 ? opt.reduce((a, b) => a + b, 0) / opt.length : 0
  const cauFutureAvg = cau.length > 0 ? cau.reduce((a, b) => a + b, 0) / cau.length : 0

  const smartGoal = useMemo(
    () => Math.max(m.step, Math.ceil((realFutureAvg * m.smartMult) / m.step) * m.step),
    [realFutureAvg, m.smartMult, m.step],
  )
  const effectiveGoal = goalOverride ?? smartGoal

  // Reset goal override when metric/granularity flips — same behavior as source.
  const prevMetric = useRef(metric)
  const prevGran = useRef(gran)
  if (prevMetric.current !== metric || prevGran.current !== gran) {
    prevMetric.current = metric
    prevGran.current = gran
    if (goalOverride !== null) setGoalOverride(null)
  }

  function adjGoal(dir: 1 | -1) {
    const base = effectiveGoal
    setGoalOverride(Math.max(m.step, base + dir * m.step))
  }

  function periodsToHit(arr: number[], goal: number): number | null {
    for (let i = 0; i < arr.length; i++) if (arr[i] >= goal) return i + 1
    return null
  }

  const realColor = `${accent}cc`

  function Chip({ label, color, active, onToggle }: { label: string; color: string; active: boolean; onToggle: () => void }) {
    return (
      <button
        onClick={onToggle}
        style={{
          fontFamily: "monospace", fontWeight: 900, fontSize: 9, letterSpacing: "0.08em",
          padding: "4px 10px", border: `2px solid ${active ? color : "#333"}`,
          borderRadius: 20, cursor: "pointer",
          background: active ? `${color}22` : "transparent",
          color: active ? color : "#444",
          display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s",
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: active ? color : "#333", display: "inline-block" }} />
        {label}
      </button>
    )
  }

  const empty = historical.length < 2

  return (
    <ChartModule
      title="CHANNEL TRAJECTORY FORECASTER"
      icon={<TrendingUp size={44} strokeWidth={2.5} />}
      iconBg={palette.hue[1]}
      titleBg={palette.hue[1]}
      subtitle={`FORECAST HORIZON: ${forecastPeriods} ${periodLabel.toUpperCase()}S · SCENARIOS BUILT FROM MULTI-WINDOW LINEAR REGRESSION`}
      controlBlock={
        <SlabControl
          cfg={{
            accent,
            r1: accent, r2: accent, r3: palette.hue[0],
            count: forecastPeriods,
            countOptions: [4, 8, 12, 16, 24],
            onCount: (n) => setForecastPeriods(n),
            type: gran,
            typeOptions: ["WEEKLY", "MONTHLY"],
            onType: (t) => setGran(t as Gran),
            metric: m.label,
            metricOptions: Object.values(metricMap).map((x) => x.label),
            onMetric: (lbl) => {
              const key = (Object.keys(metricMap) as MetricKey[]).find((k) => metricMap[k].label === lbl)
              if (key) setMetric(key)
            },
          }}
        />
      }
      hovTitle={`FORECAST: ${m.label} (${forecastPeriods} ${periodLabel.toUpperCase()} HORIZON)`}
      stats={[
        { value: m.fmt(recentAvg), label: "RECENT AVG", bg: accent },
        { value: m.fmt(realFutureAvg), label: "REALISTIC", bg: palette.positive },
        { value: m.fmt(optFutureAvg), label: "OPTIMISTIC", bg: COLOR_OPT },
        { value: m.fmt(cauFutureAvg), label: "CAUTIOUS", bg: COLOR_CAU },
      ]}
      chartInsight={
        empty
          ? "Not enough history to fit a forecast — sync more videos to unlock the trajectory model."
          : `Realistic ${m.label.toLowerCase()} averages ${m.fmt(realFutureAvg)} per ${periodLabel} across the horizon.`
      }
      personalInsight="Toggle scenarios to compare — the shaded band shows the optimistic-to-cautious envelope."
      bodyBg="#0a0a0f"
      minHeight={380}
    >
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "3px solid #000", background: "#0a0a0f" }}>
        {(["TRAJECTORY", "GOALS"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              fontFamily: "monospace", fontWeight: 900, fontSize: 11, letterSpacing: "0.08em",
              padding: "10px 24px", border: "none", borderRight: "2px solid #000", cursor: "pointer",
              background: tab === t ? accent : "#0f0f14",
              color: tab === t ? "#000" : "#444",
            }}
          >
            {t === "TRAJECTORY" ? "📈 TRAJECTORY" : "🎯 GOAL PLANNER"}
          </button>
        ))}
      </div>

      {empty ? (
        <div style={{
          padding: "40px 20px", background: "#0a0a0f",
          fontFamily: "monospace", fontSize: 12, color: "#3a3a6a",
          textTransform: "uppercase", letterSpacing: "0.14em", textAlign: "center",
        }}>
          Need at least 2 {periodLabel}s of history — current: {historical.length}.
        </div>
      ) : tab === "TRAJECTORY" ? (
        <div style={{ background: "#0a0a0f" }}>
          <div style={{
            display: "flex", gap: 8, padding: "10px 16px",
            borderBottom: "2px solid #1a1a22", flexWrap: "wrap", alignItems: "center",
          }}>
            <span style={{ fontFamily: "monospace", fontSize: 8, color: "#444", marginRight: 4, letterSpacing: "0.1em" }}>SHOW:</span>
            <Chip label="HISTORICAL" color={accent}    active={showHist} onToggle={() => setShowHist((p) => !p)} />
            <Chip label="OPTIMISTIC" color={COLOR_OPT} active={showOpt}  onToggle={() => setShowOpt((p) => !p)} />
            <Chip label="REALISTIC"  color={realColor} active={showReal} onToggle={() => setShowReal((p) => !p)} />
            <Chip label="CAUTIOUS"   color={COLOR_CAU} active={showCau}  onToggle={() => setShowCau((p) => !p)} />
          </div>

          <div style={{ borderBottom: "2px solid #1a1a22" }}>
            <ForecastChart
              historical={historical} opt={opt} real={real} cau={cau}
              accentColor={accent} fmt={m.fmt} labels={labels}
              showHist={showHist} showOpt={showOpt} showReal={showReal} showCau={showCau}
            />
          </div>

          <div style={{ display: "flex", borderTop: "2px solid #1a1a22", background: "#0a0a0f", flexWrap: "wrap" }}>
            {[
              { label: "OPTIMISTIC", vals: opt,  color: COLOR_OPT, show: showOpt,  toggle: () => setShowOpt((p) => !p) },
              { label: "REALISTIC",  vals: real, color: realColor, show: showReal, toggle: () => setShowReal((p) => !p) },
              { label: "CAUTIOUS",   vals: cau,  color: COLOR_CAU, show: showCau,  toggle: () => setShowCau((p) => !p) },
            ].map((s, i) => {
              const endVal = s.vals[forecastPeriods - 1] ?? 0
              const avgVal = s.vals.length ? s.vals.reduce((a, b) => a + b, 0) / s.vals.length : 0
              const delta = avgVal - recentAvg
              return (
                <div
                  key={i}
                  onClick={s.toggle}
                  style={{
                    flex: 1, minWidth: 140, padding: "10px 16px",
                    borderRight: "2px solid #1a1a22",
                    background: s.show ? "#0d0d14" : "#080808",
                    cursor: "pointer", opacity: s.show ? 1 : 0.4,
                    transition: "all 0.15s",
                    display: "flex", flexDirection: "column", gap: 3,
                  }}
                >
                  <div style={{ fontFamily: "monospace", fontSize: 8, fontWeight: 900, color: s.show ? s.color : "#444", letterSpacing: "0.1em" }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 900, color: s.show ? s.color : "#333", lineHeight: 1 }}>
                    {m.fmt(endVal)}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 8, color: "#555" }}>
                    avg {m.fmt(avgVal)}
                    <span style={{ marginLeft: 6, color: delta >= 0 ? palette.positive : COLOR_CAU }}>
                      {delta >= 0 ? "▲" : "▼"}{m.fmt(Math.abs(delta))}
                    </span>
                  </div>
                </div>
              )
            })}
            {[
              { l: "RECENT AVG", v: `${m.fmt(recentAvg)} / ${periodLabel.slice(0, 1)}` },
              { l: "HORIZON",    v: `${forecastPeriods} ${periodLabel}s` },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "10px 16px",
                borderRight: i === 0 ? "2px solid #1a1a22" : "none",
                display: "flex", flexDirection: "column", gap: 3, justifyContent: "center",
              }}>
                <div style={{ fontFamily: "monospace", fontSize: 8, color: "#444" }}>{s.l}</div>
                <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 900, color: accent }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // ── GOALS tab ──
        <div style={{ background: "#0a0a0f" }}>
          <div style={{ padding: "18px 20px", borderBottom: "2px solid #1a1a22", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 8, color: "#555", marginBottom: 6, letterSpacing: "0.1em" }}>
                TARGET {m.label} / {periodLabel.toUpperCase()}
                {goalOverride === null && (
                  <span style={{ marginLeft: 8, color: "#666", fontStyle: "italic" }}>· smart default</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  onClick={() => adjGoal(-1)}
                  style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 16, padding: "8px 14px", border: `2px solid ${accent}`, borderRight: "none", background: "#0f0f1a", color: accent, cursor: "pointer" }}>
                  −
                </button>
                <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 22, padding: "8px 18px", border: `2px solid ${accent}`, background: "#0f0f1a", color: accent, minWidth: 140, textAlign: "center" }}>
                  {m.fmt(effectiveGoal)}
                </div>
                <button
                  onClick={() => adjGoal(1)}
                  style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 16, padding: "8px 14px", border: `2px solid ${accent}`, borderLeft: "none", background: "#0f0f1a", color: accent, cursor: "pointer" }}>
                  +
                </button>
                {goalOverride !== null && (
                  <button
                    onClick={() => setGoalOverride(null)}
                    style={{ marginLeft: 10, fontFamily: "monospace", fontSize: 8, padding: "6px 10px", border: "1px solid #333", background: "transparent", color: "#555", cursor: "pointer", borderRadius: 4 }}>
                    RESET
                  </button>
                )}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 8, color: "#444", marginTop: 4 }}>
                Based on realistic forecast: {m.fmt(realFutureAvg)} / {periodLabel}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 8, color: "#555", marginBottom: 6, letterSpacing: "0.1em" }}>DEADLINE</div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  onClick={() => setDeadline((d) => Math.max(1, d - 1))}
                  style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 16, padding: "8px 14px", border: "2px solid #333", borderRight: "none", background: "#0f0f1a", color: "#aaa", cursor: "pointer" }}>
                  −
                </button>
                <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 22, padding: "8px 18px", border: "2px solid #333", background: "#0f0f1a", color: "#fff", minWidth: 100, textAlign: "center" }}>
                  {deadline}
                </div>
                <button
                  onClick={() => setDeadline((d) => Math.min(forecastPeriods, d + 1))}
                  style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 16, padding: "8px 14px", border: "2px solid #333", borderLeft: "none", background: "#0f0f1a", color: "#aaa", cursor: "pointer" }}>
                  +
                </button>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#555", marginLeft: 10 }}>{periodLabel}s</span>
              </div>
            </div>
          </div>

          <div style={{ borderBottom: "2px solid #1a1a22" }}>
            <ForecastChart
              historical={historical} opt={opt} real={real} cau={cau}
              accentColor={accent} fmt={m.fmt} labels={labels}
              goalValue={effectiveGoal}
              showHist showOpt showReal showCau
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderBottom: "2px solid #000" }}>
            {[
              { label: "OPTIMISTIC", vals: opt,  color: COLOR_OPT, avg: optFutureAvg,  icon: "🚀" },
              { label: "REALISTIC",  vals: real, color: realColor, avg: realFutureAvg, icon: "📊" },
              { label: "CAUTIOUS",   vals: cau,  color: COLOR_CAU, avg: cauFutureAvg,  icon: "🛡️" },
            ].map((s, i) => {
              const hitsIn = periodsToHit(s.vals, effectiveGoal)
              const atDeadline = s.vals[deadline - 1] ?? 0
              const ahead = atDeadline >= effectiveGoal
              const pct = effectiveGoal > 0 ? Math.round((atDeadline / effectiveGoal) * 100) : 0
              const statusColor = ahead ? palette.positive : atDeadline >= effectiveGoal * 0.8 ? palette.accent : COLOR_CAU
              return (
                <div key={i} style={{ padding: 16, borderRight: i < 2 ? "2px solid #1a1a22" : "none", background: "#0d0d14" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 9, color: s.color, fontWeight: 900, marginBottom: 8, letterSpacing: "0.1em" }}>
                    {s.icon} {s.label}
                  </div>
                  <div style={{
                    display: "inline-block", background: statusColor, color: "#000",
                    fontFamily: "monospace", fontSize: 8, fontWeight: 900,
                    padding: "2px 8px", marginBottom: 10,
                  }}>
                    {ahead ? "✓ HITS GOAL" : pct >= 80 ? "CLOSE" : "BELOW"}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 900, color: s.color, marginBottom: 2 }}>
                    {m.fmt(atDeadline)}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 8, color: "#555", marginBottom: 10 }}>
                    at +{deadline} {periodLabel}s · {pct}% of goal
                  </div>
                  <div style={{ height: 8, background: "#1a1a22", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: s.color, borderRadius: 4, transition: "width 0.4s ease" }} />
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 8, color: "#555" }}>
                    {hitsIn
                      ? `Hits goal by +${hitsIn} ${periodLabel}s`
                      : `Doesn't reach ${m.fmt(effectiveGoal)} in ${forecastPeriods} ${periodLabel}s`}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: "flex", background: "#0a0a0f" }}>
            {[
              { l: "YOUR GOAL", v: `${m.fmt(effectiveGoal)} / ${periodLabel}`, color: palette.hue[0] },
              { l: "YOUR RECENT AVG", v: `${m.fmt(recentAvg)} / ${periodLabel}`, color: accent },
              { l: "GAP TO CLOSE", v: `${m.fmt(Math.max(0, effectiveGoal - recentAvg))} / ${periodLabel}`, color: recentAvg >= effectiveGoal ? palette.positive : COLOR_CAU },
            ].map((s, i) => (
              <div key={i} style={{ padding: "12px 20px", borderRight: "2px solid #1a1a22", flex: 1 }}>
                <div style={{ fontFamily: "monospace", fontSize: 8, color: "#444", marginBottom: 3 }}>{s.l}</div>
                <div style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 900, color: s.color }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartModule>
  )
}

export default TrajectoryForecasterModule
