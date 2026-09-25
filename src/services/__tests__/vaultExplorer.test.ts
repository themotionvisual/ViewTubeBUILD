import { describe, expect, it } from "vitest"
import { buildVaultExplorerGroups } from "../vaultExplorer"

describe("buildVaultExplorerGroups", () => {
 it("groups assets by project and exposes unassigned assets separately", () => {
  const groups = buildVaultExplorerGroups([
   { id: "a", projectName: "Austerlitz" },
   { id: "b", projectName: null },
   { id: "c", projectName: "Austerlitz" },
   { id: "d", projectName: "Waterloo" },
  ])

  expect(groups.projects).toEqual([
   { name: "Austerlitz", count: 2 },
   { name: "Waterloo", count: 1 },
  ])
  expect(groups.unassignedCount).toBe(1)
 })
})
