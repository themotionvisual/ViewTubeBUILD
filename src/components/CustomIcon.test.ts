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

/**
 * A name that is in `iconMap` but points at a file nobody shipped resolves to
 * `/icons/<file>.svg` and 404s — a broken image, never an error. `cloud`,
 * `layers` and `checklist` all did exactly that in production.
 */
describe("every mapped icon names a bundled asset", () => {
 it("has no entry pointing at a missing file", () => {
  const source = read("src/components/CustomIcon.tsx")
  const map = source.slice(source.indexOf("const iconMap"), source.indexOf("const iconAssets"))
  const assets = new Set(fs.readdirSync(path.join(process.cwd(), "src/assets/icons")))
  const dangling = [...map.matchAll(/^\s*'?([^:'\n]+)'?:\s*'([^']+)'/gm)]
   .map(([, name, file]) => ({ name: name.replace(/'/g, ""), file }))
   .filter((entry) => !assets.has(entry.file))
  expect(dangling, "these icon names would 404 at runtime").toEqual([])
 })
})
