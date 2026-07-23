import { describe, expect, it } from "vitest"

import { VT_SYNC_ACTIVE_TABLE_IDS, VT_SYNC_TABLE_DEFINITIONS, VT_SYNC_VISIBLE_TABLE_CATEGORIES, VT_SYNC_VISIBLE_TABLE_DEFINITIONS } from "../upstream/tableRegistry"
import { getVtSyncTableExportHeaders, getVtSyncTableExportRows } from "./tableExport"
import {
 formatVtSyncLocalDateValue,
 formatVtSyncLocalTimeValue,
 formatVtSyncLocalWeekdayValue,
 formatVtSyncTableCellValue,
 parseVtSyncDateValue,
 parseVtSyncDurationSeconds,
} from "./tableFormatting"

describe("VT Sync table contracts", () => {
 it("uses registry column labels as export headers", () => {
  VT_SYNC_VISIBLE_TABLE_DEFINITIONS.forEach((table) => {
   expect(getVtSyncTableExportHeaders(table)).toEqual(table.columns.map((column) => column.label))
  })
 })

 it("only exposes the successful July 13 table set", () => {
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id).sort()).toEqual([...VT_SYNC_ACTIVE_TABLE_IDS].sort())
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)).not.toContain("traffic_shorts")
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)).not.toContain("audience")
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id)).toContain("provinces")
  expect(VT_SYNC_VISIBLE_TABLE_CATEGORIES.flatMap((category) => category.tabs.map((tab) => tab.id)).sort()).toEqual([...VT_SYNC_ACTIVE_TABLE_IDS].sort())
 })

 it("formats structured cells without object coercion", () => {
  expect(formatVtSyncTableCellValue([{ label: "one" }, "two"], "json")).toBe('{"label":"one"}, two')
  expect(formatVtSyncTableCellValue({ nested: true }, "json")).toBe('{"nested":true}')
 })

 it("formats percent values consistently at render/export time", () => {
  expect(formatVtSyncTableCellValue(12.3456, "percent")).toBe("12.35%")
 })

 it("formats every time unit as a clock value", () => {
  expect(formatVtSyncTableCellValue(7, "duration")).toBe("0:07")
  expect(formatVtSyncTableCellValue(144, "duration")).toBe("2:24")
  expect(formatVtSyncTableCellValue(925.15, "durationHours")).toBe("925:09:00")
  expect(formatVtSyncTableCellValue(90.5, "durationMinutes")).toBe("1:30:30")
  expect(parseVtSyncDurationSeconds("1:02:03", "durationHours")).toBe(3723)
 })

 it("compacts only large watch-hour totals while preserving their unit", () => {
  expect(formatVtSyncTableCellValue(12_345, "durationHours")).toBe("12.35K h")
  expect(formatVtSyncTableCellValue(123_456, "durationHours")).toBe("123.5K h")
  expect(formatVtSyncTableCellValue(1_234_567, "durationHours")).toBe("1.235M h")
  expect(formatVtSyncTableCellValue(12_345_678, "durationHours")).toBe("12.35M h")
  expect(formatVtSyncTableCellValue(123_456_789, "durationHours")).toBe("123.5M h")
 })

 it("formats dates in US table order and parses rollup dates chronologically", () => {
  expect(formatVtSyncTableCellValue("2026-07-09T15:30:00Z", "date")).toBe("7/9/26")
  expect(formatVtSyncTableCellValue("2026-07-01 - 2026-07-07", "dateRange")).toBe("7/1/26 – 7/7/26")
  expect(parseVtSyncDateValue("2026-W02")).toBeLessThan(parseVtSyncDateValue("2026-W12")!)
  expect(parseVtSyncDateValue("6/30/26")).toBeLessThan(parseVtSyncDateValue("7/1/26")!)
 })

 it("derives local date, weekday, and time labels from one published timestamp", () => {
  const publishedAt = "2026-07-09T15:30:00Z"
  expect(formatVtSyncLocalDateValue(publishedAt)).toMatch(/^\d{1,2}\/\d{1,2}\/26$/)
  expect(formatVtSyncLocalWeekdayValue(publishedAt)).toMatch(/^[A-Za-z]+$/)
  expect(formatVtSyncLocalTimeValue(publishedAt)).toMatch(/^\d{1,2}:\d{2}(?:\s[AP]M)?$/i)
 })

 it("exports rows through the same cell formatter", () => {
  const table = {
   ...VT_SYNC_TABLE_DEFINITIONS[0],
   columns: [
    { key: "tags", label: "Tags", group: "Metadata", format: "json" as const },
    { key: "ctr", label: "CTR", group: "Reach", format: "percent" as const },
   ],
  }

  expect(getVtSyncTableExportRows(table, [{ tags: [{ topic: "sync" }], ctr: 8.912 }])).toEqual([
   ['{"topic":"sync"}', "8.91%"],
  ])
 })
})
