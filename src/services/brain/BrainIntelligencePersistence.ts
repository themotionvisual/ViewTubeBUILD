import { upsertAlgorithmIntelligenceEvents, type AlgorithmIntelligenceEvent } from "./AlgorithmIntelligenceEventLedger"
import { upsertAlgorithmLifecycleObservations } from "./AlgorithmLifecycleObservationStore"
import type { AlgorithmLifecycleObservation } from "./AlgorithmLifecycleCohorts"

const endpoint = (channelId: string) => `/api/brain-intelligence?channelId=${encodeURIComponent(channelId)}`

export interface BrainIntelligencePersistenceResult {
 ok: true
 channelId: string
 eventCount: number
 observationCount: number
 batches: number
}

const chunk = <T>(rows: T[], size: number): T[][] => {
 const out: T[][] = []
 for (let index = 0; index < rows.length; index += size) out.push(rows.slice(index, index + size))
 return out
}

const putBatch = async (channelId: string, events: unknown[], observations: unknown[]) => {
 const response = await fetch(endpoint(channelId), {
  method: "PUT",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ events, observations }),
 })
 if (response.status === 401) return null
 if (!response.ok) throw new Error(`Brain intelligence persistence failed (${response.status}).`)
 return response.json() as Promise<{
  ok: true
  channelId: string
  eventCount: number
  observationCount: number
 }>
}

export const loadPersistedBrainIntelligence = async (channelId: string) => {
 const response = await fetch(endpoint(channelId), { credentials: "include" })
 if (response.status === 401) return null
 if (!response.ok) throw new Error(`Brain intelligence load failed (${response.status}).`)
 return response.json() as Promise<{ channelId: string; events: unknown[]; observations: unknown[] }>
}

/**
 * Writes bounded batches so large lifecycle histories do not exceed the API
 * payload ceiling. Server-side idempotent keys make retries safe.
 */
export const persistBrainIntelligence = async (input: {
 channelId: string
 events?: unknown[]
 observations?: unknown[]
}): Promise<BrainIntelligencePersistenceResult | null> => {
 const events = input.events || []
 const observations = input.observations || []
 const eventBatches = chunk(events, 300)
 const observationBatches = chunk(observations, 750)
 const work = [
  ...eventBatches.map((batch) => ({ events: batch, observations: [] as unknown[] })),
  ...observationBatches.map((batch) => ({ events: [] as unknown[], observations: batch })),
 ]
 if (!work.length) return {
  ok: true,
  channelId: input.channelId,
  eventCount: 0,
  observationCount: 0,
  batches: 0,
 }

 let eventCount = 0
 let observationCount = 0
 let batches = 0
 for (const batch of work) {
  const result = await putBatch(input.channelId, batch.events, batch.observations)
  if (!result) return null
  eventCount += Number(result.eventCount || 0)
  observationCount += Number(result.observationCount || 0)
  batches += 1
 }
 return { ok: true, channelId: input.channelId, eventCount, observationCount, batches }
}


export const hydrateBrainIntelligenceFromPersistence = async (channelId: string) => {
 const durable = await loadPersistedBrainIntelligence(channelId)
 if (!durable) return null
 const events = (durable.events || [])
  .filter((row): row is AlgorithmIntelligenceEvent => Boolean(row && typeof row === "object" && String((row as AlgorithmIntelligenceEvent).channelId || "") === channelId))
 const observations = (durable.observations || [])
  .filter((row): row is AlgorithmLifecycleObservation => Boolean(row && typeof row === "object" && String((row as AlgorithmLifecycleObservation).channelId || "") === channelId))
 upsertAlgorithmIntelligenceEvents(events)
 upsertAlgorithmLifecycleObservations(observations)
 return { channelId, events: events.length, observations: observations.length }
}
