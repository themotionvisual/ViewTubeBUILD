export type WorkspaceUxToggleKey =
  | "mobileCompactTopBar"
  | "mobileNavigationAutoHide"
  | "preserveOrientationPosition"
  | "preservePagePosition"
  | "stickyModuleHeaders"
  | "edgeSwipeNavigation"
  | "thumbZoneShortcuts"
  | "keyboardPositionRestore"
  | "restoreLastWorkspace"
  | "rememberToolboxState"
  | "desktopKeyboardNavigation"

export interface WorkspaceUxPreferences {
  version: 1
  mobileCompactTopBar: boolean
  mobileNavigationAutoHide: boolean
  preserveOrientationPosition: boolean
  preservePagePosition: boolean
  stickyModuleHeaders: boolean
  edgeSwipeNavigation: boolean
  thumbZoneShortcuts: boolean
  keyboardPositionRestore: boolean
  restoreLastWorkspace: boolean
  rememberToolboxState: boolean
  desktopKeyboardNavigation: boolean
  updatedAt: number
}

export const WORKSPACE_UX_STORAGE_KEY = "viewtube:workspace-ux:v1"
export const WORKSPACE_UX_CHANGED_EVENT = "viewtube:workspace-ux-changed"

export const DEFAULT_WORKSPACE_UX_PREFERENCES: WorkspaceUxPreferences = {
  version: 1,
  mobileCompactTopBar: true,
  mobileNavigationAutoHide: false,
  preserveOrientationPosition: true,
  preservePagePosition: true,
  stickyModuleHeaders: false,
  edgeSwipeNavigation: false,
  thumbZoneShortcuts: false,
  keyboardPositionRestore: true,
  restoreLastWorkspace: false,
  rememberToolboxState: true,
  desktopKeyboardNavigation: false,
  updatedAt: 0,
}

let cachedPreferences: WorkspaceUxPreferences | null = null

const sanitizePreferences = (raw: Partial<WorkspaceUxPreferences> | null | undefined): WorkspaceUxPreferences => ({
  ...DEFAULT_WORKSPACE_UX_PREFERENCES,
  ...(raw || {}),
  version: 1,
  mobileCompactTopBar: raw?.mobileCompactTopBar !== false,
  mobileNavigationAutoHide: Boolean(raw?.mobileNavigationAutoHide),
  preserveOrientationPosition: raw?.preserveOrientationPosition !== false,
  preservePagePosition: raw?.preservePagePosition !== false,
  stickyModuleHeaders: Boolean(raw?.stickyModuleHeaders),
  edgeSwipeNavigation: Boolean(raw?.edgeSwipeNavigation),
  thumbZoneShortcuts: Boolean(raw?.thumbZoneShortcuts),
  keyboardPositionRestore: raw?.keyboardPositionRestore !== false,
  restoreLastWorkspace: Boolean(raw?.restoreLastWorkspace),
  rememberToolboxState: raw?.rememberToolboxState !== false,
  desktopKeyboardNavigation: Boolean(raw?.desktopKeyboardNavigation),
  updatedAt: Number(raw?.updatedAt || 0),
})

const readStoredPreferences = (): WorkspaceUxPreferences => {
  if (typeof window === "undefined") return DEFAULT_WORKSPACE_UX_PREFERENCES
  try {
    const raw = JSON.parse(window.localStorage.getItem(WORKSPACE_UX_STORAGE_KEY) || "{}") as Partial<WorkspaceUxPreferences>
    return sanitizePreferences(raw)
  } catch {
    return DEFAULT_WORKSPACE_UX_PREFERENCES
  }
}

export const getWorkspaceUxPreferences = (): WorkspaceUxPreferences => {
  if (!cachedPreferences) cachedPreferences = readStoredPreferences()
  return cachedPreferences
}

export const getWorkspaceUxPreferencesServerSnapshot = (): WorkspaceUxPreferences =>
  DEFAULT_WORKSPACE_UX_PREFERENCES

export const saveWorkspaceUxPreferences = (
  next: WorkspaceUxPreferences,
): WorkspaceUxPreferences => {
  const value = sanitizePreferences({ ...next, updatedAt: Date.now() })
  cachedPreferences = value
  if (typeof window !== "undefined") {
    window.localStorage.setItem(WORKSPACE_UX_STORAGE_KEY, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent(WORKSPACE_UX_CHANGED_EVENT, { detail: value }))
  }
  return value
}

export const patchWorkspaceUxPreferences = (
  patch: Partial<WorkspaceUxPreferences>,
): WorkspaceUxPreferences =>
  saveWorkspaceUxPreferences({
    ...getWorkspaceUxPreferences(),
    ...patch,
    version: 1,
  })

export const setWorkspaceUxToggle = (
  key: WorkspaceUxToggleKey,
  enabled: boolean,
): WorkspaceUxPreferences =>
  patchWorkspaceUxPreferences({ [key]: enabled } as Partial<WorkspaceUxPreferences>)

export const subscribeWorkspaceUxPreferences = (listener: () => void): (() => void) => {
  if (typeof window === "undefined") return () => undefined

  const onPreferenceChange = () => {
    cachedPreferences = readStoredPreferences()
    listener()
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key && event.key !== WORKSPACE_UX_STORAGE_KEY) return
    onPreferenceChange()
  }

  window.addEventListener(WORKSPACE_UX_CHANGED_EVENT, onPreferenceChange)
  window.addEventListener("storage", onStorage)

  return () => {
    window.removeEventListener(WORKSPACE_UX_CHANGED_EVENT, onPreferenceChange)
    window.removeEventListener("storage", onStorage)
  }
}
