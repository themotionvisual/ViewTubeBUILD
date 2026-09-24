import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { SettingsAccountPanel } from "./SettingsAccountPanel"

describe("SettingsAccountPanel", () => {
  it("renders compact identity and account preferences on canonical primitives", () => {
    const html = renderToStaticMarkup(
      <SettingsAccountPanel
        profileName="Creator"
        currentHandleValue="@creator"
        currentEmail="creator@example.com"
        connected
        connectionHelper="Channel is connected."
        connectionState="connected"
        canResolvePublicHandle={false}
        resolveStatus={null}
        notifyBilling
        connectAction={<button type="button">Connect</button>}
        onDisconnect={vi.fn()}
        onHandleInputChange={vi.fn()}
        onPublicResolve={vi.fn()}
        onToggleNotifyBilling={vi.fn()}
      />,
    )

    expect(html).toContain("Creator Identity")
    expect(html).toContain("@creator")
    expect(html).toContain("Connected")
    expect(html).toContain("Account Preferences")
    expect(html).toContain('data-vt-control-level="l1"')
    expect(html).toContain("Disconnect")
    expect(html).not.toContain("Creator passport")
  })

  it("uses the supplied account action when disconnected", () => {
    const html = renderToStaticMarkup(
      <SettingsAccountPanel
        profileName=""
        currentHandleValue=""
        currentEmail=""
        connected={false}
        connectionHelper="Connect your channel."
        connectionState="disconnected"
        canResolvePublicHandle
        resolveStatus={null}
        notifyBilling={false}
        connectAction={<button type="button">Connect ViewTube</button>}
        onDisconnect={vi.fn()}
        onHandleInputChange={vi.fn()}
        onPublicResolve={vi.fn()}
        onToggleNotifyBilling={vi.fn()}
      />,
    )

    expect(html).toContain("Connect ViewTube")
    expect(html).toContain("Public Channel Mode")
  })
})
