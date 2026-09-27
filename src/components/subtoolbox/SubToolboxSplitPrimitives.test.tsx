// @vitest-environment jsdom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { createRoot } from "react-dom/client"
import { act } from "react"
globalThis.IS_REACT_ACT_ENVIRONMENT = true
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

describe("split menu interaction", () => {
  it("portals the open menu, commits the controlled choice, and restores focus on Escape", async () => {
    const host = document.createElement("div")
    host.style.setProperty("--pair-a", "#fa618a")
    host.style.setProperty("--pair-b", "#c0f240")
    document.body.append(host)
    const root = createRoot(host)
    const options = [{ value: "videos", label: "Videos" }, { value: "playlists", label: "Playlists" }]
    const selected: string[] = []
    const Controlled = () => {
      const [value, setValue] = React.useState("videos")
      return <SubToolboxSplitDropdown ariaLabel="Dataset" value={value} options={options} onChange={(next) => {
        selected.push(next)
        setValue(next)
      }} />
    }

    try {
      await act(async () => root.render(<Controlled />))
      const trigger = host.querySelector<HTMLButtonElement>(".vt-subtoolbox-split-dropdown-trigger")!
      await act(async () => trigger.click())
      const menu = document.body.querySelector<HTMLDivElement>(".vt-subtoolbox-split-dropdown-menu")!
      expect(menu).toBeTruthy()
      expect(host.contains(menu)).toBe(false)
      expect(menu.style.position).toBe("fixed")
      await act(async () => menu.querySelectorAll<HTMLButtonElement>("button")[1].click())
      expect(selected).toEqual(["playlists"])
      expect(trigger.textContent).toContain("Playlists")
      expect(document.body.querySelector(".vt-subtoolbox-split-dropdown-menu")).toBeNull()
      await act(async () => trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })))
      expect(document.activeElement).toBe(document.body.querySelector(".vt-subtoolbox-split-dropdown-menu button:not(:disabled)"))
      await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })))
      expect(document.activeElement).toBe(trigger)
      expect(document.body.querySelector(".vt-subtoolbox-split-dropdown-menu")).toBeNull()
    } finally {
      await act(async () => root.unmount())
      host.remove()
    }
  })
})
