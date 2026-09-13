import { describe, expect, it } from "vitest"
import { VT_VISUAL_RESPONSIVE } from "./mobileVisualResponsiveContract"

describe("VT_VISUAL_RESPONSIVE", () => {
 it("keeps spatial evidence 16:9 in portrait and landscape", () => {
  expect(VT_VISUAL_RESPONSIVE.spatial.portrait.aspect).toBe("16:9")
  expect(VT_VISUAL_RESPONSIVE.spatial.landscape.aspect).toBe("16:9")
 })

 it("forces phone portrait visuals to a single span with compact chrome", () => {
  for (const preset of Object.values(VT_VISUAL_RESPONSIVE)) {
   expect(preset.portrait.span).toBe(1)
   expect(preset.portrait.controls).toBe("menu")
   expect(preset.portrait.explanation).toBe("collapsed")
   expect(preset.portrait.density).toBe("compact")
  }
 })

 it("preserves square radial plots and natural list layouts", () => {
  expect(VT_VISUAL_RESPONSIVE.radial.portrait.aspect).toBe("1:1")
  expect(VT_VISUAL_RESPONSIVE.natural.portrait.aspect).toBe("natural")
 })
})
