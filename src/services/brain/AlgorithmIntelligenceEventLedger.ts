import type { BrainConfidenceLevel } from "../../types"
import { loadPersistedBrainIntelligence, persistBrainIntelligence } from "./BrainIntelligencePersistence"

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
 | "LEARNING_PROMOTED"

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
 const bounded = events.slice(0, 2000)
 localStorage.setItem(STORAGE_KEY, JSON.stringify(bounded))
 window.dispatchEvent(new CustomEvent(ALGORITHM_INTELLIGENCE_EVENT_CHANGED, { detail: bounded }))
}

const persistEvent = (event: AlgorithmIntelligenceEvent) => {
 void persistBrainIntelligence({ channelId: event.channelId, events: [event] }).catch((error) => {
  console.warn("[AlgorithmIntelligenceEventLedger] durable sync deferred:", error)
 })
}

export const hydrateAlgorithmIntelligenceEvents = async (channelId: string) => {
 const persisted = await loadPersistedBrainIntelligence(channelId)
 if (!persisted) return { hydrated: 0 }
 const remote = (persisted.events || []) as AlgorithmIntelligenceEvent[]
 const local = read()
 const byId = new Map(local.map((event) => [event.id, event]))
 remote.forEach((event) => {
  if (!event?.id || event.channelId !== channelId) return
  const current = byId.get(event.id)
  if (!current || Number(event.createdAt || 0) >= Number(current.createdAt || 0)) byId.set(event.id, event)
 })
 const merged = [...byId.values()].sort((a, b) => b.createdAt - a.createdAt)
 write(merged)
 return { hydrated: remote.length }
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
 persistEvent(event)
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
