import type { ChannelOracleInput, ChannelOraclePromptVersion } from "../types"
import { CHANNEL_ORACLE_PROMPT_VERSION as PROMPT_VERSION } from "./prompts"

export const CHANNEL_ORACLE_PROMPT_VERSION: ChannelOraclePromptVersion =
 PROMPT_VERSION

const toNumber = (value: unknown): number => {
 if (typeof value === "number" && Number.isFinite(value)) return value
 if (typeof value === "string") {
  const parsed = Number(value.replace(/,/g, "").replace(/%/g, "").trim())
  if (Number.isFinite(parsed)) return parsed
 }
 return 0
}

const clamp = (value: number, min: number, max: number): number =>
 Math.min(max, Math.max(min, value))

const coerceViewRow = (row: Record<string, unknown>): Record<string, unknown> => {
 const rawCtr =
  toNumber(row["Click-Through Rate (CTR)"]) ||
  toNumber(row["CTR (%)"]) ||
  toNumber(row["ctr"])
 const rawAvp =
  toNumber(row["AVP (%)"]) ||
  toNumber(row["Average percentage viewed (%)"]) ||
  toNumber(row["averageViewPercentage"])

 return {
  ...row,
  "Click-Through Rate (CTR)": clamp(rawCtr, 0, 100),
  "AVP (%)": clamp(rawAvp, 0, 200),
 }
}

export const buildChannelOracleInput = ({
 analyticsWindow,
 fullChannelStats,
 trafficSources,
 geography,
 demographics,
 dailyMetrics,
 topVideos,
}: {
 analyticsWindow: "7d" | "28d" | "90d" | "365d" | "lifetime"
 fullChannelStats: {
  views: number
  watchHours: number
  subscribers: number
  revenue: number
  rpm: number
  ctr: number
 }
 trafficSources?: unknown
 geography?: unknown
 demographics?: unknown
 dailyMetrics?: unknown
 topVideos: Array<Record<string, unknown>>
}): ChannelOracleInput => ({
 schemaVersion: "channel_oracle_input_v1",
 analyticsWindow,
 generatedAt: new Date().toISOString(),
 fullChannelStats: {
  views: Math.max(0, fullChannelStats.views || 0),
  watchHours: Math.max(0, fullChannelStats.watchHours || 0),
  subscribers: fullChannelStats.subscribers || 0,
  revenue: Math.max(0, fullChannelStats.revenue || 0),
  rpm: Math.max(0, fullChannelStats.rpm || 0),
  ctr: clamp(fullChannelStats.ctr || 0, 0, 100),
 },
 channelLevel: {
  trafficSources: trafficSources || null,
  geography: geography || null,
  demographics: demographics || null,
  dailyMetrics: dailyMetrics || null,
 },
 topVideos: topVideos.map(coerceViewRow),
})

export const buildChannelOracleSystemPrompt = (
 oracleInput: ChannelOracleInput,
): string => {
 return [
  "You are The Channel Analysis Oracle for ViewTube.",
  "Use CHANNEL_ORACLE_INPUT as first-class context and CSV as per-video evidence.",
  "Honor numeric safety rules: null-safe math, CTR range 0-100, AVP range 0-200.",
  "Do not infer missing keys. Use null-safe fallbacks.",
  "Keep the response strictly valid JSON matching requested schema.",
  `CHANNEL_ORACLE_PROMPT_VERSION: ${CHANNEL_ORACLE_PROMPT_VERSION}`,
  "CHANNEL_ORACLE_INPUT:",
  JSON.stringify(oracleInput),
 ].join("\n\n")
}
