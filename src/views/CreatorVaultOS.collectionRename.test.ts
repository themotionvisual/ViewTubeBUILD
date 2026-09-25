import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS collection rename", () => {
 it("renames manual collections inline without rebuilding membership", () => {
  expect(source).toContain("renameVaultCollection")
  expect(source).toContain("renameManualCollection")
  expect(source).toContain("Rename collection")
 })
})
