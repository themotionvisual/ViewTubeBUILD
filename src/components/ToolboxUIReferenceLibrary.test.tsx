import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { ToolboxUIReferenceLibrary } from "./ToolboxUIReferenceLibrary"

describe("Toolbox UI Reference Library", () => {
  it("renders the production toolbox families inside the canonical shell", () => {
    const html = renderToStaticMarkup(
      <ToolboxUIReferenceLibrary collapsible={false} isOpenInitial paletteIndex={7} />,
    )

    expect(html).toContain("Toolbox UI Library")
    expect(html).toContain("Buttons + Split Left")
    expect(html).toContain("Fields + Text Inputs")
    expect(html).toContain("Dropdown Menus")
    expect(html).toContain("Outputs + Data Surfaces")
    expect(html).toContain("Interaction + Data States")
    expect(html).toContain('data-vt-toolbox-level="sub"')
    expect(html).toContain("vt-subtoolbox-file-target")
    expect(html).toContain("vt-subtoolbox-output")
  })

  it("is lazy-mounted as a single Studio Hub toolbox", () => {
    const studioHub = readFileSync(resolve(process.cwd(), "src/views/StudioHub.tsx"), "utf8")

    expect(studioHub).toContain('React.lazy(() => import("../components/ToolboxUIReferenceLibrary"))')
    expect(studioHub).toContain("<ToolboxUIReferenceLibrary collapsible isOpenInitial={false} paletteIndex={7} />")
    expect(studioHub.match(/<ToolboxUIReferenceLibrary/g)).toHaveLength(1)
  })
})
