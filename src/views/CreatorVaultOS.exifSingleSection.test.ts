import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Inspector metadata sections", () => {
 it("renders the EXIF section only once", () => {
  expect(source.match(/EXIF Metadata/g)?.length || 0).toBe(1)
 })
})
