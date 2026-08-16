import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
 CREATOR_QUESTION_SUITE,
 GOLDEN_CHANNEL_SPECS,
 QUESTION_FAMILIES,
 buildGoldenChannelFixture,
 goldenSpecById,
} from ".."
import { formatCreatorBrainResponse } from "../../../aiBrainCommandInterface"

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

// Neutral raw text: it must carry no intent keyword, so the routed mode is driven by
// the creator's question alone.
const NEUTRAL_RAW = "Here is a plan you can act on."

describe("creator question suite", () => {
 let storage: ReturnType<typeof createStorage>

 beforeEach(() => {
  storage = createStorage()
  vi.stubGlobal("localStorage", storage)
 })

 afterEach(() => {
  vi.unstubAllGlobals()
 })

 it("contains at least 24 scenarios with unique ids", () => {
  expect(CREATOR_QUESTION_SUITE.length).toBeGreaterThanOrEqual(24)
  const ids = CREATOR_QUESTION_SUITE.map((scenario) => scenario.id)
  expect(new Set(ids).size).toBe(ids.length)
 })

 it("references only real canonical fixtures", () => {
  const validIds = new Set(GOLDEN_CHANNEL_SPECS.map((spec) => spec.id))
  for (const scenario of CREATOR_QUESTION_SUITE) {
   expect(validIds.has(scenario.fixtureId), `${scenario.id} → unknown fixture`).toBe(true)
  }
 })

 it("covers every one of the 20 question families", () => {
  const covered = new Set(CREATOR_QUESTION_SUITE.map((scenario) => scenario.family))
  for (const family of QUESTION_FAMILIES) {
   expect(covered.has(family), `family "${family}" is not covered`).toBe(true)
  }
 })

 it("routes each question to its declared intent", () => {
  for (const scenario of CREATOR_QUESTION_SUITE) {
   const spec = goldenSpecById(scenario.fixtureId)!
   const fixture = buildGoldenChannelFixture(spec)
   const response = formatCreatorBrainResponse(NEUTRAL_RAW, fixture.snapshot, {
    requestText: scenario.question,
   })
   expect(response.mode, `${scenario.id}: "${scenario.question}"`).toBe(scenario.expectedIntent)
  }
 })

 it("only allows follow-up questions where evidence is thin or the creator invites it", () => {
  // Rich channels answering direct factual questions should not need to ask back.
  const richInterrogators = CREATOR_QUESTION_SUITE.filter(
   (scenario) =>
    scenario.mayAskQuestion &&
    scenario.fixtureId.endsWith("-rich") &&
    scenario.family !== "what_needed" &&
    scenario.family !== "audience_request",
  )
  expect(richInterrogators).toEqual([])
 })
})
