import type { GeneratedScript, ScriptFragment, ScriptProject, ScriptSectionDraft } from "../types"
import { countWords, type ScriptBudget } from "./scriptBudget"

/**
 * Post-generation checks for Script Architect.
 *
 * The tool promises two things a prompt alone cannot guarantee: that LOCK
 * fragments survive word-for-word, and that the delivered script matches the
 * runtime the creator asked for. Both are verified here, locally, against the
 * text that actually came back.
 */

/**
 * Compare-normalize text: models routinely swap straight quotes for curly ones,
 * hyphens for dashes, and reflow whitespace. None of those are rewrites, so they
 * must not read as a broken lock. Wording and case changes still fail.
 */
const normalizeForCompare = (text: string): string =>
 text
  .replace(/[‘’‚‛′]/g, "'")
  .replace(/[“”„‟″]/g, '"')
  .replace(/[‐-―−]/g, "-")
  .replace(/…/g, "...")
  .replace(/\u00A0/g, " ")
  .replace(/\s+/g, " ")
  .trim()

export type LockStatus = "verbatim" | "altered" | "empty"

export interface LockVerification {
 fragmentId: string
 label: string
 status: LockStatus
 /** Section the verbatim text was found in, when it was found at all. */
 foundInSectionId: string | null
 foundInSectionLabel: string | null
 /** Section the creator pinned it to, when they pinned one. */
 pinnedSectionId: string | null
 /** True when the text is present but not in the section it was pinned to. */
 misplaced: boolean
}

const lockedFragments = (project: ScriptProject): ScriptFragment[] =>
 project.globalFragments.filter((fragment) => fragment.mode === "lock")

/**
 * Check every LOCK fragment against the generated sections. This is the
 * guarantee behind "nothing you write by hand is overwritten" — enforced here
 * rather than trusted to the model.
 */
export const verifyLockedFragments = (
 project: ScriptProject,
 sections: ScriptSectionDraft[],
): LockVerification[] =>
 lockedFragments(project).map((fragment) => {
  const needle = normalizeForCompare(fragment.text)
  const label = fragment.label.trim() || "Untitled piece"
  const pinnedSectionId = fragment.chapterId || null

  if (!needle) {
   return {
    fragmentId: fragment.id,
    label,
    status: "empty" as LockStatus,
    foundInSectionId: null,
    foundInSectionLabel: null,
    pinnedSectionId,
    misplaced: false,
   }
  }

  const host = sections.find((section) => normalizeForCompare(section.script).includes(needle))

  return {
   fragmentId: fragment.id,
   label,
   status: host ? ("verbatim" as LockStatus) : ("altered" as LockStatus),
   foundInSectionId: host?.sectionId ?? null,
   foundInSectionLabel: host?.label ?? null,
   pinnedSectionId,
   misplaced: Boolean(host && pinnedSectionId && host.sectionId !== pinnedSectionId),
  }
 })

export const lockVerificationSummary = (
 verifications: LockVerification[],
): { total: number; verbatim: number; altered: number; misplaced: number } => ({
 total: verifications.length,
 verbatim: verifications.filter((entry) => entry.status === "verbatim").length,
 altered: verifications.filter((entry) => entry.status === "altered").length,
 misplaced: verifications.filter((entry) => entry.misplaced).length,
})

/**
 * Splice altered LOCK fragments back into the script verbatim.
 *
 * The model's paraphrase cannot be located reliably, so the original is
 * appended to its pinned section (or the first section when unpinned) instead
 * of attempting a risky in-place swap. The creator keeps their exact words and
 * moves them where they want.
 */
