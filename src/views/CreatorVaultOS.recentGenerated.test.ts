import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Recent and Generated navigation", () => {
 it("exposes Recent and Generated as primary Vault library states", () => {
  expect(source).toContain('{ value: "recent", label: "RECENT" }')
  expect(source).toContain('{ value: "generated", label: "GENERATED" }')
 })
})
