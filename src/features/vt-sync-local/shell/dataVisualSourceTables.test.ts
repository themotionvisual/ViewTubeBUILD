import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import {
 DATA_VISUAL_SOURCE_TABLES,
 dataVisualSourceTables,
} from "./dataVisualSourceTables"
import { VT_SYNC_VISUAL_MODULE_REGISTRY } from "./VtSyncDataVisualsToolbox"
import { formatVtSyncVisualDataSourcePrefix } from "./VtSyncVisualDataSourceContext"

/**
 * The `DATA: …` line above every visual's subtitle is a provenance claim the
 * creator reads as fact. It used to come from substring matching on the
 * visual's id, with `["videos"]` as a catch-all, so most of the collection
 * claimed the wrong tables. These assertions are what stop that returning.
 */
describe("Data Visual source tables", () => {
 it("registers every visual explicitly", () => {
  const missing = VT_SYNC_VISUAL_MODULE_REGISTRY
   .map((module) => module.id)
   .filter((id) => !(id in DATA_VISUAL_SOURCE_TABLES))
  expect(missing, `visuals with no registered source tables: ${missing.join(", ")}`).toEqual([])
 })

 it("registers nothing that is not a visual", () => {
  const ids = new Set(VT_SYNC_VISUAL_MODULE_REGISTRY.map((module) => module.id))
  const orphans = Object.keys(DATA_VISUAL_SOURCE_TABLES).filter((id) => !ids.has(id))
  expect(orphans, `registered source tables for unknown visuals: ${orphans.join(", ")}`).toEqual([])
 })

 it("never falls back to a guess", () => {
  // An unregistered visual prints no provenance line at all. A default of
  // "Videos" would read as a fact rather than as an omission.
  expect(dataVisualSourceTables("not-a-visual")).toEqual([])
  expect(formatVtSyncVisualDataSourcePrefix(dataVisualSourceTables("not-a-visual"))).toBe("")
 })

 it("names at least one table per visual, and every table has a label", () => {
  for (const module of VT_SYNC_VISUAL_MODULE_REGISTRY) {
   const tables = dataVisualSourceTables(module.id)
   expect(tables.length, `${module.id} names no source table`).toBeGreaterThan(0)
   const prefix = formatVtSyncVisualDataSourcePrefix(tables)
   expect(prefix, `${module.id} prefix`).toMatch(/^DATA: /)
   // A table id that reached the humanizer instead of the label map shows up
   // as its raw snake_case spelling with the underscore still in it.
   expect(prefix, `${module.id} has an unlabelled table: ${prefix}`).not.toMatch(/_/)
  }
 })

 it("keeps the shells from printing the provenance line twice", () => {
  // The module shells prepend `DATA: …` themselves (see
  // `useVtSyncVisualDataSourcePrefix`), so a subtitle that also hand-rolls one
  // renders "DATA: VIDEOS + DAILY STATS · DATA: DAILY STATS • …".
  const MODULE_FILES = [
   "src/components/GraphsPageCharts.tsx",
   "src/components/TubeExplorerVisualModules.tsx",
   "src/components/DataVisuals/modules2/ChannelBigBangTimeline.tsx",
   "src/components/DataVisuals/modules2/MultiMetricTimeline.tsx",
   "src/components/DataVisuals/modules2/RevenueMosaic.tsx",
   "src/components/DataVisuals/modules2/SearchTermGravity.tsx",
   "src/components/DataVisuals/modules2/TrajectoryForecaster.tsx",
   "src/components/DataVisuals/modules2/VideoPerformanceFingerprint.tsx",
   "src/components/DataVisuals/modules2/WeeklySparklines.tsx",
  ]
  for (const file of MODULE_FILES) {
   const source = readFileSync(join(process.cwd(), file), "utf8")
   const offenders = source
    .split("\n")
    .map((line, index) => ({ line: line.trim(), number: index + 1 }))
    .filter(({ line }) => /subtitle[:=]/.test(line) && /DATA:/.test(line))
   expect(offenders, `${file} hand-rolls a DATA: prefix`).toEqual([])
  }
 })
})
