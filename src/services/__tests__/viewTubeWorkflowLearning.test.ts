import { describe, expect, it } from "vitest"
import { buildWorkflowSelectionSignals } from "../viewTubeWorkflowLearning"

describe("buildWorkflowSelectionSignals", () => {
 it("records the chosen target as accepted and only higher-ranked visible targets as rejected", () => {
  const signals = buildWorkflowSelectionSignals({
   sourceToolId: "brain-command-center",
   payloadKind: "video-package",
   rankedTargetIds: ["packaging-lab-pro", "creator-canvas-os", "video-manager"],
   chosenTargetId: "creator-canvas-os",
   channelId: "channel-1",
   projectId: "project-1",
  })

  expect(signals).toEqual([
   {
    sourceToolId: "brain-command-center",
    payloadKind: "video-package",
    targetToolId: "creator-canvas-os",
    accepted: true,
    channelId: "channel-1",
    projectId: "project-1",
   },
   {
    sourceToolId: "brain-command-center",
    payloadKind: "video-package",
    targetToolId: "packaging-lab-pro",
    accepted: false,
    channelId: "channel-1",
    projectId: "project-1",
   },
  ])
 })

 it("does not penalize lower-ranked targets that the creator may not have considered", () => {
  const signals = buildWorkflowSelectionSignals({
   sourceToolId: "brain-command-center",
   payloadKind: "video-package",
   rankedTargetIds: ["packaging-lab-pro", "creator-canvas-os", "video-manager"],
   chosenTargetId: "creator-canvas-os",
  })

  expect(signals.some((signal) => signal.targetToolId === "video-manager")).toBe(false)
 })

 it("records only the accepted choice when the creator picks the top-ranked target", () => {
  const signals = buildWorkflowSelectionSignals({
   sourceToolId: "brain-command-center",
   payloadKind: "video-package",
   rankedTargetIds: ["packaging-lab-pro", "creator-canvas-os"],
   chosenTargetId: "packaging-lab-pro",
  })

  expect(signals).toHaveLength(1)
  expect(signals[0]).toMatchObject({
   targetToolId: "packaging-lab-pro",
   accepted: true,
  })
 })

 it("fails closed to a positive signal only when the chosen target is not in the ranked list", () => {
  const signals = buildWorkflowSelectionSignals({
   sourceToolId: "brain-command-center",
   payloadKind: "video-package",
   rankedTargetIds: ["packaging-lab-pro", "creator-canvas-os"],
   chosenTargetId: "video-manager",
  })

  expect(signals).toEqual([
   {
    sourceToolId: "brain-command-center",
    payloadKind: "video-package",
    targetToolId: "video-manager",
    accepted: true,
    channelId: undefined,
    projectId: undefined,
   },
  ])
 })
})
