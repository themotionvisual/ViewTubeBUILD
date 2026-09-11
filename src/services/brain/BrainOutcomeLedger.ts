import type { BrainConfidenceLevel, SuperToolId } from "../../types"
import { captureAIBrainLearningEvent } from "../aiBrainSelfImprovement"

const STORAGE_KEY = "vt_brain_outcome_ledger_v1"
export const BRAIN_OUTCOME_EVENT = "vt_brain_outcome_ledger_changed"

export type BrainOutcomeKind = "accepted" | "rejected" | "corrected" | "completed" | "abandoned"

export interface BrainOutcomeRecord {
 id: string
 channelId: string | null
 sourceToolId: SuperToolId
 targetToolId: SuperToolId | null
 actionPacketId?: string | null
 workflowId?: string | null
 outcome: BrainOutcomeKind
 summary: string
 evidence: string[]
 confidence: BrainConfidenceLevel
 createdAt: number
}

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"

const read = (): BrainOutcomeRecord[] => {
 if (!canUseStorage()) return []
 try {
  const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  return Array.isArray(parsed) ? parsed : []
 } catch {
  return []
 }
}

const write = (records: BrainOutcomeRecord[]) => {
 if (!canUseStorage()) return
 localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 500)))
 window.dispatchEvent(new CustomEvent(BRAIN_OUTCOME_EVENT, { detail: records }))
}

export const listBrainOutcomes = (channelId?: string | null) => {
 const records = read().sort((a, b) => b.createdAt - a.createdAt)
 return channelId ? records.filter((record) => record.channelId === channelId) : records
}

const feedAlgorithmEvaluation = async (record: BrainOutcomeRecord) => {
 if (!record.channelId || (!record.actionPacketId && !record.workflowId)) return null
 try {
  const { recordAlgorithmWorkflowOutcome } = await import("./AlgorithmWorkflowOutcomeBridge")
  return recordAlgorithmWorkflowOutcome({
   channelId: record.channelId,
   actionPacketId: record.actionPacketId,
   workflowId: record.workflowId,
   status: record.outcome,
   completedAt: record.createdAt,
   evidenceIds: record.evidence,
   metadata: {
    brainOutcomeId: record.id,
    sourceToolId: record.sourceToolId,
    targetToolId: record.targetToolId,
   },
  })
 } catch {
  // Outcome recording remains authoritative even if Algorithm Intelligence is
  // not available in this runtime. Evaluation can be retried from the ledger.
  return null
 }
}

export const recordBrainOutcome = async (input: Omit<BrainOutcomeRecord, "id" | "createdAt">) => {
 const record: BrainOutcomeRecord = {
  ...input,
  id: crypto.randomUUID(),
  createdAt: Date.now(),
 }
 write([record, ...read()])

 const positive = input.outcome === "accepted" || input.outcome === "completed"
 const corrective = input.outcome === "corrected" || input.outcome === "rejected"
 await captureAIBrainLearningEvent({
  channelId: input.channelId,
  source: "tool",
  summary: input.summary,
  detail: `${input.sourceToolId}${input.targetToolId ? ` → ${input.targetToolId}` : ""}: ${input.outcome}`,
  category: corrective ? "correction" : "tool_workflow",
  confidence: input.confidence,
  evidence: input.evidence,
  metadata: {
   outcome: input.outcome,
   positive,
   corrective,
   actionPacketId: input.actionPacketId || null,
   workflowId: input.workflowId || null,
   sourceToolId: input.sourceToolId,
   targetToolId: input.targetToolId,
  },
 })

 // Phase 6 integration: the existing Outcome Ledger remains the canonical
 // workflow-result owner. It may additionally feed declared workflow-native
 // Algorithm evaluation targets, but never analytics targets.
 await feedAlgorithmEvaluation(record)
 return record
}

export const summarizeBrainOutcomes = (channelId?: string | null) => {
 const records = listBrainOutcomes(channelId)
 const count = (kind: BrainOutcomeKind) => records.filter((record) => record.outcome === kind).length
 const accepted = count("accepted") + count("completed")
 const negative = count("rejected") + count("corrected") + count("abandoned")
 return {
  total: records.length,
  accepted,
  negative,
  acceptanceRate: records.length ? Math.round((accepted / records.length) * 100) : 0,
  completed: count("completed"),
  corrected: count("corrected"),
  rejected: count("rejected"),
  abandoned: count("abandoned"),
 }
}
