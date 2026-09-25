import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS production composition", () => {
 it("uses the canonical Toolbox hierarchy instead of the legacy SuperTool shell", () => {
  expect(source).toContain("Toolbox")
  expect(source).toContain("SubToolbox")
  expect(source).not.toContain("SuperToolShell")
 })

 it("exposes the first production Vault workspaces", () => {
  expect(source).toContain("Asset Library")
  expect(source).toContain("Import Station")
  expect(source).toContain("Inspector")
  expect(source).toContain("Spectrum Tags")
 })
})
