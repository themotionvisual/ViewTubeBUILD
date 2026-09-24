import { getCurrentCanonicalIntelligenceEvidence } from "../analytics-canon"
import { buildStatisticsIntelligence } from "./StatisticsIntelligence"
import {
 buildAudienceIntelligence,
 type AudienceIntelligenceSnapshot,
} from "./AudienceIntelligence"

export const buildBrainAudienceIntelligence = (): AudienceIntelligenceSnapshot => {
 const evidence = getCurrentCanonicalIntelligenceEvidence({
  sectionIds: ["channel-pulse", "comparative-analysis", "keyword-matrix"],
  maximumRowsPerDataset: 5,
  maximumCharacters: 16_000,
 })
 return buildAudienceIntelligence(evidence, buildStatisticsIntelligence(evidence))
}
