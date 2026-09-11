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
 * Persistence for Script Architect.
 *
 * A filled-in brief is expensive to re-enter — chapters, pasted research, and
 * hand-written script pieces — so the working draft autosaves to localStorage
 * and named drafts can be kept in a small vault. Follows the community-post
 * store: versioned payload, defensive normalization, one change event.
 */

export const SCRIPT_PROJECT_STATE_KEY = "viewtube_script_architect_state_v1"
export const SCRIPT_PROJECT_VAULT_KEY = "viewtube_script_architect_vault_v1"
export const SCRIPT_PROJECT_CHANGED_EVENT = "vt_script_architect_state_changed"

const PACINGS = new Set<ScriptPacing>(["tight", "standard", "breathing"])
const MODES = new Set<FragmentMode>(["lock", "improve", "inspire"])

const now = () => new Date().toISOString()

export const makeScriptId = (prefix: string): string =>
 `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`}`

export interface ScriptDraftV1 {
 version: 1
 id: string
 name: string
 project: ScriptProject
 /** The last assembled script, so a reload does not throw away a generation. */
 result: GeneratedScript | null
 createdAt: string
 updatedAt: string
}

export const emptyScriptProject = (): ScriptProject => ({
 topic: "",
 angle: "",
 niche: "",
 audience: "",
 tone: "Cinematic",
 goal: "Subscribe",
 targetMinutes: 10,
 pacing: "standard",
 includeHook: true,
 includeOutro: true,
 chapters: [makeChapter(), makeChapter(), makeChapter()],
 globalReferences: [],
 globalFragments: [],
})

export const makeChapter = (name = "", description = ""): ChapterInput => ({
 id: makeScriptId("ch"),
 name,
 description,
 weight: 1,
})

export const makeReference = (): ReferenceLink => ({ id: makeScriptId("ref"), url: "", note: "" })

export const makeFragment = (): ScriptFragment => ({
 id: makeScriptId("frag"),
 label: "",
 text: "",
 mode: "lock",
})

const asString = (value: unknown, fallback = ""): string =>
 typeof value === "string" ? value : value === undefined || value === null ? fallback : String(value)

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const normalizeChapter = (value: unknown, index: number): ChapterInput => {
 const raw = (value || {}) as Record<string, unknown>
 const weight = Number(raw.weight)
 return {
  id: asString(raw.id) || makeScriptId(`ch-${index}`),
  name: asString(raw.name),
  description: asString(raw.description),
  weight: Number.isFinite(weight) && weight > 0 ? weight : 1,
 }
}

const normalizeReference = (value: unknown, index: number): ReferenceLink => {
 const raw = (value || {}) as Record<string, unknown>
 return {
  id: asString(raw.id) || makeScriptId(`ref-${index}`),
  url: asString(raw.url),
  note: asString(raw.note),
  chapterId: raw.chapterId ? asString(raw.chapterId) : undefined,
 }
}

const normalizeFragment = (value: unknown, index: number): ScriptFragment => {
 const raw = (value || {}) as Record<string, unknown>
 const mode = asString(raw.mode, "lock") as FragmentMode
 return {
  id: asString(raw.id) || makeScriptId(`frag-${index}`),
  label: asString(raw.label),
  text: asString(raw.text),
  mode: MODES.has(mode) ? mode : "lock",
  chapterId: raw.chapterId ? asString(raw.chapterId) : undefined,
 }
}

/** Coerce anything (old shape, hand-edited storage, junk) into a usable project. */
export const normalizeScriptProject = (value: unknown): ScriptProject => {
 const raw = (value || {}) as Record<string, unknown>
 const fallback = emptyScriptProject()
 const pacing = asString(raw.pacing, "standard") as ScriptPacing
 const targetMinutes = Number(raw.targetMinutes)
 const chapters = asArray(raw.chapters).map(normalizeChapter)

 return {
  topic: asString(raw.topic),
  angle: asString(raw.angle),
  niche: asString(raw.niche),
  audience: asString(raw.audience),
  tone: asString(raw.tone, fallback.tone) || fallback.tone,
  goal: asString(raw.goal, fallback.goal) || fallback.goal,
  targetMinutes:
   Number.isFinite(targetMinutes) && targetMinutes > 0 ? Math.min(90, Math.max(1, targetMinutes)) : 10,
  pacing: PACINGS.has(pacing) ? pacing : "standard",
  includeHook: raw.includeHook !== false,
  includeOutro: raw.includeOutro !== false,
  chapters: chapters.length ? chapters : fallback.chapters,
  globalReferences: asArray(raw.globalReferences).map(normalizeReference),
  globalFragments: asArray(raw.globalFragments).map(normalizeFragment),
 }
}

const normalizeResult = (value: unknown): GeneratedScript | null => {
 if (!value || typeof value !== "object") return null
 const raw = value as Record<string, unknown>
 if (!Array.isArray(raw.sections)) return null
 const strings = (input: unknown) => asArray(input).map((entry) => asString(entry)).filter(Boolean)
 return {
  outline: asArray(raw.outline).map((entry) => {
   const item = (entry || {}) as Record<string, unknown>
   return {
    sectionId: asString(item.sectionId),
    section: asString(item.section),
    beats: strings(item.beats),
   }
  }),
  timeline: asArray(raw.timeline) as GeneratedScript["timeline"],
  sections: asArray(raw.sections).map((entry) => {
   const item = (entry || {}) as Record<string, unknown>
   return {
    sectionId: asString(item.sectionId),
    label: asString(item.label),
    kind: (asString(item.kind, "chapter") || "chapter") as GeneratedScript["sections"][number]["kind"],
    script: asString(item.script),
    lockedFragmentIds: strings(item.lockedFragmentIds),
   }
  }),
  fullScript: asString(raw.fullScript),
  visualSuggestions: asArray(raw.visualSuggestions).map((entry) => {
   const item = (entry || {}) as Record<string, unknown>
   return { sectionId: asString(item.sectionId), ideas: strings(item.ideas) }
  }),
  shortsIdeas: asArray(raw.shortsIdeas).map((entry) => {
   const item = (entry || {}) as Record<string, unknown>
   return {
    sourceSectionId: item.sourceSectionId ? asString(item.sourceSectionId) : undefined,
    hook: asString(item.hook),
    excerpt: asString(item.excerpt),
    primingRationale: asString(item.primingRationale),
    postWindow: asString(item.postWindow),
   }
  }),
  assumptions: strings(raw.assumptions),
  groundingNotes: strings(raw.groundingNotes),
 }
}

export const normalizeScriptDraft = (value: unknown): ScriptDraftV1 => {
 const raw = (value || {}) as Record<string, unknown>
 const timestamp = now()
 return {
  version: 1,
  id: asString(raw.id) || makeScriptId("draft"),
  name: asString(raw.name),
  project: normalizeScriptProject(raw.project),
  result: normalizeResult(raw.result),
  createdAt: asString(raw.createdAt, timestamp) || timestamp,
  updatedAt: asString(raw.updatedAt, timestamp) || timestamp,
 }
}

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

const readJson = (key: string): unknown => {
 if (!canUseStorage()) return null
 try {
  return JSON.parse(localStorage.getItem(key) || "null")
 } catch {
  return null
 }
}

const announce = () => {
 if (canUseStorage()) window.dispatchEvent(new Event(SCRIPT_PROJECT_CHANGED_EVENT))
}

/** The autosaved working draft, or null when nothing has been saved yet. */
export const readScriptProjectState = (): ScriptDraftV1 | null => {
 const stored = readJson(SCRIPT_PROJECT_STATE_KEY)
 return stored ? normalizeScriptDraft(stored) : null
}

export const writeScriptProjectState = (
 project: ScriptProject,
 result: GeneratedScript | null,
): void => {
 if (!canUseStorage()) return
 const existing = readScriptProjectState()
 const draft: ScriptDraftV1 = {
  version: 1,
  id: existing?.id || makeScriptId("draft"),
  name: existing?.name || "",
  project,
  result,
  createdAt: existing?.createdAt || now(),
  updatedAt: now(),
 }
 try {
  localStorage.setItem(SCRIPT_PROJECT_STATE_KEY, JSON.stringify(draft))
 } catch (error) {
  // A quota failure must never take the tool down mid-edit.
  console.warn("[ScriptArchitect] could not autosave draft", error)
  return
 }
 announce()
}

export const clearScriptProjectState = (): void => {
 if (!canUseStorage()) return
 localStorage.removeItem(SCRIPT_PROJECT_STATE_KEY)
 announce()
}

export const readScriptVault = (): ScriptDraftV1[] => {
 const stored = readJson(SCRIPT_PROJECT_VAULT_KEY)
 return Array.isArray(stored) ? stored.map(normalizeScriptDraft) : []
}

const writeScriptVault = (vault: ScriptDraftV1[]): void => {
 if (!canUseStorage()) return
 try {
  localStorage.setItem(SCRIPT_PROJECT_VAULT_KEY, JSON.stringify(vault))
 } catch (error) {
  console.warn("[ScriptArchitect] could not write the script vault", error)
  return
 }
 announce()
}

/** Save the current project under a name, replacing a same-named entry. */
export const saveScriptDraft = (
 name: string,
 project: ScriptProject,
 result: GeneratedScript | null,
): ScriptDraftV1[] => {
 const trimmed = name.trim() || project.topic.trim() || "Untitled script"
 const vault = readScriptVault()
 const existing = vault.find((draft) => draft.name.toLowerCase() === trimmed.toLowerCase())
 const timestamp = now()
 const draft: ScriptDraftV1 = {
  version: 1,
  id: existing?.id || makeScriptId("draft"),
  name: trimmed,
  project,
  result,
  createdAt: existing?.createdAt || timestamp,
  updatedAt: timestamp,
 }
 const next = existing
  ? vault.map((entry) => (entry.id === existing.id ? draft : entry))
  : [draft, ...vault]
 writeScriptVault(next)
 return next
}

export const removeScriptDraft = (id: string): ScriptDraftV1[] => {
 const next = readScriptVault().filter((draft) => draft.id !== id)
 writeScriptVault(next)
 return next
}
