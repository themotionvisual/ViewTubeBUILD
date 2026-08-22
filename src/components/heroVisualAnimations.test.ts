import { afterEach, describe, expect, it, vi } from "vitest"
import {
 createHeroIntroController,
 getHeroVariantLabel,
 HERO_VISUAL_VARIANT_COUNT,
 type HeroVisualId,
} from "./heroVisualAnimations"

describe("hero visual animation readiness", () => {
 afterEach(() => vi.unstubAllGlobals())

 it("keeps three distinct replay modes for every registered visual", () => {
  Object.entries(HERO_VISUAL_VARIANT_COUNT).forEach(([visualId, count]) => {
   expect(count).toBe(3)
   const labels = [0, 1, 2].map((variant) => getHeroVariantLabel(visualId as HeroVisualId, variant))
   expect(new Set(labels).size).toBe(3)
  })
 })

 it("cancels pending replay frames when a visual is reset or destroyed", () => {
  let nextFrame = 0
  const callbacks = new Map<number, FrameRequestCallback>()
  const cancel = vi.fn((frame: number) => callbacks.delete(frame))
  vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
   nextFrame += 1
   callbacks.set(nextFrame, callback)
   return nextFrame
  }))
  vi.stubGlobal("cancelAnimationFrame", cancel)
  const root = { querySelectorAll: () => [] } as unknown as ParentNode
  const controller = createHeroIntroController("heat-matrix", root)

  controller.replay({ variant: 2 })
  controller.destroy()

  expect(cancel).toHaveBeenCalledWith(1)
  expect(callbacks.size).toBe(0)
 })
})
