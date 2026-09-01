import { afterEach, describe, expect, it, vi } from "vitest"
import { VT_SPECTRUM_PALETTE_06 } from "../../../styles/toolboxPalette"
import {
  DASHBOARD_WIDGET_REGISTRY,
  DEFAULT_DASHBOARD_ROWS,
  SUPPORTED_DASHBOARD_WIDGET_IDS,
} from "../WidgetRegistry"
import {
  buildDefaultDashboardLayout,
  exportDashboardLayout,
  importDashboardLayout,
  loadDashboardLayout,
  normalizeDashboardLayout,
} from "../storage"
import {
  DASHBOARD_LAYOUT_BACKUP_KEY,
  DASHBOARD_LAYOUT_STORAGE_KEY,
  DASHBOARD_SCHEMA_VERSION,
  LEGACY_DASHBOARD_LAYOUT_STORAGE_KEYS,
} from "../tokens"
import {
  resolveDashboardSpectrum,
  resolveVisibleWidgetSpectrum,
} from "../spectrum"
import { buildWidgetCertificationReport } from "../widgetCertification"
import { DASHBOARD_WIDGET_RENDERER_KEYS } from "../WidgetRenderer"

const createMemoryStorage = (): Storage => {
  const entries = new Map<string, string>()
  return {
    get length() { return entries.size },
    clear: () => entries.clear(),
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => [...entries.keys()][index] ?? null,
    removeItem: (key) => { entries.delete(key) },
    setItem: (key, value) => { entries.set(key, value) },
  }
}

afterEach(() => vi.unstubAllGlobals())

describe("dashboard positional spectrum", () => {
  it("assigns colors from visible order and wraps after the twelfth widget", () => {
    expect(resolveDashboardSpectrum(0).headerColor).toBe(VT_SPECTRUM_PALETTE_06[0])
    expect(resolveDashboardSpectrum(11).headerColor).toBe(VT_SPECTRUM_PALETTE_06[11])
    expect(resolveDashboardSpectrum(12).headerColor).toBe(VT_SPECTRUM_PALETTE_06[0])
    expect(resolveDashboardSpectrum(0).iconRailColor).toBe(VT_SPECTRUM_PALETTE_06[4])
  })

  it("does not allocate a spectrum position to hidden widgets", () => {
    const spectrum = resolveVisibleWidgetSpectrum(
      ["first", "hidden", "second"],
      new Set(["hidden"]),
    )

    expect(spectrum.first.headerColor).toBe(VT_SPECTRUM_PALETTE_06[0])
    expect(spectrum.second.headerColor).toBe(VT_SPECTRUM_PALETTE_06[1])
    expect(spectrum.hidden).toBeUndefined()
  })
})

