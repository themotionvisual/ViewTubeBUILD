import { describe, expect, it } from "vitest"
import {
 loadScopedIntelligenceHistory,
 loadScopedIntelligenceReport,
 ULTIMATE_REPORT_HISTORY_KEY,
 ULTIMATE_REPORT_STORAGE_KEY,
} from "./reportStorage"

const report = (channelId: string | null, generationId = "generation-a") => ({ meta: { channelId, generationId } })
const storage = (values: Record<string, unknown>) => ({
 getItem: (key: string) => key in values ? JSON.stringify(values[key]) : null,
})

describe("scoped Intelligence Hub storage", () => {
 it("never returns another channel's scoped report", () => {
  const source = storage({ [`${ULTIMATE_REPORT_STORAGE_KEY}:channel-b`]: report("channel-a") })
  expect(loadScopedIntelligenceReport(source, "channel-b")).toBeNull()
 })

 it("accepts a legacy report only when its embedded channel matches", () => {
  expect(loadScopedIntelligenceReport(storage({ [ULTIMATE_REPORT_STORAGE_KEY]: report("channel-a") }), "channel-a"))
   .toMatchObject({ meta: { channelId: "channel-a" } })
  expect(loadScopedIntelligenceReport(storage({ [ULTIMATE_REPORT_STORAGE_KEY]: report("channel-a") }), "channel-b")).toBeNull()
 })

 it("does not load reports before a channel is resolved", () => {
  expect(loadScopedIntelligenceReport(storage({ [ULTIMATE_REPORT_STORAGE_KEY]: report(null) }), null)).toBeNull()
 })

 it("filters history entries that do not belong to the active channel", () => {
  const source = storage({
   [`${ULTIMATE_REPORT_HISTORY_KEY}:channel-a`]: [
    { report: report("channel-a", "one") },
    { report: report("channel-b", "two") },
   ],
  })
  expect(loadScopedIntelligenceHistory(source, "channel-a")).toHaveLength(1)
 })
})
