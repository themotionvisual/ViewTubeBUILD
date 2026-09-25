import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Brand Kit", () => {
 it("surfaces the Brand Kit as a special curated collection", () => {
  expect(source).toContain("Brand Kit")
  expect(source).toContain("Set as Brand Kit")
  expect(source).toContain("Add Selection to Brand Kit")
  expect(source).toContain("setVaultCollectionRole")
  expect(source).toContain('collection.role === "brand-kit"')
 })
})
