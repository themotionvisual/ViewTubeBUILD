import type { HeroIntroMode } from "./heroVisualAnimations"

export const setHeroIntroModeInUrl = (mode: HeroIntroMode): void => {
  if (typeof window === "undefined") return
  const url = new URL(window.location.href)
  url.searchParams.set("vtIntro", mode)
  window.history.replaceState({}, "", url)
}

export const replayCurrentHeroIntro = (): void => {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("vt:replay-hero-intro"))
}

/**
 * Suggested capture sequence:
 *
 * setHeroIntroModeInUrl("full")
 * replayCurrentHeroIntro()
 * // wait for the visual to settle
 * // animate the large ViewTube cursor into the controller
 * setHeroIntroModeInUrl("fast")
 * // change controller state
 */
