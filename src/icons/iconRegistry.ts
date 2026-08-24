// vt-1466 — Central icon registry mapping tool/visual IDs to canonical
// SVG components.
//
// Today there are TWO parallel icon lookup surfaces:
//
//   * `CustomIcon` (src/components/CustomIcon.tsx) — string key -> SVG file
//     path under src/assets/icons/. Used for general app UI (nav, buttons).
//   * `AnalyticsVisualIcon` (src/components/AnalyticsVisualIcon.tsx) —
//     string key -> Lucide component. Used specifically for analytics
//     visuals via the `iconKey` prop on `visualStyle`.
//
// The two maps overlap on some keys ("analytics", "database", "video", …)
// and one component may end up rendering a different glyph than the other
// for the same nominal id, which is exactly the silent drift the task calls
// out.
//
// This module doesn't rewrite either — that's a bigger migration — but it
// exposes ONE lookup, `resolveVtIcon(id)`, that consults both and returns a
// discriminated union. Any caller can use it today, and the governance test
// alongside it guards against duplicate/conflicting registrations.
//
// Migration plan (follow-up):
//   1. Land this registry.
//   2. Route new visual/tool components through `resolveVtIcon`.
//   3. Once every caller is migrated, delete the two legacy maps and inline
//      their entries into VT_ICON_REGISTRY.

import type { LucideIcon } from "lucide-react"

/** Discriminated union covering both the SVG-file and Lucide-component paths. */
export type VtIconAsset =
 | { kind: "svg-file"; fileName: string }
 | { kind: "lucide"; component: LucideIcon }

export type VtIconRegistryEntry = {
 id: string
 /** Human-readable description of what the icon represents. */
 label: string
 /** Which physical asset backs this id. */
 asset: VtIconAsset
 /** Which surfaces are allowed to render this icon.
  *
  *   - "nav"         — nav bar, drawer, command palette
  *   - "widget"      — dashboard widgets, tool cards, buttons
  *   - "visual"      — analytics visual headers (rendered by AnalyticsVisualIcon)
  *   - "diagnostic"  — dev-only surfaces (debug UI, inspector)
  *
  * Multiple surfaces are fine — an icon that's valid everywhere lists all four.
  */
 surfaces: ReadonlyArray<"nav" | "widget" | "visual" | "diagnostic">
}

/** The registry itself.
 *
 * Populate incrementally as callers migrate. The `svgFile()` and `lucide()`
 * helpers below produce the correct asset shape so entries stay one-liners.
 *
 * Legacy lookups continue to work: consumers that pass an unknown id fall
 * back to `null` from `resolveVtIcon`; callers can then hit their existing
 * legacy map for the transitional period.
 */
export const VT_ICON_REGISTRY: ReadonlyArray<VtIconRegistryEntry> = Object.freeze([
 // Intentionally starts empty. Each migrating caller adds its entry here in
 // its own PR — landing this registry does not itself require touching
 // any current component. Governance test below asserts uniqueness.
])

const svgFile = (fileName: string): VtIconAsset => ({ kind: "svg-file", fileName })
const lucide = (component: LucideIcon): VtIconAsset => ({ kind: "lucide", component })

// Re-exported so entries can be written as one-liners once callers migrate:
//   { id: "shorts-retention", label: "Shorts Retention", asset: svgFile("!!!SHORTS.svg"), surfaces: ["visual"] }
//   { id: "search",          label: "Search",           asset: lucide(Search),          surfaces: ["nav", "widget"] }
export const iconAsset = { svgFile, lucide } as const

/** Immutable lookup by id. Returns null when unregistered — callers should
 *  fall back to whatever legacy map they used previously for now. */
export const resolveVtIcon = (id: string | null | undefined): VtIconRegistryEntry | null => {
 if (!id) return null
 return VT_ICON_REGISTRY.find((entry) => entry.id === id) ?? null
}

/** Enumerate every id registered for a specific surface. */
export const listVtIconsForSurface = (
 surface: VtIconRegistryEntry["surfaces"][number],
): VtIconRegistryEntry[] => VT_ICON_REGISTRY.filter((entry) => entry.surfaces.includes(surface))
