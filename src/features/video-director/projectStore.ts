import {
  VideoDirectorAssetSchema,
  VideoDirectorGenerationJobSchema,
  VideoDirectorModeSchema,
  VideoDirectorProjectSchema,
  VideoDirectorRecipeRefSchema,
  VideoDirectorShotSchema,
  VideoDirectorVariantSchema,
  createEmptyVideoDirectorProject,
  type VideoDirectorProject,
} from "./projectSchema"
import {
  VideoDirectorCategoryIdSchema,
  type VideoDirectorCategoryId,
} from "./categorySchemas"
import { VIDEO_DIRECTOR_CATEGORY_IDS } from "./categoryRegistry"
import { VideoDirectorCategoryStateSchemas } from "./projectSchema"

export const VIDEO_DIRECTOR_STATE_KEY = "viewtube_video_director_state_v1"
export const VIDEO_DIRECTOR_VAULT_KEY = "viewtube_video_director_vault_v1"
export const VIDEO_DIRECTOR_CHANGED_EVENT = "vt_video_director_state_changed"

export interface VideoDirectorVaultEntry {
  id: string
  name: string
  project: VideoDirectorProject
  createdAt: string
  updatedAt: string
}

const canUseStorage = () =>
  typeof window !== "undefined" && typeof localStorage !== "undefined"

const readJson = (key: string): unknown => {
  if (!canUseStorage()) return null
  try {
    return JSON.parse(localStorage.getItem(key) || "null")
  } catch {
    return null
  }
}

const announce = () => {
  if (canUseStorage()) {
    window.dispatchEvent(new Event(VIDEO_DIRECTOR_CHANGED_EVENT))
  }
}

const parseArrayItems = <T>(
  value: unknown,
  parser: (entry: unknown) => { success: true; data: T } | { success: false },
): T[] => {
  if (!Array.isArray(value)) return []
  const parsed: T[] = []
  for (const entry of value) {
    const result = parser(entry)
    if (result.success) parsed.push(result.data)
  }
  return parsed
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const validIsoDate = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : fallback
}

/**
 * Repair partially corrupt or hand-edited local state without letting bad
 * category payloads leak into render planning. Valid categories/shots survive;
 * invalid pieces fall back independently.
 */
export const normalizeVideoDirectorProject = (value: unknown): VideoDirectorProject => {
  const complete = VideoDirectorProjectSchema.safeParse(value)
  if (complete.success) return complete.data

  const raw = asRecord(value)
  const fallback = createEmptyVideoDirectorProject(
    typeof raw.name === "string" && raw.name.trim() ? raw.name : undefined,
  )
  const now = new Date().toISOString()

  const modeResult = VideoDirectorModeSchema.safeParse(raw.mode)
  const activeCategoryResult = VideoDirectorCategoryIdSchema.safeParse(raw.activeCategoryId)
  const rawCategories = asRecord(raw.categories)

  const categories = { ...fallback.categories }
  for (const categoryId of VIDEO_DIRECTOR_CATEGORY_IDS) {
    const stateResult = VideoDirectorCategoryStateSchemas[categoryId].safeParse(
      rawCategories[categoryId],
    )
    if (stateResult.success) {
      ;(categories as Record<VideoDirectorCategoryId, unknown>)[categoryId] = stateResult.data
    }
  }

  const shots = parseArrayItems(raw.shots, (entry) => {
    const result = VideoDirectorShotSchema.safeParse(entry)
    return result.success
      ? { success: true as const, data: result.data }
      : { success: false as const }
  })

  const variants = parseArrayItems(raw.variants, (entry) => {
    const result = VideoDirectorVariantSchema.safeParse(entry)
    return result.success
      ? { success: true as const, data: result.data }
      : { success: false as const }
  })

  const assets = parseArrayItems(raw.assets, (entry) => {
    const result = VideoDirectorAssetSchema.safeParse(entry)
    return result.success
      ? { success: true as const, data: result.data }
      : { success: false as const }
  })

  const recipes = parseArrayItems(raw.recipes, (entry) => {
    const result = VideoDirectorRecipeRefSchema.safeParse(entry)
    return result.success
      ? { success: true as const, data: result.data }
      : { success: false as const }
  })

  const jobs = parseArrayItems(raw.jobs, (entry) => {
    const result = VideoDirectorGenerationJobSchema.safeParse(entry)
    return result.success
      ? { success: true as const, data: result.data }
      : { success: false as const }
  })

  return VideoDirectorProjectSchema.parse({
    ...fallback,
    id: typeof raw.id === "string" && raw.id.trim() ? raw.id : fallback.id,
    name:
      typeof raw.name === "string" && raw.name.trim()
        ? raw.name
        : fallback.name,
    mode: modeResult.success ? modeResult.data : fallback.mode,
    activeCategoryId: activeCategoryResult.success
      ? activeCategoryResult.data
      : fallback.activeCategoryId,
    createdAt: validIsoDate(raw.createdAt, fallback.createdAt),
    updatedAt: validIsoDate(raw.updatedAt, now),
    categories,
    shots,
    variants,
    assets,
    recipes,
    jobs,
  })
}

