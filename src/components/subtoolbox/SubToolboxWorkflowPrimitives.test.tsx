import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (file: string) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8")

describe("canonical widget workflow primitive family", () => {
  it("exports all four donor-derived primitives from the shared primitive layer", () => {
    const barrel = read("src/components/subtoolbox/SubToolboxPrimitives.tsx")
    const source = read("src/components/subtoolbox/SubToolboxWorkflowPrimitives.tsx")
    expect(barrel).toContain('export * from "./SubToolboxWorkflowPrimitives"')
    for (const name of ["SubToolboxSectionBand","SubToolboxTextBadgeGrid","SubToolboxInteractiveChecklistProgress","SubToolboxProductionPlannerGrid"]) {
      expect(source).toContain(`export const ${name}`)
    }
  })

  it("keeps section bands full bleed and the mobile planner a two-column grid", () => {
    const css = read("src/styles/subtoolbox-workflow-primitives.css")
    expect(css).toContain("width:calc(100% + (2 * var(--vt-workflow-bleed,4px)))")
    expect(css).toContain("grid-template-columns:repeat(2,minmax(0,1fr))")
    expect(css).toContain(".vt-workflow-data-grid{width:100%;min-width:620px")
  })

  it("uses checkbox state as the checklist progress source", () => {
    const source = read("src/components/subtoolbox/SubToolboxWorkflowPrimitives.tsx")
    expect(source).toContain("Math.round(activeSet.size / items.length * 100)")
    expect(source).toContain('role="progressbar"')
    expect(source).toContain("onClick={() => toggle(item.id)}")
  })

  it("registers actual components in the production-import UI library", () => {
    const catalog = read("src/components/studio-hub/StudioHubPrimitiveMigrationCatalog.tsx")
    for (const family of ["Full-Width Section Band","Text + Badge Data Grid","Interactive Checklist Progress","Production Planner Grid"]) {
      expect(catalog).toContain(`"${family}"`)
    }
    expect(catalog).toContain("<SubToolboxSectionBand")
    expect(catalog).toContain("<SubToolboxTextBadgeGrid")
    expect(catalog).toContain("<SubToolboxInteractiveChecklistProgress")
    expect(catalog).toContain("<SubToolboxProductionPlannerGrid")
  })
})
