import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Asset Operations tools", () => {
 it("includes the canonical text editor workflow", () => {
  expect(source).toContain("Text Editor")
  expect(source).toContain("Create New Text Asset")
  expect(source).toContain("Save Selected Text Asset")
  expect(source).toContain("createVaultTextDocument")
  expect(source).toContain("saveVaultTextDocument")
 })

 it("includes one group builder for projects and asset collections", () => {
  expect(source).toContain("Project / Asset Group Builder")
  expect(source).toContain("Create Project From Selection")
  expect(source).toContain("Attach Selection to Project")
  expect(source).toContain("Create Collection From Selection")
  expect(source).toContain("Create Brand Kit From Selection")
 })

 it("includes an asset-aware tools mode", () => {
  expect(source).toContain("Compatible Tools")
  expect(source).toContain("Download Selection Manifest")
  expect(source).toContain("Export Selected Metadata JSON")
 })
})
