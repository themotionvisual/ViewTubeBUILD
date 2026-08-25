import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const persistence = vi.hoisted(() => ({
 getBrainSchemaDB: vi.fn(),
 saveBrainSchemaDB: vi.fn(),
 addBrainSignalDB: vi.fn(),
 getBrainSignalsDB: vi.fn(),
 clearBrainSignalsDB: vi.fn(),
}))

vi.mock("./Persistence", () => persistence)
vi.mock("../keyVault", () => ({ getVaultKey: vi.fn(() => "configured-test-key") }))

import { emitSignal, initializeBrain } from "./Core"

describe("Brain reflection scheduling", () => {
 beforeEach(async () => {
  vi.useFakeTimers()
  vi.stubGlobal("window", {})
  vi.stubGlobal("localStorage", { getItem: vi.fn(() => null) })
  vi.clearAllMocks()
  persistence.getBrainSchemaDB.mockResolvedValue({
   identityAndAspirations: "Creator",
   contentDNA: "Visual essays",
   performanceLedger: "Canonical analytics",
   futureStateMap: "Grow sustainably",
   interactionCount: 5,
   lastReflection: Date.now(),
   tools: [],
  })
  persistence.saveBrainSchemaDB.mockResolvedValue(undefined)
  persistence.addBrainSignalDB.mockResolvedValue(undefined)
  await initializeBrain()
 })

 afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
 })

 it("coalesces repeated signals into one pending reflection", async () => {
  await Promise.all([
   emitSignal("intelligence-hub", "REPORT_STARTED", {}),
   emitSignal("intelligence-hub", "REPORT_PROGRESS", {}),
   emitSignal("intelligence-hub", "REPORT_COMPLETED", {}),
  ])

  expect(vi.getTimerCount()).toBe(1)
 })
})
