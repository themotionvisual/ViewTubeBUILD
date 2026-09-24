import {
 getCurrentCanonicalIntelligenceEvidence,
 type CanonicalIntelligenceEvidenceBundle,
} from "../analytics-canon"
import {
 buildBrainEvidenceQuality,
 type BrainEvidenceQualityReport,
} from "./BrainEvidenceQuality"
import {
 buildStatisticsIntelligence,
 type StatisticsIntelligenceSnapshot,
} from "./StatisticsIntelligence"

export interface BrainEvidenceIntelligenceSnapshot {
 canonicalEvidence: CanonicalIntelligenceEvidenceBundle
 evidenceQuality: BrainEvidenceQualityReport
 statisticsIntelligence: StatisticsIntelligenceSnapshot
}

/**
 * Builds one canonical evidence snapshot for a Brain turn, then derives all
 * deterministic evidence-quality/statistics projections from that same source.
 */
export const buildBrainEvidenceIntelligence = (input: {
 expectedChannelId?: string | null
 includeAudienceRows?: boolean
} = {}): BrainEvidenceIntelligenceSnapshot => {
 const canonicalEvidence = getCurrentCanonicalIntelligenceEvidence({
  maximumRowsPerDataset: input.includeAudienceRows ? 5 : 0,
  maximumCharacters: input.includeAudienceRows ? 16_000 : 12_000,
 })
 return {
  canonicalEvidence,
  evidenceQuality: buildBrainEvidenceQuality(canonicalEvidence, {
   expectedChannelId: input.expectedChannelId,
  }),
  statisticsIntelligence: buildStatisticsIntelligence(canonicalEvidence),
 }
}

/**
 * Compatibility wrapper for existing consumers that only need statistics.
 */
export const buildBrainStatisticsIntelligence = (): StatisticsIntelligenceSnapshot =>
 buildBrainEvidenceIntelligence().statisticsIntelligence
