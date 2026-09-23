import { assertUniqueIds } from "../../services/registryAssertions"
import type { NavIconId } from "./navIcons"

// "rail" is the new icons-only collapse mode — same widget positions as
// "wide"/"thin" but the sidebar shrinks to icon-only and reclaims the
// rest of the viewport for content.
export type NavigationLayout = "top" | "wide" | "thin" | "rail"

export const NAVIGATION_STORAGE_KEY = "vt_navigation_layout"
export const NAVIGATION_LAYOUT_CHANGED_EVENT = "viewtube:navigation-layout-changed"
let volatileNavigationLayout: NavigationLayout = "top"

export const parseNavigationLayout = (value: string | null): NavigationLayout =>
  value === "wide" || value === "thin" || value === "top" || value === "rail" ? value : "top"

export const getNavigationLayout = (): NavigationLayout => {
  if (typeof window === "undefined") return "top"
  try {
    return parseNavigationLayout(window.localStorage?.getItem(NAVIGATION_STORAGE_KEY) || null)
  } catch {
    return volatileNavigationLayout
  }
}

export const getNavigationLayoutServerSnapshot = (): NavigationLayout => "top"

export const setNavigationLayoutPreference = (layout: NavigationLayout): NavigationLayout => {
  volatileNavigationLayout = layout
  if (typeof window !== "undefined") {
    try {
      window.localStorage?.setItem(NAVIGATION_STORAGE_KEY, layout)
    } catch {
      // Volatile state still lets live subscribers switch layouts for this session.
    }
    window.dispatchEvent(new CustomEvent(NAVIGATION_LAYOUT_CHANGED_EVENT, { detail: layout }))
  }
  return layout
}

export const subscribeNavigationLayout = (listener: () => void): (() => void) => {
  if (typeof window === "undefined") return () => undefined

  const onLayoutChange = () => listener()
  const onStorage = (event: StorageEvent) => {
    if (event.key && event.key !== NAVIGATION_STORAGE_KEY) return
    volatileNavigationLayout = parseNavigationLayout(event.newValue)
    listener()
  }

  window.addEventListener(NAVIGATION_LAYOUT_CHANGED_EVENT, onLayoutChange)
  window.addEventListener("storage", onStorage)

  return () => {
    window.removeEventListener(NAVIGATION_LAYOUT_CHANGED_EVENT, onLayoutChange)
    window.removeEventListener("storage", onStorage)
  }
}

export const PRIMARY_NAV_ITEMS: ReadonlyArray<{
  id: string
  path: string
  label: string
  paletteIndex: number
  iconId: NavIconId
}> = [
  { id: "DASHBOARD",  path: "/",                 label: "Dashboard",  paletteIndex: 0, iconId: "dashboard"  },
  { id: "STUDIO",     path: "/studio",           label: "Studio",     paletteIndex: 1, iconId: "studio"     },
  { id: "PROJECTS",   path: "/projects",         label: "Projects",   paletteIndex: 2, iconId: "projects"   },
  { id: "AI_BRAIN",   path: "/ai-brain",         label: "AI Brain",   paletteIndex: 3, iconId: "ai_brain"   },
  { id: "VT_SYNC",    path: "/local-analytics",  label: "Analytics",  paletteIndex: 4, iconId: "analytics"  },
  { id: "EDITOR",     path: "/editor",           label: "Editor",     paletteIndex: 5, iconId: "editor"     },
  { id: "SETTINGS",   path: "/settings",         label: "Settings",   paletteIndex: 6, iconId: "settings"   },
  { id: "USER_GUIDE", path: "/user-guide",       label: "User Guide", paletteIndex: 7, iconId: "user_guide" },
] as const

if (import.meta.env.DEV) {
  assertUniqueIds(PRIMARY_NAV_ITEMS, (item) => item.id, "Primary navigation")
}
