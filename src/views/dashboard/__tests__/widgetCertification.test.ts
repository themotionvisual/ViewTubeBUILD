import { describe, expect, it } from "vitest"
import { DASHBOARD_WIDGET_BY_ID, SUPPORTED_DASHBOARD_WIDGET_IDS } from "../WidgetRegistry"
import { WIDGET_CERTIFICATION_MATRIX, buildWidgetCertificationReport } from "../widgetCertification"

describe("supported widget size × height certification", () => {
  it("certifies every supported widget and every declared dimension pair", () => {
    const report = buildWidgetCertificationReport()
    expect(report.certified).toBe(true)
    expect(report.missing).toEqual([])
    expect(report.invalid).toEqual([])
    expect(report.supportedCount).toBe(SUPPORTED_DASHBOARD_WIDGET_IDS.length)
    expect(report.dimensionCount).toBeGreaterThan(report.supportedCount)
  })

  it("keeps min/default/max geometry inside the declared supported matrix", () => {
    for (const id of SUPPORTED_DASHBOARD_WIDGET_IDS) {
      const definition = DASHBOARD_WIDGET_BY_ID[id]
      const contract = WIDGET_CERTIFICATION_MATRIX[id]
      expect(contract.supportedSizes).toContain(definition.minSize)
      expect(contract.supportedSizes).toContain(definition.defaultSize)
      expect(contract.supportedSizes).toContain(definition.maxSize)
      expect(contract.supportedHeights).toContain(definition.minHeight)
      expect(contract.supportedHeights).toContain(definition.defaultHeight)
      expect(contract.supportedHeights).toContain(definition.maxHeight)

      const keys = new Set(contract.supportedDimensions.map(({ size, height }) => `${size}::${height}`))
      expect(keys.size).toBe(contract.supportedSizes.length * contract.supportedHeights.length)
      for (const size of contract.supportedSizes) {
        for (const height of contract.supportedHeights) {
          expect(keys.has(`${size}::${height}`), `${id} missing ${size} × ${height}`).toBe(true)
        }
      }
    }
  })
})
