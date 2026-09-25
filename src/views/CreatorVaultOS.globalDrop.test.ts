import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS global drag and drop", () => {
 it("routes workspace file drops through the canonical staging/direct import pipeline", () => {
  expect(source).toContain("onDragOver")
  expect(source).toContain("onDrop")
  expect(source).toContain("stageFiles(event.dataTransfer.files)")
 })
})
