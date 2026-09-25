import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS corrected Vault tool ownership", () => {
 it("keeps Asset Operations focused on search batch groups and tools", () => {
  expect(source).toContain('title="Asset Operations"')
  for (const mode of ["search", "batch", "groups", "tools"]) {
   expect(source).toContain(`value: "${mode}"`)
  }
  expect(source).not.toContain('{ value: "tags", label: "TAGS" }')
  expect(source).not.toContain('{ value: "import", label: "IMPORT" }')
  expect(source).not.toContain('{ value: "text", label: "TEXT" }')
 })

 it("combines Import Station and Spectrum Tags in one SubToolbox", () => {
  expect(source).toContain('title="Import & Tags"')
  expect(source).toContain("importTagsMode")
  expect(source).toContain('{ value: "tags", label: "TAGS" }')
  expect(source).toContain('{ value: "import", label: "IMPORT" }')
  expect(source).toContain("Spectrum Tags")
  expect(source).toContain("Import Station")
 })

 it("renders Text Editor as its own independent SubToolbox", () => {
  expect(source).toContain('title="Text Editor"')
  expect(source).toContain('persistenceId="vault-text-editor"')
  expect(source).toContain("Create New Text Asset")
  expect(source).toContain("Save Selected Text Asset")
 })
})
