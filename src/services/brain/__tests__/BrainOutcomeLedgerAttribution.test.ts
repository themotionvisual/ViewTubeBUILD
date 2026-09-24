// @vitest-environment jsdom
import "fake-indexeddb/auto"
import { beforeEach, describe, expect, it } from "vitest"
import {
 listBrainOutcomes,
 listBrainOutcomesForTrace,
 recordBrainOutcome,
} from "../BrainOutcomeLedger"

beforeEach(() => {
 localStorage.clear()
})

describe("BrainOutcomeLedger attribution", () => {
 it("persists trace and output refs without requiring a new outcome store", async () => {
  const record = await recordBrainOutcome({
   channelId: "channel-1",
   sourceToolId: "brain-command-center",
   targetToolId: null,
   traceId: "trace-9",
   outputRef: "creator_brain_response_9",
   outcome: "accepted",
   summary: "Creator accepted the recommendation.",
   evidence: ["evidence-1"],
   confidence: "high",
  })

  expect(record).toMatchObject({
   traceId: "trace-9",
   outputRef: "creator_brain_response_9",
  })
  expect(listBrainOutcomes("channel-1")[0]).toMatchObject({
   id: record.id,
   traceId: "trace-9",
   outputRef: "creator_brain_response_9",
  })
 })

 it("retrieves only outcomes attributable to one exact trace", async () => {
  await recordBrainOutcome({
   channelId: "channel-1",
   sourceToolId: "brain-command-center",
   targetToolId: null,
   traceId: "trace-a",
   outputRef: "response-a",
   outcome: "accepted",
   summary: "A",
   evidence: [],
   confidence: "medium",
  })
  await recordBrainOutcome({
   channelId: "channel-1",
   sourceToolId: "brain-command-center",
   targetToolId: null,
   traceId: "trace-b",
   outputRef: "response-b",
   outcome: "rejected",
   summary: "B",
   evidence: [],
   confidence: "high",
  })

  expect(listBrainOutcomesForTrace("trace-a")).toHaveLength(1)
  expect(listBrainOutcomesForTrace("trace-a")[0]).toMatchObject({
   traceId: "trace-a",
   outputRef: "response-a",
   outcome: "accepted",
  })
 })

 it("keeps old unattributed outcome records readable", () => {
  localStorage.setItem("vt_brain_outcome_ledger_v1", JSON.stringify([{
   id: "legacy-1",
   channelId: "channel-1",
   sourceToolId: "creator-canvas-os",
   targetToolId: null,
   outcome: "accepted",
   summary: "Legacy outcome",
   evidence: [],
   confidence: "medium",
   createdAt: 1,
  }]))

  const record = listBrainOutcomes("channel-1")[0]
  expect(record.id).toBe("legacy-1")
  expect(record.traceId).toBeUndefined()
  expect(record.outputRef).toBeUndefined()
 })
})
