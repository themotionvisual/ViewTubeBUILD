import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS staged per-item tags", () => {
 it("lets each pending import add and remove its own tags before ingest", () => {
  expect(source).toContain("togglePendingTag")
  expect(source).toContain("addPendingTag")
  expect(source).toContain("Pending tags for")
  expect(source).toContain("item.tags")
 })
})
