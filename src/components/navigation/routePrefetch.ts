// Route prefetching keyed off nav intent (hover, focus, touchstart).
//
// AppRoutes.tsx declares every top-level view with React.lazy(() => import(...)),
// which means their JS chunks aren't fetched until the route actually mounts.
// This module holds a lightweight parallel registry of the same import
// factories so the nav shell can *warm up* a chunk the moment a user shows
// intent — the browser fetches the chunk in the background, and by the time
// the user releases the click, the module is already resolved and the route
// mounts effectively instantly.
//
// Each factory is invoked at most once per session (Vite dedupes module
// requests, but we also gate on a Set to avoid re-invoking the promise chain).
// Add-in cost is a few dozen bytes of extra JS in the nav chunk.

type PrefetchFactory = () => Promise<unknown>

const prefetched = new Set<string>()

const factories: Record<string, PrefetchFactory> = {
 "/": () => import("../../views/Dashboard"),
 "/studio": () => import("../../views/StudioHub"),
 "/projects": () => import("../../views/ProjectCalendarPage"),
 "/ai-brain": () => import("../../views/AIBrainCommandInterface"),
 "/local-analytics": () => import("../../features/vt-sync-local/shell/VtSyncLocalAnalyticsPage"),
 "/analytics": () => import("../../features/vt-sync-local/shell/VtSyncLocalAnalyticsPage"),
 "/editor": () => import("../../views/EditorV1Page"),
 "/settings": () => import("../../views/Settings"),
 "/user-guide": () => import("../../views/UserGuide"),
}

export const prefetchRoute = (path: string): void => {
 if (prefetched.has(path)) return
 const factory = factories[path]
 if (!factory) return
 prefetched.add(path)
 // Fire-and-forget — we deliberately swallow errors because a prefetch failure
 // is never user-visible: the real click will retry via React.lazy and the
 // Suspense fallback covers any latency there.
 factory().catch(() => {
  prefetched.delete(path)
 })
}

// Idle-time prefetch of the routes a user is statistically likeliest to hit
// from the dashboard: Analytics (the page whose freeze report started this
// whole optimization pass) and Studio.
export const scheduleIdlePrefetch = (): void => {
 if (typeof window === "undefined") return
 const runner = (window as unknown as {
  requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number
 }).requestIdleCallback
 const kick = () => {
  prefetchRoute("/local-analytics")
  prefetchRoute("/studio")
 }
 if (typeof runner === "function") runner(kick, { timeout: 3000 })
 else window.setTimeout(kick, 2500)
}
