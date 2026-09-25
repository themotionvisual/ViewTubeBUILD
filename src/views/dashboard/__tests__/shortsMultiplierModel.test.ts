import { describe, expect, it } from "vitest"
import { buildShortsMultiplierPlan } from "../widgets/shortsMultiplierModel"

describe("Shorts Multiplier plan", () => {
  it("creates unique beginning/end trim combinations within the 1–10 frame requirement", () => {
    const plan = buildShortsMultiplierPlan({
      sourceId: "short-a",
      sourceTitle: "Austerlitz Short",
      variantCount: 10,
      maxTrimFrames: 10,
      intervalDays: 7,
      scheduleStart: "2026-10-01T12:00:00.000Z",
    })

    expect(plan.variants).toHaveLength(10)
    expect(new Set(plan.variants.map((variant) => `${variant.trimStartFrames}:${variant.trimEndFrames}`)).size).toBe(10)
    expect(plan.variants.every((variant) =>
      variant.trimStartFrames >= 0 &&
      variant.trimStartFrames <= 10 &&
      variant.trimEndFrames >= 0 &&
      variant.trimEndFrames <= 10 &&
      variant.trimStartFrames + variant.trimEndFrames >= 1
    )).toBe(true)
  })

  it("spaces publishing dates by the requested interval", () => {
    const plan = buildShortsMultiplierPlan({
      sourceId: "short-a",
      sourceTitle: "Austerlitz Short",
      variantCount: 3,
      maxTrimFrames: 10,
      intervalDays: 14,
      scheduleStart: "2026-10-01T12:00:00.000Z",
    })

    expect(plan.variants.map((variant) => variant.scheduledAt)).toEqual([
      "2026-10-01T12:00:00.000Z",
      "2026-10-15T12:00:00.000Z",
      "2026-10-29T12:00:00.000Z",
    ])
  })

  it("clamps count, trim range, and schedule interval to the product contract", () => {
    const plan = buildShortsMultiplierPlan({
      sourceId: "short-a",
      sourceTitle: "Austerlitz Short",
      variantCount: 99,
      maxTrimFrames: 99,
      intervalDays: 999,
      scheduleStart: "2026-10-01T12:00:00.000Z",
    })

    expect(plan.variants).toHaveLength(10)
    expect(plan.maxTrimFrames).toBe(10)
    expect(plan.intervalDays).toBe(60)
  })
})
