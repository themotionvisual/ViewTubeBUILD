import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS direct Brand Kit creation", () => {
 it("creates the single Brand Kit directly from the current selection", () => {
  expect(source).toContain("Create Brand Kit from Selection")
  expect(source).toContain("createVaultBrandKit")
 })
})
