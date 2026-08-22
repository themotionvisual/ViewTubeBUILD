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

  /**
   * Prefer the module whose upper portion is currently closest to the top
   * of the usable viewport.
   */
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

  /**
   * Strong preference for whichever visible module is nearest the top.
   */
  visible.sort((a, b) => a.distanceFromTop - b.distanceFromTop)

  return visible[0].element
}

export const usePreserveOrientationPosition = (): void => {
  useEffect(() => {
    let anchor: HTMLElement | null = null
    let anchorId: string | null = null
    let anchorOffset = 0
    let settleTimer: number | null = null
    let lastWidth = window.innerWidth
    let lastHeight = window.innerHeight

    const capturePosition = () => {
      anchor = findActiveAnchor()

      if (!anchor) {
        return
      }

      /**
       * Give every candidate a temporary stable identifier if it doesn't
       * already have one — so it can be re-found after rotation even if the
       * subtree remounts.
       */
      if (!anchor.dataset.vtOrientationAnchor) {
        anchor.dataset.vtOrientationAnchor = `vt-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`
      }

      anchorId = anchor.dataset.vtOrientationAnchor
      anchorOffset = anchor.getBoundingClientRect().top
    }

    const restorePosition = () => {
      if (!anchorId) {
        return
      }

      const target = document.querySelector<HTMLElement>(
        `[data-vt-orientation-anchor="${anchorId}"]`,
      )

      if (!target) {
        return
      }

      const rect = target.getBoundingClientRect()

      /**
       * Align the same module near the top of the newly-sized viewport.
       */
      const targetTop = window.scrollY + rect.top - TOP_MARGIN

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "auto",
      })
    }

    const scheduleRestore = () => {
      if (settleTimer !== null) {
        window.clearTimeout(settleTimer)
      }

      /**
       * iOS/Android often report several intermediate viewport sizes during
       * rotation. Wait until layout is close to settled before restoring.
       */
      settleTimer = window.setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(restorePosition)
        })
      }, 180)
    }

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      const orientationChanged =
        (width > height) !== (lastWidth > lastHeight)

      if (orientationChanged) {
        /**
         * Capture using the old orientation before the new layout completely
         * settles.
         */
        if (!anchorId) {
          capturePosition()
        }

        scheduleRestore()
      }

      lastWidth = width
      lastHeight = height
    }

    const handleOrientationStart = () => {
      capturePosition()
    }

    window.addEventListener("orientationchange", handleOrientationStart, {
      passive: true,
    })

    window.addEventListener("resize", handleResize, {
      passive: true,
    })

    window.visualViewport?.addEventListener("resize", scheduleRestore, {
      passive: true,
    })

    // Reference `anchorOffset` in a no-op statement so TypeScript doesn't
    // complain about an unused local; the value is captured for future
    // heuristics (e.g. only-restore-if-the-user-hasn't-scrolled-far).
    void anchorOffset

    return () => {
      window.removeEventListener(
        "orientationchange",
        handleOrientationStart,
      )
      window.removeEventListener("resize", handleResize)
      window.visualViewport?.removeEventListener("resize", scheduleRestore)

      if (settleTimer !== null) {
        window.clearTimeout(settleTimer)
      }
    }
  }, [])
}
