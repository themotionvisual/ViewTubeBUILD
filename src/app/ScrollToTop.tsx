import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useWorkspaceUxPreferences } from "../hooks/useWorkspaceUxPreferences"

const scrollStorageKey = (routeKey: string) =>
  `viewtube:page-scroll:${encodeURIComponent(routeKey)}`

const getScrollTop = (viewport: HTMLElement | null): number =>
  viewport?.scrollTop ?? window.scrollY

const setScrollTop = (viewport: HTMLElement | null, top: number) => {
  if (viewport) {
    viewport.scrollTo({ top, left: 0, behavior: "auto" })
    return
  }
  window.scrollTo({ top, left: 0, behavior: "auto" })
}

/**
 * Route-aware scroll continuity.
 *
 * When Settings → Experience → Remember page position is enabled, every route
 * keeps its own scroll offset for the current browser session. Returning to a
 * page restores that position. When disabled, navigation uses the traditional
 * reset-to-top behavior.
 *
 * Hash navigation is exempt because an explicit hash owns the destination.
 */
export const ScrollToTop = () => {
  const { pathname, search = "", hash } = useLocation()
  const { preservePagePosition } = useWorkspaceUxPreferences()
  const routeKey = `${pathname}${search}`

  useEffect(() => {
    if (hash) return

    const viewport = document.getElementById("main-content")
    const stored = preservePagePosition
      ? Number(window.sessionStorage.getItem(scrollStorageKey(routeKey)) || 0)
      : 0
    setScrollTop(viewport, Number.isFinite(stored) ? Math.max(0, stored) : 0)

    return () => {
      if (!preservePagePosition) return
      window.sessionStorage.setItem(
        scrollStorageKey(routeKey),
        String(Math.max(0, getScrollTop(viewport))),
      )
    }
  }, [hash, preservePagePosition, routeKey])

  return null
}
