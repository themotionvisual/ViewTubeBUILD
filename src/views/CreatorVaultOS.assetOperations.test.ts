import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS unified Asset Operations", () => {
 it("consolidates search tags import batch text groups and tools in one SubToolbox", () => {
  expect(source).toContain('title="Asset Operations"')
  expect(source).toContain("assetOperationsMode")
  for (const mode of ["search", "tags", "import", "batch", "text", "groups", "tools"]) {
   expect(source).toContain(`value: "${mode}"`)
  }
 })

 it("does not render the old standalone operations SubToolboxes", () => {
  expect(source).not.toContain('title="Spectrum Tags"')
  expect(source).not.toContain('title="Import Station"')
  expect(source).not.toContain('title="Batch Processor"')
 })
})
