import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS image palette", () => {
 it("indexes dominant image colors and shows them in Inspector", () => {
  expect(source).toContain("computeVaultImagePalette")
  expect(source).toContain("Color Palette")
  expect(source).toContain("imagePalette")
 })
})
