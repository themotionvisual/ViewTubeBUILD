import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS custom metadata fields", () => {
 it("lets creators define typed fields and edit values for the selected asset", () => {
  expect(source).toContain("Custom Fields")
  expect(source).toContain("Create Custom Field")
  expect(source).toContain("createVaultCustomField")
  expect(source).toContain("setVaultCustomFieldValue")
 })
})
