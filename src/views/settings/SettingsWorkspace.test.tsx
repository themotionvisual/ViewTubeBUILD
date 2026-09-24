import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { SettingsWorkspace, getSettingsWorkspaceBottomPadding } from "./SettingsWorkspace"
import type { SettingsReadiness } from "./settingsControlDeck"

const READY: SettingsReadiness = {
  completed: 4,
  nextLabel: "Your creator system is ready",
  nextPanel: "overview",
  items: [
    { id: "account", label: "ViewTube account", ready: true, state: "Ready" },
    { id: "youtube", label: "YouTube channel", ready: true, state: "Connected" },
    { id: "billing", label: "Plan and credits", ready: true, state: "Active" },
    { id: "brain", label: "Creator Brain", ready: true, state: "Personalized" },
  ],
}

describe("SettingsWorkspace", () => {
  it("reserves extra bottom space only when mobile thumb shortcuts need it", () => {
    expect(getSettingsWorkspaceBottomPadding(false)).toBe("pb-4 sm:pb-5")
    expect(getSettingsWorkspaceBottomPadding(true)).toBe("pb-4 sm:pb-5 max-[760px]:pb-20")
  })


  it("renders compact workspace chrome and the active panel body", () => {
    const html = renderToStaticMarkup(
      <SettingsWorkspace
        activePanel="overview"
        readiness={READY}
        onPanelChange={vi.fn()}
      >
        <p>Active settings content</p>
      </SettingsWorkspace>,
    )

    expect(html).toContain('data-vt-settings-workspace="true"')
    expect(html).toContain("Settings")
    expect(html).toContain("4/4 ready")
    expect(html).toContain("Active settings content")
    expect(html).not.toContain("Creator control deck")
  })

  it("uses canonical primitive levels for navigation instead of custom settings cards", () => {
    const html = renderToStaticMarkup(
      <SettingsWorkspace
        activePanel="experience"
        readiness={READY}
        onPanelChange={vi.fn()}
      >
        <p>Experience body</p>
      </SettingsWorkspace>,
    )

    expect(html).toContain('data-vt-control-level="l1"')
    expect(html).toContain('aria-label="Settings sections"')
    expect(html).toContain('aria-current="page"')
    expect(html).toContain("Experience")
    expect(html).toContain("Plan + Credits")
  })
})
