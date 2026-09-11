import type { BrainOrchestrationGoal, BrainRankedChain } from "./brainAdaptiveOrchestrator"

export type BrainWorkflowOutcome = "accepted" | "rejected" | "corrected" | "completed" | "abandoned"
export interface BrainWorkflowResult {
  id: string
  channelId: string
  chainId: string
  goal: BrainOrchestrationGoal
  outcome: BrainWorkflowOutcome
  sourceToolId?: string
  scoreBefore?: number
  createdAt: number
}

const KEY = "viewtube:brain-workflow-results:v1"
const read = (): BrainWorkflowResult[] => {
  if (typeof window === "undefined") return []
  try { return JSON.parse(window.localStorage.getItem(KEY) || "[]") as BrainWorkflowResult[] } catch { return [] }
}
const write = (rows: BrainWorkflowResult[]) => { if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(rows.slice(0,1000))) }

export const recordBrainWorkflowResult = (input: Omit<BrainWorkflowResult,"id"|"createdAt">) => {
  const row: BrainWorkflowResult = { ...input, id: `workflow-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, createdAt: Date.now() }
  write([row, ...read()])
  return row
}

export const getBrainWorkflowResults = (channelId: string) => read().filter(row => row.channelId === channelId)

const OUTCOME_WEIGHT: Record<BrainWorkflowOutcome,number> = { completed: 1, accepted: .65, corrected: .1, abandoned: -.45, rejected: -.8 }

export const getChainLearningAdjustment = (channelId: string, chainId: string, goal?: BrainOrchestrationGoal) => {
  const rows = getBrainWorkflowResults(channelId).filter(row => row.chainId === chainId && (!goal || row.goal === goal)).slice(0,40)
  if (!rows.length) return { adjustment: 0, sampleSize: 0, successRate: null as number|null, reason: "No channel-specific outcome history yet" }
  const weighted = rows.reduce((sum,row) => sum + OUTCOME_WEIGHT[row.outcome],0) / rows.length
  const successes = rows.filter(row => row.outcome === "completed" || row.outcome === "accepted").length
  const adjustment = Math.round(Math.max(-20,Math.min(20,weighted*20)))
  return { adjustment, sampleSize: rows.length, successRate: successes/rows.length, reason: `${successes}/${rows.length} recent outcomes were accepted or completed` }
}

export const applyChannelLearningToChains = (channelId: string, goal: BrainOrchestrationGoal, chains: BrainRankedChain[]): BrainRankedChain[] => chains.map(chain => {
  const learned = getChainLearningAdjustment(channelId,chain.chainId,goal)
  if (!learned.sampleSize) return chain
  return { ...chain, score: Math.max(0,Math.min(100,chain.score+learned.adjustment)), reasons: [...chain.reasons, `Channel learning ${learned.adjustment >= 0 ? "+" : ""}${learned.adjustment}: ${learned.reason}`] }
}).sort((a,b)=>b.score-a.score)
