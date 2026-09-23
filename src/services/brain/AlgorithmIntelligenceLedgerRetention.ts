import { listAlgorithmIntelligenceEvents, type AlgorithmIntelligenceEvent } from "./AlgorithmIntelligenceEventLedger"

export interface AlgorithmLedgerArchiveBundle {
 version: "algorithm-intelligence-archive-v1"
 channelId: string
 generatedAt: string
 retainedEventIds: string[]
 archivedEvents: AlgorithmIntelligenceEvent[]
 reason: string
}

const DAY = 24 * 60 * 60 * 1000
const PROTECTED_KINDS = new Set<AlgorithmIntelligenceEvent["kind"]>([
 "LEARNING_CANDIDATE_CREATED",
 "LEARNING_CANDIDATE_REVIEWED",
 "LEARNING_PROMOTED",
])

/**
 * Builds a deterministic retention/archive plan for the current local ledger.
 * It does not delete or upload anything. Production persistence can consume the
 * returned archive bundle before local pruning is enabled.
 */
export const buildAlgorithmLedgerRetentionPlan = (input: {
 channelId: string
 now?: number
 retainDays?: number
 maximumRetained?: number
}) => {
 const now = input.now || Date.now()
 const retainDays = Math.max(30, input.retainDays || 180)
 const maximumRetained = Math.max(250, Math.min(2000, input.maximumRetained || 1500))
 const cutoff = now - retainDays * DAY
 const events = listAlgorithmIntelligenceEvents({ channelId: input.channelId })

 const protectedIds = new Set<string>()
 events.forEach((event) => {
  if (PROTECTED_KINDS.has(event.kind)) {
   protectedIds.add(event.id)
   event.parentEventIds.forEach((id) => protectedIds.add(id))
  }
 })

 const recent = events.filter((event) => event.createdAt >= cutoff || protectedIds.has(event.id))
 const retained = recent.slice(0, maximumRetained)
 const retainedIds = new Set(retained.map((event) => event.id))
 const archivedEvents = events.filter((event) => !retainedIds.has(event.id))

 const bundle: AlgorithmLedgerArchiveBundle = {
  version: "algorithm-intelligence-archive-v1",
  channelId: input.channelId,
  generatedAt: new Date(now).toISOString(),
  retainedEventIds: retained.map((event) => event.id),
  archivedEvents,
  reason: `Retain recent ${retainDays}d plus protected learning lineage, capped at ${maximumRetained} local events. Archive older non-protected history before pruning.`,
 }

 return {
  channelId: input.channelId,
  totalEvents: events.length,
  retainedCount: retained.length,
  archiveCount: archivedEvents.length,
  protectedCount: retained.filter((event) => protectedIds.has(event.id)).length,
  cutoff,
  requiresArchive: archivedEvents.length > 0,
  bundle,
  destructivePrunePerformed: false,
 }
}
