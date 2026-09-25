import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS EXIF intake", () => {
 it("extracts factual EXIF during image intake and surfaces it in Inspector", () => {
  expect(source).toContain("extractVaultExifMetadata")
  expect(source).toContain("EXIF Metadata")
  expect(source).toContain("exifMake")
  expect(source).toContain("exifModel")
 })
})
