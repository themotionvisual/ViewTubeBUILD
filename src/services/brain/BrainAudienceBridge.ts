import { buildCanonicalIntelligenceEvidence } from "../analytics-canon"
import { getVtSyncSnapshot } from "../../features/vt-sync-local"
import { buildStatisticsIntelligence } from "./StatisticsIntelligence"
import { buildAudienceIntelligence, type AudienceIntelligenceSnapshot } from "./AudienceIntelligence"
export const buildBrainAudienceIntelligence=():AudienceIntelligenceSnapshot=>{const snapshot=getVtSyncSnapshot();const evidence=buildCanonicalIntelligenceEvidence(snapshot,{sectionIds:["channel-pulse","comparative-analysis","keyword-matrix"],window:snapshot.selectedTimeWindow||"28d",maximumRowsPerDataset:5,maximumCharacters:16_000});return buildAudienceIntelligence(evidence,buildStatisticsIntelligence(evidence))}
