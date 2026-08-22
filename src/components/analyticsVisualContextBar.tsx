import React from "react"
import { getVtVisualMetricColor } from "../styles/toolboxPalette"

export const ANALYTICS_VISUAL_CONTEXT_BAR_HEIGHTS = {
  standard: 32,
  expanded: 48,
} as const

export type AnalyticsVisualContextBarHeight = "standard" | "expanded" | "none"

type Tone = "pink" | "cyan" | "lime" | "yellow" | "purple" | "orange" | "white"

export interface AnalyticsVisualStat {
  label: string
  value: string
  tone?: Tone | string
  bg?: string
  color?: string
  valueTone?: string
  backgroundTone?: string
  labelText?: string
  labelClassName?: string
  onClick?: () => void
  isActive?: boolean
  lockTone?: boolean
  compact?: boolean
  minWidth?: number
}

export interface AnalyticsVisualContextBarConfig {
  height?: AnalyticsVisualContextBarHeight
  minHeight?: number
  /**
   * When true, every stat in this bar renders with the "dark canvas" treatment:
   * a near-black (#080816) value-zone fill and the metric's resolved brand color
   * as the number's foreground. Use on any visual whose preview canvas is dark
   * so the subtitle stat row matches the canvas instead of a light gray card.
   *
   * The Heat Matrix look. Applied uniformly wherever the flag is set — a stat
   * can still override `backgroundTone`/`valueTone` per-item to opt out.
   */
  darkStats?: boolean
}

/**
 * Near-black fill used by every dark-canvas visual's stat cards. Matches the
 * Heat Matrix canvas so the subtitle row reads as part of the same surface.
 */
export const ANALYTICS_DARK_STATS_BACKGROUND = "#080816"

/**
 * Foreground used when the stat's label doesn't resolve to a known metric
 * color (e.g. "SLOT", "TOP SLOT"): keeps the number legible without borrowing
 * an unrelated brand hue.
 */
export const ANALYTICS_DARK_STATS_NEUTRAL_VALUE = "#F3F4F6"

const TONE_HEX: Record<Tone, string> = {
  pink: "#FF7497",
  cyan: "#00CCFF",
  lime: "#CCFF00",
  yellow: "#FFEA00",
  purple: "#B14AED",
  orange: "#FFB158",
  white: "#FFFFFF",
}

const EXTRA_METRIC_ALIASES: Record<string, string> = {
  "WATCH HRS": "watchTime",
  "WATCH HR": "watchTime",
  "WATCH": "watchTime",
  "SUB": "subscribers",
  "SUBS": "subscribers",
  "SUBSCRIPTIONS": "subscribers",
  "ENG": "engagedViews",
  "ENGAGED": "engagedViews",
  "ENG VIEWS": "engagedViews",
  "REV": "revenue",
  "EST REV": "revenue",
  "CMTS": "comments",
  "CMNTS": "comments",
  "SAVES": "playlistSaves",
  "PLAYLIST SAVE": "playlistSaves",
  "AVG VIEWED": "avp",
  "AVG % VIEWED": "avp",
  "AVG VIEW DUR": "avd",
  "AVG VIEW DURATION": "avd",
}

export const normalizeAnalyticsStatLabel = (label: string): string => {
  const normalized = label.trim().toUpperCase()
  if (normalized.includes("IMPRESSION")) return "IMPRSNS"
  if (normalized === "SUBS" || normalized === "SUBSCRIPTIONS") return "SUBSCRIBERS"
  return label
}

const normalizeMetricLookup = (label: string): string =>
  label
    .trim()
    .toUpperCase()
    .replace(/[._/]+/g, " ")
    .replace(/\s+/g, " ")

const fallbackToneToHex = (fallback?: string): string | undefined => {
  if (!fallback) return undefined
  if (fallback.startsWith("#")) return fallback
  return TONE_HEX[fallback as Tone]
}

export const resolveAnalyticsMetricTone = (label: string, fallback?: string): string | undefined => {
  const direct = getVtVisualMetricColor(label)
  if (direct) return direct

  const alias = EXTRA_METRIC_ALIASES[normalizeMetricLookup(label)]
  if (alias) return getVtVisualMetricColor(alias) ?? fallbackToneToHex(fallback)

  return fallbackToneToHex(fallback)
}

export const resolveAnalyticsVisualContextBarHeight = (
  activeContext?: AnalyticsVisualContextBarConfig | null,
): number | undefined => {
  if (activeContext?.height === "none") return undefined
  if (activeContext?.height === "expanded") return ANALYTICS_VISUAL_CONTEXT_BAR_HEIGHTS.expanded
  return ANALYTICS_VISUAL_CONTEXT_BAR_HEIGHTS.standard
}

const statButtonClass = (clickable: boolean, dark: boolean): string =>
  `h-full w-auto flex-none px-0 inline-flex flex-col items-stretch justify-start tabular-nums leading-none overflow-hidden transition-colors ${
    clickable
      ? (dark ? "cursor-pointer hover:brightness-125" : "cursor-pointer hover:bg-gray-50")
      : "cursor-default"
  }`

const statButtonStyle = (
  item: AnalyticsVisualStat,
  dark: boolean,
): React.CSSProperties => ({
  background: item.backgroundTone ?? (dark ? ANALYTICS_DARK_STATS_BACKGROUND : "#EDEDED"),
  minWidth: item.minWidth ?? (item.compact ? 68 : 76),
})

export const resolveAnalyticsStatValueColor = (
  item: AnalyticsVisualStat,
  dark: boolean,
  resolvedTone: string | undefined,
): string => {
  // Per-item override always wins so opt-outs stay possible.
  if (item.valueTone) return item.valueTone
  if (!dark) return "#000000"
  // On dark rows the number takes the metric's brand color; unresolved
  // labels fall back to a light neutral so they stay readable.
  return resolvedTone ?? ANALYTICS_DARK_STATS_NEUTRAL_VALUE
}

export const AnalyticsActiveStats: React.FC<{
  stats: readonly AnalyticsVisualStat[]
  darkStats?: boolean
}> = ({ stats, darkStats = false }) => (
  <div className="flex h-full items-stretch divide-x-[4px] divide-black">
    {stats.map((item, index) => {
      const label = item.labelText ?? item.label
      const resolvedTone = resolveAnalyticsMetricTone(label, item.tone ?? item.bg)
      const valueColor = resolveAnalyticsStatValueColor(item, darkStats, resolvedTone)

      return (
        <button
          key={`${item.label}-${index}`}
          onClick={item.onClick}
          disabled={!item.onClick}
          className={statButtonClass(Boolean(item.onClick), darkStats)}
          style={statButtonStyle(item, darkStats)}
        >
          <span
            className="inline-flex h-[55%] items-center justify-center whitespace-nowrap px-1 text-[13px] font-[900] leading-none tracking-[0]"
            style={{ color: valueColor }}
          >
            {item.value}
          </span>
          <span
            className={`inline-flex h-[45%] w-full items-center justify-center text-[11px] font-[1000] uppercase tracking-[0] text-black ${item.labelClassName ?? "whitespace-nowrap"}`}
            style={{ background: resolvedTone ?? "#E5E7EB", color: item.color ?? "#000000" }}
          >
            {normalizeAnalyticsStatLabel(label)}
          </span>
        </button>
      )
    })}
  </div>
)
