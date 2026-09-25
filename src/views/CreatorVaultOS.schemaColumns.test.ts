import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS schema columns", () => {
 it("projects typed custom fields into Finder list columns", () => {
  expect(source).toContain("finderListColumns")
  expect(source).toContain("customFields.map")
  expect(source).toContain("custom_")
  expect(source).toContain("metadata?.customFields")
 })
})
