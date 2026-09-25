import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS masonry view", () => {
 it("offers a masonry view and prevents asset cards from splitting across columns", () => {
  expect(source).toContain('{ value: "masonry", label: "MASONRY" }')
  expect(source).toContain('viewMode === "masonry"')
  expect(source).toContain("break-inside-avoid")
 })
})
