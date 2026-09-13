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

  it("renders a split-left dropdown trigger with listbox semantics", () => {
    const html = renderToStaticMarkup(
      <SubToolboxSplitDropdown
        ariaLabel="Dataset"
        icon={<Settings />}
        value="videos"
        options={[{ value: "videos", label: "Videos" }, { value: "playlists", label: "Playlists" }]}
        onChange={() => {}}
      />,
    )
    expect(html).toContain("aria-haspopup=\"listbox\"")
    expect(html).toContain("vt-subtoolbox-split-dropdown-trigger")
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
