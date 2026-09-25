// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import {
 createVaultTask,
 listVaultTasks,
 updateVaultTask,
} from "../vaultTaskCenter"

describe("Vault Task Center", () => {
 beforeEach(() => localStorage.clear())

 it("creates and updates a durable ingest task", () => {
  const task = createVaultTask({
   type: "ingest-preflight",
   label: "clip.mp4",
   assetName: "clip.mp4",
  })

  expect(task.status).toBe("queued")
  const updated = updateVaultTask(task.id, {
   status: "completed",
   progress: 100,
   detail: "Metadata, hash and preview ready.",
  })

  expect(updated?.status).toBe("completed")
  expect(listVaultTasks()[0].progress).toBe(100)
 })

 it("returns null when updating an unknown task", () => {
  expect(updateVaultTask("missing", { status: "failed" })).toBeNull()
 })
})
