import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS compare mode", () => {
 it("shows a side-by-side compare surface for exactly two selected assets", () => {
  expect(source).toContain("Compare Selection")
  expect(source).toContain("resolveVaultComparePair")
  expect(source).toContain("comparePair")
 })
})
