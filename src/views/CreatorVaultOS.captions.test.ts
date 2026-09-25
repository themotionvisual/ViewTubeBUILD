import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS captions and retries", () => {
 it("exposes caption editing and derivative actions for media assets", () => {
  expect(source).toContain("Captions & Transcript")
  expect(source).toContain("Save Caption Artifact")
  expect(source).toContain("Export SRT")
  expect(source).toContain("Export VTT")
  expect(source).toContain("Create Script From Transcript")
 })

 it("exposes retry on failed Task Center jobs", () => {
  expect(source).toContain("Retry Task")
  expect(source).toContain("retryVaultTask")
 })
})
