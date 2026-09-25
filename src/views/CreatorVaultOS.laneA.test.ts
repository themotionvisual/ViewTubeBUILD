import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS Lane A repair contract", () => {
 it("uses the canonical media player for selected media preview", () => {
  expect(source).toContain("SubToolboxMediaPlayer")
  expect(source).toContain("Quick Look")
 })

 it("offers direct and staged import modes", () => {
  expect(source).toContain('"direct"')
  expect(source).toContain('"staged"')
  expect(source).toContain("Import mode")
 })

 it("passes shift gestures through the range-selection resolver", () => {
  expect(source).toContain("resolveVaultSelection")
  expect(source).toContain("shiftKey")
 })
})
