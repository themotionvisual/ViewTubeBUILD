import { beforeEach, describe, expect, it, vi } from "vitest"
const mocks = vi.hoisted(() => ({
 controls: vi.fn(), engines: vi.fn(), snapshot: vi.fn(), privacy: vi.fn(), scan: vi.fn(), build: vi.fn(),
}))
vi.mock("../BrainUserControls", () => ({ readBrainUserControls: mocks.controls, canBrainUseCapability: (c: { allowAnalytics: boolean }) => c.allowAnalytics }))
vi.mock("../BrainEngineControls", () => ({ readBrainEngineControls: mocks.engines }))
vi.mock("../../../features/vt-sync-local", () => ({ getVtSyncSnapshot: mocks.snapshot, applyVtSyncPrivacyFilters: mocks.privacy }))
vi.mock("../../anomaly-intelligence/service", () => ({ scanCanonicalSnapshotForAnomalies: mocks.scan }))
vi.mock("../AlgorithmIntelligenceOrchestrator", () => ({ buildAlgorithmIntelligencePortfolio: mocks.build }))
vi.mock("../AlgorithmWorkflowRecipes", () => ({ createAlgorithmRecommendationHandoff: vi.fn() }))
vi.mock("../AlgorithmPrimingWorkflow", () => ({ createPrimingStepHandoff: vi.fn() }))
import { readAlgorithmIntelligenceForBrain } from "../AlgorithmIntelligenceAccess"

describe("Algorithm evidence privacy", () => {
 beforeEach(() => {
  vi.clearAllMocks()
  mocks.controls.mockReturnValue({ enabled: true, allowAnalytics: true })
  mocks.engines.mockReturnValue({ anomalyIntelligence: true, anomalyMinimumImpact: .55, anomalyMinimumConfidence: .6 })
  mocks.snapshot.mockReturnValue({ channelId: "a" })
  mocks.privacy.mockReturnValue({ channelId: "a", filtered: true })
  mocks.scan.mockReturnValue([{ id: "signal", channelId: "a", evidence: [{ id: "ref" }] }])
  mocks.build.mockResolvedValue({})
 })
 it("filters privacy before scanning and preserves evidence IDs and score units", async () => {
  await readAlgorithmIntelligenceForBrain({ channelId: "a", includeAnomalies: true })
  expect(mocks.scan).toHaveBeenCalledWith({ channelId: "a", filtered: true })
  expect(mocks.build.mock.calls[0][0]).toMatchObject({ anomalies: [{ channelId: "a", evidenceIds: ["ref"] }], anomalyThresholds: { minimumImpact: 55, minimumConfidence: 60 } })
 })
 it.each([null, "b"])("does not scan a snapshot belonging to %s", async (channelId) => {
  mocks.snapshot.mockReturnValue({ channelId })
  await readAlgorithmIntelligenceForBrain({ channelId: "a", includeAnomalies: true })
  expect(mocks.scan).not.toHaveBeenCalled()
  expect(mocks.build.mock.calls[0][0].anomalies).toEqual([])
 })
 it("does not read analytics when access is disabled", async () => {
  mocks.controls.mockReturnValue({ enabled: true, allowAnalytics: false })
  expect((await readAlgorithmIntelligenceForBrain({ channelId: "a", includeAnomalies: true })).status).toBe("analytics_disabled")
  expect(mocks.snapshot).not.toHaveBeenCalled()
  expect(mocks.build).not.toHaveBeenCalled()
 })
 it("does not scan when the anomaly engine is disabled", async () => {
  mocks.engines.mockReturnValue({ anomalyIntelligence: false })
  await readAlgorithmIntelligenceForBrain({ channelId: "a", includeAnomalies: true })
  expect(mocks.snapshot).not.toHaveBeenCalled()
  expect(mocks.build.mock.calls[0][0].anomalies).toEqual([])
 })
})
