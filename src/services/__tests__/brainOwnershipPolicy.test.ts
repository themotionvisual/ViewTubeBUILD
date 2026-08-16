import { describe, expect, it } from "vitest"
import {
 BRAIN_OS_CONTROL_SURFACE_TOOL_ID,
 BRAIN_OS_POLICY,
 getBrainOwnershipScope,
 getSuperToolBrainOwnershipIssues,
 isReviewOnlyBrainCommandAction,
} from "../brainOwnershipPolicy"
import { SUPER_TOOL_RUNTIME_PLAN_RECORDS } from "../superToolRuntimePlanRegistry"
import type { SuperToolRuntimePlanRecord } from "../../types"

describe("brainOwnershipPolicy", () => {
 it("keeps Brain OS as the canonical owner and Brain Command Center as a surface", () => {
  expect(BRAIN_OS_POLICY.canonicalOwner).toBe("brain-os")
  expect(BRAIN_OS_POLICY.controlSurfaceToolId).toBe(BRAIN_OS_CONTROL_SURFACE_TOOL_ID)
  expect(getBrainOwnershipScope("brain-command-center")).toBe("control-surface")
  expect(getBrainOwnershipScope("creator-canvas-os")).toBe("consumer")
 })

 it("rejects super-tool records that claim Brain OS ownership", () => {
  const record = {
   ...SUPER_TOOL_RUNTIME_PLAN_RECORDS["brain-command-center"],
   verdict: "Keep top-level Brain surface",
   runtimeBoundary: "Tool 14 owns Brain command routing and reflection control.",
  } satisfies SuperToolRuntimePlanRecord

  expect(getSuperToolBrainOwnershipIssues(record).length).toBeGreaterThan(0)
 })

 it("keeps every registered super-tool inside the Brain OS boundary", () => {
  const issues = Object.values(SUPER_TOOL_RUNTIME_PLAN_RECORDS).flatMap((record) =>
   getSuperToolBrainOwnershipIssues(record),
  )

  expect(issues).toEqual([])
 })

 it("allows reviewed Brain command handoffs but rejects auto-execution flags", () => {
  expect(
   isReviewOnlyBrainCommandAction({
    id: "cmd-1",
    status: "queued",
    targetToolId: "brain-command-center",
    note: "Review a possible publish/sync/delete request without executing it.",
   }),
  ).toBe(true)

  expect(
   isReviewOnlyBrainCommandAction({
    id: "cmd-2",
    status: "queued",
    targetToolId: "brain-command-center",
    note: "Run immediately",
    autoExecute: true,
   }),
  ).toBe(false)
 })
})
