import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { ToolboxUIReferenceLibrary } from "./ToolboxUIReferenceLibrary"

describe("Toolbox UI Reference Library", () => {
  it("mounts frozen and primitive-migration catalogs in matching production toolbox shells", () => {
    const html = renderToStaticMarkup(
      <ToolboxUIReferenceLibrary collapsible={false} isOpenInitial paletteIndex={7} />,
    )

    expect(html).toContain("Studio Hub Component Library — Hardcoded")
    expect(html).toContain("Studio Hub Component Library — Primitive")
    expect(html.match(/Complete Component \+ Primitive Catalog/g)).toHaveLength(2)
    expect(html).toContain('data-vt-library-track="hardcoded"')
    expect(html).toContain('data-vt-library-track="primitive"')
    expect(html).toContain("Split Search")
    expect(html).toContain("Toggle")
    expect(html).toContain("Settings Switch")
    expect(html).toContain("Checkbox")
    expect(html).toContain("Radio")
    expect(html).toContain("Slider")
    expect(html).toContain("Range Slider")
    expect(html).toContain("Popover")
    expect(html).toContain("Pagination")
    expect(html).toContain("Vault Landscape Asset")
    expect(html).toContain("Vault Portrait Asset")
    expect(html).toContain("Vault Audio Asset")
    expect(html).toContain("Vault Document Asset")
    expect(html).toContain("Knob Dial")
    expect(html).toContain("Controller Switch")
    expect(html).toContain("LED Light")
    expect(html).toContain('data-vt-toolbox-level="main"')
  })

  it("keeps Tooltip as the first primitive-owned migration family while all other families fall back to the frozen renderer", () => {
    const source = readFileSync(resolve(process.cwd(), "src/components/studio-hub/StudioHubPrimitiveMigrationCatalog.tsx"), "utf8")
    expect(source).toContain('STUDIO_HUB_MIGRATED_FAMILIES = ["Tooltip"]')
    expect(source).toContain("<SubToolboxTooltip")
    expect(source).toContain("<HardcodedGenericControl")
  })

  it("restores the 80px main toolbox header authority instead of inheriting subtoolbox height", () => {
    const source = readFileSync(resolve(process.cwd(), "src/components/ToolboxUIReferenceLibrary.tsx"), "utf8")
    expect(source).toContain('--vt-toolbox-header-height: 80px !important')
    expect(source).toContain('height: 80px !important')
    expect(source).toContain('width: 80px !important')
  })

  it("is lazy-mounted once while the library component renders both comparison tracks", () => {
    const studioHub = readFileSync(resolve(process.cwd(), "src/views/StudioHub.tsx"), "utf8")

    expect(studioHub).toContain('React.lazy(() => import("../components/ToolboxUIReferenceLibrary"))')
    expect(studioHub).toContain("<ToolboxUIReferenceLibrary collapsible isOpenInitial={false} paletteIndex={7} />")
    expect(studioHub.match(/<ToolboxUIReferenceLibrary/g)).toHaveLength(1)
  })
})
