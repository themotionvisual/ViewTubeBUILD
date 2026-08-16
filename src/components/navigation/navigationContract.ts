export type NavigationLayout = "top" | "wide" | "thin"

export const NAVIGATION_STORAGE_KEY = "vt_navigation_layout"

export const parseNavigationLayout = (value: string | null): NavigationLayout =>
  value === "wide" || value === "thin" || value === "top" ? value : "top"

export const PRIMARY_NAV_ITEMS = [
  { id: "DASHBOARD", path: "/", label: "Dashboard", paletteIndex: 0 },
  { id: "STUDIO", path: "/studio", label: "Studio", paletteIndex: 1 },
  { id: "PROJECTS", path: "/projects", label: "Projects", paletteIndex: 2 },
  { id: "AI_BRAIN", path: "/ai-brain", label: "AI Brain", paletteIndex: 3 },
  { id: "VT_SYNC", path: "/local-analytics", label: "Analytics", paletteIndex: 4 },
  { id: "EDITOR", path: "/editor", label: "Editor", paletteIndex: 5 },
  { id: "SETTINGS", path: "/settings", label: "Settings", paletteIndex: 6 },
  { id: "USER_GUIDE", path: "/user-guide", label: "User Guide", paletteIndex: 7 },
] as const
