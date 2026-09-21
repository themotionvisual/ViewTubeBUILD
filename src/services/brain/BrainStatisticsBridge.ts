import { buildCanonicalIntelligenceEvidence } from "../analytics-canon"
import { getVtSyncSnapshot } from "../../features/vt-sync-local"
import { buildStatisticsIntelligence, type StatisticsIntelligenceSnapshot } from "./StatisticsIntelligence"

/**
 * Canonical imperative bridge for BrainRuntime analytics evidence.
 *
 * The snapshot read is isolated here so reasoning/orchestration code does not
 * grow another analytics access path. analytics-canon still owns normalized
 * evidence; Statistics Intelligence only derives deterministic summaries.
 */
export const buildBrainStatisticsIntelligence = (): StatisticsIntelligenceSnapshot => {
 const snapshot = getVtSyncSnapshot()
 const evidence = buildCanonicalIntelligenceEvidence(snapshot, {
  window: snapshot.selectedTimeWindow || "28d",
  maximumRowsPerDataset: 0,
  maximumCharacters: 12_000,
 })
 return buildStatisticsIntelligence(evidence)
}
