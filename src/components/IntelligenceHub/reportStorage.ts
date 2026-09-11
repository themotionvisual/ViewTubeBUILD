import type { IntelligenceReportGenerationRecord, UltimateChannelReport } from "./types"

export const ULTIMATE_REPORT_STORAGE_KEY = "vt_ultimate_channel_report_v1"
export const ULTIMATE_REPORT_HISTORY_KEY = "vt_ultimate_generation_history_v1"

type StorageReader = Pick<Storage, "getItem">

const parseReport = (raw: string | null): UltimateChannelReport | null => {
 if (!raw) return null
 try {
  const report = JSON.parse(raw) as UltimateChannelReport
  return report?.meta?.generationId ? report : null
 } catch {
  return null
 }
}

export const loadScopedIntelligenceReport = (
 storage: StorageReader,
 channelId: string | null,
): UltimateChannelReport | null => {
 if (!channelId) return null
 const scoped = parseReport(storage.getItem(`${ULTIMATE_REPORT_STORAGE_KEY}:${channelId}`))
 if (scoped?.meta.channelId === channelId) return scoped

 // Legacy unscoped data is safe only when its embedded identity matches.
 const legacy = parseReport(storage.getItem(ULTIMATE_REPORT_STORAGE_KEY))
 return legacy?.meta.channelId === channelId ? legacy : null
}

export const loadScopedIntelligenceHistory = (
 storage: StorageReader,
 channelId: string | null,
): IntelligenceReportGenerationRecord[] => {
 if (!channelId) return []
 try {
  const parsed = JSON.parse(storage.getItem(`${ULTIMATE_REPORT_HISTORY_KEY}:${channelId}`) || "[]")
  return Array.isArray(parsed)
   ? parsed.filter((entry) => entry?.report?.meta?.channelId === channelId)
   : []
 } catch {
  return []
 }
}
