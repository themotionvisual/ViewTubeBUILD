import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const source = readFileSync(new URL("./SeoGenerator.tsx", import.meta.url), "utf8")

describe("SEO Generator Toolbox UI governance", () => {
  it("uses the canonical Toolbox identity and header controls", () => {
    expect(source).toContain('title="SEO GENERATOR"')
    expect(source).toContain("ToolboxHeaderToggle")
    expect(source).not.toContain('title="VIDEO PUBLISHER"')
    expect(source).not.toContain('headerColor="bg-[#CCFF00]"')
    expect(source).not.toContain('iconBoxColor="bg-[#00FF99]"')
    expect(source).not.toContain('border-[4px] border-black p-1 rounded-xl')
  })

  it("uses canonical Studio primitives instead of legacy Standard or native form controls", () => {
    expect(source).not.toContain("StandardUploadBox")
    expect(source).not.toContain("StandardTextArea")
    expect(source).not.toMatch(/<button\b/)
    expect(source).not.toMatch(/<input\b/)
    expect(source).toContain("SubToolboxFileTarget")
    expect(source).toContain("SubToolboxTextArea")
    expect(source).toContain("SubToolboxInput")
    expect(source).toContain("SubToolboxButton")
    expect(source).toContain("SubToolboxOutputCard")
  })

  it("preserves the SEO generation and export behavior while migrating presentation", () => {
    expect(source).toContain("generateSeoData(")
    expect(source).toContain("setSeoState({")
    expect(source).toContain("sheetsService.exportSeoResult")
    expect(source).toContain("nexusSyncService.syncSeoToDrive")
    expect(source).toContain("viewtube_seo_")
    expect(source).toContain('formatMode === "shorts" ? "Shorts" : "Longform"')
  })
})