export const readVideoDirectorState = (): VideoDirectorProject | null => {
  const stored = readJson(VIDEO_DIRECTOR_STATE_KEY)
  return stored ? normalizeVideoDirectorProject(stored) : null
}

export const writeVideoDirectorState = (project: VideoDirectorProject): boolean => {
  if (!canUseStorage()) return false
  const validated = VideoDirectorProjectSchema.parse({
    ...project,
    updatedAt: new Date().toISOString(),
  })

  try {
    localStorage.setItem(VIDEO_DIRECTOR_STATE_KEY, JSON.stringify(validated))
  } catch (error) {
    console.warn("[VideoDirector] could not autosave project", error)
    return false
  }

  announce()
  return true
}

export const subscribeVideoDirectorState = (
  listener: (project: VideoDirectorProject | null) => void,
): (() => void) => {
  if (typeof window === "undefined") return () => {}

  const notify = () => listener(readVideoDirectorState())
  const onStorage = (event: StorageEvent) => {
    if (event.key !== VIDEO_DIRECTOR_STATE_KEY) return
    notify()
  }

  window.addEventListener(VIDEO_DIRECTOR_CHANGED_EVENT, notify)
  window.addEventListener("storage", onStorage)

  return () => {
    window.removeEventListener(VIDEO_DIRECTOR_CHANGED_EVENT, notify)
    window.removeEventListener("storage", onStorage)
  }
}

export const clearVideoDirectorState = (): void => {
  if (!canUseStorage()) return
  localStorage.removeItem(VIDEO_DIRECTOR_STATE_KEY)
  announce()
}

const parseVaultEntry = (value: unknown): VideoDirectorVaultEntry | null => {
  const raw = asRecord(value)
  if (typeof raw.id !== "string" || typeof raw.name !== "string") return null
  const project = normalizeVideoDirectorProject(raw.project)
  const timestamp = new Date().toISOString()

  return {
    id: raw.id,
    name: raw.name.trim() || project.name,
    project,
    createdAt: validIsoDate(raw.createdAt, timestamp),
    updatedAt: validIsoDate(raw.updatedAt, timestamp),
  }
}

export const readVideoDirectorVault = (): VideoDirectorVaultEntry[] => {
  const stored = readJson(VIDEO_DIRECTOR_VAULT_KEY)
  if (!Array.isArray(stored)) return []
  return stored
    .map(parseVaultEntry)
    .filter((entry): entry is VideoDirectorVaultEntry => Boolean(entry))
}

const writeVideoDirectorVault = (entries: VideoDirectorVaultEntry[]): boolean => {
  if (!canUseStorage()) return false
  try {
    localStorage.setItem(VIDEO_DIRECTOR_VAULT_KEY, JSON.stringify(entries))
  } catch (error) {
    console.warn("[VideoDirector] could not write project vault", error)
    return false
  }
  announce()
  return true
}

export const saveVideoDirectorDraft = (
  name: string,
  project: VideoDirectorProject,
): VideoDirectorVaultEntry[] => {
  const trimmed = name.trim() || project.name.trim() || "Untitled Video Director project"
  const existing = readVideoDirectorVault()
  const match = existing.find(
    (entry) => entry.name.toLowerCase() === trimmed.toLowerCase(),
  )
  const timestamp = new Date().toISOString()
  const nextEntry: VideoDirectorVaultEntry = {
    id: match?.id || `vtd-draft-${globalThis.crypto?.randomUUID?.() || Date.now().toString(36)}`,
    name: trimmed,
    project: VideoDirectorProjectSchema.parse({
      ...project,
      name: trimmed,
      updatedAt: timestamp,
    }),
    createdAt: match?.createdAt || timestamp,
    updatedAt: timestamp,
  }

  const next = match
    ? existing.map((entry) => (entry.id === match.id ? nextEntry : entry))
    : [nextEntry, ...existing]

  writeVideoDirectorVault(next)
  return next
}

export const removeVideoDirectorDraft = (id: string): VideoDirectorVaultEntry[] => {
  const next = readVideoDirectorVault().filter((entry) => entry.id !== id)
  writeVideoDirectorVault(next)
  return next
}

export interface VideoDirectorAutosaveController {
  schedule: (project: VideoDirectorProject) => void
  flush: () => void
  cancel: () => void
}

export const createVideoDirectorAutosaveController = (
  delayMs = 350,
): VideoDirectorAutosaveController => {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pending: VideoDirectorProject | null = null

  const flush = () => {
    if (timer) clearTimeout(timer)
    timer = null
    if (!pending) return
    const project = pending
    pending = null
    writeVideoDirectorState(project)
  }

  return {
    schedule(project) {
      pending = project
      if (timer) clearTimeout(timer)
      timer = setTimeout(flush, delayMs)
    },
    flush,
    cancel() {
      if (timer) clearTimeout(timer)
      timer = null
      pending = null
    },
  }
}
