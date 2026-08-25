import fs from "node:fs"
import { describe, expect, it } from "vitest"

const gateSource = fs.readFileSync(new URL("./VtSyncIntelligenceHubGate.tsx", import.meta.url), "utf8")
const pageSource = fs.readFileSync(new URL("./VtSyncLocalAnalyticsPage.tsx", import.meta.url), "utf8")
const performanceSource = fs.readFileSync(new URL("../../../views/PerformanceHub.tsx", import.meta.url), "utf8")
const reportSource = fs.readFileSync(new URL("../../../components/IntelligenceHub/ultimateReport.ts", import.meta.url), "utf8")

describe("VT-SYNC Intelligence Hub migration boundary", () => {
 it("lazy-loads and unmounts the Intelligence Hub while closed", () => {
  expect(gateSource).toContain('lazy(() => import("../../../components/IntelligenceHub/IntelligenceHub"))')
  expect(gateSource).toContain("unmountWhenClosed")
  expect(gateSource).toContain("{isOpen ? (")
 })

 it("mounts the Intelligence Hub between the table and Data Visuals", () => {
  const tableIndex = pageSource.indexOf("<VtSyncToolboxDataTable")
  const intelligenceIndex = pageSource.indexOf("<VtSyncIntelligenceHubGate")
  const visualsIndex = pageSource.indexOf("<VtSyncDataVisualsGate")
  expect(tableIndex).toBeGreaterThan(-1)
  expect(intelligenceIndex).toBeGreaterThan(tableIndex)
  expect(visualsIndex).toBeGreaterThan(intelligenceIndex)
 })

 it("removes duplicate Performance Hub generation and legacy analytics reads", () => {
  expect(performanceSource).not.toContain("IntelligenceReportGenerator")
  expect(performanceSource).toContain('/analytics#intelligence')
  expect(reportSource).not.toContain("services/analytics/Selectors")
  expect(reportSource).not.toContain('localStorage.getItem("yt_analytics_cache")')
 })
})
