import { createBrainSuperToolHandoff } from "./BrainSuperToolBridge"
import type { AlgorithmPrimingPlan, PrimingStep } from "./AlgorithmPrimingEngine"

const objectiveForStep = (step: PrimingStep) =>
 `${step.title}. ${step.description} Timing: ${step.relativeTiming}.`

export const createPrimingStepHandoff = async (input: {
 plan: AlgorithmPrimingPlan
 stepId: string
 creatorApproved?: boolean
 creatorDecisions?: Array<{ type: string; choice: string }>
}) => {
 const step = input.plan.steps.find((candidate) => candidate.id === input.stepId)
 if (!step) return { status: "not_found" as const, message: "Priming step was not found." }
 if (!step.targetToolId) {
  return { status: "internal" as const, step, message: "This priming step is completed inside Brain learning/evaluation rather than a destination tool." }
 }
 if (step.requiresApproval && input.creatorApproved !== true) {
  return { status: "approval_required" as const, step, message: "Creator approval is required before this priming handoff can be created." }
 }
 const result = await createBrainSuperToolHandoff({
  channelId: input.plan.channelId,
  projectId: input.plan.projectId,
  sourceToolId: "brain-command-center",
  destinationToolId: step.targetToolId,
  objective: objectiveForStep(step),
  payload: {
   primingPlanId: input.plan.id,
   primingStepId: step.id,
   videoId: input.plan.videoId || null,
   launchAt: input.plan.launchAt || null,
   phase: step.phase,
   objective: step.objective,
   relativeTiming: step.relativeTiming,
   outputKind: step.outputKind,
   stepPayload: step.payload,
   ...step.payload,
  },
  evidenceIds: [...new Set([...input.plan.evidenceIds, ...step.evidenceIds])],
  creatorDecisions: input.creatorDecisions,
  confidence: input.plan.confidence,
 })
 return { status: "handoff_created" as const, step, result }
}

export const getExecutablePrimingSteps = (plan: AlgorithmPrimingPlan) =>
 plan.steps.filter((step) => Boolean(step.targetToolId))


export const getReadyPrimingSteps = (plan: AlgorithmPrimingPlan, completedStepIds: string[]) => {
 const complete = new Set(completedStepIds)
 return plan.steps.filter((step) => step.dependsOn.every((dependency) => complete.has(dependency)))
}
