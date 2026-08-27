import type { BrainOrchestrationGoal, BrainRankedChain } from "./brainAdaptiveOrchestrator"
import { recordBrainWorkflowResult, type BrainWorkflowOutcome } from "./brainWorkflowLearning"

export type BrainWorkflowRunStatus = "active" | "waiting-for-user" | "completed" | "abandoned"
export type BrainWorkflowStepStatus = "pending" | "active" | "waiting-for-user" | "completed" | "skipped" | "failed"

export interface BrainActionPacket {
  kind: string
  sourceToolId?: string
  sourceRunId?: string
  title?: string
  summary?: string
  payload?: unknown
  metadata?: Record<string, unknown>
  createdAt: number
}

export interface BrainWorkflowExecutionStep {
  index: number
  toolId: string
  label: string
  purpose: string
  optional: boolean
  status: BrainWorkflowStepStatus
  requiresApproval: boolean
  inputPacket?: BrainActionPacket
  outputPacket?: BrainActionPacket
  startedAt?: number
  completedAt?: number
  error?: string
}

export interface BrainWorkflowRun {
  id: string
  channelId: string
  goal: BrainOrchestrationGoal
  chainId: string
  chainTitle: string
  recommendationScore: number
  status: BrainWorkflowRunStatus
  currentStepIndex: number
  steps: BrainWorkflowExecutionStep[]
  initialPacket?: BrainActionPacket
  finalPacket?: BrainActionPacket
  correctionCount: number
  createdAt: number
  updatedAt: number
}

const KEY = "viewtube:brain-workflow-runs:v1"
const MAX_RUNS = 100

const read = (): BrainWorkflowRun[] => {
  if (typeof window === "undefined") return []
  try { return JSON.parse(window.localStorage.getItem(KEY) || "[]") as BrainWorkflowRun[] } catch { return [] }
}
const write = (rows: BrainWorkflowRun[]) => {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(rows.slice(0, MAX_RUNS)))
}
const saveRun = (run: BrainWorkflowRun) => {
  const rows = read().filter(row => row.id !== run.id)
  write([{ ...run, updatedAt: Date.now() }, ...rows])
  return { ...run, updatedAt: Date.now() }
}

export const createBrainActionPacket = (input: Omit<BrainActionPacket, "createdAt">): BrainActionPacket => ({ ...input, createdAt: Date.now() })

export const startBrainWorkflowRun = (input: {
  channelId: string
  goal: BrainOrchestrationGoal
  chain: BrainRankedChain
  initialPacket?: BrainActionPacket
  approvalToolIds?: string[]
}): BrainWorkflowRun => {
  const approvalTools = new Set(input.approvalToolIds || [])
  const now = Date.now()
  const steps = input.chain.steps.map((step, index): BrainWorkflowExecutionStep => ({
    index,
    toolId: step.toolId,
    label: step.label,
    purpose: step.purpose,
    optional: step.optional,
    status: index === 0 ? "active" : "pending",
    requiresApproval: approvalTools.has(step.toolId),
    inputPacket: index === 0 ? input.initialPacket : undefined,
    startedAt: index === 0 ? now : undefined,
  }))
  const run: BrainWorkflowRun = {
    id: `brain-run-${now}-${Math.random().toString(36).slice(2, 8)}`,
    channelId: input.channelId,
    goal: input.goal,
    chainId: input.chain.chainId,
    chainTitle: input.chain.title,
    recommendationScore: input.chain.score,
    status: "active",
    currentStepIndex: 0,
    steps,
    initialPacket: input.initialPacket,
    correctionCount: 0,
    createdAt: now,
    updatedAt: now,
  }
  write([run, ...read()])
  recordBrainWorkflowResult({ channelId: run.channelId, chainId: run.chainId, goal: run.goal, outcome: "accepted", scoreBefore: run.recommendationScore })
  return run
}

export const getBrainWorkflowRun = (id: string) => read().find(run => run.id === id) || null
export const getBrainWorkflowRuns = (channelId?: string) => channelId ? read().filter(run => run.channelId === channelId) : read()

export const completeBrainWorkflowStep = (runId: string, outputPacket?: BrainActionPacket) => {
  const run = getBrainWorkflowRun(runId)
  if (!run || run.status === "completed" || run.status === "abandoned") return run
  const current = run.steps[run.currentStepIndex]
  if (!current) return run
  current.status = "completed"
  current.outputPacket = outputPacket
  current.completedAt = Date.now()
  const next = run.steps.slice(current.index + 1).find(step => step.status === "pending")
  if (!next) {
    run.status = "completed"
    run.finalPacket = outputPacket || current.outputPacket || current.inputPacket
    const saved = saveRun(run)
    recordBrainWorkflowResult({ channelId: run.channelId, chainId: run.chainId, goal: run.goal, outcome: "completed", scoreBefore: run.recommendationScore })
    return saved
  }
  next.inputPacket = outputPacket || current.outputPacket || current.inputPacket
  run.currentStepIndex = next.index
  if (next.requiresApproval) {
    next.status = "waiting-for-user"
    run.status = "waiting-for-user"
  } else {
    next.status = "active"
    next.startedAt = Date.now()
    run.status = "active"
  }
  return saveRun(run)
}

export const approveBrainWorkflowStep = (runId: string) => {
  const run = getBrainWorkflowRun(runId)
  if (!run) return null
  const step = run.steps[run.currentStepIndex]
  if (!step || step.status !== "waiting-for-user") return run
  step.status = "active"
  step.startedAt = Date.now()
  run.status = "active"
  return saveRun(run)
}

export const skipBrainWorkflowStep = (runId: string) => {
  const run = getBrainWorkflowRun(runId)
  if (!run) return null
  const step = run.steps[run.currentStepIndex]
  if (!step?.optional) return run
  step.status = "skipped"
  step.completedAt = Date.now()
  return completeBrainWorkflowStep(runId, step.inputPacket)
}

export const correctBrainWorkflowRun = (runId: string, correctedPacket?: BrainActionPacket) => {
  const run = getBrainWorkflowRun(runId)
  if (!run) return null
  run.correctionCount += 1
  const step = run.steps[run.currentStepIndex]
  if (step && correctedPacket) step.inputPacket = correctedPacket
  const saved = saveRun(run)
  recordBrainWorkflowResult({ channelId: run.channelId, chainId: run.chainId, goal: run.goal, outcome: "corrected", scoreBefore: run.recommendationScore })
  return saved
}

export const abandonBrainWorkflowRun = (runId: string) => {
  const run = getBrainWorkflowRun(runId)
  if (!run) return null
  run.status = "abandoned"
  const step = run.steps[run.currentStepIndex]
  if (step && step.status !== "completed") step.status = "failed"
  const saved = saveRun(run)
  recordBrainWorkflowResult({ channelId: run.channelId, chainId: run.chainId, goal: run.goal, outcome: "abandoned", scoreBefore: run.recommendationScore })
  return saved
}

export const recordBrainWorkflowDecision = (run: BrainWorkflowRun, outcome: Extract<BrainWorkflowOutcome, "rejected">) => recordBrainWorkflowResult({
  channelId: run.channelId,
  chainId: run.chainId,
  goal: run.goal,
  outcome,
  scoreBefore: run.recommendationScore,
})
