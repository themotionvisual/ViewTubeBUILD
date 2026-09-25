import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Finder list", () => {
 it("uses the canonical data table primitive for detailed list mode", () => {
  expect(source).toContain("SubToolboxDataTable")
  expect(source).toContain("finderListRows")
 })

 it("shows creator-useful asset columns without shrinking the mobile table", () => {
  for (const label of [
   "PREVIEW",
   "NAME",
   "TYPE",
   "PROJECT",
   "SOURCE",
   "DIMENSIONS",
   "DURATION",
   "SIZE",
   "LIFECYCLE",
   "UPDATED",
  ]) {
   expect(source).toContain(`label: "${label}"`)
  }
  expect(source).toContain("min-w-[1080px]")
  expect(source).toContain("overflow-x-auto")
 })
})
