import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), "utf8")

describe("CustomIcon asset resolution", () => {
 it("uses bundled asset resolution instead of hardcoded /src paths", () => {
  const source = read("src/components/CustomIcon.tsx")
  expect(source).toContain("import.meta.glob")
  expect(source).toContain("resolveCustomIconSrc")
  expect(source).not.toContain("/src/assets/icons/")
 })
})
