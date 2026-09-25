// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { createVaultTask, retryVaultTask, updateVaultTask } from "../vaultTaskCenter"

describe("retryVaultTask", () => {
 beforeEach(() => localStorage.clear())

 it("requeues a failed task and increments its retry count", () => {
  const task = createVaultTask({ type: "transcript", label: "Transcript clip.mp4" })
  updateVaultTask(task.id, { status: "failed", progress: 100, detail: "Provider error" })

  const retried = retryVaultTask(task.id)

  expect(retried).toMatchObject({
   status: "queued",
   progress: 0,
   retryCount: 1,
  })
  expect(retried?.detail).toContain("Retry queued")
 })

 it("does not retry a completed task", () => {
  const task = createVaultTask({ type: "metadata", label: "Metadata" })
  updateVaultTask(task.id, { status: "completed", progress: 100 })

  expect(retryVaultTask(task.id)).toBeNull()
 })
})
