import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Recent and Generated navigation", () => {
 it("exposes Recent and Generated through the compact primary State control", () => {
  expect(source).toContain('label="State"')
  expect(source).toContain('options={["active", "recent", "generated", "inbox", "favorites", "archive", "trash"]}')
 })
})
