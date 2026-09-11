/**
 * Phase 0 guardrails from docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_OPTIMIZATION_PLAN.md.
 *
 * These are invariants the later phases must not break. Phase 2 moves inline
 * widget implementations into lazy modules and Phase 4 rewrites the CSS
 * cascade; both are safe only while the registry stays the single source of
 * truth and every declared dimension keeps working.
 */
import { describe, expect, it } from "vitest"
import {
  DASHBOARD_WIDGET_BY_ID,
  DASHBOARD_WIDGET_REGISTRY,
} from "../WidgetRegistry"
import { DASHBOARD_WIDGET_RENDERER_KEYS } from "../WidgetRenderer"
import { HEIGHT_BUCKET_ORDER, SIZE_BUCKET_ORDER } from "../tokens"
import {
  buildDefaultDashboardLayout,
  normalizeDashboardLayout,
  revealAllReadyDashboardWidgets,
} from "../storage"

describe("registry is the single source of truth", () => {
  it("has no duplicate widget ids", () => {
    const ids = DASHBOARD_WIDGET_REGISTRY.map((widget) => widget.id)
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)

    expect(duplicates).toEqual([])
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("has no duplicate renderer keys", () => {
    const keys = DASHBOARD_WIDGET_REGISTRY.map((widget) => widget.rendererKey)
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index)

    expect(duplicates).toEqual([])
  })

  it("indexes every definition by id", () => {
    for (const widget of DASHBOARD_WIDGET_REGISTRY) {
      expect(DASHBOARD_WIDGET_BY_ID[widget.id]?.id).toBe(widget.id)
    }
  })

  it("carries no renderer key that no definition claims", () => {
    const claimed = new Set(DASHBOARD_WIDGET_REGISTRY.map((widget) => widget.rendererKey))
    const orphans = [...DASHBOARD_WIDGET_RENDERER_KEYS].filter((key) => !claimed.has(key))

    expect(orphans).toEqual([])
  })
})

describe("declared dimensions are all reachable", () => {
  it("orders min <= default <= max for size and height", () => {
    for (const widget of DASHBOARD_WIDGET_REGISTRY) {
      const size = (bucket: string) => SIZE_BUCKET_ORDER.indexOf(bucket as never)
      const height = (bucket: string) => HEIGHT_BUCKET_ORDER.indexOf(bucket as never)

      expect(size(widget.minSize), `${widget.id} minSize`).toBeLessThanOrEqual(size(widget.defaultSize))
      expect(size(widget.defaultSize), `${widget.id} defaultSize`).toBeLessThanOrEqual(size(widget.maxSize))
      expect(height(widget.minHeight), `${widget.id} minHeight`).toBeLessThanOrEqual(height(widget.defaultHeight))
      expect(height(widget.defaultHeight), `${widget.id} defaultHeight`).toBeLessThanOrEqual(height(widget.maxHeight))
    }
  })

  it("keeps every supported size and height inside the declared bounds", () => {
    for (const widget of DASHBOARD_WIDGET_REGISTRY) {
      const sizeLow = SIZE_BUCKET_ORDER.indexOf(widget.minSize)
      const sizeHigh = SIZE_BUCKET_ORDER.indexOf(widget.maxSize)
      const heightLow = HEIGHT_BUCKET_ORDER.indexOf(widget.minHeight)
      const heightHigh = HEIGHT_BUCKET_ORDER.indexOf(widget.maxHeight)

      for (const size of widget.supportedSizes) {
        const index = SIZE_BUCKET_ORDER.indexOf(size)
        expect(index, `${widget.id} supports ${size}`).toBeGreaterThanOrEqual(sizeLow)
        expect(index, `${widget.id} supports ${size}`).toBeLessThanOrEqual(sizeHigh)
      }
      for (const height of widget.supportedHeights) {
        const index = HEIGHT_BUCKET_ORDER.indexOf(height)
        expect(index, `${widget.id} supports ${height}`).toBeGreaterThanOrEqual(heightLow)
        expect(index, `${widget.id} supports ${height}`).toBeLessThanOrEqual(heightHigh)
      }
    }
  })

  it("declares every supportedDimensions pair from the supported buckets", () => {
    for (const widget of DASHBOARD_WIDGET_REGISTRY) {
      expect(widget.supportedDimensions.length, `${widget.id}`).toBeGreaterThan(0)

      for (const pair of widget.supportedDimensions) {
        expect(widget.supportedSizes, `${widget.id} pair size`).toContain(pair.size)
        expect(widget.supportedHeights, `${widget.id} pair height`).toContain(pair.height)
      }
    }
  })
})

describe("every ready widget can be shown", () => {
  it("leaves no ready widget hidden after revealing", () => {
    const everythingHidden = normalizeDashboardLayout({
      schemaVersion: 9,
      locked: false,
      order: DASHBOARD_WIDGET_REGISTRY.map((widget) => widget.id),
      hidden: DASHBOARD_WIDGET_REGISTRY.map((widget) => widget.id),
      instances: {},
    })

    const revealed = revealAllReadyDashboardWidgets(everythingHidden)
    const stillHidden = revealed.hidden
      .map((id) => DASHBOARD_WIDGET_BY_ID[id])
      .filter((widget) => widget?.status === "ready")

    expect(stillHidden.map((widget) => widget?.id)).toEqual([])
  })

  it("gives every default-visible widget an instance with supported dimensions", () => {
    const layout = buildDefaultDashboardLayout()

    for (const id of layout.order.filter((entry) => !layout.hidden.includes(entry))) {
      const widget = DASHBOARD_WIDGET_BY_ID[id]
      const instance = layout.instances[id]

      expect(widget, `${id} is registered`).toBeDefined()
      expect(instance, `${id} has an instance`).toBeDefined()
      expect(widget?.supportedSizes, `${id} size`).toContain(instance!.size)
      expect(widget?.supportedHeights, `${id} height`).toContain(instance!.height)
    }
  })
})
