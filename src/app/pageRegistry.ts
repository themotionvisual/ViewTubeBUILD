// vt-2311 — Central Page Registry
//
// Today the app's routes live in `src/app/AppRoutes.tsx` and the visible
// navigation lives in `src/components/navigation/navigationContract.ts` +
// `src/components/navigation/applicationMenuContract.ts`. These three
// sources of truth drift apart silently — a route can exist without a nav
// link, a nav link can point at a non-existent route, and neither is
// tagged with product-section or Production / Beta / Lab / Hidden status.
//
// This registry is the single source of truth for:
//   * path (canonical URL)
//   * title (page's own title, not the tab title)
//   * section (Analytics / Studio / Vault / Account / Editor / Reference / …)
//   * navigationVisibility (top-nav / drawer / hidden)
//   * lifecycle (production / beta / lab / hidden / legacy)
//
// The initial stub lists every current route with `navigationVisibility:
// "hidden"` and `lifecycle: "unclassified"` as safe defaults. As nav/menu
// contracts adopt this registry, entries get tagged with their real
// visibility and section.
//
// A governance test in pageRegistry.test.ts asserts every path in
// AppRoutes.tsx appears here — so a newly-added route MUST be classified,
// even if only as "hidden/unclassified" for the first PR.

export type PageSection =
 | "analytics"
 | "studio"
 | "vault"
 | "account"
 | "editor"
 | "reference"
 | "system"
 | "onboarding"
 | "unclassified"

export type PageNavigationVisibility = "top-nav" | "drawer" | "both" | "hidden"

export type PageLifecycle = "production" | "beta" | "lab" | "hidden" | "legacy" | "unclassified"

export interface PageRegistryEntry {
 /** The exact react-router path (with :params if any). */
 path: string
 /** Short human-readable name for the destination. */
 title: string
 /** Product section this page belongs to — used by navigation grouping. */
 section: PageSection
 /** Where the page appears in navigation UIs (nav vs drawer vs neither). */
 navigationVisibility: PageNavigationVisibility
 /** Production readiness state. Only "production" pages ship in default nav. */
 lifecycle: PageLifecycle
 /** Optional short description for search / command palette. */
 description?: string
 /** Optional aliases (redirect sources) — same page, alternate URL. */
 aliases?: readonly string[]
}

/**
 * Registry populated as of 2026-08-24. Every entry here corresponds to a
 * <Route> in AppRoutes.tsx. When adding a new route, add its entry here
 * FIRST (pageRegistry.test.ts fails otherwise) — even if you don't know
 * the section yet, `unclassified` + `hidden` is a valid stub.
 */
