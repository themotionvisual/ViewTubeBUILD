import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
 MOUNTABLE_SUPER_TOOL_IDS,
 PLANNED_MOUNTED_TOOL_IDS,
 isMountableSuperTool,
 superToolRoute,
} from "../superToolViewRegistry"
import { PAGE_REGISTRY } from "../pageRegistry"
import { SUPER_TOOL_RUNTIME_PLAN_RECORDS } from "../../services/superToolRuntimePlanRegistry"
import { getSuperTool } from "../../services/superToolRegistry"
import { resolveBrainCommandRoute } from "../../services/superToolActionPackets"

const VIEWS_DIR = join(process.cwd(), "src/views")
const SRC_DIR = join(process.cwd(), "src")

/**
 * The regression these tests exist for: eleven finished super-tool views sat in
 * the repo with no route reading them, while the runtime plan advertised an
 * address ("/data-transparency?internalTool=<id>") that no component consumed.
 * Nothing failed, because nothing asserted reachability.
 */

describe("super-tool view registry", () => {
 it("can render every tool the runtime plan calls mounted", () => {
  const missing = PLANNED_MOUNTED_TOOL_IDS.filter((id) => !isMountableSuperTool(id))
  expect(missing).toEqual([])
 })

 it("keeps editor-bound tools out of the standalone router", () => {
  // Their runtime boundary is VT_E1; a standalone mount would fork the editor.
  expect(isMountableSuperTool("motion-scene-builder")).toBe(false)
  expect(isMountableSuperTool("caption-and-fx-pipeline")).toBe(false)
 })

 it("names a real tool for every mountable id", () => {
  MOUNTABLE_SUPER_TOOL_IDS.forEach((id) => {
   expect(getSuperTool(id), `${id} is routable but missing from SUPER_TOOLS`).toBeTruthy()
  })
 })

 it("routes Brain commands at internal tools to a page that exists", () => {
  const route = resolveBrainCommandRoute("project-command-kanban", "cmd-1")
  expect(route).toBe("/tools/project-command-kanban?commandActionId=cmd-1")
  expect(route.startsWith(superToolRoute("project-command-kanban"))).toBe(true)
 })

 it("classifies the tool routes in the page registry", () => {
  const paths = PAGE_REGISTRY.map((entry) => entry.path)
  expect(paths).toContain("/tools")
  expect(paths).toContain("/tools/:toolId")
 })
})

describe("runtime plan addresses", () => {
 it("points every mounted prototype at the route the router serves", () => {
  MOUNTABLE_SUPER_TOOL_IDS.forEach((id) => {
   const plan = SUPER_TOOL_RUNTIME_PLAN_RECORDS[id]
   if (!plan) return
   // Supporting / editor-bound entries describe a boundary rather than a URL.
   if (!plan.currentRouteReality.startsWith("/tools")) return
   expect(plan.currentRouteReality, `${id} advertises a stale address`).toBe(superToolRoute(id))
  })
 })

 it("leaves no tool advertising the address nothing ever read", () => {
  const stale = Object.values(SUPER_TOOL_RUNTIME_PLAN_RECORDS).filter((plan) =>
   plan.currentRouteReality.includes("internalTool="),
  )
  expect(stale.map((plan) => plan.toolId)).toEqual([])
 })
})

/**
 * Known orphans, pending a decision rather than a fix: internal lab and dev
 * surfaces that were never product. Phase 2 of the activation plan either
 * routes them into Reference Studio or deletes them. The list only shrinks —
 * adding to it means a newly-built view was left unreachable, which is the
 * thing this test exists to prevent.
 */
const ACCEPTED_ORPHAN_VIEWS = [
 "AccountSimulator.tsx",
 "AllLinksPage.tsx",
 "ComponentGridView.tsx",
 "FourSectionsLabStandalone.tsx",
 "ReferenceStudioIsolated.tsx",
 "ReferenceStudioV2.tsx",
 "SourcesLabView.tsx",
]

describe("no view is built and then orphaned", () => {
 it("imports every file in src/views somewhere", () => {
  const viewFiles = readdirSync(VIEWS_DIR).filter(
   (name) => name.endsWith(".tsx") && !name.endsWith(".test.tsx"),
  )

  const sources: string[] = []
  const walk = (dir: string) => {
   for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.tsx?$/.test(entry.name)) sources.push(full)
   }
  }
  walk(SRC_DIR)

  const orphans = viewFiles.filter((file) => {
   const base = file.replace(/\.tsx$/, "")
   const selfPath = join(VIEWS_DIR, file)
   return !sources.some(
    (source) =>
     source !== selfPath &&
     new RegExp(`["'\`][^"'\`]*/${base}["'\`]|["'\`]\\./${base}["'\`]`).test(
      readFileSync(source, "utf8"),
     ),
   )
  })

  const unexpected = orphans.filter((file) => !ACCEPTED_ORPHAN_VIEWS.includes(file))
  expect(
   unexpected,
   "this view is built but imported nowhere — route it, or add it to ACCEPTED_ORPHAN_VIEWS with a reason",
  ).toEqual([])
 })

 it("keeps the accepted-orphan list honest", () => {
  const viewFiles = readdirSync(VIEWS_DIR)
  const stale = ACCEPTED_ORPHAN_VIEWS.filter((file) => !viewFiles.includes(file))
  expect(stale, "these files no longer exist — drop them from the allowlist").toEqual([])
 })
})
