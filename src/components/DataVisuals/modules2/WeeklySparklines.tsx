/**
 * Weekly Channel Sparklines — Data Visuals 2 port of 37-WeeklySparklines.tsx.
 *
 * Layout, hover behavior, cumulative/delta modes, and the neo-brutalist shell
 * are preserved from the source. The one substantive change is data: instead
 * of the source's canned `CHANNEL_WEEKLY` array, the module rolls the active
 * VT-Sync snapshot into ISO-week buckets via `rollupWeeklyChannel`, so the six
 * sparklines reflect the user's real channel history.
 */

import { useMemo, useState } from "react"
import { BarChart3 } from "lucide-react"
import type { TubeExplorerVisualProps } from "../../TubeExplorerVisualModules"
import { ChartModule, SlabControl, type Stat } from "../ChartModule"
import { useVt2Theme } from "./theme"
import {
  describeWeeklySource,
  rollupWeeklyChannelWithSource,
  type Vt2WeeklyRow,
} from "./dataBridge"
import {
  VT_SPECTRUM_PALETTE_06,
  getVtVisualMetricColor,
} from "../../../styles/toolboxPalette"

const COUNTS = [4, 8, 12]
const METRICS = ["VIEWS", "SUBS", "REVENUE", "LIKES", "WATCH HRS", "IMPRESSIONS"] as const
const TYPES = ["WEEKLY", "CUMULATIVE", "DELTA"] as const

type MetricLabel = (typeof METRICS)[number]
type DisplayType = (typeof TYPES)[number]

type SparkDef = {
  key: keyof Omit<Vt2WeeklyRow, "week" | "date">
  label: MetricLabel
  color: string
  fmt: (v: number) => string
}

