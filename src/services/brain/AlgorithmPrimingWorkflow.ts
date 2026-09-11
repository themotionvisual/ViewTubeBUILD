import { createBrainSuperToolHandoff } from "./BrainSuperToolBridge"
import type { AlgorithmPrimingPlan, PrimingStep } from "./AlgorithmPrimingEngine"

const objectiveFor = (step: PrimingStep) =>
 `${step.title}. ${step.description}`

export const createPrimingStepHandoff = async (input: {
 plan: AlgorithmPrimingPlan
 stepId: string
 creatorApproved?: boolean
 creatorDecisions?: Array<{ type: string; choice: string }>
}) => {
 const step = input.plan.steps.find((candidate) => candidate.id === input.stepId) || null
 if (!step) {
  return {
   status: "missing_step" as const,
   message: `Priming step ${input.stepId} was not found.`,
  }
 }

 if (!step.targetToolId) {
  return {
   status: "no_tool_action" as const,
   step,
   message: "This priming step is an analysis/learning checkpoint and does not create a tool handoff.",
  }
 }

 if (step.requiresApproval && input.creatorApproved !== true) {
  return {
   status: "approval_required" as const,
   step,
   message: "Creator approval is required before this priming step can be handed to a tool.",
  }
 }

 const result = await createBrainSuperToolHandoff({
  channelId: input.plan.channelId,
  projectId: input.plan.projectId,
  sourceToolId: "brain-command-center",
  destinationToolId: step.targetToolId,
  objective: objectiveFor(step),
  payload: {
   primingPlanId: input.plan.id,
   primingStepId: step.id,
   phase: step.phase,
   objective: step.objective,
   relativeTiming: step.relativeTiming,
   outputKind: step.outputKind,
   videoId: input.plan.videoId || null,
   launchAt: input.plan.launchAt || null,
   stepPayload: step.payload,
  },
  evidenceIds: [...new Set([...input.plan.evidenceIds, ...step.evidenceIds])],
  creatorDecisions: input.creatorDecisions,
  confidence: input.plan.confidence,
 })

 return {
  status: "handoff_created" as const,
  step,
  result,
 }
}

export const getReadyPrimingSteps = (plan: AlgorithmPrimingPlan, completedStepIds: string[]) => {
 const complete = new Set(completedStepIds)
 return plan.steps.filter((step) => step.dependsOn.every((dependency) => complete.has(dependency)))
}
