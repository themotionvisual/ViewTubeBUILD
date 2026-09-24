import {
 getCurrentCanonicalIntelligenceEvidence,
 type CanonicalIntelligenceEvidenceBundle,
} from "../analytics-canon"
import { buildStatisticsIntelligence } from "./StatisticsIntelligence"
import {
 buildAudienceIntelligence,
 type AudienceIntelligenceSnapshot,
} from "./AudienceIntelligence"

export const buildBrainAudienceIntelligence = (
 canonicalEvidence?: CanonicalIntelligenceEvidenceBundle,
): AudienceIntelligenceSnapshot => {
 const evidence = canonicalEvidence || getCurrentCanonicalIntelligenceEvidence({
  sectionIds: ["channel-pulse", "comparative-analysis", "keyword-matrix"],
  maximumRowsPerDataset: 5,
  maximumCharacters: 16_000,
 })
 return buildAudienceIntelligence(evidence, buildStatisticsIntelligence(evidence))
}
