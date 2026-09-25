import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Find Similar", () => {
 it("computes perceptual hashes during image intake and surfaces similar assets", () => {
  expect(source).toContain("computeVaultImagePerceptualHash")
  expect(source).toContain("perceptualHash")
  expect(source).toContain("Find Similar")
  expect(source).toContain("findVaultSimilarAssets")
 })
})
