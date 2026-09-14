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
      <SubToolboxSplitButton icon={<Settings />} selected railColor="#C0F240" labelColor="#FF5D8F">
        Settings
      </SubToolboxSplitButton>,
    )
    expect(html).toContain("vt-subtoolbox-split-button-rail")
    expect(html).toContain("vt-subtoolbox-split-button-label")
    expect(html).toContain("is-selected")
  })

  it("renders the canonical split-left dropdown trigger with a split rail and uninterrupted value region", () => {
    const html = renderToStaticMarkup(
      <SubToolboxSplitDropdown
        ariaLabel="Dataset"
        railLabel="SET"
        icon={<Settings />}
        value="videos"
        options={[{ value: "videos", label: "Videos" }, { value: "playlists", label: "Playlists" }]}
        onChange={() => {}}
      />,
    )
    expect(html).toContain("aria-haspopup=\"listbox\"")
    expect(html).toContain("aria-expanded=\"false\"")
    expect(html).toContain("vt-subtoolbox-split-dropdown-trigger")
    expect(html).toContain("vt-subtoolbox-split-dropdown-rail")
    expect(html).toContain("vt-subtoolbox-split-dropdown-rail-label")
    expect(html).toContain(">SET<")
    expect(html).toContain("vt-subtoolbox-split-dropdown-rail-arrow")
    expect(html).toContain("vt-subtoolbox-split-dropdown-label")
    expect(html).toContain(">Videos<")
    expect(html).not.toContain("vt-subtoolbox-split-dropdown-chevron")
    expect(html).not.toContain("role=\"listbox\"")
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
