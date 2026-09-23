import type { NavigationLayout } from "./navigationContract"

export type QuickSwitcherCommand =
  | {
      id: "open-experience-settings"
      kind: "navigate"
      label: string
      description: string
      keywords: readonly string[]
      path: "/settings?panel=experience"
    }
  | {
      id: `layout-${NavigationLayout}`
      kind: "layout"
      label: string
      description: string
      keywords: readonly string[]
      layout: NavigationLayout
    }
  | {
      id: "clear-recent-destinations" | "clear-pinned-destinations"
      kind: "clear-local"
      label: string
      description: string
      keywords: readonly string[]
      target: "recent" | "pinned"
    }

export const QUICK_SWITCHER_COMMANDS: readonly QuickSwitcherCommand[] = [
  {
    id: "open-experience-settings",
    kind: "navigate",
    label: "Open Experience Settings",
    description: "Manage workspace, navigation, mobile and continuity preferences.",
    keywords: ["settings", "preferences", "experience", "workspace", "navigation"],
    path: "/settings?panel=experience",
  },
  {
    id: "layout-top",
    kind: "layout",
    label: "Use Top Bar Navigation",
    description: "Switch desktop navigation to the horizontal top bar.",
    keywords: ["layout", "navigation", "top", "bar", "horizontal"],
    layout: "top",
  },
  {
    id: "layout-wide",
    kind: "layout",
    label: "Use Wide Sidebar",
    description: "Switch desktop navigation to the full labeled sidebar.",
    keywords: ["layout", "navigation", "wide", "sidebar", "left"],
    layout: "wide",
  },
  {
    id: "layout-thin",
    kind: "layout",
    label: "Use Thin Sidebar",
    description: "Switch desktop navigation to the narrower labeled sidebar.",
    keywords: ["layout", "navigation", "thin", "sidebar", "narrow"],
    layout: "thin",
  },
  {
    id: "layout-rail",
    kind: "layout",
    label: "Use Icon Rail",
    description: "Switch desktop navigation to the compact icon-only rail.",
    keywords: ["layout", "navigation", "rail", "icons", "compact"],
    layout: "rail",
  },
  {
    id: "clear-recent-destinations",
    kind: "clear-local",
    label: "Clear Recent Destinations",
    description: "Remove local Quick Switcher recent-page history.",
    keywords: ["clear", "recent", "history", "destinations", "privacy"],
    target: "recent",
  },
  {
    id: "clear-pinned-destinations",
    kind: "clear-local",
    label: "Clear Pinned Destinations",
    description: "Remove all local Quick Switcher favorites.",
    keywords: ["clear", "pinned", "favorites", "stars", "destinations"],
    target: "pinned",
  },
] as const
