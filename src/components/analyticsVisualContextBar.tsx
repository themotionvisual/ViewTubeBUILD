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
}

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

const statButtonClass = (clickable: boolean): string =>
  `h-full w-auto flex-none px-0 inline-flex flex-col items-stretch justify-start tabular-nums leading-none overflow-hidden transition-colors ${
    clickable ? "cursor-pointer hover:bg-gray-50" : "cursor-default"
  }`

const statButtonStyle = (item: AnalyticsVisualStat): React.CSSProperties => ({
  background: item.backgroundTone ?? "#EDEDED",
  minWidth: item.minWidth ?? (item.compact ? 68 : 76),
})

export const AnalyticsActiveStats: React.FC<{
  stats: readonly AnalyticsVisualStat[]
}> = ({ stats }) => (
  <div className="flex h-full items-stretch divide-x-[4px] divide-black">
    {stats.map((item, index) => {
      const label = item.labelText ?? item.label
      const resolvedTone = item.lockTone
        ? resolveAnalyticsMetricTone(label, item.tone ?? item.bg)
        : resolveAnalyticsMetricTone(label, item.tone ?? item.bg)

      return (
        <button
          key={`${item.label}-${index}`}
          onClick={item.onClick}
          disabled={!item.onClick}
          className={statButtonClass(Boolean(item.onClick))}
          style={statButtonStyle(item)}
        >
          <span
            className="inline-flex h-[55%] items-center justify-center whitespace-nowrap px-1 text-[13px] font-[900] leading-none tracking-[0] text-black"
            style={{ color: item.valueTone ?? "#000000" }}
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
