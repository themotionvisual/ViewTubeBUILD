import { describe, expect, it } from "vitest"
import {
 CHANNEL_DATA_GUIDE_FAMILIES,
 CHANNEL_DATA_SOURCE_GUIDE,
} from "../analytics/MetricRegistry"

describe("channelDataGuideRegistry", () => {
 it("covers every major family in the breakdown guide", () => {
  const families = new Set(CHANNEL_DATA_GUIDE_FAMILIES.map((family) => family.majorFamily))

  expect(families).toEqual(
   new Set([
    "video_data",
    "daily_metrics",
    "traffic",
    "geography",
    "audience",
    "surfaces_discovery",
    "revenue_monetization",
   ]),
  )
 })

 it("uses only supported availability tags", () => {
  const validAvailability = new Set(["api", "public", "reporting", "csv_only"])

  CHANNEL_DATA_GUIDE_FAMILIES.forEach((family) => {
   family.rows.forEach((row) => {
    row.availability.forEach((availability) => {
     expect(validAvailability.has(availability)).toBe(true)
    })
   })
  })
 })

 it("flags CSV-dependent reach metrics and exposes source guide rows", () => {
  const csvDependentRows = CHANNEL_DATA_GUIDE_FAMILIES.flatMap((family) => family.rows).filter(
   (row) =>
    row.needsCsv &&
    row.metrics.some((metric) =>
     /impressions|ctr|stayed to watch/i.test(metric),
    ),
  )

  expect(csvDependentRows.length).toBeGreaterThan(0)
  expect(CHANNEL_DATA_SOURCE_GUIDE.map((row) => row.title)).toEqual(
   expect.arrayContaining([
    "Fast API Sync",
    "Public Channel / Video Data",
    "Reporting / Bulk History",
    "CSV Uploads",
   ]),
  )
 })
})
