import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS numeric tag hotkeys", () => {
 it("applies the mapped Spectrum Tag to the current selection", () => {
  expect(source).toContain("resolveVaultTagHotkey")
  expect(source).toContain("applyTagToSelection")
  expect(source).toContain("availableTags[tagIndex]")
 })
})
