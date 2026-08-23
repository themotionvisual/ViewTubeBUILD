import { useEffect } from "react"

/**
 * Global mobile orientation-position preservation.
 *
 * Mounted once at the top of the app shell. Before every orientation change
 * it captures which visual module / toolbox / row the user was actually
 * looking at, then after the new viewport settles it scrolls the same
 * element back to ~10px below the top of the usable viewport — so rotating
 * portrait ↔ landscape never dumps the user at the top of the page.
 *
 * Anchor candidates are any element carrying one of:
 *   data-vt-visual-module
 *   data-vt-toolbox
 *   data-vt-module
 *   data-vt-row
 *
 * The "active" anchor is whichever visible candidate is closest to the top
 * of the viewport at capture time.
 *
 * Reliability fixes (2026-08-23):
 *
 *   1. Clear `anchorId` after every restore so the NEXT rotation captures
 *      a fresh anchor. Previously the stale id leaked forward and made the
 *      hook "sometimes work" — the second rotation would restore to the
 *      first rotation's anchor, which was often no longer on screen.
 *
 *   2. Only listen for orientation changes: gate all handlers on a real
 *      orientation flip (portrait ↔ landscape or vice-versa) via
 *      `screen.orientation` (modern) with `matchMedia("(orientation)")`
 *      fallback. The old code used `visualViewport.resize` which fires
 *      every time the virtual keyboard opens or closes, causing spurious
 *      restores mid-typing.
 *
 *   3. Guard the restore against a corrupted / detached anchor: after
 *      restore, always reset state; if the anchor can't be found we still
 *      clear so the next rotation starts fresh.
 */

const ANCHOR_SELECTOR = [
  "[data-vt-visual-module]",
  "[data-vt-toolbox]",
  "[data-vt-module]",
  "[data-vt-row]",
].join(",")

const TOP_MARGIN = 10

const findActiveAnchor = (): HTMLElement | null => {
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>(ANCHOR_SELECTOR),
  )

  if (!candidates.length) {
    return null
  }

  const viewportHeight = window.visualViewport?.height ?? window.innerHeight

  const visible = candidates
    .map((element) => {
      const rect = element.getBoundingClientRect()

      const visiblePixels = Math.max(
        0,
        Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0),
      )

      const distanceFromTop = Math.abs(rect.top - TOP_MARGIN)

      return {
        element,
        rect,
        visiblePixels,
        distanceFromTop,
      }
    })
    .filter((item) => item.visiblePixels > 0)

  if (!visible.length) {
    return null
  }

  visible.sort((a, b) => a.distanceFromTop - b.distanceFromTop)

  return visible[0].element
}

const currentOrientationIsPortrait = (): boolean => {
  if (typeof window === "undefined") return true
  // Prefer the CSS orientation media query — matches what the layout thinks.
  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(orientation: portrait)").matches
  }
  return window.innerHeight >= window.innerWidth
}

export const usePreserveOrientationPosition = (): void => {
  useEffect(() => {
    let anchorId: string | null = null
    let settleTimer: number | null = null
    let restoreFrame: number | null = null
    let previousIsPortrait = currentOrientationIsPortrait()

    const capturePosition = () => {
      const anchor = findActiveAnchor()
      if (!anchor) {
        anchorId = null
        return
      }

      if (!anchor.dataset.vtOrientationAnchor) {
        anchor.dataset.vtOrientationAnchor = `vt-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`
      }

      anchorId = anchor.dataset.vtOrientationAnchor
    }

    const restorePosition = () => {
      // Snapshot then clear immediately so a mid-restore rotation can't
      // race with itself and end up double-restoring to the stale id.
      const id = anchorId
      anchorId = null

      if (!id) return

      const target = document.querySelector<HTMLElement>(
        `[data-vt-orientation-anchor="${id}"]`,
      )
      if (!target) return

      const rect = target.getBoundingClientRect()
      const targetTop = window.scrollY + rect.top - TOP_MARGIN

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "auto",
      })
    }

    const scheduleRestore = () => {
      if (settleTimer !== null) window.clearTimeout(settleTimer)
      if (restoreFrame !== null) cancelAnimationFrame(restoreFrame)

      // iOS/Android often report several intermediate viewport sizes during
      // rotation. Wait until layout is close to settled before restoring.
      settleTimer = window.setTimeout(() => {
        settleTimer = null
        restoreFrame = requestAnimationFrame(() => {
          restoreFrame = requestAnimationFrame(() => {
            restoreFrame = null
            restorePosition()
          })
        })
      }, 220)
    }

    const handleOrientationFlip = () => {
      const nowPortrait = currentOrientationIsPortrait()
      if (nowPortrait === previousIsPortrait) return

      // Real orientation flip. Capture from the OLD layout (still in DOM
      // during the same tick on most browsers) then schedule restore.
      capturePosition()
      previousIsPortrait = nowPortrait
      scheduleRestore()
    }

    // Modern browsers: screen.orientation.change fires once per real flip.
    // Older / iOS: fall back to matchMedia change listeners on the CSS
    // orientation media query, which is layout-truth (unlike the deprecated
    // `orientationchange` event, which is unreliable).
    const portraitMql = window.matchMedia?.("(orientation: portrait)")
    const screenOrientation = (window.screen as Screen & { orientation?: ScreenOrientation }).orientation

    screenOrientation?.addEventListener?.("change", handleOrientationFlip)
    portraitMql?.addEventListener?.("change", handleOrientationFlip)

    // Fallback for very old Safari without matchMedia change events.
    const legacyResizeFallback = () => {
      // Only act on a real orientation flip; ignore virtual-keyboard
      // resize noise entirely.
      handleOrientationFlip()
    }
    if (!portraitMql?.addEventListener && !screenOrientation?.addEventListener) {
      window.addEventListener("resize", legacyResizeFallback, { passive: true })
    }

    return () => {
      screenOrientation?.removeEventListener?.("change", handleOrientationFlip)
      portraitMql?.removeEventListener?.("change", handleOrientationFlip)
      window.removeEventListener("resize", legacyResizeFallback)

      if (settleTimer !== null) window.clearTimeout(settleTimer)
      if (restoreFrame !== null) cancelAnimationFrame(restoreFrame)
    }
  }, [])
}
