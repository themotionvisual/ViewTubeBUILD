import { describe, expect, it } from "vitest"
import { PAGE_REGISTRY } from "../../app/pageRegistry"
import {
 GUIDE_DATASETS,
 GUIDE_FEATURES,
 GUIDE_METRICS,
 GUIDE_METRIC_RELATIONSHIPS,
 GUIDE_PAGES,
 GUIDE_WIDGETS,
 guideWidgetTeaching,
} from "./index"

const expectUnique = (values: readonly string[]) => {
 expect(new Set(values).size).toBe(values.length)
}

describe("User Guide V2 registry governance", () => {
 it("keeps documentation registry IDs unique", () => {
  expectUnique(GUIDE_FEATURES.map((item) => item.id))
  expectUnique(GUIDE_DATASETS.map((item) => item.id))
  expectUnique(GUIDE_WIDGETS.map((item) => item.id))
  expectUnique(GUIDE_PAGES.map((item) => item.id))
  expectUnique(GUIDE_PAGES.map((item) => item.slug))
 })

 it("maps every production navigation surface into the Guide feature registry", () => {
  const documentedRoutes = new Set(GUIDE_FEATURES.flatMap((feature) => feature.routes))
  const missing = PAGE_REGISTRY
   .filter((page) => page.lifecycle === "production")
   .filter((page) => page.navigationVisibility !== "hidden")
   .filter((page) => !documentedRoutes.has(page.path))
   .map((page) => page.path)

  expect(missing).toEqual([])
 })

 it("only references known Guide features from Guide pages", () => {
  const featureIds = new Set(GUIDE_FEATURES.map((feature) => feature.id))
  const missing = GUIDE_PAGES.flatMap((page) =>
   page.featureIds
    .filter((featureId) => !featureIds.has(featureId))
    .map((featureId) => `${page.id} -> ${featureId}`),
  )
  expect(missing).toEqual([])
 })

 it("derives every visible VT-SYNC dataset with canonical identity metadata", () => {
  for (const dataset of GUIDE_DATASETS) {
   expect(dataset.id).toBeTruthy()
   expect(dataset.canonicalDatasetId).toBeTruthy()
   expect(dataset.exportName).toBeTruthy()
   expect(dataset.columnCount).toBeGreaterThan(0)
   expect(dataset.metricColumnCount).toBeGreaterThanOrEqual(0)
  }
 })

 it("keeps metric relationship links valid", () => {
  const metricIds = new Set(GUIDE_METRICS.map((metric) => metric.id))
  for (const relationship of GUIDE_METRIC_RELATIONSHIPS) {
   expect(metricIds.has(relationship.metricId)).toBe(true)
   expect(relationship.pairWith.length).toBeGreaterThan(0)
   for (const relatedId of relationship.pairWith) expect(metricIds.has(relatedId)).toBe(true)
  }
 })

 it("teaches users how to interpret every registered widget", () => {
  for (const widget of GUIDE_WIDGETS) {
   const teaching = guideWidgetTeaching(widget)
   expect(teaching.whatItShows.length).toBeGreaterThan(20)
   expect(teaching.howToRead.length).toBeGreaterThanOrEqual(2)
   expect(teaching.patterns.length).toBeGreaterThanOrEqual(1)
   expect(teaching.controls.length).toBeGreaterThanOrEqual(1)
  }
 })

 it("keeps dashboard widget documentation linked to release and dependency truth", () => {
  for (const widget of GUIDE_WIDGETS) {
   expect(widget.title).toBeTruthy()
   expect(widget.releaseTier).toBeTruthy()
   expect(widget.dependency.length).toBeGreaterThan(0)
   expect(widget.detailedDescription).toBeTruthy()
  }
 })
})
