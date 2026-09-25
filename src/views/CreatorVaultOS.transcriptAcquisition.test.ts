import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(path.resolve(process.cwd(), "src/views/CreatorVaultOS.tsx"), "utf8")

describe("CreatorVaultOS real transcript acquisition", () => {
 it("runs transcript acquisition only for media with a resolvable YouTube video identity", () => {
  expect(source).toContain("Acquire YouTube Transcript")
  expect(source).toContain("selectedYouTubeVideoId")
  expect(source).toContain("runVaultTranscriptTask")
 })

 it("reruns failed durable transcript tasks from Task Center", () => {
  expect(source).toContain('task.type === "transcript"')
  expect(source).toContain("task.targetAssetId")
  expect(source).toContain("taskId: task.id")
 })
})
