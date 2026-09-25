import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Lineage view", () => {
 it("shows the selected canonical lineage as a navigable asset chain", () => {
  expect(source).toContain('{ value: "lineage", label: "LINEAGE" }')
  expect(source).toContain('viewMode === "lineage"')
  expect(source).toContain("Vault Lineage")
  expect(source).toContain("selectedLineage")
 })
})
