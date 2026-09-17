import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { VtSyncVisualFrame, type VtSyncVisualModuleSpec } from "./VtSyncVisualFrame"
import { ANALYTICS_WINDOWS, WINDOW_SHORT_LABELS } from "../../../services/analytics/windows"

const spec = (overrides: Partial<VtSyncVisualModuleSpec> = {}): VtSyncVisualModuleSpec => ({
 id: "test-visual",
 sourceTableIds: ["geography"],
 controllerSpec: { rows: [] },
 shellMode: "standard",
 controls: [{ id: "window", label: "Window", kind: "select" }],
 footer: { insight: "" },
 renderer: () => React.createElement("div", null, "chart"),
 ...overrides,
} as unknown as VtSyncVisualModuleSpec)

const render = (props: Record<string, unknown>) =>
 renderToStaticMarkup(
  React.createElement(VtSyncVisualFrame, {
   visualProps: {} as never,
   ...props,
  } as never),
 )

describe("visual frame window control", () => {
 it("renders a chip for every canonical window when the module declares the control", () => {
  const markup = render({ spec: spec(), window: "lifetime", onWindowChange: vi.fn() })
  ANALYTICS_WINDOWS.forEach((w) => {
   expect(markup).toContain(`data-visual-window="${w}"`)
   expect(markup).toContain(WINDOW_SHORT_LABELS[w])
  })
 })

 it("marks exactly the selected window as pressed", () => {
  const markup = render({ spec: spec(), window: "28d", onWindowChange: vi.fn() })
  const pressed = markup.match(/aria-pressed="true"/g) || []
  expect(pressed).toHaveLength(1)
  expect(markup).toMatch(/data-visual-window="28d"[^>]*aria-pressed="true"/)
 })

 it("renders nothing when the module does not declare the control", () => {
  const markup = render({ spec: spec({ controls: [] }), window: "28d", onWindowChange: vi.fn() })
  expect(markup).not.toContain("data-visual-window")
 })

 it("renders nothing when the surface passes no handler", () => {
  // A read-only embed must not show a control that cannot do anything.
  const markup = render({ spec: spec(), window: "28d" })
  expect(markup).not.toContain("data-visual-window")
 })

 it("hides the control for a window-invariant module", () => {
  const markup = render({
   spec: spec({ supportedWindows: ["lifetime"] }),
   window: "lifetime",
   onWindowChange: vi.fn(),
  })
  expect(markup).not.toContain("data-visual-window")
 })

 it("offers only the windows a module supports", () => {
  const markup = render({
   spec: spec({ supportedWindows: ["lifetime", "28d"] }),
   window: "28d",
   onWindowChange: vi.fn(),
  })
  expect(markup).toContain('data-visual-window="28d"')
  expect(markup).not.toContain('data-visual-window="365d"')
 })

 it("says so when the selected window has no data, instead of drawing lifetime silently", () => {
  const markup = render({
   spec: spec(),
   window: "28d",
   onWindowChange: vi.fn(),
   windowUnavailable: true,
  })
  expect(markup).toContain("No Last 28 days data")
 })

 it("shows no unavailable note on lifetime", () => {
  const markup = render({
   spec: spec(),
   window: "lifetime",
   onWindowChange: vi.fn(),
   windowUnavailable: true,
  })
  expect(markup).not.toContain("data — sync this window")
 })
})
