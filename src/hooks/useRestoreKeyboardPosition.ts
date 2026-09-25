import { useEffect } from "react"

const EDITABLE_SELECTOR = [
  "input:not([type='button']):not([type='submit']):not([type='reset']):not([type='checkbox']):not([type='radio'])",
  "textarea",
  "select",
  "[contenteditable='true']",
].join(",")

const FOCUS_TOP_GAP = 12
const FOCUS_BOTTOM_GAP = 18

const isMobileLike = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(max-width: 760px)").matches ||
    window.matchMedia("(hover: none) and (pointer: coarse)").matches)

const isEditable = (value: unknown): value is HTMLElement =>
  value instanceof HTMLElement && value.matches(EDITABLE_SELECTOR)

const mainViewport = () => document.getElementById("main-content")

const setKeyboardOcclusion = () => {
  const visual = window.visualViewport
  const occlusion = visual
    ? Math.max(0, window.innerHeight - (visual.height + visual.offsetTop))
    : 0
  document.documentElement.style.setProperty("--vt-keyboard-occlusion", `${Math.round(occlusion)}px`)
}

const revealEditable = (target: HTMLElement) => {
  const visual = window.visualViewport
  const visibleTop = (visual?.offsetTop ?? 0) + FOCUS_TOP_GAP
  const visibleBottom =
    (visual?.offsetTop ?? 0) +
    (visual?.height ?? window.innerHeight) -
    FOCUS_BOTTOM_GAP

  const rect = target.getBoundingClientRect()
  let delta = 0

  if (rect.bottom > visibleBottom) delta = rect.bottom - visibleBottom
  else if (rect.top < visibleTop) delta = rect.top - visibleTop

  if (Math.abs(delta) < 1) return

  const main = mainViewport()
  if (main) main.scrollBy({ top: delta, behavior: "auto" })
  else window.scrollBy({ top: delta, behavior: "auto" })
}

export const useRestoreKeyboardPosition = (enabled = true): void => {
  useEffect(() => {
    if (!enabled || !isMobileLike()) return

    let capturedTop: number | null = null
    let restoreTimer: number | null = null
    let revealFrame: number | null = null

    const scheduleReveal = () => {
      const active = document.activeElement
      if (!isEditable(active)) return

      setKeyboardOcclusion()
      if (revealFrame !== null) window.cancelAnimationFrame(revealFrame)
      revealFrame = window.requestAnimationFrame(() => {
        revealFrame = null
        revealEditable(active)
      })
    }

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target
      if (!isEditable(target)) return

      if (restoreTimer !== null) window.clearTimeout(restoreTimer)
      capturedTop = mainViewport()?.scrollTop ?? window.scrollY
      document.documentElement.dataset.vtMobileEditing = "true"
      scheduleReveal()
    }

    const onFocusOut = (event: FocusEvent) => {
      const target = event.target
      if (!isEditable(target) || capturedTop === null) return

      const restoreTop = capturedTop
      restoreTimer = window.setTimeout(() => {
        restoreTimer = null
        const active = document.activeElement
        if (isEditable(active)) {
          scheduleReveal()
          return
        }

        const main = mainViewport()
        if (main) main.scrollTo({ top: restoreTop, behavior: "auto" })
        else window.scrollTo({ top: restoreTop, behavior: "auto" })

        capturedTop = null
        delete document.documentElement.dataset.vtMobileEditing
        document.documentElement.style.setProperty("--vt-keyboard-occlusion", "0px")
      }, 180)
    }

    const onVisualViewportChange = () => {
      const active = document.activeElement
      if (!isEditable(active)) {
        setKeyboardOcclusion()
        return
      }
      scheduleReveal()
    }

    document.addEventListener("focusin", onFocusIn)
    document.addEventListener("focusout", onFocusOut)
    window.visualViewport?.addEventListener("resize", onVisualViewportChange)
    window.visualViewport?.addEventListener("scroll", onVisualViewportChange)

    return () => {
      document.removeEventListener("focusin", onFocusIn)
      document.removeEventListener("focusout", onFocusOut)
      window.visualViewport?.removeEventListener("resize", onVisualViewportChange)
      window.visualViewport?.removeEventListener("scroll", onVisualViewportChange)
      if (restoreTimer !== null) window.clearTimeout(restoreTimer)
      if (revealFrame !== null) window.cancelAnimationFrame(revealFrame)
      delete document.documentElement.dataset.vtMobileEditing
      document.documentElement.style.setProperty("--vt-keyboard-occlusion", "0px")
    }
  }, [enabled])
}
