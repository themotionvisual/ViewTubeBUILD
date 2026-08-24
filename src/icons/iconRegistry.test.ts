// vt-1466 — governance for the central icon registry.
//
// Guards the invariants the two legacy maps (CustomIcon.iconMap +
// AnalyticsVisualIcon.VISUAL_ICON_MAP) never enforced:
//
//   * No duplicate ids across the registry.
//   * Every entry declares at least one valid surface.
//   * Every entry has a non-empty label.
//   * SVG-file entries end with .svg and don't traverse out of the assets dir.
//   * Lucide entries reference a real function component.
//
// This test intentionally passes on the empty registry too, so landing the
// scaffolding does not block on migrating any callers. The moment an entry
// is added, the invariants apply.

import { describe, expect, it } from "vitest"
import { VT_ICON_REGISTRY, resolveVtIcon, listVtIconsForSurface } from "./iconRegistry"

const KNOWN_SURFACES = new Set(["nav", "widget", "visual", "diagnostic"])

describe("VT icon registry (vt-1466)", () => {
 it("has no duplicate ids", () => {
  const ids = VT_ICON_REGISTRY.map((e) => e.id)
  const seen = new Set<string>()
  const dupes: string[] = []
  for (const id of ids) {
   if (seen.has(id)) dupes.push(id)
   seen.add(id)
  }
  expect(dupes).toEqual([])
 })

 it("every entry has a non-empty id and label", () => {
  for (const entry of VT_ICON_REGISTRY) {
   expect(entry.id, `entry with label "${entry.label}"`).toBeTruthy()
   expect(entry.label, `entry "${entry.id}"`).toBeTruthy()
  }
 })

 it("every entry declares at least one known surface", () => {
  for (const entry of VT_ICON_REGISTRY) {
   expect(entry.surfaces.length, `entry "${entry.id}" has no surfaces`).toBeGreaterThan(0)
   for (const s of entry.surfaces) {
    expect(KNOWN_SURFACES.has(s), `entry "${entry.id}" has unknown surface "${s}"`).toBe(true)
   }
  }
 })

 it("SVG-file entries reference a plausible .svg file inside the assets dir", () => {
  for (const entry of VT_ICON_REGISTRY) {
   if (entry.asset.kind !== "svg-file") continue
   expect(entry.asset.fileName, `entry "${entry.id}"`).toMatch(/\.svg$/i)
   expect(entry.asset.fileName.includes(".."), `entry "${entry.id}" traverses out of assets`).toBe(false)
  }
 })

 it("Lucide entries reference a callable component", () => {
  for (const entry of VT_ICON_REGISTRY) {
   if (entry.asset.kind !== "lucide") continue
   expect(typeof entry.asset.component, `entry "${entry.id}" component`).toMatch(/^(object|function)$/)
  }
 })

 it("resolveVtIcon returns null for unknown ids", () => {
  expect(resolveVtIcon("this-id-should-never-exist-vt-1466")).toBeNull()
  expect(resolveVtIcon(undefined)).toBeNull()
  expect(resolveVtIcon(null)).toBeNull()
  expect(resolveVtIcon("")).toBeNull()
 })

 it("listVtIconsForSurface returns only entries with that surface", () => {
  for (const surface of Array.from(KNOWN_SURFACES) as Array<
   "nav" | "widget" | "visual" | "diagnostic"
  >) {
   const list = listVtIconsForSurface(surface)
   for (const entry of list) {
    expect(entry.surfaces.includes(surface)).toBe(true)
   }
  }
 })
})
