/**
 * Phase 0 guardrails from docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_OPTIMIZATION_PLAN.md.
 *
 * These are invariants the later phases must not break. Phase 2 moves inline
 * widget implementations into lazy modules and Phase 4 rewrites the CSS
 * cascade; both are safe only while the registry stays the single source of
 * truth and every declared dimension keeps working.
 */
import { readFileSync } from "node:fs"
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

  it("keeps rendererKey equal to id", () => {
    // The two are the same value today. A definition that drifts would resolve
    // through the lazy map under one name while the layout persists the other.
    for (const widget of DASHBOARD_WIDGET_REGISTRY) {
      expect(widget.rendererKey, `${widget.id} rendererKey`).toBe(widget.id)
    }
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

describe("the renderer's inline key list matches its actual branches", () => {
  // INLINE_WIDGET_RENDERER_KEYS is hand-maintained, and DASHBOARD_WIDGET_RENDERER_KEYS
  // is built from it. If a branch is deleted without its list entry, certification
  // keeps reporting the widget as covered while it renders nothing — a failure that
  // shows up as an empty grid slot rather than an error.
  const rendererSource = readFileSync(new URL("../WidgetRenderer.tsx", import.meta.url), "utf8")

  const declared = new Set(
    (rendererSource.match(/const INLINE_WIDGET_RENDERER_KEYS[\s\S]*?\n\]/)?.[0] ?? "")
      .match(/"([a-z0-9-]+)"/g)
      ?.map((quoted) => quoted.slice(1, -1)) ?? [],
  )

  // Count distinct ids, not occurrences: one branch can test the same id again in a
  // ternary for its icon or copy, which is not a second branch.
  const branched = new Set(
    (rendererSource.match(/widget\.id === "([a-z0-9-]+)"/g) ?? [])
      .map((match) => match.replace(/.*"(.*)"/, "$1")),
  )

  it("declares every id the resolver actually branches on", () => {
    const undeclared = [...branched].filter((id) => !declared.has(id)).sort()
    expect(undeclared).toEqual([])
  })

  it("branches on every id it declares", () => {
    const unbranched = [...declared].filter((id) => !branched.has(id)).sort()
    expect(unbranched).toEqual([])
  })

  it("finds a registry definition for every inline key", () => {
    const unregistered = [...declared].filter((id) => !DASHBOARD_WIDGET_BY_ID[id]).sort()
    expect(unregistered).toEqual([])
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
