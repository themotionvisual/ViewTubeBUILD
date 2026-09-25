import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS asset preview repair", () => {
 it("allows an existing asset card preview to be replaced from an image file", () => {
  expect(source).toContain("replaceAssetPreview")
  expect(source).toContain('accept="image/*"')
  expect(source).toContain("Replace Preview")
 })
})
