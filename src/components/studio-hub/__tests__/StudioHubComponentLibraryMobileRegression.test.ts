import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")

describe("Studio Hub Component Library mobile regression", () => {
  it("mounts frozen and primitive-migration catalogs from the production library wrapper", () => {
    const library = read("src/components/ToolboxUIReferenceLibrary.tsx")
    expect(library).toContain('import { StudioHubCompletePrimitiveCatalog }')
    expect(library).toContain('import { StudioHubPrimitiveMigrationCatalog }')
    expect(library).toContain("<StudioHubCompletePrimitiveCatalog paletteIndex={paletteIndex} />")
    expect(library).toContain("<StudioHubPrimitiveMigrationCatalog paletteIndex={paletteIndex} />")
    expect(library).toContain('data-vt-library-track={track}')
  })

  it("keeps main toolbox geometry larger than subtoolbox geometry", () => {
    const library = read("src/components/ToolboxUIReferenceLibrary.tsx")
    expect(library).toContain('--vt-toolbox-header-height: 80px !important')
    expect(library).toContain('--vt-toolbox-stroke: 5px !important')
    expect(library).toContain('--vt-toolbox-radius: 16px !important')
    expect(library).toContain('--vt-toolbox-shadow-offset: 10px !important')
  })

  it("keeps the requested missing families in the canonical registry", () => {
    const catalog = read("src/components/studio-hub/StudioHubCompletePrimitiveCatalog.tsx")
    for (const family of [
      "Split Search", "Toggle", "Settings Switch", "Checkbox", "Radio", "Slider",
      "Range Slider", "Popover", "Pagination", "Vault Landscape Asset",
      "Vault Portrait Asset", "Vault Audio Asset", "Vault Document Asset",
    ]) expect(catalog).toContain(`\"${family}\"`)
  })
})
