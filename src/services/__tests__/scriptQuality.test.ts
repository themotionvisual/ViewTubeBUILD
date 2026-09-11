import { describe, expect, it } from "vitest"
import { buildScriptBudget } from "../scriptBudget"
import {
 applyGeneratedSections,
 lockVerificationSummary,
 reconcileScript,
 repairLockedSections,
 stitchFullScript,
 verifyLockedFragments,
 weightsFromReconciliation,
} from "../scriptQuality"
import type { GeneratedScript, ScriptProject, ScriptSectionDraft } from "../../types"

const LOCKED = "Forget the mud. Napoleon lost Waterloo the night before — and nobody talks about it."

const project = (overrides: Partial<ScriptProject> = {}): ScriptProject => ({
 topic: "Why Napoleon really lost at Waterloo",
 targetMinutes: 10,
 pacing: "standard",
 includeHook: true,
 includeOutro: true,
 chapters: [
  { id: "ch-1", name: "The Setup", description: "", weight: 1 },
  { id: "ch-2", name: "The Night Before", description: "", weight: 1 },
 ],
 globalReferences: [],
 globalFragments: [
  { id: "f-lock", label: "Cold open", text: LOCKED, mode: "lock", chapterId: "hook" },
  { id: "f-improve", label: "Rant", text: "tighten me", mode: "improve" },
 ],
 ...overrides,
})

const section = (
 sectionId: string,
 label: string,
 script: string,
 lockedFragmentIds: string[] = [],
): ScriptSectionDraft => ({ sectionId, label, kind: "chapter", script, lockedFragmentIds })

describe("verifyLockedFragments", () => {
 it("passes a fragment reproduced word-for-word", () => {
  const checks = verifyLockedFragments(project(), [
   section("hook", "Hook", `${LOCKED} Hold on the smoke.`, ["f-lock"]),
  ])
  expect(checks).toHaveLength(1)
  expect(checks[0].status).toBe("verbatim")
  expect(checks[0].foundInSectionId).toBe("hook")
  expect(checks[0].misplaced).toBe(false)
 })

 it("ignores typographic substitutions the model makes", () => {
  const retyped = LOCKED.replace("—", "-").replace(/\s+/g, "  ")
  const checks = verifyLockedFragments(project(), [section("hook", "Hook", retyped)])
  expect(checks[0].status).toBe("verbatim")
 })

 it("flags a paraphrase as not reproduced", () => {
  const checks = verifyLockedFragments(project(), [
   section("hook", "Hook", "Forget the mud — Napoleon lost Waterloo the previous evening."),
  ])
  expect(checks[0].status).toBe("altered")
  expect(checks[0].foundInSectionId).toBeNull()
 })

 it("flags text that landed outside the section it was pinned to", () => {
  const checks = verifyLockedFragments(project(), [
   section("hook", "Hook", "Something else entirely."),
   section("ch-1", "The Setup", LOCKED),
  ])
  expect(checks[0].status).toBe("verbatim")
  expect(checks[0].misplaced).toBe(true)
 })

 it("does not check IMPROVE or INSPIRE fragments", () => {
  const checks = verifyLockedFragments(
   project({
    globalFragments: [{ id: "f-1", label: "Rant", text: "tighten me", mode: "improve" }],
   }),
   [section("hook", "Hook", "nothing like it")],
  )
  expect(checks).toHaveLength(0)
 })

 it("summarizes the checks", () => {
  const checks = verifyLockedFragments(project(), [section("ch-1", "The Setup", LOCKED)])
  expect(lockVerificationSummary(checks)).toEqual({
   total: 1,
   verbatim: 1,
   altered: 0,
   misplaced: 1,
  })
 })
})

