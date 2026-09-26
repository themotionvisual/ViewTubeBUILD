import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Vault tool workflows", () => {
 it("includes the standalone canonical text editor workflow", () => {
  expect(source).toContain("Text Editor")
  expect(source).toContain("Create New Text Asset")
  expect(source).toContain("Save Selected Text Asset")
  expect(source).toContain("createVaultTextDocument")
  expect(source).toContain("saveVaultTextDocument")
 })

 it("includes one contextual group builder for projects and asset collections", () => {
  expect(source).toContain('aria-label="Vault group builder"')
  expect(source).toContain("Group Builder")
  expect(source).toContain("Create Project From Selection")
  expect(source).toContain("Attach Selection to Project")
  expect(source).toContain("Create Collection From Selection")
  expect(source).toContain("Create Brand Kit From Selection")
  expect(source).toContain("Add Selection to Collection")
 })

 it("includes asset-aware contextual tools and exports", () => {
  expect(source).toContain("Send to ViewTube…")
  expect(source).toContain("selectedToolTargets.map")
  expect(source).toContain("exportSelectionManifest")
  expect(source).toContain("Export Selected Metadata JSON")
 })
})
