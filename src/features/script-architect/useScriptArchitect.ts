import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { generateScript } from "../../services/gemini"
import { createSuperToolActionPacket } from "../../services/superToolActionPackets"
import {
 HOOK_SECTION_ID,
 OUTRO_SECTION_ID,
 buildScriptBudget,
 formatClock,
 type ScriptBudget,
} from "../../services/scriptBudget"
import {
 applyGeneratedSections,
 lockVerificationSummary,
 reconcileScript,
 repairLockedSections,
 verifyLockedFragments,
 weightsFromReconciliation,
 type LockVerification,
 type ScriptReconciliation,
} from "../../services/scriptQuality"
import {
 clearScriptProjectState,
 emptyScriptProject,
 makeChapter,
 makeFragment,
 makeReference,
 readScriptProjectState,
 readScriptVault,
 removeScriptDraft,
 saveScriptDraft,
 writeScriptProjectState,
 type ScriptDraftV1,
} from "./scriptProjectStore"
import { useBrain } from "../../context/useBrain"
import type {
 ChapterInput,
 FragmentMode,
 GeneratedScript,
 ReferenceLink,
 ScriptFragment,
 ScriptPacing,
 ScriptProject,
} from "../../types"

/**
 * Script Architect controller.
 *
 * Holds the ScriptProject the creator is filling in, recomputes the word/runtime
 * budget on every edit, runs one assembly call, verifies the creator's locked
 * text survived, reconciles the delivered length against the target, and hands
 * the finished script to the shared super-tool packet path.
 *
 * Every field is optional by design — assemble works from a bare topic.
 */

const AUTOSAVE_DEBOUNCE_MS = 600

export const TONE_OPTIONS = ["Cinematic", "Casual", "Academic", "Energetic", "Calm authority", "Comedic"]
export const GOAL_OPTIONS = ["Subscribe", "Teach", "Sell", "Funnel to another video", "Serialize"]
export const PACING_OPTIONS: Array<{ id: ScriptPacing; label: string }> = [
 { id: "tight", label: "Tight" },
 { id: "standard", label: "Standard" },
 { id: "breathing", label: "Breathing" },
]
export const FRAGMENT_MODES: Array<{ id: FragmentMode; label: string; hint: string }> = [
 { id: "lock", label: "Lock", hint: "Used word-for-word. The AI writes around it." },
 { id: "improve", label: "Improve", hint: "Rewritten tighter, your point and facts kept." },
 { id: "inspire", label: "Inspire", hint: "Direction only — never quoted." },
]

export interface SectionPinOption {
 id: string
 label: string
}

export interface ScriptArchitectController {
 project: ScriptProject
 budget: ScriptBudget
 result: GeneratedScript | null
 loading: boolean
 error: string | null
 status: string | null
 restoredFromDraft: boolean
 drafts: ScriptDraftV1[]
 draftName: string
 setDraftName: (name: string) => void
 lockChecks: LockVerification[]
 lockSummary: { total: number; verbatim: number; altered: number; misplaced: number }
 reconciliation: ScriptReconciliation | null
 sectionPinOptions: SectionPinOption[]
 setField: <K extends keyof ScriptProject>(key: K, value: ScriptProject[K]) => void
 addChapter: () => void
 updateChapter: (id: string, patch: Partial<ChapterInput>) => void
 removeChapter: (id: string) => void
 moveChapter: (id: string, direction: -1 | 1) => void
 addReference: () => void
 updateReference: (id: string, patch: Partial<ReferenceLink>) => void
 removeReference: (id: string) => void
 addFragment: () => void
 updateFragment: (id: string, patch: Partial<ScriptFragment>) => void
 removeFragment: (id: string) => void
 assemble: () => Promise<void>
 updateSectionScript: (sectionId: string, script: string) => void
 restoreLockedText: () => void
 matchTargetToScript: () => void
 rebalanceWeightsToScript: () => void
 copyScript: () => Promise<void>
 savePacket: () => Promise<void>
 saveDraft: () => void
 loadDraft: (id: string) => void
 deleteDraft: (id: string) => void
 startNewDraft: () => void
}