describe("repairLockedSections", () => {
 it("splices the creator's exact wording back into its pinned section", () => {
  const sections = [
   section("hook", "Hook", "A paraphrase of the cold open."),
   section("ch-1", "The Setup", "June 1815."),
  ]
  const checks = verifyLockedFragments(project(), sections)
  const repaired = repairLockedSections(project(), sections, checks)

  expect(repaired[0].script).toContain(LOCKED)
  expect(repaired[0].lockedFragmentIds).toContain("f-lock")
  expect(repaired[1].script).toBe("June 1815.")
  // The repair is itself verifiable.
  expect(verifyLockedFragments(project(), repaired)[0].status).toBe("verbatim")
 })

 it("leaves the script untouched when nothing is broken", () => {
  const sections = [section("hook", "Hook", LOCKED)]
  const checks = verifyLockedFragments(project(), sections)
  expect(repairLockedSections(project(), sections, checks)).toBe(sections)
 })
})

describe("reconcileScript", () => {
 const words = (count: number) => Array.from({ length: count }, () => "word").join(" ")

 it("measures delivered words per section against the allocation", () => {
  const budget = buildScriptBudget(project())
  const reconciliation = reconcileScript(budget, [
   section("hook", "Hook", words(73)),
   section("ch-1", "The Setup", words(600)),
   section("ch-2", "The Night Before", words(600)),
   section("outro", "Outro / CTA", words(87)),
  ])
  expect(reconciliation.actualWords).toBe(1360)
  expect(reconciliation.sections[0].deltaWords).toBe(0)
  expect(reconciliation.sections[1].allocatedWords).toBeGreaterThan(0)
  expect(reconciliation.actualMinutes).toBeCloseTo(1360 / 145, 5)
 })

 it("flags a script that runs more than 10% off target", () => {
  const budget = buildScriptBudget(project({ targetMinutes: 10 }))
  const short = reconcileScript(budget, [section("ch-1", "The Setup", words(600))])
  expect(short.driftMinutes).toBeLessThan(0)
  expect(short.offTarget).toBe(true)

  const onTarget = reconcileScript(budget, [section("ch-1", "The Setup", words(1400))])
  expect(onTarget.offTarget).toBe(false)
 })
})

describe("weightsFromReconciliation", () => {
 it("re-weights chapters to the proportions actually delivered", () => {
  const base = project()
  const budget = buildScriptBudget(base)
  const reconciliation = reconcileScript(budget, [
   section("ch-1", "The Setup", Array.from({ length: 900 }, () => "word").join(" ")),
   section("ch-2", "The Night Before", Array.from({ length: 300 }, () => "word").join(" ")),
  ])
  const next = weightsFromReconciliation(base, reconciliation)
  expect(next.chapters[0].weight).toBe(1.5)
  expect(next.chapters[1].weight).toBe(0.5)
 })

 it("leaves weights alone when nothing was delivered", () => {
  const base = project()
  const budget = buildScriptBudget(base)
  const empty = reconcileScript(budget, [section("ch-1", "The Setup", "")])
  expect(weightsFromReconciliation(base, empty)).toBe(base)
 })
})

describe("stitchFullScript", () => {
 it("rebuilds the export from the edited sections and skips empty ones", () => {
  const stitched = stitchFullScript([
   section("hook", "Hook", "  Opening line.  "),
   section("ch-1", "The Setup", ""),
   section("ch-2", "The Night Before", "Second line."),
  ])
  expect(stitched).toBe("## Hook\n\nOpening line.\n\n## The Night Before\n\nSecond line.")
 })

 it("keeps the generated result and its stitched script in step", () => {
  const generated = {
   outline: [],
   timeline: [],
   sections: [section("hook", "Hook", "Original.")],
   fullScript: "## Hook\n\nOriginal.",
   visualSuggestions: [],
   shortsIdeas: [],
   assumptions: [],
   groundingNotes: [],
  } satisfies GeneratedScript

  const edited = applyGeneratedSections(generated, [section("hook", "Hook", "Edited by hand.")])
  expect(edited.fullScript).toBe("## Hook\n\nEdited by hand.")
  expect(edited.sections[0].script).toBe("Edited by hand.")
 })
})
