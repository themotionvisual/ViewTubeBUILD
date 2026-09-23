import { PAGE_REGISTRY, type PageRegistryEntry } from "../app/pageRegistry"

export const RECENT_DESTINATIONS_STORAGE_KEY = "viewtube:recent-destinations:v1"
export const RECENT_DESTINATIONS_CHANGED_EVENT = "viewtube:recent-destinations-changed"
const MAX_RECENT_DESTINATIONS = 8

export interface RecentDestination {
  path: string
  title: string
  section: PageRegistryEntry["section"]
  visitedAt: number
}

const EMPTY_RECENT_DESTINATIONS: RecentDestination[] = []
let cachedRecentDestinations: RecentDestination[] | null = null

export const getRecentDestinationsServerSnapshot = (): RecentDestination[] =>
  EMPTY_RECENT_DESTINATIONS

const safeStorage = (): Storage | null => {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage || null
  } catch {
    return null
  }
}

const canonicalPath = (route: string): string => String(route || "").split(/[?#]/, 1)[0] || "/"

export const quickSwitcherPages = (): PageRegistryEntry[] =>
  PAGE_REGISTRY.filter((entry) =>
    entry.lifecycle === "production" &&
    entry.navigationVisibility !== "hidden" &&
    !entry.path.includes(":"),
  )

export const resolveQuickSwitcherPage = (route: string): PageRegistryEntry | null => {
  const path = canonicalPath(route)
  return quickSwitcherPages().find((entry) =>
    entry.path === path || entry.aliases?.includes(path),
  ) || null
}

export const readRecentDestinations = (): RecentDestination[] => {
  if (cachedRecentDestinations) return cachedRecentDestinations
  const storage = safeStorage()
  if (!storage) {
    cachedRecentDestinations = []
    return cachedRecentDestinations
  }
  try {
    const raw = JSON.parse(storage.getItem(RECENT_DESTINATIONS_STORAGE_KEY) || "[]")
    if (!Array.isArray(raw)) {
      cachedRecentDestinations = []
      return cachedRecentDestinations
    }
    cachedRecentDestinations = raw
      .filter((item): item is RecentDestination =>
        Boolean(item) &&
        typeof item.path === "string" &&
        typeof item.title === "string" &&
        typeof item.section === "string" &&
        Number.isFinite(Number(item.visitedAt)),
      )
      .slice(0, MAX_RECENT_DESTINATIONS)
    return cachedRecentDestinations
  } catch {
    cachedRecentDestinations = []
    return cachedRecentDestinations
  }
}

export const recordRecentDestination = (route: string): RecentDestination[] => {
  const storage = safeStorage()
  const page = resolveQuickSwitcherPage(route)
  if (!storage || !page) return readRecentDestinations()

  const item: RecentDestination = {
    path: page.path,
    title: page.title,
    section: page.section,
    visitedAt: Date.now(),
  }
  const next = [
    item,
    ...readRecentDestinations().filter((recent) => recent.path !== item.path),
  ].slice(0, MAX_RECENT_DESTINATIONS)

  cachedRecentDestinations = next
  storage.setItem(RECENT_DESTINATIONS_STORAGE_KEY, JSON.stringify(next))
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(RECENT_DESTINATIONS_CHANGED_EVENT, { detail: next }))
  }
  return next
}

export const clearRecentDestinations = (): void => {
  const storage = safeStorage()
  if (!storage) return
  cachedRecentDestinations = []
  storage.removeItem(RECENT_DESTINATIONS_STORAGE_KEY)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(RECENT_DESTINATIONS_CHANGED_EVENT, { detail: [] }))
  }
}

export const subscribeRecentDestinations = (listener: () => void): (() => void) => {
  if (typeof window === "undefined") return () => undefined
  const onChanged = () => listener()
  const onStorage = (event: StorageEvent) => {
    if (event.key && event.key !== RECENT_DESTINATIONS_STORAGE_KEY) return
    cachedRecentDestinations = null
    listener()
  }
  window.addEventListener(RECENT_DESTINATIONS_CHANGED_EVENT, onChanged)
  window.addEventListener("storage", onStorage)
  return () => {
    window.removeEventListener(RECENT_DESTINATIONS_CHANGED_EVENT, onChanged)
    window.removeEventListener("storage", onStorage)
  }
}
