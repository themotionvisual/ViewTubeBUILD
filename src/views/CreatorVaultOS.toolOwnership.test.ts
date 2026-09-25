import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS tool ownership", () => {
 it("keeps Send To and metadata export inside Asset Operations rather than duplicating them in Inspector", () => {
  expect(source).not.toContain('>Send To</div>')
  expect(source).not.toContain('>Metadata Export</div>')
  expect(source).toContain("Export Selected Metadata JSON")
  expect(source).toContain("Compatible Tools")
 })
})
