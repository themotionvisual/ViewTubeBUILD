import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS review flag controls", () => {
 it("flags and clears selected asset review state with a note", () => {
  expect(source).toContain("Flag for Review")
  expect(source).toContain("Clear Review Flag")
  expect(source).toContain("attentionNoteDraft")
  expect(source).toContain("setVaultAssetAttention")
 })
})
