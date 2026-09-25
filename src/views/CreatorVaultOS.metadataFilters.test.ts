import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS structured metadata filters UI", () => {
 it("feeds lifecycle, mime, dimensions, duration, and byte filters into canonical search", () => {
  for (const term of [
   "filterLifecycle",
   "filterMimeType",
   "filterMinWidth",
   "filterMinHeight",
   "filterMinDuration",
   "filterMaxDuration",
   "filterMinBytesMb",
   "filterMaxBytesMb",
  ]) expect(source).toContain(term)

  expect(source).toContain("lifecycle: filterLifecycle")
  expect(source).toContain("mimeType: filterMimeType")
  expect(source).toContain("minWidth:")
  expect(source).toContain("maxBytes:")
 })

 it("exposes advanced filters without replacing the compact primary controls", () => {
  expect(source).toContain("Advanced Metadata Filters")
  expect(source).toContain("MIN WIDTH")
  expect(source).toContain("MAX SIZE MB")
 })
})
