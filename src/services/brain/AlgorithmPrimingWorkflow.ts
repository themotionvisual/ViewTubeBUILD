import { createBrainSuperToolHandoff } from "./BrainSuperToolBridge"
import type { AlgorithmPrimingPlan, PrimingStep } from "./AlgorithmPrimingEngine"
import { recordAlgorithmIntelligenceEvent, type AlgorithmEvaluationTarget } from "./AlgorithmIntelligenceEventLedger"

const objectiveFor = (step: PrimingStep) => `${step.title}. ${step.description}`

const evaluationTargetsForStep = (step: PrimingStep): AlgorithmEvaluationTarget[] => {
 switch (step.outputKind) {
  case "community_post": return [{ metric: "audience_warmth", direction: "increase", minimumRelativeChange: .05, windowHours: 72 }]
  case "short": return [{ metric: "launch_interest", direction: "increase", minimumRelativeChange: .05, windowHours: 72 }]
  case "package": return [{ metric: "ctr", direction: "increase", minimumRelativeChange: .05, windowHours: 72 }]
  case "session_route": return [{ metric: "session_continuation", direction: "increase", minimumRelativeChange: .05, windowHours: 168 }]
  case "launch_check": return [{ metric: "watch_quality", direction: "hold", minimumRelativeChange: .05, windowHours: 48 }]
  case "derivative_plan": return [{ metric: "derivative_demand", direction: "inspect", windowHours: 168 }]
  case "learning_record": return [{ metric: "learning_validated", direction: "inspect", windowHours: 24 }]
  case "analysis": return [{ metric: "diagnosis_complete", direction: "inspect", windowHours: 24 }]
 }
}

export const createPrimingStepHandoff = async (input: {
 plan: AlgorithmPrimingPlan
 stepId: string
 creatorApproved?: boolean
 creatorDecisions?: Array<{ type: string; choice: string }>
}) => {
 const step = input.plan.steps.find((candidate) => candidate.id === input.stepId) || null
 if (!step) {
  return { status: "missing_step" as const, message: `Priming step ${input.stepId} was not found.` }
 }

 const evaluationTargets = evaluationTargetsForStep(step)
 const checkpointAt = Date.now() + Math.max(...evaluationTargets.map((target) => target.windowHours || 24), 24) * 60 * 60 * 1000

 if (!step.targetToolId) {
  const event = recordAlgorithmIntelligenceEvent({
   channelId: input.plan.channelId,
   projectId: input.plan.projectId,
   videoId: input.plan.videoId,
   kind: "PRIMING_STEP_PREPARED",
   sourceSystem: "priming",
   sourceId: step.id,
   primingPlanId: input.plan.id,
   primingStepId: step.id,
   evidenceIds: [...new Set([...input.plan.evidenceIds, ...step.evidenceIds])],
   confidence: input.plan.confidence,
   title: step.title,
   summary: step.description,
   evaluationTargets,
   checkpointAt,
   metadata: { phase: step.phase, objective: step.objective, outputKind: step.outputKind, noToolAction: true },
  })
  return {
   status: "no_tool_action" as const,
   step,
   event,
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

 const event = recordAlgorithmIntelligenceEvent({
  channelId: input.plan.channelId,
  projectId: input.plan.projectId,
  videoId: input.plan.videoId,
  kind: "PRIMING_STEP_EXECUTED",
  sourceSystem: "workflow",
  sourceId: step.id,
  primingPlanId: input.plan.id,
  primingStepId: step.id,
  actionPacketId: result.packet.id,
  workflowId: result.chain.id,
  evidenceIds: [...new Set([...input.plan.evidenceIds, ...step.evidenceIds])],
  confidence: input.plan.confidence,
  title: step.title,
  summary: step.description,
  evaluationTargets,
  checkpointAt,
  metadata: { phase: step.phase, objective: step.objective, outputKind: step.outputKind, destinationToolId: step.targetToolId },
 })

 return { status: "handoff_created" as const, step, result, event }
}

export const getReadyPrimingSteps = (plan: AlgorithmPrimingPlan, completedStepIds: string[]) => {
 const complete = new Set(completedStepIds)
 return plan.steps.filter((step) => step.dependsOn.every((dependency) => complete.has(dependency)))
}
