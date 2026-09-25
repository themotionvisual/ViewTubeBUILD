import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS archive and trash actions", () => {
 it("exposes restore, trash, unarchive, and permanent delete actions contextually", () => {
  expect(source).toContain("Move to Trash")
  expect(source).toContain("Restore from Trash")
  expect(source).toContain("Restore from Archive")
  expect(source).toContain("Delete Permanently")
  expect(source).toContain("deleteVaultAsset")
 })
})
