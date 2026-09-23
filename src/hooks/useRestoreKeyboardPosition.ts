import { useEffect } from "react"

const EDITABLE_SELECTOR = [
  "input:not([type='button']):not([type='submit']):not([type='reset']):not([type='checkbox']):not([type='radio'])",
  "textarea",
  "[contenteditable='true']",
].join(",")

const isMobileLike = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(max-width: 760px)").matches ||
    window.matchMedia("(hover: none) and (pointer: coarse)").matches)

export const useRestoreKeyboardPosition = (enabled = true): void => {
  useEffect(() => {
    if (!enabled || !isMobileLike()) return

    let capturedTop: number | null = null
    let restoreTimer: number | null = null

    const viewport = () => document.getElementById("main-content")

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target?.matches(EDITABLE_SELECTOR)) return
      if (restoreTimer !== null) window.clearTimeout(restoreTimer)
      capturedTop = viewport()?.scrollTop ?? window.scrollY
    }

    const onFocusOut = (event: FocusEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target?.matches(EDITABLE_SELECTOR) || capturedTop === null) return

      const restoreTop = capturedTop
      restoreTimer = window.setTimeout(() => {
        restoreTimer = null
        const active = document.activeElement
        if (active instanceof Element && active.matches(EDITABLE_SELECTOR)) return

        const main = viewport()
        if (main) main.scrollTo({ top: restoreTop, behavior: "auto" })
        else window.scrollTo({ top: restoreTop, behavior: "auto" })
        capturedTop = null
      }, 180)
    }

    document.addEventListener("focusin", onFocusIn)
    document.addEventListener("focusout", onFocusOut)

    return () => {
      document.removeEventListener("focusin", onFocusIn)
      document.removeEventListener("focusout", onFocusOut)
      if (restoreTimer !== null) window.clearTimeout(restoreTimer)
    }
  }, [enabled])
}
