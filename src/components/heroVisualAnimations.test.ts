import { afterEach, describe, expect, it, vi } from "vitest"
import {
  createHeroIntroController,
  getHeroVariantLabel,
  HERO_VISUAL_VARIANT_COUNT,
  type HeroVisualId,
} from "./heroVisualAnimations"

describe("hero visual animation readiness", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("starts Channel Progress when Recharts targets mount after the first replay frame", () => {
    const frameQueue: FrameRequestCallback[] = []
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      frameQueue.push(callback)
      return frameQueue.length
    }))
    vi.stubGlobal("cancelAnimationFrame", vi.fn())

    let notifyMutation: MutationCallback = () => undefined
    const disconnect = vi.fn()
    vi.stubGlobal("MutationObserver", class {
      constructor(callback: MutationCallback) {
        notifyMutation = callback
      }
      observe = vi.fn()
      disconnect = disconnect
    })

    let chartReady = false
    const animation = {
      cancel: vi.fn(),
      finished: new Promise<void>(() => undefined),
    } as unknown as Animation
    const bar = {
      animate: vi.fn(() => animation),
      getBBox: () => ({ x: 0, y: 20, width: 12, height: 80 }),
      getBoundingClientRect: () => ({ left: 0 }),
      style: {},
    }
    const root = {
      querySelectorAll: (selector: string) => {
        if (selector === ".recharts-bar") return []
        if (selector.includes("data-vt-channel-progress-bar")) return chartReady ? [bar] : []
        return []
      },
    } as unknown as ParentNode

    const controller = createHeroIntroController("channel-progress", root)
    controller.replay({ variant: 0 })
    frameQueue.shift()?.(0)
    frameQueue.shift()?.(16)

    expect(bar.animate).not.toHaveBeenCalled()
    chartReady = true
    notifyMutation([], {} as MutationObserver)
    frameQueue.shift()?.(32)

    expect(bar.animate).toHaveBeenCalledOnce()
    expect(disconnect).toHaveBeenCalled()
    controller.destroy()
  })

  it("keeps three distinct replay modes for every registered visual", () => {
    Object.entries(HERO_VISUAL_VARIANT_COUNT).forEach(([visualId, count]) => {
      expect(count).toBe(3)
      const labels = [0, 1, 2].map((variant) =>
        getHeroVariantLabel(visualId as HeroVisualId, variant),
      )
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