const compact = (v: number): string => {
  if (!Number.isFinite(v)) return "0"
  const abs = Math.abs(v)
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (abs >= 1_000) return `${(v / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return Math.round(v).toLocaleString()
}

const FMT: Record<MetricLabel, (v: number) => string> = {
  VIEWS: (v) => compact(v),
  SUBS: (v) => v.toLocaleString(),
  REVENUE: (v) => `$${v.toFixed(0)}`,
  LIKES: (v) => v.toLocaleString(),
  "WATCH HRS": (v) => `${v.toFixed(0)}h`,
  IMPRESSIONS: (v) => compact(v),
}

// Map each metric to a color from the 12-hue viewtubeX spectrum. Where the
// canonical metric palette (`VT_VISUAL_METRIC_COLORS`) already assigns a hue
// for a metric label we use it — so a metric never changes color between
// modules. IMPRESSIONS isn't in the canonical map so we fall through to the
// spectrum by index.
const colorForMetric = (label: string, spectrumIndex: number): string => {
  const brand = getVtVisualMetricColor(label)
  if (brand) return brand
  const len = VT_SPECTRUM_PALETTE_06.length
  return VT_SPECTRUM_PALETTE_06[((spectrumIndex % len) + len) % len]
}

const buildSparkDefs = (): SparkDef[] => [
  { key: "views",         label: "VIEWS",       color: VT_SPECTRUM_PALETTE_06[0], fmt: FMT.VIEWS },
  { key: "subs",          label: "SUBS",        color: VT_SPECTRUM_PALETTE_06[2], fmt: FMT.SUBS },
  { key: "revenue",       label: "REVENUE",     color: VT_SPECTRUM_PALETTE_06[4], fmt: FMT.REVENUE },
  { key: "likes",         label: "LIKES",       color: VT_SPECTRUM_PALETTE_06[7], fmt: FMT.LIKES },
  { key: "watchMins_hrs", label: "WATCH HRS",   color: VT_SPECTRUM_PALETTE_06[1], fmt: FMT["WATCH HRS"] },
  { key: "impressions",   label: "IMPRESSIONS", color: VT_SPECTRUM_PALETTE_06[11], fmt: FMT.IMPRESSIONS },
]

const projectWeeklyDisplay = (
  base: Vt2WeeklyRow[],
  display: DisplayType,
): Vt2WeeklyRow[] => {
  if (display === "WEEKLY" || base.length === 0) return base
  if (display === "CUMULATIVE") {
    const cum = { views: 0, subs: 0, revenue: 0, likes: 0, watchMins_hrs: 0, impressions: 0 }
    return base.map((row) => {
      cum.views += row.views
      cum.subs += row.subs
      cum.revenue += row.revenue
      cum.likes += row.likes
      cum.watchMins_hrs += row.watchMins_hrs
      cum.impressions += row.impressions
      return { ...row, ...cum }
    })
  }
  // DELTA — value − prev value; first week keeps its raw value.
  return base.map((row, i) => {
    if (i === 0) return { ...row }
    const prev = base[i - 1]
    return {
      ...row,
      views: row.views - prev.views,
      subs: row.subs - prev.subs,
      revenue: row.revenue - prev.revenue,
      likes: row.likes - prev.likes,
      watchMins_hrs: row.watchMins_hrs - prev.watchMins_hrs,
      impressions: row.impressions - prev.impressions,
    }
  })
}

function Sparkline({
  data, color, highlighted,
}: { data: number[]; color: string; highlighted: boolean }) {
  const min = Math.min(...data, 0)
  const max = Math.max(...data)
  // Larger viewBox + stretch-to-fill so the line uses the whole cell instead
  // of letterboxing into the top strip.
  const W = 200, H = 120
  const padL = 2, padR = 2, padT = 4, padB = 4
  const plotW = W - padL - padR, plotH = H - padT - padB
  const toX = (i: number) => padL + (i / Math.max(data.length - 1, 1)) * plotW
  const toY = (v: number) => padT + plotH - ((v - min) / (max - min || 1)) * plotH
  const pts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ")
  const areaD =
    `M ${toX(0)} ${toY(data[0] ?? 0)} ` +
    data.map((v, i) => `L ${toX(i)} ${toY(v)}`).join(" ") +
    ` L ${toX(data.length - 1)} ${padT + plotH} L ${toX(0)} ${padT + plotH} Z`

  const gradId = `sg_${color.replace("#", "")}`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.04" />
        </linearGradient>
      </defs>
      {/* Zero line if the series dips below zero (DELTA mode) */}
      {min < 0 && (
        <line x1={padL} y1={toY(0)} x2={padL + plotW} y2={toY(0)} stroke="#ccc" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
      )}
      <path d={areaD} fill={`url(#${gradId})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={highlighted ? 2.5 : 1.5}
        vectorEffect="non-scaling-stroke"
      />
      {/* Last-value dot — keep circular by disabling stretch on the marker */}
      <circle
        cx={toX(data.length - 1)}
        cy={toY(data[data.length - 1] ?? 0)}
        r={3}
        fill={color}
        vectorEffect="non-scaling-stroke"
      />
      {/* Tick marks */}
      {data.map((_, i) => (
        <line
          key={i}
          x1={toX(i)}
          y1={padT + plotH - 2}
          x2={toX(i)}
          y2={padT + plotH + 1}
          stroke={color}
          strokeWidth="0.8"
          opacity={0.5}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}

/** Compact date label like "Aug 12" from an ISO YYYY-MM-DD week-start key. */
function fmtWeekDate(iso: string): string {
  const parsed = new Date(iso)
  if (!Number.isFinite(parsed.getTime())) return iso
  const month = parsed.toLocaleString(undefined, { month: "short", timeZone: "UTC" })
  return `${month} ${parsed.getUTCDate()}`
}

export const WeeklySparklinesModule: React.FC<TubeExplorerVisualProps> = ({
  data, trafficByDay, dailyMetrics, channelSummary,
}) => {
  const { palette } = useVt2Theme()
  const [count, setCount] = useState<number>(12)
  const [metric, setMetric] = useState<MetricLabel>("VIEWS")
  const [displayType, setDisplayType] = useState<DisplayType>("WEEKLY")
  const [hovSpark, setHovSpark] = useState<MetricLabel | null>(null)
  const [hovWeek, setHovWeek] = useState<number | null>(null)

  const sparkDefs = useMemo(() => buildSparkDefs(), [])

  const rollup = useMemo(
    () => rollupWeeklyChannelWithSource(data, dailyMetrics ?? [], trafficByDay ?? [], count),
    [data, dailyMetrics, trafficByDay, count],
  )
  const weeklyBase = rollup.weeks
  const weekly = useMemo(
    () => projectWeeklyDisplay(weeklyBase, displayType),
    [weeklyBase, displayType],
  )
  const sourceLabel = describeWeeklySource(rollup.source)

  const highlightedDef = sparkDefs.find((d) => d.label === metric)
  const hovWeekData = hovWeek !== null ? weekly[hovWeek] : null

  // Window totals — kept as a fallback for the no-hover stats when the
  // channel-wide totals aren't available.
  const totals = useMemo(() => weekly.reduce(
    (acc, w) => ({
      views: acc.views + w.views,
      subs: acc.subs + w.subs,
      revenue: acc.revenue + w.revenue,
      likes: acc.likes + w.likes,
      watchHrs: acc.watchHrs + w.watchMins_hrs,
      impressions: acc.impressions + w.impressions,
    }),
    { views: 0, subs: 0, revenue: 0, likes: 0, watchHrs: 0, impressions: 0 },
  ), [weekly])

  // Channel-wide "totals" the user actually cares about: current subscriber
  // count and lifetime revenue/views. Fall back to the window sum when a
  // lifetime figure isn't in the snapshot.
  const channelViews = channelSummary?.lifetimeViews ?? totals.views
  const channelSubs = channelSummary?.subscriberCount ?? totals.subs
  const channelRevenue = channelSummary?.lifetimeRevenue ?? totals.revenue
  const channelVideos = channelSummary?.videoCount ?? null

  const firstDate = weekly[0]?.date ?? ""
  const lastDate = weekly[weekly.length - 1]?.date ?? ""
  const rangeLabel =
    weekly.length === 0 ? "" : `${fmtWeekDate(firstDate)} → ${fmtWeekDate(lastDate)}`

  // Bind stat backgrounds to the same 12-color metric palette used by the
  // sparklines so a metric wears the same hue across the whole module.
  const viewsBg = VT_SPECTRUM_PALETTE_06[0]
  const subsBg = VT_SPECTRUM_PALETTE_06[2]
  const revenueBg = VT_SPECTRUM_PALETTE_06[4]
  const windowBg = VT_SPECTRUM_PALETTE_06[1]

  const stats: Stat[] = hovWeekData
    ? [
      { value: compact(hovWeekData.views), label: "VIEWS", bg: viewsBg },
      { value: hovWeekData.subs.toLocaleString(), label: "SUBS", bg: subsBg },
      { value: `$${hovWeekData.revenue.toFixed(0)}`, label: "REVENUE", bg: revenueBg },
      { value: `Wk ${hovWeekData.week}`, label: "WEEK", bg: windowBg },
    ]
    : [
      // Channel totals — subscribers are the live count, views/revenue are
      // lifetime, video count anchors the fourth cell.
      { value: compact(channelViews),   label: "LIFETIME VIEWS", bg: viewsBg },
      { value: channelSubs.toLocaleString(), label: "SUBSCRIBERS",    bg: subsBg },
      { value: `$${channelRevenue.toFixed(0)}`, label: "LIFETIME REV", bg: revenueBg },
      { value: channelVideos !== null ? channelVideos.toLocaleString() : `${weekly.length} WK`, label: channelVideos !== null ? "VIDEOS" : "WINDOW", bg: windowBg },
    ]

  // Empty-state footer text so the module keeps its shell even with no data.
  const emptyState = weekly.length === 0

  return (
    <ChartModule
      icon={<BarChart3 size={44} strokeWidth={2.5} />}
      iconBg={palette.iconBg}
      titleBg={palette.titleBg}
      bodyBg={palette.bodyBg}
      title="Weekly Channel Sparklines"
      subtitle={
        weekly.length > 0
          ? `MOST RECENT ${weekly.length} WEEKS · ${rangeLabel} · SOURCE: ${sourceLabel} · ${displayType} MODE`
          : `NO WEEKLY DATA · ${displayType} MODE`
      }
      controlBlock={
        <SlabControl
          cfg={{
            accent: palette.accent,
            count,
            countOptions: COUNTS,
            onCount: setCount,
            metric,
            metricOptions: [...METRICS],
            onMetric: (m) => setMetric(m as MetricLabel),
            type: displayType,
            typeOptions: [...TYPES],
            onType: (t) => setDisplayType(t as DisplayType),
          }}
        />
      }
      hovTitle={
        hovWeekData
          ? `Week ${hovWeekData.week} — ${hovWeekData.date}`
          : weekly.length > 0
            ? `CHANNEL TOTALS · ${weekly.length}-WEEK SPARK WINDOW · ${rangeLabel}`
            : undefined
      }
      stats={stats}
      legendLeft={
        <>
          <span
            style={{
              background: highlightedDef?.color || palette.accent,
              display: "inline-block",
              width: 12,
              height: 12,
              marginRight: 6,
              verticalAlign: "middle",
            }}
          />
          <b style={{ fontFamily: "monospace", fontSize: 10 }}>BOLD = {metric}</b>
        </>
      }
      legendCenter={<>ALL 6 METRICS · CLICK A SPARKLINE TO HIGHLIGHT · {displayType} VALUES</>}
      chartInsight="Weekly channel sparklines rolled from the active VT-Sync snapshot — six metrics as small multiples."
      personalInsight={
        emptyState
          ? "No weekly data yet — sync or import Annalytics tables to populate this module."
          : `Peak ${metric.toLowerCase()} across the last ${weekly.length} weeks anchors the timeline; hover a spark to compare weeks.`
      }
    >
      {emptyState ? (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "monospace", fontSize: 12, letterSpacing: "0.14em", color: "#666", textTransform: "uppercase",
        }}>
          No weekly data available
        </div>
      ) : (
        <div style={{
          position: "absolute", inset: 0,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gap: 0,
        }}>
          {sparkDefs.map((def) => {
            const vals = weekly.map((w) => w[def.key])
            const isHighlighted = def.label === metric || hovSpark === def.label
            const lastVal = vals[vals.length - 1] ?? 0
            return (
              <div
                key={def.key}
                onMouseEnter={() => setHovSpark(def.label)}
                onMouseLeave={() => setHovSpark(null)}
                onClick={() => setMetric(def.label)}
                style={{
                  border: "1px solid #eee",
                  padding: "4px 8px 2px",
                  position: "relative",
                  cursor: "pointer",
                  background: isHighlighted ? `${def.color}0d` : "#fff",
                  transition: "background 0.15s",
                  // Flex column so the sparkline strip absorbs all remaining
                  // height instead of sitting in a fixed 70px slot.
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  overflow: "hidden",
                }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  flexShrink: 0,
                }}>
                  <div style={{
                    fontFamily: "monospace", fontWeight: 900, fontSize: 9, color: def.color, letterSpacing: "0.05em",
                  }}>
                    {def.label}
                  </div>
                  <div style={{
                    fontFamily: "monospace", fontWeight: 900, fontSize: 11, color: "#0a0a0a",
                  }}>
                    {def.fmt(lastVal)}
                  </div>
                </div>
                <div
                  style={{
                    // Fill the remainder of the cell — this is the change
                    // that lets the sparkline actually breathe.
                    flex: 1,
                    position: "relative",
                    minHeight: 0,
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = e.clientX - rect.left
                    const idx = Math.round((x / rect.width) * (weekly.length - 1))
                    setHovWeek(Math.max(0, Math.min(idx, weekly.length - 1)))
                  }}
                  onMouseLeave={() => setHovWeek(null)}
                >
                  <Sparkline data={vals} color={def.color} highlighted={isHighlighted} />
                  {hovWeek !== null && hovSpark === def.label && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: `${(hovWeek / Math.max(weekly.length - 1, 1)) * 100}%`,
                        bottom: 0,
                        width: 1,
                        background: def.color,
                        opacity: 0.6,
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontFamily: "monospace", fontSize: 8, color: "#666", marginTop: 2, flexShrink: 0,
                  letterSpacing: "0.02em",
                }}>
                  <span>{fmtWeekDate(firstDate)}</span>
                  <span>{fmtWeekDate(lastDate)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ChartModule>
  )
}

export default WeeklySparklinesModule
