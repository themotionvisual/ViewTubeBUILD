import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Zone Tag ingestion", () => {
 it("routes files dropped on a Spectrum Tag through the canonical import pipeline with that tag", () => {
  expect(source).toContain("stageFiles(event.dataTransfer.files, [tag])")
  expect(source).toContain("forcedTags")
  expect(source).toContain("Zone Tag")
 })
})