export const useScriptArchitect = (): ScriptArchitectController => {
 const { brain, emitSignal } = useBrain()

 // Restore the autosaved draft on first render so a reload never costs a brief.
 const restored = useRef(readScriptProjectState())
 const [project, setProject] = useState<ScriptProject>(
  () => restored.current?.project || emptyScriptProject(),
 )
 const [result, setResult] = useState<GeneratedScript | null>(() => restored.current?.result || null)
 const [restoredFromDraft] = useState(() => Boolean(restored.current))
 const [drafts, setDrafts] = useState<ScriptDraftV1[]>(() => readScriptVault())
 const [draftName, setDraftName] = useState(() => restored.current?.name || "")
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const [status, setStatus] = useState<string | null>(null)

 const budget = useMemo(() => buildScriptBudget(project), [project])

 const lockChecks = useMemo(
  () => (result ? verifyLockedFragments(project, result.sections) : []),
  [project, result],
 )
 const lockSummary = useMemo(() => lockVerificationSummary(lockChecks), [lockChecks])
 const reconciliation = useMemo(
  () => (result ? reconcileScript(budget, result.sections) : null),
  [budget, result],
 )

 // Debounced autosave: every keystroke would thrash localStorage.
 useEffect(() => {
  const timer = window.setTimeout(
   () => writeScriptProjectState(project, result),
   AUTOSAVE_DEBOUNCE_MS,
  )
  return () => window.clearTimeout(timer)
 }, [project, result])

 const sectionPinOptions = useMemo<SectionPinOption[]>(() => {
  const options: SectionPinOption[] = [{ id: "", label: "Unpinned" }]
  if (project.includeHook) options.push({ id: HOOK_SECTION_ID, label: "Hook" })
  project.chapters.forEach((chapter, index) =>
   options.push({ id: chapter.id, label: chapter.name.trim() || `Chapter ${index + 1}` }),
  )
  if (project.includeOutro) options.push({ id: OUTRO_SECTION_ID, label: "Outro / CTA" })
  return options
 }, [project.chapters, project.includeHook, project.includeOutro])

 const setField = useCallback(
  <K extends keyof ScriptProject>(key: K, value: ScriptProject[K]) => {
   setProject((prev) => ({ ...prev, [key]: value }))
  },
  [],
 )

 const addChapter = useCallback(() => {
  setProject((prev) => ({ ...prev, chapters: [...prev.chapters, makeChapter()] }))
 }, [])

 const updateChapter = useCallback((id: string, patch: Partial<ChapterInput>) => {
  setProject((prev) => ({
   ...prev,
   chapters: prev.chapters.map((chapter) => (chapter.id === id ? { ...chapter, ...patch } : chapter)),
  }))
 }, [])

 const removeChapter = useCallback((id: string) => {
  setProject((prev) => ({
   ...prev,
   chapters: prev.chapters.filter((chapter) => chapter.id !== id),
   // A fragment pinned to a deleted chapter becomes unpinned rather than lost.
   globalFragments: prev.globalFragments.map((fragment) =>
    fragment.chapterId === id ? { ...fragment, chapterId: undefined } : fragment,
   ),
   globalReferences: prev.globalReferences.map((reference) =>
    reference.chapterId === id ? { ...reference, chapterId: undefined } : reference,
   ),
  }))
 }, [])

 const moveChapter = useCallback((id: string, direction: -1 | 1) => {
  setProject((prev) => {
   const index = prev.chapters.findIndex((chapter) => chapter.id === id)
   const target = index + direction
   if (index < 0 || target < 0 || target >= prev.chapters.length) return prev
   const chapters = [...prev.chapters]
   const [moved] = chapters.splice(index, 1)
   chapters.splice(target, 0, moved)
   return { ...prev, chapters }
  })
 }, [])

 const addReference = useCallback(() => {
  setProject((prev) => ({ ...prev, globalReferences: [...prev.globalReferences, makeReference()] }))
 }, [])

 const updateReference = useCallback((id: string, patch: Partial<ReferenceLink>) => {
  setProject((prev) => ({
   ...prev,
   globalReferences: prev.globalReferences.map((reference) =>
    reference.id === id ? { ...reference, ...patch } : reference,
   ),
  }))
 }, [])

 const removeReference = useCallback((id: string) => {
  setProject((prev) => ({
   ...prev,
   globalReferences: prev.globalReferences.filter((reference) => reference.id !== id),
  }))
 }, [])

 const addFragment = useCallback(() => {
  setProject((prev) => ({ ...prev, globalFragments: [...prev.globalFragments, makeFragment()] }))
 }, [])

 const updateFragment = useCallback((id: string, patch: Partial<ScriptFragment>) => {
  setProject((prev) => ({
   ...prev,
   globalFragments: prev.globalFragments.map((fragment) =>
    fragment.id === id ? { ...fragment, ...patch } : fragment,
   ),
  }))
 }, [])

 const removeFragment = useCallback((id: string) => {
  setProject((prev) => ({
   ...prev,
   globalFragments: prev.globalFragments.filter((fragment) => fragment.id !== id),
  }))
 }, [])

 const assemble = useCallback(async () => {
  setLoading(true)
  setError(null)
  setStatus(null)
  try {
   const generated = await generateScript(project, budget, brain)
   setResult(generated)
   const checks = verifyLockedFragments(project, generated.sections)
   const broken = checks.filter((entry) => entry.status === "altered").length
   setStatus(
    broken > 0
     ? `Script assembled. ${broken} locked piece${broken === 1 ? "" : "s"} did not come back word-for-word — restore below.`
     : "Script assembled.",
   )
  } catch (e) {
   console.error("[ScriptArchitect] assembly failed", e)
   setError(e instanceof Error ? e.message : "Failed to assemble the script. Please try again.")
  } finally {
   setLoading(false)
  }
 }, [project, budget, brain])

 /** Edits to the delivered script are the creator's; counts and checks follow them. */
 const updateSectionScript = useCallback((sectionId: string, script: string) => {
  setResult((prev) =>
   prev
    ? applyGeneratedSections(
       prev,
       prev.sections.map((section) =>
        section.sectionId === sectionId ? { ...section, script } : section,
       ),
      )
    : prev,
  )
 }, [])

 const restoreLockedText = useCallback(() => {
  setResult((prev) => {
   if (!prev) return prev
   const checks = verifyLockedFragments(project, prev.sections)
   const repaired = repairLockedSections(project, prev.sections, checks)
   return applyGeneratedSections(prev, repaired)
  })
  setStatus("Your exact wording was restored into the script.")
 }, [project])

 const matchTargetToScript = useCallback(() => {
  if (!reconciliation) return
  const minutes = Math.max(1, Math.min(90, Math.round(reconciliation.actualMinutes)))
  setField("targetMinutes", minutes)
  setStatus(`Target raised to ${minutes} minutes to match the delivered script.`)
 }, [reconciliation, setField])

 const rebalanceWeightsToScript = useCallback(() => {
  if (!reconciliation) return
  setProject((prev) => weightsFromReconciliation(prev, reconciliation))
  setStatus("Chapter weights rebalanced to the delivered script — assemble again to use them.")
 }, [reconciliation])

 const copyScript = useCallback(async () => {
  if (!result?.fullScript) return
  try {
   await navigator.clipboard.writeText(result.fullScript)
   setStatus("Full script copied to clipboard.")
  } catch {
   setStatus("Clipboard blocked by the browser — select the script text manually.")
  }
 }, [result])

 const saveDraft = useCallback(() => {
  const next = saveScriptDraft(draftName, project, result)
  setDrafts(next)
  setStatus(`Saved "${next[0]?.name || draftName}" to the script vault.`)
 }, [draftName, project, result])

 const loadDraft = useCallback(
  (id: string) => {
   const draft = drafts.find((entry) => entry.id === id)
   if (!draft) return
   setProject(draft.project)
   setResult(draft.result)
   setDraftName(draft.name)
   setStatus(`Loaded "${draft.name}".`)
  },
  [drafts],
 )

 const deleteDraft = useCallback((id: string) => {
  setDrafts(removeScriptDraft(id))
 }, [])

 const startNewDraft = useCallback(() => {
  setProject(emptyScriptProject())
  setResult(null)
  setDraftName("")
  setError(null)
  clearScriptProjectState()
  setStatus("Started a new script. Saved drafts are untouched.")
 }, [])

 const savePacket = useCallback(async () => {
  if (!result) return
  const title = project.topic.trim() || "Untitled script"
  const locked = lockSummary
  const confidence =
   locked.altered === 0 && result.groundingNotes.length === 0 && result.assumptions.length <= 1
    ? "high"
    : locked.altered > 0 || result.groundingNotes.length > 2
      ? "low"
      : "medium"

  const packet = createSuperToolActionPacket({
   toolId: "creator-canvas-os",
   moduleId: "script-architect",
   title: `${title} script packet`,
   summary: `Assembled a ${formatClock(reconciliation?.actualMinutes ?? budget.allocatedMinutes)} script for ${title} across ${result.sections.length} sections (${budget.wordBudget} word budget, ${project.pacing} pacing), with ${locked.verbatim}/${locked.total} locked pieces verified verbatim and ${result.shortsIdeas.length} priming short(s) proposed.`,
   inputs: {
    topic: project.topic,
    angle: project.angle,
    audience: project.audience,
    tone: project.tone,
    goal: project.goal,
    targetMinutes: project.targetMinutes,
    pacing: project.pacing,
    chapters: project.chapters.map((chapter) => chapter.name || "unnamed"),
    references: project.globalReferences.length,
    fragments: project.globalFragments.map((fragment) => `${fragment.mode}: ${fragment.label}`),
   },
   outputs: {
    timeline: result.timeline,
    outline: result.outline,
    fullScript: result.fullScript,
    visualSuggestions: result.visualSuggestions,
    shortsIdeas: result.shortsIdeas,
    lockedPiecesVerbatim: `${locked.verbatim}/${locked.total}`,
    deliveredRuntime: formatClock(reconciliation?.actualMinutes ?? 0),
    deliveredWords: reconciliation?.actualWords ?? 0,
   },
   confidence,
   evidence: [
    project.topic,
    ...project.globalReferences.map((reference) => reference.url || reference.note || ""),
   ].filter(Boolean) as string[],
   missingInputs: [
    project.audience?.trim() ? null : "ideal audience",
    project.globalReferences.length ? null : "references",
    ...(locked.altered > 0 ? [`${locked.altered} locked piece(s) not reproduced verbatim`] : []),
    ...result.groundingNotes,
   ].filter(Boolean) as string[],
   handoffTargets: [
    "editor:motion-scene-builder",
    "studio:shorts-extraction-studio",
    "projects:project-command-kanban",
   ],
   workflowTitle: `${title} script to production`,
   workflowGoal:
    "Move the assembled script into scene planning, priming shorts, and a production schedule.",
   workflowSteps: [
    {
     title: "Convert sections to scenes",
     surface: "editor",
     toolId: "motion-scene-builder",
     details:
      result.visualSuggestions
       .flatMap((suggestion) => suggestion.ideas)
       .slice(0, 4)
       .join(" | ") || `Break ${result.sections.length} sections into scene and asset prompts.`,
    },
    {
     title: "Produce priming shorts",
     surface: "studio",
     toolId: "shorts-extraction-studio",
     details:
      result.shortsIdeas
       .map((short) => `${short.postWindow}: ${short.hook}`)
       .join(" | ") || "No priming shorts proposed for this script.",
    },
    {
     title: "Plan production",
     surface: "projects",
     toolId: "project-command-kanban",
     details: `Schedule filming and editing for a ${formatClock(reconciliation?.actualMinutes ?? budget.allocatedMinutes)} runtime.`,
    },
   ],
   tags: ["script-architect", confidence, project.pacing],
  })

  await emitSignal("SCRIPT_ARCHITECT", "SCRIPT_PACKET_CREATED", packet)
  setStatus("Script packet saved with Vault artifact, workflow chain, and Brain signal.")
 }, [result, project, budget, reconciliation, lockSummary, emitSignal])

 return {
  project,
  budget,
  result,
  loading,
  error,
  status,
  restoredFromDraft,
  drafts,
  draftName,
  setDraftName,
  lockChecks,
  lockSummary,
  reconciliation,
  sectionPinOptions,
  setField,
  addChapter,
  updateChapter,
  removeChapter,
  moveChapter,
  addReference,
  updateReference,
  removeReference,
  addFragment,
  updateFragment,
  removeFragment,
  assemble,
  updateSectionScript,
  restoreLockedText,
  matchTargetToScript,
  rebalanceWeightsToScript,
  copyScript,
  savePacket,
  saveDraft,
  loadDraft,
  deleteDraft,
  startNewDraft,
 }
}
