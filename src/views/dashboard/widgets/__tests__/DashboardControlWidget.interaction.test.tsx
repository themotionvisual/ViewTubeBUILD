// @vitest-environment jsdom
import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DashboardProvider } from "../../../../context/DashboardContext"
import { DashboardControlWidget } from "../DashboardControlWidget"
import { DASHBOARD_WIDGET_BY_ID, DASHBOARD_WIDGET_REGISTRY } from "../../WidgetRegistry"

class TestResizeObserver {
  observe() {}
  disconnect() {}
}

describe("DashboardControlWidget miniature dashboard", () => {
  let container: HTMLDivElement
  let root: Root | null

  beforeEach(() => {
    ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    vi.stubGlobal("ResizeObserver", TestResizeObserver)
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) => window.setTimeout(callback, 0),
    })
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: (handle: number) => window.clearTimeout(handle),
    })
    const entries = new Map<string, string>()
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        get length() { return entries.size },
        clear: () => entries.clear(),
        getItem: (key: string) => entries.get(key) ?? null,
        key: (index: number) => [...entries.keys()][index] ?? null,
        removeItem: (key: string) => entries.delete(key),
        setItem: (key: string, value: string) => entries.set(key, value),
      },
    })
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    if (root) await act(async () => root?.unmount())
    container?.remove()
    root = null
    vi.unstubAllGlobals()
  })

  it("replaces the flat list with a proportional 24-column widget map", async () => {
    const widget = DASHBOARD_WIDGET_BY_ID["dashboard-controls"]
    await act(async () => {
      root.render(
        <DashboardProvider>
          <DashboardControlWidget
            widget={widget}
            instance={{ collapsed: false, size: "third", height: "tall" }}
            editMode={false}
            canEdit
            onToggleCollapse={vi.fn()}
            onCycleSize={vi.fn()}
            onDecSize={vi.fn()}
            onCycleHeight={vi.fn()}
            onDecHeight={vi.fn()}
            onRemove={vi.fn()}
          />
        </DashboardProvider>,
      )
    })

    const widgetsTab = [...container.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent?.trim() === "Widgets")
    expect(widgetsTab).toBeTruthy()
    await act(async () => widgetsTab?.click())

    const visibleGrid = container.querySelector('[aria-label="Current dashboard miniature layout"]')
    const miniatures = visibleGrid?.querySelectorAll<HTMLElement>(".dashboard-widget-miniature") || []
    expect(visibleGrid).not.toBeNull()
    expect(miniatures).toHaveLength(DASHBOARD_WIDGET_REGISTRY.length)

    const communityPost = visibleGrid?.querySelector<HTMLElement>('[data-widget-id="community-post"]')
    expect(communityPost?.style.gridColumn).toBe("span 12")
    expect(communityPost?.querySelectorAll(".dashboard-miniature-action")).toHaveLength(10)
    expect(communityPost?.querySelector(".dashboard-widget-miniature-header")).not.toBeNull()
    expect(container.textContent).toContain("All available widgets are visible")
  })

  it("filters the miniature map without changing its proportional placeholders", async () => {
    const widget = DASHBOARD_WIDGET_BY_ID["dashboard-controls"]
    await act(async () => {
      root.render(
        <DashboardProvider>
          <DashboardControlWidget
            widget={widget}
            instance={{ collapsed: false, size: "third", height: "tall" }}
            editMode={false}
            canEdit
            onToggleCollapse={vi.fn()}
            onCycleSize={vi.fn()}
            onDecSize={vi.fn()}
            onCycleHeight={vi.fn()}
            onDecHeight={vi.fn()}
            onRemove={vi.fn()}
          />
        </DashboardProvider>,
      )
    })

    const widgetsTab = [...container.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent?.trim() === "Widgets")
    await act(async () => widgetsTab?.click())
    const creationFilter = [...container.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent?.trim() === "Creation")
    await act(async () => creationFilter?.click())

    const visibleGrid = container.querySelector('[aria-label="Current dashboard miniature layout"]')
    expect(visibleGrid?.querySelectorAll(".dashboard-widget-miniature")).toHaveLength(DASHBOARD_WIDGET_REGISTRY.length)
    expect(visibleGrid?.querySelector('[data-widget-id="community-post"]')?.getAttribute("data-filtered-out")).toBe("false")
    expect(visibleGrid?.querySelector('[data-widget-id="kpi-cluster"]')?.getAttribute("data-filtered-out")).toBe("true")
  })
})
