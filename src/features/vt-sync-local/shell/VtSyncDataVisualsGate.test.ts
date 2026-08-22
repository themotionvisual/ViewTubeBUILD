import fs from "node:fs"
import { describe, expect, it } from "vitest"

const gateSource = fs.readFileSync(
 new URL("./VtSyncDataVisualsGate.tsx", import.meta.url),
 "utf8",
)
const pageSource = fs.readFileSync(
 new URL("./VtSyncLocalAnalyticsPage.tsx", import.meta.url),
 "utf8",
)

describe("VT-SYNC visual loading boundary", () => {
 it("loads heavy visual modules only after a toolbox is opened", () => {
  expect(gateSource).toContain('lazy(() => import("./VtSyncDataVisualsToolbox")')
  expect(gateSource).toContain("{isOpen1 ? (")
  expect(gateSource).toContain("{isOpen2 ? (")
  expect(pageSource).toContain("<VtSyncDataVisualsGate snapshot={consumerSnapshot} />")
  expect(pageSource).not.toContain('import("./VtSyncDataVisualsToolbox")')
 })
})