export const PAGE_REGISTRY: readonly PageRegistryEntry[] = Object.freeze([
 { path: "/", title: "Dashboard", section: "studio", navigationVisibility: "top-nav", lifecycle: "production" },
 { path: "/dashboard-legacy", title: "Dashboard (legacy)", section: "studio", navigationVisibility: "hidden", lifecycle: "legacy" },
 { path: "/studio", title: "Studio Hub", section: "studio", navigationVisibility: "top-nav", lifecycle: "production" },
 { path: "/performance", title: "Performance Hub", section: "analytics", navigationVisibility: "top-nav", lifecycle: "production" },
 { path: "/legacy/channelytics", title: "Channelytics (legacy)", section: "analytics", navigationVisibility: "hidden", lifecycle: "legacy" },
 { path: "/legacy/research-lab", title: "Research Lab (legacy)", section: "reference", navigationVisibility: "hidden", lifecycle: "legacy" },
 { path: "/research-lab", title: "Research Lab", section: "reference", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/graphs", title: "Graphs", section: "analytics", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/graphs/shorts-retention", title: "Shorts Retention", section: "analytics", navigationVisibility: "hidden", lifecycle: "production" },
 { path: "/legacy/data-vizualizations", title: "Data Visualizations (legacy)", section: "analytics", navigationVisibility: "hidden", lifecycle: "legacy" },
 { path: "/studio/internal-analytics", title: "Internal Analytics", section: "system", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/account", title: "Account", section: "account", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/account/connect", title: "Connect Account", section: "account", navigationVisibility: "hidden", lifecycle: "production" },
 { path: "/settings", title: "Settings", section: "account", navigationVisibility: "drawer", lifecycle: "production", aliases: ["/account"] },
 { path: "/subscribe", title: "Subscribe", section: "account", navigationVisibility: "hidden", lifecycle: "production" },
 { path: "/data-transparency", title: "Data & Privacy", section: "account", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/ai-brain", title: "AI Brain", section: "studio", navigationVisibility: "top-nav", lifecycle: "production" },
 { path: "/local-analytics", title: "Analytics", section: "analytics", navigationVisibility: "top-nav", lifecycle: "production", aliases: ["/analytics", "/vt-sync-local"] },
 { path: "/analytics", title: "Analytics (alias)", section: "analytics", navigationVisibility: "hidden", lifecycle: "production" },
 { path: "/vt-sync-local", title: "VT Sync Local (alias)", section: "analytics", navigationVisibility: "hidden", lifecycle: "production" },
 { path: "/intelligence", title: "Intelligence Hub", section: "analytics", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/shorts", title: "Shorts (redirect)", section: "editor", navigationVisibility: "hidden", lifecycle: "legacy" },
 { path: "/editor", title: "Editor", section: "editor", navigationVisibility: "top-nav", lifecycle: "production" },
 { path: "/editor-v1", title: "Editor V1 (redirect)", section: "editor", navigationVisibility: "hidden", lifecycle: "legacy" },
 { path: "/internal/editor-v1-legacy", title: "Editor V1 legacy (redirect)", section: "editor", navigationVisibility: "hidden", lifecycle: "legacy" },
 { path: "/internal/editor-dev", title: "Editor dev (redirect)", section: "editor", navigationVisibility: "hidden", lifecycle: "legacy" },
 { path: "/projects", title: "Projects", section: "studio", navigationVisibility: "top-nav", lifecycle: "production", aliases: ["/project-calendar"] },
 { path: "/project-calendar", title: "Project Calendar (alias)", section: "studio", navigationVisibility: "hidden", lifecycle: "production" },
 { path: "/reference-studio", title: "Reference Studio", section: "reference", navigationVisibility: "drawer", lifecycle: "lab" },
 { path: "/reference-studio/:tabId", title: "Reference Studio (tab)", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/reference-studio-v2", title: "Reference Studio V2 (redirect)", section: "reference", navigationVisibility: "hidden", lifecycle: "legacy" },
 { path: "/stuff", title: "Stuff (redirect)", section: "reference", navigationVisibility: "hidden", lifecycle: "legacy" },
 { path: "/stuff/:tabId", title: "Stuff (tab redirect)", section: "reference", navigationVisibility: "hidden", lifecycle: "legacy" },
 { path: "/sources-lab", title: "Sources Lab", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/component-catalog", title: "Component Catalog", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/component-grid", title: "Component Grid", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/component-grid-lab", title: "Component Grid Lab", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/bench/:benchId", title: "Bench", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/render-bench/reference-studio", title: "Render Bench — Reference Studio", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/render-bench/reference-studio/:tabId", title: "Render Bench — Reference Studio (tab)", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/render-bench/:benchId", title: "Render Bench", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/user-guide", title: "User Guide", section: "system", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/about", title: "About", section: "system", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/charts-gallery", title: "Charts Gallery", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/charts-gallery/master-graphs", title: "Charts Gallery — Master Graphs", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/charts-gallery/toolbox-preview", title: "Charts Gallery — Toolbox Preview", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/charts-gallery/research-lab", title: "Charts Gallery — Research Lab", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/charts-gallery/performance-hub", title: "Charts Gallery — Performance Hub", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/charts-gallery/channelytics", title: "Charts Gallery — Channelytics", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/charts-gallery/data-viz", title: "Charts Gallery — Data Viz", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/charts-gallery/kpi", title: "Charts Gallery — KPI", section: "reference", navigationVisibility: "hidden", lifecycle: "lab" },
 { path: "/video-manager", title: "Video Manager", section: "studio", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/strategy", title: "Strategy", section: "studio", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/vault", title: "Vault", section: "vault", navigationVisibility: "top-nav", lifecycle: "production" },
 { path: "/simple-analytics", title: "Simple Analytics", section: "analytics", navigationVisibility: "hidden", lifecycle: "legacy" },
 { path: "/media-analyzer", title: "Media Analyzer", section: "studio", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/seo-generator", title: "SEO Generator", section: "studio", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/video-publisher", title: "Video Publisher", section: "studio", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/hook-generator", title: "Hook Generator", section: "studio", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/thumbnail-studio", title: "Thumbnail Studio", section: "studio", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/algorithm-architect", title: "Algorithm Architect", section: "studio", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/storyboard-studio", title: "Storyboard Studio", section: "studio", navigationVisibility: "drawer", lifecycle: "production" },
 { path: "/audit", title: "Audit", section: "system", navigationVisibility: "hidden", lifecycle: "lab" },
])

/** Find one entry by exact path match. */
export const resolvePageEntry = (path: string): PageRegistryEntry | null =>
 PAGE_REGISTRY.find((entry) => entry.path === path) ?? null

/** Group entries by section for navigation-menu building. */
export const groupPagesBySection = (): Record<PageSection, PageRegistryEntry[]> => {
 const out = {} as Record<PageSection, PageRegistryEntry[]>
 for (const entry of PAGE_REGISTRY) {
  if (!out[entry.section]) out[entry.section] = []
  out[entry.section].push(entry)
 }
 return out
}

/** Just the pages visible in the given navigation surface. */
export const pagesForNavigation = (
 surface: "top-nav" | "drawer",
): PageRegistryEntry[] =>
 PAGE_REGISTRY.filter((entry) =>
  entry.navigationVisibility === surface || entry.navigationVisibility === "both",
 )