export const repairLockedSections = (
 project: ScriptProject,
 sections: ScriptSectionDraft[],
 verifications: LockVerification[],
): ScriptSectionDraft[] => {
 const broken = verifications.filter((entry) => entry.status === "altered")
 if (!broken.length || !sections.length) return sections

 const additions = new Map<string, string[]>()
 broken.forEach((entry) => {
  const fragment = project.globalFragments.find((item) => item.id === entry.fragmentId)
  if (!fragment) return
  const targetId =
   sections.find((section) => section.sectionId === entry.pinnedSectionId)?.sectionId ||
   sections[0].sectionId
  additions.set(targetId, [...(additions.get(targetId) || []), fragment.text.trim()])
 })

 return sections.map((section) => {
  const restored = additions.get(section.sectionId)
  if (!restored?.length) return section
  const restoredIds = broken
   .filter(
    (entry) =>
     (entry.pinnedSectionId || sections[0].sectionId) === section.sectionId ||
     (!entry.pinnedSectionId && section.sectionId === sections[0].sectionId),
   )
   .map((entry) => entry.fragmentId)
  return {
   ...section,
   script: [section.script.trim(), ...restored].filter(Boolean).join("\n\n"),
   lockedFragmentIds: Array.from(new Set([...section.lockedFragmentIds, ...restoredIds])),
  }
 })
}

export interface SectionReconciliation {
 sectionId: string
 label: string
 allocatedWords: number
 actualWords: number
 /** Positive = the section ran long. */
 deltaWords: number
 actualMinutes: number
}

export interface ScriptReconciliation {
 sections: SectionReconciliation[]
 actualWords: number
 actualMinutes: number
 targetMinutes: number
 /** Positive = the delivered script runs longer than the target. */
 driftMinutes: number
 /** True when the drift is more than 10% of the target. */
 offTarget: boolean
}

/** Measure what actually came back against what was budgeted (plan §4 step 5). */
export const reconcileScript = (
 budget: ScriptBudget,
 sections: ScriptSectionDraft[],
): ScriptReconciliation => {
 const reconciled: SectionReconciliation[] = sections.map((section) => {
  const allocation = budget.sections.find((entry) => entry.id === section.sectionId)
  const actualWords = countWords(section.script)
  return {
   sectionId: section.sectionId,
   label: section.label,
   allocatedWords: allocation?.words ?? 0,
   actualWords,
   deltaWords: actualWords - (allocation?.words ?? 0),
   actualMinutes: actualWords / budget.wpm,
  }
 })

 const actualWords = reconciled.reduce((total, section) => total + section.actualWords, 0)
 const actualMinutes = actualWords / budget.wpm
 const driftMinutes = actualMinutes - budget.targetMinutes

 return {
  sections: reconciled,
  actualWords,
  actualMinutes,
  targetMinutes: budget.targetMinutes,
  driftMinutes,
  offTarget: Math.abs(driftMinutes) > budget.targetMinutes * 0.1,
 }
}

/**
 * Re-weight the chapters to the proportions the script actually delivered, so a
 * regenerate budgets for the shape the creator just read instead of the shape
 * they guessed at.
 */
export const weightsFromReconciliation = (
 project: ScriptProject,
 reconciliation: ScriptReconciliation,
): ScriptProject => {
 const chapterWords = project.chapters.map(
  (chapter) =>
   reconciliation.sections.find((section) => section.sectionId === chapter.id)?.actualWords ?? 0,
 )
 const total = chapterWords.reduce((sum, words) => sum + words, 0)
 if (!total) return project

 const average = total / chapterWords.length
 return {
  ...project,
  chapters: project.chapters.map((chapter, index) => ({
   ...chapter,
   // Weight 1 = an average-length chapter, rounded to the 0.5 steps the UI uses.
   weight: Math.max(0.5, Math.round((chapterWords[index] / average) * 2) / 2),
  })),
 }
}

/** Rebuild the flat export from the (possibly edited) sections. */
export const stitchFullScript = (sections: ScriptSectionDraft[]): string =>
 sections
  .filter((section) => section.script.trim())
  .map((section) => `## ${section.label}\n\n${section.script.trim()}`)
  .join("\n\n")

export const applyGeneratedSections = (
 result: GeneratedScript,
 sections: ScriptSectionDraft[],
): GeneratedScript => ({
 ...result,
 sections,
 fullScript: stitchFullScript(sections),
})
