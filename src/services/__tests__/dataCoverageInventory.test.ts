import { describe, it, expect, beforeEach, vi } from "vitest"
import { buildDataCoverageInventory } from "../dataCoverageInventory"

describe("Data Coverage Inventory Engine", () => {
 beforeEach(() => {
  vi.resetModules()
  const localStorageMock = {
   getItem: vi.fn(),
   setItem: vi.fn(),
   clear: vi.fn(),
  }
  vi.stubGlobal("localStorage", localStorageMock)
 })

 it("should identify received metrics from master table rows", () => {
  const mockRows = [
   {
    Format: "Video",
    Views: 5000,
    __metricCells: {
     views: { status: "actual", value: 5000, confidence: "raw_direct" },
    },
    _originalData: { views: 5000 },
   },
  ]

  const inventory = buildDataCoverageInventory(mockRows as any)
  const viewEntry = inventory.rows.find((r) => r.canonicalKey === "views")

  expect(viewEntry?.status).toBe("received")
  expect(viewEntry?.example).toBe("5000")
  expect(viewEntry?.reason).toContain("Value detected")
 })

 it("should resolve formula values when dependencies are present", () => {
  const mockRows = [
   {
    Format: "Video",
    Views: 1000,
    Likes: 50,
    Comments: 10,
    Shares: 5,
    _originalData: {
     views: 1000,
     likes: 50,
     comments: 10,
     shares: 5,
    },
   },
  ]

  const inventory = buildDataCoverageInventory(mockRows as any)
  const engagementEntry = inventory.expandedRows.find(
   (r) => r.canonicalKey === "engagement_rate",
  )

  expect(engagementEntry?.status).toBe("received")
  expect(engagementEntry?.example).toBe("6.50%")
 })

 it("should mark metrics as missing with reason if cache is empty", () => {
  const inventory = buildDataCoverageInventory([])
  const adImp = inventory.expandedRows.find(
   (r) => r.canonicalKey === "adImpressions",
  )

  expect(adImp?.status).toBe("missing")
  expect(adImp?.reason).toBe(
   "Key tracked but no value found in current rows/cache.",
  )
 })

 it("should mark short-only metrics as not applicable if no shorts rows exist", () => {
  const mockRows = [{ Format: "Video", Views: 100 }]
  const inventory = buildDataCoverageInventory(mockRows as any)
  const stwEntry = inventory.rows.find((r) => r.canonicalKey === "stw")
  expect(stwEntry?.status).toBe("not_applicable")
 })
})
