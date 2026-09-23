import {
 listAlgorithmIntelligenceEvents,
 recordAlgorithmIntelligenceEvent,
 type AlgorithmIntelligenceEvent,
} from "./AlgorithmIntelligenceEventLedger"
import type { AlgorithmLearningCandidate } from "./AlgorithmLearningCandidates"

export type AlgorithmLearningReviewDecision =
 | "hold"
 | "reject"
 | "approve_for_profile_review"

export interface AlgorithmLearningReview {
 candidateId: string
 decision: AlgorithmLearningReviewDecision
 note?: string | null
 reviewedAt: number
 eventId: string
}

const candidateFromEvent = (event: AlgorithmIntelligenceEvent): AlgorithmLearningCandidate | null => {
 const value = event.metadata?.candidate
 return value && typeof value === "object" ? value as AlgorithmLearningCandidate : null
}

export const listAlgorithmLearningCandidatesForReview = (channelId: string) => {
 const candidateEvents = listAlgorithmIntelligenceEvents({
  channelId,
  kind: "LEARNING_CANDIDATE_CREATED",
 })
 const reviewEvents = listAlgorithmIntelligenceEvents({
  channelId,
  kind: "LEARNING_CANDIDATE_REVIEWED",
 })
 const latestReviewByCandidate = new Map<string, AlgorithmLearningReview>()
 reviewEvents.forEach((event) => {
  const review = event.metadata?.review as AlgorithmLearningReview | undefined
  if (!review?.candidateId || latestReviewByCandidate.has(review.candidateId)) return
  latestReviewByCandidate.set(review.candidateId, review)
 })

 return candidateEvents.flatMap((event) => {
  const candidate = candidateFromEvent(event)
  if (!candidate) return []
  return [{
   candidate,
   sourceEvent: event,
   review: latestReviewByCandidate.get(candidate.id) || null,
  }]
 })
}

/**
 * Records a governance decision only. Approval here means the candidate may be
 * considered by a later Channel Profile promotion flow; this function does not
 * mutate Channel Profile or any durable creator knowledge itself.
 */
export const reviewAlgorithmLearningCandidate = (input: {
 channelId: string
 candidateId: string
 decision: AlgorithmLearningReviewDecision
 note?: string | null
}) => {
 const row = listAlgorithmLearningCandidatesForReview(input.channelId)
  .find(({ candidate }) => candidate.id === input.candidateId)
 if (!row) throw new Error(`Unknown Algorithm learning candidate: ${input.candidateId}`)

 const reviewedAt = Date.now()
 const review: AlgorithmLearningReview = {
  candidateId: input.candidateId,
  decision: input.decision,
  note: input.note || null,
  reviewedAt,
  eventId: `algorithm-learning-review:${input.candidateId}:${reviewedAt}`,
 }
 const event = recordAlgorithmIntelligenceEvent({
  id: review.eventId,
  channelId: input.channelId,
  kind: "LEARNING_CANDIDATE_REVIEWED",
  sourceSystem: "learning",
  sourceId: input.candidateId,
  parentEventIds: [row.sourceEvent.id],
  evidenceIds: row.candidate.evidenceIds,
  confidence: row.candidate.confidence,
  title: `Learning candidate ${input.decision.replaceAll("_", " ")}`,
  summary: input.note || row.candidate.statement,
  metadata: {
   review,
   candidate: row.candidate,
   durableProfileMutation: false,
  },
 })
 return { review, event, candidate: row.candidate }
}

export const listApprovedAlgorithmLearningCandidates = (channelId: string) =>
 listAlgorithmLearningCandidatesForReview(channelId)
  .filter((row) => row.review?.decision === "approve_for_profile_review")

export const summarizeAlgorithmLearningGovernance = (channelId: string) => {
 const rows = listAlgorithmLearningCandidatesForReview(channelId)
 const count = (decision: AlgorithmLearningReviewDecision) =>
  rows.filter((row) => row.review?.decision === decision).length
 return {
  totalCandidates: rows.length,
  unreviewed: rows.filter((row) => !row.review).length,
  held: count("hold"),
  rejected: count("reject"),
  approvedForProfileReview: count("approve_for_profile_review"),
 }
}
