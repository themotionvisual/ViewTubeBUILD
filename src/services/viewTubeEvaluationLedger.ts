import { evaluateViewTubeControl } from "./viewTubeUserControls"

export type EvaluationOutcome = "pending" | "positive" | "neutral" | "negative"
export interface EvaluationRecord { id: string; createdAt: number; updatedAt: number; channelId?: string | null; projectId?: string | null; source: string; recommendation: string; evidenceIds: string[]; actionPacketId?: string | null; outcome: EvaluationOutcome; outcomeNote?: string; metricsBefore?: Record<string, number>; metricsAfter?: Record<string, number> }
export interface WorkflowCandidate { id: string; createdAt: number; channelId?: string | null; title: string; toolIds: string[]; reason: string; evidenceRecordIds: string[]; status: "candidate" | "approved" | "rejected"; scope: "channel" | "global-experiment" }

const EVAL_KEY = "viewtube:evaluation-ledger:v1"
const CANDIDATE_KEY = "viewtube:workflow-candidates:v1"
const read = <T,>(key: string): T[] => { if (typeof window === "undefined") return []; try { return JSON.parse(window.localStorage.getItem(key) || "[]") as T[] } catch { return [] } }
const write = <T,>(key: string, values: T[]) => { if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(values)) }

export const listEvaluationRecords = () => read<EvaluationRecord>(EVAL_KEY)
export const createEvaluationRecord = (input: Omit<EvaluationRecord,"id"|"createdAt"|"updatedAt"|"outcome">) => {
 if (!evaluateViewTubeControl("creator-learning").allowed) return null
 const now = Date.now(); const item: EvaluationRecord = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now, outcome: "pending" }
 write(EVAL_KEY, [item, ...listEvaluationRecords()].slice(0, 5000)); return item
}
export const resolveEvaluationRecord = (id: string, outcome: Exclude<EvaluationOutcome,"pending">, outcomeNote?: string, metricsAfter?: Record<string,number>) => {
 const records = listEvaluationRecords(); const found = records.find((r) => r.id === id); if (!found) return null
 const next = { ...found, outcome, outcomeNote, metricsAfter, updatedAt: Date.now() }; write(EVAL_KEY, records.map((r) => r.id === id ? next : r)); return next
}
export const listWorkflowCandidates = () => read<WorkflowCandidate>(CANDIDATE_KEY)
export const proposeWorkflowCandidate = (input: Omit<WorkflowCandidate,"id"|"createdAt"|"status">) => {
 if (!evaluateViewTubeControl("creator-learning").allowed) return null
 const item: WorkflowCandidate = { ...input, id: crypto.randomUUID(), createdAt: Date.now(), status: "candidate" }; write(CANDIDATE_KEY, [item, ...listWorkflowCandidates()].slice(0,1000)); return item
}
export const reviewWorkflowCandidate = (id: string, status: "approved"|"rejected") => {
 const values = listWorkflowCandidates(); const found = values.find((v) => v.id === id); if (!found) return null
 const next = { ...found, status }; write(CANDIDATE_KEY, values.map((v) => v.id === id ? next : v)); return next
}
