import { resolveQuickSwitcherPage } from "./recentDestinationHistory"

export const PINNED_DESTINATIONS_STORAGE_KEY = "viewtube:pinned-destinations:v1"
export const PINNED_DESTINATIONS_CHANGED_EVENT = "viewtube:pinned-destinations-changed"
const MAX_PINNED_DESTINATIONS = 12
const EMPTY_PINNED_DESTINATIONS: string[] = []
let cachedPinnedDestinations: string[] | null = null

const safeStorage = (): Storage | null => {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage || null
  } catch {
    return null
  }
}

export const getPinnedDestinationsServerSnapshot = (): string[] =>
  EMPTY_PINNED_DESTINATIONS

export const readPinnedDestinations = (): string[] => {
  if (cachedPinnedDestinations) return cachedPinnedDestinations
  const storage = safeStorage()
  if (!storage) {
    cachedPinnedDestinations = []
    return cachedPinnedDestinations
  }

  try {
    const raw = JSON.parse(storage.getItem(PINNED_DESTINATIONS_STORAGE_KEY) || "[]")
    if (!Array.isArray(raw)) {
      cachedPinnedDestinations = []
      return cachedPinnedDestinations
    }

    const unique = new Set<string>()
    for (const value of raw) {
      if (typeof value !== "string") continue
      const page = resolveQuickSwitcherPage(value)
      if (!page) continue
      unique.add(page.path)
      if (unique.size >= MAX_PINNED_DESTINATIONS) break
    }
    cachedPinnedDestinations = [...unique]
    return cachedPinnedDestinations
  } catch {
    cachedPinnedDestinations = []
    return cachedPinnedDestinations
  }
}

const writePinnedDestinations = (next: string[]): string[] => {
  const storage = safeStorage()
  const value = next.slice(0, MAX_PINNED_DESTINATIONS)
  cachedPinnedDestinations = value
  if (storage) storage.setItem(PINNED_DESTINATIONS_STORAGE_KEY, JSON.stringify(value))
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PINNED_DESTINATIONS_CHANGED_EVENT, { detail: value }))
  }
  return value
}

export const isDestinationPinned = (route: string): boolean => {
  const page = resolveQuickSwitcherPage(route)
  return Boolean(page && readPinnedDestinations().includes(page.path))
}

export const pinDestination = (route: string): string[] => {
  const page = resolveQuickSwitcherPage(route)
  if (!page) return readPinnedDestinations()
  const current = readPinnedDestinations().filter((path) => path !== page.path)
  return writePinnedDestinations([page.path, ...current])
}

export const unpinDestination = (route: string): string[] => {
  const page = resolveQuickSwitcherPage(route)
  if (!page) return readPinnedDestinations()
  return writePinnedDestinations(readPinnedDestinations().filter((path) => path !== page.path))
}

export const togglePinnedDestination = (route: string): string[] =>
  isDestinationPinned(route) ? unpinDestination(route) : pinDestination(route)

export const clearPinnedDestinations = (): void => {
  const storage = safeStorage()
  cachedPinnedDestinations = []
  storage?.removeItem(PINNED_DESTINATIONS_STORAGE_KEY)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PINNED_DESTINATIONS_CHANGED_EVENT, { detail: [] }))
  }
}

export const subscribePinnedDestinations = (listener: () => void): (() => void) => {
  if (typeof window === "undefined") return () => undefined

  const onChanged = () => listener()
  const onStorage = (event: StorageEvent) => {
    if (event.key && event.key !== PINNED_DESTINATIONS_STORAGE_KEY) return
    cachedPinnedDestinations = null
    listener()
  }

  window.addEventListener(PINNED_DESTINATIONS_CHANGED_EVENT, onChanged)
  window.addEventListener("storage", onStorage)

  return () => {
    window.removeEventListener(PINNED_DESTINATIONS_CHANGED_EVENT, onChanged)
    window.removeEventListener("storage", onStorage)
  }
}
