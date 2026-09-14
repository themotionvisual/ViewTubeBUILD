import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { buildCanonicalActionDefinitions } from "./actions"
import { ANALYTICS_WINDOWS } from "../analytics/windows"

const actionSource = readFileSync(new URL("./actions.ts", import.meta.url), "utf8")
const repositorySource = readFileSync(new URL("./repository.ts", import.meta.url), "utf8")

describe("canonical action window options", () => {
 const definitions = buildCanonicalActionDefinitions(null)

 it("declares narrower support only where the limit is real", () => {
  const cohorts = definitions.find((entry) => entry.id === "viewer_cohorts")
  // The Analytics API has no cohort metrics beyond 90d.
  expect(cohorts?.supportedWindows).toEqual(["7d", "28d", "90d"])

  const daily = definitions.find((entry) => entry.id === "daily_metrics")
  // Day-grained: windows are derived from stored history, not fetched.
  expect(daily?.supportedWindows).toEqual(["lifetime"])
 })

 it("leaves families with full support undeclared, meaning all windows", () => {
  const geography = definitions.find((entry) => entry.id === "geography")
  expect(geography?.supportedWindows).toBeUndefined()
 })

 it("accepts a window list and forwards it to each family runner", () => {
  expect(actionSource).toContain("windows: AnalyticsWindow[] = ANALYTICS_WINDOWS")
  expect(actionSource).toContain("runCanonicalGeographySync(windows)")
  expect(actionSource).toContain("runCanonicalRevenueSync(windows)")
  expect(actionSource).toContain("runCanonicalPlaylistSync(windows)")
  expect(actionSource).toContain("runCanonicalRetentionSync(undefined, windows)")
 })
})

describe("canonical repository window threading", () => {
 it("passes the requested windows into the module syncs", () => {
  expect(repositorySource).toContain("syncGeographyRows(channel.channelId, inventory, syncRun.id, windows)")
  expect(repositorySource).toContain("syncRevenueMetrics(channel.channelId, inventory, syncRun.id, windows)")
  expect(repositorySource).toContain("syncVideoMetrics(channel.channelId, inventory.records, syncRun.id, windows)")
 })

 it("intersects cohort windows rather than forwarding unsupported ones", () => {
  // Forwarding 365d would make the module emit window_not_supported rows for a
  // window nobody meaningfully asked cohorts for.
  expect(repositorySource).toContain("const cohortWindowsFrom = (windows: AnalyticsWindow[]): AnalyticsWindow[] =>")
  expect(repositorySource).toContain("cohortWindowsFrom(windows)")
 })

 it("records the windows a run actually requested", () => {
  expect(repositorySource).toContain('buildFamilySyncRun("pending", windows, {')
 })

 it("keeps every canonical window reachable through the action layer", () => {
  ANALYTICS_WINDOWS.forEach((window) => {
   expect(typeof window).toBe("string")
  })
  expect(ANALYTICS_WINDOWS).toHaveLength(5)
 })
})
