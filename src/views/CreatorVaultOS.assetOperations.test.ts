import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS corrected Vault tool ownership", () => {
 it("replaces permanent Asset Operations with contextual selection workflows", () => {
  expect(source).not.toContain('title="Asset Operations"')
  expect(source).toContain('aria-label="Vault selection actions"')
  expect(source).toContain('aria-label="Vault batch operations"')
  expect(source).toContain('aria-label="Vault group builder"')
  expect(source).toContain('aria-label="Send to ViewTube"')
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