describe("dashboard v9 registry and layout migration", () => {
  it("packs every default row to full width with one shared height", () => {
    const widthUnits = {
      full: 24,
      "three-quarters": 18,
      "two-thirds": 16,
      half: 12,
      between: 10,
      third: 8,
      companion: 7,
      quarter: 6,
      sixth: 4,
      eighth: 3,
      twelfth: 2,
      "twenty-fourth": 1,
    } as const

    for (const row of DEFAULT_DASHBOARD_ROWS) {
      expect(row.reduce((sum, slot) => sum + widthUnits[slot.size], 0)).toBe(24)
      expect(new Set(row.map((slot) => slot.height)).size).toBe(1)
    }
  })

  it("makes the canonical top dashboard row one height step taller", () => {
    expect(DEFAULT_DASHBOARD_ROWS[0].map((slot) => slot.height)).toEqual([
      "tall",
      "tall",
      "tall",
    ])
  })

  it("certifies the supported cohort including the split video workflows", () => {
    const supported = DASHBOARD_WIDGET_REGISTRY
      .filter((widget) => widget.releaseTier === "supported")
      .sort((left, right) => left.defaultOrder - right.defaultOrder)

    // Layout now mirrors brain-owner-consent with every registered widget
    // included so all are viewable by default.
    expect(supported).toHaveLength(58)
    // First widget rotates with layout tweaks; only guaranteed to be one of
     // the top-row widgets (About / KPI Cluster / Data Visuals).
     expect(["app-verification-explainer", "kpi-cluster", "overview-data-visuals"]).toContain(supported[0]?.id)
    expect(supported.map((widget) => widget.id)).toContain("app-verification-explainer")
    expect(supported.map((widget) => widget.id)).toContain("video-uploader")
    expect(supported.map((widget) => widget.id)).toContain("data-edit")
    expect(supported.map((widget) => widget.id)).toContain("script-studio")
    expect(supported.map((widget) => widget.id)).toContain("dashboard-controls")
    expect(supported.map((widget) => widget.id)).toContain("brain-hub")
    expect(supported.map((widget) => widget.id)).toContain("sync-controller")
    expect(SUPPORTED_DASHBOARD_WIDGET_IDS).toHaveLength(58)
    // tag-generator moved into the supported cohort (brain includes it).
    expect(DASHBOARD_WIDGET_REGISTRY.find((widget) => widget.id === "tag-generator")?.releaseTier).toBe("supported")
    expect(supported.every((widget) => widget.supportedDimensions.length > 0)).toBe(true)
  })

  it("has renderer coverage for every registry definition", () => {
    const missing = DASHBOARD_WIDGET_REGISTRY
      .filter((widget) => !DASHBOARD_WIDGET_RENDERER_KEYS.has(widget.rendererKey))
      .map((widget) => widget.id)

    expect(missing).toEqual([])
  })

  it("has a complete certification contract for every supported widget", () => {
    const report = buildWidgetCertificationReport()

    expect(report.supportedCount).toBe(58)
    expect(report.missing).toEqual([])
    expect(report.invalid).toEqual([])
    expect(report.certified).toBe(true)
  })

  it("builds new layouts from registry defaults instead of serialized colors", () => {
    const layout = buildDefaultDashboardLayout()
    const visible = layout.order.filter((id) => !layout.hidden.includes(id))
    const exported = exportDashboardLayout(layout)

    expect(layout.schemaVersion).toBe(DASHBOARD_SCHEMA_VERSION)
    // 58 registered - 14 initially hidden (obviously-unfinished audit) = 44
    expect(visible).toHaveLength(44)
    expect(visible).toContain("dashboard-controls")
    expect(visible).toContain("brain-hub")
    expect(visible).toContain("script-studio")
    expect(visible).toContain("hashtag-analyzer")
    expect(exported).not.toContain("headerColor")
    expect(exported).not.toContain("iconRailColor")
    expect(exported).not.toContain("pinned")
    expect(exported).not.toContain("focus")
  })

  it("preserves known order and visibility while removing dead state", () => {
    const migrated = normalizeDashboardLayout({
      schemaVersion: 8,
      locked: true,
      order: ["goals-tracker", "kpi-cluster", "unknown-widget"],
      hidden: ["kpi-cluster", "unknown-widget"],
      instances: {
        "goals-tracker": {
          collapsed: true,
          size: "not-a-size",
          height: "massive",
          pinned: true,
          focus: true,
          headerColor: "#fff",
        },
      },
    })

    expect(migrated.schemaVersion).toBe(DASHBOARD_SCHEMA_VERSION)
    expect(migrated.locked).toBe(true)
    expect(migrated.order.slice(0, 2)).toEqual(["goals-tracker", "kpi-cluster"])
    expect(migrated.hidden).not.toContain("video-uploader")
    expect(migrated.order).not.toContain("unknown-widget")
    expect(migrated.hidden).toContain("kpi-cluster")
    expect(migrated.instances["goals-tracker"]?.collapsed).toBe(true)
    expect(migrated.instances["goals-tracker"]?.size).toBe("quarter")
    // Every widget now supports the full short..colossal range, so a
    // serialized "massive" is preserved (no clamp).
    expect(migrated.instances["goals-tracker"]?.height).toBe("massive")
    expect(migrated.instances["goals-tracker"]).toEqual({
      collapsed: true,
      size: "quarter",
      height: "massive",
    })
  })

  it.each(LEGACY_DASHBOARD_LAYOUT_STORAGE_KEYS)("migrates and backs up %s layouts", (legacyKey) => {
    const storage = createMemoryStorage()
    storage.setItem(legacyKey, JSON.stringify({
      schemaVersion: 8,
      order: ["goals-tracker", "kpi-cluster"],
      hidden: ["kpi-cluster"],
      instances: {},
    }))
    vi.stubGlobal("window", { localStorage: storage })

    const migrated = loadDashboardLayout()

    expect(migrated.schemaVersion).toBe(DASHBOARD_SCHEMA_VERSION)
    expect(migrated.order.slice(0, 2)).toEqual(["goals-tracker", "kpi-cluster"])
    expect(storage.getItem(DASHBOARD_LAYOUT_STORAGE_KEY)).toBeTruthy()
    expect(storage.getItem(DASHBOARD_LAYOUT_BACKUP_KEY)).toContain(legacyKey)
  })

  it("rejects corrupt imports and round-trips valid v9 exports without color state", () => {
    const storage = createMemoryStorage()
    vi.stubGlobal("window", { localStorage: storage })
    expect(() => importDashboardLayout('{"order":"not-an-array"}')).toThrow("Invalid dashboard layout")

    const initial = buildDefaultDashboardLayout()
    const roundTrip = importDashboardLayout(exportDashboardLayout(initial))
    expect(roundTrip).toEqual(initial)
    expect(storage.getItem(DASHBOARD_LAYOUT_STORAGE_KEY)).not.toContain("headerColor")
  })
})
