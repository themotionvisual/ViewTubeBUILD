import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Needs Attention reasons", () => {
 it("shows factual attention reasons in Inbox and Inspector", () => {
  expect(source).toContain("getVaultAttentionReasons")
  expect(source).toContain("Needs Attention")
  expect(source).toContain("attentionReasons")
 })
})
