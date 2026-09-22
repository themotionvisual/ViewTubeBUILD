import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { Settings } from "lucide-react"
import {
  SubToolboxKpiCard,
  SubToolboxSplitButton,
  SubToolboxSplitDropdown,
} from "./SubToolboxSplitPrimitives"

describe("SubToolbox split-left primitives", () => {
  it("renders the split-left button with separate rail and label surfaces", () => {
    const html = renderToStaticMarkup(
      <SubToolboxSplitButton icon={<Settings />} selected>
        Settings
      </SubToolboxSplitButton>,
    )
    expect(html).toContain("vt-subtoolbox-split-button-rail")
    expect(html).toContain("vt-subtoolbox-split-button-label")
    expect(html).toContain("is-selected")
  })

  it("renders the split menu with a square icon rail and full text/chevron side", () => {
    const html = renderToStaticMarkup(
      <SubToolboxSplitDropdown
        ariaLabel="Dataset"
        icon={<Settings />}
        value="videos"
        options={[{ value: "videos", label: "Videos", icon: <Settings /> }, { value: "playlists", label: "Playlists", icon: <Settings /> }]}
        onChange={() => {}}
      />,
    )
    expect(html).toContain("aria-haspopup=\"listbox\"")
    expect(html).toContain("aria-expanded=\"false\"")
    expect(html).toContain("vt-subtoolbox-split-dropdown-trigger")
    expect(html).toContain("vt-subtoolbox-split-dropdown-rail")
    expect(html).toContain("vt-subtoolbox-split-dropdown-label")
    expect(html).toContain("vt-subtoolbox-split-dropdown-chevron")
    expect(html).toContain(">Videos<")
    expect(html).not.toContain(">SET<")
    expect(html).not.toContain("vt-subtoolbox-split-dropdown-rail-label")
    expect(html).not.toContain("vt-subtoolbox-split-dropdown-rail-arrow")
  })

  it("renders a square split-left icon section on every open menu row", () => {
    const html = renderToStaticMarkup(
      <SubToolboxSplitDropdown
        ariaLabel="Dataset"
        icon={<Settings />}
        value="videos"
        defaultOpen
        options={[{ value: "videos", label: "Videos", icon: <Settings /> }, { value: "playlists", label: "Playlists", icon: <Settings /> }]}
        onChange={() => {}}
      />,
    )
    expect(html).toContain("aria-expanded=\"true\"")
    expect(html).toContain("role=\"listbox\"")
    expect(html.match(/vt-subtoolbox-split-dropdown-option-rail/g)).toHaveLength(2)
    expect(html.match(/vt-subtoolbox-split-dropdown-option-label/g)).toHaveLength(2)
    expect(html).toContain("vt-subtoolbox-split-dropdown-option-check")
  })

  it("renders the KPI card using the split header pattern", () => {
    const html = renderToStaticMarkup(
      <SubToolboxKpiCard label="Revenue" value="$478.05" sublabel="Avg $0.97" icon={<Settings />} />,
    )
    expect(html).toContain("vt-subtoolbox-kpi-header")
    expect(html).toContain("vt-subtoolbox-kpi-body")
    expect(html).toContain("$478.05")
  })
})
