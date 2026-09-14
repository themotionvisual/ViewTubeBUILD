import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"

const source = readFileSync(
 new URL("./SyncCoordinator.ts", import.meta.url),
 "utf8",
)
const controlsSource = readFileSync(
 new URL("../views/components/ChannelDataSyncControls.tsx", import.meta.url),
 "utf8",
)

describe("SyncCoordinator segment windows", () => {
 it("commits each segment report under its real window", () => {
  // This previously hardcoded window: "lifetime" on every segment ledger entry.
  expect(source).toContain("window: AnalyticsWindow = \"lifetime\",")
  expect(source).not.toMatch(/payload: report,\s*\n\s*window: "lifetime",/)
 })

 it("keeps the flat cache key lifetime-only", () => {
  // Master tables read the flat key as all-time; a windowed report written
  // there would be relabelled as lifetime.
  expect(source).toContain('if (window === "lifetime") cacheData[cacheKey] = report')
 })

 it("runs lifetime plus any requested extra windows", () => {
  expect(source).toContain("const segmentWindows: AnalyticsWindow[] = [")
  expect(source).toContain("for (const segmentWindow of segmentWindows) {")
 })

 it("uses each window's own date range", () => {
  expect(source).toContain("const segmentRange = windowRanges[segmentWindow] || { startDate, endDate }")
 })

 it("defaults to a single lifetime pass when no windows are requested", () => {
  expect(source).toContain('...(options?.windows || []).filter((window: AnalyticsWindow) => window !== "lifetime"),')
 })
})

describe("ChannelDataSyncControls window options", () => {
 it("offers the canonical windows rather than a hand-written list", () => {
  expect(controlsSource).toContain("ANALYTICS_WINDOWS.map((window) =>")
  expect(controlsSource).toContain("WINDOW_SHORT_LABELS[window]")
 })

 it("starts lifetime-only so the control cannot raise cost on its own", () => {
  expect(controlsSource).toContain('React.useState<AnalyticsWindow[]>(["lifetime"])')
 })

 it("keeps lifetime locked on", () => {
  expect(controlsSource).toContain('if (window === "lifetime") return')
 })

 it("passes the selection into the sync call", () => {
  expect(controlsSource).toContain("windows,")
 })
})
