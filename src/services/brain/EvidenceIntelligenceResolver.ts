import type { AIBrainEvidencePack } from "../../types"
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
import {
 buildAudienceIntelligence,
 type AudienceIntelligenceSnapshot,
} from "./AudienceIntelligence"
import {
 buildOpportunityEvidenceFromBrainPack,
} from "./OpportunityEvidenceAdapter"
import type { OpportunityEvidence } from "./OpportunityIntelligence"

export const EVIDENCE_INTELLIGENCE_VERSION = "vt-evidence-intelligence-v1" as const

export interface ResolveEvidenceIntelligenceInput {
 channelId?: string | null
 includeAudience?: boolean
 includeOpportunities?: boolean
 brainEvidencePack?: AIBrainEvidencePack | null
}

export interface EvidenceIntelligenceEnvelope {
 version: typeof EVIDENCE_INTELLIGENCE_VERSION
 channelId: string | null
 canonicalEvidence: CanonicalIntelligenceEvidenceBundle
 evidenceQuality: BrainEvidenceQualityReport
 scopeUsable: boolean
 statisticsIntelligence: StatisticsIntelligenceSnapshot | null
 audienceIntelligence: AudienceIntelligenceSnapshot | null
 opportunityEvidence: OpportunityEvidence[]
 provenance: {
  analyticsOwner: "analytics-canon"
  sourceSnapshotId: string
  opportunitySource: "brain-evidence-pack" | null
 }
}

export interface EvidenceIntelligenceResolverDependencies {
 getCanonicalEvidence: (input: {
  maximumRowsPerDataset?: number
  maximumCharacters?: number
 }) => CanonicalIntelligenceEvidenceBundle
 buildQuality: (
  bundle: CanonicalIntelligenceEvidenceBundle,
  options?: { expectedChannelId?: string | null },
 ) => BrainEvidenceQualityReport
 buildStatistics: (
  bundle: CanonicalIntelligenceEvidenceBundle,
 ) => StatisticsIntelligenceSnapshot
 buildAudience: (
  evidence: CanonicalIntelligenceEvidenceBundle,
  statistics: StatisticsIntelligenceSnapshot,
 ) => AudienceIntelligenceSnapshot
 buildOpportunities: (input: {
  channelId: string
  evidencePack: AIBrainEvidencePack
  limit?: number
 }) => OpportunityEvidence[]
}

const DEFAULT_DEPENDENCIES: EvidenceIntelligenceResolverDependencies = {
 getCanonicalEvidence: getCurrentCanonicalIntelligenceEvidence,
 buildQuality: buildBrainEvidenceQuality,
 buildStatistics: buildStatisticsIntelligence,
 buildAudience: buildAudienceIntelligence,
 buildOpportunities: buildOpportunityEvidenceFromBrainPack,
}

/**
 * Read-only Brain runtime projection over canonical evidence owners.
 *
 * analytics-canon remains the analytics source of truth. This facade only
 * guarantees that evidence quality, statistics, audience reasoning and
 * opportunity derivation for a Brain turn are assembled coherently and with
 * one canonical analytics snapshot.
 */
export const resolveEvidenceIntelligence = (
 input: ResolveEvidenceIntelligenceInput,
 dependencies: EvidenceIntelligenceResolverDependencies = DEFAULT_DEPENDENCIES,
): EvidenceIntelligenceEnvelope => {
 const canonicalEvidence = dependencies.getCanonicalEvidence({
  maximumRowsPerDataset: input.includeAudience ? 5 : 0,
  maximumCharacters: input.includeAudience ? 16_000 : 12_000,
 })
 const evidenceQuality = dependencies.buildQuality(canonicalEvidence, {
  expectedChannelId: input.channelId,
 })
 const scopeUsable = evidenceQuality.scopeMatch !== "mismatch"
 const statisticsIntelligence = scopeUsable
  ? dependencies.buildStatistics(canonicalEvidence)
  : null
 const audienceIntelligence = scopeUsable && input.includeAudience && statisticsIntelligence
  ? dependencies.buildAudience(canonicalEvidence, statisticsIntelligence)
  : null
 const channelId = String(input.channelId || "").trim() || null
 const opportunityEvidence = input.includeOpportunities && channelId && input.brainEvidencePack
  ? dependencies.buildOpportunities({
    channelId,
    evidencePack: input.brainEvidencePack,
  })
  : []

 return {
  version: EVIDENCE_INTELLIGENCE_VERSION,
  channelId,
  canonicalEvidence,
  evidenceQuality,
  scopeUsable,
  statisticsIntelligence,
  audienceIntelligence,
  opportunityEvidence,
  provenance: {
   analyticsOwner: "analytics-canon",
   sourceSnapshotId: canonicalEvidence.snapshotId,
   opportunitySource: opportunityEvidence.length ? "brain-evidence-pack" : null,
  },
 }
}
