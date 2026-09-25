import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Filmstrip view", () => {
 it("offers a compact horizontal filmstrip using canonical asset previews", () => {
  expect(source).toContain('{ value: "filmstrip", label: "FILMSTRIP" }')
  expect(source).toContain('viewMode === "filmstrip"')
  expect(source).toContain("Vault Filmstrip")
  expect(source).toContain("overflow-x-auto")
 })
})
