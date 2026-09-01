// Shorts Generator → Video Editor bridge.
//
// The editor lives elsewhere in the repo; this file is the ONE place the
// Shorts Generator widget touches it, so a future refactor of the editor
// module only needs to update this shim.

export type ShortsClipHandoff = {
  id: string
  url?: string
  posterUrl?: string
  title?: string
  startSec: number
  endSec: number
  order: number
  aspect?: "9:16"
  meta?: { veoPrompt?: string; onScreenText?: string }
}

const HANDOFF_KEY = "vt_shorts_editor_handoff_v1"

export const stashHandoff = (clips: ShortsClipHandoff[]): void => {
  try {
    localStorage.setItem(HANDOFF_KEY, JSON.stringify({ ts: Date.now(), clips }))
  } catch { /* noop */ }
}

export const readHandoff = (): { ts: number; clips: ShortsClipHandoff[] } | null => {
  try {
    const raw = localStorage.getItem(HANDOFF_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export const clearHandoff = (): void => {
  try { localStorage.removeItem(HANDOFF_KEY) } catch { /* noop */ }
}

export const openEditorWithClips = (clips: ShortsClipHandoff[]): void => {
  stashHandoff(clips)
  // Any editor route on the app can read `vt_shorts_editor_handoff_v1`
  // and hydrate its timeline. Route path is app-dependent; we open the
  // canonical `/editor` deep-link with a source flag.
  window.open("/editor?source=shorts-generator", "_blank", "noopener,noreferrer")
}
