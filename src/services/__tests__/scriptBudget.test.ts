import { describe, expect, it } from "vitest"
import {
 HOOK_SECTION_ID,
 OUTRO_SECTION_ID,
 PACING_WPM,
 buildScriptBudget,
 budgetToTimeline,
 formatClock,
} from "../scriptBudget"
import type { ScriptProject } from "../../types"

const project = (overrides: Partial<ScriptProject> = {}): ScriptProject => ({
 topic: "Why Napoleon really lost at Waterloo",
 targetMinutes: 10,
 pacing: "standard",
 includeHook: true,
 includeOutro: true,
 chapters: [
  { id: "ch-1", name: "The Setup", description: "", weight: 2 },
  { id: "ch-2", name: "The Night Before", description: "", weight: 2 },
 ],
 globalReferences: [],
 globalFragments: [],
 ...overrides,
})

describe("buildScriptBudget", () => {
 it("turns target minutes into a word budget at the pacing rate", () => {
  const budget = buildScriptBudget(project({ targetMinutes: 10, pacing: "tight" }))
  expect(budget.wpm).toBe(PACING_WPM.tight)
  expect(budget.wordBudget).toBe(1650)
 })

 it("takes hook and outro off the top, then splits the body by chapter weight", () => {
  const budget = buildScriptBudget(
   project({
    chapters: [
     { id: "ch-1", name: "A", description: "", weight: 3 },
     { id: "ch-2", name: "B", description: "", weight: 1 },
    ],
   }),
  )
  const hook = budget.sections.find((section) => section.id === HOOK_SECTION_ID)
  const outro = budget.sections.find((section) => section.id === OUTRO_SECTION_ID)
  const first = budget.sections.find((section) => section.id === "ch-1")
  const second = budget.sections.find((section) => section.id === "ch-2")

  // 1450 total: hook clamps to 5% (72), outro to 6% (87)
  expect(hook?.words).toBe(73)
  expect(outro?.words).toBe(87)
  expect((first?.words ?? 0) / (second?.words ?? 1)).toBeCloseTo(3, 1)
  expect((first?.words ?? 0) + (second?.words ?? 0)).toBe(
   budget.wordBudget - (hook?.words ?? 0) - (outro?.words ?? 0),
  )
 })

 it("drops the hook and outro sections when they are switched off", () => {
  const budget = buildScriptBudget(project({ includeHook: false, includeOutro: false }))
  expect(budget.sections.map((section) => section.id)).toEqual(["ch-1", "ch-2"])
  expect(budget.sections.reduce((total, section) => total + section.words, 0)).toBe(
   budget.wordBudget,
  )
 })

 it("splits evenly when no weights are set", () => {
  const budget = buildScriptBudget(
   project({
    chapters: [
     { id: "ch-1", name: "A", description: "" },
     { id: "ch-2", name: "B", description: "" },
    ],
   }),
  )
  const [, first, second] = budget.sections
  expect(first.words).toBe(second.words)
 })

 it("keeps the allocation inside the target runtime", () => {
  const budget = buildScriptBudget(project({ targetMinutes: 12 }))
  expect(budget.allocatedMinutes).toBeLessThanOrEqual(12)
  expect(budget.headroomMinutes).toBeGreaterThanOrEqual(0)
  expect(budget.headroomMinutes).toBeLessThan(0.2)
 })

 it("counts locked words per section and flags an overflow", () => {
  const lockedText = Array.from({ length: 400 }, () => "word").join(" ")
  const budget = buildScriptBudget(
   project({
    targetMinutes: 2,
    globalFragments: [
     { id: "f-1", label: "Cold open", text: lockedText, mode: "lock", chapterId: "ch-1" },
     { id: "f-2", label: "Rant", text: "rewrite me please", mode: "improve" },
    ],
   }),
  )
  expect(budget.lockedWords).toBe(400)
  expect(budget.sections.find((section) => section.id === "ch-1")?.lockedWords).toBe(400)
  expect(budget.lockedOverflow).toBe(true)
 })

 it("does not flag an overflow when locked text fits", () => {
  const budget = buildScriptBudget(
   project({
    globalFragments: [{ id: "f-1", label: "Cold open", text: "one short locked line", mode: "lock" }],
   }),
  )
  expect(budget.lockedOverflow).toBe(false)
 })
})

describe("budgetToTimeline", () => {
 it("maps allocations onto timeline sections", () => {
  const timeline = budgetToTimeline(buildScriptBudget(project()))
  expect(timeline.map((section) => section.kind)).toEqual(["hook", "chapter", "chapter", "outro"])
  expect(timeline.every((section) => section.estMinutes > 0)).toBe(true)
 })
})

describe("formatClock", () => {
 it("renders minutes as m:ss", () => {
  expect(formatClock(0.5)).toBe("0:30")
  expect(formatClock(9.25)).toBe("9:15")
  expect(formatClock(-1)).toBe("0:00")
 })
})
