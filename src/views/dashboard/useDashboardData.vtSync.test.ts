import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const source = readFileSync(new URL("./useDashboardData.ts", import.meta.url), "utf8")

describe("Dashboard VT-SYNC checkpoints", () => {
 it("subscribes to live snapshot commits and prioritizes lifetime channel totals", () => {
  expect(source).toContain("useSyncExternalStore(")
  expect(source).toContain("subscribeToVtSyncSnapshot")
  expect(source).toContain("vtSyncSnapshot.channelTotals?.lifetime")
  expect(source).toContain('vtSyncLifetimeMetric("views")')
  expect(source).toContain('vtSyncLifetimeMetric("watchTime", "watchHours")')
  expect(source).toContain('vtSyncLifetimeMetric("revenue", "estimatedRevenue")')
 })
})
