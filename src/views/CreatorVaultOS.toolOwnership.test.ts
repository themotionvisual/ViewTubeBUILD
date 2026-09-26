import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS tool ownership", () => {
 it("keeps external handoffs and metadata export in contextual selection tools rather than duplicating them in Inspector", () => {
  expect(source).not.toContain('title="Asset Operations"')
  expect(source).toContain('aria-label="Send to ViewTube"')
  expect(source).toContain("Send to ViewTube…")
  expect(source).toContain("selectedToolTargets.map")
  expect(source).toContain("Export Selected Metadata JSON")
  expect(source).toContain("Export Selected Metadata CSV")
 })
})
