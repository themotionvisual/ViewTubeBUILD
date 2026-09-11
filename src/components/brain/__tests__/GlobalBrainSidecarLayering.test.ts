/**
 * The Brain sidecar goes full-bleed on phones (max-[760px]:inset-2), so its
 * header holds the only visible way out. It used to sit at z-90 while
 * .vt-adaptive-nav sits at z-120, which drew the app header over the sidecar's
 * top-left corner — exactly where the minimize button lives — leaving the panel
 * covering the screen with no way to dismiss it.
 *
 * These assert the layering and the escape routes so that cannot come back.
 */
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const sidecarSource = readFileSync(
  new URL("../GlobalBrainSidecar.tsx", import.meta.url),
  "utf8",
)
const navCss = readFileSync(
  new URL("../../navigation/adaptive-navigation.css", import.meta.url),
  "utf8",
)

const navZIndex = (() => {
  const block = navCss.match(/\.vt-adaptive-nav\s*\{[^}]*\}/)?.[0] ?? ""
  return Number(block.match(/z-index:\s*(\d+)/)?.[1] ?? NaN)
})()

describe("Brain sidecar layering", () => {
  it("reads a numeric z-index off .vt-adaptive-nav", () => {
    // If this fails the nav moved to a token or a different rule, and the
    // comparison below is no longer meaningful.
    expect(Number.isFinite(navZIndex)).toBe(true)
  })

  it("puts every fixed sidecar surface above the app navigation", () => {
    const zIndexes = [...sidecarSource.matchAll(/\bz-\[(\d+)\]/g)].map((match) => Number(match[1]))

    expect(zIndexes.length).toBeGreaterThan(0)
    for (const value of zIndexes) {
      expect(value, `z-[${value}] must exceed the nav's ${navZIndex}`).toBeGreaterThan(navZIndex)
    }
  })

  it("keeps the minimize control in the header", () => {
    expect(sidecarSource).toContain('aria-label="Minimize Brain"')
  })

  it("closes on Escape as a second way out", () => {
    expect(sidecarSource).toContain('event.key !== "Escape"')
    expect(sidecarSource).toContain('window.addEventListener("keydown"')
    expect(sidecarSource).toContain('window.removeEventListener("keydown"')
  })

  it("holds the full-bleed phone sheet clear of the safe areas", () => {
    expect(sidecarSource).toContain("max-[760px]:top-[max(8px,env(safe-area-inset-top))]")
    expect(sidecarSource).toContain("max-[760px]:bottom-[max(8px,env(safe-area-inset-bottom))]")
  })
})
