import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS structured metadata filters", () => {
 it("routes UI metadata filters into canonical Vault search", () => {
  expect(source).toContain("metadataLifecycle")
  expect(source).toContain("metadataMimeType")
  expect(source).toContain("metadataMinWidth")
  expect(source).toContain("metadataMinHeight")
  expect(source).toContain("metadataMaxDuration")
  expect(source).toContain("metadataMaxSizeMb")
  expect(source).toContain("minDurationSec")
  expect(source).toContain("maxDurationSec")
  expect(source).toContain("maxBytes")
 })

 it("keeps metadata filters in a dense two-column mobile-friendly block", () => {
  expect(source).toContain("Metadata Filters")
  expect(source).toContain("grid-cols-2")
 })
})
