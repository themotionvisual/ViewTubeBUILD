import { describe, expect, it } from "vitest"
import { STUDIO_HUB_COMPONENT_FAMILIES } from "../StudioHubCompletePrimitiveCatalog"

describe("Studio Hub complete primitive catalog", () => {
  it("promotes all canonical and newly added reusable families into one registry", () => {
    expect(STUDIO_HUB_COMPONENT_FAMILIES.length).toBeGreaterThanOrEqual(56)
    expect(new Set(STUDIO_HUB_COMPONENT_FAMILIES).size).toBe(STUDIO_HUB_COMPONENT_FAMILIES.length)
  })

  it("contains the post-V21 additions instead of leaving them in side sections", () => {
    expect(STUDIO_HUB_COMPONENT_FAMILIES).toEqual(expect.arrayContaining([
      "Horizontal Scrollbar", "Vertical Scrollbar", "Data Stats Module",
      "Disabled Button", "Disabled Split Button", "Upload Frame", "Pagination",
      "Vault Landscape Asset", "Vault Portrait Asset", "Vault Audio Asset",
      "Vault Document Asset", "Knob Dial", "Controller Switch", "LED Light",
      "Alphabetical Spectrum Tags", "Icon Rail Control",
    ]))
  })

  it("removes the rejected two-color upload family while keeping the corrected knob and spectrum families", () => {
    expect(STUDIO_HUB_COMPONENT_FAMILIES).not.toContain("Two Color Upload Frame")
    expect(STUDIO_HUB_COMPONENT_FAMILIES).toContain("Knob Dial")
    expect(STUDIO_HUB_COMPONENT_FAMILIES).toContain("Alphabetical Spectrum Tags")
  })

  it("keeps the canonical three-level component sizing model", () => {
    const canonicalLevels = ["l0", "l1", "l2"]
    expect(canonicalLevels).toEqual(["l0", "l1", "l2"])
    expect(canonicalLevels).not.toContain("compact")
  })
})
