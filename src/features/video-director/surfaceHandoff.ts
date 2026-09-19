import {
  VIDEO_DIRECTOR_CATEGORY_IDS,
  type VideoDirectorCategoryId,
} from "./categoryRegistry"

const VIDEO_DIRECTOR_HANDOFF_KEY = "viewtube.video-director.surface-handoff.v1"

export interface VideoDirectorSurfaceHandoff {
  categoryId: VideoDirectorCategoryId
  scopeKey: string
  source: "dashboard" | "studio"
  target: "dashboard" | "studio"
  createdAt: string
}

const canUseSessionStorage = () =>
  typeof window !== "undefined" && typeof window.sessionStorage !== "undefined"

export const writeVideoDirectorSurfaceHandoff = (
  value: Omit<VideoDirectorSurfaceHandoff, "createdAt">,
) => {
  if (!canUseSessionStorage()) return
  window.sessionStorage.setItem(
    VIDEO_DIRECTOR_HANDOFF_KEY,
    JSON.stringify({ ...value, createdAt: new Date().toISOString() }),
  )
}

export const readVideoDirectorSurfaceHandoff = (
  target?: VideoDirectorSurfaceHandoff["target"],
): VideoDirectorSurfaceHandoff | null => {
  if (!canUseSessionStorage()) return null
  try {
    const raw = JSON.parse(window.sessionStorage.getItem(VIDEO_DIRECTOR_HANDOFF_KEY) || "null")
    if (!raw || typeof raw !== "object") return null
    if (!VIDEO_DIRECTOR_CATEGORY_IDS.includes(raw.categoryId)) return null
    if (typeof raw.scopeKey !== "string" || !raw.scopeKey) return null
    if (raw.source !== "dashboard" && raw.source !== "studio") return null
    if (raw.target !== "dashboard" && raw.target !== "studio") return null
    if (target && raw.target !== target) return null
    return raw as VideoDirectorSurfaceHandoff
  } catch {
    return null
  }
}

export const clearVideoDirectorSurfaceHandoff = () => {
  if (!canUseSessionStorage()) return
  window.sessionStorage.removeItem(VIDEO_DIRECTOR_HANDOFF_KEY)
}
