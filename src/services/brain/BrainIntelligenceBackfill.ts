import { listAlgorithmIntelligenceEvents } from "./AlgorithmIntelligenceEventLedger"
import { listAlgorithmLifecycleObservations } from "./AlgorithmLifecycleObservationStore"
import { persistBrainIntelligence } from "./BrainIntelligencePersistence"

export interface BrainIntelligenceBackfillPreview {
 channelId: string
 events: number
 observations: number
 videos: number
 metrics: string[]
}

export const previewBrainIntelligenceBackfill = (channelId: string): BrainIntelligenceBackfillPreview => {
 const events = listAlgorithmIntelligenceEvents({ channelId })
 const observations = listAlgorithmLifecycleObservations({ channelId })
 return {
  channelId,
  events: events.length,
  observations: observations.length,
  videos: new Set(observations.map((row) => row.videoId)).size,
  metrics: [...new Set(observations.map((row) => row.metric))].sort(),
 }
}

/**
 * Uploads existing local-only Phase 6 history after an explicit creator action.
 * This does not promote learning, alter Channel Profile, or create new evidence.
 */
export const backfillLocalBrainIntelligence = async (input: {
 channelId: string
 creatorApproved: boolean
}) => {
 const preview = previewBrainIntelligenceBackfill(input.channelId)
 if (!input.creatorApproved) {
  return {
   status: "approval_required" as const,
   preview,
   message: "Creator approval is required before local Brain history is uploaded to durable storage.",
  }
 }

 const events = listAlgorithmIntelligenceEvents({ channelId: input.channelId })
 const observations = listAlgorithmLifecycleObservations({ channelId: input.channelId })
 if (!events.length && !observations.length) {
  return { status: "nothing_to_sync" as const, preview }
 }

 const result = await persistBrainIntelligence({
  channelId: input.channelId,
  events,
  observations,
 })
 if (!result) {
  return {
   status: "sign_in_required" as const,
   preview,
   message: "ViewTube sign-in is required before local Brain history can be persisted.",
  }
 }

 return {
  status: "completed" as const,
  preview,
  eventCount: Number(result.eventCount || 0),
  observationCount: Number(result.observationCount || 0),
 }
}
