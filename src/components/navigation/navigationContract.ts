import { assertUniqueIds } from "../../services/registryAssertions"
import type { NavIconId } from "./navIcons"

// "rail" is the new icons-only collapse mode — same widget positions as
// "wide"/"thin" but the sidebar shrinks to icon-only and reclaims the
// rest of the viewport for content.
export type NavigationLayout = "top" | "wide" | "thin" | "rail"

export const NAVIGATION_STORAGE_KEY = "vt_navigation_layout"

export const parseNavigationLayout = (value: string | null): NavigationLayout =>
  value === "wide" || value === "thin" || value === "top" || value === "rail" ? value : "top"

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
