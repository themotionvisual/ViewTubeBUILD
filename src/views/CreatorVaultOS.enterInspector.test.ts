import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Enter Inspector shortcut", () => {
 it("scrolls the selected asset Inspector into view", () => {
  expect(source).toContain("inspectorRef")
  expect(source).toContain('command === "focus-inspector"')
  expect(source).toContain("scrollIntoView")
 })
})
