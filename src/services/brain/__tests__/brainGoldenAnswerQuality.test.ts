import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { runBrainGoldenSuite } from "../BrainAnswerQuality"
import type { CreatorBrainResponse } from "../../../types"

const createStorage = () => {
 const store = new Map<string, string>()
 return {
  getItem: vi.fn((key: string) => store.get(key) || null),
  setItem: vi.fn((key: string, value: string) => {
   store.set(key, value)
  }),
  removeItem: vi.fn((key: string) => {
   store.delete(key)
  }),
  clear: vi.fn(() => {
   store.clear()
  }),
 }
}

describe("Brain golden answer-quality suite", () => {
 let storage: ReturnType<typeof createStorage>

 beforeEach(() => {
  storage = createStorage()
  vi.stubGlobal("localStorage", storage)
 })

 afterEach(() => {
  vi.unstubAllGlobals()
 })

 it("produces a full report over every scenario", () => {
  const report = runBrainGoldenSuite()
  expect(report.total).toBeGreaterThanOrEqual(24)
  expect(report.results).toHaveLength(report.total)
  expect(report.passed + report.failed).toBe(report.total)
  expect(report.passRate).toBeGreaterThanOrEqual(0)
  expect(report.passRate).toBeLessThanOrEqual(1)
 })

 it("holds the core guarantees on the deterministic answer path", () => {
  const report = runBrainGoldenSuite()

  // Every question routes to its declared intent.
  const wrongIntent = report.results.filter((r) => r.actualIntent !== r.expectedIntent)
  expect(wrongIntent.map((r) => r.scenarioId)).toEqual([])

  // No answer leaks another niche's vocabulary, invents numbers, or copies another channel.
  expect(report.results.flatMap((r) => r.forbiddenTokensLeaked)).toEqual([])
  expect(report.results.flatMap((r) => r.unsupportedNumbers)).toEqual([])
  expect(report.results.filter((r) => r.crossChannelDuplicateOf).map((r) => r.scenarioId)).toEqual([])

  // Rich-channel answers stand on real channel evidence.
  const richWithoutEvidence = report.results.filter(
   (r) => (r.fixtureId.endsWith("-rich") || r.fixtureId === "gaming-sparse") && r.evidenceTokensUsed.length === 0 && r.failures.some((f) => f.includes("Generic")),
  )
  expect(richWithoutEvidence.map((r) => r.scenarioId)).toEqual([])

  // Empty-channel answers name what is missing.
  const emptyFailures = report.results.filter(
   (r) => r.fixtureId === "empty-channel" && r.failures.some((f) => f.includes("missing evidence")),
  )
  expect(emptyFailures).toEqual([])
 })

 it("catches a generator that returns the same generic answer for everything", () => {
  const stockResponse: CreatorBrainResponse = {
   id: "stock",
   mode: "strategy_brief",
   body: "Just keep making great content and stay consistent.",
   evidenceIds: [],
   headline: "Channel Strategy Read",
   keyInsight: "Just keep making great content and stay consistent.",
   evidenceChips: [],
   modules: [
    { id: "m", title: "What To Do Next", body: "Keep making great content and stay consistent.", tone: "green", source: "growth" },
   ],
   actions: [],
   learningSummary: "",
   questions: [],
   confidence: "low",
  }

  const report = runBrainGoldenSuite({ generate: () => ({ ...stockResponse }) })

  // The stock answer is wrong-intent for most scenarios and identical across channels.
  expect(report.passRate).toBeLessThan(0.3)
  expect(report.results.some((r) => r.crossChannelDuplicateOf)).toBe(true)
  expect(report.results.some((r) => r.failures.some((f) => f.includes("Wrong intent")))).toBe(true)
 })

 it("flags a generator that leaks another niche's vocabulary", () => {
  // Always answers with restoration language, regardless of the channel.
  const report = runBrainGoldenSuite({
   generate: ({ scenario }) => ({
    id: "leak",
    mode: scenario.expectedIntent,
    body: "Focus on your rust removal and cast iron restoration process.",
    evidenceIds: [],
    headline: "Answer",
    keyInsight: "Focus on your rust removal and cast iron restoration.",
    evidenceChips: [],
    modules: [],
    actions: [],
    learningSummary: "",
    questions: [],
    confidence: "low",
   }),
  })

  // Military-history scenarios must fail for leaking restoration vocabulary.
  const militaryLeaks = report.results.filter(
   (r) => r.fixtureId === "military-history-rich" && r.forbiddenTokensLeaked.length > 0,
  )
  expect(militaryLeaks.length).toBeGreaterThan(0)
 })
})
