import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS before/after compare", () => {
 it("shows an interactive reveal for two selected image assets", () => {
  expect(source).toContain("Before / After")
  expect(source).toContain("compareReveal")
  expect(source).toContain("clipPath")
  expect(source).toContain('type="range"')
 })
})
