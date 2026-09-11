import type { BrainConfidenceLevel } from "../../types"

const STORAGE_KEY = "vt_algorithm_intelligence_events_v1"
export const ALGORITHM_INTELLIGENCE_EVENT_CHANGED = "vt_algorithm_intelligence_event_changed"

export type AlgorithmIntelligenceEventKind =
 | "ANOMALY_ESCALATED"
 | "OPPORTUNITY_IDENTIFIED"
 | "PRIMING_PLAN_CREATED"
 | "PRIMING_STEP_PREPARED"
 | "PRIMING_STEP_EXECUTED"
 | "RECOMMENDATION_CREATED"
 | "RECOMMENDATION_EXECUTED"
 | "CHECKPOINT_REACHED"
 | "OUTCOME_MEASURED"
 | "LEARNING_CANDIDATE_CREATED"
 | "LEARNING_CANDIDATE_REVIEWED"

export interface AlgorithmEvaluationTarget {
 metric: string
 direction: "increase" | "decrease" | "hold" | "inspect"
 baselineValue?: number | null
 targetValue?: number | null
 minimumRelativeChange?: number | null
 windowHours?: number | null
}

export interface AlgorithmIntelligenceEvent {
 id: string
 channelId: string
 projectId?: string | null
 videoId?: string | null
 kind: AlgorithmIntelligenceEventKind
 sourceSystem: "anomaly" | "opportunity" | "priming" | "decision" | "workflow" | "evaluation" | "learning"
 sourceId?: string | null
 parentEventIds: string[]
 recommendationId?: string | null
 primingPlanId?: string | null
 primingStepId?: string | null
 actionPacketId?: string | null
 workflowId?: string | null
 evidenceIds: string[]
 confidence: BrainConfidenceLevel
 title: string
 summary: string
 evaluationTargets: AlgorithmEvaluationTarget[]
 checkpointAt?: number | null
 metadata: Record<string, unknown>
 createdAt: number
}

const canUseStorage = () => typeof window !== "undefined" && typeof localStorage !== "undefined"
const makeId = () => typeof crypto !== "undefined" && "randomUUID" in crypto
 ? `algorithm-event:${crypto.randomUUID()}`
 : `algorithm-event:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`

const read = (): AlgorithmIntelligenceEvent[] => {
 if (!canUseStorage()) return []
 try {
  const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  return Array.isArray(parsed) ? parsed : []
 } catch {
  return []
 }
}

const write = (events: AlgorithmIntelligenceEvent[]) => {
 if (!canUseStorage()) return
 localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, 2000)))
 window.dispatchEvent(new CustomEvent(ALGORITHM_INTELLIGENCE_EVENT_CHANGED, { detail: events }))
}

export const recordAlgorithmIntelligenceEvent = (
 input: Omit<AlgorithmIntelligenceEvent, "id" | "createdAt" | "parentEventIds" | "evidenceIds" | "evaluationTargets" | "metadata"> & {
  id?: string
  parentEventIds?: string[]
  evidenceIds?: string[]
  evaluationTargets?: AlgorithmEvaluationTarget[]
  metadata?: Record<string, unknown>
 },
): AlgorithmIntelligenceEvent => {
 const events = read()
 const id = input.id || makeId()
 const existing = events.find((candidate) => candidate.id === id)
 const event: AlgorithmIntelligenceEvent = {
  ...input,
  id,
  parentEventIds: [...new Set([...(existing?.parentEventIds || []), ...(input.parentEventIds || [])])],
  evidenceIds: [...new Set([...(existing?.evidenceIds || []), ...(input.evidenceIds || [])])],
  evaluationTargets: input.evaluationTargets || existing?.evaluationTargets || [],
  metadata: { ...(existing?.metadata || {}), ...(input.metadata || {}) },
  createdAt: existing?.createdAt || Date.now(),
 }
 write([event, ...events.filter((candidate) => candidate.id !== event.id)])
 return event
}

export const listAlgorithmIntelligenceEvents = (input: {
 channelId?: string | null
 projectId?: string | null
 videoId?: string | null
 recommendationId?: string | null
 primingPlanId?: string | null
 kind?: AlgorithmIntelligenceEventKind | null
} = {}): AlgorithmIntelligenceEvent[] => read()
 .filter((event) => !input.channelId || event.channelId === input.channelId)
 .filter((event) => !input.projectId || event.projectId === input.projectId)
 .filter((event) => !input.videoId || event.videoId === input.videoId)
 .filter((event) => !input.recommendationId || event.recommendationId === input.recommendationId)
 .filter((event) => !input.primingPlanId || event.primingPlanId === input.primingPlanId)
 .filter((event) => !input.kind || event.kind === input.kind)
 .sort((left, right) => right.createdAt - left.createdAt)

export const findAlgorithmEventByActionPacket = (actionPacketId: string) =>
 read().find((event) => event.actionPacketId === actionPacketId) || null

export const getAlgorithmEventLineage = (eventId: string): AlgorithmIntelligenceEvent[] => {
 const events = read()
 const byId = new Map(events.map((event) => [event.id, event]))
 const lineage: AlgorithmIntelligenceEvent[] = []
 const visited = new Set<string>()
 const visit = (id: string) => {
  if (visited.has(id)) return
  visited.add(id)
  const event = byId.get(id)
  if (!event) return
  event.parentEventIds.forEach(visit)
  lineage.push(event)
 }
 visit(eventId)
 return lineage
}
