// vt-2311 — Governance test for the central Page Registry.
//
// Enforces that AppRoutes.tsx and PAGE_REGISTRY stay in lockstep. Adding a
// <Route path="…"> without also adding an entry to PAGE_REGISTRY fails CI
// with a message telling the author to classify the page.
//
// The reverse direction is intentionally soft — a registry entry without a
// live route just gets logged as an orphan (some entries are aliases /
// redirects that intentionally don't appear as their own <Route> element).

import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
 PAGE_REGISTRY,
 resolvePageEntry,
 pagesForNavigation,
 groupPagesBySection,
} from "../pageRegistry"

const appRoutesSource = readFileSync(resolve(process.cwd(), "src/app/AppRoutes.tsx"), "utf8")

/** Extract each <Route path="…"> — same regex the existing
 *  routeRegistryGovernance test uses. */
const ROUTE_PATHS = [
 ...appRoutesSource.matchAll(/<Route\s+[\s\S]*?path="([^"]+)"/g),
].map((m) => m[1])

describe("Central Page Registry (vt-2311)", () => {
 it("has no duplicate paths", () => {
  const paths = PAGE_REGISTRY.map((e) => e.path)
  const dupes = paths.filter((p, i) => paths.indexOf(p) !== i)
  expect(dupes).toEqual([])
 })

 it("every entry has a non-empty title", () => {
  for (const entry of PAGE_REGISTRY) {
   expect(entry.title, `entry ${entry.path}`).toBeTruthy()
  }
 })

 it("every <Route path> in AppRoutes.tsx has a PAGE_REGISTRY entry", () => {
  const missing: string[] = []
  for (const path of ROUTE_PATHS) {
   if (path === "*") continue // catch-all is not a real destination
   if (!resolvePageEntry(path)) missing.push(path)
  }
  expect(
   missing,
   `A <Route path="…"> was added to AppRoutes.tsx without a matching PAGE_REGISTRY entry. Add one to src/app/pageRegistry.ts (unclassified + hidden is a valid stub).`,
  ).toEqual([])
 })

 it("resolvePageEntry finds every registered path exactly", () => {
  for (const entry of PAGE_REGISTRY) {
   expect(resolvePageEntry(entry.path)?.path).toBe(entry.path)
  }
 })

 it("resolvePageEntry returns null for unregistered paths", () => {
  expect(resolvePageEntry("/this-path-does-not-exist-vt-2311")).toBeNull()
 })

 it("pagesForNavigation only returns entries visible on that surface", () => {
  for (const p of pagesForNavigation("top-nav")) {
   expect(["top-nav", "both"]).toContain(p.navigationVisibility)
  }
  for (const p of pagesForNavigation("drawer")) {
   expect(["drawer", "both"]).toContain(p.navigationVisibility)
  }
 })

 it("groupPagesBySection produces non-empty groups", () => {
  const groups = groupPagesBySection()
  const totalCount = Object.values(groups).reduce((sum, arr) => sum + arr.length, 0)
  expect(totalCount).toBe(PAGE_REGISTRY.length)
  for (const [section, entries] of Object.entries(groups)) {
   expect(entries.length, `section ${section}`).toBeGreaterThan(0)
   for (const entry of entries) {
    expect(entry.section).toBe(section)
   }
  }
 })
})
