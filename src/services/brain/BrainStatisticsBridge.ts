import { getCurrentCanonicalIntelligenceEvidence } from "../analytics-canon"
import { buildStatisticsIntelligence, type StatisticsIntelligenceSnapshot } from "./StatisticsIntelligence"

/**
 * Canonical imperative bridge for BrainRuntime analytics evidence.
 *
 * analytics-canon owns current evidence access and normalized evidence shape;
 * Statistics Intelligence only derives deterministic summaries.
 */
export const buildBrainStatisticsIntelligence = (): StatisticsIntelligenceSnapshot => {
 const evidence = getCurrentCanonicalIntelligenceEvidence({
  maximumRowsPerDataset: 0,
  maximumCharacters: 12_000,
 })
 return buildStatisticsIntelligence(evidence)
}
