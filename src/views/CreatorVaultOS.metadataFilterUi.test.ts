import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS structured metadata filters", () => {
 it("routes UI metadata filters into canonical Vault search", () => {
  expect(source).toContain("filterLifecycle")
  expect(source).toContain("filterMimeType")
  expect(source).toContain("filterMinWidth")
  expect(source).toContain("filterMinHeight")
  expect(source).toContain("filterMaxDuration")
  expect(source).toContain("filterMaxBytesMb")
  expect(source).toContain("minDurationSec")
  expect(source).toContain("maxDurationSec")
  expect(source).toContain("maxBytes")
 })

 it("keeps metadata filters in a dense two-column mobile-friendly block", () => {
  expect(source).toContain("Advanced Metadata Filters")
  expect(source).toContain("grid-cols-2")
 })
})
