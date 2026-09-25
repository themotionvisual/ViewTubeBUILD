import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Send To launcher", () => {
 it("renders asset-aware canonical handoff targets for the selected asset", () => {
  expect(source).toContain("Send To")
  expect(source).toContain("getVaultAssetToolTargets")
  expect(source).toContain("createVaultAssetHandoff")
 })
})
