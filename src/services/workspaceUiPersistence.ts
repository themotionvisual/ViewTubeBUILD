import { getWorkspaceUxPreferences } from "./workspaceUxPreferences"

const TOOLBOX_STATE_PREFIX = "viewtube:toolbox-open:v1:"
export const LAST_WORKSPACE_ROUTE_KEY = "viewtube:last-workspace-route:v1"

type ToolboxPersistenceDescriptor = {
  level: "main" | "sub"
  title: string
  variant?: string
  paletteIndex?: number | null
  persistenceId?: string
}

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

export const toolboxStateStorageKey = ({
  level,
  title,
  variant,
  paletteIndex,
  persistenceId,
}: ToolboxPersistenceDescriptor): string => {
  const route = typeof window === "undefined" ? "server" : window.location.pathname
  const identity = persistenceId || [
    level,
    variant || "default",
    normalize(title) || "untitled",
    paletteIndex == null ? "palette-auto" : `palette-${paletteIndex}`,
  ].join(":")
  return `${TOOLBOX_STATE_PREFIX}${encodeURIComponent(route)}:${encodeURIComponent(identity)}`
}

export const readPersistedToolboxOpen = (
  descriptor: ToolboxPersistenceDescriptor,
  fallback: boolean,
): boolean => {
  if (typeof window === "undefined" || !getWorkspaceUxPreferences().rememberToolboxState) return fallback
  const raw = window.localStorage.getItem(toolboxStateStorageKey(descriptor))
  if (raw === "open") return true
  if (raw === "closed") return false
  return fallback
}

export const persistToolboxOpen = (
  descriptor: ToolboxPersistenceDescriptor,
  open: boolean,
): void => {
  if (typeof window === "undefined" || !getWorkspaceUxPreferences().rememberToolboxState) return
  window.localStorage.setItem(toolboxStateStorageKey(descriptor), open ? "open" : "closed")
}

const RESTORABLE_WORKSPACE_PREFIXES = [
  "/studio",
  "/projects",
  "/ai-brain",
  "/local-analytics",
  "/editor",
  "/editor-v1",
] as const

export const isRestorableWorkspaceRoute = (route: string): boolean => {
  const path = String(route || "").split(/[?#]/, 1)[0]
  return RESTORABLE_WORKSPACE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

export const getLastWorkspaceRoute = (): string | null => {
  if (typeof window === "undefined") return null
  const route = window.localStorage.getItem(LAST_WORKSPACE_ROUTE_KEY)
  return route && isRestorableWorkspaceRoute(route) ? route : null
}

export const saveLastWorkspaceRoute = (route: string): void => {
  if (typeof window === "undefined" || !isRestorableWorkspaceRoute(route)) return
  window.localStorage.setItem(LAST_WORKSPACE_ROUTE_KEY, route)
}
