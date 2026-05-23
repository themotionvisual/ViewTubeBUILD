import { describe, expect, it } from "vitest"

import {
  buildActualMetricCell,
  emptyMetricCells,
  type CanonicalVideoRow,
} from "../analytics/DataStore"
import { canonicalRowsToMasterTableRows } from "../analytics/Selectors"

describe("canonicalRowsToMasterTableRows master visibility fields", () => {
  it("preserves CSV-backed master fields including zeros for long-form and shorts rows", () => {
    const longMetrics = emptyMetricCells("csv_table")
    longMetrics.impressions = buildActualMetricCell(7264064, "csv_table")
    longMetrics.ctr = buildActualMetricCell(3.7, "csv_table")
    longMetrics.uniqueViewers = buildActualMetricCell(0, "csv_table")
    longMetrics.newViewers = buildActualMetricCell(0, "csv_table")
    longMetrics.returningViewers = buildActualMetricCell(0, "csv_table")
    longMetrics.casualViewers = buildActualMetricCell(0, "csv_table")
    longMetrics.regularViewers = buildActualMetricCell(0, "csv_table")

    const shortsMetrics = emptyMetricCells("csv_table")
    shortsMetrics.stw = buildActualMetricCell(48.37, "csv_table")
    shortsMetrics.uniqueViewers = buildActualMetricCell(0, "csv_table")

    const rows: CanonicalVideoRow[] = [
      {
        id: "long-1",
        videoId: "abc123xyz01",
        title: "Long Row",
        uploadDate: "2026-05-20",
        format: "long",
        durationSeconds: 300,
        sourceMode: "csv_table",
        metrics: longMetrics,
        supplementalData: {
          "Impressions": 7264064,
          "Impressions click-through rate (%)": 3.7,
          "Unique viewers": 0,
          "Average views per viewer": 0,
          "Unique reach": 10286,
          "New viewers": 0,
          "Returning viewers": 0,
          "Casual viewers": 0,
          "Regular viewers": 0,
          "Likes (vs. dislikes) (%)": 97.3,
        },
        originalData: {},
      },
      {
        id: "short-1",
        videoId: "def456uvw02",
        title: "Short Row",
        uploadDate: "2026-05-20",
        format: "shorts",
        durationSeconds: 35,
        sourceMode: "csv_table",
        metrics: shortsMetrics,
        supplementalData: {
          "Stayed to watch (%)": 48.37,
          "Unique viewers": 0,
        },
        originalData: {},
      },
    ]

    const [longRow, shortRow] = canonicalRowsToMasterTableRows(rows)

    expect(longRow["Impressions"]).toBe(7264064)
    expect(longRow["Impressions click-through rate (%)"]).toBe(3.7)
    expect(longRow["Unique viewers"]).toBe(0)
    expect(longRow["Average views per viewer"]).toBe(0)
    expect(longRow["Unique reach"]).toBe(10286)
    expect(longRow["New viewers"]).toBe(0)
    expect(longRow["Returning viewers"]).toBe(0)
    expect(longRow["Casual viewers"]).toBe(0)
    expect(longRow["Regular viewers"]).toBe(0)
    expect(longRow["Likes (vs. dislikes) (%)"]).toBe(97.3)
    expect(shortRow["Stayed to watch (%)"]).toBe(48.37)
    expect(shortRow["Unique viewers"]).toBe(0)
  })
})
