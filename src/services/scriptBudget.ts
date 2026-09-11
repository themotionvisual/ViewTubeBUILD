import type {
 ScriptFragment,
 ScriptPacing,
 ScriptProject,
 ScriptSectionKind,
 TimelineSection,
} from "../types"

/**
 * Duration math for Script Architect.
 *
 * Target minutes become a word budget, the budget is split across hook, chapters
 * and outro, and the split is handed to the model so the generated script is
 * written to a length instead of being measured after the fact.
 *
 * Pure functions — no AI, no storage — so the timeline can update live while the
 * creator edits chapters, and so the allocation can be tested directly.
 */

export const PACING_WPM: Record<ScriptPacing, number> = {
 tight: 165,
 standard: 145,
 breathing: 125,
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const countWords = (text: string): number =>
 text.trim() ? text.trim().split(/\s+/).length : 0

export interface SectionAllocation {
 id: string
 label: string
 kind: ScriptSectionKind
 words: number
 minutes: number
 /** Fragments pinned to this section, in creator order. */
 fragments: ScriptFragment[]
 /** Words this section already owes to verbatim LOCK fragments. */
 lockedWords: number
}

export interface ScriptBudget {
 wpm: number
 wordBudget: number
 sections: SectionAllocation[]
 allocatedMinutes: number
 targetMinutes: number
 /** Positive = headroom left, negative = over the target. */
 headroomMinutes: number
 lockedWords: number
 /** True when LOCK fragments alone cannot fit the target runtime. */
 lockedOverflow: boolean
}

export const HOOK_SECTION_ID = "hook"
export const OUTRO_SECTION_ID = "outro"

const fragmentsFor = (project: ScriptProject, sectionId: string): ScriptFragment[] =>
 project.globalFragments.filter((fragment) => fragment.chapterId === sectionId)

/**
 * Split the word budget across sections by chapter weight, with hook and outro
 * taking fixed slices off the top (plan §4).
 */
export const buildScriptBudget = (project: ScriptProject): ScriptBudget => {
 const wpm = PACING_WPM[project.pacing] ?? PACING_WPM.standard
 const targetMinutes = Math.max(0.5, project.targetMinutes)
 // Floor, never round up: the allocation must not exceed the creator's target.
 const wordBudget = Math.floor(targetMinutes * wpm)

 const hookWords = project.includeHook ? Math.round(clamp(wordBudget * 0.05, 60, 160)) : 0
 const outroWords = project.includeOutro ? Math.round(clamp(wordBudget * 0.06, 60, 180)) : 0
 const bodyWords = Math.max(0, wordBudget - hookWords - outroWords)

 const weights = project.chapters.map((chapter) =>
  typeof chapter.weight === "number" && chapter.weight > 0 ? chapter.weight : 1,
 )
 const weightSum = weights.reduce((total, weight) => total + weight, 0) || 1

 const sections: SectionAllocation[] = []

 if (hookWords > 0) {
  sections.push({
   id: HOOK_SECTION_ID,
   label: "Hook",
   kind: "hook",
   words: hookWords,
   minutes: hookWords / wpm,
   fragments: fragmentsFor(project, HOOK_SECTION_ID),
   lockedWords: 0,
  })
 }

 // Allocate on the running total so the chapter words sum to bodyWords exactly
 // instead of drifting by a word per chapter through independent rounding.
 let allocatedBodyWords = 0
 let cumulativeWeight = 0
 project.chapters.forEach((chapter, index) => {
  cumulativeWeight += weights[index]
  const cumulativeWords = Math.round(bodyWords * (cumulativeWeight / weightSum))
  const words = cumulativeWords - allocatedBodyWords
  allocatedBodyWords = cumulativeWords
  sections.push({
   id: chapter.id,
   label: chapter.name.trim() || `Chapter ${index + 1}`,
   kind: "chapter",
   words,
   minutes: words / wpm,
   fragments: fragmentsFor(project, chapter.id),
   lockedWords: 0,
  })
 })

 if (outroWords > 0) {
  sections.push({
   id: OUTRO_SECTION_ID,
   label: "Outro / CTA",
   kind: "outro",
   words: outroWords,
   minutes: outroWords / wpm,
   fragments: fragmentsFor(project, OUTRO_SECTION_ID),
   lockedWords: 0,
  })
 }

 // Unpinned fragments belong to the script as a whole, so their locked words
 // count against the total budget without landing on one section.
 let lockedWords = 0
 project.globalFragments.forEach((fragment) => {
  if (fragment.mode !== "lock") return
  const words = countWords(fragment.text)
  lockedWords += words
  const section = sections.find((entry) => entry.id === fragment.chapterId)
  if (section) section.lockedWords += words
 })

 const allocatedMinutes = sections.reduce((total, section) => total + section.minutes, 0)

 return {
  wpm,
  wordBudget,
  sections,
  allocatedMinutes,
  targetMinutes,
  headroomMinutes: targetMinutes - allocatedMinutes,
  lockedWords,
  lockedOverflow: lockedWords > wordBudget,
 }
}

export const budgetToTimeline = (budget: ScriptBudget): TimelineSection[] =>
 budget.sections.map((section) => ({
  id: section.id,
  label: section.label,
  kind: section.kind,
  estMinutes: Number(section.minutes.toFixed(2)),
  wordCount: section.words,
 }))

export const formatClock = (minutes: number): string => {
 const totalSeconds = Math.max(0, Math.round(minutes * 60))
 return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`
}
