import { teachAIBrainExplicitly } from "../aiBrainSelfImprovement"
import { readBrainUserControls, shouldBrainLearnFromInteraction } from "./BrainUserControls"
import { listApprovedAlgorithmLearningCandidates } from "./AlgorithmLearningGovernance"
import { recordAlgorithmIntelligenceEvent } from "./AlgorithmIntelligenceEventLedger"

export interface AlgorithmLearningPromotionRequest {
 channelId: string
 candidateId: string
 creatorApproved: boolean
 note?: string | null
}

/**
 * Final governed bridge from a measured Algorithm learning candidate into the
 * existing Brain memory system.
 *
 * This adapter intentionally requires BOTH:
 * 1. prior governance approval (`approve_for_profile_review`), and
 * 2. an explicit creator approval at the moment of promotion.
 *
 * It reuses the existing Brain teaching/promotion path rather than creating a
 * second Channel Profile writer.
 */
export const promoteApprovedAlgorithmLearningToProfile = async (
 input: AlgorithmLearningPromotionRequest,
) => {
 if (!input.creatorApproved) {
  return {
   status: "creator_approval_required" as const,
   claim: null,
   candidate: null,
  }
 }

 const controls = readBrainUserControls(input.channelId)
 if (!shouldBrainLearnFromInteraction(controls)) {
  return {
   status: "learning_disabled" as const,
   claim: null,
   candidate: null,
  }
 }

 const row = listApprovedAlgorithmLearningCandidates(input.channelId)
  .find(({ candidate }) => candidate.id === input.candidateId)
 if (!row) {
  return {
   status: "not_approved_for_profile_review" as const,
   claim: null,
   candidate: null,
  }
 }

 const { candidate, sourceEvent, review } = row
 const teaching = await teachAIBrainExplicitly({
  channelId: input.channelId,
  summary: candidate.statement,
  detail: input.note || `Promoted from measured Algorithm Intelligence learning candidate ${candidate.id}.`,
  category: "channel_fact",
  evidence: candidate.evidenceIds,
 })

 const event = recordAlgorithmIntelligenceEvent({
  id: `algorithm-learning-promoted:${candidate.id}`,
  channelId: input.channelId,
  kind: "LEARNING_PROMOTED",
  sourceSystem: "learning",
  sourceId: candidate.id,
  parentEventIds: [sourceEvent.id, review?.eventId].filter(Boolean) as string[],
  evidenceIds: candidate.evidenceIds,
  confidence: candidate.confidence,
  title: "Algorithm learning promoted to Channel Profile",
  summary: candidate.statement,
  metadata: {
   candidate,
   review: review || null,
   creatorApproved: true,
   brainLearningEntryId: teaching.entry.id,
   promotion: teaching.promotion,
   durableProfileMutation: Boolean(teaching.promotion.allowed),
  },
 })

 return {
  status: teaching.promotion.allowed ? "promoted" as const : "promotion_held" as const,
  candidate,
  review,
  teaching,
  event,
  claim: teaching.promotion,
 }
}
