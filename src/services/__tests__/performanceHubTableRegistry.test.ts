import { describe, expect, it } from "vitest"

import {
  buildProjectedDailyMetricFields,
  DAILY_METRIC_COLUMNS,
  getMasterVideoColumnDefinition,
  MASTER_VIDEO_COLUMNS,
  PERFORMANCE_HUB_DATASET_PROFILES,
  PERFORMANCE_HUB_TABLE_DATASET_CONTRACTS,
  projectDailyMetricColumns,
} from "../performanceHubTableRegistry"

describe("performanceHubTableRegistry", () => {
  it("keeps the daily table in the screenshot-driven column order", () => {
    expect(PERFORMANCE_HUB_TABLE_DATASET_CONTRACTS.daily.columns.slice(0, 16)).toEqual([
      "Date",
      "Engaged views",
      "Subscribers",
      "Average percentage viewed (%)",
      "Videos added",
      "Videos published",
      "Impressions",
      "Impressions click-through rate (%)",
      "Unique viewers",
      "Stayed to watch (%)",
      "Average views per viewer",
      "Unique reach",
      "New viewers",
      "Casual viewers",
      "Returning viewers",
      "Regular viewers",
    ])
  })

  it("locks daily sorting to newest date by default", () => {
    expect(PERFORMANCE_HUB_DATASET_PROFILES.daily.defaultSort).toEqual({
      column: "Date",
      dir: "desc",
    })
  })

  it("keeps the master table contract aligned to the canonical master column registry", () => {
    expect(PERFORMANCE_HUB_TABLE_DATASET_CONTRACTS.master.columns).toEqual(
      MASTER_VIDEO_COLUMNS.map((column) => column.header),
    )
    expect(getMasterVideoColumnDefinition("Watch Page ads (USD)")).toMatchObject({
      sourceCapability: "csv_only",
      csvSupported: true,
      apiSyncable: false,
    })
    expect(getMasterVideoColumnDefinition("YouTube ad revenue (USD)")).toMatchObject({
      sourceCapability: "both",
      csvSupported: true,
      apiSyncable: true,
    })
  })

  it("projects daily metrics from aliases and keeps CSV-first coverage explicit", () => {
    const projected = projectDailyMetricColumns({
      day: "2026-05-20",
      engagedViews: 412,
      uniqueViewers: 300,
      new_viewers: 111,
      cardClicks: 18,
      endScreenClicks: 5,
      estimatedRevenue: 14.2,
    })

    expect(projected).toMatchObject({
      Date: "2026-05-20",
      "Engaged views": 412,
      "Unique viewers": 300,
      "New viewers": 111,
      "Card clicks": 18,
      "End screen element clicks": 5,
      "Estimated revenue (USD)": 14.2,
    })

    const csvFirstHeaders = DAILY_METRIC_COLUMNS.filter((column) => column.csvOnly).map(
      (column) => column.header,
    )

    expect(csvFirstHeaders).toContain("Stayed to watch (%)")
    expect(csvFirstHeaders).toContain("New viewers")
    expect(csvFirstHeaders).toContain("Casual viewers")
    expect(csvFirstHeaders).toContain("Returning viewers")
    expect(csvFirstHeaders).toContain("Regular viewers")
  })

  it("prefers matching CSV daily values over zeroed API values while keeping API-only fallbacks", () => {
    const projected = buildProjectedDailyMetricFields(
      {
        Date: "2026-02-18",
        engagedViews: 0,
        uniqueViewers: 0,
        views: 3973,
        estimatedRevenue: 0.1,
      },
      {
        Date: "2026-02-18",
        "Engaged views": 2076,
        "Unique viewers": 1725,
      },
    )

    expect(projected).toMatchObject({
      Date: "2026-02-18",
      "Engaged views": 2076,
      "Unique viewers": 1725,
      Views: 3973,
      "Estimated revenue (USD)": 0.1,
    })
  })
})
