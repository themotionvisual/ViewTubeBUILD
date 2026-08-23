import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * Reset window scroll to (0, 0) on every route change so a normal navigation
 * ("Dashboard" → "Analytics") always starts at the top of the page, matching
 * what users expect from a multi-page site. Without this, react-router
 * preserves the previous route's scroll offset, which reads as a bug on
 * long-scroll views (Performance Hub, Reference Studio, …).
 *
 * Hash navigation (`/foo#bar`) is exempt — a hash implies the caller wants
 * to jump to a specific anchor, not the top.
 *
 * Mount this once, inside `<BrowserRouter>`. It renders nothing.
 */
export const ScrollToTop = () => {
 const { pathname, hash } = useLocation()

 useEffect(() => {
  if (hash) return
  // Cast avoids the TS lib.dom mismatch on "instant" in some setups.
  try {
   window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })
  } catch {
   window.scrollTo(0, 0)
  }
 }, [pathname, hash])

 return null
}
