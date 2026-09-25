import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Lane B organization contract", () => {
 it("exposes timeline and special library states", () => {
  expect(source).toContain('value: "timeline"')
  expect(source).toContain("FAVORITES")
  expect(source).toContain("ARCHIVE")
  expect(source).toContain("TRASH")
 })

 it("exposes reversible state actions for selected assets", () => {
  expect(source).toContain("setVaultAssetState")
  expect(source).toContain("Toggle Favorite")
  expect(source).toContain("Archive Selection")
  expect(source).toContain("Move to Trash")
 })
})
