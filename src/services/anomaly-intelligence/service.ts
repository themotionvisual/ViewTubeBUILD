import type { VtSyncSnapshot } from "../../features/vt-sync-local/adapters/contracts"
import {
 getCanonicalIntelligenceDatasetRows,
} from "../analytics-canon"
import { captureAIBrainLearningEvent } from "../aiBrainSelfImprovement"
import type { ViewTubeAnomaly } from "./contracts"
import {
 detectRobustMagnitudeAnomaly,
 groupRowsIntoDailySeries,
} from "./detector"

const DATASET_SCANS = [
 { datasetId: "daily", family: "video", dateKey: "date", metricKey: "views" },
 { datasetId: "traffic_day", family: "traffic", dateKey: "date", metricKey: "views", entityKey: "term" },
] as const

export const scanCanonicalSnapshotForAnomalies = (
 snapshot: VtSyncSnapshot,
): ViewTubeAnomaly[] => {
 const anomalies: ViewTubeAnomaly[] = []

 DATASET_SCANS.forEach((scan) => {
  const dataset = getCanonicalIntelligenceDatasetRows(snapshot, scan.datasetId)
  if (!dataset || dataset.status === "failed" || dataset.status === "unavailable") return

  const series = groupRowsIntoDailySeries({
   dataset,
   dateKey: scan.dateKey,
   metricKey: scan.metricKey,
   entityKey: "entityKey" in scan ? scan.entityKey : undefined,
  })

  series.forEach((entry) => {
   const anomaly = detectRobustMagnitudeAnomaly({
    channelId: dataset.channelId,
    datasetId: dataset.datasetId,
    family: scan.family,
    metric: scan.metricKey,
    entity: entry.entity,
    observations: entry.observations,
    evidence: dataset,
   })
   if (anomaly) anomalies.push(anomaly)
  })
 })

 return anomalies.sort((left, right) => right.impactScore - left.impactScore)
}

export const captureAnomalyAsBrainLearning = async (
 anomaly: ViewTubeAnomaly,
) => captureAIBrainLearningEvent({
 channelId: anomaly.channelId,
 source: "vt_sync",
 category: "analytics_insight",
 confidence: anomaly.confidence >= 85 ? "high" : anomaly.confidence >= 65 ? "medium" : "low",
 summary: `Anomaly detected: ${anomaly.entity || anomaly.datasetId} ${anomaly.metric}`,
 detail: `${anomaly.kind} detected in ${anomaly.datasetId}; current=${anomaly.currentValue}; baseline=${anomaly.baselineValue}; impact=${anomaly.impactScore}.`,
 evidence: anomaly.evidence.map((entry) => entry.id),
 metadata: {
  anomalyId: anomaly.id,
  datasetId: anomaly.datasetId,
  anomalyKind: anomaly.kind,
  impactScore: anomaly.impactScore,
  surpriseScore: anomaly.surpriseScore,
 },
})
